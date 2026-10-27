// Geodesics — Intuition Mode: the principle of maximal aging. A free object
// moves so that its own clock records the most time between nearby events.
// Near Earth (clocks fast by gh/c² higher up, slow by v²/2c² when moving)
// this reproduces Newton's parabola exactly; the same rule moves satellites,
// planets and — with zero proper time — light. Self-contained for the
// black-hole fast track (S09 → S12 → S20 …).
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, g0, LY, sci, round } from './_fasttrack.js';
import { budget, freeFall } from '../../src/viz/model/gr-aging.js';

const t = String.raw;

// the worked example: a ball thrown straight up at 10 m/s
const V0 = 10, T0 = (2 * V0) / g0, H0 = (V0 * V0) / (2 * g0);
const B0 = budget('arc', H0, T0);
const gain = (T, g = g0) => freeFall.gain(T, g, C);

// the aging meter for T = 2 s, in units of 1e-16 s, as a graph expression of the apex x
const meterT = 2;
const meterExpr = `(9.81*(2/3)*x*${meterT} - 16*x^2/(3*${meterT})/2)/(2.998e8)^2/1e-16`;

// cp-curvature: the ball's and the bullet's worldlines as arcs of equal circles (not to scale)
const arcPair = () => {
  const L = -1.35, Rt = 1.35, a = -0.95;
  const ring = (cx) => ({ param: [`${cx} + cos(t)`, 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2, dash: true });
  const tip = (cx) => [round(cx + Math.cos(a), 4), round(Math.sin(a), 4)];
  return {
    type: 'graph',
    params: {
      x: [-2.75, 2.75], y: [-1.3, 1.55], equal: true, grid: false, axes: false,
      curves: [
        ring(L), ring(Rt),
        { param: [`${L} + cos(t)`, 'sin(t)'], t: [0.87, 2.27], color: 'gold', width: 4.5 },
        { param: [`${Rt} + cos(t)`, 'sin(t)'], t: [1.5, 1.64], color: 'violet', width: 4.5 },
      ],
      arrows: [{ from: [L, 0], to: tip(L), color: 'ink2', label: 'c²/g' }, { from: [Rt, 0], to: tip(Rt), color: 'ink2', label: 'c²/g' }],
      points: [
        { x: L, y: 0, r: 2.5, color: 'ink2' }, { x: Rt, y: 0, r: 2.5, color: 'ink2' },
        { x: L - 0.75, y: 1.2, r: 0.5, color: 'gold', label: 'tossed ball: 2 s' },
        { x: Rt - 0.62, y: 1.2, r: 0.5, color: 'violet', label: 'bullet: 0.2 s' },
      ],
    },
    caption: 'Not to scale. On a diagram of height against ct, the worldlines of a tossed ball and of a rifle bullet are pieces of circles of the same radius; the bullet’s piece is shorter only because it is in the air for less time. Really that radius is about a light-year, and both pieces look perfectly straight.',
  };
};
const CURVATURE_PICTURE = arcPair();

export default lesson({
  id: 'gr.S12.i',
  title: 'Free fall is the path of maximal aging',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der', 'est-obs'],
  intro: t`General relativity's whole law of motion fits in one sentence: **a free object moves so that its own clock records the most time** between any two nearby events. In empty space this picks straight, steady motion — the stay-at-home twin ages most. Near Earth, clocks higher up run fast by $gh/c^2$ (measured, from the Pound–Rebka tower to GPS) while moving clocks run slow, so the most-aging worldline between two events on the ground arcs upward: it is exactly Newton's parabola. No force is needed — and the same rule moves satellites, planets and, with zero elapsed time, light.`,
  equation: t`\Delta\tau = \int_A^B \left(1 + \frac{gh}{c^2} - \frac{v^2}{2c^2}\right) dt \;\longrightarrow\; \text{as large as possible}`,
  symbols: [
    { tex: '\\Delta\\tau', text: 'the proper time between events A and B: what a clock carried along the path reads' },
    { tex: 'A,\\ B', text: 'two events — a place and a moment each — that every path being compared must join' },
    { tex: 'dt', text: 'a short interval measured by a clock resting on the ground' },
    { tex: 'gh/c^2', text: 'the height bonus: a clock $h$ metres up runs fast by this fraction ($g = 9.81$ m/s²)' },
    { tex: 'v^2/2c^2', text: 'the speed penalty: a clock moving at $v$ runs slow by this fraction' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
  ],
  why: 'This is the geodesic principle — general relativity’s replacement for Newton’s second law plus a gravitational force. Applied to the spacetime around a star or a black hole, it gives orbits, Mercury’s precession and the plunge through the horizon.',
  visual: {
    type: 'gr-timewarp',
    title: 'Try to beat free fall',
    lead: t`Time runs left to right. Every path leaves the ground at A and returns at B. Shape the violet path and watch the aging meter: it adds the **height bonus** (higher clocks run fast) to the **speed penalty** (moving clocks run slow).`,
    tasks: ['With **Arc**, put the meter at its peak: the violet path is then exactly the gold free-fall parabola.', 'Try **Up, down** and **Hover**: their best is still below the gold free-fall line.', 'At the peak the meter’s tangent is flat: small changes to the free-fall path make no first-order change to its aging.'],
    params: { T: 2, H: 2.5, shape: 'arc', shapes: true },
  },
  example: {
    prompt: t`A ball carrying a tiny clock is thrown straight up at $v_0 = ${V0}$ m/s and caught at the height it was thrown from. How much more time does its clock record than a clock that stayed in your hand — and why is the real path the best one?`,
    steps: [
      { label: 'The path', text: t`It is in the air for $T = 2v_0/g = ${sci(T0)}$ s and peaks at $H = v_0^2/2g = ${sci(H0)}$ m.` },
      { label: 'Height bonus', text: t`Up there its clock runs fast by $gh/c^2$. Averaged over the flight the height is $\tfrac23 H$, so the bonus is $\dfrac{g\,(\tfrac23 H)\,T}{c^2} = ${sci(B0.bonus)}$ s.` },
      { label: 'Speed penalty', text: t`Moving clocks run slow by $v^2/2c^2$. Averaged over the flight, $v^2$ is $v_0^2/3$, so the penalty is $\dfrac{(v_0^2/3)\,T}{2c^2} = ${sci(B0.penalty)}$ s.` },
      { label: 'Net', text: t`The ball's clock gains $${sci(B0.bonus)} - ${sci(B0.penalty)} = ${sci(B0.net)}$ s on the clock in your hand: the bonus is **exactly twice** the penalty.` },
      { label: 'Why this path', text: t`Throw higher in the same time and the bonus grows in proportion to $H$, but the penalty grows like $H^2$; throw lower and you give up bonus. The balance point — the peak of the aging meter — is $H = gT^2/8$, which is precisely where a freely falling ball goes. Every other path between the same two events records less time.` },
      { label: 'Newton recovered', text: t`Making $\int (gh - \tfrac12 v^2)\,dt$ as large as possible is the same as making Newton's action $\int (\tfrac12 v^2 - gh)\,dt$ as small as possible — and that gives $d^2h/dt^2 = -g$. Newton's law of falling is maximal aging in disguise.` },
    ],
    answer: t`The thrown clock gains $${sci(B0.net)}$ s. Its height bonus ($${sci(B0.bonus)}$ s) is twice its speed penalty ($${sci(B0.penalty)}$ s), and no other path between the same two events does better: free fall maximizes aging.`,
  },
  practice: [
    mcq({
      id: 'which-max', difficulty: 1,
      prompt: 'A clock can be carried from event A to event B (both on the ground, two seconds apart) along many different worldlines. Which one records the most time?',
      choices: [
        'The free-fall path: tossed up and caught',
        'A path that climbs as high as possible, where clocks run fastest',
        'Staying at rest on the ground',
        'They all record the same time, since they join the same two events',
      ],
      answer: 0,
      why: {
        1: 'Climbing very high in two seconds means moving very fast, and the speed penalty grows faster than the height bonus.',
        2: 'Staying put earns no height bonus. A tossed clock gains about 3.6×10⁻¹⁶ s over it.',
        3: 'Different worldlines between the same events record different times — that is the twin paradox.',
      },
      hints: ['Height speeds a clock up; speed slows it down. Which path balances the two best?'],
      teach: 'Of all worldlines between two nearby events, the free-fall one has the most proper time: the principle of maximal aging.',
      explain: 'The aging meter peaks exactly on the free-fall parabola, apex gT²/8 = 4.9 m for T = 2 s. Any other path — lower, higher, or a different shape — records less.',
      visual: {
        type: 'graph',
        params: {
          x: [-0.15, 2.25], y: [-1.6, 14.2], xlabel: 'time (s)', ylabel: 'height (m)',
          curves: [
            { fn: '12*x*(2 - x)', domain: [0, 2], color: 'violet', label: 'high and fast', labelAt: 1 },
            { fn: '4.905*x*(2 - x)', domain: [0, 2], color: 'accent', label: 'tossed', labelAt: 1 },
            { fn: '0', domain: [0, 2], color: 'teal', label: 'stays put', labelAt: 1 },
          ],
          points: [{ x: 0, y: 0, color: 'ink' }, { x: 2, y: 0, color: 'ink' }, { x: -0.13, y: -1.5, r: 0.5, color: 'ink', label: 'A' }, { x: 1.87, y: -1.5, r: 0.5, color: 'ink', label: 'B' }],
        },
        caption: 'Three worldlines joining the same two events: leave the ground at A, be back on it at B two seconds later.',
      },
    }),
    mcq({
      id: 'longest', difficulty: 2,
      prompt: 'On a map, the straight route between two towns is the shortest one. In spacetime, the free-fall worldline between two events is, among nearby worldlines, the one with…',
      choices: ['the most proper time', 'the least proper time', 'the shortest distance travelled through space', 'zero proper time'],
      answer: 0,
      why: {
        1: 'That is the opposite: bending away from free motion always costs time, as the twin paradox shows.',
        2: 'The thrown ball travels up and down, farther than the ground clock, yet records more time; distance in space is not what is extremized.',
        3: 'Zero proper time is for light only. A ball’s clock always ticks.',
      },
      hints: ['In the twin paradox, which twin is older at the reunion: the one moving freely or the one who turns round?'],
      teach: 'In spacetime the minus sign in the interval turns "shortest" into "longest": free fall maximizes proper time.',
      explain: 'Because space and time enter the interval with opposite signs, any wiggle away from free motion subtracts proper time. The straight (geodesic) worldline is the longest in proper time, not the shortest.',
      visual: { type: 'worldlines', params: { T: 10, tx: 3, tt: 5 } },
    }),
    num({
      id: 'apex', difficulty: 2,
      gen(r) {
        const T = r.pick([1, 1.5, 2.5, 3, 4]);
        const H = freeFall.apex(T);
        return {
          visual: {
            type: 'graph',
            params: {
              x: [round(-0.12 * T, 3), round(1.12 * T, 3)], y: [round(-0.3 * H, 3), round(1.25 * H, 3)], grid: false, axes: false,
              curves: [
                { fn: '0', domain: [round(-0.1 * T, 3), round(1.1 * T, 3)], color: 'ink3', width: 1.5 },
                { fn: `4.905*x*(${T} - x)`, domain: [0, T], color: 'gold' },
              ],
              arrows: [{ from: [T / 2, 0], to: [T / 2, round(H, 4)], color: 'accent' }],
              points: [
                { x: 0, y: 0, color: 'ink', label: 'A' }, { x: T, y: 0, color: 'ink', label: 'B' },
                { x: T / 2, y: round(H / 2, 4), r: 0.5, color: 'accent', label: 'H = ?' },
                { x: round(0.3 * T, 3), y: round(-0.17 * H, 4), r: 0.5, color: 'ink2', label: `in the air for ${T} s` },
              ],
            },
            caption: 'The free-fall worldline: height against time, from A on the ground to B back on it.',
          },
          prompt: t`The aging meter for paths that leave the ground and return after $T = ${T}$ s peaks at the apex $H = gT^2/8$. What is that apex height? ($g = 9.81\ \text{m/s}^2$)`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (g0 * T * T) / 2, feedback: 'That is ½gT² — the fall in the whole time T. The ball spends only T/2 coming down: gT²/8.' }, { value: (g0 * T * T) / 4, feedback: 'Check the 8: the ball falls for T/2, so H = ½g(T/2)² = gT²/8.' }],
          hints: [t`$H = gT^2/8 = 9.81\times${T}^2/8$.`],
          teach: 'Maximal aging picks the apex H = gT²/8 — exactly how high a freely falling ball rises if it is in the air for a time T.',
          explain: t`$H = 9.81\times${T}^2/8 = ${sci(H)}$ m. Check with Newton: the ball falls from the apex for $T/2$, through $\tfrac12 g (T/2)^2 = gT^2/8$. Same answer — because it is the same physics.`,
        };
      },
    }),
    mcq({
      id: 'stationary', difficulty: 2,
      prompt: t`Here is the aging meter for paths lasting $T = ${meterT}$ s. Drag the round handle along the curve: at the peak, the tangent line is flat. What does that flatness mean for the free-fall path?`,
      choices: [
        'Nudging the path slightly away from free fall changes its clock reading by almost nothing — to first order, not at all',
        'The clock stops ticking at the top of its flight',
        'The ball is momentarily at rest everywhere along its path',
        'The free-fall clock records zero proper time',
      ],
      answer: 0,
      why: {
        1: 'The clock never stops; the flat tangent describes how the total time changes as you vary the whole path.',
        2: 'The ball is at rest only at its apex; the meter’s horizontal axis is the apex height of whole paths, not a moment in time.',
        3: 'The free-fall clock records the most time of all these paths, not zero.',
      },
      hints: ['The horizontal axis is not time: each point is a whole path, labelled by its apex height.', 'A flat tangent means the slope — how fast the aging changes as you change the path — is zero there.'],
      teach: 'Free fall is a stationary path: small changes to it leave the proper time unchanged to first order, which is how the geodesic equation is derived.',
      explain: 'At a maximum, the rate of change is zero. Physicists call the free-fall path stationary: every small variation changes the proper time only at second order, and always downward. Setting that first-order change to zero is how the geodesic equation is derived in Derivation Mode.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 10.2], y: [-1.5, 4.6], xlabel: 'apex height of the path (m)', ylabel: 'extra time (10⁻¹⁶ s)',
          curves: [{ fn: meterExpr, color: 'violet' }],
          tangent: { fn: meterExpr, at: 2 },
          hlines: [{ y: round(gain(meterT) / 1e-16, 4), color: 'gold', label: 'free fall' }],
          readouts: [{ label: 'apex', expr: 'x0', unit: '\\mathrm{m}', digits: 3 }, { label: 'slope of the meter', expr: 'slope', digits: 2 }],
        },
        caption: 'Each point is one whole arc-shaped path between the same two events, labelled by its apex; the curve is its extra proper time over a clock left on the ground.',
      },
    }),
    num({
      id: 'gain', difficulty: 3,
      gen(r) {
        const v0 = r.pick([5, 10, 15, 20, 30]);
        const T = (2 * v0) / g0, H = (v0 * v0) / (2 * g0), b = budget('arc', H, T);
        const k = 1 / (C * C * 1e-16), top = (k * v0 * v0) / 2;   // rates in parts in 10¹⁶; both peak at v₀²/2c²
        const bonusRate = `${round(k * g0, 6)}*(${v0}*x - 4.905*x^2)`, penaltyRate = `${round(k / 2, 6)}*(${v0} - 9.81*x)^2`;
        return {
          visual: {
            type: 'graph',
            params: {
              x: [0, round(T, 4)], y: [0, round(1.3 * top, 3)], xlabel: 'time in flight (s)', ylabel: 'parts in 10¹⁶',
              shade: [{ fn: bonusRate, from: 0, to: round(T, 4), color: 'gold', alpha: 0.28 }, { fn: penaltyRate, from: 0, to: round(T, 4), color: 'violet', alpha: 0.22 }],
              curves: [
                { fn: bonusRate, color: 'gold', label: 'height bonus', labelAt: round(T / 2, 4) },
                { fn: penaltyRate, color: 'violet', label: 'speed penalty', labelAt: round(0.02 * T, 4) },
              ],
            },
            caption: 'How fast the thrown clock runs ahead (gold: it is high up) and behind (violet: it is moving) during the flight. Each shaded area is that effect’s total.',
          },
          prompt: t`A clock is thrown straight up at ${v0} m/s and caught where it was thrown. Its height bonus is $\dfrac{g\,(\tfrac23 H)\,T}{c^2}$ and its speed penalty is exactly half the bonus. How much more time does it record than a clock left on the ground, in units of $10^{-16}$ s?`,
          answer: b.net / 1e-16, tol: { rel: 0.01 },
          errors: [{ value: b.bonus / 1e-16, feedback: 'That is the height bonus alone. Subtract the speed penalty, which is half of it.' }, { value: (b.bonus + b.penalty) / 1e-16, feedback: 'The speed penalty slows the clock: subtract it, don’t add it.' }, { value: b.net, feedback: 'That is in seconds. The answer is asked in units of 10⁻¹⁶ s: divide by 10⁻¹⁶.' }],
          hints: [t`Flight time $T = 2v_0/g$ and apex $H = v_0^2/2g$.`, t`Here $T = ${sci(T)}$ s and $H = ${sci(H)}$ m; the bonus is $9.81\times\tfrac23\times${sci(H)}\times${sci(T)}/(2.998\times10^{8})^2$, and the net is half of that.`],
          teach: 'For a thrown clock the height bonus is exactly twice the speed penalty, so the net gain is half the bonus: v₀³/(3gc²).',
          explain: t`$T = ${sci(T)}$ s, $H = ${sci(H)}$ m; bonus $= ${sci(b.bonus)}$ s, penalty $= ${sci(b.penalty)}$ s, net $= ${sci(b.net)}$ s $= ${sci(b.net / 1e-16)}\times10^{-16}$ s. It grows as $v_0^3$: throw twice as fast and the clock gains eight times as much.`,
        };
      },
    }),
    mcq({
      id: 'orbit', difficulty: 3,
      prompt: 'The International Space Station circles Earth every 92 minutes with its engines off. Is its worldline a geodesic — a most-aging, free-fall path?',
      choices: [
        'Yes: it is in free fall, and its worldline is a gently twisting helix in spacetime — very nearly straight — while the circle is only its shadow in space',
        'No: its path through space is a circle, and geodesics must be straight lines in space',
        'No: something must keep pushing it round, so it is not free',
        'Only at the two points of its orbit where it moves exactly horizontally',
      ],
      answer: 0,
      why: {
        1: 'Geodesics are straight in spacetime, not in space. A thrown ball’s path through space is curved too.',
        2: 'Nothing pushes it: gravity is not a force here, and the station coasts. (Small engine burns only make up for air drag.)',
        3: 'Free fall is free fall at every moment; there is nothing special about particular points of the orbit.',
      },
      hints: ['Are the astronauts weightless? What does that say about whether the station is in free fall?', 'Draw the orbit with time going up: one turn of the circle becomes one turn of a helix stretched along time.'],
      teach: 'Orbits are geodesics: free fall through curved spacetime, straight in spacetime even though curved in space.',
      explain: 'The station and its crew are weightless, so they are in free fall: the worldline is a geodesic. In spacetime it is a helix whose pitch, 92 minutes of light travel (1.7×10¹² m), is about 39 000 times its circumference — nearly a straight line. Its circular shadow in space is not what is "straight".',
      visual: {
        type: 'surface3d',
        params: {
          surface: ['cos(u)', 'sin(u)', 'v'], domain: [[0, 6.2832], [-2.8, 2.8]], n: 24, axes: false, alpha: 0.35, colorBy: false,
          yaw: -0.9, pitch: 0.28, dist: 11, scale: 1.05,
          curves: [{ param: ['1.6cos(t)', '1.6sin(t)', '0.3t - 2.79'], t: [0, 18.6], color: 'gold', width: 3 }],
          caption: 'Spacetime picture, time running upward: Earth’s surface sweeps out a tube, the station’s orbit a helix. Wildly out of scale — really each turn of the helix rises 39 000 times further than it goes round. Drag to rotate.',
        },
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-light', difficulty: 2,
      prompt: 'Light also follows a geodesic. How much proper time passes along a light ray’s worldline?',
      choices: ['None: light’s worldlines are the geodesics with zero proper time', 'The most possible, like a falling ball', 'A little less than for a ball on the same path', 'It depends on the colour of the light'],
      answer: 0,
      why: {
        1: 'Massive objects maximize proper time; light has none to maximize. Its geodesics are the ones with dτ = 0.',
        2: 'Light cannot share a ball’s path: it always moves at c, and at c clocks do not tick at all.',
        3: 'All light follows the same geodesics in a vacuum, whatever its frequency.',
      },
      hints: [t`What does $d\tau^2 = dt^2 - dx^2$ give when $dx = dt$ (with $c = 1$)?`],
      teach: 'Light follows null geodesics — worldlines along which no proper time passes.',
      explain: t`For light $dx = c\,dt$, so $d\tau = 0$ all along the ray: it follows a "null" geodesic. Gravity still bends those geodesics, which is why starlight bends near the Sun.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.1, 6.4], y: [0, 4.45], equal: true, xlabel: 'x (light-seconds)', ylabel: 't (s)',
          curves: [
            { fn: 'x', domain: [0, 4.3], color: 'gold', label: 'light', labelAt: 3.6, labelDx: 10, labelDy: 10 },
            { fn: '2*x', domain: [0, 2.15], color: 'accent', label: 'ball at c/2', labelAt: 2.15, labelDx: 8, labelDy: 0 },
          ],
          points: [
            { x: 0.5774, y: 1.1547, color: 'accent', label: '1 s' },
            { x: 1.1547, y: 2.3094, color: 'accent', label: '2 s' },
            { x: 1.7321, y: 3.4641, color: 'accent', label: '3 s' },
          ],
        },
        caption: 'Two worldlines from the same event, drawn with c = 1 so that light runs at 45°. The dots mark each second on the ball’s own clock.',
      },
    }),
    num({
      id: 'cp-gain', difficulty: 2,
      gen(r) {
        const T = r.pick([1, 1.5, 2.5, 3, 4]);
        const d = gain(T);
        return {
          visual: {
            type: 'graph',
            params: {
              x: [0, 4.4], y: [0, 31], xlabel: 'time in the air T (s)', ylabel: 'gain (10⁻¹⁶ s)',
              curves: [{ fn: `${round(gain(1) / 1e-16, 6)}*x^3`, color: 'gold' }],
              vlines: [{ x: T, label: `T = ${T} s` }],
            },
            caption: 'The free-fall clock’s gain over a clock left on the ground, for flights of every length: it grows as T³.',
          },
          prompt: t`A clock is tossed so that it spends $T = ${T}$ s in free flight. Free fall gains $\Delta\tau = \dfrac{g^2T^3}{24c^2}$ over a clock left on the ground. Find $\Delta\tau$ in units of $10^{-16}$ s.`,
          answer: d / 1e-16, tol: { rel: 0.01 },
          errors: [{ value: d, feedback: 'That is in seconds. The answer is asked in units of 10⁻¹⁶ s: divide by 10⁻¹⁶.' }],
          hints: [t`$\Delta\tau = (9.81)^2(${T})^3/(24\times(2.998\times10^{8})^2)$; then divide by $10^{-16}$.`],
          teach: 'The free-fall gain grows as the cube of the flight time.',
          explain: t`$\Delta\tau = ${sci(d)}$ s $= ${sci(d / 1e-16)}\times10^{-16}$ s.`,
        };
      },
    }),
    num({
      id: 'cp-curvature', difficulty: 3, transfer: true,
      gen(r) {
        const [place, g] = r.pick([['Earth', 9.81], ['Mars', 3.71], ['the Moon', 1.62], ['Jupiter’s cloud tops', 24.79]]);
        const R = (C * C) / g / LY;
        return {
          prompt: t`A rifle bullet and a lazily tossed ball follow very different curves through space. But draw their worldlines on a spacetime diagram with $ct$ (time, as a distance) on one axis, and both bend with the same radius of curvature, $c^2/g$. What is that radius on ${place} ($g = ${g}\ \text{m/s}^2$), in light-years? (1 ly $= 9.461\times10^{15}$ m)`,
          answer: R, units: 'ly', tol: { rel: 0.01 },
          errors: [{ value: (C * C) / g, feedback: 'That is in metres. Divide by 9.461×10¹⁵ m per light-year.' }, { value: C / g / LY, feedback: 'Square c: the radius is c²/g.' }],
          hints: [t`$c^2/g = (2.998\times10^{8})^2/${g}$ m.`, 'Divide the result by 9.461×10¹⁵ m to get light-years.'],
          teach: 'In spacetime, every freely falling worldline near a planet bends with radius c²/g — about a light-year at Earth’s surface — which is why gravity looks so gentle.',
          explain: t`$c^2/g = ${sci((C * C) / g)}$ m $= ${sci(R)}$ ly. Ball and bullet differ hugely in space, but in spacetime they bend alike: they are both geodesics of the same geometry.`,
          visual: CURVATURE_PICTURE,
        };
      },
    }),
  ],
  sources: [
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online): the principle of maximal aging', url: 'https://www.eftaylor.com/exploringblackholes' },
    { label: 'Carroll, Lecture Notes on GR, §3.3 (geodesics maximize proper time)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Pössel, “Relatively complicated? Using models to teach general relativity at different levels” (2018)', url: 'https://arxiv.org/abs/1812.11589' },
  ],
});
