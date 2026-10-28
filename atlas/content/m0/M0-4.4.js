// Reading graphs as physical stories — height is the state, slope is the rate, bending is the change of rate.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';

const t = String.raw;
const g = 9.8;

// a sounding rocket: net upward acceleration ab for tb seconds, then a coast with no drag
function flight(ab, tb) {
  const vb = ab * tb, hb = 0.5 * ab * tb * tb, tApo = tb + vb / g, hMax = hb + vb * vb / (2 * g), T = tApo + Math.sqrt(2 * hMax / g);
  return { ab, tb, vb, hb, tApo, hMax, T };
}
// the altitude as two graph curves (s, and h in units of `unit` metres)
function flightCurves(F, unit = 1, color = 'accent') {
  return [
    { fn: `${N(F.ab / 2 / unit)}*x^2`, color, domain: [0, F.tb] },
    { fn: `(${N(F.hb)} + ${N(F.vb)}*(x - ${F.tb}) - 4.9*(x - ${F.tb})^2)/${unit}`, color, domain: [F.tb, N(F.T)] },
  ];
}
const EX = flight(30, 8);
// the whole-flight story for the matching problem: burn, coast, 10 s of free fall, then a parachute at 15 m/s
const ST = flight(25, 6), tChute = ST.tApo + 10, hChute = ST.hMax - 4.9 * 100, tLand = tChute + hChute / 15;

