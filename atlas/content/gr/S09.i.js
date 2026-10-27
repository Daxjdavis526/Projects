// Proper time — Intuition Mode.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;

// A spacetime diagram with c = 1 (x in light-years, t in years). paths: worldlines
// as point lists (each leg an arrow; leg labelLeg, by default the last, carries
// the label at its tip); cones: events
// whose future (or, with past: true, past) light cone is drawn dashed.
function diagram({ x, t: tr, paths = [], events = [], cones = [], vlines = [], caption }) {
  const span = 2 * (tr[1] - tr[0]);
  const curves = cones.flatMap(({ at: [x0, t0], past }) => {
    const s = past ? -1 : 1;
    return [
      { fn: `(${t0}) + ${s}*(x - (${x0}))`, domain: [x0, x0 + span], color: 'warn', dash: [5, 5], width: 1 },
      { fn: `(${t0}) - ${s}*(x - (${x0}))`, domain: [x0 - span, x0], color: 'warn', dash: [5, 5], width: 1 },
    ];
  });
  const arrows = paths.flatMap(({ pts, color, label, labelDx, labelDy, labelAlign, labelLeg = pts.length - 2 }) => pts.slice(1).map((p, k) => ({
    from: pts[k], to: p, color, ...(k === labelLeg && label ? { label, labelDx, labelDy, labelAlign } : {}),
  })));
  const points = events.map(([ex, et, label, dx, dy]) => ({ x: ex, y: et, label, color: 'ink2', labelDx: dx, labelDy: dy }));
  return {
    type: 'graph', params: { x, y: tr, equal: true, aspect: 'square', xlabel: 'x (light-years)', ylabel: 't (years)', axesAt: 'edge', curves, arrows, points, vlines },
    caption: caption || t`A spacetime diagram with $c = 1$: time runs up the page, and light travels along the dashed 45° lines.`,
  };
}

