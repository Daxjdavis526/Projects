// Variable acceleration: v = ∫a dt and x = ∫v dt, with rocket thrust
// profiles as the running example.
import { lesson, num, expr, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3, co } from './_kinematics.js';

const t = String.raw;

// the explore rocket: 100 kg at lift-off, burning 4 kg/s at a constant thrust F (kN)
const AROCKET = '(1000*F/(m0 - mdot*min(t, tb)))*(1 + sgn(tb - t))/2 - g';
const VBURN = '(1000*F/mdot)*ln(m0/(m0 - mdot*tb)) - g*tb';

export default lesson({
  id: 'phys2210.M3.6',
  title: 'Variable acceleration with calculus',
  minutes: 12, difficulty: 3,
  intro: t`When the acceleration changes with time — a rocket getting lighter as it burns propellant, a car whose engine runs short of power — the constant-acceleration equations no longer apply. Calculus does, in both directions. Differentiate to go down the chain, $v = dx/dt$ and $a = dv/dt$; integrate to come back up:

$$v(t) = v_0 + \int_0^t a(t')\,dt', \qquad x(t) = x_0 + \int_0^t v(t')\,dt'$$

Each integral is the area under the graph above it — what you read off by eye in *Reading motion graphs*. The constant-acceleration equations are the special case where $a(t)$ is a constant.`,
  symbols: [
    { tex: 'a(t)', text: 'the acceleration as a function of time, in m/s²' },
    { tex: 'v(t),\\ x(t)', text: 'velocity (m/s) and position (m) as functions of time' },
    { tex: 'v_0,\\ x_0', text: 'velocity and position at $t = 0$ — the constants of integration, fixed by the starting conditions' },
    { tex: "t'", text: 'a dummy variable: the time inside the integral, running from 0 up to $t$' },
    { tex: "\\int_0^t a(t')\\,dt'", text: 'the change in velocity between 0 and $t$: the signed area under the $a$–$t$ graph, in m/s' },
  ],
  why: 'Thrust that changes as propellant burns, drag that grows with speed, engines that throttle: real accelerations vary, and integration is the tool that handles them.',
  visual: {
    type: 'mech-graphlink',
    title: 'A rocket burn, integrated',
    lead: t`A 100 kg rocket burns 4.0 kg of propellant per second at a constant thrust $F$, flying straight up. During the burn $a(t) = F/m(t) - g$, which **grows** as the rocket gets lighter; after burnout, $a = -g$. The velocity and altitude graphs are the running integrals of the one above them.`,
    tasks: [
      'Turn on Areas and slide to burnout: the shaded area under a–t is the burnout speed, because the rocket started from rest.',
      'Raise the thrust: the a–t curve climbs during the burn — no constant-acceleration equation can describe it.',
      'After burnout a = −g: the v–t graph becomes a straight line, exactly as in free fall.',
    ],
    params: {
      a: AROCKET, breaks: ['tb'], T: `tb + 2*(${VBURN})/g`,
      track: 'vertical', pos: 'h', ground: true,
      constants: { m0: 100, mdot: 4, g: G },
      sliders: [
        { key: 'F', label: 'Thrust $F$', min: 1.5, max: 4, step: 0.1, value: 2.5, unit: '\\mathrm{kN}', explain: 'Constant during the burn; it must exceed the weight, 0.98 kN, to lift off.' },
        { key: 'tb', label: 'Burn time $t_b$', min: 4, max: 12, step: 0.5, value: 10, unit: '\\mathrm{s}', explain: 'Propellant burned: 4.0 kg/s times $t_b$.' },
      ],
      marks: [{ t: 'tb', label: 'burnout' }],
      labels: { x: 'altitude h (m)', v: 'v (m/s), up positive', a: 'a (m/s²), up positive' },
      readouts: ['t', 'x', 'v', 'a'],
    },
    caption: 'No air drag and a uniform g; the rocket flies straight up, and the record stops when it falls back to its burnout altitude. The graphs are integrated numerically from a(t), splitting the integral at burnout where a jumps.',
  },
  example: {
    prompt: t`A rocket sled starts from rest. During its 4.0 s burn, its acceleration rises as $a(t) = 12 + 3t$ (in m/s², with $t$ in s). Find its speed and the distance it has covered at burnout.`,
    visual: {
      type: 'mech-graphlink',
      params: { a: '12 + 3*t', T: 4, area: true, time: 4, readouts: ['t', 'x', 'v', 'a'] },
      caption: 'The shaded area under a–t is the speed gained; the area under v–t is the distance.',
    },
    steps: [
      { label: 'Integrate a', text: t`$v(t) = 0 + \displaystyle\int_0^t (12 + 3t')\,dt' = 12t + 1.5t^2$.` },
      { label: 'Evaluate', text: t`$v(4.0) = 48 + 24 = 72$ m/s.` },
      { label: 'Integrate v', text: t`$x(t) = \displaystyle\int_0^t (12t' + 1.5t'^2)\,dt' = 6t^2 + 0.5t^3$, so $x(4.0) = 96 + 32 = 128$ m.` },
      { label: 'Check', text: t`Differentiate back: $\dfrac{d}{dt}(6t^2 + 0.5t^3) = 12t + 1.5t^2 = v$ ✓, and $\dfrac{dv}{dt} = 12 + 3t = a$ ✓.` },
      { label: 'Why not the shortcut?', text: t`The average acceleration is 18 m/s². It gives the right speed, $18 \times 4.0 = 72$ m/s (because $a$ is linear), but the wrong distance: $\tfrac12(18)(4.0)^2 = 144$ m. The sled pulls less hard at first, so it covers less ground early on.` },
    ],
    answer: t`$v = 72$ m/s and $x = 128$ m at burnout.`,
  },
  practice: [
    expr({
      id: 'v-from-a', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 4, 6, 8, 10]);
        return {
          prompt: t`A cart starts from rest, and its acceleration is $a(t) = ${k}t$ (in m/s², with $t$ in s). Find its velocity $v(t)$.`,
          answer: `${k / 2}*t^2`, answerTeX: t`${co(k / 2)}t^2`, lhs: 'v(t)',
          vars: { t: [0.5, 4] },
          errors: [
            { answer: `${k}*t^2`, feedback: t`Check the coefficient: $\int t\,dt = \tfrac12 t^2$.` },
            { answer: `${k / 6}*t^3`, feedback: 'You integrated twice — that is the position, not the velocity.' },
            { answer: `${k}`, feedback: 'You differentiated. To go from acceleration to velocity, integrate.' },
          ],
          hints: [t`$v(t) = v_0 + \int_0^t a\,dt'$ with $v_0 = 0$.`],
          teach: 'Velocity is the integral of acceleration, plus the starting velocity.',
          explain: t`$v(t) = \int_0^t ${k}t'\,dt' = ${co(k / 2)}t^2$ m/s. Check: $\dfrac{d}{dt}(${co(k / 2)}t^2) = ${k}t$ ✓.`,
          visual: {
            type: 'graph',
            params: { x: [0, 4.4], y: [0, k * 4.6], xlabel: 't (s)', ylabel: 'a (m/s²)', curves: [{ fn: `${k}*x`, domain: [0, 4], color: 'warn' }], shade: [{ fn: `${k}*x`, from: 0, to: 3, color: 'warn' }] },
            caption: 'The acceleration a(t). The shaded area, up to t = 3 s, is the velocity at that moment.',
          },
        };
      },
    }),
    expr({
      id: 'x-from-v', difficulty: 2,
      gen(r) {
        const v0 = r.pick([2, 3, 4, 5]), b3 = r.pick([0.1, 0.2, 0.3, 0.4, 0.5]), b = Math.round(3 * b3 * 10) / 10;
        return {
          prompt: t`A drone climbs with vertical velocity $v(t) = ${v0} + ${nice(b)}t^2$ (in m/s, with $t$ in s), starting at $y = 0$. Find its height $y(t)$.`,
          answer: `${v0}*t + ${b3}*t^3`, answerTeX: t`${v0}t + ${b3}t^3`, lhs: 'y(t)',
          vars: { t: [0.5, 4] },
          errors: [
            { answer: `${v0}*t + ${b}*t^3`, feedback: t`Check the coefficient: $\int t^2\,dt = \tfrac13 t^3$.` },
            { answer: `${nice(2 * b)}*t`, feedback: 'That is the derivative — the acceleration. Integrate to get the position.' },
            { answer: `${b3}*t^3`, feedback: t`You dropped the integral of the constant: $\int ${v0}\,dt = ${v0}t$.` },
          ],
          hints: [t`$y(t) = y_0 + \int_0^t v\,dt'$, with $y_0 = 0$.`, t`Integrate term by term: $\int ${v0}\,dt = ${v0}t$ and $\int t^2\,dt = \tfrac13 t^3$.`],
          teach: 'Position is the integral of velocity, plus the starting position.',
          explain: t`$y(t) = \int_0^t (${v0} + ${nice(b)}t'^2)\,dt' = ${v0}t + ${b3}t^3$ m.`,
          visual: {
            type: 'graph',
            params: { x: [0, 4.4], y: [0, (v0 + b * 16) * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${v0} + ${b}*x^2`, domain: [0, 4], color: 'good' }], shade: [{ fn: `${v0} + ${b}*x^2`, from: 0, to: 3, color: 'good' }] },
            caption: 'The vertical velocity v(t). The shaded area, up to t = 3 s, is the height at that moment.',
          },
        };
      },
    }),
    expr({
      id: 'a-from-x', difficulty: 2,
      gen(r) {
        const p = r.pick([0.5, 1, 2]), q = r.pick([2, 3, 4]), c = r.pick([1, 5, 10]);
        return {
          prompt: t`A piston’s position is $x(t) = ${co(p)}t^3 - ${q}t^2 + ${c}$ (in m, with $t$ in s). Find its acceleration $a(t)$.`,
          answer: `${6 * p}*t - ${2 * q}`, answerTeX: t`${nice(6 * p)}t - ${2 * q}`, lhs: 'a(t)',
          vars: { t: [0.5, 3] },
          errors: [
            { answer: `${3 * p}*t^2 - ${2 * q}*t`, feedback: 'That is the velocity — differentiate once more.' },
            { answer: `${6 * p}*t`, feedback: t`The $-${q}t^2$ term differentiates twice to $-${2 * q}$, not to zero.` },
          ],
          hints: ['Acceleration is the second derivative of position.', t`$v = ${nice(3 * p)}t^2 - ${2 * q}t$; differentiate again.`],
          teach: 'Differentiate position once for velocity and again for acceleration; constants vanish on the way.',
          explain: t`$v = \dfrac{dx}{dt} = ${nice(3 * p)}t^2 - ${2 * q}t$ and $a = \dfrac{dv}{dt} = ${nice(6 * p)}t - ${2 * q}$ (m/s²). The ${c} m start position drops out.`,
          visual: {
            type: 'mech-graphlink',
            params: { x: `${p}*t^3 - ${q}*t^2 + ${c}`, T: 3, panels: ['x'], readouts: ['t', 'x'] },
            caption: 'The piston’s position; its slope is the velocity, and the bending of the curve is the acceleration.',
          },
        };
      },
    }),
    num({
      id: 'area-ct2', difficulty: 2,
      gen(r) {
        const c = r.pick([0.3, 0.6, 0.9, 1.2]), T = r.pick([4, 5, 6]);        // T = 3 would make T³/3 = T²
        const dv = (c * T ** 3) / 3;
        return {
          prompt: t`An object starts from rest with acceleration $a(t) = ${nice(c)}t^2$ (in m/s², with $t$ in s). How fast is it going at $t = ${T}$ s?`,
          answer: dv, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: c * T ** 3, feedback: t`Check the integral: $\int_0^T t^2\,dt = T^3/3$.` },
            { value: c * T * T, feedback: `That is the acceleration at t = ${T} s, not the velocity.` },
            { value: (c * T ** 3) / 2, feedback: 'You treated the area under the curve as a triangle. The curve is a parabola: integrate.' },
          ],
          hints: ['The speed gained is the area under the a–t graph.', t`$v = \int_0^{${T}} ${nice(c)}t^2\,dt = ${nice(c)}\,\dfrac{${T}^3}{3}$.`],
          teach: 'The change in velocity is the integral of a(t): the area under the a–t curve.',
          explain: t`$v = \displaystyle\int_0^{${T}} ${nice(c)}t^2\,dt = ${nice(c)} \times \dfrac{${T ** 3}}{3} = ${nice(dv)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, T * 1.1], y: [0, c * T * T * 1.15], xlabel: 't (s)', ylabel: 'a (m/s²)',
              curves: [{ fn: `${c}*x^2`, domain: [0, T], color: 'warn' }],
              shade: [{ fn: `${c}*x^2`, from: 0, to: T, color: 'warn' }],
            },
            caption: 'Acceleration against time; the shaded area is the speed gained.',
          },
        };
      },
    }),
    num({
      id: 'sled-distance', difficulty: 3,
      gen(r) {
        const A = r.pick([8, 10, 12]), B = r.pick([1.5, 2, 3]), T = r.pick([3, 4, 5]);
        const x = (A * T * T) / 2 + (B * T ** 3) / 6;
        return {
          prompt: t`A rocket sled starts from rest with acceleration $a(t) = ${A} + ${nice(B)}t$ (in m/s², with $t$ in s) for a ${T} s burn. How far does it travel during the burn?`,
          answer: x, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: ((A + (B * T) / 2) * T * T) / 2, feedback: t`You used the constant-acceleration formula with the average acceleration. That gives the right speed but too large a distance: integrate $v(t)$ instead.` },
            { value: ((A + B * T) * T * T) / 2, feedback: 'You treated the final acceleration as if it had acted for the whole burn. Integrate twice.' },
            { value: (A * T * T) / 2, feedback: t`That ignores the growing part of the acceleration, the ${nice(B)}t term.` },
          ],
          hints: [t`First $v(t) = \int_0^t a\,dt' = ${A}t + ${nice(B / 2)}t^2$.`, t`Then $x(t) = \int_0^t v\,dt' = ${nice(A / 2)}t^2 + ${nice(B / 6)}t^3$; put in $t = ${T}$ s.`],
          teach: 'With a varying acceleration, integrate twice — once for v(t), again for x(t).',
          explain: t`$v = ${A}t + ${nice(B / 2)}t^2$, so $x = ${nice(A / 2)}t^2 + ${nice(B / 6)}t^3 = ${nice((A * T * T) / 2)} + ${nice((B * T ** 3) / 6)} = ${s3(x)}$ m at $t = ${T}$ s.`,
          visual: {
            type: 'mech-graphlink',
            params: { a: `${A} + ${B}*t`, T, panels: ['v', 'a'], track: false, readouts: ['t', 'v', 'a'] },
            caption: 'The sled’s velocity and acceleration; the distance is the area under v–t.',
          },
        };
      },
    }),
    num({
      id: 'drag-decay', difficulty: 3,
      gen(r) {
        const v0 = r.pick([6, 8, 10]), k = r.pick([0.2, 0.25, 0.4, 0.5]), t1 = r.pick([2, 3, 4]);
        const v = v0 * Math.exp(-k * t1);
        return {
          prompt: t`A boat cuts its engine at ${v0} m/s. Water drag then gives it an acceleration $a = -kv$ with $k = ${nice(k)}\ \text{s}^{-1}$: the slower it goes, the gentler the braking. How fast is it moving ${t1} s later?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: v0 - k * v0 * t1, feedback: 'You kept the acceleration at its starting value, −kv₀. But a shrinks as v shrinks: solve dv/dt = −kv.' },
            { value: v0 * Math.exp(-t1 / k), feedback: t`Check the exponent: it is $-kt$, not $-t/k$.` },
          ].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: [t`Write $\dfrac{dv}{dt} = -kv$ and separate: $\dfrac{dv}{v} = -k\,dt$.`, t`Integrate both sides: $\ln\dfrac{v}{v_0} = -kt$, so $v = v_0 e^{-kt}$.`],
          teach: 'When the acceleration depends on the velocity, separate variables: a = −kv gives exponential decay, v = v₀e^(−kt).',
          explain: t`$\ln(v/v_0) = -kt$, so $v = ${v0}\,e^{-${nice(k)} \times ${t1}} = ${s3(v)}$ m/s. Holding the first second’s braking constant would predict $${nice(v0 - k * v0 * t1)}$ m/s — wrong, because the drag eases off.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, t1 * 1.5], y: [0, v0 * 1.12], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${v0}*exp(-${k}*x)`, color: 'good', label: 'v(t)', labelAt: t1 * 1.2 }, { fn: `${v0} - ${k * v0}*x`, domain: [0, Math.min(t1 * 1.5, 1 / k)], color: 'violet', dash: true }],
            },
            caption: 'The boat’s speed against time. Dashed: the straight line it would follow if the initial braking stayed constant.',
          },
        };
      },
    }),
    {
      type: 'slider', id: 'fastest', difficulty: 2, param: 'time',
      instruction: 'Drag the time slider to the right moment, then check.',
      gen(r) {
        const tb = r.pick([4, 5, 6, 8]), F = r.pick([2, 2.5, 3]);
        return {
          prompt: t`Only the acceleration graph of this rocket is shown (up positive). It starts from rest. Set the time slider to the instant when it is moving upward **fastest**.`,
          answer: [tb - 0.2, tb + 0.2],
          hints: ['While a > 0 the upward velocity grows; while a < 0 it shrinks.', 'Find where the acceleration changes from positive to negative.'],
          teach: 'Velocity is greatest where the acceleration changes sign from positive to negative.',
          explain: t`The velocity keeps growing as long as $a > 0$ — all through the burn — and starts to fall as soon as $a$ turns negative, at burnout, $t = ${tb}$ s. The highest acceleration (just before burnout) is a different thing from the highest velocity.`,
          visual: {
            type: 'mech-graphlink',
            params: { a: AROCKET, breaks: [tb], T: 2.5 * tb, constants: { m0: 100, mdot: 4, g: G, F, tb }, panels: ['a'], track: false, readouts: ['t'], play: false, labels: { a: 'a (m/s²), up positive' } },
            caption: 'Acceleration of a rocket during and after its burn; no air drag.',
          },
        };
      },
    },
    code({
      id: 'integrate-burn', difficulty: 3,
      prompt: t`The explore rocket: $m_0 = 100$ kg, $\dot m = 4.0$ kg/s, thrust $F = 2500$ N, so during the burn $a(t) = \dfrac{F}{m_0 - \dot m t} - g$. Complete \`burnout_speed(tb, n)\` so that it **returns** the speed at burnout, starting from rest, by adding up $a\,\Delta t$ over $n$ equal steps — using $a$ at the middle of each step.`,
      starter: t`F, m0, mdot, g = 2500.0, 100.0, 4.0, 9.8

def a(t):
    return F / (m0 - mdot * t) - g

def burnout_speed(tb, n):
    dt = tb / n
    v = 0.0
    # add a(t) * dt for every step, with t at the middle of the step
    return v

print(burnout_speed(10, 1000))
`,
      answer: t`F, m0, mdot, g = 2500.0, 100.0, 4.0, 9.8

def a(t):
    return F / (m0 - mdot * t) - g

def burnout_speed(tb, n):
    dt = tb / n
    v = 0.0
    for k in range(n):
        v += a((k + 0.5) * dt) * dt
    return v

print(burnout_speed(10, 1000))
`,
      tests: [
        { name: 'a 10 s burn gives 221.27 m/s, the exact value, to 0.01 m/s', code: 'abs(burnout_speed(10, 1000) - 221.2660149) < 0.01' },
        { name: 'more steps get closer to the exact value', code: 'abs(burnout_speed(10, 4000) - 221.2660149) <= abs(burnout_speed(10, 10) - 221.2660149)' },
        { name: 'a 5 s burn gives 90.46 m/s', code: 'abs(burnout_speed(5, 1000) - 90.4647196) < 0.01' },
      ],
      hints: [t`Loop over the steps with \`for k in range(n):\` — step $k$ has its middle at $(k + \tfrac12)\,\Delta t$.`, t`Inside the loop: \`v += a((k + 0.5) * dt) * dt\`.`],
      teach: 'Integrating a(t) on a computer is adding up thin slices a·Δt — a Riemann sum for v = ∫a dt.',
      explain: t`Each step adds the area of a thin slice under the $a$–$t$ curve. The exact integral is $v_b = \dfrac{F}{\dot m}\ln\dfrac{m_0}{m_0 - \dot m t_b} - g\,t_b = 625\ln\dfrac{100}{60} - 98 = 221.27$ m/s — the rocket equation (lesson M9.6) with a gravity loss. With 1000 midpoint steps the sum matches it to about $10^{-5}$ m/s; with only 10 steps it is off by 0.07 m/s.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-v', difficulty: 2,
      gen(r) {
        const v0 = r.pick([2, 3, 5]), A = r.pick([4, 6, 8]), B = r.pick([1, 2, 3]);
        return {
          prompt: t`A cart moving at ${v0} m/s at $t = 0$ has acceleration $a(t) = ${A} - ${co(B)}t$ (in m/s², with $t$ in s). Find $v(t)$.`,
          answer: `${v0} + ${A}*t - ${B / 2}*t^2`, answerTeX: t`${v0} + ${A}t - ${co(B / 2)}t^2`, lhs: 'v(t)',
          vars: { t: [0.5, 4] },
          errors: [
            { answer: `${A}*t - ${B / 2}*t^2`, feedback: t`Add the starting velocity: $v = v_0 + \int a\,dt$.` },
            { answer: `${v0} + ${A}*t - ${B}*t^2`, feedback: t`Check the coefficient: $\int t\,dt = \tfrac12 t^2$.` },
          ],
          hints: [t`$v(t) = v_0 + \int_0^t a\,dt'$.`],
          teach: 'v(t) is the starting velocity plus the integral of a(t).',
          explain: t`$v(t) = ${v0} + \int_0^t (${A} - ${co(B)}t')\,dt' = ${v0} + ${A}t - ${co(B / 2)}t^2$ m/s.`,
        };
      },
    }),
    num({
      id: 'cp-burn', difficulty: 3, transfer: true,
      gen(r) {
        const a0 = r.pick([12, 15, 18]), c = r.pick([0.3, 0.6, 0.9]), T = r.pick([8, 10, 12]);
        const v = a0 * T + (c * T ** 3) / 3;
        return {
          prompt: t`As a launch vehicle burns propellant it gets lighter, and its acceleration rises: model it as $a(t) = ${a0} + ${nice(c)}t^2$ (in m/s², with $t$ in s, gravity already included) for a ${T} s burn starting from rest. What is its speed at the end of the burn?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: (a0 + c * T * T) * T, feedback: 'You used the final acceleration for the whole burn. The acceleration grows during it: integrate.' },
            { value: a0 * T + c * T ** 3, feedback: t`Check the integral: $\int_0^T t^2\,dt = T^3/3$.` },
          ],
          hints: ['The speed is the area under a(t) from 0 to the end of the burn.', t`$v = \int_0^{${T}} (${a0} + ${nice(c)}t^2)\,dt$.`],
          teach: 'For a burn with a changing acceleration, the speed gained is the integral of a(t) over the burn.',
          explain: t`$v = ${a0}(${T}) + ${nice(c)}\,\dfrac{${T}^3}{3} = ${a0 * T} + ${nice((c * T ** 3) / 3)} = ${nice(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: { x: [0, T * 1.1], y: [0, (a0 + c * T * T) * 1.15], xlabel: 't (s)', ylabel: 'a (m/s²)', curves: [{ fn: `${a0} + ${c}*x^2`, domain: [0, T], color: 'warn' }], shade: [{ fn: `${a0} + ${c}*x^2`, from: 0, to: T, color: 'warn' }] },
            caption: 'The model acceleration during the burn; the shaded area is the speed gained.',
          },
        };
      },
    }),
    num({
      id: 'cp-abort', difficulty: 3, transfer: true,
      gen(r) {
        const a0 = r.pick([100, 120, 150]), tau = r.pick([1, 1.5, 2]), tb = r.pick([2, 3, 4]);
        const dv = a0 * tau * (1 - Math.exp(-tb / tau));
        return {
          prompt: t`An abort motor’s thrust tails off as it burns, so the capsule’s acceleration (relative to the falling booster) is $a(t) = ${a0}\,e^{-t/${nice(tau)}}$ (in m/s², with $t$ in s). The burn lasts ${tb} s. How much speed does the capsule gain relative to the booster?`,
          answer: dv, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: a0 * tb, feedback: 'You held the acceleration at its initial value for the whole burn. It decays: integrate the exponential.' },
            { value: a0 * tau, feedback: t`That is the integral out to $t = \infty$. The burn stops at ${tb} s.` },
          ],
          hints: [t`$\Delta v = \int_0^{${tb}} ${a0}\,e^{-t/${nice(tau)}}\,dt$.`, t`$\int e^{-t/\tau}\,dt = -\tau\,e^{-t/\tau}$, so $\Delta v = a_0\tau\,(1 - e^{-t_b/\tau})$.`],
          teach: 'The speed gained during a burn is the integral of the acceleration over the burn time, whatever shape a(t) has.',
          explain: t`$\Delta v = ${a0}(${nice(tau)})\left(1 - e^{-${tb}/${nice(tau)}}\right) = ${nice(a0 * tau)} \times ${s3(1 - Math.exp(-tb / tau))} = ${s3(dv)}$ m/s.`,
          visual: {
            type: 'graph',
            params: { x: [0, tb * 1.3], y: [0, a0 * 1.12], xlabel: 't (s)', ylabel: 'a (m/s²)', curves: [{ fn: `${a0}*exp(-x/${tau})`, color: 'warn' }], shade: [{ fn: `${a0}*exp(-x/${tau})`, from: 0, to: tb, color: 'warn' }], vlines: [{ x: tb, label: 'burn ends' }] },
            caption: 'The capsule’s acceleration relative to the booster; the shaded area is the speed gained during the burn.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §3.6', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-6-finding-velocity-and-displacement-from-acceleration' }],
});
