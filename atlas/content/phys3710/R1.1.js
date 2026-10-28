// Events, worldlines and the light cone — the causal structure every
// observer agrees on. Builds on gr.S03.i (diagrams, cones, regions) without
// repeating it: here a worldline is a curve whose tangent stays inside the
// light cone at every one of its events; the cone is the one structure no
// boost moves; causal diamonds set the window for a relay; and a rocket that
// never stops accelerating has a horizon (Rindler's), the first horizon of
// the course.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6, seg, label, st, rocketCurve, YEAR, C, g0 } from './_geom.js';

const t = String.raw;
const CG = C / g0 / YEAR;                 // c/g in years, c²/g in light-years
const EX = { A: 1.5, ts: 100 / 365.25 };  // worked example: 1.5 g, a message sent after 100 days
EX.s = CG / EX.A;                          // c/α in years
EX.t = EX.ts * (2 * EX.s - EX.ts) / (2 * (EX.s - EX.ts));   // Earth time the message catches the probe
EX.x = Math.sqrt(EX.s * EX.s + EX.t * EX.t) - EX.s;

/** A rocket that accelerates forever (scale s = c/α in years): worldline, its asymptote, Earth, and optional light signals. */
function horizonPicture({ s, top, signals = [], numbers = true, caption }) {
  const right = top * 0.95;
  const phiMax = Math.asinh(top / s);
  return st({
    x: [-0.12 * right, right], t: [-0.04 * top, top], numbers,
    lines: [
      { pts: [[0, 0], [0, top]], color: 'accent', width: 2.2, label: 'Earth', at: 0, dx: -8, dy: 0, align: 'right' },
      { pts: [[-s, 0], [top - s, top]], color: 'bad', width: 1.6, dash: true, label: 'horizon', at: 0, dx: -10, dy: 12, align: 'right' },
      ...signals.map(([ts, te]) => ({ pts: [[0, ts], [te - ts, te]], color: 'warn', width: 1.6 })),
    ],
    events: signals.map(([ts], k) => [0, ts, k === 0 ? 'sent' : '', 'warn', -8, 0, 'right']).filter((e) => e[2]),
    extra: { curves: [rocketCurve(phiMax, 'gold', s)], points: [label(s * (Math.cosh(phiMax * 0.8) - 1), s * Math.sinh(phiMax * 0.8), 'probe', 'gold', 10, 8)] },
    caption: caption ?? t`Years up, light-years across, $c = 1$. Gold: a probe that accelerates for ever. Red dashed: the asymptote of its hyperbola, a 45° light line. Light sent from Earth on or above it never catches the probe.`,
  });
}

/** A causal diamond: the future cone of A (at the origin) and the past cone of B (at time T), with a station at distance d. */
function diamond({ T, d, unit, numbers = false, caption }) {
  return st({
    x: [-0.15 * T, 0.75 * T], t: [-0.06 * T, 1.08 * T], numbers, xlabel: `distance (light-${unit})`, ylabel: `t (${unit})`,
    lines: [
      { pts: [[0, 0], [T / 2, T / 2], [0, T]], color: 'warn', width: 1.4, dash: true },
      { pts: [[0, -0.04 * T], [0, 1.06 * T]], color: 'accent', width: 2.2, label: 'Earth', at: 0, dx: -8, dy: -30, align: 'right' },
      { pts: [[d, -0.04 * T], [d, 1.06 * T]], color: 'ink3', width: 1.6, label: 'station', at: 0, dx: 8, dy: -30 },
    ],
    events: [[0, 0, 'command sent', 'accent2', -9, 10, 'right'], [0, T, 'reply needed', 'accent2', -9, -6, 'right']],
    extra: { shade: [{ fn: `min(x, ${r6(T)} - x)`, lower: `max(-x, x - ${r6(T)})`, from: 0, to: r6(T / 2), color: 'gold', alpha: 0.18 }] },
    caption: caption ?? t`The shaded diamond holds every event that the command can reach **and** that can still send an answer home in time: the overlap of one event’s future light cone and the other’s past light cone. Signal travel at exactly $c$; processing time is ignored.`,
  });
}

