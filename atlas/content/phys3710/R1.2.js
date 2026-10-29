// The spacetime interval as the metric of flat spacetime, in Hartle's
// (−, +, +, +) sign: ds² = −dt² + dx² + dy² + dz² with c = 1. Builds on
// gr.S04.i (invariance, the three kinds of separation) and phys2710.MP2.4
// (the opposite sign) without repeating them: here the interval in three
// dimensions of space, the hyperbolae as spacetime's circles, the line
// element in polar coordinates and a clock on a circle.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { C, r6, st } from './_geom.js';

const t = String.raw;

/** Separation pictured with the distance r = √(Δx² + Δy² + Δz²) across and Δt up (c = 1). */
function sepPicture({ T, R, numbers = true, label: name = 'Q', caption }) {
  const top = Math.max(T, R) * 1.25;
  return st({
    x: [-0.15 * top, top], t: [-0.08 * top, top], xlabel: 'distance √(Δx² + Δy² + Δz²) (light-years)', ylabel: 'Δt (years)', numbers,
    cones: [[0, 0, 'future']], events: [[0, 0, 'P', 'accent2', 9, 12], [R, T, name, 'gold', 9, -8]],
    lines: [{ pts: [[0, 0], [R, T]], color: 'gold', width: 1.4, dash: [2, 4] }],
    caption: caption ?? t`The second event placed by its time after the first and its straight-line distance from it, with $c = 1$. The dashed line is light leaving the first event.`,
  });
}