export default lesson({
  id: 'gr.S09.i',
  title: 'Proper time: the time your own clock keeps',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`Every clock measures the time along its own path through spacetime — its **proper time**. Two clocks that separate and later meet again can disagree about how much time has passed, and the disagreement is real: it is the *length* of their worldlines, measured with spacetime's geometry. For a clock moving at speed $v$ (with $c = 1$):

$$d\tau^2 = dt^2 - dx^2$$

The minus sign changes everything. In space, a straight line is the *shortest* path; in spacetime, the straight worldline — free, unaccelerated motion — has the *most* proper time.`,
  equation: t`\Delta\tau = \Delta t\,\sqrt{1 - v^2/c^2}`,
  symbols: [
    { tex: '\\tau', text: 'proper time: what a clock carried along the path reads' },
    { tex: 't', text: 'coordinate time: the time in the frame you are describing things from' },
    { tex: 'x', text: 'position in that frame; with $c = 1$, distance in light-years when time is in years' },
    { tex: 'v', text: 'the clock’s speed in that frame, as a fraction of $c$' },
    { tex: 'c', text: 'the speed of light; setting $c = 1$ just picks units where light moves at 45° on a diagram' },
  ],
  why: 'This is the idea general relativity is built on: gravity will turn out to be the statement that free-falling clocks follow paths of maximal proper time through curved spacetime.',
  visual: {
    type: 'worldlines',
    title: 'Two clocks, one reunion',
    lead: t`The blue clock stays home. Drag the gold traveller's turnaround and compare the tick marks: each tick is one year *of that clock's own time*.`,
    tasks: ['Drag the turnaround toward a light cone: the traveller ages less and less.', 'Put the turnaround on the time axis: both clocks agree.'],
  },
  example: {
    prompt: t`A twin flies to a star 4 light-years away at $0.8c$ and immediately returns at the same speed. How much time passes for each twin?`,
    steps: [
      { label: 'Earth’s clock', text: t`Distance there and back is 8 ly at 0.8 ly/yr: $\Delta t = 8/0.8 = 10$ years.` },
      { label: 'One leg for the traveller', text: t`Each leg lasts $5$ years of Earth time and covers 4 ly: $\Delta\tau = \sqrt{5^2 - 4^2} = 3$ years.` },
      { label: 'Total', text: t`The traveller ages $2 \times 3 = 6$ years; the stay-at-home twin ages 10.` },
      { label: 'Why it is not symmetric', text: t`Only the stay-at-home twin's worldline is straight. The traveller's has a corner — the turnaround — and bent worldlines always carry less proper time.` },
    ],
    answer: t`Home: 10 years. Traveller: 6 years.`,
  },
  practice: [
    num({
      id: 'dilated', difficulty: 1,
      gen(r) {
        const [v, f] = r.pick([[0.6, 0.8], [0.8, 0.6], [0.28, 0.96], [0.96, 0.28]]);
        const T = r.pick([5, 10, 20, 25, 50]);
        return {
          prompt: t`A spacecraft coasts at $${v}c$ past Earth. During ${T} years of Earth time, how much time passes on the spacecraft's clock?`,
          visual: diagram({ x: [-0.3 * T, 1.15 * T], t: [-0.06 * T, 1.12 * T], cones: [{ at: [0, 0] }],
            paths: [{ pts: [[0, 0], [0, T]], color: 'accent', label: 'Earth' }, { pts: [[0, 0], [v * T, T]], color: 'gold', label: 'spacecraft' }] }),
          answer: T * f, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: T / f, feedback: 'That is longer, not shorter: moving clocks accumulate less proper time, so multiply by √(1 − v²).' }],
          hints: [t`Use $\Delta\tau = \Delta t\sqrt{1 - v^2}$ with $v$ as a fraction of $c$.`, t`$\sqrt{1 - ${v}^2} = ${f}$.`],
          teach: 'A clock moving at constant speed v records τ = t√(1 − v²/c²) of the coordinate time t.',
          explain: t`$\Delta\tau = ${T}\times\sqrt{1 - ${v}^2} = ${T}\times${f} = ${nice(T * f)}$ years.`,
        };
      },
    }),
    num({
      id: 'interval', difficulty: 2,
      gen(r) {
        const [dt, dx, tau] = r.pick([[13, 5, 12], [10, 6, 8], [17, 8, 15], [25, 7, 24]]);
        return {
          prompt: t`Two events are separated by $\Delta t = ${dt}$ years and $\Delta x = ${dx}$ light-years. A clock travels between them at constant speed. How much proper time does it record?`,
          visual: diagram({ x: [-0.3 * dt, 0.9 * dt], t: [-0.06 * dt, 1.12 * dt], cones: [{ at: [0, 0] }],
            paths: [{ pts: [[0, 0], [dx, dt]], color: 'gold' }], events: [[0, 0, 'first event', 8, 12], [dx, dt, 'second event', 8, -10]] }),
          answer: tau, units: 'yr', tol: { rel: 1e-3 },
          errors: [{ value: Math.sqrt(dt * dt + dx * dx), feedback: 'In spacetime the interval has a minus sign: τ² = Δt² − Δx², not a plus.' }, { value: dt - dx, feedback: 'Square first, then subtract, then take the square root.' }],
          hints: [t`$\Delta\tau^2 = \Delta t^2 - \Delta x^2$ (units with $c = 1$).`],
          teach: 'Proper time between two events along a straight worldline is the spacetime interval: τ² = Δt² − Δx²/c².',
          explain: t`$\Delta\tau = \sqrt{${dt}^2 - ${dx}^2} = \sqrt{${dt * dt - dx * dx}} = ${tau}$ years.`,
        };
      },
    }),
    mcq({
      id: 'most-time', difficulty: 2,
      prompt: 'Many different worldlines connect the same two events A and B. Which records the most proper time?',
      visual: diagram({ x: [-5.5, 5.5], t: [-0.6, 10.6], cones: [{ at: [0, 0] }, { at: [0, 10], past: true }],
        paths: [{ pts: [[0, 0], [0, 6], [0, 10]], color: 'accent', label: 'straight', labelLeg: 0, labelDx: -8, labelDy: 0, labelAlign: 'right' },
          { pts: [[0, 0], [-1, 2], [1, 4.5], [-1, 7], [0, 10]], color: 'violet', label: 'zigzag', labelLeg: 1, labelDx: 8, labelDy: 0 },
          { pts: [[0, 0], [3.6, 5], [0, 10]], color: 'gold', label: 'far out', labelLeg: 0, labelDx: 10, labelDy: 0 }],
        events: [[0, 0, 'A', 8, 10], [0, 10, 'B', 8, -10]],
        caption: t`Three of the worldlines from A to B, with $c = 1$. Every leg is slower than light: steeper than the dashed light cones.` }),
      choices: ['The straight one — free, unaccelerated motion', 'The one that travels farthest in space', 'They all record the same time', 'The one with the most zigzags'],
      answer: 0,
      why: { 1: 'More spatial travel subtracts more from the interval, so the clock reads less.', 2: 'Different paths between the same events genuinely record different times — the twin paradox.', 3: 'Every zigzag is extra motion, and motion costs proper time.' },
      hints: ['Remember the minus sign in dτ² = dt² − dx².'],
      teach: 'In spacetime the straight (inertial) worldline between two events has the greatest proper time.',
      explain: 'Any spatial motion subtracts from dτ², so the worldline that stays put in its own frame — the straight one — accumulates the most.',
    }),
    mcq({
      id: 'whose-clock', difficulty: 2,
      prompt: 'A muon is created high in the atmosphere and races toward the ground at 0.995c. Its lifetime “at rest” is 2.2 μs. Whose clock measures the muon’s proper time?',
      visual: {
        type: 'graph', params: { x: [-3, 19], y: [-3, 58], xlabel: 'height (km)', ylabel: 't (μs)', axesAt: 'edge',
          curves: [{ fn: '(15 - x)/0.29979', domain: [0, 15], color: 'warn', dash: [5, 5], width: 1 }],
          arrows: [{ from: [0, 0], to: [0, 55], color: 'accent', label: 'ground clock', labelDx: 8, labelDy: 0 },
            { from: [15, 0], to: [15, 55], color: 'ink3', label: 'clock 15 km up', labelDx: -8, labelDy: 0, labelAlign: 'right' },
            { from: [15, 0], to: [0, 15 / (0.995 * 0.29979)], color: 'gold', label: 'muon', labelDx: 60, labelDy: 20 }] },
        caption: t`Height against time for a muon made 15 km up, say. The dashed line is a light signal sent down at the same moment: the muon's worldline nearly follows it.`,
      },
      choices: ['A clock riding with the muon', 'A clock on the ground', 'A clock at the top of the atmosphere', 'Any clock — proper time is the same for everyone'],
      answer: 0,
      why: { 1: 'The ground clock measures coordinate time, which is longer by the factor γ ≈ 10.', 2: 'A stationary clock high up is still not moving with the muon.', 3: 'Proper time belongs to a particular worldline; other clocks disagree.' },
      hints: ['Proper time is measured by a clock that travels the worldline itself.'],
      teach: 'Proper time is the time read by a clock that moves along the worldline in question.',
      explain: 'Only a clock co-moving with the muon reads its proper time; ground clocks record about 10 times more, which is why the muons reach the ground.',
    }),
    num({
      id: 'round-trip', difficulty: 3,
      gen(r) {
        const D = r.pick([3, 4.24, 6, 9]), v = r.pick([0.6, 0.8]);
        const g = Math.sqrt(1 - v * v);
        return {
          prompt: t`An astronaut travels to a star ${D} light-years away at $${v}c$, turns around immediately, and returns at the same speed. How many years does the astronaut's own clock record for the whole trip?`,
          visual: diagram({ x: [-0.6 * D, 1.6 * D], t: [-0.1 * D / v, 2.15 * D / v], cones: [{ at: [0, 0] }],
            paths: [{ pts: [[0, 0], [0, 2 * D / v]], color: 'accent', label: 'Earth', labelDx: -8, labelAlign: 'right' }, { pts: [[0, 0], [D, D / v], [0, 2 * D / v]], color: 'gold', label: 'astronaut', labelDx: 8, labelDy: 18 }],
            vlines: [{ x: D, label: 'star' }] }),
          answer: (2 * D / v) * g, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: 2 * D / v, feedback: 'That is the Earth time. The astronaut’s clock records less: multiply by √(1 − v²).' }],
          hints: ['First find the Earth-frame time for the round trip: distance ÷ speed.', t`Then multiply by $\sqrt{1 - v^2}$ — both legs have the same speed.`],
          teach: 'For a round trip at constant speed, the traveller’s proper time is the Earth time times √(1 − v²/c²).',
          explain: t`Earth time: $2\times${D}/${v} = ${nice(2 * D / v)}$ yr. The astronaut's clock: $${nice(2 * D / v)}\times${nice(g)} = ${nice((2 * D / v) * g)}$ yr.`,
        };
      },
    }),
    mcq({
      id: 'near-c', difficulty: 1,
      prompt: t`A clock moves past you at speed $v$. As $v$ approaches the speed of light, the proper time it records during one second of your time approaches:`,
      visual: diagram({ x: [-1, 5.8], t: [-0.3, 5.6], cones: [{ at: [0, 0] }],
        paths: [{ pts: [[0, 0], [0, 5]], color: 'accent', label: 'you' }, { pts: [[0, 0], [2.5, 5]], color: 'gold', label: '0.5c' },
          { pts: [[0, 0], [0.9 * 4.2, 4.2]], color: 'gold', label: '0.9c' }, { pts: [[0, 0], [0.99 * 5, 5]], color: 'gold', label: '0.99c', labelDx: 6, labelDy: -10 }],
        caption: t`Clocks leaving you at three speeds, with $c = 1$. The faster the clock, the closer its worldline lies to the dashed light cone.` }),
      choices: ['Zero', 'One second', 'Infinity', 'Half a second'],
      answer: 0,
      why: { 1: 'That is only true when v = 0.', 2: 'It is your time that is longer; the moving clock’s proper time shrinks.', 3: 'Half a second happens at one particular speed (about 0.87c), not in the limit.' },
      hints: [t`Look at $\sqrt{1 - v^2/c^2}$ as $v \to c$.`],
      teach: 'Proper time per unit coordinate time is √(1 − v²/c²), which tends to zero as v → c.',
      explain: t`$\sqrt{1 - v^2/c^2} \to 0$, so a clock moving at nearly $c$ barely ticks — light itself has zero proper time.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-interval', difficulty: 2,
      gen(r) {
        const [dt, dx, tau] = r.pick([[5, 3, 4], [26, 10, 24], [29, 20, 21], [41, 9, 40]]);
        return {
          prompt: t`Events P and Q are $${dt}$ years and $${dx}$ light-years apart in Earth's frame. What proper time does a clock coasting from P to Q record?`,
          visual: diagram({ x: [-0.3 * dt, 0.95 * dt], t: [-0.06 * dt, 1.12 * dt], cones: [{ at: [0, 0] }],
            paths: [{ pts: [[0, 0], [dx, dt]], color: 'gold' }], events: [[0, 0, 'P', 8, 10], [dx, dt, 'Q', 8, -10]] }),
          answer: tau, units: 'yr', tol: { rel: 1e-3 },
          hints: ['τ² = Δt² − Δx².'],
          teach: 'The proper time along a straight worldline is the spacetime interval.',
          explain: t`$\sqrt{${dt}^2 - ${dx}^2} = ${tau}$ years.`,
        };
      },
    }),
    mcq({
      id: 'cp-why', difficulty: 2,
      prompt: 'In the twin paradox, why is the travelling twin younger at the reunion — rather than the Earth twin, who also sees the traveller’s clock run slow?',
      visual: diagram({ x: [-4, 6.5], t: [-0.6, 10.6], cones: [{ at: [0, 0] }],
        paths: [{ pts: [[0, 0], [0, 5], [0, 10]], color: 'accent', label: 'Earth twin', labelLeg: 0, labelDx: -8, labelDy: 0, labelAlign: 'right' }, { pts: [[0, 0], [3.2, 5], [0, 10]], color: 'gold', label: 'travelling twin', labelLeg: 0, labelDx: 10, labelDy: 0 }],
        events: [[0, 0, 'departure', 8, 12], [0, 10, 'reunion', 8, -10]] }),
      choices: ['The traveller’s worldline between the two meetings is not straight, and straight worldlines carry the most proper time', 'Moving clocks are physically damaged by speed', 'Light from the traveller takes longer to reach Earth', 'The traveller was far from Earth’s gravity'],
      answer: 0,
      why: { 1: 'Clocks are not damaged; time along different paths simply differs.', 2: 'Signal delays are corrected for in the calculation; they are not the cause.', 3: 'Gravity is not needed — the effect exists in flat spacetime.' },
      hints: ['What is different about the two worldlines?'],
      teach: 'The asymmetry is geometric: only the traveller’s worldline bends, and bent worldlines have less proper time.',
      explain: 'Both twins see the other’s clock slow while moving apart uniformly, but only the traveller changes frames. The traveller’s bent worldline between the shared events is shorter in proper time.',
    }),
    num({
      id: 'cp-proxima', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([0.6, 0.8, 0.96]);
        const g = Math.sqrt(1 - v * v);
        const D = 4.24;
        return {
          prompt: t`A probe flies one way to Proxima Centauri, 4.24 light-years away, at $${v}c$. How long does the trip take on the probe's own clock?`,
          visual: diagram({ x: [-2.2, 6.2], t: [-0.3, Math.max(5, 1.12 * D / v)], cones: [{ at: [0, 0] }],
            paths: [{ pts: [[0, 0], [0, D / v]], color: 'accent', label: 'Earth', labelDx: -8, labelAlign: 'right' }, { pts: [[0, 0], [D, D / v]], color: 'gold', label: 'probe', labelDx: -8, labelDy: -12, labelAlign: 'right' }],
            vlines: [{ x: D, label: 'Proxima' }] }),
          answer: (D / v) * g, units: 'yr', tol: { rel: 0.01 },
          hints: ['Find the Earth-frame trip time, then shrink it by √(1 − v²).', t`Earth time is distance ÷ speed $= 4.24/v$ years.`],
          teach: 'Proper time = coordinate time × √(1 − v²/c²) for constant speed.',
          explain: t`Earth time $${D}/${v} = ${nice(D / v)}$ yr; probe time $${nice(D / v)}\times${nice(g)} = ${nice((D / v) * g)}$ yr.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 1–4', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 1', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