/** Worldlines for the "which could be a spacecraft" question. */
const candidates = {
  P: [[0, 0], [0.4, 1], [0.6, 2], [1.4, 3], [1.6, 4], [1.2, 5]],
  Q: [[2.6, 0], [3, 1.2], [4.6, 2], [4.9, 3], [5.1, 5]],
  R: [[7, 0], [7.4, 1.5], [7.6, 3.2], [7.2, 2.4], [7.3, 5]],
  S: [[-1.2, 5], [-1.8, 3.6], [-1.6, 2], [-2.4, 0.6], [-2.2, 0]],
};

export default lesson({
  id: 'phys3710.R1.1',
  title: 'Events, worldlines and the light cone',
  minutes: 11, difficulty: 2,
  intro: t`An **event** is a point of spacetime: a place at an instant. A particle’s history is a curve through events, its **worldline**, and the light cone at each event says which way the curve may go. Light from an event spreads along the cone

$$(x - x_0)^2 + (y - y_0)^2 + (z - z_0)^2 = (t - t_0)^2 \qquad (c = 1)$$

Anything with mass moves slower than light, so **its worldline stays inside the light cone of every one of its own events**: on a diagram it is everywhere steeper than 45°, though it may curve. Because light has the same speed for every observer, a boost tilts axes and lines of “now” but never moves a light cone: **the cones are the one structure all observers draw alike**, and they decide what can cause what. You met cones and the three regions around an event in [Spacetime diagrams and light cones](#/lesson/gr.S03.i). Here: reading worldlines, the region two events share, and a horizon that needs no black hole.`,
  symbols: [
    { tex: '(t_0, x_0, y_0, z_0)', text: 'the event whose light cone this is: its time in years and its position in light-years' },
    { tex: '(t, x, y, z)', text: 'any event on the cone: light that left the first event can be there' },
    { tex: 'c = 1', text: t`light-years and years, so light covers one unit of distance per unit of time and the cone’s sides lie at 45°` },
  ],
  why: 'Horizons — of accelerating rockets, black holes and the expanding universe — are all statements about light cones: which events can never send a signal to which others.',
  visual: {
    type: 'spacetime',
    title: 'The one thing a boost cannot move',
    lead: t`Black axes are yours; gold ones belong to an observer moving at $\beta$. Drag $\beta$ and watch the gold axes and the gold lines of “now” swing. The dashed light cone through the origin stays exactly where it is. Drag event E around and read its time $t'$ for the moving observer.`,
    tasks: [
      'Put E inside the upper light cone and sweep β from −0.95 to 0.95: t′ of E stays positive for every observer.',
      'Now drag E outside the cone, beside O: some observers find E before O, others after — and one finds them simultaneous.',
      'Put E on the 45° line: E is lightlike from O for everyone, whatever β.',
    ],
    params: { beta: 0.4, events: [[0, 0], [3, 1.5]], names: ['O', 'E'], range: 5, simultaneity: true, hyperbolae: false },
    caption: t`Units with $c = 1$. The readout gives each event’s coordinates in both frames. However the frames tilt, the dashed cone stays put: every inertial observer agrees on where light goes.`,
  },
  example: {
    prompt: t`A probe leaves Earth at $t = 0$ with a steady proper acceleration of $1.5g$ and never shuts its engine off. Its worldline is $x = \sqrt{s^2 + t^2} - s$ with $s = c/\alpha$ (years and light-years). (a) After what Earth time can no message from Earth ever reach it? (b) A message sent at $t = 100$ days: when does it catch the probe?`,
    visual: horizonPicture({ s: EX.s, top: 1.6, signals: [[EX.ts, EX.t]] }),
    steps: [
      { label: 'The worldline', text: t`$(x + s)^2 - t^2 = s^2$ is a hyperbola. For large $t$ it hugs the straight line $x = t - s$: a 45° light line that leaves $x = 0$ at $t = s$. The probe’s speed approaches 1 but never reaches it, so it never crosses that line.` },
      { label: 'Light from Earth', text: t`A message sent at $t_s$ travels along $x = t - t_s$, parallel to the asymptote. If $t_s < s$ it starts below the asymptote and must cross the hyperbola; if $t_s \ge s$ it runs alongside or above it for ever.` },
      { label: 'The number', text: t`$s = c/\alpha = ${fmt(CG, 4)}/1.5 = ${fmt(EX.s, 4)}$ years $= ${nice(EX.s * 365.25, 4)}$ days. Messages sent after day ${Math.round(EX.s * 365.25)} never arrive while the engine runs: the asymptote is a **horizon** for the probe.` },
      { label: 'A message that makes it', text: t`Set $t - t_s = \sqrt{s^2 + t^2} - s$ and square: $t = \dfrac{t_s(2s - t_s)}{2(s - t_s)}$. With $t_s = 100$ days $= ${fmt(EX.ts, 4)}$ yr: $t = ${fmt(EX.t, 4)}$ yr $= ${nice(EX.t * 365.25, 4)}$ days, when the probe is ${fmt(EX.x, 3)} light-years out.` },
      { label: 'Sense check', text: t`The horizon is one-way: the probe’s own signals still reach Earth, since its future light cone always crosses Earth’s worldline. And it lives in flat spacetime — no gravity anywhere. Horizons belong to light cones and worldlines; a black hole’s is the same idea in curved spacetime.` },
    ],
    answer: t`(a) After $c/\alpha = ${nice(EX.s * 365.25, 4)}$ days of Earth time. (b) It catches the probe on day ${nice(EX.t * 365.25, 4)}.`,
  },
  practice: [
    mcq({
      id: 'possible-worldline', difficulty: 1,
      prompt: 'Four curves are drawn on a spacetime diagram (c = 1, time up). Which could be the worldline of a spacecraft?',
      visual: st({
        x: [-3, 8.5], t: [-0.3, 5.5], numbers: false, aspect: 'wide',
        lines: Object.entries(candidates).map(([name, pts]) => ({ pts, color: { P: 'gold', Q: 'violet', R: 'teal', S: 'accent' }[name], label: name, at: 0, dx: 10, dy: 4 })),
        extra: { curves: [seg(-3, 4.5, -2, 5.5, 'warn', 1.2, true), seg(-1, 4.5, -2, 5.5, 'warn', 1.2, true)] },
        caption: t`Four candidate worldlines, time up and space across with $c = 1$. The short dashed pair at the top left shows the 45° slope of light.`,
      }),
      choices: ['P', 'Q', 'R', 'S'],
      answer: 0,
      why: {
        1: 'Between t = 1.2 and t = 2, Q climbs only 0.8 while moving 1.6 across: slope below 45°, faster than light.',
        2: 'R turns back in time between t = 3.2 and t = 2.4: no physical object’s clock runs backward.',
        3: 'S is fine in shape, but read it from the bottom: between t = 0 and t = 0.6 it moves 0.2 across, then between 0.6 and 2 it moves 0.8 in 1.4 — all slower than light. Look again: S is drawn steeper than 45° everywhere except from t = 0.6 to 2? Check each segment’s slope.',
      },
      hints: ['A massive body moves slower than light at every moment: every piece of its worldline must be steeper than the 45° light lines.', 'Check each straight piece: time climbed must exceed distance moved.'],
      teach: 'A worldline of anything with mass is timelike everywhere: steeper than 45° at every event, and always climbing in time.',
      explain: 'P climbs more than it moves on every piece — it speeds up, slows and turns, but never reaches light speed. Q has a faster-than-light stretch, R runs backward in time, and S has a stretch flatter than 45°.',
    }),
    num({
      id: 'when-speed', difficulty: 2,
      gen(r) {
        const s = r.pick([1, 2, 0.5]);
        const [b, bs, gb] = r.pick([[0.6, '0.6', 0.75], [0.8, '0.8', 4 / 3], [0.28, '0.28', 7 / 24], [12 / 13, t`\tfrac{12}{13}`, 2.4]]);
        const ans = s * gb;
        return {
          prompt: t`A ship’s worldline is $x = \sqrt{${s}^2 + t^2} - ${s}$ (years and light-years, $c = 1$). At what Earth time $t$ does it move at $${bs}c$? (Its speed is the slope $dx/dt$.)`,
          visual: st({ x: [-0.3 * s, 3 * s], t: [-0.1 * s, 3.2 * s], cones: [[0, 0, 'future']], lines: [{ pts: [[0, 0], [0, 3.1 * s]], color: 'accent', width: 2, label: 'Earth', at: 0, dx: -8, dy: -40, align: 'right' }],
            extra: { curves: [rocketCurve(Math.asinh(3.15), 'gold', s)] }, caption: t`The ship’s worldline (gold), years up and light-years across. It leaves at rest and tilts toward 45° without reaching it.` }),
          answer: ans, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: s * b, feedback: t`Setting $t = s\beta$ treats the speed as growing linearly. Solve $t/\sqrt{s^2 + t^2} = \beta$ instead.` }],
          hints: [t`$dx/dt = \dfrac{t}{\sqrt{${s}^2 + t^2}}$.`, t`Set it equal to $\beta$ and solve: $t = ${s}\,\beta/\sqrt{1 - \beta^2} = ${s}\,\gamma\beta$.`],
          teach: 'Speed on a spacetime diagram is the inverse slope dx/dt of the worldline; on this hyperbola it is t/√(s² + t²).',
          explain: t`$t = ${s}\times${fmt(gb, 4)} = ${fmt(ans, 4)}$ years: $\gamma\beta = \beta/\sqrt{1 - \beta^2} = ${fmt(gb, 4)}$ at $\beta = ${bs}$. This is the constant-acceleration worldline of lesson R0.2, with $s = c/\alpha$.`,
        };
      },
    }),
    multi({
      id: 'two-plus-one', difficulty: 2,
      prompt: t`With two directions of space, an event O at the origin and four events at $(t, x, y)$ in years and light-years: P $= (5, 3, 4)$, Q $= (5, 2, 3)$, R $= (4, 3, 3)$ and S $= (-6, 2, -5)$. Which can be affected by something that happens at O? Select every one.`,
      visual: st({ x: [-0.5, 7], t: [-7, 7], xlabel: 'distance from O, √(x² + y²) (light-years)', ylabel: 't (years)', cones: [[0, 0, 'both']], numbers: true, aspect: 'square',
        caption: t`A slice through O’s light cone: distance from O across, time up. In 2 + 1 dimensions the cone is a real cone; every direction around O looks like this slice. Place each event by computing its distance $\sqrt{x^2 + y^2}$.` }),
      choices: ['P', 'Q', 'R', 'S'],
      answer: [0, 1],
      why: { 2: t`R is $\sqrt{18} = 4.24$ light-years from O but only 4 years later: outside the cone, so no signal can get there in time.`, 3: 'S is inside O’s cone but in the past (t = −6): it could have affected O, not the other way round.' },
      hints: [t`Compute each distance $\sqrt{x^2 + y^2}$ and compare it with $t$.`, 'O can affect events with t > 0 and distance ≤ t (on the cone counts: light itself).'],
      teach: 'An event can affect only what lies on or inside its future light cone: distance ≤ c × (time later).',
      explain: t`P: distance 5 in 5 years — exactly on the cone, reachable by light. Q: $\sqrt{13} = 3.61 < 5$, inside. R: $\sqrt{18} = 4.24 > 4$, outside. S: inside the **past** cone (distance $\sqrt{29} = 5.39 < 6$), so S could have influenced O.`,
    }),
    num({
      id: 'relay-window', difficulty: 2,
      gen(r) {
        const [d, T] = r.pick([[12.5, 40], [5.5, 30], [20.1, 55], [9, 25]]);
        const ans = T - 2 * d;
        return {
          prompt: t`Mission control sends a command to a Mars lander and needs its reply within ${T} minutes of sending. Mars is ${d} light-minutes away today. For how long can the lander work on the command before it must transmit?`,
          visual: diamond({ T, d, unit: 'minutes' }),
          answer: ans, units: 'min', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: T - d, feedback: 'The signal must cross twice: out to Mars and back again.' }],
          hints: ['The command arrives one light-travel time after it is sent.', t`The reply must leave one light-travel time before the deadline: the window is $T - 2d/c$.`],
          teach: 'The events both caused by A and able to affect B form a diamond: a station at distance d gets a window of T − 2d/c.',
          explain: t`The command arrives at $t = ${d}$ min; the reply must leave by $${T} - ${d} = ${nice(T - d)}$ min. Window: $${nice(ans)}$ minutes — the height of the station’s line inside the diamond.`,
        };
      },
    }),
    num({
      id: 'horizon-day', difficulty: 2,
      gen(r) {
        const A = r.pick([0.5, 2, 3]);
        const ans = (CG / A) * 365.25;
        return {
          prompt: t`A probe leaves Earth at a steady proper acceleration of $${A}g$ and keeps accelerating for ever. After how many days of Earth time will no radio message from Earth ever reach it? ($c/g = ${fmt(CG, 4)}$ years.)`,
          visual: horizonPicture({ s: CG / A, top: 2.6 * (CG / A), numbers: false }),
          answer: ans, units: 'day', tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`The asymptote leaves Earth at $t = c/\alpha$, not $2c/\alpha$.` }],
          hints: [t`The probe’s worldline approaches the light line $x = t - c/\alpha$.`, t`Light sent at or after $t = c/\alpha$ runs parallel to that line and never catches up: $c/\alpha = ${fmt(CG, 4)}/${A}$ yr.`],
          teach: 'A forever-accelerating observer has a horizon: light sent from home after c/α never reaches it.',
          explain: t`$c/\alpha = ${fmt(CG / A, 4)}$ yr $= ${nice(ans, 4)}$ days. ${A > 1 ? 'A harder push makes the horizon come sooner.' : 'A gentler push leaves the door open longer.'}`,
        };
      },
    }),
    mcq({
      id: 'agree', difficulty: 2,
      prompt: 'Two inertial observers pass each other at event O. Which of these do they necessarily draw the same way on a spacetime diagram?',
      visual: { type: 'spacetime', params: { beta: 0.6, events: [[0, 0], [2, 3]], names: ['O', 'E'], range: 5, simultaneity: true, hyperbolae: false }, caption: 'Black axes: one observer. Gold: the other, moving at 0.6c. Dashed: light.' },
      choices: ['The light cone of O', 'The set of events simultaneous with O', 'The time axis through O', 'The distance from O to E'],
      answer: 0,
      why: {
        1: 'Each observer’s line of “now” through O tilts with their velocity — that is the relativity of simultaneity.',
        2: 'Each observer’s time axis is their own worldline; they differ.',
        3: 'Spatial distance depends on what each calls simultaneous, so it differs too.',
      },
      hints: ['Which speed is the same for every inertial observer?'],
      teach: 'Light cones are invariant: every observer agrees which events are inside, on and outside them.',
      explain: 'Both measure light at speed c, so both put the light cone of O in the same place. Everything defined by “now” — simultaneity, distances, time axes — differs between them.',
    }),
    mcq({
      id: 'what-you-see', difficulty: 2,
      prompt: 'You look up at the night sky at event O. The light entering your eye now comes from which events?',
      visual: st({ x: [-6, 6], t: [-6.5, 1.5], cones: [[0, 0, 'past']], numbers: false, aspect: 'wide',
        lines: [{ pts: [[-4, -6.5], [-4, 1.5]], color: 'ink3', width: 1.6, label: 'a star', at: 0, dx: -8, dy: -30, align: 'right' }, { pts: [[2.5, -6.5], [2.5, 1.5]], color: 'ink3', width: 1.6, label: 'another star', at: 0, dx: 8, dy: -30 }],
        events: [[0, 0, 'you, now', 'accent2', 9, -6]], caption: 'You at O, two stars at rest, time up. Dashed: the light cone of O, drawn into the past.' }),
      choices: ['Events on your past light cone', 'Events happening at the same moment as O', 'All events inside your past light cone', 'Events on your future light cone'],
      answer: 0,
      why: {
        1: 'Light from a star “now” has not reached you yet; “now” at a distance is not even agreed between observers.',
        2: 'Events inside the past cone could have sent you slower signals, but the light arriving now left from the cone’s surface.',
        3: 'Light from O goes out along the future cone; you receive along the past one.',
      },
      hints: ['Light travels at 45° on the diagram. Trace it backward from your eye.'],
      teach: 'What you see is your past light cone: every image is as old as its light-travel time.',
      explain: 'Each star is seen where its worldline crosses your past light cone — the nearer star as it was a few years ago, the farther one longer ago. A telescope is a machine for sampling the past light cone.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-behind', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([1, 1.5, 0.75]);
        const ans = CG / A;
        return {
          prompt: t`A ship starts from rest at $t = 0$ and accelerates at a steady $${A}g$ for ever. At launch, a line of navigation beacons stretches out **behind** it. How far behind the ship, in light-years, must a beacon be for none of its flashes ever to reach the ship? ($c^2/g = ${fmt(CG, 4)}$ ly.)`,
          visual: horizonPicture({ s: CG / A, top: 2.4 * (CG / A), numbers: false, caption: t`Years up, light-years across, $c = 1$; the ship (gold) starts at the origin. Red: the horizon, the 45° line its worldline approaches. A beacon behind the ship sits at negative $x$.` }),
          answer: ans, units: 'ly', tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`The horizon line meets $t = 0$ at $x = -c^2/\alpha$.` }],
          hints: [t`The asymptote is $x = t - c^2/\alpha$: at $t = 0$ it sits at $x = -c^2/\alpha$.`, 'A beacon on or beyond that point sends light that runs along or behind the horizon.'],
          teach: 'An accelerating observer’s horizon lies a distance c²/α behind it at the start: events beyond can never signal it.',
          explain: t`$c^2/\alpha = ${fmt(ans, 4)}$ light-years. Beacons nearer than that can still be seen (their light catches up); those at or beyond it never are, while the ship keeps accelerating.`,
        };
      },
    }),
    num({
      id: 'cp-juno', difficulty: 2, transfer: true,
      gen(r) {
        const [d, T] = r.pick([[45, 120], [38, 90], [50, 150]]);
        const ans = T - 2 * d;
        return {
          prompt: t`Engineers command the Juno spacecraft at Jupiter, ${d} light-minutes away, and must hear its acknowledgement within ${T} minutes of sending. How many minutes can Juno take to respond?`,
          visual: diamond({ T, d, unit: 'minutes' }),
          answer: ans, units: 'min', tol: { rel: 0, abs: 0.05 },
          hints: ['Out and back both take the light-travel time.'],
          teach: 'The response window is the deadline minus the round-trip light time.',
          explain: t`$${T} - 2\times${d} = ${ans}$ minutes.`,
        };
      },
    }),
    mcq({
      id: 'cp-supernova', difficulty: 2,
      prompt: 'Supernova 1987A was seen on 23 February 1987. It lies about 168 000 light-years away. Which statement is right, in the frame of the Earth and that galaxy?',
      visual: st({ x: [-1.2, 20], t: [-19, 2], xlabel: 'distance (10 000 light-years)', ylabel: 't (10 000 years)', cones: [[0, 0, 'past']], numbers: true, aspect: 'wide',
        lines: [{ pts: [[16.8, -19], [16.8, 2]], color: 'ink3', width: 1.6, label: 'the star', at: 0, dx: -8, dy: -20, align: 'right' }],
        events: [[0, 0, 'seen, 1987', 'accent2', 9, 12]], caption: 'Distance in units of 10 000 light-years, time in units of 10 000 years; dashed: the past light cone of the sighting.' }),
      choices: ['The star exploded about 168 000 years before 1987, at the event where its worldline meets our past light cone', 'The star exploded in 1987', 'We cannot say when it exploded, since simultaneity is relative', 'The light we saw left the star after the explosion was over, so it shows nothing about it'],
      answer: 0,
      why: {
        1: 'That would require light to cross 168 000 light-years instantly.',
        2: 'Simultaneity is relative between frames, but in one stated frame the date follows from the distance and the light-travel time.',
        3: 'The light left at the explosion; that is why we saw the explosion itself.',
      },
      hints: ['Where does the star’s worldline cross the dashed line?'],
      teach: 'Sightings sit on the past light cone: an event seen now at distance D happened D/c earlier, in the frame where the source is at rest.',
      explain: 'The explosion lies on our past light cone. In the frame of the Earth and the Large Magellanic Cloud (their relative motion barely matters) it happened about 168 000 years before 1987 — the sighting was news from the Ice Age.',
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, ch. 4 (special relativity: spacetime diagrams, light cones)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 6 (regions of spacetime)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Rindler, Relativity: Special, General, and Cosmological (2nd ed.), §3.7–3.8 (hyperbolic motion)', url: 'https://global.oup.com/academic/product/relativity-9780198567325' },
  ],
});
