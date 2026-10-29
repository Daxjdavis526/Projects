// Reading motion graphs: x–t, v–t and a–t as three views of one motion,
// linked by slopes (going down) and areas (going up).
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3 } from './_kinematics.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M3.3',
  title: 'Reading motion graphs',
  minutes: 10, difficulty: 2,
  intro: t`Graphs of position, velocity and acceleration against time are three views of one motion. They are linked by **slopes** going down the stack and **areas** going back up:

$$v = \frac{dx}{dt}, \quad a = \frac{dv}{dt}, \qquad \Delta x = \int_{t_1}^{t_2} v\,dt, \quad \Delta v = \int_{t_1}^{t_2} a\,dt$$

The two classic mistakes are reading a graph as a **picture of the path**, and reading a **height** where a **slope** is needed. A position graph shaped like a hill is not a hill: it is motion forward, a stop, and motion back along the same line.`,
  symbols: [
    { tex: 'v = \\dfrac{dx}{dt}', text: 'velocity, in m/s: the **slope** of the $x$–$t$ graph at that instant' },
    { tex: 'a = \\dfrac{dv}{dt}', text: 'acceleration, in m/s²: the **slope** of the $v$–$t$ graph' },
    { tex: '\\Delta x = \\int_{t_1}^{t_2} v\\,dt', text: 'displacement from $t_1$ to $t_2$, in m: the signed **area** under the $v$–$t$ graph. Area below the time axis counts as negative' },
    { tex: '\\Delta v = \\int_{t_1}^{t_2} a\\,dt', text: 'change in velocity, in m/s: the signed area under the $a$–$t$ graph' },
    { tex: 't_1,\\ t_2', text: 'the start and end of the time interval, in s' },
  ],
  why: 'Flight telemetry arrives as graphs. Reading slopes and areas correctly is how an engineer turns a velocity trace into an altitude, or an acceleration trace into a speed.',
  visual: {
    type: 'mech-graphlink',
    title: 'One motion, three graphs',
    lead: t`A rover on a straight test track accelerates for 3 s, cruises for 3 s, then brakes so hard that it stops and starts backing up. Drag the time slider or press **Play**, then switch on **Tangent lines** and **Areas**.`,
    tasks: [
      'Turn on Areas and slide to t = 8 s: the green area under v–t is 33 m, exactly x(8). The area under a velocity graph is the displacement.',
      'Go past 8 s: the new v-area is red, below the axis, and x starts to fall — although x itself is still positive.',
      'Turn on Tangent lines near t = 2 s: the slope of the gold tangent on x–t equals the height of the v–t graph.',
    ],
    params: {
      segments: [{ a: 2, dt: 3 }, { a: 0, dt: 3 }, { a: -3, dt: 4 }],
      readouts: ['t', 'x', 'v', 'a', 'dist'],
    },
    caption: 'Piecewise-constant acceleration. A real vehicle cannot change its acceleration instantly, so the sharp corners of the a–t graph are an idealisation; the graphs are exact for that idealised motion.',
  },
  example: {
    prompt: t`A delivery drone rises vertically (up is positive). Its velocity is shown: it speeds up to 4.0 m/s in 2.0 s, holds that speed for 3.0 s, then slows steadily and is moving down at 2.0 m/s at $t = 8.0$ s. Find its acceleration in each phase, its displacement and the distance it travels over the 8.0 s, and when it is highest.`,
    visual: {
      type: 'mech-graphlink',
      params: { segments: [{ a: 2, dt: 2 }, { a: 0, dt: 3 }, { a: -2, dt: 3 }], track: 'vertical', pos: 'y', panels: ['v'], area: true, time: 8, readouts: ['t', 'v'], labels: { v: 'v (m/s), up positive' } },
      caption: 'Green area: rising (positive displacement). Red area: descending (negative).',
    },
    steps: [
      { label: 'Slopes give a', text: t`0–2 s: $a = 4.0/2.0 = 2.0\ \text{m/s}^2$. 2–5 s: the graph is flat, $a = 0$. 5–8 s: $a = (-2.0 - 4.0)/3.0 = -2.0\ \text{m/s}^2$.` },
      { label: 'Areas above the axis', text: t`0–2 s: triangle $\tfrac12(2.0)(4.0) = 4.0$ m. 2–5 s: rectangle $3.0 \times 4.0 = 12.0$ m. 5–7 s (until $v = 0$): triangle $\tfrac12(2.0)(4.0) = 4.0$ m.` },
      { label: 'Area below the axis', text: t`7–8 s: triangle $\tfrac12(1.0)(-2.0) = -1.0$ m — the drone moves 1.0 m down.` },
      { label: 'Add with signs', text: t`Displacement $\Delta y = 4.0 + 12.0 + 4.0 - 1.0 = 19.0$ m. Distance travelled $= 4.0 + 12.0 + 4.0 + 1.0 = 21.0$ m.` },
      { label: 'Highest point', text: t`The drone climbs while $v > 0$ and descends once $v < 0$, so it is highest at $t = 7.0$ s, where the graph crosses zero: $y = 20.0$ m above its start. The top is where $v = 0$, not where $v$ is largest.` },
    ],
    answer: t`$a = 2.0,\ 0,\ -2.0\ \text{m/s}^2$; $\Delta y = +19.0$ m; distance 21.0 m; highest at $t = 7.0$ s, 20.0 m up.`,
  },
  practice: [
    mcq({
      id: 'which-faster', difficulty: 2,
      prompt: 'Objects P and Q move along the same straight line. At t = 3 s, which one is moving faster?',
      choices: ['Q, because its graph is steeper', 'P, because its graph is higher', 'Neither: straight lines mean they have the same speed', 'P, because it started farther along'],
      answer: 0,
      why: {
        1: 'Height on an x–t graph is position. P is farther along, but speed is the slope, and Q’s line is three times steeper.',
        2: 'Straight lines mean each speed is constant — not that the two speeds are equal. Compare the slopes.',
        3: 'Where an object started says nothing about how fast it moves now.',
      },
      hints: ['On an x–t graph, which feature is velocity: the height or the slope?'],
      teach: 'On an x–t graph, speed is the steepness of the line, not how high it is.',
      explain: t`P’s slope is $0.5$ m/s and Q’s is $1.5$ m/s. Q is behind P at $t = 3$ s but moving three times as fast.`,
      visual: {
        type: 'graph',
        params: { x: [0, 8], y: [0, 15.5], xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: '10 + 0.5*x', color: 'accent', label: 'P', labelAt: 6.5 }, { fn: '1.5*x', color: 'warn', label: 'Q', labelAt: 6 }], vlines: [{ x: 3, label: 't = 3 s' }] },
        caption: 'Position against time for objects P and Q.',
      },
    }),
    mcq({
      id: 'hill', difficulty: 2,
      prompt: 'This is the x–t graph of a cart on a level, straight track. What did the cart do?',
      choices: [
        'Moved forward while slowing down, stopped for an instant, then came back faster and faster',
        'Went up a hill and down the other side',
        'Moved forward at a constant speed, then backward at a constant speed',
        'Sped up the whole time, because the graph is curved everywhere',
      ],
      answer: 0,
      why: {
        1: 'That reads the graph as a picture of the path. The track is level and straight; the graph shows position against time.',
        2: 'Constant speeds would give straight line segments. A curved x–t graph means the slope — the velocity — keeps changing.',
        3: 'Curvature means the velocity changes, but the slope shrinks to zero at the top and then grows in the negative direction: slowing, then speeding up backwards.',
      },
      hints: ['Follow the slope of the graph from left to right.', 'Positive slope, then zero, then negative: what does that say about the velocity?'],
      teach: 'An x–t graph is not a picture of the path: its slope tells you the direction and speed of motion along the line.',
      explain: t`The slope starts large and positive (fast, forward), shrinks to zero at the top (momentarily at rest at $x = 16$ m, $t = 4$ s), then becomes more and more negative (faster and faster backward).`,
      visual: {
        type: 'graph',
        params: { x: [0, 8], y: [0, 18], xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: '8*x - x^2', color: 'accent' }] },
        caption: 'Position against time for a cart on a level track.',
      },
    }),
    mcq({
      id: 'v-from-x', difficulty: 2,
      prompt: 'An x–t graph is a straight line sloping downward, as shown. Which describes the matching v–t graph?',
      choices: ['A horizontal line below the time axis', 'A straight line sloping downward', 'A horizontal line on the time axis (v = 0)', 'A line sloping downward from the same starting height'],
      answer: 0,
      why: {
        1: 'That copies the shape of the x–t graph. The v–t graph shows the slope of x–t, and a straight line has the same slope everywhere.',
        2: 'The position is changing, so the velocity is not zero.',
        3: 'The v–t graph does not inherit the starting position: it shows the slope, which is constant and negative.',
      },
      hints: ['What is the slope of the x–t line, and does it change?'],
      teach: 'The v–t graph plots the slope of the x–t graph: a straight x–t line gives a horizontal v–t line.',
      explain: t`The slope is $-1.5$ m/s everywhere, so $v = -1.5$ m/s at every instant: a horizontal line below the axis.`,
      visual: {
        type: 'graph',
        params: { x: [0, 8], y: [0, 13], xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: '12 - 1.5*x', color: 'accent' }] },
        caption: 'Position against time.',
      },
    }),
    num({
      id: 'area-displacement', difficulty: 2,
      gen(r) {
        const V = r.pick([4, 6, 8]), t1 = r.pick([2, 3]), t2 = t1 + r.pick([2, 3, 4]), d = r.pick([2, 4]), w = r.pick([1, 2]);
        const tz = t2 + V / d, t3 = tz + w;
        const up = 0.5 * t1 * V + (t2 - t1) * V + (V * V) / (2 * d), dn = 0.5 * d * w * w;
        const ve = `min(${V}*x/${t1}, ${V}) - ${d}*max(0, x - ${t2})`;
        return {
          prompt: t`The graph shows a cart’s velocity. What is its displacement from $t = 0$ to $t = ${nice(t3)}$ s?`,
          answer: up - dn, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: up + dn, feedback: 'That is the distance travelled: you added the area below the axis. Displacement counts it as negative — the cart was moving backwards then.' }, { value: up, feedback: 'You left out the part below the time axis, after the cart reversed.' }],
          hints: ['Displacement is the area between the v–t graph and the time axis — area below the axis counts as negative.', t`Split it into a triangle, a rectangle, a triangle above the axis (until $t = ${nice(tz)}$ s) and a triangle below it.`],
          teach: 'Displacement is the signed area under the v–t graph: area below the time axis counts as negative.',
          explain: t`Above the axis: $\tfrac12(${t1})(${V}) + (${t2 - t1})(${V}) + \tfrac12(${nice(V / d)})(${V}) = ${nice(up)}$ m. Below: $\tfrac12(${w})(${d * w}) = ${nice(dn)}$ m. Displacement $= ${nice(up)} - ${nice(dn)} = ${nice(up - dn)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, t3 + 0.6], y: [-(d * w) - 1.5, V + 1.5], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: ve, domain: [0, t3], color: 'good' }],
              shade: [{ fn: `max(0, ${ve})`, from: 0, to: t3, color: 'good' }, { fn: `min(0, ${ve})`, from: 0, to: t3, color: 'bad' }],
            },
            caption: 'Velocity against time. Shaded: the areas between the graph and the time axis.',
          },
        };
      },
    }),
    {
      type: 'slider', id: 'farthest', difficulty: 2, param: 'time',
      instruction: 'Drag the time slider to the right moment, then check.',
      gen(r) {
        const A1 = r.pick([1, 1.5, 2]), d1 = r.pick([2, 3, 4]), d2 = r.pick([1, 2, 3]), A3 = r.pick([1.5, 2, 3]);
        const v1 = A1 * d1, ts = d1 + d2 + v1 / A3, d3 = v1 / A3 + r.pick([1.5, 2, 3]);
        return {
          prompt: t`Only the velocity and acceleration graphs of this cart are shown. It starts from rest at $x = 0$. Set the time slider to the instant when the cart is **farthest from its start** in the $+x$ direction.`,
          answer: [ts - 0.2, ts + 0.2],
          hints: ['While v > 0 the cart moves away; once v < 0 it comes back.', 'Find where the v–t graph crosses from positive to negative.'],
          teach: 'An object is farthest along where its velocity changes sign — where the v–t graph crosses the axis, not where it peaks.',
          explain: t`The cart moves in $+x$ while $v > 0$, so it is farthest when $v$ reaches zero: $t = ${d1} + ${d2} + \dfrac{${nice(v1)}}{${nice(A3)}} = ${nice(ts)}$ s. The peak of the v–t graph (${nice(v1)} m/s) is where it is fastest, not farthest.`,
          visual: {
            type: 'mech-graphlink',
            params: { segments: [{ a: A1, dt: d1 }, { a: 0, dt: d2 }, { a: -A3, dt: d3 }], panels: ['v', 'a'], track: false, readouts: ['t'], play: false },
            caption: 'The cart’s velocity and acceleration against time.',
          },
        };
      },
    },
    num({
      id: 'dv-area', difficulty: 3,
      gen(r) {
        let v0, a1, t1, a2, t2, v;
        do {                                   // keep the answer away from zero
          v0 = r.pick([2, 3, 4, 5]); a1 = r.pick([2, 3, 4]); t1 = r.pick([2, 3, 4]); a2 = -r.pick([1, 1.5, 2]); t2 = r.pick([3, 4, 6]);
          v = v0 + a1 * t1 + a2 * t2;
        } while (Math.abs(v) < 1);
        const T = t1 + t2;
        const ae = `${a1} + (${a2} - ${a1})*(1 + sgn(x - ${t1}))/2`;
        return {
          prompt: t`A cart moving at ${v0} m/s at $t = 0$ has the acceleration shown. What is its velocity at $t = ${T}$ s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01, abs: 0.01 },
          errors: [
            { value: a1 * t1 + a2 * t2, feedback: 'The area under a–t is the *change* in velocity. Add it to the starting velocity.' },
            { value: v0 + a1 * t1 - a2 * t2, feedback: 'The area below the time axis is negative: that part of the motion reduces the velocity.' },
          ].filter((e) => Math.abs(e.value - v) > 0.05),
          hints: ['The area under the a–t graph is the change in velocity, Δv.', t`$\Delta v = (${a1})(${t1}) + (${nice(a2)})(${t2})$; then $v = v_0 + \Delta v$.`],
          teach: 'The signed area under the a–t graph is the change in velocity, which you add to the starting velocity.',
          explain: t`$\Delta v = (${a1})(${t1}) + (${nice(a2)})(${t2}) = ${nice(a1 * t1)} - ${nice(-a2 * t2)} = ${nice(v - v0)}$ m/s, so $v = ${v0} + (${nice(v - v0)}) = ${nice(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, T + 0.6], y: [a2 - 1, a1 + 1], xlabel: 't (s)', ylabel: 'a (m/s²)',
              curves: [{ fn: ae, domain: [0, T], color: 'warn' }],
              shade: [{ fn: `max(0, ${ae})`, from: 0, to: T, color: 'warn' }, { fn: `min(0, ${ae})`, from: 0, to: T, color: 'bad' }],
            },
            caption: 'Acceleration against time, with the areas between the graph and the axis shaded.',
          },
        };
      },
    }),
    match({
      id: 'what-it-means', difficulty: 1,
      prompt: 'Match each feature of a motion graph to what it tells you.',
      left: ['The slope of an x–t graph', 'The slope of a v–t graph', 'The area under a v–t graph', 'The area under an a–t graph'],
      right: ['velocity', 'acceleration', 'displacement', 'change in velocity', 'position', 'distance travelled'],
      answer: [0, 1, 2, 3],
      hints: ['Slopes are derivatives: they take you one step down x → v → a.', 'Areas are integrals: they take you back up, as changes.'],
      teach: 'Slopes go down the chain x → v → a; areas come back up as changes: Δx from v–t, Δv from a–t.',
      explain: t`Slopes: $v = dx/dt$, $a = dv/dt$. Areas: $\int v\,dt = \Delta x$ (signed, so not the distance) and $\int a\,dt = \Delta v$. Position itself is the *height* of the x–t graph.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-slope', difficulty: 2,
      gen(r) {
        const x0 = r.int(4, 12), v = r.pick([-2, -1.5, 1.5, 2, 2.5, 3]), t1 = r.int(1, 3), t2 = t1 + r.pick([2, 4]);
        const x1 = x0 + v * t1, x2 = x0 + v * t2, T = t2 + 3;
        const xs = [x0, x0 + v * T];
        return {
          prompt: 'The graph shows the position of a lift cage moving along its shaft (up is positive). Using the marked points, find its velocity.',
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: x2 / t2, feedback: 'That is one position divided by one time — the slope of a line through the origin. Use the change between the two points.' }].filter((e) => Math.abs(e.value - v) > 0.05 * Math.abs(v)),
          hints: ['Velocity is the slope: Δx/Δt between the two points.'],
          teach: 'Velocity is the slope of the x–t graph, found from the changes between two points on the line.',
          explain: t`$v = \dfrac{${nice(x2)} - ${nice(x1)}}{${t2} - ${t1}} = ${nice(v)}$ m/s${v < 0 ? ': the cage is going down' : ''}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, T], y: [Math.min(0, ...xs) - 1, Math.max(...xs) * 1.25 + 1], xlabel: 't (s)', ylabel: 'x (m)',
              curves: [{ fn: `${x0} + ${v}*x`, color: 'accent' }],
              points: [{ x: t1, y: x1, color: 'gold', label: `(${t1} s, ${nice(x1)} m)` }, { x: t2, y: x2, color: 'gold', label: `(${t2} s, ${nice(x2)} m)` }],
            },
            caption: 'Position of the lift cage against time.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-apogee', difficulty: 3, transfer: true,
      prompt: 'Telemetry from a sounding rocket gives its vertical velocity (up positive). The motor burns for 5 s; then the rocket coasts. At what time is the rocket highest?',
      choices: ['About 20 s, where the velocity graph crosses zero', 'At 5 s, at burnout, where the velocity is largest', 'At the end of the record, when the velocity graph is lowest', 'Never: the acceleration is negative throughout the coast, so it is always slowing'],
      answer: 0,
      why: {
        1: 'At burnout the rocket is moving up fastest, but it is still moving up — it keeps climbing until v reaches zero.',
        2: 'By then the velocity is negative: the rocket has been falling for several seconds and has lost height.',
        3: 'Slowing down while moving up still means climbing. The climb ends when the velocity reaches zero.',
      },
      hints: ['While v > 0 the altitude increases.', 'The highest point is where the velocity changes from positive to negative.'],
      teach: 'Maximum altitude comes where the vertical velocity crosses zero, not where it is largest.',
      explain: t`The rocket climbs as long as $v > 0$. After burnout $v$ falls at $9.8\ \text{m/s}^2$ from 150 m/s, reaching zero at $t = 5 + 150/9.8 \approx 20$ s: that is apogee. Its altitude there is the whole area under the graph up to that time.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 26], y: [-70, 170], xlabel: 't (s)', ylabel: 'v (m/s)',
          curves: [{ fn: '(20*x + 2*x^2)*(1 - (1 + sgn(x - 5))/2) + (150 - 9.8*(x - 5))*(1 + sgn(x - 5))/2', color: 'good' }],
          vlines: [{ x: 5, label: 'burnout' }],
        },
        caption: 'Vertical velocity against time. Air resistance is ignored during the coast.',
      },
    }),
    num({
      id: 'cp-max-altitude', difficulty: 3,
      gen(r) {
        const vb = r.pick([120, 150, 180, 210]), tb = r.pick([4, 5, 6]);
        const ta = tb + vb / G, H = 0.5 * vb * ta;
        return {
          prompt: t`A model rocket’s vertical velocity rises in a straight line from 0 to ${vb} m/s during a ${tb} s burn, then falls in a straight line at $9.8\ \text{m/s}^2$ as it coasts. Ignoring air resistance, how high does it get?`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: 0.5 * vb * tb, feedback: 'That is only the altitude at burnout. The rocket keeps climbing until its velocity reaches zero.' },
            { value: (vb * vb) / (2 * G), feedback: 'That is only the climb during the coast. Add the altitude gained during the burn.' },
          ],
          hints: ['Maximum altitude is the area under the v–t graph from launch to the moment v = 0.', t`The coast lasts $${vb}/9.8$ s; the whole graph up to apogee is one triangle.`],
          teach: 'Altitude gained is the area under the vertical-velocity graph up to the moment the velocity reaches zero.',
          explain: t`Apogee comes at $t_a = ${tb} + ${vb}/9.8 = ${s3(ta)}$ s. The area under the graph is a triangle of base $${s3(ta)}$ s and height ${vb} m/s: $\tfrac12(${s3(ta)})(${vb}) = ${s3(H)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, ta * 1.12], y: [-0.15 * vb, vb * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `min(${vb / tb}*x, ${vb} - ${G}*(x - ${tb}))`, color: 'good' }],
            },
            caption: 'Vertical velocity against time: a straight-line burn, then a coast with no air resistance.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §3.2–3.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration' },
    { label: 'Beichner, “Testing student interpretation of kinematics graphs”, Am. J. Phys. 62, 750 (1994)', url: 'https://doi.org/10.1119/1.17449' },
  ],
});
