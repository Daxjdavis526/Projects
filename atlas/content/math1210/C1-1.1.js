// Average rate of change and the difference quotient — the slope of a secant,
// read off a rocket's altimeter long before anyone says "derivative".
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// an expression for the straight line through (x1, y1) and (x2, y2)
const chord = (x1, y1, x2, y2) => `(${y1}) + (${(y2 - y1) / (x2 - x1)})*(x - (${x1}))`;

// a curve with the secant joining two of its points (labels are plain text)
function secantFig({ fn, f, x1, x2, x, y, xlabel, ylabel, l1 = 'P', l2 = 'Q', caption, extra = {} }) {
  const y1 = f(x1), y2 = f(x2);
  const lo = Math.min(x1, x2) - 0.5 * Math.abs(x2 - x1), hi = Math.max(x1, x2) + 0.5 * Math.abs(x2 - x1);
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel, ylabel,
      curves: [{ fn, color: 'accent' }, { fn: chord(x1, y1, x2, y2), color: 'violet', dash: true, domain: [lo, hi] }],
      points: [{ x: x1, y: y1, label: l1, color: 'gold' }, { x: x2, y: y2, label: l2, color: 'gold' }],
      ...extra,
    },
    caption,
  };
}

// altitude of a rocket during the burn, in metres (t in seconds): the data behind the altimeter problems
const burn = (tt) => 12 * tt * tt + 0.4 * tt ** 3;
const BURN = '12*x^2 + 0.4*x^3';

