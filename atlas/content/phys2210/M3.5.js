// Free fall: constant acceleration g downward — rising, at the top and falling.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3 } from './_kinematics.js';

const t = String.raw;

// the flight of an object launched from height h with upward velocity v0, until it lands
const landTime = (v0, h, g = G) => (v0 + Math.sqrt(v0 * v0 + 2 * g * h)) / g;

export default lesson({
  id: 'phys2210.M3.5',
  title: 'Free fall',
  minutes: 10, difficulty: 2,
  intro: t`Drop anything near Earth’s surface and, if air resistance is negligible, it speeds up downward at the same rate, whatever its mass: **9.8 m/s²**, called $g$. Taking up as positive, its acceleration is $a = -g$ — on the way up, at the top and on the way down. Free fall is therefore just constant acceleration:

$$y = y_0 + v_0 t - \tfrac12 g t^2, \qquad v = v_0 - g t$$

At the top of a throw the velocity is zero **for an instant**, but the acceleration is still $g$ downward. That is exactly why the object comes back down.`,
  symbols: [
    { tex: 'y', text: 'height at time $t$, in m, measured upward from a chosen origin (often the ground or the launch point)' },
    { tex: 'y_0', text: 'height at $t = 0$, in m' },
    { tex: 'v_0', text: 'velocity at $t = 0$, in m/s: positive if thrown upward, negative if thrown downward' },
    { tex: 'v', text: 'velocity at time $t$, in m/s, positive upward' },
    { tex: 'g', text: 'the size of the free-fall acceleration, $9.8\\ \\text{m/s}^2$ near Earth’s surface (it varies from about 9.78 to 9.83 m/s² with latitude and height). It is a positive number; the minus signs in the equations put it downward' },
    { tex: 't', text: 'time since release, in s' },
  ],
  why: 'That every object falls with the same acceleration — now tested to a few parts in 10¹⁵ by the MICROSCOPE satellite — is the observation Einstein built general relativity on.',
  visual: {
    type: 'mech-graphlink',
    title: 'A throw, from release to landing',
    lead: t`A ball is thrown straight up (or down) from height $y_0$ and falls to the ground, with no air resistance. Press **Play** or drag the time slider. Watch the amber acceleration arrow: it never changes, even at the top.`,
    tasks: [
      'With v₀ = 15 m/s, slide t to the top (about 1.5 s): v is zero there, but a is still −9.8 m/s².',
      'Find two moments when the ball is at the same height, one rising and one falling: same speed, opposite velocity.',
      'Switch to the Moon: the same shape, stretched — the ball rises about six times higher and stays up six times longer.',
    ],
    params: {
      a: '-g', v0: 'v0', x0: 'h0', T: '(v0 + sqrt(v0^2 + 2*g*h0))/g',
      track: 'vertical', pos: 'y',
      sliders: [
        { key: 'v0', label: 'Launch velocity $v_0$', min: -10, max: 25, step: 0.5, value: 15, unit: '\\mathrm{m/s}', explain: 'Positive is upward; negative means thrown downward.' },
        { key: 'h0', label: 'Launch height $y_0$', min: 1, max: 40, step: 1, value: 10, unit: '\\mathrm{m}', explain: 'Height above the ground at release.' },
      ],
      choices: [{ key: 'g', label: 'Gravity $g$', options: [[9.8, 'Earth'], [1.62, 'Moon'], [3.71, 'Mars']], value: 9.8, explain: '9.8, 1.62 and 3.71 m/s² at the surface.' }],
      labels: { v: 'v (m/s), up positive', a: 'a (m/s²), up positive' },
      readouts: ['t', 'x', 'v', 'a'],
    },
    caption: 'No air resistance, and g taken as uniform (fine for heights much smaller than a planet’s radius). Up is positive, so a = −g. The motion ends when the ball reaches the ground; the arrows show directions, with lengths relative to the largest values in this throw.',
  },
  example: {
    prompt: t`A ball is thrown straight up at 14.7 m/s from the edge of a cliff 20.0 m above the beach, and falls past the edge to the beach below. Ignoring air resistance, find the time to the top, the greatest height above the beach, the time until it lands, and its velocity as it lands.`,
    visual: {
      type: 'mech-graphlink',
      params: { a: -9.8, v0: 14.7, x0: 20, T: landTime(14.7, 20), track: 'vertical', pos: 'y', panels: ['x', 'v'], readouts: ['t', 'x', 'v'], labels: { v: 'v (m/s), up positive' } },
      caption: 'The ball’s height above the beach and its velocity, from the throw to the landing.',
    },
    steps: [
      { label: 'Set up', text: t`Up is positive and the origin is the beach: $y_0 = 20.0$ m, $v_0 = +14.7$ m/s, $a = -9.8\ \text{m/s}^2$.` },
      { label: 'Time to the top', text: t`At the top $v = 0$: $0 = 14.7 - 9.8t$, so $t = 1.50$ s.` },
      { label: 'Greatest height', text: t`$v^2 = v_0^2 - 2g\,\Delta y$ with $v = 0$: $\Delta y = \dfrac{14.7^2}{2(9.8)} = 11.0$ m above the cliff, so $y_\text{max} = 31.0$ m above the beach.` },
      { label: 'Time to land', text: t`Set $y = 0$: $0 = 20.0 + 14.7t - 4.9t^2$. The quadratic formula gives $t = \dfrac{14.7 + \sqrt{14.7^2 + 4(4.9)(20.0)}}{2(4.9)} = 4.02$ s. (The other root is negative: a time before the throw.)` },
      { label: 'Landing velocity', text: t`$v = 14.7 - 9.8(4.02) = -24.7$ m/s: 24.7 m/s downward. Check: $v^2 = v_0^2 - 2g(y - y_0) = 216 + 392 = 608$, and $\sqrt{608} = 24.7$. ✓` },
      { label: 'Sense check', text: t`On the way down the ball passes the cliff edge at 14.7 m/s downward — the launch speed, by symmetry — and then gains more speed in the last 20 m.` },
    ],
    answer: t`Top after 1.50 s, 31.0 m above the beach; it lands after 4.02 s, moving at 24.7 m/s downward.`,
  },
  practice: [
    mcq({
      id: 'top', difficulty: 1,
      prompt: 'A ball is thrown straight up. Ignoring air resistance, what is its acceleration at the very top of its flight?',
      choices: ['9.8 m/s² downward', 'Zero, because it has stopped', '9.8 m/s² upward', 'Zero, because the throw and gravity balance there'],
      answer: 0,
      why: {
        1: 'Its velocity is zero for an instant, but its velocity is still changing — from upward to downward. A changing velocity means a non-zero acceleration.',
        2: 'Gravity pulls down; nothing pushes the ball up once it has left the hand.',
        3: 'Once the ball leaves the hand, the throw no longer acts on it. Only gravity does, all the way up and down.',
      },
      hints: ['What force acts on the ball once it has left the hand?', 'Is the velocity changing at the top?'],
      teach: 'Gravity never switches off: at the top only the velocity is zero, and the acceleration is still g downward.',
      explain: t`Only gravity acts, so $a = -9.8\ \text{m/s}^2$ throughout. At the top $v$ passes through zero on its way from positive to negative — if $a$ were zero there, the ball would hang in the air.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 2.8], y: [0, 10.5], xlabel: 't (s)', ylabel: 'y (m)',
          curves: [{ fn: '1.5 + 12*x - 4.9*x^2', domain: [0, 2.568], color: 'accent' }],
          points: [{ x: 1.2245, y: 8.847, color: 'warn', label: 'top' }],
        },
        caption: 'Height against time for a ball thrown straight up at 12 m/s from 1.5 m.',
      },
    }),
    mcq({
      id: 'heavy-light', difficulty: 1,
      prompt: 'A 5 kg iron ball and a 1 kg wooden ball of the same size are dropped together from 2 m. Ignoring air resistance, which lands first?',
      choices: ['They land together', 'The 5 kg ball', 'The 1 kg ball', 'The 5 kg ball, in one fifth of the time'],
      answer: 0,
      why: {
        1: 'The heavier ball is pulled harder, but it also has more inertia: the acceleration, force divided by mass, comes out the same, g.',
        2: 'Lighter objects do not fall faster either: without air, every object has the same acceleration.',
        3: 'Fall time does not depend on mass at all, let alone in proportion to it.',
      },
      hints: ['Does the free-fall acceleration depend on mass?', t`The drop time from height $h$ is $\sqrt{2h/g}$ — where is the mass?`],
      teach: 'Without air resistance every object falls with the same acceleration g, whatever its mass.',
      explain: t`Both accelerate at $g$, so both take $\sqrt{2(2)/9.8} = 0.64$ s. (In real air the difference for two dense balls over 2 m is far too small to see.)`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [-0.4, 2.8], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '0', color: 'ink3', width: 2 }, { fn: '2', color: 'ink4', width: 1, dash: true }],
          points: [
            { x: 1.2, y: 2, color: 'warn', r: 9 }, { x: 2.8, y: 2, color: 'accent', r: 9 },
            { x: 0.75, y: 2.5, r: 0.1, color: 'warn', label: '5 kg iron' }, { x: 2.35, y: 2.5, r: 0.1, color: 'accent', label: '1 kg wood' },
            { x: 0.1, y: 0.3, r: 0.1, color: 'ink2', label: 'the ground, 2 m below' },
          ],
        },
        caption: 'Two balls of the same size, released together from the same height.',
      },
    }),
    num({
      id: 'drop-time', difficulty: 1,
      gen(r) {
        const h = r.pick([5, 10, 20, 45, 80]);
        const tt = Math.sqrt((2 * h) / G);
        return {
          prompt: t`A stone is dropped from rest from a height of ${h} m. Ignoring air resistance, how long does it take to reach the ground?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: (2 * h) / G, feedback: t`You forgot the square root: $h = \tfrac12 g t^2$ gives $t = \sqrt{2h/g}$.` },
            { value: Math.sqrt(h / G), feedback: t`You dropped the 2: $t = \sqrt{2h/g}$.` },
          ],
          hints: [t`From rest, $h = \tfrac12 g t^2$.`],
          teach: 'Dropped from rest, an object falls a height h in a time √(2h/g).',
          explain: t`$t = \sqrt{\dfrac{2h}{g}} = \sqrt{\dfrac{2(${h})}{9.8}} = ${s3(tt)}$ s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, tt * 1.25], y: [-h * 0.12, h * 1.15], xlabel: 't (s)', ylabel: 'y (m)',
              curves: [{ fn: `${h} - 4.9*x^2`, domain: [0, tt], color: 'accent' }],
              hlines: [{ y: 0, label: 'ground', color: 'ink3' }],
            },
            caption: 'Height against time: a parabola, steepening as the stone speeds up.',
          },
        };
      },
    }),
    num({
      id: 'max-height', difficulty: 2,
      gen(r) {
        const v0 = r.pick([8, 10, 12, 15, 20]);
        const H = (v0 * v0) / (2 * G);
        return {
          prompt: t`A ball leaves a player’s hand moving straight up at ${v0} m/s. Ignoring air resistance, how far above the hand does it rise?`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (v0 * v0) / G, feedback: t`You dropped the 2: $\Delta y = v_0^2/(2g)$.` },
            { value: v0 / G, feedback: 'That is the time to the top, in seconds, not the height.' },
          ],
          hints: ['At the top the velocity is zero.', t`Use $v^2 = v_0^2 - 2g\,\Delta y$ with $v = 0$.`],
          teach: 'A ball thrown up at v₀ rises v₀²/2g before stopping.',
          explain: t`$0 = v_0^2 - 2g\,\Delta y$, so $\Delta y = \dfrac{${v0}^2}{2(9.8)} = ${s3(H)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, (2 * v0) / G * 1.1], y: [-H * 0.1, H * 1.3], xlabel: 't (s)', ylabel: 'y (m)',
              curves: [{ fn: `${v0}*x - 4.9*x^2`, domain: [0, (2 * v0) / G], color: 'accent' }],
              hlines: [{ y: 0, label: 'hand', color: 'ink3' }],
            },
            caption: 'Height above the hand against time, until the ball is back at hand height.',
          },
        };
      },
    }),
    {
      type: 'slider', id: 'zero-v', difficulty: 2, param: 'time',
      instruction: 'Drag the time slider to the right instant, then check.',
      gen(r) {
        const v0 = r.pick([9.8, 12.25, 14.7, 19.6]), h0 = 1.5;
        const ts = v0 / G;
        return {
          prompt: t`A ball is thrown straight up at ${nice(v0)} m/s from 1.5 m above the ground. Only its height and acceleration graphs are shown. Set the time slider to the instant when its **velocity** is zero.`,
          answer: [ts - 0.06, ts + 0.06],
          hints: ['The velocity is the slope of the height graph.', 'Where is the tangent to the y–t graph horizontal?'],
          teach: 'The velocity is zero where the y–t graph is flat — the top of the flight — and the acceleration there is still −g.',
          explain: t`$v = v_0 - gt = 0$ at $t = ${nice(v0)}/9.8 = ${nice(ts)}$ s, the top of the y–t curve. Notice the a–t graph: still $-9.8\ \text{m/s}^2$ at that instant.`,
          visual: {
            type: 'mech-graphlink',
            params: { a: -G, v0, x0: h0, T: landTime(v0, h0), track: 'vertical', pos: 'y', panels: ['x', 'a'], readouts: ['t'], play: false, labels: { a: 'a (m/s²), up positive' } },
            caption: 'Height and acceleration against time; no air resistance.',
          },
        };
      },
    },
    num({
      id: 'cliff-time', difficulty: 2,
      gen(r) {
        const v0 = r.pick([5, 8, 10, 12]), h = r.pick([15, 20, 30, 40]);
        const tt = landTime(v0, h);
        return {
          prompt: t`A stone is thrown straight up at ${v0} m/s from the edge of a cliff ${h} m above the water and falls past the edge into the water. Ignoring air resistance, how long after the throw does it hit the water?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: v0 / G, feedback: 'That is only the time to the top of the flight.' },
            { value: (2 * v0) / G, feedback: 'That is when it is back at the cliff edge. It still has to fall the height of the cliff.' },
            { value: Math.sqrt((2 * h) / G), feedback: 'That is the time for a stone simply dropped from rest. This one was thrown upward first.' },
          ],
          hints: [t`With the water as $y = 0$: $0 = ${h} + ${v0}t - 4.9t^2$.`, t`Use the quadratic formula and keep the positive root: $t = \dfrac{v_0 + \sqrt{v_0^2 + 2gh}}{g}$.`],
          teach: 'For a throw from a height, set y = 0 in y = y₀ + v₀t − ½gt² and take the positive root.',
          explain: t`$0 = ${h} + ${v0}t - 4.9t^2 \Rightarrow t = \dfrac{${v0} + \sqrt{${v0}^2 + 2(9.8)(${h})}}{9.8} = ${s3(tt)}$ s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, tt * 1.2], y: [-h * 0.15, (h + (v0 * v0) / (2 * G)) * 1.2], xlabel: 't (s)', ylabel: 'y (m)',
              curves: [{ fn: `${h} + ${v0}*x - 4.9*x^2`, domain: [0, tt], color: 'accent' }],
              hlines: [{ y: 0, label: 'water', color: 'ink3' }, { y: h, label: 'cliff edge', color: 'ink4' }],
            },
            caption: 'Height above the water against time.',
          },
        };
      },
    }),
    mcq({
      id: 'same-speed', difficulty: 3,
      prompt: 'A ball is thrown straight up at 12 m/s from the edge of a roof. Later it falls back past the edge. Ignoring air resistance, what is its velocity as it passes the edge?',
      choices: ['12 m/s downward', 'Zero', '12 m/s upward', 'Less than 12 m/s downward, because gravity slowed it on the way up'],
      answer: 0,
      why: {
        1: 'It is zero only at the top. Coming back down past the edge it is moving.',
        2: 'Gravity has turned the velocity round: it is now moving down.',
        3: 'Gravity slows it on the way up and speeds it up by exactly as much on the way down. Without air, nothing is lost.',
      },
      hints: [t`Use $v^2 = v_0^2 - 2g\,\Delta y$ with $\Delta y = 0$.`, 'Which sign of v fits a ball moving down?'],
      teach: 'Without air resistance, a thrown object passes its launch height with the launch speed, moving the opposite way.',
      explain: t`With $\Delta y = 0$, $v^2 = v_0^2$, so $|v| = 12$ m/s; it is falling, so $v = -12$ m/s. The flight up and the flight down are mirror images.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.4], y: [-12.5, 9.5], xlabel: 't (s)', ylabel: 'y (m)',
          curves: [{ fn: '12*x - 4.9*x^2', domain: [0, 3.2], color: 'accent' }],
          hlines: [{ y: 0, label: 'roof edge', color: 'ink3' }],
          points: [{ x: 0, y: 0, color: 'gold', label: 'thrown' }, { x: 2.449, y: 0, color: 'gold', label: 'returns' }],
        },
        caption: 'Height relative to the roof edge against time (up positive).',
      },
    }),
    mcq({
      id: 'sign-error', difficulty: 2, kind: 'error',
      prompt: t`A ball is thrown up at 10 m/s. Taking up as positive, a student writes $v = v_0 + gt = 10 + 9.8(2.0) = 29.6$ m/s for its velocity after 2.0 s. What is wrong?`,
      choices: [
        t`With up positive the acceleration is $-g$: $v = 10 - 9.8(2.0) = -9.6$ m/s, moving down`,
        t`$t$ should be squared: $v = 10 + 9.8(2.0)^2$`,
        'Nothing: a falling ball speeds up, so v is bigger than v₀',
        t`$g$ should be 4.9 m/s² because of the $\tfrac12$ in the free-fall equations`,
      ],
      answer: 0,
      why: {
        1: t`Velocity changes linearly in time: $v = v_0 + at$. The $t^2$ belongs to the position equation.`,
        2: 'The ball first slows down on the way up. After 2.0 s it is moving down at 9.6 m/s, not up at 29.6 m/s.',
        3: t`The $\tfrac12$ appears only in the position equation, $\tfrac12 g t^2$. The acceleration is the full 9.8 m/s².`,
      },
      hints: ['Which way does the acceleration point?', 'With up positive, a downward acceleration is negative.'],
      teach: 'Choose a positive direction and give every quantity its sign: with up positive, a = −g.',
      explain: t`$v = v_0 - gt = 10 - 19.6 = -9.6$ m/s: the ball reached the top at about 1.0 s and is now falling at 9.6 m/s.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 2.4], y: [-15, 34], xlabel: 't (s)', ylabel: 'v (m/s)',
          curves: [{ fn: '10 + 9.8*x', domain: [0, 2.2], color: 'violet', dash: true, label: 'the student’s v(t)', labelAt: 0.5 }],
          points: [{ x: 2, y: 29.6, color: 'violet' }],
        },
        caption: 'The student’s formula drawn as a velocity–time graph, with up positive.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-impact', difficulty: 2,
      gen(r) {
        const h = r.pick([6, 8, 10, 12]), v0 = r.pick([3, 4, 5]);       // v₀ large enough to matter at 1 %
        const v = Math.sqrt(v0 * v0 + 2 * G * h);
        return {
          prompt: t`A tool is thrown straight down at ${v0} m/s from a scaffold ${h} m above the ground. Ignoring air resistance, how fast is it moving when it hits the ground?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(2 * G * h), feedback: 'That leaves out its initial downward speed.' }, { value: v0 + Math.sqrt(2 * G * h), feedback: t`Speeds do not add like that. Use $v^2 = v_0^2 + 2gh$.` }],
          hints: [t`Take down as positive: $v^2 = v_0^2 + 2gh$.`],
          teach: 'Without the time, v² = v₀² + 2gh links the speeds to the height fallen.',
          explain: t`$v = \sqrt{${nice(v0)}^2 + 2(9.8)(${h})} = \sqrt{${nice(v0 * v0)} + ${nice(2 * G * h)}} = ${s3(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4], y: [-0.08 * h, h * 1.15], axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ fn: '0', color: 'ink3', width: 2 }, { param: ['0.8', 't'], t: [0, h], color: 'ink4', width: 1, dash: true }],
              points: [{ x: 2, y: h, color: 'accent', r: 6 }, { x: 0.85, y: h / 2, r: 0.1, color: 'ink2', label: `${h} m` }, { x: 2.3, y: h * 0.9, r: 0.1, color: 'good', label: `${v0} m/s` }],
              arrows: [{ from: [2, h], to: [2, h * 0.72], color: 'good' }],
            },
            caption: 'The set-up: the tool leaves the scaffold moving straight down.',
          },
        };
      },
    }),
    num({
      id: 'cp-burnout', difficulty: 3, transfer: true,
      gen(r) {
        const hb = r.pick([600, 900, 1200]), vb = r.pick([120, 150, 180]);
        const H = hb + (vb * vb) / (2 * G);
        return {
          prompt: t`A small sounding rocket’s motor burns out ${hb} m above the ground while the rocket is moving straight up at ${vb} m/s. If air resistance were negligible, what maximum altitude would it reach?`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (vb * vb) / (2 * G), feedback: 'That is how much higher it climbs after burnout. Add the altitude it had already reached.' }],
          hints: ['After burnout the rocket is in free fall — even while it is still going up.', t`It climbs a further $v_b^2/(2g)$ above the burnout altitude.`],
          teach: 'After burnout a rocket is a projectile: it coasts upward with a = −g until its velocity reaches zero.',
          explain: t`Extra climb: $\dfrac{${vb}^2}{2(9.8)} = ${s3((vb * vb) / (2 * G))}$ m, so the peak is $${hb} + ${s3((vb * vb) / (2 * G))} = ${s3(H)}$ m. In reality air drag at these speeds would cut this noticeably.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4], y: [0, hb * 1.5], axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ fn: '0', color: 'ink3', width: 2 }, { param: ['0.8', 't'], t: [0, hb], color: 'ink4', width: 1, dash: true }],
              points: [{ x: 2, y: hb, color: 'accent', r: 6 }, { x: 0.85, y: hb / 2, r: 0.1, color: 'ink2', label: `${hb} m` }, { x: 2.3, y: hb * 1.22, r: 0.1, color: 'good', label: `${vb} m/s` }, { x: 2.3, y: hb * 0.97, r: 0.1, color: 'ink2', label: 'burnout' }],
              arrows: [{ from: [2, hb], to: [2, hb * 1.3], color: 'good' }],
            },
            caption: 'The rocket at burnout (a sketch: only the height is to scale).',
          },
        };
      },
    }),
    mcq({
      id: 'cp-moon', difficulty: 2,
      prompt: 'On the Moon, where g = 1.62 m/s² and there is no air, an astronaut tosses a hammer straight up. What is the hammer’s acceleration at the top of its flight?',
      choices: ['1.62 m/s² downward', 'Zero, because it is momentarily at rest', '9.8 m/s² downward', '1.62 m/s² upward'],
      answer: 0,
      why: {
        1: 'At rest for an instant is not the same as zero acceleration: its velocity is changing from up to down.',
        2: 'That is Earth’s value. On the Moon the hammer falls with the Moon’s g.',
        3: 'The Moon’s gravity pulls toward the Moon: down.',
      },
      hints: ['What acts on the hammer once it has left the hand?'],
      teach: 'In free fall the acceleration is the local g, downward, at every point of the flight — including the top.',
      explain: t`Only the Moon’s gravity acts, so the acceleration is $1.62\ \text{m/s}^2$ downward throughout the flight, including the instant at the top.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 6.6], y: [0, 9.5], xlabel: 't (s)', ylabel: 'y (m)',
          curves: [{ fn: '5*x - 0.81*x^2', domain: [0, 6.173], color: 'accent' }],
          points: [{ x: 3.086, y: 7.716, color: 'warn', label: 'top' }],
        },
        caption: 'The hammer’s height above the astronaut’s hand against time, tossed up at 5 m/s on the Moon.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §3.5', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-5-free-fall' },
    { label: 'Touboul et al. (MICROSCOPE), Phys. Rev. Lett. 129, 121102 (2022)', url: 'https://doi.org/10.1103/PhysRevLett.129.121102' },
  ],
});