export default lesson({
  id: 'phys3710.R1.2',
  title: 'The spacetime interval',
  minutes: 11, difficulty: 2,
  intro: t`A metric is a rule for turning coordinate steps into something physical (lesson R0.3). Flat spacetime has the simplest one there is, in units with $c = 1$:

$$ds^2 = -dt^2 + dx^2 + dy^2 + dz^2$$

For two events a finite step apart, $\Delta s^2 = -\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2$, and **every inertial observer computes the same value**. Negative means **timelike** (a clock can travel between them and records $\sqrt{-\Delta s^2}$), zero **lightlike**, positive **spacelike** (it is the squared distance in the frame where they are simultaneous). You met the interval and its invariance in [The interval: what every observer agrees on](#/lesson/gr.S04.i); this course uses the same sign as the Road to Einstein and Hartle’s *Gravity*, the opposite of PHYS 2710’s. Here it becomes a true metric: one that works in three dimensions, in any coordinates, and along curved paths — and whose “circles” are hyperbolae.`,
  symbols: [
    { tex: 'ds^2', text: t`the squared interval for a small step, in $\text{ly}^2$ (or $\text{m}^2$ with time measured as $ct$)` },
    { tex: 'dt', text: t`the time step in a chosen inertial frame, in years (with $c = 1$; in SI write $c\,dt$)` },
    { tex: 'dx,\\ dy,\\ dz', text: 'the space steps in the same frame, in light-years' },
    { tex: '-', text: t`the one sign that makes spacetime differ from space: time counts **against** distance. Hartle’s and Carroll’s convention, signature $(-,+,+,+)$` },
  ],
  why: 'General relativity keeps exactly this rule, step by small step, but lets the numbers in front of dt² and dx² change from place to place: gravity is that change.',
  visual: {
    type: 'graph',
    title: 'Coordinates change; the interval does not',
    lead: t`Drag event P. Black axes are yours; gold axes belong to an observer moving at $\beta$. The readouts give P’s separation from the origin O in both frames, and the interval each computes. The grey curve is every event with the same interval from O — the hyperbola a boost slides P along.`,
    tasks: [
      'Slide β back and forth: t′ and x′ change, Δs² and Δs′² stay equal.',
      'Drag P inside the light cone: the hyperbola curves up like a bowl (timelike). Outside, it opens sideways (spacelike).',
      'Put P on the 45° line: the interval is zero in every frame, and the hyperbola collapses onto the light cone.',
    ],
    params: {
      x: [-4.5, 4.5], y: [-1.5, 5.5], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years)',
      sliders: [{ key: 'b', label: t`Velocity of the moving frame $\beta$`, min: -0.9, max: 0.9, step: 0.01, value: 0.5, explain: t`Its time axis is $x = \beta t$; its space axis is $t = \beta x$.` }],
      drag: [{ key: 'p', x: 1.5, y: 3, snap: 0.05 }],
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 },
        { param: ['b*t', 't'], t: [-6, 6], color: 'gold', width: 2 }, { param: ['t', 'b*t'], t: [-6, 6], color: 'gold', width: 2 },
        { param: ['sqrt(max(py^2 - px^2, 0))*sinh(t)', 'sgn(py)*sqrt(max(py^2 - px^2, 0))*cosh(t)'], t: [-2.5, 2.5], color: 'ink3', width: 1.6, when: 'step(py^2 - px^2 - 0.0001)' },
        { param: ['sgn(px)*sqrt(max(px^2 - py^2, 0))*cosh(t)', 'sqrt(max(px^2 - py^2, 0))*sinh(t)'], t: [-2.5, 2.5], color: 'ink3', width: 1.6, when: 'step(px^2 - py^2 - 0.0001)' },
      ],
      points: [{ x: 0, y: 0, color: 'accent2', label: 'O', labelDx: -14, labelDy: 14 }, { x: 'px', y: 'py', r: 0.01, color: 'accent2', label: 'P' }, { x: '4.2*b', y: 4.2, r: 0.01, color: 'gold', label: 't′' }, { x: 4.2, y: '4.2*b', r: 0.01, color: 'gold', label: 'x′', labelDy: 14 }],
      readouts: [
        { label: t`your $\Delta t$`, expr: 'py', digits: 3 },
        { label: t`$\Delta x$`, expr: 'px', digits: 3 },
        { label: t`moving frame: $\Delta t'$`, expr: '(py - b*px)/sqrt(1 - b^2)', digits: 3 },
        { label: t`$\Delta x'$`, expr: '(px - b*py)/sqrt(1 - b^2)', digits: 3 },
        { label: t`$\Delta s^2 = -\Delta t^2 + \Delta x^2$`, expr: '-py^2 + px^2', digits: 4, unit: t`\text{ly}^2` },
        { label: t`$\Delta s'^2 = -\Delta t'^2 + \Delta x'^2$`, expr: '-((py - b*px)^2 - (px - b*py)^2)/(1 - b^2)', digits: 4, unit: t`\text{ly}^2` },
      ],
    },
    caption: t`One direction of space shown; $c = 1$. The moving frame’s coordinates come from the Lorentz transformation. A boost moves events along the grey hyperbolae of constant interval, as a rotation moves points around circles.`,
  },
  example: {
    prompt: t`Event Q happens $\Delta t = 10$ years after event P, displaced by $(\Delta x, \Delta y, \Delta z) = (2, 3, 6)$ light-years. Find the interval and its kind, the frame in which the two events happen at the same place, and the time between them in that frame.`,
    visual: sepPicture({ T: 10, R: 7 }),
    steps: [
      { label: 'The interval', text: t`$\Delta s^2 = -10^2 + 2^2 + 3^2 + 6^2 = -100 + 49 = -51\ \text{ly}^2$. The distance is $\sqrt{49} = 7$ ly, less than the 10 light-years light covers in the time: **timelike**.` },
      { label: 'The same-place frame', text: t`A clock that leaves P and coasts to Q has velocity $(2, 3, 6)/10 = (0.2, 0.3, 0.6)$, speed $0.7$. In the frame riding with it both events happen at its own position: $\Delta x' = \Delta y' = \Delta z' = 0$.` },
      { label: 'Invariance does the work', text: t`In that frame $\Delta s'^2 = -\Delta t'^2$, and the interval is the same in every frame: $-\Delta t'^2 = -51$, so $\Delta t' = \sqrt{51} = ${fmt(Math.sqrt(51), 4)}$ years. No Lorentz transformation in three dimensions was needed.` },
      { label: 'Sense check', text: t`Time dilation agrees: $10\sqrt{1 - 0.7^2} = 10\times${fmt(Math.sqrt(0.51), 4)} = ${fmt(Math.sqrt(51), 4)}$ years. The frame in which the events are at one place sees the **shortest** time between them; every other frame sees more.` },
    ],
    answer: t`$\Delta s^2 = -51\ \text{ly}^2$ (timelike); in the frame moving at $(0.2, 0.3, 0.6)c$ the events are at one place, ${fmt(Math.sqrt(51), 4)} years apart.`,
  },
  practice: [
    num({
      id: 'interval-3d', difficulty: 1,
      gen(r) {
        const [T, d] = r.pick([[6, [1, 2, 2]], [4, [2, 3, 6]], [9, [2, 6, 3]], [5, [4, 4, 7]], [3, [1, 4, 8]]]);
        const R2 = d[0] ** 2 + d[1] ** 2 + d[2] ** 2, ans = -T * T + R2;
        return {
          prompt: t`Two events are $\Delta t = ${T}$ years apart and displaced by $(\Delta x, \Delta y, \Delta z) = (${d.join(', ')})$ light-years. What is $\Delta s^2 = -\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2$, in $\text{ly}^2$?`,
          visual: sepPicture({ T, R: Math.sqrt(R2), numbers: false }),
          answer: ans, units: 'ly^2', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: T * T + R2, feedback: t`Time enters with a minus sign: $-\Delta t^2$, not $+\Delta t^2$.` }],
          hints: [t`$\Delta x^2 + \Delta y^2 + \Delta z^2 = ${R2}$.`, t`$\Delta s^2 = -${T * T} + ${R2}$.`],
          teach: 'The interval in three dimensions: minus the time squared plus the sum of the three space steps squared.',
          explain: t`$\Delta s^2 = -${T * T} + ${R2} = ${ans}\ \text{ly}^2$: ${ans < 0 ? 'timelike' : 'spacelike'}. In PHYS 2710’s convention the same pair has ${-ans} — the physics is the sign’s meaning, not the sign.`,
        };
      },
    }),
    mcq({
      id: 'classify', difficulty: 2,
      prompt: t`A gamma-ray burst is detected at event P. Event Q happens 7 years later and $(\Delta x, \Delta y, \Delta z) = (2, 3, 6)$ light-years away. What kind of separation do P and Q have?`,
      visual: sepPicture({ T: 7, R: 7, numbers: false, caption: 'Time after P up, straight-line distance across (c = 1). The dashed line is light from P.' }),
      choices: ['Lightlike: only a light signal could join them', 'Timelike: a slower signal could join them', 'Spacelike: nothing could join them', 'It depends on the observer'],
      answer: 0,
      why: {
        1: t`The distance is $\sqrt{4 + 9 + 36} = 7$ light-years — exactly what light covers in 7 years, so nothing slower arrives in time.`,
        2: 'Light from P arrives exactly at Q: it is on the cone, not outside.',
        3: 'The interval is the same for every inertial observer, so its kind is too.',
      },
      hints: [t`Compute the distance $\sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2}$ and compare with $\Delta t$.`],
      teach: 'Zero interval means the events lie on each other’s light cones: in every frame, only light can connect them.',
      explain: t`$\Delta s^2 = -49 + 4 + 9 + 36 = 0$: lightlike. A photon from the burst could be absorbed at Q; anything with mass would arrive late.`,
    }),
    num({
      id: 'proper-length', difficulty: 2,
      gen(r) {
        const [T, d] = r.pick([[2, [3, 0, 4]], [1, [2, 2, 1]], [3, [4, 4, 2]], [5, [6, 3, 6]]]);
        const R2 = d[0] ** 2 + d[1] ** 2 + d[2] ** 2, ans = Math.sqrt(R2 - T * T);
        return {
          prompt: t`Two supernovae are $\Delta t = ${T}$ years apart in the Galaxy’s frame, at a displacement $(${d.join(', ')})$ light-years. Some observers find them simultaneous. How far apart are they for those observers?`,
          visual: sepPicture({ T, R: Math.sqrt(R2), numbers: false }),
          answer: ans, units: 'ly', tol: { rel: 0.003 },
          errors: [{ value: Math.sqrt(R2), feedback: 'That is the distance in the Galaxy’s frame. The frame where they are simultaneous measures the interval itself, which is shorter.' }, { value: Math.sqrt(R2 + T * T), feedback: t`Subtract the time: $\Delta s^2 = -\Delta t^2 + \text{distance}^2$.` }],
          hints: [t`In the frame where they are simultaneous, $\Delta t' = 0$, so $\Delta s^2$ is just the distance squared.`, t`$\Delta s^2 = -${T * T} + ${R2} = ${R2 - T * T}\ \text{ly}^2$.`],
          teach: 'For spacelike events, √Δs² is the distance in the frame where they happen at the same time — the shortest any observer measures.',
          explain: t`$\sqrt{${R2 - T * T}} = ${fmt(ans, 4)}$ light-years, less than the ${fmt(Math.sqrt(R2), 4)} ly in the Galaxy’s frame. No signal could link them, so no observer can say which caused the other.`,
        };
      },
    }),
    mcq({
      id: 'circles', difficulty: 2,
      prompt: t`On a plane, the points a distance 1 from O form a circle. In spacetime (one direction of space, $c = 1$), which curve holds every future event whose interval from O is $\Delta s^2 = -1$?`,
      visual: st({ x: [-3, 3], t: [-0.4, 3.6], cones: [[0, 0, 'future']], numbers: true, events: [[0, 0, 'O', 'accent2', -12, 12]],
        extra: { curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'ink3', width: 1.4, dash: true }] }, caption: 'Your frame, c = 1. Dashed grey: the Euclidean half-circle of radius 1 — the wrong rule for spacetime.' }),
      choices: [t`The hyperbola $t = \sqrt{1 + x^2}$`, t`The half-circle $t = \sqrt{1 - x^2}$`, t`The horizontal line $t = 1$`, t`The light cone $t = |x|$`],
      answer: 0,
      why: {
        1: t`That is $t^2 + x^2 = 1$, the Euclidean rule. The interval has a minus sign: $-t^2 + x^2 = -1$.`,
        2: t`Events at $t = 1$ with $x \ne 0$ have $\Delta s^2 = -1 + x^2$, not $-1$.`,
        3: 'The light cone holds the events with interval zero.',
      },
      hints: [t`Solve $-t^2 + x^2 = -1$ for $t > 0$.`],
      teach: 'Spacetime’s “circles” — events at a fixed interval from a point — are hyperbolae; boosts slide events along them.',
      explain: t`$-t^2 + x^2 = -1$ gives $t = \sqrt{1 + x^2}$: the bowl-shaped hyperbola through $(0, 1)$. Every inertial clock leaving O reads 1 year as it crosses it — which is why it is the curve that calibrates moving observers’ time axes (lesson R2.2).`,
    }),
    expr({
      id: 'circle-element', difficulty: 3,
      prompt: t`In polar coordinates the flat-spacetime metric is $ds^2 = -dt^2 + dr^2 + r^2\,d\phi^2 + dz^2$ ($c = 1$). A clock rides a circle of radius $R$ at angular speed $\omega$: $r = R$, $\phi = \omega t$, $z = 0$. Find $d\tau/dt$, where $d\tau^2 = -ds^2$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.7, 1.7], y: [-1.25, 1.25], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.4 }],
          arrows: [{ from: [0, 0], to: [0.7071, 0.7071], color: 'ink2', width: 1.6, label: 'R', labelDx: -16, labelDy: 10 }, { from: [1, 0], to: [1, 0.55], color: 'accent', label: 'v = Rω' }],
          points: [{ x: 1, y: 0, color: 'accent2' }],
        },
        caption: 'The clock’s path seen from above, at one instant. In spacetime its worldline is a helix winding up the time axis.',
      },
      answer: 'sqrt(1 - R^2 omega^2)', answerTeX: t`\sqrt{1 - R^2\omega^2}`, lhs: t`\dfrac{d\tau}{dt}`,
      vars: { R: [0.1, 0.9], omega: [0.1, 1] },
      errors: [{ answer: 'sqrt(1 - R omega)', feedback: t`The $d\phi^2$ term carries $r^2$: $r^2\,d\phi^2 = R^2\omega^2\,dt^2$.` }, { answer: 'sqrt(1 + R^2 omega^2)', feedback: t`$d\tau^2 = -ds^2$: the space terms enter with a minus sign, so the clock runs slow.` }],
      hints: [t`Along the path $dr = dz = 0$ and $d\phi = \omega\,dt$.`, t`$ds^2 = -dt^2 + R^2\omega^2\,dt^2$, so $d\tau^2 = (1 - R^2\omega^2)\,dt^2$.`],
      teach: 'The metric gives proper time along any path: substitute the path’s steps into ds² and take √(−ds²).',
      explain: t`$d\tau/dt = \sqrt{1 - R^2\omega^2} = \sqrt{1 - v^2}$ with $v = R\omega$ — the time-dilation factor, now from the metric in polar coordinates. The circular motion’s acceleration never enters: only the speed does.`,
    }),
    num({
      id: 'rotor', difficulty: 2,
      gen(r) {
        const [rpm, rc] = r.pick([[60000, 0.08], [90000, 0.06], [30000, 0.12]]);
        const v = 2 * Math.PI * rc * rpm / 60, loss = (1 - Math.sqrt(1 - (v / C) ** 2)) * 86400 * 1e9;
        return {
          prompt: t`A laboratory ultracentrifuge spins at ${rpm.toLocaleString('en-US').replace(/,/g, ' ')} revolutions per minute. An atomic clock could not ride it, but a nucleus at the rim, ${rc * 100} cm from the axis, can. By how many nanoseconds per day does a clock at the rim fall behind one on the axis? Use $d\tau/dt = \sqrt{1 - (R\omega)^2/c^2}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1100], y: [0, 640], aspect: 'wide', xlabel: 'rim speed (m/s)', ylabel: 'ns lost per day',
              curves: [{ fn: `(1 - sqrt(1 - (x/${C})^2))*86400*10^9`, color: 'accent' }] },
            caption: 'Time lost per day against rim speed. Gravity is the same at the rim and the axis here, so only speed matters.',
          },
          answer: loss, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: loss * 2, feedback: t`For small speeds $1 - \sqrt{1 - v^2/c^2} \approx v^2/2c^2$ — mind the factor of 2.` }],
          hints: [t`Rim speed $v = R\omega = 2\pi R\times(\text{rev/s})$: here $${fmt(v, 4)}$ m/s.`, t`Fractional loss $\approx v^2/(2c^2)$; multiply by $86{,}400$ s and convert to ns.`],
          teach: 'A clock moving on a circle runs slow by the factor √(1 − R²ω²/c²): only its speed counts.',
          explain: t`$v = ${fmt(v, 4)}$ m/s, so the fraction is $v^2/2c^2 = ${tex(v * v / 2 / C / C, 3)}$ and the loss is $${nice(loss, 3)}$ ns per day. Mössbauer experiments on spinning rotors measured exactly this shift in the 1960s.`,
        };
      },
    }),
    num({
      id: 'si-interval', difficulty: 2,
      gen(r) {
        const [ms, km] = r.pick([[1, 200], [2, 450], [5, 1200]]);
        const ct = (C * ms * 1e-3) / 1e3, ans = Math.sqrt(ct * ct - km * km) / (C / 1e3) * 1e3;
        return {
          prompt: t`In ordinary units the interval is $\Delta s^2 = -(c\,\Delta t)^2 + \Delta x^2$. Two lightning strikes are ${ms} ms and ${km} km apart in the ground’s frame. A clock that coasts from the first to the second records how many milliseconds?`,
          visual: st({ x: [-0.1 * ct, 1.15 * ct], t: [-0.06 * ct, 1.15 * ct], xlabel: 'x (km)', ylabel: 'ct (km)', cones: [[0, 0, 'future']], events: [[0, 0, 'first strike', 'accent2', 9, 12], [km, ct, 'second', 'gold', 9, -8]], numbers: false,
            caption: t`Time drawn as $ct$ in kilometres, so light is at 45°. The second strike lies inside the first one’s cone.` }),
          answer: ans, units: 'ms', tol: { rel: 0.003 },
          errors: [{ value: ms, feedback: 'That is the ground’s time. A clock that travels between the strikes records less.' }],
          hints: [t`$c\,\Delta t = 299.79\ \text{km/ms}\times${ms}\ \text{ms} = ${fmt(ct, 5)}$ km.`, t`$c\,\Delta\tau = \sqrt{(c\Delta t)^2 - \Delta x^2}$; divide by $c$.`],
          teach: 'With c written out, the interval mixes ct and x in the same units; proper time is √(−Δs²)/c.',
          explain: t`$c\Delta\tau = \sqrt{${fmt(ct, 5)}^2 - ${km}^2} = ${fmt(ans * C / 1e6, 4)}$ km, so $\Delta\tau = ${fmt(ans, 4)}$ ms.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulsar', difficulty: 3, transfer: true,
      gen(r) {
        const [f, R] = r.pick([[716, 12], [641, 11], [600, 13]]);
        const v = 2 * Math.PI * R * 1e3 * f / C, ans = Math.sqrt(1 - v * v);
        return {
          prompt: t`The fastest-spinning known pulsars turn several hundred times a second. Take a neutron star of radius ${R} km spinning at ${f} Hz. Using the flat-spacetime metric in polar coordinates, what is $d\tau/dt$ for a clock on its equator, compared with one on the axis?`,
          visual: {
            type: 'graph',
            params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'speed v/c', ylabel: 'dτ/dt', curves: [{ fn: 'sqrt(1 - x^2)', domain: [0, 0.9999], color: 'accent' }] },
            caption: 'Clock rate against speed for a clock moving on a circle. The star’s gravity, ignored here, slows its clocks far more (by about M/R ≈ 0.2).',
          },
          answer: ans, tol: { rel: 0, abs: 0.0005 },
          errors: [{ value: 1 - v, feedback: t`Use $\sqrt{1 - v^2}$, not $1 - v$.` }],
          hints: [t`$v = 2\pi R f$ at the equator: here $${fmt(v, 4)}c$.`, t`Then $d\tau/dt = \sqrt{1 - v^2/c^2}$.`],
          teach: 'dτ/dt = √(1 − R²ω²/c²) for a clock on a spinning body, from the metric in polar coordinates.',
          explain: t`$v = 2\pi\times${R}\ \text{km}\times${f}\ \text{Hz} = ${fmt(v, 3)}c$, so $d\tau/dt = \sqrt{1 - ${fmt(v, 3)}^2} = ${fmt(ans, 4)}$. Real pulsar timing must add the star’s much larger gravitational slowing (lesson G3).`,
        };
      },
    }),
    num({
      id: 'cp-same-place', difficulty: 2,
      gen(r) {
        const [T, d] = r.pick([[9, [1, 4, 8]], [13, [3, 4, 0]], [7, [2, 3, 0]]]);
        const R2 = d[0] ** 2 + d[1] ** 2 + d[2] ** 2, ans = Math.sqrt(T * T - R2);
        return {
          prompt: t`Events P and Q are ${T} years apart and displaced by $(${d.join(', ')})$ light-years. How many years apart are they in the frame where they happen at the same place?`,
          visual: sepPicture({ T, R: Math.sqrt(R2), numbers: false }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          errors: [{ value: Math.sqrt(T * T + R2), feedback: t`$-\Delta t'^2 = \Delta s^2 = -\Delta t^2 + \text{distance}^2$: subtract.` }],
          hints: ['In that frame the space steps vanish, so −Δt′² = Δs².'],
          teach: 'The time between timelike events in the frame where they share a place is √(−Δs²): the proper time.',
          explain: t`$\Delta s^2 = -${T * T} + ${R2} = ${R2 - T * T}$, so $\Delta t' = \sqrt{${T * T - R2}} = ${fmt(ans, 4)}$ years.`,
        };
      },
    }),
    mcq({
      id: 'cp-convention', difficulty: 2,
      prompt: t`A PHYS 2710 problem set writes $(\Delta s)^2 = (c\Delta t)^2 - \Delta x^2 = +16\ \text{ly}^2$ for two events. In this course’s convention, $\Delta s^2 = -(c\Delta t)^2 + \Delta x^2$, what is the interval, and what kind of separation is it?`,
      visual: sepPicture({ T: 5, R: 3, numbers: false, caption: 'One possible pair with this interval: 5 years and 3 light-years apart (c = 1).' }),
      choices: [t`$-16\ \text{ly}^2$: timelike`, t`$+16\ \text{ly}^2$: spacelike`, t`$-16\ \text{ly}^2$: spacelike`, t`$+16\ \text{ly}^2$: timelike`],
      answer: 0,
      why: {
        1: 'The number keeps its size but flips its sign between conventions, and the kind of separation is physics: it cannot change.',
        2: 'In this course’s sign, negative means timelike.',
        3: 'The sign must flip: the two conventions differ by an overall minus sign.',
      },
      hints: ['The two conventions differ by an overall factor of −1.', 'Positive in PHYS 2710 means the time part wins: timelike.'],
      teach: 'Sign conventions flip the interval’s sign, never the physics: timelike is negative here and positive in Taylor–Wheeler’s convention.',
      explain: t`Multiply by $-1$: $\Delta s^2 = -16\ \text{ly}^2$. The time part dominates, so a clock can travel between the events and records 4 years.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §4.3–4.4 (the invariant interval, light cones)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 1', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Kündig (1963), Measurement of the transverse Doppler effect in an accelerated system, Phys. Rev. 129, 2371', url: 'https://doi.org/10.1103/PhysRev.129.2371' },
  ],
});