export default lesson({
  id: 'm0.M0-4.4',
  title: 'Reading graphs as physical stories',
  minutes: 9, difficulty: 2,
  intro: t`A graph of position against time is a story, and you can read it without a formula. The **height** of the curve says where the object is; the **slope** says how fast it is moving, in units of (vertical unit) per (horizontal unit); a **flat** point is a moment at rest; and the way the curve **bends** says whether the motion is speeding up or slowing down. Between two moments, the slope of the straight chord is the average rate:

$$\bar v = \frac{\Delta h}{\Delta t} = \frac{h(t_2) - h(t_1)}{t_2 - t_1}$$

The commonest misreading is to take the graph for a picture of the path. A curve that rises and falls is not a hill: it is one object going up, stopping, and coming down — along a single vertical line.`,
  symbols: [
    { tex: 'h(t)', text: 'the altitude at time $t$, in m: the height of the curve' },
    { tex: 't_1,\\ t_2', text: 'two moments, in s' },
    { tex: '\\Delta h,\\ \\Delta t', text: 'the change in altitude and the time elapsed between them (Δ, “delta”, means “change in”)' },
    { tex: '\\bar v', text: 'the **average velocity** over the interval, in m/s: the slope of the chord. Positive means climbing; the bar means “average”' },
  ],
  why: t`Telemetry arrives as graphs, not formulas. Engineers read burnout, apogee and parachute deployment off a flight trace by its shape long before anyone fits an equation to it — and the derivative of Calculus I is exactly the slope you read here.`,
  visual: {
    type: 'mech-graphlink',
    title: 'A sounding rocket, as three graphs',
    lead: t`The rocket climbs with net acceleration $a_b$ for the burn time $t_b$, then coasts with only gravity acting. Press Play, or drag the time cursor, and watch how the altitude graph’s slope tracks the velocity graph below it.`,
    tasks: [
      t`At burnout the altitude graph switches from bending upward to bending downward — and the velocity graph peaks there.`,
      t`At apogee the altitude graph is flat: the velocity crosses zero, while the acceleration is still $-9.8\ \text{m/s}^2$.`,
      t`The steepest part of the whole altitude graph is at the very end: with no drag or parachute, the rocket hits the ground faster than it ever climbed.`,
    ],
    params: {
      segments: [{ a: 'ab', dt: 'tb' }, { a: '-9.8', dt: '(ab*tb)/9.8 + sqrt(2*(ab*tb^2/2 + (ab*tb)^2/19.6)/9.8)' }],
      sliders: [
        { key: 'ab', label: t`Net burn acceleration $a_b$`, min: 15, max: 40, step: 1, value: 30, unit: t`\mathrm{m/s^2}`, explain: 'Thrust minus weight, divided by mass: how hard the rocket speeds up while the motor burns.' },
        { key: 'tb', label: t`Burn time $t_b$`, min: 3, max: 10, step: 0.5, value: 8, unit: t`\mathrm{s}`, explain: 'How long the motor burns before the coast begins.' },
      ],
      marks: [{ t: 'tb', label: 'burnout' }, { t: 'tb + ab*tb/9.8', label: 'apogee' }],
      track: 'vertical', pos: 'h', ground: true, labels: { x: 'h (m)' },
    },
    caption: t`A teaching model: constant net acceleration during the burn (a real rocket gets lighter, so its acceleration grows), no air drag, no parachute.`,
  },
  example: {
    prompt: t`The graph shows a sounding rocket’s altitude. Read its story: when does the motor burn out, when is apogee, how high does it go, and what is its average velocity from launch to apogee?`,
    visual: { type: 'graph', params: { x: [-2, 64], y: [-200, 4400], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: flightCurves(EX), points: [{ x: EX.tb, y: EX.hb, color: 'gold', r: 5, label: 'burnout', labelDx: 10, labelDy: 12 }, { x: N(EX.tApo), y: N(EX.hMax), color: 'violet', r: 5, label: 'apogee', labelDx: -20, labelDy: -14 }], arrows: [{ from: [0, 0], to: [N(EX.tApo), N(EX.hMax)], color: 'teal', dash: true, width: 1.6 }] }, caption: t`Altitude against time, no drag. The dashed chord from launch to apogee has the average velocity as its slope.` },
    steps: [
      { label: 'Burn', text: t`From $0$ to $8$ s the curve bends **upward** (concave up): it gets steeper, so the rocket is speeding up. At $t = 8$ s, height $960$ m, the bending changes direction — burnout.` },
      { label: 'Coast', text: t`After $8$ s the curve still rises but bends **downward**: the climb rate shrinks. Gravity alone is slowing the rocket.` },
      { label: 'Apogee', text: t`The curve is flat at its top, $t \approx ${nice(sig(EX.tApo, 3))}$ s and $h \approx ${Math.round(EX.hMax)}$ m: velocity zero, the highest point.` },
      { label: 'Average velocity', text: t`$\bar v = \dfrac{${Math.round(EX.hMax)} - 0}{${nice(sig(EX.tApo, 3))} - 0} \approx ${Math.round(EX.hMax / EX.tApo)}$ m/s — the slope of the dashed chord. It is exactly half the $240$ m/s at burnout, because the velocity rose steadily from $0$ to $240$ m/s and fell steadily back to $0$.` },
      { label: 'Sense check', text: t`The steepest point of the whole graph is the landing, at $t \approx ${nice(sig(EX.T, 3))}$ s, falling at $\sqrt{2gh_{\max}} \approx ${Math.round(Math.sqrt(2 * g * EX.hMax))}$ m/s. Without a parachute it lands faster than it ever climbed — which is why sounding rockets carry one.` },
    ],
    answer: t`Burnout at $8$ s; apogee $\approx ${Math.round(EX.hMax)}$ m at $\approx ${nice(sig(EX.tApo, 3))}$ s; average velocity to apogee $\approx ${Math.round(EX.hMax / EX.tApo)}$ m/s.`,
  },
  practice: [
    {
      type: 'point', id: 'apogee-point', difficulty: 1,
      gen(r) {
        const F = flight(r.pick([20, 25, 30]), r.pick([5, 6, 8]));
        return {
          prompt: t`A sounding rocket’s altitude is graphed below (burn for $${F.tb}$ s, then a coast with no drag). Mark its **apogee**, the highest point of the flight.`,
          visual: { type: 'graph', params: { x: [-2, N(F.T + 3)], y: [-0.2, N(F.hMax / 1000 * 1.18)], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (km)', curves: flightCurves(F, 1000), drag: [{ key: 'q', x: 0, y: N(F.hMax / 1000 * 1.1), snap: 0.05 }] } },
          answer: { x: F.tApo, y: F.hMax / 1000 }, tol: { x: 1.2, y: 0.12 },
          instruction: 'Drag the point to the apogee, then check.',
          hints: [t`At apogee the rocket is momentarily at rest: the curve is flat there.`],
          teach: t`Apogee is a turning point: the altitude graph is flat there because the vertical velocity is zero.`,
          explain: t`The flat top is at $t \approx ${nice(sig(F.tApo, 3))}$ s, $h \approx ${nice(sig(F.hMax / 1000, 3))}$ km. It comes $${nice(sig(F.vb / g, 3))}$ s after burnout: the coast up takes burnout speed divided by $g$.`,
        };
      },
    },
    mcq({
      id: 'slope-units', difficulty: 1,
      prompt: t`On an engine test, the propellant mass $m$ left in the tanks (kg) is plotted against time $t$ (s). What does the slope of this graph measure?`,
      visual: { type: 'graph', params: { x: [-5, 130], y: [-500, 6000], aspect: 'wide', xlabel: 't (s)', ylabel: 'm (kg)', curves: [{ fn: '5400 - 40x', color: 'accent', domain: [0, 120] }], arrows: [{ from: [30, 4200], to: [80, 4200], color: 'gold', label: 'Δt', labelDx: -26, labelDy: 16 }, { from: [80, 4200], to: [80, 2200], color: 'gold', label: 'Δm', labelDx: 8, labelDy: -24 }] }, caption: t`Propellant left in the tanks during a steady burn; the gold triangle is one rise over run.` },
      choices: ['the rate at which mass leaves the tanks, in kg/s (negative here)', 'the total mass burned, in kg·s', 'the time per kilogram, in s/kg', 'the mass left, in kg'],
      answer: 0,
      why: {
        1: t`kg·s is the unit of the *area* under the graph, not its slope. Slope is rise over run: kg divided by s.`,
        2: t`That is run over rise, the slope upside down. Slope is $\Delta m/\Delta t$.`,
        3: t`The mass left is the *height* of the graph at a moment, not its slope.`,
      },
      hints: [t`Slope $= \dfrac{\text{rise}}{\text{run}} = \dfrac{\Delta m}{\Delta t}$. What are its units?`],
      teach: t`A slope has units of (vertical unit)/(horizontal unit) and measures how fast the vertical quantity changes.`,
      explain: t`$\Delta m/\Delta t$ is in kg/s: the mass flow rate. It is negative because the tanks empty; here $-40$ kg/s, so the engine consumes $40$ kg of propellant each second.`,
    }),
    num({
      id: 'avg-descent', difficulty: 2,
      gen(r) {
        const H0 = r.pick([1800, 3600]), s = H0 / 1800, k1 = r.int(0, 2), k2 = r.int(3, 5);
        const t1 = 10 * k1, t2 = 10 * k2, h1 = 50 * (6 - k1) ** 2 * s, h2 = 50 * (6 - k2) ** 2 * s;
        const ans = (h2 - h1) / (t2 - t1);
        return {
          prompt: t`A lander’s radar altimeter trace is shown. What is its average vertical velocity between $t = ${t1}$ s and $t = ${t2}$ s?`,
          answer: ans, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (t2 - t1) / (h2 - h1), feedback: t`That is $\Delta t/\Delta h$, upside down. Velocity is metres per second: $\Delta h/\Delta t$.` }, { value: h2 / t2, feedback: t`That is $h/t$ at one moment. An average over an interval uses the *changes* between its two ends.` }],
          hints: [t`$\bar v = \dfrac{h(${t2}) - h(${t1})}{${t2} - ${t1}}$.`, t`The altitude falls, so the answer is negative.`],
          teach: t`The average velocity between two moments is the slope of the chord joining them: change in position over change in time.`,
          explain: t`$\bar v = \dfrac{${h2} - ${h1}}{${t2} - ${t1}} = ${nice(ans)}$ m/s. The sign says it is descending. Notice the trace flattening toward touchdown: the engine is slowing the descent.`,
          visual: { type: 'graph', params: { x: [-3, 66], y: [-0.06 * H0, 1.12 * H0], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: `${H0}*(1 - x/60)^2`, color: 'accent', domain: [0, 60] }], points: [{ x: t1, y: h1, color: 'gold', r: 5, label: `(${t1} s, ${h1} m)`, labelDx: 10, labelDy: -8 }, { x: t2, y: h2, color: 'gold', r: 5, label: `(${t2} s, ${h2} m)`, labelDx: 10, labelDy: -12 }] }, caption: t`Altitude above the surface during a powered descent (an idealized trace that reaches the ground at zero speed).` },
        };
      },
    }),
    mcq({
      id: 'graph-not-path', difficulty: 2,
      prompt: t`A ball thrown straight up has the height–time graph below. Which describes its velocity?`,
      visual: { type: 'graph', params: { x: [-0.2, 3.2], y: [-1, 13], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: '15x - 4.9x^2', color: 'accent', domain: [0, 3.06] }] }, caption: t`Height against time for a ball thrown straight up, no air resistance. The ball moves along one vertical line.` },
      choices: [
        'positive and shrinking at first, zero at the top, then negative and growing in size',
        'largest at the top of the curve, where the ball is highest',
        'constant, because the curve is one smooth arc',
        'negative throughout, because gravity pulls down the whole time',
      ],
      answer: 0,
      why: {
        1: t`That reads the height as the speed. At the top the graph is *flat*, so the velocity there is zero.`,
        2: t`Constant velocity would be a straight line. This curve’s slope changes all the time.`,
        3: t`Gravity makes the *acceleration* negative throughout. The velocity is positive on the way up — the height is increasing.`,
      },
      hints: [t`Velocity is the slope of this graph. Is the slope positive, zero or negative at the start, the top and the end?`],
      teach: t`Read velocity from the slope of a position graph, never from its height.`,
      explain: t`The slope starts at $+15$ m/s, falls steadily, is $0$ at the top ($t \approx 1.5$ s), and is $-15$ m/s on landing. Steadily falling slope means constant negative acceleration, $-9.8\ \text{m/s}^2$.`,
    }),
    num({
      id: 'burn-altitude', difficulty: 2,
      gen(r) {
        const tb = r.pick([4, 5, 6, 8]), vb = r.pick([120, 150, 180, 240]), ans = 0.5 * vb * tb;
        return {
          prompt: t`During its burn, a rocket’s vertical velocity grows steadily from $0$ to $${vb}$ m/s in $${tb}$ s, as in the velocity–time graph. How high is it at burnout?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: vb * tb, feedback: t`That is the rectangle $${vb} \times ${tb}$: as if it had flown at full speed from the start. The area under a sloping line is a triangle.` }, { value: vb / tb, feedback: t`That is the slope, $\Delta v/\Delta t$ — the acceleration, in $\text{m/s}^2$. The height is the *area*.` }],
          hints: [t`The displacement is the area under the velocity–time graph.`, t`The area is a triangle: $\tfrac12 \times \text{base} \times \text{height}$.`],
          teach: t`The area under a velocity–time graph is the displacement; its slope is the acceleration.`,
          explain: t`Area $= \tfrac12 \times ${tb}\ \text{s} \times ${vb}\ \text{m/s} = ${nice(ans)}$ m. The slope, $${nice(vb / tb)}\ \text{m/s}^2$, is the acceleration.`,
          visual: { type: 'graph', params: { x: [-0.5, 10], y: [-15, 270], aspect: 'wide', xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${vb / tb}x`, color: 'accent', domain: [0, tb] }], shade: [{ fn: `${vb / tb}x`, from: 0, to: tb, color: 'accent', alpha: 0.22 }], points: [{ x: tb, y: vb, color: 'gold', r: 5, label: 'burnout', labelDx: 10, labelDy: -6 }] }, caption: t`Velocity against time during the burn, taken as uniform acceleration.` },
        };
      },
    }),
    mcq({
      id: 'concavity', difficulty: 2,
      prompt: t`While a rocket coasts upward, its altitude graph is still rising but bends downward (concave down), as here. What does the bending say?`,
      visual: { type: 'graph', params: { x: [-1, 26], y: [-200, 3600], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: '960 + 240x - 4.9x^2', color: 'accent', domain: [0, 24.5] }], tangent: { fn: '960 + 240x - 4.9x^2', at: 4 } }, caption: t`The coast after burnout, with a tangent line at one moment: drag its point along the curve and watch the slope fall. No drag.` },
      choices: ['the upward velocity is decreasing: the acceleration is negative', 'the rocket is falling', 'the acceleration is zero', 'the velocity is negative'],
      answer: 0,
      why: {
        1: t`It is still rising — the graph goes up. Bending down means it is rising *more slowly*.`,
        2: t`Zero acceleration means constant velocity, which draws a straight line, not a bending one.`,
        3: t`The velocity is the slope, still positive while the graph rises. The bending tells you about the *change* in velocity.`,
      },
      hints: [t`Drag the tangent along: does the slope grow or shrink?`],
      teach: t`Concave down means the slope (the velocity) is decreasing: negative acceleration, even while still going up.`,
      explain: t`The slopes of the tangents fall from left to right: the velocity decreases while staying positive until apogee. A shrinking velocity means negative acceleration — here $g$, downward.`,
    }),
  ],
  checkpoint: [
    {
      type: 'slider', id: 'cp-fastest-climb', difficulty: 3,
      gen(r) {
        const tb = r.pick([6, 7, 8, 9]), ab = 25, F = flight(ab, tb);
        return {
          prompt: t`The altitude of a sounding rocket is graphed (motor burning, then coasting; no drag). Set the time cursor to the moment it is **climbing fastest**.`,
          visual: { type: 'mech-graphlink', params: { segments: [{ a: ab, dt: tb }, { a: -9.8, dt: N(F.T - tb) }], panels: ['x'], track: false, pos: 'h', readouts: ['t'], toggles: false, play: false, step: 0.5, time: 0, labels: { x: 'h (m)' } }, caption: 'Altitude against time; the dashed line is the time cursor.' },
          param: 'time', answer: [tb - 0.6, tb + 0.6],
          instruction: 'Move the time cursor to the moment of fastest climb, then check.',
          hints: [t`Fastest climb means the steepest *rising* part of the graph.`, t`Where does the curve stop bending upward and start bending over?`],
          teach: t`The steepest rising point of a position graph is the moment of greatest upward velocity — where the bending changes from up to down.`,
          explain: t`The climb is fastest at burnout, $t = ${tb}$ s: before it the graph steepens (the motor accelerates the rocket), after it the graph bends over (gravity slows it). That change of bending is called an inflection point.`,
        };
      },
    },
    num({
      id: 'cp-range-rate', difficulty: 2, transfer: true,
      gen(r) {
        const d1 = r.int(1, 5) * 10, dd = r.pick([10, 20, 30]), R1 = r.int(40, 90), v = r.pick([2.5, 3, 4, 5]);
        const dR = v * dd * 86400 / 1e6, R2 = R1 + dR;   // million km
        return {
          prompt: t`A deep-space tracking station measures its distance to an outbound probe: $${R1}$ million km on mission day $${d1}$ and $${nice(sig(R2, 4))}$ million km on day $${d1 + dd}$. The range graph between them is a straight line. What is its slope — the probe’s range rate — in km/s?`,
          answer: v, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: dR * 1e6 / dd, feedback: t`That is in km per *day*. Divide by $86\,400$ seconds per day.` }, { value: dR / dd, feedback: t`That is in million km per day. Convert both units: $\times 10^{6}$ km, $\div 86\,400$ s.` }],
          hints: [t`Slope $= \dfrac{\Delta R}{\Delta t}$, then convert million km to km and days to seconds.`, t`$\Delta R = ${nice(sig(dR, 4))} \times 10^{6}$ km over $\Delta t = ${dd} \times 86\,400$ s.`],
          teach: t`A slope carries units; converting it means converting both the rise and the run.`,
          explain: t`$\dfrac{${nice(sig(dR, 4))} \times 10^{6}\ \text{km}}{${dd} \times 86\,400\ \text{s}} = ${nice(v)}$ km/s.`,
          visual: { type: 'graph', params: { x: [d1 - 5, d1 + dd + 5], y: [R1 - 5, R2 + 5], aspect: 'wide', xlabel: 'mission day', ylabel: 'range (million km)', curves: [{ fn: `${R1} + ${N(dR / dd)}*(x - ${d1})`, color: 'accent', domain: [d1 - 5, d1 + dd + 5] }], points: [{ x: d1, y: R1, color: 'gold', r: 5 }, { x: d1 + dd, y: N(R2), color: 'gold', r: 5 }] }, caption: t`Range against time over a short arc, where it is close to a straight line.` },
        };
      },
    }),
    match({
      id: 'cp-phases', difficulty: 2,
      prompt: t`The graph is a rocket’s altitude through a whole flight: burn, coast, fall, and descent under a parachute. Match each phase with the shape of its part of the graph.`,
      visual: { type: 'graph', params: { x: [-3, N(tLand + 5)], y: [-80, 1800], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)',
        curves: [{ fn: '12.5x^2', color: 'accent', domain: [0, 6] }, { fn: `450 + 150(x - 6) - 4.9(x - 6)^2`, color: 'accent', domain: [6, N(tChute)] }, { fn: `${N(hChute)} - 15(x - ${N(tChute)})`, color: 'accent', domain: [N(tChute), N(tLand)] }] },
        caption: t`An idealized flight: no drag, and a parachute that slows the rocket to a steady $15$ m/s at once. Real parachutes take seconds to do that.` },
      left: ['engine burning', 'coasting upward', 'falling freely after apogee', 'descending under the parachute'],
      right: ['rising and bending upward', 'rising and bending over', 'falling ever more steeply', 'falling along a straight line', 'flat'],
      answer: [0, 1, 2, 3],
      hints: [t`Bending upward means speeding up; bending over means slowing down; a straight line means steady speed.`],
      teach: t`Each kind of motion has a signature shape: speeding up bends one way, slowing down the other, steady motion is straight.`,
      explain: t`Burning: the climb speeds up (concave up). Coasting: still rising but slowing (concave down). Free fall: the fall speeds up, so the graph gets steeper downward. Parachute: steady speed, a straight line. “Flat” would mean hovering at rest — only an instant, at apogee.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §3.2 Instantaneous Velocity and Speed', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-2-instantaneous-velocity-and-speed' },
    { label: 'OpenStax Precalculus 2e, §1.3 Rates of Change and Behavior of Graphs', url: 'https://openstax.org/books/precalculus-2e/pages/1-3-rates-of-change-and-behavior-of-graphs' },
  ],
});
