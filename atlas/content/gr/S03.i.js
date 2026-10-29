// Spacetime diagrams and light cones — Intuition Mode.
// Units on every diagram: years and light-years (c = 1), so light runs at 45°.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { boost } from '../../src/viz/model/relativity.js';
import { spacetimeSketch } from './_foundations.js';

const t = String.raw;

const C = 299792458;              // m/s
const AU = 1.495978707e11;        // m

// the worked example: a star at x = 0 explodes (A); an alarm on Earth, 4 ly away, two years later (B)
const EX = { tB: 2, xB: 4, beta: 0.6 };
const [EX_TP] = boost(EX.tB, EX.xB, EX.beta);          // B’s time for a ship moving at +0.6c: −0.5 yr

// a spacetime diagram with A at the origin and B at (dt, dx)
const diagram = (dt, dx, extra = {}) => ({
  type: 'spacetime',
  params: { beta: 0, events: [[0, 0], [dt, dx]], simultaneity: false, hyperbolae: false, range: 5, ...extra },
  caption: 'Time in years up the page, distance in light-years across ($c = 1$): light runs along the dashed 45° lines through A.',
});

// classification of B relative to A, for the cone question
const CLASSES = {
  future: { answer: 0, cases: [[3, 1], [4, -2], [2.5, 1.5], [3, -0.5]] },
  null: { answer: 1, cases: [[3, 3], [2, -2], [4, 4], [1.5, -1.5]] },
  space: { answer: 2, cases: [[1, 3], [2, -4], [1.5, 2.5], [0.5, -3]] },
  past: { answer: 3, cases: [[-1.5, 0.5], [-2, -1], [-1, 0.5], [-1.8, 1]] },
};