export default lesson({
  id: 'math1210.C1-1.1',
  title: 'Average rate of change and the difference quotient',
  minutes: 9, difficulty: 1,
  intro: t`Before there is a derivative there is an **average rate of change**: how much a quantity changed, divided by how much the input changed. On a graph it is the slope of the **secant** — the straight line through two points of the curve. Written with a start $a$ and a step $h$ it is the **difference quotient**:

$$\frac{\Delta f}{\Delta x} = \frac{f(a+h) - f(a)}{h}$$

A rocket’s altimeter gives altitude against time; the difference quotient of that record is the rocket’s average vertical velocity. Its units are always the units of $f$ divided by the units of $x$.`,
  symbols: [
    { tex: 'f', text: 'the quantity that changes — an altitude in m, a temperature in K, a mass in kg' },
    { tex: 'x', text: 'the input it depends on, often time $t$ in s' },
    { tex: 'a', text: 'where the interval starts' },
    { tex: 'h', text: 'the step: the interval runs from $a$ to $a + h$ (a nonzero number, which may be negative)' },
    { tex: '\\Delta f', text: 'the change in the output, $f(a+h) - f(a)$ — the *rise* of the secant' },
    { tex: '\\Delta x', text: 'the change in the input, $(a + h) - a = h$ — the *run* of the secant' },
  ],
  why: t`Let the step $h$ shrink toward zero and the difference quotient becomes the derivative — every velocity, current and flow rate in physics starts life as this fraction.`,
  visual: {
    type: 'graph',
    title: 'A secant on a rocket’s altitude record',
    lead: t`The blue curve is the altitude $h(t) = 15t^2$ of a rocket during its burn. The violet dashed line is the secant from $t_1$ to $t_1 + \Delta t$; its slope is the average vertical velocity over that interval. Drag the gold point to move $t_1$; the slider sets $\Delta t$. The gold line is the tangent — what the secant becomes as $\Delta t$ shrinks (lesson C1-3.1).`,
    tasks: [
      t`Put $t_1$ near 2 s and shrink $\Delta t$ from 3 s toward 0: the average velocity falls from 105 m/s toward 60 m/s.`,
      t`Make $\Delta t$ negative: the secant now reaches back in time, and its slope is still rise over run.`,
      t`Move $t_1$ later with $\Delta t$ fixed: the rocket is speeding up, so every secant is steeper than the one before.`,
    ],
    params: {
      x: [-0.3, 10.5], y: [-120, 1680], xlabel: 't (s)', ylabel: 'h (m)',
      sliders: [{ key: 'dt', label: t`Interval $\Delta t$`, min: -3, max: 4, step: 0.05, value: 3, unit: t`\text{s}`, explain: t`The length of the time interval, from $t_1$ to $t_1 + \Delta t$; negative means the interval reaches back in time.` }],
      curves: [{ fn: '15*x^2', color: 'accent', domain: [0, 10], label: 'h(t) = 15t²', labelAt: 8.3, labelDx: 10 }],
      tangent: { fn: '15*x^2', at: 2, secant: 'dt' },
      readouts: [
        { label: '$t_1$', expr: 'x0', unit: t`\text{s}`, digits: 3 },
        { label: t`average velocity $\Delta h/\Delta t$ (violet)`, expr: 'secant', unit: t`\text{m/s}`, digits: 4 },
        { label: 'instantaneous velocity (gold)', expr: 'slope', unit: t`\text{m/s}`, digits: 4 },
      ],
    },
    caption: t`A constant net acceleration of $30\ \text{m/s}^2$ makes the altitude exactly $15t^2$. That is a simplification: a real rocket’s acceleration grows as it burns off propellant. The curve is altitude against time, not the rocket’s path.`,
  },
  example: {
    prompt: t`During its burn a rocket’s altitude is $h(t) = 15t^2$ metres, $t$ in seconds. Simplify the difference quotient over $[t, t + \Delta t]$, then find the average vertical velocity over $[2, 3]$ s and over $[2, 2.1]$ s.`,
    visual: secantFig({ fn: '15*x^2', f: (x) => 15 * x * x, x1: 2, x2: 3, x: [-0.2, 4], y: [-15, 230], xlabel: 't (s)', ylabel: 'h (m)', caption: t`The secant over $[2, 3]$ s. Its slope, $75\ \text{m/s}$, is the average velocity over that second.` }),
    steps: [
      { label: 'Write the quotient', text: t`$\dfrac{h(t+\Delta t) - h(t)}{\Delta t} = \dfrac{15(t + \Delta t)^2 - 15t^2}{\Delta t}$.` },
      { label: 'Expand', text: t`$(t+\Delta t)^2 = t^2 + 2t\,\Delta t + (\Delta t)^2$, so the $15t^2$ terms cancel and the numerator is $15\big(2t\,\Delta t + (\Delta t)^2\big)$.` },
      { label: 'Divide by the step', text: t`Every term left has a factor $\Delta t$, so it cancels: the average velocity is $30t + 15\,\Delta t$ (m/s). Cancelling is allowed because $\Delta t \ne 0$.` },
      { label: 'Evaluate', text: t`Over $[2, 3]$: $t = 2$, $\Delta t = 1$, so $60 + 15 = 75$ m/s. Directly: $\dfrac{h(3) - h(2)}{1} = \dfrac{135 - 60}{1} = 75$ m/s. ✓ Over $[2, 2.1]$: $60 + 1.5 = 61.5$ m/s.` },
      { label: 'Look ahead', text: t`As $\Delta t$ shrinks, $30t + 15\,\Delta t$ settles on $30t$: at $t = 2$ s the rocket is climbing at $60$ m/s. That number is the derivative, and the simplified quotient already shows it.` },
    ],
    answer: t`Average velocity $= 30t + 15\,\Delta t$ m/s: $75$ m/s over $[2, 3]$ s and $61.5$ m/s over $[2, 2.1]$ s.`,
  },
  practice: [
    num({
      id: 'altimeter', difficulty: 1,
      gen(r) {
        const t1 = r.int(2, 6), t2 = t1 + r.pick([2, 3, 4]);
        const h1 = Math.round(burn(t1)), h2 = Math.round(burn(t2));
        const v = (h2 - h1) / (t2 - t1);
        const top = burn(11) * 1.08;
        return {
          prompt: t`A rocket’s altimeter reads $${h1}$ m at $t = ${t1}$ s and $${h2}$ m at $t = ${t2}$ s. What is its average vertical velocity over that interval?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: h2 / t2, feedback: t`That is altitude divided by time on the clock, $h/t$. An average rate uses *changes*: $\Delta h / \Delta t$.` }, { value: (t2 - t1) / (h2 - h1), feedback: t`Upside down: velocity is change in altitude over change in time, $\Delta h/\Delta t$, not $\Delta t/\Delta h$.` }],
          hints: [t`Average velocity $= \dfrac{\Delta h}{\Delta t} = \dfrac{h_2 - h_1}{t_2 - t_1}$.`],
          teach: t`An average rate of change is a change in output divided by the change in input — the slope of the secant.`,
          explain: t`$\dfrac{${h2} - ${h1}}{${t2} - ${t1}} = \dfrac{${h2 - h1}}{${t2 - t1}} = ${nice(v)}$ m/s.`,
          visual: secantFig({ fn: BURN, f: (x) => Math.round(burn(x)), x1: t1, x2: t2, x: [-0.4, 11.5], y: [-0.06 * top, top], xlabel: 't (s)', ylabel: 'h (m)', extra: { curves: [{ fn: BURN, color: 'accent', domain: [0, 11] }, { fn: chord(t1, h1, t2, h2), color: 'violet', dash: true, domain: [t1 - 0.6, t2 + 0.6] }] }, caption: t`The two altimeter readings and the secant through them. The curve is the altitude between readings, which the altimeter never sees.` }),
        };
      },
    }),
    expr({
      id: 'dq-quadratic', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), b = r.intExcept(-6, 6, [0]), c = r.int(1, 9);
        const f = (x) => a * x * x + b * x + c;
        const fT = `${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + ${c}`;
        return {
          prompt: t`Simplify the difference quotient of $f(x) = ${fT}$.`,
          lhs: t`\frac{f(x+h) - f(x)}{h}`,
          answer: `${2 * a}x + ${a}h + (${b})`,
          answerTeX: t`${2 * a}x + ${a}h ${b < 0 ? '-' : '+'} ${Math.abs(b)}`,
          vars: { x: [-2, 2], h: [0.1, 1] },
          errors: [
            { answer: `${2 * a}x + (${b})`, feedback: t`You dropped the $${a}h$ term. That is what the quotient tends to as $h \to 0$ — but for a nonzero $h$ the term is still there.` },
            { answer: `${a}h + (${b})`, feedback: t`$(x+h)^2 = x^2 + 2xh + h^2$, not $x^2 + h^2$: the cross term $2xh$ is missing.` },
          ],
          hints: [t`Expand $f(x+h) = ${a}(x+h)^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}(x+h) + ${c}$, with $(x+h)^2 = x^2 + 2xh + h^2$.`, t`Subtract $f(x)$: the terms with no $h$ cancel, leaving $${2 * a}xh + ${a}h^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}h$. Now divide by $h$.`],
          teach: t`In a difference quotient every term that survives the subtraction carries a factor of $h$, so the division always goes through.`,
          explain: t`$f(x+h) - f(x) = ${2 * a}xh + ${a}h^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}h$; dividing by $h$ gives $${2 * a}x + ${a}h ${b < 0 ? '-' : '+'} ${Math.abs(b)}$. The constant $${c}$ cancelled — shifting a graph up does not change its slopes.`,
          visual: (() => { const ys = [-2.3, -1, 0, 1, 2, 3.3, -b / (2 * a)].map(f); const lo = Math.min(...ys), hi = Math.max(...ys); return secantFig({ fn: `${a}*x^2 + (${b})*x + ${c}`, f, x1: 0.5, x2: 1.7, x: [-2.3, 3.3], y: [lo - 0.08 * (hi - lo), hi + 0.05 * (hi - lo)], l1: 'x', l2: 'x + h', caption: t`$y = f(x)$ with one secant, from $x$ to $x + h$. The difference quotient is its slope.` }); })(),
        };
      },
    }),
    mcq({
      id: 'units-cryo', difficulty: 1,
      prompt: t`A liquid-oxygen tank’s temperature $T$, in kelvin, is logged against time $t$, in minutes. In what units is the average rate of change $\dfrac{T(30) - T(10)}{30 - 10}$?`,
      visual: secantFig({ fn: '90 - 24*e^(-x/40)', f: (x) => 90 - 24 * Math.exp(-x / 40), x1: 10, x2: 30, x: [-3, 92], y: [60, 94], xlabel: 't (min)', ylabel: 'T (K)', caption: t`Subcooled liquid oxygen loaded at $66$ K, warming toward its boiling point near $90$ K. The curve is illustrative, not a measured record.` }),
      choices: ['kelvin per minute (K/min)', 'kelvin-minutes (K·min)', 'kelvin (K)', 'minutes per kelvin (min/K)'],
      answer: 0,
      why: {
        1: 'You multiplied the units. The quotient divides a change in temperature by a change in time.',
        2: 'That is the unit of the numerator alone — the change in temperature. Dividing by minutes changes the unit.',
        3: 'That would be the rate of change of time with temperature: the fraction is upside down.',
      },
      hints: ['The numerator is a temperature difference; the denominator is a time difference.'],
      teach: 'The units of an average rate of change are the units of the output divided by the units of the input.',
      explain: t`The numerator is in K and the denominator in min, so the rate is in K/min — here about $0.37$ K/min of warming (the slope of the dashed secant).`,
    }),
    num({
      id: 'boyle', difficulty: 2,
      gen(r) {
        const k = r.pick([120, 150, 200, 240]), V1 = r.int(2, 4), V2 = V1 + r.int(2, 4);
        const P = (V) => k / V, ans = (P(V2) - P(V1)) / (V2 - V1);
        return {
          prompt: t`Gas held at constant temperature obeys Boyle’s law, $P = ${k}/V$, with $P$ in kPa and $V$ in litres. What is the average rate of change of pressure with volume as the gas expands from $${V1}$ L to $${V2}$ L?`,
          answer: ans, units: 'kPa/L', tol: { rel: 0.005 },
          errors: [{ value: P(V2) - P(V1), feedback: t`That is $\Delta P$ alone. Divide by $\Delta V = ${V2 - V1}$ L to get a rate.` }],
          hints: [t`Find $P(${V1})$ and $P(${V2})$ first.`, t`Then $\dfrac{\Delta P}{\Delta V} = \dfrac{P(${V2}) - P(${V1})}{${V2} - ${V1}}$; expect a negative answer — the pressure falls.`],
          teach: t`A falling quantity has a negative average rate of change: the secant slopes downhill.`,
          explain: t`$P(${V1}) = ${nice(P(V1))}$ kPa and $P(${V2}) = ${nice(P(V2))}$ kPa, so $\dfrac{\Delta P}{\Delta V} = \dfrac{${nice(P(V2) - P(V1))}}{${V2 - V1}} = ${nice(ans)}$ kPa/L. (It equals $-${k}/(${V1}\cdot ${V2})$: for $P = k/V$ the quotient is always $-k/(V_1V_2)$.)`,
          visual: secantFig({ fn: `${k}/x`, f: P, x1: V1, x2: V2, x: [0, 9.5], y: [0, k / 1.6], xlabel: 'V (L)', ylabel: 'P (kPa)', caption: t`Boyle’s law $P = ${k}/V$ and the secant between the two volumes. Real gases follow it closely at modest pressures.`, extra: { curves: [{ fn: `${k}/x`, color: 'accent', domain: [1.7, 9.5] }, { fn: chord(V1, P(V1), V2, P(V2)), color: 'violet', dash: true, domain: [V1 - 0.4, V2 + 0.4] }] } }),
        };
      },
    }),
    expr({
      id: 'dq-reciprocal', difficulty: 3,
      gen(r) {
        const k = r.int(2, 9);
        return {
          prompt: t`Simplify the difference quotient of $f(x) = \dfrac{${k}}{x}$.`,
          lhs: t`\frac{f(x+h) - f(x)}{h}`,
          answer: `-${k}/(x(x+h))`,
          answerTeX: t`-\frac{${k}}{x(x+h)}`,
          vars: { x: [0.5, 3], h: [0.1, 1] },
          errors: [
            { answer: `${k}/(x(x+h))`, feedback: t`Check the sign: $\frac{${k}}{x+h} - \frac{${k}}{x} = \frac{${k}x - ${k}(x+h)}{x(x+h)}$, and the numerator is $-${k}h$.` },
            { answer: `-${k}/x^2`, feedback: t`That is the limit as $h \to 0$. For a nonzero step the denominator is $x(x+h)$.` },
          ],
          hints: [t`Put the two fractions over the common denominator $x(x+h)$.`, t`$\frac{${k}}{x+h} - \frac{${k}}{x} = \frac{-${k}h}{x(x+h)}$.`, t`Dividing by $h$ cancels the $h$ on top.`],
          teach: t`For a quotient like $k/x$, combine the fractions first; then the factor $h$ appears and cancels.`,
          explain: t`$\dfrac{1}{h}\left(\dfrac{${k}}{x+h} - \dfrac{${k}}{x}\right) = \dfrac{1}{h}\cdot\dfrac{-${k}h}{x(x+h)} = -\dfrac{${k}}{x(x+h)}$. Negative, as it must be: $${k}/x$ falls everywhere on $x > 0$.`,
          visual: secantFig({ fn: `${k}/x`, f: (x) => k / x, x1: 1, x2: 2.2, x: [0, 4], y: [-0.3, k * 1.25], l1: 'x', l2: 'x + h', extra: { curves: [{ fn: `${k}/x`, color: 'accent', domain: [0.75, 4] }, { fn: chord(1, k, 2.2, k / 2.2), color: 'violet', dash: true, domain: [0.85, 2.4] }] }, caption: t`$y = ${k}/x$ and a secant: it slopes downhill, so expect a negative quotient.` }),
        };
      },
    }),
    mcq({
      id: 'round-trip', difficulty: 2,
      prompt: t`A sounding rocket lifts off from a launch pad at sea level, reaches an apogee of $80$ km, and its payload splashes down in the sea $9$ minutes after launch. What is its average vertical velocity over the whole flight?`,
      visual: { type: 'graph', params: { x: [-0.4, 9.8], y: [-8, 92], aspect: 'wide', xlabel: 't (min)', ylabel: 'altitude (km)', curves: [{ fn: '3.95*x*(9 - x)', color: 'accent', domain: [0, 9] }, { fn: '0', color: 'violet', dash: true, domain: [0, 9] }], points: [{ x: 0, y: 0, label: 'launch', color: 'gold', labelDy: 14 }, { x: 9, y: 0, label: 'splashdown', color: 'gold', labelDy: 14, labelAlign: 'right' }] }, caption: t`Altitude against time. The real trajectory is not an exact parabola — parachutes slow the descent — but only the two end points matter here.` },
      choices: ['0 km/min', '8.9 km/min (apogee divided by the flight time)', '17.8 km/min (apogee divided by the time to apogee)', 'It is undefined, because the rocket reversed direction'],
      answer: 0,
      why: {
        1: 'Apogee is not the change in altitude: the rocket ended where it started, at sea level.',
        2: 'That is the average over the climb only. The question asks about the whole flight, launch to splashdown.',
        3: 'An average rate needs only the two end values; what happens in between does not matter.',
      },
      hints: ['An average rate of change uses only the values at the two ends of the interval.', 'What is the altitude at launch, and at splashdown?'],
      teach: 'Average rate of change sees only the end points: a round trip has zero net change and zero average rate.',
      explain: t`$\Delta h = 0 - 0 = 0$, so $\Delta h/\Delta t = 0$. The secant is the flat dashed line. The *average speed* is not zero — but that is a different quantity, total distance over time.`,
    }),
    num({
      id: 'central', difficulty: 3,
      gen(r) {
        const t0 = r.int(3, 8), d = r.pick([0.5, 1]);
        const [hA, hB, hC] = [t0 - d, t0, t0 + d].map((x) => Math.round(burn(x)));
        const ans = (hC - hA) / (2 * d), fwd = (hC - hB) / d, bwd = (hB - hA) / d;
        return {
          prompt: t`An altimeter logs a rocket’s altitude every $${d}$ s:

$$\begin{array}{c|c|c|c} t\ (\text{s}) & ${nice(t0 - d)} & ${t0} & ${nice(t0 + d)} \\ \hline h\ (\text{m}) & ${hA} & ${hB} & ${hC} \end{array}$$

Estimate the vertical velocity at $t = ${t0}$ s with the **symmetric** interval — the readings on either side of it.`,
          answer: ans, units: 'm/s', tol: { rel: 0.004 },
          errors: [{ value: fwd, feedback: t`That is the forward quotient over $[${t0}, ${nice(t0 + d)}]$. The symmetric interval is $[${nice(t0 - d)}, ${nice(t0 + d)}]$, centred on $t = ${t0}$ s.` }, { value: bwd, feedback: t`That is the backward quotient over $[${nice(t0 - d)}, ${t0}]$. Use the readings on both sides.` }],
          hints: [t`Use the first and last readings: they straddle $t = ${t0}$ s.`, t`The interval is $${2 * d}$ s long, so divide $${hC} - ${hA}$ by $${2 * d}$.`],
          teach: t`A symmetric difference quotient $\frac{f(a+h) - f(a-h)}{2h}$ is centred on $a$ and usually far more accurate than a one-sided one.`,
          explain: t`$\dfrac{${hC} - ${hA}}{${2 * d}} = ${nice(ans)}$ m/s. The one-sided quotients give $${nice(bwd)}$ and $${nice(fwd)}$ m/s; a speeding-up rocket makes the backward one too small and the forward one too big, and the centred one splits the difference.`,
          visual: { type: 'graph', params: { x: [t0 - 3, t0 + 3], y: [burn(t0 - 3) * 0.8, burn(t0 + 3) * 1.05], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: BURN, color: 'accent', domain: [t0 - 3, t0 + 3], dash: true, width: 1.4 }, { fn: chord(t0 - d, hA, t0 + d, hC), color: 'violet', dash: true, domain: [t0 - 2, t0 + 2] }], points: [{ x: t0 - d, y: hA, color: 'gold' }, { x: t0, y: hB, color: 'gold' }, { x: t0 + d, y: hC, color: 'gold' }] }, caption: t`The three readings (gold) and the symmetric secant through the outer two. The dashed curve is the altitude between samples, which the altimeter does not record.` },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-dq-cubic', difficulty: 3,
      gen(r) {
        const k = r.intExcept(-5, 5, [0]);
        const f = (x) => x ** 3 + k * x;
        return {
          prompt: t`Simplify the difference quotient of $f(x) = x^3 ${k < 0 ? '-' : '+'} ${Math.abs(k)}x$.`,
          lhs: t`\frac{f(x+h) - f(x)}{h}`,
          answer: `3x^2 + 3x h + h^2 + (${k})`,
          answerTeX: t`3x^2 + 3xh + h^2 ${k < 0 ? '-' : '+'} ${Math.abs(k)}`,
          vars: { x: [-2, 2], h: [0.1, 1] },
          errors: [{ answer: `3x^2 + (${k})`, feedback: t`That is the limit as $h \to 0$; with a nonzero step the terms $3xh + h^2$ remain.` }],
          hints: [t`$(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$.`, t`After subtracting $f(x)$, divide each remaining term by $h$.`],
          teach: t`Expand, cancel the terms without $h$, divide by $h$.`,
          explain: t`$f(x+h) - f(x) = 3x^2h + 3xh^2 + h^3 ${k < 0 ? '-' : '+'} ${Math.abs(k)}h$; dividing by $h$ gives $3x^2 + 3xh + h^2 ${k < 0 ? '-' : '+'} ${Math.abs(k)}$.`,
          visual: secantFig({ fn: `x^3 + (${k})*x`, f, x1: -0.5, x2: 1.3, x: [-2.4, 2.4], y: [-9, 9], l1: 'x', l2: 'x + h', caption: t`$y = x^3 ${k < 0 ? '-' : '+'} ${Math.abs(k)}x$ and one secant.` }),
        };
      },
    }),
    num({
      id: 'cp-mass-flow', difficulty: 2, transfer: true,
      gen(r) {
        const mdot = r.pick([12, 14, 16, 18, 22]), m1 = 400 + 2 * r.int(0, 30), t1 = r.int(2, 5), t2 = t1 + r.int(6, 10);
        const m2 = m1 - mdot * (t2 - t1);
        return {
          prompt: t`On a static test stand, load cells weigh the propellant left in an engine’s tanks. They read $${m1}$ kg at $t = ${t1}$ s and $${m2}$ kg at $t = ${t2}$ s. What is the average rate of change of the propellant mass over that interval?`,
          answer: -mdot, units: 'kg/s', tol: { rel: 0.005 },
          errors: [{ value: m2 / t2, feedback: t`That divides a mass by a clock time. The average rate is $\Delta m / \Delta t$.` }],
          hints: [t`$\dfrac{\Delta m}{\Delta t} = \dfrac{m_2 - m_1}{t_2 - t_1}$ — the mass falls, so expect a negative number.`],
          teach: t`The average rate of change of a tank’s mass is the negative of the average mass flow rate out of it.`,
          explain: t`$\dfrac{${m2} - ${m1}}{${t2} - ${t1}} = \dfrac{${m2 - m1}}{${t2 - t1}} = ${-mdot}$ kg/s. The engine burned on average $${mdot}$ kg of propellant every second.`,
          visual: { type: 'graph', params: { x: [0, 16], y: [0, m1 * 1.15], aspect: 'wide', xlabel: 't (s)', ylabel: 'propellant (kg)', curves: [{ fn: chord(t1, m1, t2, m2), color: 'accent', domain: [t1 - 1, t2 + 1] }], points: [{ x: t1, y: m1, label: 'P', color: 'gold' }, { x: t2, y: m2, label: 'Q', color: 'gold' }] }, caption: 'The two load-cell readings. A steady burn makes the record nearly a straight line; start-up and shutdown transients are left out.' },
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: t`Over the first $20$ minutes after a cryogenic tank is vented, its temperature has an average rate of change of $-3.2$ K/min. Which statement must be true?`,
      visual: secantFig({ fn: '110 - 3.2*x + 6*sin(pi*x/5)', f: (x) => 110 - 3.2 * x + 6 * Math.sin(Math.PI * x / 5), x1: 0, x2: 20, x: [-1, 22], y: [30, 124], xlabel: 't (min)', ylabel: 'T (K)', caption: 'One temperature record consistent with the statement. The wiggles are illustrative.' }),
      choices: [
        t`$T(20)$ is $64$ K lower than $T(0)$`,
        'The temperature fell by exactly 3.2 K during every minute',
        'The temperature never rose during the 20 minutes',
        'The temperature after 20 minutes is −3.2 K',
      ],
      answer: 0,
      why: {
        1: 'An average says nothing about individual minutes: the drop could have been fast at first and slow later.',
        2: 'The average allows the temperature to rise for a while, as long as the net change over 20 minutes is −64 K.',
        3: 'The rate is a change per minute, not a temperature; and no temperature is below 0 K.',
      },
      hints: ['Average rate = (net change) / (elapsed time). Turn it around to get the net change.'],
      teach: 'An average rate of change fixes only the net change between the end points, not what happens in between.',
      explain: t`Net change $= (\text{average rate}) \times \Delta t = (-3.2\ \text{K/min})(20\ \text{min}) = -64$ K. Nothing else about the path is fixed — the record in the picture rises at times and still averages $-3.2$ K/min.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §1.1 Review of functions', url: 'https://openstax.org/books/calculus-volume-1/pages/1-1-review-of-functions' },
    { label: 'OpenStax Calculus Vol. 1, §2.1 A preview of calculus', url: 'https://openstax.org/books/calculus-volume-1/pages/2-1-a-preview-of-calculus' },
  ],
});
