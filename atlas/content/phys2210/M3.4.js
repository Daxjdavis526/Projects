// The constant-acceleration equations: one straight v–t line and the area
// under it, and how to choose the equation that fits the question.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3 } from './_kinematics.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M3.4',
  title: 'Constant-acceleration equations',
  minutes: 11, difficulty: 2,
  intro: t`When the acceleration is constant, the velocity graph is a straight line, $v = v_0 + at$, and the area under it — the displacement — is a trapezoid. That one picture gives the **constant-acceleration equations**:

$$\begin{aligned} v &= v_0 + at & \qquad x &= x_0 + v_0 t + \tfrac12 a t^2 \\ v^2 &= v_0^2 + 2a\,(x - x_0) & \qquad x - x_0 &= \tfrac12\,(v_0 + v)\,t \end{aligned}$$

Each one links four of the five quantities $x - x_0$, $v_0$, $v$, $a$ and $t$: choose the equation that leaves out the one you neither know nor need. They hold **only while the acceleration is constant** — for a burning rocket or a car whose engine runs out of power, you need calculus instead.`,
  symbols: [
    { tex: 'x,\\ x_0', text: 'position at time $t$ and at $t = 0$, in m; $x - x_0$ is the displacement' },
    { tex: 'v_0', text: 'velocity at $t = 0$, in m/s' },
    { tex: 'v', text: 'velocity at time $t$, in m/s' },
    { tex: 'a', text: 'the acceleration, in m/s² — the same at every instant' },
    { tex: 't', text: 'time elapsed since $t = 0$, in s' },
    { tex: '\\tfrac12 a t^2', text: 'the extra displacement due to the acceleration: the triangle on top of the rectangle $v_0 t$ under the $v$–$t$ line' },
  ],
  why: 'These four equations answer most everyday motion questions — stopping distances, runway lengths, launch and abort timing — as long as you check that the acceleration really is constant.',
  visual: {
    type: 'graph',
    title: 'The area under a straight v–t line',
    lead: t`For constant acceleration the velocity graph is the straight line $v = v_0 + at$. The displacement up to time $t$ is the area under it, which splits into a **rectangle** $v_0 t$ (blue) and a **triangle** $\tfrac12 a t^2$ (amber). Together: $x - x_0 = v_0 t + \tfrac12 a t^2$.`,
    tasks: [
      'Set a = 0: the triangle disappears and the displacement is just v₀t.',
      'Double t: the rectangle doubles but the triangle quadruples — that is the t² in ½at².',
      'Make a negative: the triangle hangs below the v₀ line and is subtracted.',
    ],
    params: {
      x: [0, 8.4], y: [-13, 21], xlabel: 't (s)', ylabel: 'v (m/s)',
      sliders: [
        { key: 'v0', label: 'Initial velocity $v_0$', min: 0, max: 8, step: 0.5, value: 4, unit: '\\mathrm{m/s}', explain: 'The height of the line at $t = 0$.' },
        { key: 'acc', label: 'Acceleration $a$', min: -1.5, max: 1.5, step: 0.25, value: 1, unit: '\\mathrm{m/s^2}', explain: 'The slope of the line, constant throughout.' },
        { key: 'T', label: 'Time $t$', min: 0.5, max: 8, step: 0.25, value: 5, unit: '\\mathrm{s}', explain: 'How long the motion has run.' },
      ],
      curves: [{ fn: 'v0 + acc*x', color: 'good', label: 'v = v₀ + at', labelAt: 7 }],
      shade: [{ fn: 'v0', from: 0, to: 'T', color: 'accent', alpha: 0.25 }, { fn: 'v0 + acc*x', lower: 'v0', from: 0, to: 'T', color: 'warn', alpha: 0.35 }],
      vlines: [{ x: 'T' }],
      readouts: [
        { label: '$v = v_0 + at$', expr: 'v0 + acc*T', unit: '\\mathrm{m/s}', digits: 3 },
        { label: 'rectangle $v_0 t$', expr: 'v0*T', unit: '\\mathrm{m}', digits: 3 },
        { label: 'triangle $\\tfrac12 a t^2$', expr: '0.5*acc*T^2', unit: '\\mathrm{m}', digits: 3 },
        { label: 'displacement', expr: 'v0*T + 0.5*acc*T^2', unit: '\\mathrm{m}', digits: 3 },
      ],
    },
    caption: 'Constant acceleration only. The areas are signed: the amber triangle counts as negative when it lies below the v₀ line, and any area below the time axis is negative displacement.',
  },
  example: {
    prompt: t`A driver moving at 25 m/s sees a hazard. Her reaction time is 0.80 s; then she brakes with a constant deceleration of 6.0 m/s². How far does the car travel from the moment she sees the hazard until it stops?`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 5.6], y: [0, 29], xlabel: 't (s)', ylabel: 'v (m/s)',
        curves: [{ fn: 'min(25, 25 - 6*(x - 0.8))', domain: [0, 0.8 + 25 / 6], color: 'good' }],
        shade: [{ fn: '25', from: 0, to: 0.8, color: 'accent', alpha: 0.3 }, { fn: '25 - 6*(x - 0.8)', from: 0.8, to: 0.8 + 25 / 6, color: 'warn', alpha: 0.3 }],
        vlines: [{ x: 0.8, label: 'brakes on' }],
      },
      caption: 'Velocity against time: constant speed while she reacts (blue area), then constant deceleration (amber area).',
    },
    steps: [
      { label: 'Reaction', text: t`For 0.80 s nothing changes: $a = 0$, so $d_1 = v_0 t_r = (25)(0.80) = 20$ m.` },
      { label: 'Choose the equation', text: t`While braking we know $v_0 = 25$ m/s, $v = 0$ and $a = -6.0\ \text{m/s}^2$, and we want the displacement. We do not need the time, so use $v^2 = v_0^2 + 2a\,\Delta x$.` },
      { label: 'Solve', text: t`$\Delta x = \dfrac{v^2 - v_0^2}{2a} = \dfrac{0 - 625}{2(-6.0)} = 52.1$ m.` },
      { label: 'Add', text: t`Total: $20 + 52.1 = 72.1$ m — the two shaded areas.` },
      { label: 'Sense check', text: t`Braking lasts $25/6.0 = 4.17$ s at an average speed of 12.5 m/s: $12.5 \times 4.17 = 52.1$ m, the same answer from $\tfrac12(v_0 + v)t$. And because $\Delta x \propto v_0^2$, twice the speed means four times the braking distance.` },
    ],
    answer: t`About 72 m: 20 m while reacting and 52 m while braking.`,
  },
  practice: [
    mcq({
      id: 'pick-equation', difficulty: 1,
      prompt: 'A car speeds up steadily from 10 m/s to 30 m/s over a distance of 100 m. Which equation gives its acceleration most directly?',
      choices: [t`$v^2 = v_0^2 + 2a\,\Delta x$`, t`$v = v_0 + at$`, t`$\Delta x = v_0 t + \tfrac12 a t^2$`, t`$\Delta x = \tfrac12(v_0 + v)\,t$`],
      answer: 0,
      why: {
        1: 'That needs the time, which you are not given. You would have to find t first.',
        2: 'That also needs the time. Pick the equation without t.',
        3: 'That one has no a in it at all — it could give you the time, but not the acceleration directly.',
      },
      hints: ['List what you know (v₀, v, Δx) and what you want (a).', 'Which equation contains exactly those four, and not t?'],
      teach: 'Choose the constant-acceleration equation that leaves out the quantity you neither know nor want.',
      explain: t`Only $v^2 = v_0^2 + 2a\,\Delta x$ links $v_0$, $v$, $\Delta x$ and $a$ without $t$: $a = (900 - 100)/(2 \times 100) = 4.0\ \text{m/s}^2$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.4, 6.4], y: [-4, 34], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { fn: '10 + 4*x', domain: [0, 5], color: 'good' },
            { fn: '0', domain: [0, 6], color: 'ink3', width: 1.2 },
            { param: ['0', 't'], t: [0, 33], color: 'ink3', width: 1.2 },
          ],
          shade: [{ fn: '10 + 4*x', from: 0, to: 5, color: 'warn', alpha: 0.22 }],
          points: [
            { x: 0, y: 10, color: 'gold' }, { x: 5, y: 30, color: 'gold', label: '30 m/s' },
            { x: 0.05, y: 5.5, r: 0.1, color: 'gold', label: '10 m/s' }, { x: 1.4, y: 13, r: 0.1, color: 'ink', label: 'area = 100 m' },
            { x: 4.55, y: -2.6, r: 0.1, color: 'ink2', label: 't = ?' }, { x: 6, y: -1.6, r: 0.1, color: 'ink2', label: 't' }, { x: 0.1, y: 32.5, r: 0.1, color: 'ink2', label: 'v' },
          ],
        },
        caption: 'Velocity against time: the area under the line is the 100 m covered. How long it takes is not given.',
      },
    }),
    num({
      id: 'v-after-t', difficulty: 1,
      gen(r) {
        const v0 = r.pick([8, 10, 12, 15]), a = r.pick([0.4, 0.5, 0.6, 0.8]), tt = r.pick([10, 15, 20, 25]);
        const v = v0 + a * tt;
        return {
          prompt: t`A train moving at ${v0} m/s accelerates at a constant ${nice(a)} m/s² for ${tt} s. How fast is it then going?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: a * tt, feedback: 'That is only the change in velocity. Add it to the starting velocity.' }],
          hints: [t`$v = v_0 + at$.`],
          teach: 'With constant acceleration the velocity changes by a·t: v = v₀ + at.',
          explain: t`$v = ${v0} + (${nice(a)})(${tt}) = ${v0} + ${nice(a * tt)} = ${nice(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, tt * 1.12], y: [0, v * 1.2], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${v0} + ${a}*x`, domain: [0, tt], color: 'good' }],
              points: [{ x: 0, y: v0, color: 'gold' }],
            },
            caption: 'Velocity against time: a straight line of slope a, starting at v₀.',
          },
        };
      },
    }),
    num({
      id: 'distance-in-t', difficulty: 2,
      gen(r) {
        const v0 = r.pick([10, 15, 20, 25]), a = r.pick([2, 2.5, 3, 4]), tt = r.pick([6, 8, 10, 12]);
        const d = v0 * tt + 0.5 * a * tt * tt;
        return {
          prompt: t`A jet already rolling down the runway at ${v0} m/s accelerates at a constant ${nice(a)} m/s² for ${tt} s. How far does it travel in that time?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: v0 * tt + a * tt * tt, feedback: t`You dropped the $\tfrac12$: the extra displacement is the triangle $\tfrac12 a t^2$, not a rectangle.` },
            { value: 0.5 * a * tt * tt, feedback: t`That leaves out $v_0 t$ — the jet was already moving at ${v0} m/s.` },
            { value: (v0 + a * tt) * tt, feedback: 'You multiplied the final velocity by the time, as if it had gone that fast throughout.' },
          ],
          hints: [t`Use $\Delta x = v_0 t + \tfrac12 a t^2$.`, 'In the picture: the rectangle under v₀ plus the triangle above it.'],
          teach: 'Displacement under constant acceleration is the area under the v–t line: v₀t plus ½at².',
          explain: t`$\Delta x = (${v0})(${tt}) + \tfrac12(${nice(a)})(${tt})^2 = ${v0 * tt} + ${nice(0.5 * a * tt * tt)} = ${nice(d)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, tt * 1.12], y: [0, (v0 + a * tt) * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${v0} + ${a}*x`, domain: [0, tt], color: 'good' }],
              shade: [{ fn: String(v0), from: 0, to: tt, color: 'accent', alpha: 0.25 }, { fn: `${v0} + ${a}*x`, lower: String(v0), from: 0, to: tt, color: 'warn', alpha: 0.35 }],
            },
            caption: 'Velocity against time. The displacement is the shaded area: rectangle plus triangle.',
          },
        };
      },
    }),
    num({
      id: 'find-a', difficulty: 2,
      gen(r) {
        const [v0, v] = r.pick([[30, 10], [25, 5], [30, 20], [20, 10], [28, 12]]), d = r.pick([50, 60, 80, 100]);
        const a = (v * v - v0 * v0) / (2 * d);
        return {
          prompt: t`A car slows steadily from ${v0} m/s to ${v} m/s over ${d} m of straight road. What is its acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: ((v - v0) * (v - v0)) / (2 * d) * Math.sign(v - v0), feedback: t`You squared the change in velocity. The equation has the difference of the squares: $v^2 - v_0^2$, not $(v - v_0)^2$.` },
            { value: (v - v0) / d, feedback: 'Dividing a change in velocity by a distance does not give an acceleration (check the units). Use v² = v₀² + 2aΔx.' },
          ],
          hints: [t`No time is given, so use $v^2 = v_0^2 + 2a\,\Delta x$.`, t`$a = \dfrac{v^2 - v_0^2}{2\,\Delta x}$; expect a negative answer.`],
          teach: 'Without the time, v² = v₀² + 2aΔx connects the speeds, the distance and the acceleration.',
          explain: t`$a = \dfrac{${v}^2 - ${v0}^2}{2(${d})} = \dfrac{${v * v - v0 * v0}}{${2 * d}} = ${nice(a)}\ \text{m/s}^2$. Negative: it points against the motion, so the car slows.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, d * 1.12], y: [0, v0 * 1.15], xlabel: 'x (m)', ylabel: 'v (m/s)',
              curves: [{ fn: `sqrt(${v0 * v0} - ${-2 * a}*x)`, domain: [0, d], color: 'good' }],
              points: [{ x: 0, y: v0, color: 'gold', label: `${v0} m/s` }, { x: d, y: v, color: 'gold', label: `${v} m/s` }],
            },
            caption: 'Speed against position — not time — as the car slows steadily: v² falls in proportion to the distance covered.',
          },
        };
      },
    }),
    num({
      id: 'stopping', difficulty: 2,
      gen(r) {
        const v0 = r.pick([15, 20, 25, 30]), tr = r.pick([0.6, 0.8, 1.0, 1.2]), b = r.pick([5, 6, 7, 8]);
        const d1 = v0 * tr, d2 = (v0 * v0) / (2 * b), d = d1 + d2;
        return {
          prompt: t`A driver at ${v0} m/s has a reaction time of ${nice(tr)} s and then brakes at a constant ${b} m/s². What is the total stopping distance, from the moment she sees the hazard?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: d2, feedback: 'That is only the braking distance. The car keeps going at full speed during the reaction time.' },
            { value: d1 + (v0 * v0) / b, feedback: t`Check the braking distance: $v_0^2/(2a)$ — you seem to have dropped the 2.` },
          ],
          hints: ['Split the motion: constant speed during the reaction, then constant deceleration.', t`Reaction: $v_0 t_r$. Braking: $v_0^2/(2a)$ from $v^2 = v_0^2 + 2a\,\Delta x$ with $v = 0$.`],
          teach: 'Stopping distance is the reaction distance at constant speed plus the braking distance v₀²/2a.',
          explain: t`Reaction: $(${v0})(${nice(tr)}) = ${nice(d1)}$ m. Braking: $\dfrac{${v0}^2}{2(${b})} = ${s3(d2)}$ m. Total $${s3(d)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, (tr + v0 / b) * 1.12], y: [0, v0 * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `min(${v0}, ${v0} - ${b}*(x - ${tr}))`, domain: [0, tr + v0 / b], color: 'good' }],
              shade: [{ fn: `min(${v0}, ${v0} - ${b}*(x - ${tr}))`, from: 0, to: tr + v0 / b, color: 'warn', alpha: 0.25 }],
              vlines: [{ x: tr, label: 'brakes on' }],
            },
            caption: 'Velocity against time. The stopping distance is the whole shaded area.',
          },
        };
      },
    }),
    mcq({
      id: 'validity', difficulty: 2,
      prompt: 'A car’s acceleration falls steadily as it speeds up, because its engine’s power is limited. Can you find how far it goes in 10 s from x = x₀ + v₀t + ½at², using its average acceleration for a?',
      choices: [
        'No: the equation assumes a constant acceleration, so in general it gives the wrong distance',
        'Yes: using the average acceleration makes the equation exact',
        'Yes: the equation holds for any motion along a straight line',
        'No, but only because the velocity changes',
      ],
      answer: 0,
      why: {
        1: 'The average acceleration does give the right final velocity, but not the right distance: how the velocity builds up during the 10 s matters for the area under v–t.',
        2: 'It was derived from a straight v–t line, which needs a constant a. A curved v–t line has a different area.',
        3: 'A changing velocity is fine — that is what acceleration does. The problem is that a itself changes.',
      },
      hints: ['How was ½at² derived? What shape was the v–t graph?', 'If a falls, the v–t graph is curved, not straight.'],
      teach: 'The constant-acceleration equations need a constant a; when a varies, integrate (or split the motion into pieces).',
      explain: t`The equations come from the area under a *straight* $v$–$t$ line. Here $a$ falls, so $v$–$t$ curves, bowing above the straight line between its ends, and the area — the distance — is larger than the formula says. Lesson M3.6 handles this with $v = \int a\,dt$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10.5], y: [0, 32], xlabel: 't (s)', ylabel: 'v (m/s)',
          curves: [{ fn: '30*(1 - exp(-x/6))', domain: [0, 10], color: 'good', label: 'actual v(t)', labelAt: 3 }, { fn: '2.4334*x', domain: [0, 10], color: 'violet', dash: true, label: 'constant average a', labelAt: 8.2 }],
          shade: [{ fn: '30*(1 - exp(-x/6))', lower: '2.4334*x', from: 0, to: 10, color: 'warn', alpha: 0.3 }],
        },
        caption: 'Velocity against time for an acceleration that falls off (an illustrative model). The dashed line has the same start and end, as if a were constant at its average value; the shaded sliver is the distance that line misses.',
      },
    }),
    num({
      id: 'catch-up', difficulty: 3,
      gen(r) {
        const vs = r.pick([20, 25, 30, 35]), a = r.pick([2, 2.5, 3, 4]);
        const tc = (2 * vs) / a;
        return {
          prompt: t`A speeding car passes a parked police car at a constant ${vs} m/s. At that instant the police car starts from rest with a constant acceleration of ${nice(a)} m/s². How long does it take to catch the speeder?`,
          answer: tc, units: 's', tol: { rel: 0.01 },
          errors: [{ value: vs / a, feedback: 'That is when the police car reaches the speeder’s speed — it is still behind then, because it was slower until that moment. They meet when their positions are equal.' }],
          hints: [t`Write each car’s position: $x_s = v_s t$ and $x_p = \tfrac12 a t^2$.`, t`Set them equal and solve for $t$ ($t = 0$ is the other solution).`],
          teach: 'Two objects meet when their positions are equal, not when their velocities are.',
          explain: t`$v_s t = \tfrac12 a t^2 \Rightarrow t = \dfrac{2v_s}{a} = \dfrac{2(${vs})}{${nice(a)}} = ${nice(tc)}$ s. By then the police car is going $${nice(2 * vs)}$ m/s — twice the speeder’s speed.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, tc * 1.25], y: [0, vs * tc * 1.5], xlabel: 't (s)', ylabel: 'x (m)',
              curves: [{ fn: `${vs}*x`, color: 'warn', label: 'speeder', labelAt: tc * 0.4 }, { fn: `${a / 2}*x^2`, color: 'accent', label: 'police', labelAt: tc * 1.1 }],
            },
            caption: 'Positions of both cars against time.',
          },
        };
      },
    }),
    mcq({
      id: 'missing-term', difficulty: 2, kind: 'error',
      prompt: t`A car accelerates steadily from 10 m/s to 20 m/s at 2.0 m/s². A student finds the distance covered as $\Delta x = \tfrac12 a t^2 = \tfrac12(2.0)(5.0)^2 = 25$ m. What is wrong?`,
      choices: [
        t`The $v_0 t$ term is missing: $\Delta x = (10)(5.0) + \tfrac12(2.0)(5.0)^2 = 75$ m`,
        t`The time should be 10 s, not 5.0 s`,
        t`The $\tfrac12$ should not be there: $\Delta x = at^2 = 50$ m`,
        t`Use $v^2 = 2a\,\Delta x$: $\Delta x = 20^2/(2 \times 2.0) = 100$ m`,
      ],
      answer: 0,
      why: {
        1: t`The time is right: $t = (20 - 10)/2.0 = 5.0$ s.`,
        2: t`The $\tfrac12$ is correct — it is the triangle under the $v$–$t$ line.`,
        3: t`That formula assumes the car started from rest. With $v_0 = 10$ m/s it is $v^2 = v_0^2 + 2a\,\Delta x$, giving $(400 - 100)/4.0 = 75$ m.`,
      },
      hints: ['Does the car start from rest?', t`Which term of $\Delta x = v_0 t + \tfrac12 a t^2$ did the student use?`],
      teach: 'The ½at² term alone is the displacement only for a start from rest; otherwise add v₀t.',
      explain: t`$\Delta x = v_0 t + \tfrac12 a t^2 = 50 + 25 = 75$ m. Check: average speed 15 m/s for 5.0 s is 75 m.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 6], y: [0, 23], xlabel: 't (s)', ylabel: 'v (m/s)',
          curves: [{ fn: '10 + 2*x', domain: [0, 5], color: 'good' }],
          shade: [{ fn: '10', from: 0, to: 5, color: 'accent', alpha: 0.25 }, { fn: '10 + 2*x', lower: '10', from: 0, to: 5, color: 'warn', alpha: 0.35 }],
        },
        caption: 'The car’s velocity against time while it speeds up from 10 m/s to 20 m/s.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-runway', difficulty: 2,
      gen(r) {
        const v = r.pick([70, 75, 80, 85]), a = r.pick([2, 2.4, 2.5, 3]);
        const d = (v * v) / (2 * a);
        return {
          prompt: t`An airliner needs ${v} m/s to lift off. Starting from rest, it accelerates down the runway at a constant ${nice(a)} m/s². What is the shortest runway it can use?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v * v) / a, feedback: 'You dropped the 2: Δx = v²/(2a).' }],
          hints: [t`From rest, $v^2 = 2a\,\Delta x$.`],
          teach: 'From rest with constant acceleration, the distance to reach speed v is v²/2a.',
          explain: t`$\Delta x = \dfrac{v^2}{2a} = \dfrac{${v}^2}{2(${nice(a)})} = ${s3(d)}$ m. Real runways add a large safety margin, including room to abort the take-off and stop.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, (v / a) * 1.15], y: [0, v * 1.2], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${a}*x`, domain: [0, v / a], color: 'good' }],
              shade: [{ fn: `${a}*x`, from: 0, to: v / a, color: 'warn', alpha: 0.25 }],
            },
            caption: 'Velocity against time during the take-off run; the shaded area is the runway it uses.',
          },
        };
      },
    }),
    num({
      id: 'cp-abort', difficulty: 3, transfer: true,
      gen(r) {
        const ng = r.pick([8, 10, 12]), d = r.pick([300, 400, 500, 600]);
        const a = ng * G, tt = Math.sqrt((2 * d) / a);
        return {
          prompt: t`During a launch abort, the escape motor pulls the crew capsule away from the failing booster. Seen from the booster, the capsule starts at rest and moves away with a constant acceleration of ${ng}g (${nice(a)} m/s²). How long does it take to get ${d} m clear?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(d / a), feedback: t`You dropped the 2: from rest, $d = \tfrac12 a t^2$, so $t = \sqrt{2d/a}$.` },
            { value: d / a, feedback: t`Solve $d = \tfrac12 a t^2$ for $t$: you need a square root.` },
          ],
          hints: ['From rest relative to the booster: d = ½at².', t`$t = \sqrt{2d/a}$.`],
          teach: 'Starting from rest with constant acceleration, the time to cover d is √(2d/a).',
          explain: t`$t = \sqrt{\dfrac{2d}{a}} = \sqrt{\dfrac{2(${d})}{${nice(a)}}} = ${s3(tt)}$ s. This treats the relative acceleration as constant; a real escape motor’s thrust and the vehicle’s drag both change during the burn.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, tt * 1.35], y: [0, d * 1.6], xlabel: 't (s)', ylabel: 'separation (m)',
              curves: [{ fn: `${a / 2}*x^2`, domain: [0, tt * 1.3], color: 'accent' }],
              hlines: [{ y: d, label: `${d} m`, color: 'warn' }],
            },
            caption: 'The capsule’s distance from the booster against time, for a constant relative acceleration.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-scaling', difficulty: 2,
      prompt: 'With the same constant deceleration, a car’s braking distance from 50 km/h is 14 m. What is it from 100 km/h?',
      choices: ['56 m', '28 m', '42 m', '20 m'],
      answer: 0,
      why: {
        1: 'Twice the speed does not give twice the distance: from v² = 2aΔx, the distance grows with the square of the speed.',
        2: 'Braking distance is proportional to v², so doubling v multiplies it by 4, not 3.',
        3: 'That scales with the square root of 2. The distance grows faster than the speed, not slower.',
      },
      hints: [t`Stopping from speed $v$: $\Delta x = v^2/(2a)$.`, 'What happens to v² when v doubles?'],
      teach: 'Braking distance at constant deceleration is proportional to the square of the speed.',
      explain: t`$\Delta x = v^2/(2a)$, so doubling $v$ multiplies $\Delta x$ by 4: $4 \times 14 = 56$ m.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4.6], y: [0, 31], xlabel: 't (s)', ylabel: 'v (m/s)',
          curves: [
            { fn: '13.889 - 6.889*x', domain: [0, 2.016], color: 'accent', label: '50 km/h', labelAt: 0.3 },
            { fn: '27.778 - 6.889*x', domain: [0, 4.032], color: 'warn', label: '100 km/h', labelAt: 0.3 },
          ],
          shade: [{ fn: '27.778 - 6.889*x', from: 0, to: 4.032, color: 'warn', alpha: 0.16 }, { fn: '13.889 - 6.889*x', from: 0, to: 2.016, color: 'accent', alpha: 0.3 }],
        },
        caption: 'Velocity against time while braking from each speed with the same deceleration. Each braking distance is the area of its triangle.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §3.4', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-4-motion-with-constant-acceleration' }],
});