export default lesson({
  id: 'gr.S03.i',
  title: 'Spacetime diagrams and light cones',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`A **spacetime diagram** draws time going up the page and one direction of space across it. Each point is an **event** — a place at a moment: a firecracker bursting, a clock ticking. A thing’s whole history is a line, its **worldline**: standing still is a vertical line, moving is a tilted one. Measure time in years and distance in light-years, so that $c = 1$, and light runs at exactly 45°.

A flash of light from an event spreads out at speed $c$. With two directions of space, the flash after time $t$ is a circle $x^2 + y^2 = c^2t^2$; stack the circles up in time and they make a cone — the event’s **light cone**. On a diagram with one direction of space it is the pair of 45° lines $x = \pm ct$. **Everything an event can ever influence lies inside its future cone**; everything that could have influenced it lies inside its past cone. Events outside cannot affect each other at all — and observers moving differently even disagree about which of them came first.`,
  equation: t`x^2 + y^2 = c^2t^2`,
  symbols: [
    { tex: 'x,\\ y', text: 'two directions of space, measured from where the flash goes off (metres, or light-years)' },
    { tex: 't', text: 'the time since the flash (seconds, or years)' },
    { tex: 'c', text: t`the speed of light; in years and light-years $c = 1$, so the cone’s sides are at 45°` },
    { tex: 'ct', text: t`time turned into a distance: how far light gets in time $t$ — the radius of the flash at that moment` },
  ],
  why: 'Light cones are the skeleton of every later diagram: at a black hole’s horizon the outward edge of the light cone stops gaining ground, and inside it every future direction leads inward.',
  visual: {
    type: 'spacetime',
    title: 'Events, worldlines and the light cone of A',
    lead: t`Event A sits at the origin; its light cone is the pair of dashed 45° lines. Drag event B. The gold axes belong to a second observer moving at the speed set by the slider, and the gold dashed lines join events that observer calls simultaneous.`,
    tasks: [
      'Drag B outside the light cone: the separation becomes spacelike — nothing from A can reach B.',
      'With B outside the cone, move the slider: for some speeds B’s time t′ goes negative — that observer says B happened first.',
      'Put B inside the cone and try every speed: t′ of B never goes negative. Cause stays before effect.',
    ],
    params: { beta: 0.3, events: [[0, 0], [2.5, 1.5]], simultaneity: true, hyperbolae: false, range: 5 },
    caption: t`Units: years and light-years, so $c = 1$ and light runs at 45°. The second observer’s gold dots mark one year and one light-year of *their* time and distance — spaced wider on the page because diagram lengths are not measured with a ruler (step 4 shows how they are).`,
  },
  example: {
    prompt: t`In Earth’s frame, a star ${EX.xB} light-years away explodes at the start of 2030 (event A). At the start of ${2030 + EX.tB} an alarm sounds on Earth (event B). Could the explosion have caused the alarm? What is the earliest event on Earth that the explosion could cause?`,
    visual: {
      type: 'spacetime',
      params: { beta: EX.beta, events: [[0, 0], [EX.tB, EX.xB]], simultaneity: true, hyperbolae: false, range: 5 },
      caption: t`A is the explosion at the origin; B is the alarm, ${EX.tB} years later and ${EX.xB} light-years away. Gold: a ship moving at $${EX.beta}c$ from the star toward Earth.`,
    },
    steps: [
      { label: 'Place the events', text: t`Put A at $(t, x) = (0, 0)$ and B at $(${EX.tB}\ \text{yr}, ${EX.xB}\ \text{ly})$. Earth sits still at $x = ${EX.xB}$, so its worldline is the vertical line through B.` },
      { label: 'Draw A’s light cone', text: t`Light from A reaches $x = ${EX.xB}$ light-years at $t = ${EX.xB}$ years. B, at $t = ${EX.tB}$, is below that: $|\Delta x| = ${EX.xB}\ \text{ly} > c\,\Delta t = ${EX.tB}\ \text{ly}$, so B lies **outside** A’s light cone.` },
      { label: 'No cause', text: t`No signal — light, radio, a gravitational wave — can carry anything from A to B in time. The explosion cannot have set off the alarm.` },
      { label: 'Who says what came first', text: t`For a ship moving at $${EX.beta}c$ from the star toward Earth, B happens at $t' = ${nice(EX_TP)}$ years — *before* the explosion (read B’s $t'$ in the diagram’s readout). Observers may disagree about the order only because no influence links the two events.` },
      { label: 'The earliest effect', text: t`A’s light reaches Earth at the start of ${2030 + EX.xB}: that event lies on A’s light cone. Every later event on Earth’s worldline lies inside it and could be affected.` },
    ],
    answer: t`No: B lies outside A’s light cone. The earliest Earth event the explosion can affect is at the start of ${2030 + EX.xB}, when its light arrives.`,
  },
  practice: [
    num({
      id: 'worldline-speed', difficulty: 1,
      gen(r) {
        const [dt, dx] = r.pick([[5, 3], [5, 4], [4, 1], [6, 3], [2.5, 2], [5, -2]]);
        const v = Math.abs(dx) / dt;
        return {
          prompt: t`A spacecraft’s worldline runs straight from A at $(t, x) = (0, 0)$ to B at $(${dt}\ \text{yr}, ${dx}\ \text{ly})$. How fast does it move, as a fraction of $c$?`,
          answer: v, tol: { rel: 0.005 },
          errors: [{ value: dt / Math.abs(dx), feedback: 'Speed is distance over time: Δx/Δt, not Δt/Δx. A speed above 1 would beat light.' }],
          hints: ['Speed = distance covered ÷ time taken.', t`In light-years per year, $v = |\Delta x|/\Delta t = ${Math.abs(dx)}/${dt}$ — already a fraction of $c$.`],
          teach: 'On a diagram in years and light-years, a worldline’s speed is its horizontal step over its vertical step; light’s is 1.',
          explain: t`$v = ${Math.abs(dx)}\ \text{ly} / ${dt}\ \text{yr} = ${nice(v)}c$. The worldline is tilted from vertical, but less than the 45° of light.`,
          visual: diagram(dt, dx),
        };
      },
    }),
    mcq({
      id: 'which-region', difficulty: 2,
      gen(r) {
        const kind = r.pick(['future', 'null', 'space', 'past']);
        const [dt, dx] = r.pick(CLASSES[kind].cases);
        return {
          prompt: t`Event B happens ${Math.abs(dt)} ${Math.abs(dt) === 1 ? 'year' : 'years'} ${dt >= 0 ? 'after' : 'before'} event A, ${Math.abs(dx)} ${Math.abs(dx) === 1 ? 'light-year' : 'light-years'} away from it. Where does B lie relative to A’s light cone?`,
          answer: CLASSES[kind].answer,
          visual: spacetimeSketch({ events: [[0, 0, 'A'], [dt, dx, 'B']] }),
        };
      },
      choices: [
        'Inside A’s future light cone: a signal slower than light could carry an influence from A to B',
        'On A’s light cone: only a flash of light could connect them',
        'Outside A’s light cone: neither event can affect the other',
        'Inside A’s past light cone: B could have influenced A',
      ],
      why: {
        0: 'The future cone needs B later than A and |Δx| smaller than the light-years light covers in Δt.',
        1: 'On the cone means |Δx| equals cΔt exactly — light covers the gap with no time to spare.',
        2: 'Outside the cone means |Δx| is larger than c|Δt|: the gap is too wide for light to cross in the time available.',
        3: 'The past cone needs B earlier than A, with |Δx| smaller than c|Δt|.',
      },
      hints: ['Compare the distance |Δx| with how far light gets in the time between them, c|Δt|.', 'Which event comes first? A cone has a future half and a past half.'],
      teach: 'Compare |Δx| with c|Δt|: smaller means inside a cone (future or past), equal means on it, larger means outside it.',
      explain: 'Light covers c|Δt| light-years in |Δt| years. If B is closer than that, it lies inside A’s cone — the future half if B is later, the past half if earlier. If B is farther, no signal can link them.',
    }),
    num({
      id: 'simultaneous-line', difficulty: 2,
      gen(r) {
        const v = r.pick([0.25, 0.5, 0.6, 0.75]), x = r.pick([2, 3, 4]);
        return {
          prompt: t`A ship moves at $${v}c$ in the $+x$ direction. On a diagram in years and light-years, the events it calls simultaneous with A (at the origin) lie on a line through A that tilts up with slope $v/c = ${v}$ — the ship’s own space axis, the gold line $x'$. Event B at $x = ${x}$ light-years is simultaneous with A for the ship. At what Earth time $t$ does B happen?`,
          answer: v * x, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: x / v, feedback: 'The line rises by v/c for each light-year across: t = (v/c)·x, not x divided by v.' }, { value: 0, feedback: 'For Earth, B is not simultaneous with A: only the ship’s line of simultaneity runs through both.' }],
          hints: ['Follow the tilted gold line through A out to the given x.', t`The line is $t = (v/c)\,x = ${v}\times${x}$ years.`],
          teach: 'A moving observer’s lines of simultaneity tilt by v/c on the diagram, so “at the same time” depends on who is asking.',
          explain: t`$t = (v/c)\,x = ${v}\times${x} = ${nice(v * x)}$ years. For Earth, B happens ${nice(v * x)} years after A; for the ship, at the same moment.`,
          visual: { type: 'spacetime', params: { beta: v, events: [[0, 0]], simultaneity: true, hyperbolae: false, range: 5 }, caption: t`Only A is marked. The tilted gold line through it — the ship’s $x'$ axis — holds every event the ship calls simultaneous with A.` },
        };
      },
    }),
    num({
      id: 'earliest', difficulty: 2,
      gen(r) {
        const [what, d] = r.pick([['the Moon, 384,400 km away', 3.844e8], ['Mars at its closest, about 56 million km away', 5.6e10], ['the Sun, 1 AU = 149.6 million km away', AU], ['Jupiter at its closest, about 590 million km away', 5.9e11]]);
        const s = d / C;
        return {
          prompt: t`An event happens on ${what}. How long afterwards (in the frame of the Earth and that body) is the earliest moment that anything on Earth can be affected by it?`,
          answer: s, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'Nothing reaches Earth instantly: the earliest influence travels at c.' }],
          hints: ['The edge of the event’s future light cone moves outward at c.', t`Time = distance ÷ $c$, with $c = 2.998\times10^8$ m/s.`],
          teach: 'The earliest an event can influence a place a distance d away is d/c later — where the light cone reaches it.',
          explain: t`$t = d/c = ${tex(d, 4)}\ \text{m} / (2.998\times10^8\ \text{m/s}) = ${fmt(s, 3)}$ s${s > 120 ? ` (${fmt(s / 60, 3)} minutes)` : ''}. Any Earth event earlier than that lies outside the light cone.`,
          visual: spacetimeSketch({
            events: [[0, 0, 'the event'], [s, d / C, 'earliest effect on Earth']],
            segments: [[-0.25 * s, d / C, 1.35 * s, d / C, 'accent2'], [0, 0, s, d / C, 'warn']],
            range: 1.25 * s, axes: false,
            caption: 'The event (at the origin), Earth’s worldline (blue) and the edge of the event’s light cone reaching it: light moves at 45°.',
          }),
        };
      },
    }),
    mcq({
      id: 'order-flip', difficulty: 2,
      prompt: 'Two events lie outside each other’s light cones. Which statement is true?',
      choices: [
        'Observers moving differently can disagree about which happened first, but neither event can influence the other',
        'Every observer agrees on which happened first',
        'One of them must have caused the other',
        'They must have happened at the same place',
      ],
      answer: 0,
      why: { 1: 'Only events inside each other’s cones have an order everyone agrees on. Outside, the order depends on the observer.', 2: 'Outside the cone no signal can link them, so neither can cause the other.', 3: 'Events at the same place are separated purely in time — inside each other’s cones.' },
      hints: ['Move B outside A’s cone in the Explore diagram and change the observer’s speed.'],
      teach: 'For events outside each other’s light cones, time order is relative — which is safe precisely because neither can affect the other.',
      explain: 'Tilting lines of simultaneity can put either event first when they lie outside each other’s cones. Since no signal connects them, no observer ever sees an effect before its cause.',
      visual: { type: 'spacetime', params: { beta: 0.5, events: [[0, 0], [1, 3]], simultaneity: true, hyperbolae: false, range: 5 }, caption: t`B lies outside A’s light cone. For the gold observer, moving at $0.5c$, B’s time $t'$ is ${nice(boost(1, 3, 0.5)[0], 3)} years — negative: B happens first.` },
    }),
    mcq({
      id: 'cause-first', difficulty: 2,
      prompt: 'Event B lies inside the future light cone of event A — for instance, A is a radio message being sent and B is it being received. Can any observer, however fast they move, find that B happened before A?',
      choices: ['No — every observer finds A before B', 'Yes, if they move fast enough toward B', 'Yes, if B is far enough from A', 'Yes, but only observers moving faster than light'],
      answer: 0,
      why: { 1: 'Speed tilts the lines of simultaneity, but never past 45°, so they can never put B before A when B is inside A’s cone.', 2: 'Distance does not matter as long as B is inside the cone.', 3: 'No observer moves at or faster than light.' },
      hints: ['Lines of simultaneity tilt, but by less than 45°. Can such a line pass below B but above A when B is inside A’s cone?'],
      teach: 'The order of events inside each other’s light cones is the same for every observer: causes come first, for everyone.',
      explain: 'Lines of simultaneity always tilt less than 45°, while B sits inside the 45° cone above A. So every observer’s “now” through A passes below B: A comes first, for everyone.',
      visual: { type: 'spacetime', params: { beta: 0.7, events: [[0, 0], [3, 2]], simultaneity: true, hyperbolae: false, range: 5 }, caption: 'Even at 0.7c the gold line of simultaneity through A passes below B.' },
    }),
    mcq({
      id: 'zigzag', difficulty: 2,
      prompt: 'Both clocks leave event A together and meet again at B. On the page the gold, bent worldline is longer than the straight blue one — yet the readout says its clock records less time. Why?',
      choices: [
        'Spacetime separations are not measured with Pythagoras: moving through space subtracts from the time a clock records',
        'The diagram is drawn to the wrong scale',
        'The travelling clock is slowed by the jolt at the turnaround',
        'Light from the travelling clock takes longer to get back to A',
      ],
      answer: 0,
      why: { 1: 'The diagram is to scale. Its geometry is what differs: lengths on the page are not the times clocks record.', 2: 'Clocks are not damaged by turning; the effect grows with the length of the legs, not the sharpness of the turn.', 3: 'Signal delays are corrected for; the clocks are compared side by side at B.' },
      hints: ['The time a clock records combines its time and distance steps with a minus sign — step 4 makes this exact.'],
      teach: 'Diagram lengths are not clock times: the straight (unaccelerated) worldline between two events records the most time.',
      explain: t`For each straight leg the recorded time is $\sqrt{\Delta t^2 - \Delta x^2}$ (years and light-years). The minus sign means sideways motion *costs* time, so the zigzag — longer on paper — records less.`,
      visual: { type: 'worldlines', params: { T: 10, tx: 3, tt: 5 } },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-flare', difficulty: 2, transfer: true,
      prompt: t`A flare erupts on the Sun, ${fmt(AU / C, 3)} light-seconds (${fmt(AU / C / 60, 3)} light-minutes) away. Five minutes later, in the Sun–Earth frame, a radio blackout begins on Earth. Could the flare’s X-rays have caused it?`,
      choices: [
        'No — the blackout lies outside the flare’s future light cone; X-rays need over 8 minutes to arrive',
        'Yes — X-rays from the Sun arrive instantly',
        'Yes — five minutes is enough for anything travelling at the speed of light',
        'It depends on how fast the observer is moving',
      ],
      answer: 0,
      why: { 1: `X-rays are light: they travel at c and take ${fmt(AU / C / 60, 2)} minutes to cross 1 AU.`, 2: `Light needs ${fmt(AU / C / 60, 2)} minutes for this trip, longer than 5.`, 3: 'Whether one event lies inside another’s light cone is the same for every observer.' },
      hints: ['Compare 5 minutes with the light travel time.'],
      teach: 'An event can only be caused by events inside its past light cone — the cone is the same for every observer.',
      explain: t`X-rays travel at $c$, taking ${fmt(AU / C / 60, 3)} minutes to reach Earth. An Earth event 5 minutes after the flare lies outside its light cone, so something else caused the blackout (or the flare happened earlier than you thought).`,
    }),
    num({
      id: 'cp-rover', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([4, 8, 12, 14, 20]);
        return {
          prompt: t`Mars is ${d} light-minutes from Earth today. Mission control sends a command to a rover, which replies the instant it arrives. What is the shortest time from sending the command to receiving the reply?`,
          answer: 2 * d, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: d, feedback: 'That is only the trip out. The reply must travel back too.' }],
          hints: ['The command rides the edge of a light cone out; the reply rides the edge of another light cone back.'],
          teach: 'A round trip at light speed takes twice the one-way light time — no faster control is possible, which is why rovers drive themselves.',
          explain: t`${d} minutes out plus ${d} minutes back: ${2 * d} minutes. On a diagram, the command and reply are two 45° lines, out and back.`,
          visual: spacetimeSketch({
            events: [[0, 0, 'command sent'], [d, d, 'rover replies'], [2 * d, 0, 'reply arrives']],
            segments: [[-0.3 * d, 0, 2.4 * d, 0, 'accent2'], [-0.3 * d, d, 2.4 * d, d, 'violet'], [0, 0, d, d, 'warn'], [d, d, 2 * d, 0, 'warn']],
            range: 1.6 * d, axes: false, cone: false,
            caption: 'Earth (blue) and Mars (violet) as worldlines; the command and the reply each travel at 45° — the speed of light. Not to scale.',
          }),
        };
      },
    }),
    num({
      id: 'cp-speed', difficulty: 2,
      gen(r) {
        const [dt, dx] = r.pick([[4, 3], [5, 1], [6, 4.5], [3, 2.4]]);
        return {
          prompt: t`A probe’s worldline on a diagram in years and light-years climbs ${dt} years for every ${dx} light-years it moves sideways. What is its speed as a fraction of $c$?`,
          answer: dx / dt, tol: { rel: 0.005 },
          errors: [{ value: dt / dx, feedback: 'Speed is the sideways step divided by the time step.' }],
          hints: ['Speed = distance ÷ time.'],
          teach: 'A worldline’s speed is Δx/Δt; on a diagram with c = 1, light’s worldline has speed 1.',
          explain: t`$v = ${dx}/${dt} = ${nice(dx / dt)}c$.`,
          visual: diagram(dt, dx),
        };
      },
    }),
  ],
  sources: [
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 2–6', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 1', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 4', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
