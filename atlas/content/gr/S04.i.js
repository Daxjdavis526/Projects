// The interval: what every observer agrees on — Intuition Mode.
// Signature (−, +, +, +) as in Carroll: Δs² = −c²Δt² + Δx² + Δy² + Δz².
// Diagrams use years and light-years (c = 1).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { gamma, boost } from '../../src/viz/model/relativity.js';
import { spacetimeSketch } from './_foundations.js';

const t = String.raw;

const interval = (dt, dx) => -dt * dt + dx * dx;            // c = 1
const D_PROXIMA = 4.24;                                      // light-years

// the worked example: an event 5 s and 3 light-seconds from O, seen from a rocket at 0.6c
const EX = { t: 5, x: 3, beta: 0.6 };
const [EX_TP, EX_XP] = boost(EX.t, EX.x, EX.beta);           // (4, 0)

// the explore picture: B on the τ = 3 yr hyperbola; at β = 0.8 it sits on the moving observer’s time axis
const B = { t: 5, x: 4 };
const B_TAU = Math.sqrt(-interval(B.t, B.x));                // 3
const B_BETA = B.x / B.t;                                    // 0.8

export default lesson({
  id: 'gr.S04.i',
  title: 'The interval: what every observer agrees on',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Observers moving past one another disagree about how much time separates two events, how far apart they are, even whether they are simultaneous. But they all compute the same value of one combination — the **spacetime interval**, shown above. On a diagram with one direction of space, in years and light-years:

$$\Delta s^2 = -\Delta t^2 + \Delta x^2 \qquad (c = 1)$$

It is spacetime’s version of Pythagoras. Turn a map and the east–west and north–south separations change, but $\Delta x^2 + \Delta y^2$ does not; switch to a moving frame and $\Delta t$ and $\Delta x$ change, but $\Delta s^2$ does not. The minus sign is the whole difference — and its sign tells you the kind of separation. **Negative** (timelike): a clock can be present at both events, and one that coasts from one to the other records the proper time $\Delta\tau = \sqrt{-\Delta s^2}/c$. **Zero** (lightlike): only light connects them. **Positive** (spacelike): no signal can, and $\sqrt{\Delta s^2}$ is their distance in a frame where they happen at the same time.`,
  equation: t`\Delta s^2 = -c^2\,\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2`,
  symbols: [
    { tex: '\\Delta s^2', text: t`the interval between two events, in $\text{m}^2$ (or light-years², with $c = 1$) — the same for every inertial observer` },
    { tex: '\\Delta t', text: 'the time between the two events in your frame, in seconds (or years)' },
    { tex: '\\Delta x,\\ \\Delta y,\\ \\Delta z', text: 'how far apart the events are in your frame along three perpendicular directions, in metres (or light-years)' },
    { tex: 'c', text: t`the speed of light; $c\,\Delta t$ turns a time into a distance (1 year of time ↔ 1 light-year) so the terms can be combined` },
    { tex: '\\Delta\\tau', text: t`proper time, $\sqrt{-\Delta s^2}/c$: what a clock travelling between the events (at constant velocity) records` },
  ],
  why: 'General relativity keeps exactly this rule for every tiny step: the metric of step 8 is the interval’s formula, adapted to curved spacetime.',
  visual: {
    type: 'spacetime',
    title: 'Coordinates change; the interval does not',
    lead: t`A is at the origin and B is ${B.t} years later and ${B.x} light-years away. The gold axes and readout belong to an observer moving at the slider’s speed. Watch B’s coordinates $(t', x')$ change while the grey curve it sits on stays put.`,
    tasks: [
      `Slide the speed: B’s (t′, x′) change, yet t′² − x′² is always ${nice(-interval(B.t, B.x))} — the readout’s Δt² − Δx².`,
      `Set the speed to ${B_BETA}: then x′ = 0 — B happens right where that observer is — and t′ = ${nice(B_TAU)} years is the proper time.`,
      'Drag B along its grey hyperbola: every event on it has the same interval from A.',
    ],
    params: { beta: 0.4, events: [[0, 0], [B.t, B.x]], simultaneity: false, hyperbolae: true, range: 5 },
    caption: t`Units: years and light-years ($c = 1$). The readout’s $\Delta t^2 - \Delta x^2$ is $-\Delta s^2$: positive for timelike pairs, where it is the squared proper time. The grey hyperbolae join events 1, 2, 3 and 4 years of proper time from A (fainter: 1–4 light-years of proper distance).`,
  },
  example: {
    prompt: t`Event A is a flash at the origin. Event B happens ${EX.t} s later and ${EX.x} light-seconds away (1 light-second is about 300,000 km). A rocket moving at $${EX.beta}c$ passes through A. Find the interval between A and B in your frame and in the rocket’s, and the time the rocket’s clock records between them.`,
    visual: {
      type: 'spacetime',
      params: { beta: EX.beta, events: [[0, 0], [EX.t, EX.x]], simultaneity: false, hyperbolae: true, range: 5 },
      caption: t`Here one unit is a second (up) or a light-second (across). B sits on the rocket’s gold time axis and on the hyperbola ${nice(Math.sqrt(-interval(EX.t, EX.x)))} units of proper time from A.`,
    },
    steps: [
      { label: 'Your frame', text: t`$\Delta s^2 = -(c\cdot ${EX.t}\ \text{s})^2 + (${EX.x}\ \text{light-s})^2 = -${EX.t * EX.t} + ${EX.x * EX.x} = ${interval(EX.t, EX.x)}$ light-seconds². Negative: timelike.` },
      { label: 'The rocket’s frame', text: t`The rocket measures $\Delta t' = ${nice(EX_TP)}$ s and $\Delta x' = ${nice(Math.abs(EX_XP))}$ (from the Lorentz transformation, which the Derivation lesson derives — the readout shows it). So $\Delta s^2 = -${nice(EX_TP * EX_TP)} + ${nice(EX_XP * EX_XP)} = ${nice(interval(EX_TP, EX_XP))}$ light-seconds². The same.` },
      { label: 'Why Δx′ is zero', text: t`At $${EX.beta}c$ the rocket covers $${EX.beta}\times${EX.t} = ${nice(EX.beta * EX.t)}$ light-seconds in ${EX.t} s: it is *at* B when B happens. For the rocket both events happen in the same place.` },
      { label: 'Proper time', text: t`A clock aboard, present at both events, records $\Delta\tau = \sqrt{-\Delta s^2}/c = \sqrt{${-interval(EX.t, EX.x)}} = ${nice(Math.sqrt(-interval(EX.t, EX.x)))}$ s, while you measure ${EX.t} s: the moving clock is slow by $\gamma = ${nice(gamma(EX.beta))}$. Time dilation (step 2) is this geometry.` },
    ],
    answer: t`$\Delta s^2 = ${interval(EX.t, EX.x)}$ light-seconds² in both frames; the rocket’s clock records ${nice(Math.sqrt(-interval(EX.t, EX.x)))} s.`,
  },
  practice: [
    num({
      id: 'interval', difficulty: 1,
      gen(r) {
        const [dt, dx] = r.pick([[5, 3], [3, 5], [6, 2], [2, 6], [7, 3], [1, 4], [4, 1], [5, 4]]);
        const s2 = interval(dt, dx);
        return {
          prompt: t`Event B happens ${dt} years after event A and ${dx} light-years away from it. Find the interval $\Delta s^2 = -c^2\Delta t^2 + \Delta x^2$ in light-years² (with $c = 1$ light-year per year).`,
          answer: s2, units: 'ly^2', tol: { rel: 0.005 },
          errors: [
            { value: dt * dt + dx * dx, feedback: 'The time part enters with a minus sign: Δs² = −c²Δt² + Δx².' },
            { value: -s2, feedback: 'That is Δt² − Δx², the opposite sign. With the (−, +, +, +) convention the time term is the negative one.' },
            { value: dx - dt, feedback: 'Square each separation before combining them.' },
          ],
          hints: [t`$c\,\Delta t = ${dt}$ light-years.`, t`$\Delta s^2 = -(${dt})^2 + (${dx})^2$.`],
          teach: 'The interval subtracts the squared time separation (as a distance, cΔt) from the squared space separation.',
          explain: t`$\Delta s^2 = -${dt * dt} + ${dx * dx} = ${s2}$ light-years² — ${s2 < 0 ? 'negative, so timelike: a clock could travel from A to B' : 'positive, so spacelike: nothing can travel from A to B'}.`,
          visual: spacetimeSketch({ events: [[0, 0, 'A'], [dt, dx, 'B']] }),
        };
      },
    }),
    mcq({
      id: 'sign', difficulty: 1,
      gen(r) {
        const s2 = r.pick([-16, -9, -1, 0, 7, 25, 3]);
        return {
          prompt: t`Two events are separated by the interval $\Delta s^2 = ${s2}$ light-years². What kind of separation is this?`,
          answer: s2 < 0 ? 0 : s2 === 0 ? 1 : 2,
        };
      },
      choices: [
        'Timelike: a clock moving slower than light can be present at both',
        'Lightlike: only light can be present at both',
        'Spacelike: no clock or signal can be present at both',
        'It cannot be said — it depends on which observer measures it',
      ],
      why: {
        0: 'Timelike needs a negative interval: the time part, −c²Δt², must win.',
        1: 'Lightlike needs Δs² = 0 exactly: the light-travel distance matches the gap.',
        2: 'Spacelike needs a positive interval: the space part must win.',
        3: 'Δs² is the same for every inertial observer, so its sign — and the kind of separation — is too.',
      },
      hints: ['Which term wins: −c²Δt² or Δx²?'],
      teach: 'With the (−, +, +, +) convention: Δs² < 0 timelike, = 0 lightlike, > 0 spacelike — the same for every observer.',
      explain: 'A negative interval means the time separation (as a distance, cΔt) beats the space separation: a slower-than-light clock can go from one event to the other. Zero means exactly light speed is needed; positive means even light is too slow.',
      visual: spacetimeSketch({ events: [[0, 0, 'A'], [3, 1, 'Δs² < 0'], [2, 2, 'Δs² = 0'], [1, 3.5, 'Δs² > 0']], caption: 'Relative to A: events inside the light cone have a negative interval, events on it zero, events outside positive. Years and light-years.' }),
    }),
    num({
      id: 'two-frames', difficulty: 2,
      gen(r) {
        const [T, X] = r.pick([[5, 4], [5, 3], [4, 2], [6, 2], [3, 1], [5, 1]]);
        const beta = r.pick([0.6, -0.6]);
        const [tp, xp] = boost(T, X, beta);
        return {
          prompt: t`In your frame, event E happens ${T} years after event O and ${X} light-year${X === 1 ? '' : 's'} away. Astronauts in a rocket that passes through O at $${beta}c$ measure the same two events as $\Delta t' = ${nice(tp)}$ years and $\Delta x' = ${nice(xp)}$ light-years apart. Compute the interval from the astronauts’ numbers.`,
          answer: interval(tp, xp), units: 'ly^2', tol: { rel: 0.005 },
          errors: [{ value: tp * tp + xp * xp, feedback: 'The time part enters with a minus sign.' }, { value: tp * tp - xp * xp, feedback: 'Opposite sign: in the (−, +, +, +) convention the time term is subtracted.' }],
          hints: [t`$\Delta s^2 = -(\Delta t')^2 + (\Delta x')^2 = -(${nice(tp)})^2 + (${nice(xp)})^2$.`, `Then compare with −${T}² + ${X}² from your own frame.`],
          teach: 'Different observers measure different Δt and Δx for the same pair of events, but they get the same interval.',
          explain: t`$-(${nice(tp)})^2 + (${nice(xp)})^2 = ${nice(-tp * tp)} + ${nice(xp * xp)} = ${nice(interval(tp, xp))}$ light-years² — exactly your $-${T * T} + ${X * X} = ${interval(T, X)}$.`,
          visual: spacetimeSketch({
            events: [[0, 0, 'O'], [T, X, 'E']],
            segments: [[-1, -beta, 7, 7 * beta, 'gold'], [-beta * 5, -5, beta * 5, 5, 'gold']],
            caption: t`Gold: the rocket’s worldline (its time axis, the steeper line) and the events it calls simultaneous with O (its space axis). Dashed: the light cone of O. Years and light-years.`,
          }),
        };
      },
    }),
    num({
      id: 'proper-time', difficulty: 2,
      gen(r) {
        const [dt, dx, tau] = r.pick([[5, 3, 4], [10, 6, 8], [13, 5, 12], [17, 15, 8], [10, 8, 6]]);
        return {
          prompt: t`Events A and B are ${dt} years and ${dx} light-years apart in your frame. A clock coasts at constant velocity from A to B. How much time does it record?`,
          answer: tau, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(dt * dt + dx * dx), feedback: 'Spacetime has a minus sign: Δτ² = Δt² − Δx²/c², not a plus.' }, { value: dt - dx, feedback: 'Square first, then subtract, then take the square root.' }, { value: dt, feedback: 'That is your time; the moving clock records less.' }],
          hints: [t`$\Delta s^2 = -${dt}^2 + ${dx}^2 = ${interval(dt, dx)}$ light-years².`, t`$\Delta\tau = \sqrt{-\Delta s^2}/c = \sqrt{${-interval(dt, dx)}}$ years.`],
          teach: 'For a timelike pair, the time a clock coasting between them records is Δτ = √(−Δs²)/c.',
          explain: t`$\Delta s^2 = ${interval(dt, dx)}$ light-years², so $\Delta\tau = \sqrt{${-interval(dt, dx)}} = ${tau}$ years — less than your ${dt}. The grey hyperbola meets the time axis at $t = ${tau}$: a clock that stays put at A also takes ${tau} years to reach it.`,
          visual: spacetimeSketch({
            events: [[0, 0, 'A'], [dt, dx, 'B']], segments: [[0, 0, dt, dx, 'gold']], hyperbola: { through: [dt, dx] }, range: Math.max(5, Math.ceil(Math.max(dt / 1.3, dx * 1.1))),
            caption: 'Gold: the coasting clock’s worldline. Grey: every event the same interval from A — reached by a coasting clock after the same proper time.',
          }),
        };
      },
    }),
    num({
      id: 'proper-distance', difficulty: 3,
      gen(r) {
        const [dt, dx, d] = r.pick([[3, 5, 4], [6, 10, 8], [5, 13, 12], [8, 17, 15]]);
        return {
          prompt: t`Two events are ${dt} years and ${dx} light-years apart in your frame. Some observers — moving fast enough along the line between them — find them simultaneous. How far apart are the two events for those observers?`,
          answer: d, units: 'ly', tol: { rel: 0.005 },
          errors: [{ value: dx, feedback: 'That is the distance in your frame. Observers who see the events as simultaneous measure a different distance.' }, { value: Math.sqrt(dt * dt + dx * dx), feedback: 'Use the interval, with its minus sign: Δs² = −Δt² + Δx².' }],
          hints: [t`The interval is the same for everyone: $\Delta s^2 = -${dt}^2 + ${dx}^2 = ${interval(dt, dx)}$ light-years².`, t`For the other observers $\Delta t' = 0$, so $\Delta s^2 = (\Delta x')^2$.`],
          teach: 'For a spacelike pair, √(Δs²) is the distance between the events in the frame where they are simultaneous — the proper distance.',
          explain: t`$\Delta s^2 = ${interval(dt, dx)}$ light-years² in every frame. With $\Delta t' = 0$, $(\Delta x')^2 = ${interval(dt, dx)}$, so $\Delta x' = ${d}$ light-years — less than the ${dx} you measure. The grey hyperbola meets your $x$ axis at ${d} light-years: every event on it is that proper distance from A.`,
          visual: spacetimeSketch({
            events: [[0, 0, 'A'], [dt, dx, 'B']], hyperbola: { through: [dt, dx] }, range: Math.max(5, Math.ceil(dx * 1.15)),
            caption: 'Grey: every event with the same (spacelike) interval from A. Years and light-years.',
          }),
        };
      },
    }),
    multi({
      id: 'invariants', difficulty: 2,
      prompt: 'Which of these do all inertial observers agree on, however they move? Select every one.',
      choices: [
        t`The interval $\Delta s^2$ between two events`,
        'The speed of light',
        'The time recorded by a clock that coasts from one event to another',
        'Whether one event lies inside the other’s light cone',
        'The time between two events',
        'The distance between two events',
        'Whether two distant events happen at the same time',
      ],
      answer: [0, 1, 2, 3],
      why: { 4: 'Time between events depends on the observer — time dilation.', 5: 'Distance depends on the observer — length contraction.', 6: 'Simultaneity of distant events depends on the observer — the tilted lines of simultaneity.' },
      hints: ['Things built from Δs² are shared; Δt and Δx on their own are not.', 'Proper time is √(−Δs²)/c, and light-cone membership is the sign of Δs².'],
      teach: 'Δt and Δx are frame-dependent pieces; the interval — and everything built from it, such as proper time and causal order — is invariant.',
      explain: 'The interval is invariant, and so are the quantities built from it: proper time (√(−Δs²)/c), the sign of Δs² (inside or outside the light cone), and the speed of light (Δs² = 0 for everyone). Time differences, distances and simultaneity are the frame-dependent parts.',
    }),
    mcq({
      id: 'pythagoras', difficulty: 2,
      prompt: t`Turning a map changes the east–west and north–south separations of two towns, but not $\Delta x^2 + \Delta y^2$. Switching to a moving frame changes $\Delta t$ and $\Delta x$ between two events. Which combination stays the same?`,
      choices: [t`$-c^2\Delta t^2 + \Delta x^2$`, t`$c^2\Delta t^2 + \Delta x^2$`, t`$\Delta x/\Delta t$`, t`$c\,\Delta t + \Delta x$`],
      answer: 0,
      why: { 1: 'With a plus sign this is Euclidean distance, which a boost does change: the gold tick marks are not at equal page distances.', 2: 'That is a speed; it changes with the observer (velocities do not even add simply).', 3: 'Sums of separations change under a boost; only the minus-sign combination of squares survives.' },
      hints: ['Move the slider: the gold tick marks slide along curves. What kind of curves?', 'Hyperbolae t² − x² = const are the curves of constant −Δs².'],
      teach: 'Boosts preserve −c²Δt² + Δx², just as rotations preserve Δx² + Δy²: spacetime’s geometry has a minus sign.',
      explain: t`Boosts slide events along hyperbolae $c^2t^2 - x^2 = \text{const}$, the way rotations slide points along circles $x^2 + y^2 = \text{const}$. The quantity kept is $\Delta s^2 = -c^2\Delta t^2 + \Delta x^2$.`,
      visual: { type: 'spacetime', params: { beta: 0.5, events: [[0, 0]], simultaneity: false, hyperbolae: true, range: 5 }, caption: 'Move the slider: the gold tick marks (one unit of the moving observer’s time and space) slide along the grey hyperbolae.' },
    }),
    mcq({
      id: 'same-place', difficulty: 2,
      prompt: 'Two events happen at the same place in your frame — your watch beeps twice, 3 seconds apart. Which observer measures the shortest time between the beeps?',
      choices: ['You: everyone moving relative to you measures more than 3 s', 'An observer racing past you, who measures less than 3 s', 'Nobody: every observer measures 3 s', 'An observer moving at nearly c, who measures almost zero'],
      answer: 0,
      why: { 1: 'Moving observers see your watch as a moving clock, running slow: they measure more time between its beeps.', 2: 'The interval is shared, not Δt. With Δx′ ≠ 0, −c²Δt′² + Δx′² = −c²(3 s)² forces Δt′ > 3 s.', 3: 'Near c they measure an enormous time: Δt′ = γ × 3 s grows without limit.' },
      hints: [t`In your frame $\Delta x = 0$, so $\Delta s^2 = -c^2(3\ \text{s})^2$. For another observer $\Delta x' \neq 0$.`, t`$-c^2\Delta t'^2 + \Delta x'^2 = -c^2(3\ \text{s})^2$ — so is $\Delta t'$ bigger or smaller than 3 s?`],
      teach: 'The proper time — measured where the events happen at one place — is the shortest time any observer measures between them.',
      explain: t`For any other observer $c^2\Delta t'^2 = c^2(3\ \text{s})^2 + \Delta x'^2$, so $\Delta t' \ge 3$ s, equal only when $\Delta x' = 0$. The frame in which both events happen at one place measures the least time: the proper time.`,
      visual: spacetimeSketch({ events: [[0, 0, '1st beep'], [3, 0, '2nd beep']], segments: [[0, 0, 3, 0, 'gold']], hyperbola: { through: [3, 0] }, caption: 'Grey: every event with the same interval from the first beep. Any observer’s coordinates for the second beep lie on it, and its lowest point — the smallest time — is your own 3 s. Here one unit is a second (up) or a light-second (across).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-deduce', difficulty: 2,
      gen(r) {
        const [s2, dxp, dtp] = r.pick([[-16, 3, 5], [-144, 5, 13], [-64, 6, 10], [-225, 8, 17], [-576, 7, 25]]);
        return {
          prompt: t`Two events are separated by $\Delta s^2 = ${s2}$ light-years². In a rocket’s frame they are ${dxp} light-years apart. How much time separates them in the rocket’s frame?`,
          answer: dtp, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(-s2 - dxp * dxp), feedback: 'Solve −(Δt′)² + (Δx′)² = Δs² carefully: (Δt′)² = −Δs² + (Δx′)².' }, { value: Math.sqrt(-s2), feedback: 'That is the proper time — the time in a frame where Δx′ = 0. Here Δx′ is not zero.' }],
          hints: ['The interval is the same in the rocket’s frame.', t`$-(\Delta t')^2 + ${dxp}^2 = ${s2}$, so $(\Delta t')^2 = ${-s2} + ${dxp * dxp}$.`],
          teach: 'Because the interval is invariant, knowing it and one coordinate difference in any frame gives you the other.',
          explain: t`$(\Delta t')^2 = ${-s2} + ${dxp * dxp} = ${-s2 + dxp * dxp}$, so $\Delta t' = ${dtp}$ years.`,
        };
      },
    }),
    num({
      id: 'cp-pair', difficulty: 3, transfer: true,
      gen(r) {
        const [E1, E2] = r.pick([[1, 4], [2, 8], [4, 9], [1, 9], [9, 16]]);
        const M = 2 * Math.sqrt(E1 * E2);
        return {
          prompt: t`Energy and momentum obey the same minus-sign rule: for any system, $(Mc^2)^2 = E^2 - (pc)^2$ is the same for every observer, where $M$ is the system’s mass. Two photons (massless, each with momentum $p = E/c$) collide head-on: one has ${E1} GeV, the other ${E2} GeV. What is the mass of the two-photon system, as the rest energy $Mc^2$ in GeV?`,
          answer: M, units: 'GeV', tol: { rel: 0.005 },
          errors: [{ value: E1 + E2, feedback: 'That is the total energy. The total momentum is not zero, so subtract (pc)².' }, { value: Math.abs(E2 - E1), feedback: 'That is the total momentum times c. The mass comes from E² − (pc)².' }, { value: 0, feedback: 'Each photon is massless, but the pair is not: mass is not additive.' }],
          hints: [t`Total energy $E = ${E1} + ${E2} = ${E1 + E2}$ GeV. Head-on, the momenta point opposite ways: $pc = ${E2} - ${E1} = ${E2 - E1}$ GeV.`, t`$(Mc^2)^2 = ${E1 + E2}^2 - ${E2 - E1}^2$.`],
          teach: 'Invariant mass, √(E² − (pc)²)/c², is the energy–momentum version of the interval — and two massless photons can make a massive system.',
          explain: t`$(Mc^2)^2 = ${(E1 + E2) ** 2} - ${(E2 - E1) ** 2} = ${(E1 + E2) ** 2 - (E2 - E1) ** 2}$, so $Mc^2 = ${nice(M)}$ GeV. This is how the Higgs boson was found in 2012: as a bump at 125 GeV in the invariant mass of photon pairs.`,
        };
      },
    }),
    num({
      id: 'cp-proxima', difficulty: 2, transfer: true,
      gen(r) {
        const T = r.pick([5, 6, 8, 10]);
        const tau = Math.sqrt(T * T - D_PROXIMA ** 2);
        return {
          prompt: t`A probe coasts to Proxima Centauri, ${D_PROXIMA} light-years away, arriving ${T} years after launch in Earth’s frame. How much time does its own clock record for the trip?`,
          answer: tau, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: T, feedback: 'That is Earth’s time. The probe’s clock records the proper time √(−Δs²)/c, which is less.' }, { value: Math.sqrt(T * T + D_PROXIMA ** 2), feedback: 'The interval has a minus sign: Δτ² = Δt² − Δx²/c².' }],
          hints: [t`$\Delta s^2 = -${T}^2 + ${D_PROXIMA}^2$ light-years².`, t`$\Delta\tau = \sqrt{${T}^2 - ${D_PROXIMA}^2}$ years.`],
          teach: 'The proper time of a coasting trip is √(−Δs²)/c — the interval between launch and arrival.',
          explain: t`$\Delta\tau = \sqrt{${T * T} - ${nice(D_PROXIMA ** 2)}} = ${fmt(tau, 3)}$ years, against ${T} years on Earth. The probe moved at ${fmt(D_PROXIMA / T, 3)}c.`,
          visual: spacetimeSketch({ events: [[0, 0, 'launch'], [T, D_PROXIMA, 'arrival']], segments: [[0, 0, T, D_PROXIMA, 'gold'], [0, D_PROXIMA, T * 1.2, D_PROXIMA, 'ink3', true]], range: Math.max(5, Math.ceil(T / 1.3)), caption: 'Gold: the probe’s worldline. Dashed grey: Proxima Centauri, at rest 4.24 light-years away. Years and light-years.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 1 and 3', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Carroll, Lecture Notes on GR, §1.2', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'ATLAS Collaboration (2012), observation of a new particle in the search for the Higgs boson', url: 'https://arxiv.org/abs/1207.7214' },
  ],
});
