// Impulses and the delta function, taught as the limit of ever narrower pulses
// of area 1: the pulse's transform tends to e^{−as}, its response to the
// impulse response, and what survives is the area — the impulse ∫F dt, a
// jump in velocity, not in position. The sifting rule ∫ g δ(t − a) dt = g(a),
// a hammer blow on a spring, a sack of salt dumped in a tank, and a test
// stand's load cell ringing after an engine's hard start.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co, sg, lead } from './_second.js';
import { fpic, n } from './_laplace.js';

const t = String.raw;

// the Explore: x″ + x = d_ε(t − 1), a pulse of width ε and height 1/ε, from rest
const PULSE = '(step(x - 1) - step(x - 1 - eps))/eps';
const RESP = '((1 - cos(x - 1))*step(x - 1) - (1 - cos(x - 1 - eps))*step(x - 1 - eps))/eps';

/** A delta δ(t − a) drawn the conventional way: an arrow whose height is its strength. */
const spike = (a, J = 1, color = 'gold', label = null) => ({ from: [a, 0], to: [a, J], color, width: 2.6, label: label ?? (J === 1 ? 'δ' : `${J}δ`), labelDx: 8, labelDy: 0 });

export default lesson({
  id: 'math2280.DE-6.4',
  title: 'Impulses and the delta function',
  minutes: 13, difficulty: 3,
  intro: t`A hammer blow, a kick, a pyrotechnic bolt firing: a large force for a very short time. What the motion remembers is not the force’s shape but its **impulse**, the area $\int F\,dt$ — the momentum it delivers. So model a unit blow at time $a$ by a pulse of width $\varepsilon$ and height $1/\varepsilon$, whose area is always 1, and let it narrow:

$$\mathcal{L}\left\{\frac{u(t - a) - u(t - a - \varepsilon)}{\varepsilon}\right\} = e^{-as}\,\frac{1 - e^{-\varepsilon s}}{\varepsilon s} \;\xrightarrow{\;\varepsilon \to 0\;}\; e^{-as}$$

since $1 - e^{-\varepsilon s} \approx \varepsilon s$ for small $\varepsilon$. The **Dirac delta** $\delta(t - a)$ is this limit. It is not a function — no function is zero everywhere except one point and still has area 1 — but a rule for integrals, $\int g(t)\,\delta(t - a)\,dt = g(a)$, with $\mathcal{L}\{\delta(t - a)\} = e^{-as}$. The response to $\delta(t)$ from rest is a system’s **impulse response**.`,
  symbols: [
    { tex: t`\varepsilon`, text: t`the pulse’s duration, in s; the delta is the limit $\varepsilon \to 0$` },
    { tex: t`\tfrac{1}{\varepsilon}`, text: 'its height, so that the area — the impulse — stays exactly 1' },
    { tex: t`\delta(t - a)`, text: t`the unit impulse at time $a$: the limit of those pulses, defined by what it does inside an integral` },
    { tex: t`a`, text: t`when the blow lands, in s` },
    { tex: t`e^{-as}`, text: t`its transform: a delay of $a$ applied to $\mathcal{L}\{\delta(t)\} = 1$` },
  ],
  why: t`Every linear system is fully described by its impulse response: next lesson shows how the response to any input is built from it, one small kick at a time.`,
  visual: {
    type: 'graph',
    title: 'Narrower and taller, same area',
    lead: t`A cart on a spring ($x'' + x = f$, from rest) is hit by a pulse of width $\varepsilon$ and height $1/\varepsilon$ starting at $t = 1$ (gold, shaded: its area is always 1). Narrow the pulse and watch the response (blue) settle onto one curve — the dashed impulse response $\sin(t - 1)$.`,
    tasks: [
      'Shrink ε from 1 to 0.05: the pulse grows taller and runs off the top, but the response hardly changes once ε is much shorter than the 6.3 s period.',
      'Look at t = 1 in the limit: the position does not jump, but the slope jumps from 0 to 1. An impulse is a sudden change of velocity.',
      'Widen the pulse to ε = 2π ≈ 6.3 s: a push that lasts a whole period leaves the cart at rest. A wide pulse is not an impulse.',
    ],
    params: {
      x: [0, 14], y: [-1.6, 2.6], xlabel: 't (s)', ylabel: 'x',
      sliders: [{ key: 'eps', label: 'Pulse width $\\varepsilon$', min: 0.02, max: 6.5, step: 0.01, value: 1, unit: t`\text{s}`, explain: t`The pulse’s height is $1/\varepsilon$, so its area — the impulse — is always 1.` }],
      shade: [{ fn: PULSE, from: 1, to: '1 + eps', color: 'gold', alpha: 0.25 }],
      curves: [
        { fn: PULSE, color: 'gold', width: 1.8, domain: [0.5, 14] },
        { fn: 'sin(x - 1)*step(x - 1)', color: 'ink3', dash: true, width: 1.8 },
        { fn: RESP, color: 'accent', width: 2.8 },
      ],
      legend: [{ label: 'response to the pulse', color: 'accent' }, { label: 'impulse response sin(t − 1)', color: 'ink3', dash: [6, 5] }, { label: 'pulse, area 1', color: 'gold' }],
      legendAt: 'tr',
      readouts: [{ label: 'pulse height $1/\\varepsilon$', expr: '1/eps', unit: t`\text{s}^{-1}`, digits: 3 }, { label: 'area', expr: '1' }],
    },
    caption: t`$x'' + x = \big[u(t - 1) - u(t - 1 - \varepsilon)\big]/\varepsilon$ from rest, solved exactly; units with $k/m = 1\ \text{s}^{-2}$ and a unit impulse per unit mass. A tall pulse runs off the top of the plot; its area is shaded where it shows.`,
  },
  example: {
    prompt: t`A damped oscillator at rest is struck at $t = 1$ s with a unit impulse: $\;y'' + 2y' + 5y = \delta(t - 1)$, $y(0) = y'(0) = 0$. Find $y(t)$.`,
    visual: fpic('0.5*exp(-(x - 1))*sin(2(x - 1))*step(x - 1)', [0, 6], [-0.25, 1.1], t`The response (blue) to the blow at $t = 1$ (gold arrow: a delta is drawn as an arrow whose height is its area). The position starts smoothly; the velocity jumps.`, { ylabel: 'y', arrows: [spike(1)] }),
    steps: [
      { label: 'Transform', text: t`$\mathcal{L}\{\delta(t - 1)\} = e^{-s}$, and from rest the left side is $(s^2 + 2s + 5)Y$: $\;Y = \dfrac{e^{-s}}{s^2 + 2s + 5}$.` },
      { label: 'Without the delay', text: t`Complete the square: $\dfrac{1}{(s + 1)^2 + 4} = \dfrac12\cdot\dfrac{2}{(s + 1)^2 + 4}$, the transform of $\tfrac12 e^{-t}\sin 2t$ (first shift).` },
      { label: 'Delay', text: t`The factor $e^{-s}$ delays it by 1 s: $\;y(t) = \tfrac12\,e^{-(t - 1)}\sin\big(2(t - 1)\big)\,u(t - 1)$.` },
      { label: 'What the blow did', text: t`Just after $t = 1$, $y \approx \tfrac12\cdot 2(t - 1) = t - 1$: the position is still 0, but $y'(1^+) = 1$. A unit impulse on a unit mass changes its velocity by exactly 1 — Newton’s second law integrated across the blow, $\int F\,dt = \Delta(mv)$.` },
      { label: 'Sense check', text: t`For $t > 1$ the right side is 0, and $\tfrac12 e^{-(t-1)}\sin 2(t-1)$ solves $y'' + 2y' + 5y = 0$ (roots $-1 \pm 2i$) with $y = 0$, $y' = 1$ at $t = 1$. The delta is equivalent to those two conditions.` },
    ],
    answer: t`$y(t) = \tfrac12\,e^{-(t - 1)}\sin\big(2(t - 1)\big)\,u(t - 1)$.`,
  },
  practice: [
    mcq({
      id: 'which-pulses', difficulty: 1,
      prompt: t`Which family of pulses, as $\varepsilon \to 0$, approaches the unit impulse $\delta(t)$?`,
      choices: [
        t`Height $1/\varepsilon$, width $\varepsilon$`,
        t`Height 1, width $\varepsilon$`,
        t`Height $1/\varepsilon^2$, width $\varepsilon$`,
        t`Height $1/\varepsilon$, width $2\varepsilon$`,
      ],
      answer: 0,
      why: {
        1: 'Its area ε shrinks to zero: these blows deliver less and less impulse and, in the limit, nothing at all.',
        2: t`Its area $1/\varepsilon$ grows without bound: no finite impulse.`,
        3: t`Its area is 2 for every $\varepsilon$: it approaches $2\delta(t)$, an impulse twice as strong.`,
      },
      hints: ['What must stay the same while the pulse narrows?', 'The impulse is the area: height × width. Which family keeps it equal to 1?'],
      teach: t`The delta is the limit of pulses whose area — the impulse — is held at 1 while their width shrinks to zero.`,
      explain: t`Height $1/\varepsilon$ times width $\varepsilon$ is 1 for every $\varepsilon$. Their transforms $\dfrac{1 - e^{-\varepsilon s}}{\varepsilon s}$ tend to 1, which is $\mathcal{L}\{\delta(t)\}$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 4.6], y: [0, 4.9], xlabel: '', ylabel: '', aspect: 'wide', xticks: 0,
          shade: [[0, 2, 0.5, 'accent'], [1.2, 1, 0.5, 'teal'], [2.4, 4, 0.5, 'violet'], [3.6, 2, 1, 'gold']].map(([x0, h, w, color]) => ({ fn: String(h), from: x0, to: x0 + w, color, alpha: 0.25 })),
          curves: [[0, 2, 0.5, 'accent'], [1.2, 1, 0.5, 'teal'], [2.4, 4, 0.5, 'violet'], [3.6, 2, 1, 'gold']].map(([x0, h, w, color]) => ({ fn: `${h}*(step(x - ${x0}) - step(x - ${x0 + w}))`, color, width: 2, domain: [x0 - 0.1, x0 + w + 0.1] })),
          points: [[0, 2, 'height 1/ε, width ε', 'accent'], [1.2, 1, 'height 1, width ε', 'teal'], [2.4, 4, 'height 1/ε², width ε', 'violet'], [3.6, 2, 'height 1/ε, width 2ε', 'gold']].map(([x0, h, label, color]) => ({ x: x0, y: h, r: 0, color, label, labelDx: 0, labelDy: -12 })),
        },
        caption: t`One pulse from each family, all drawn at $\varepsilon = 0.5$ and set side by side. Shrink $\varepsilon$ in your head: which one keeps the same area?`,
      },
    }),
    num({
      id: 'sift', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 1.5, 2, 3]), c = r.int(1, 4), k = r.pick([0.5, 1]);
        const val = (a * a + c) * Math.exp(-k * a);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^\infty \big(t^2 + ${c}\big)\,e^${k === 1 ? '{-t}' : '{-t/2}'}\,\delta(t - ${a})\,dt$.`,
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: 'The delta has area 1, but it is weighted: it picks out the value of the rest of the integrand at its location.' }, { value: c, feedback: t`Evaluate at $t = ${a}$, where the impulse sits, not at $t = 0$.` }].filter((e) => Math.abs(e.value - val) > 0.02 * val),
          hints: [t`The delta picks out one value: $\int g(t)\,\delta(t - a)\,dt = g(a)$.`, t`So the integral is $g(${a}) = (${a}^2 + ${c})\,e^{-${n(k * a)}}$.`],
          teach: t`Sifting: integrating against $\delta(t - a)$ returns the value of the rest of the integrand at $t = a$.`,
          explain: t`$g(${a}) = (${n(a * a)} + ${c})\,e^{-${n(k * a)}} = ${fmt(val, 4)}$. Why: replace $\delta$ by a pulse of width $\varepsilon$; the integral is the **average** of $g$ over $[${a}, ${a} + \varepsilon]$, which tends to $g(${a})$.`,
          visual: fpic(`(x^2 + ${c})*exp(-${k}x)`, [0, 6], [0, Math.max(...[0, 1, 2, 3, 4].map((x) => (x * x + c) * Math.exp(-k * x))) * 1.25], t`The weight $g(t)$ (blue) and the impulse at $t = ${a}$ (gold arrow, height 1 = its area).`, { ylabel: '', arrows: [spike(a)] }),
        };
      },
    }),
    expr({
      id: 'transform-delta', difficulty: 1,
      gen(r) {
        const J = r.int(2, 9), a = r.int(1, 4), B = r.int(2, 6), b = a + r.int(1, 3);
        return {
          prompt: t`A spacecraft’s thruster fires a short pulse of impulse ${J} N·s at $t = ${a}$ s, and a steady ${B} N push switches on at $t = ${b}$ s: $\;f(t) = ${J}\,\delta(t - ${a}) + ${B}\,u(t - ${b})$. Find $\mathcal{L}\{f\}$.`,
          answer: `${J}*e^(-${a}s) + ${B}*e^(-${b}s)/s`, answerTeX: t`${J}e^{-${co(a)}s} + \frac{${B}e^{-${b}s}}{s}`, lhs: 'F(s)',
          vars: { s: [0.3, 2] },
          errors: [
            { answer: `${J}*e^(-${a}s)/s + ${B}*e^(-${b}s)/s`, feedback: t`$\mathcal{L}\{\delta(t - a)\} = e^{-as}$, with no $1/s$: the $1/s$ belongs to the step.` },
            { answer: `${J} + ${B}*e^(-${b}s)/s`, feedback: t`The impulse is at $t = ${a}$, not $t = 0$: its transform carries the delay factor $e^{-${a}s}$.` },
          ],
          hints: [t`$\mathcal{L}\{\delta(t - a)\} = e^{-as}$ and $\mathcal{L}\{u(t - b)\} = e^{-bs}/s$.`],
          teach: t`A delta at $a$ transforms to $e^{-as}$; a step at $b$ to $e^{-bs}/s$.`,
          explain: t`$F(s) = ${J}e^{-${co(a)}s} + \dfrac{${B}e^{-${b}s}}{s}$. The impulse’s transform does not fall off with $s$ — a sign of something infinitely sharp.`,
          visual: fpic(`${B}*step(x - ${b})`, [0, b + 3], [0, Math.max(J, B) * 1.25], t`The forcing: an impulse of ${J} N·s at $t = ${a}$ (arrow, height = its area) and a ${B} N step at $t = ${b}$.`, { ylabel: 'N', arrows: [spike(a, J, 'gold', `${J} N·s`)] }),
        };
      },
    }),
    num({
      id: 'hammer', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1, 2, 4]), k = r.pick([50, 200, 800]), J = r.pick([0.5, 1, 2, 3]);
        const w0 = Math.sqrt(k / m), amp = J / (m * w0);
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${k}$ N/m hangs at rest. A hammer strikes it with an impulse of ${J} N·s, so $${m}\,x'' + ${k}\,x = ${co(J)}\,\delta(t)$. What is the amplitude of the oscillation that follows?`,
          answer: amp, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: J / m, feedback: t`That is the speed the blow gives the mass, $J/m$, in m/s. The amplitude is that speed divided by $\omega_0$.` }, { value: J / k, feedback: t`That would be a static push. Transform: $X = \dfrac{${J}}{${m}s^2 + ${k}}$.` }].filter((e) => Math.abs(e.value - amp) > 0.02 * amp),
          hints: [t`$X(s) = \dfrac{${J}}{${m}s^2 + ${k}} = \dfrac{${n(J / m)}}{s^2 + ${n(k / m)}}$.`, t`$\mathcal{L}^{-1}\left\{\dfrac{1}{s^2 + \omega_0^2}\right\} = \dfrac{\sin\omega_0t}{\omega_0}$ with $\omega_0 = \sqrt{${n(k / m)}}$.`],
          teach: t`A blow of impulse $J$ gives a mass at rest the speed $J/m$; it then oscillates with amplitude $J/(m\omega_0)$.`,
          explain: t`$x = \dfrac{J}{m\omega_0}\sin\omega_0 t$ with $\omega_0 = \sqrt{${k}/${m}} = ${fmt(w0, 3)}$ rad/s: amplitude $\dfrac{${J}}{${m}\times${fmt(w0, 3)}} = ${fmt(amp, 3)}$ m. The impulse model holds because a hammer’s contact lasts about a millisecond, far shorter than the ${fmt((2 * Math.PI) / w0, 2)} s period.`,
          visual: fpic(null, [0, 6], [0, 3.6], t`A sketch of the hammer’s force: whatever its exact shape, only its area — the impulse — matters when the contact is much shorter than the period. Not to scale.`, { xlabel: 't (ms)', ylabel: 'force', curves: [{ fn: '3*exp(-((x - 1.5)/0.35)^2)', color: 'gold', width: 2.4 }], shade: [{ fn: '3*exp(-((x - 1.5)/0.35)^2)', from: 0, to: 6, color: 'gold', alpha: 0.22 }], points: [{ x: 2.1, y: 1.6, r: 0, color: 'gold', label: 'area = impulse J', labelDx: 6, labelDy: 0 }] }),
        };
      },
    }),
    expr({
      id: 'delta-solve', difficulty: 2,
      gen(r) {
        const w = r.int(2, 4), A = r.int(1, 6), a = r.int(1, 3);
        const ans = `${A}/${w}*sin(${w}*(t - ${a}))`;
        return {
          prompt: t`Solve $y'' + ${w * w}y = ${co(A)}\delta(t - ${a})$ with $y(0) = y'(0) = 0$, and give $y(t)$ for $t > ${a}$.`,
          answer: ans, answerTeX: t`\frac{${A}}{${w}}\sin\big(${w}(t - ${a})\big)`, lhs: 'y(t)',
          vars: { t: [a + 0.05, a + 4] },
          errors: [
            { answer: `${A}*sin(${w}*(t - ${a}))`, feedback: t`$\dfrac{1}{s^2 + ${w * w}}$ is $\dfrac{1}{${w}}\sin ${w}t$: divide by $\omega$.` },
            { answer: `${A}/${w}*sin(${w}t)`, feedback: t`The blow lands at $t = ${a}$: the factor $e^{-${co(a)}s}$ delays the response, so $t$ becomes $t - ${a}$.` },
            { answer: `${A}/${w}*cos(${w}*(t - ${a}))`, feedback: t`Just after the blow the position is still 0 — it is the velocity that jumps. So the response starts like a sine.` },
          ],
          hints: [t`$Y = \dfrac{${A}e^{-${co(a)}s}}{s^2 + ${w * w}}$.`, t`Invert $\dfrac{${A}}{s^2 + ${w * w}}$ to $\dfrac{${A}}{${w}}\sin ${w}t$, then delay by ${a}.`],
          teach: t`The response to $A\,\delta(t - a)$ from rest is $A$ times the impulse response, delayed by $a$.`,
          explain: t`$y = \dfrac{${A}}{${w}}\sin\big(${w}(t - ${a})\big)$ for $t > ${a}$ (and 0 before). At $t = ${a}^+$: $y = 0$ and $y' = ${A}$ — the blow’s impulse, per unit mass.`,
          visual: fpic(null, [0, a + 4], [0, A * 1.3], t`The forcing: an impulse of strength ${A} at $t = ${a}$, drawn as an arrow.`, { ylabel: '', arrows: [spike(a, A)] }),
        };
      },
    }),
    expr({
      id: 'salt-dump', difficulty: 2,
      gen(r) {
        const k = r.pick([0.1, 0.2, 0.25]), S0 = r.int(2, 8), J = r.int(3, 9), a = r.int(2, 6);
        const ans = `${S0}*e^(-${k}t) + ${J}*e^(-${k}*(t - ${a}))`;
        return {
          prompt: t`A well-mixed tank flushed with fresh water holds $S(t)$ kg of salt, with $S' + ${k}S = 0$ ($t$ in min) and $S(0) = ${S0}$ kg. At $t = ${a}$ min a ${J} kg sack of salt is tipped in at once: $\;S' + ${k}S = ${J}\,\delta(t - ${a})$. Find $S(t)$ for $t > ${a}$.`,
          answer: ans, answerTeX: t`${S0}e^{-${k}t} + ${J}e^{-${k}(t - ${a})}`, lhs: 'S(t)',
          vars: { t: [a + 0.05, a + 10] },
          integrand: `-${k}*(${ans})`,
          errors: [
            { answer: `${S0}*e^(-${k}t) + ${J}*e^(-${k}t)`, feedback: t`The salt arrives at $t = ${a}$ and only starts draining then: its term is $${J}e^{-${k}(t - ${a})}$.` },
            { answer: `${S0 + J}*e^(-${k}*(t - ${a}))`, feedback: t`By $t = ${a}$ the original ${S0} kg had already drained to $${S0}e^{-${n(k * a)}}$ kg.` },
          ],
          hints: [t`Transform: $sS - ${S0} + ${k}S = ${J}e^{-${a}s}$, so $S(s) = \dfrac{${S0}}{s + ${k}} + \dfrac{${J}e^{-${a}s}}{s + ${k}}$.`],
          teach: t`A delta in a first-order equation makes the solution jump by the delta’s strength; afterwards both parts decay together.`,
          explain: t`$S = ${S0}e^{-${k}t} + ${J}e^{-${k}(t - ${a})}u(t - ${a})$: at $t = ${a}$ the salt jumps up by ${J} kg — for a first-order equation the delta makes the solution itself jump — and then everything flushes out at the same rate.`,
          visual: fpic(`${S0}*exp(-${k}x)`, [0, a + 10], [0, (S0 + J) * 1.15], t`The salt before the sack arrives (blue), and the delivery at $t = ${a}$ (gold arrow, ${J} kg).`, { xlabel: 't (min)', ylabel: 'kg', domain: [0, a], arrows: [spike(a, J, 'gold', `${J} kg`)] }),
        };
      },
    }),
    mcq({
      id: 'zero-width', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “The force $F_0\,\delta(t)$ is zero at every instant except $t = 0$, and a single instant has no duration. So it cannot change anything’s velocity.” What is wrong?`,
      choices: [
        t`The delta is defined by its integral, not its values: $\int F_0\delta(t)\,dt = F_0$, so it delivers momentum $F_0$, as every narrow pulse in its family does`,
        'Nothing: the delta function only affects the position, not the velocity',
        t`The force is infinite at $t = 0$, so the velocity becomes infinite`,
        t`$\delta(0) = 1$, so the force is $F_0$ for an instant`,
      ],
      answer: 0,
      why: {
        1: 'It is the other way round: across an impulse the position is continuous and the velocity jumps.',
        2: t`The velocity jumps by a finite amount, $F_0/m$: the area is finite even though the height is not.`,
        3: t`$\delta(0)$ has no value: the delta is not a function. Each pulse in its family has height $1/\varepsilon$, which grows without bound.`,
      },
      hints: ['Go back to the pulses the delta is the limit of. How much momentum does each one deliver?', t`A pulse of height $F_0/\varepsilon$ and width $\varepsilon$ delivers $\int F\,dt = F_0$, for every $\varepsilon$.`],
      teach: t`The delta is defined by what it does in integrals: $F_0\delta(t)$ delivers the impulse $F_0$, a finite jump in momentum.`,
      explain: t`Its values say nothing; its integral says everything. Each pulse in the family delivers momentum $F_0$, however brief, and so does their limit: $m\Delta v = F_0$. That is exactly why the delta models a collision or a kick.`,
      visual: fpic('3*(step(x) - step(x - 0.25))', [-0.5, 1.5], [0, 3.6], t`One pulse from the family: height $F_0/\varepsilon$, width $\varepsilon$, area $F_0$.`, { ylabel: 'force', domain: [-0.5, 1.5], shade: [{ fn: '3', from: 0, to: 0.25, color: 'gold', alpha: 0.25 }] }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-damped-kick', difficulty: 3,
      gen(r) {
        const c = r.int(1, 2), w = r.int(2, 4), b = r.int(1, 3);
        const ans = `exp(-${c}*(t - ${b}))*sin(${w}*(t - ${b}))/${w}`;
        return {
          prompt: t`Solve $y'' + ${2 * c}y' + ${c * c + w * w}y = \delta(t - ${b})$ from rest, and give $y(t)$ for $t > ${b}$.`,
          answer: ans, answerTeX: t`\frac{1}{${w}}e^{-${co(c)}(t - ${b})}\sin\big(${w}(t - ${b})\big)`, lhs: 'y(t)',
          vars: { t: [b + 0.05, b + 4] },
          errors: [
            { answer: `exp(-${c}t)*sin(${w}t)/${w}`, feedback: t`That is the response to a blow at $t = 0$. The factor $e^{-${co(b)}s}$ delays it by ${b}.` },
            { answer: `exp(-${c}*(t - ${b}))*sin(${w}*(t - ${b}))`, feedback: t`$\dfrac{1}{(s + ${c})^2 + ${w * w}}$ is $\dfrac{1}{${w}}e^{-${co(c)}t}\sin ${w}t$.` },
          ],
          hints: [t`$Y = \dfrac{e^{-${co(b)}s}}{(s + ${c})^2 + ${w * w}}$ after completing the square.`, t`Invert without the delay (first shift), then replace $t$ by $t - ${b}$.`],
          teach: t`Impulse response, delayed: complete the square, invert with the first shift, then apply the second.`,
          explain: t`$y = \dfrac{1}{${w}}e^{-${co(c)}(t - ${b})}\sin\big(${w}(t - ${b})\big)$ for $t > ${b}$: it starts at 0 with slope 1 and rings down at ${w} rad/s.`,
          visual: fpic(null, [0, b + 4], [0, 1.4], t`The forcing: a unit impulse at $t = ${b}$.`, { ylabel: '', arrows: [spike(b)] }),
        };
      },
    }),
    num({
      id: 'cp-hard-start', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([150, 200, 300]), k = r.pick([1e6, 2e6, 4e6]), J = r.pick([200, 400, 600]), z = r.pick([0.02, 0.05, 0.1]);
        const w0 = Math.sqrt(k / m), wd = w0 * Math.sqrt(1 - z * z);
        const ts = Math.atan(Math.sqrt(1 - z * z) / z) / wd;
        const F = (J * w0 * Math.exp(-z * w0 * ts)) / 1000;
        const kT = k / 1e6;
        return {
          prompt: t`At ignition a liquid-rocket engine has a “hard start”: an overpressure spike that delivers ${J} N·s to its test stand in about 2 ms. The thrust plate and load cell behave as a mass–spring–damper with $m = ${m}$ kg, $k = ${kT}\times10^{6}$ N/m and damping ratio $\zeta = ${z}$: $\;m x'' + c x' + k x = ${J}\,\delta(t)$. The load cell reads $kx$. What is the **peak force** it records, in kN?`,
          answer: F, units: 'kN', tol: { rel: 0.01 },
          errors: [...(Math.abs(J * w0 / 1000 - F) > 0.02 * F ? [{ value: (J * w0) / 1000, feedback: 'That is the undamped peak, Jω₀. Damping takes a little off before the first peak arrives.' }] : []), { value: (J / m) / 1000, feedback: 'J/m is the speed the spike gives the plate, in m/s. The force is k times the largest displacement.' }],
          hints: [t`The response is $x = \dfrac{J}{m\omega_d}e^{-\zeta\omega_0 t}\sin\omega_d t$, with $\omega_0 = \sqrt{k/m}$ and $\omega_d = \omega_0\sqrt{1 - \zeta^2}$.`, t`It peaks where $\tan\omega_d t = \sqrt{1 - \zeta^2}/\zeta$; there $\sin\omega_d t = \sqrt{1 - \zeta^2}$, so $kx_{\max} = J\omega_0\,e^{-\zeta\omega_0 t^*}$.`],
          teach: t`An impulse $J$ on a mass–spring–damper peaks at about $J\omega_0$ in force, a little less with damping: a stiffer, lighter mount reads a sharper spike.`,
          explain: t`$\omega_0 = \sqrt{${kT}\times10^6/${m}} = ${fmt(w0, 3)}$ rad/s, the first peak comes at $t^* = ${fmt(ts * 1000, 3)}$ ms, and $F_{\max} = J\omega_0 e^{-\zeta\omega_0 t^*} = ${fmt(F, 3)}$ kN. Treating the 2 ms spike as an impulse is fair because it is short compared with $t^*$; a spike as long as the stand’s quarter-period would read lower. Real stands are calibrated for this ringing.`,
          visual: fpic(null, [0, 8], [0, 1.25], t`A sketch of the hard-start spike: about 2 ms long, its area is the ${J} N·s impulse. Not to scale.`, { xlabel: 't (ms)', ylabel: 'force', curves: [{ fn: 'exp(-((x - 2)/0.6)^2)', color: 'gold', width: 2.4 }], shade: [{ fn: 'exp(-((x - 2)/0.6)^2)', from: 0, to: 8, color: 'gold', alpha: 0.22 }] }),
        };
      },
    }),
    mcq({
      id: 'cp-same-impulse', difficulty: 2,
      prompt: t`A satellite panel with a natural period of 2 s is struck either by (P) 10 kN for 1 ms or by (Q) 1 kN for 10 ms. How do the vibrations that follow compare?`,
      choices: ['About the same: both deliver 10 N·s in a time far shorter than the period', 'P’s is ten times larger: its force is ten times larger', 'Q’s is ten times larger: it pushes ten times longer', 'P’s is a hundred times larger: impulse grows with the square of the force'],
      answer: 0,
      why: {
        1: 'Peak force is not what the panel remembers; the momentum delivered is.',
        2: 'Q pushes longer but with a tenth of the force: the areas are equal.',
        3: t`Impulse is force × time, linear in both: $10\ \text{kN} \times 1\ \text{ms} = 1\ \text{kN} \times 10\ \text{ms} = 10$ N·s.`,
      },
      hints: ['Compute each impulse: force × duration.', 'Both last far less than the 2 s period: each is effectively a delta of its own strength.'],
      teach: 'When a push is much shorter than the natural period, only its impulse matters: equal impulses give the same response.',
      explain: t`Both deliver $10$ N·s, and both last thousands of times less than the 2 s period, so each acts as the force $(10\ \text{N·s})\,\delta(t)$ and the vibrations are the same. Only if a push lasted a sizeable fraction of the period would its shape start to matter.`,
      visual: fpic(null, [-1, 13], [0, 11.5], t`The two pushes, in kN against ms: tall and brief (P), low and long (Q). The panel’s 2 s period is two hundred times the width of this plot.`, { xlabel: 't (ms)', ylabel: 'kN', curves: [{ fn: '10*(step(x) - step(x - 1))', color: 'gold', width: 2.2 }, { fn: '1*(step(x) - step(x - 10))', color: 'teal', width: 2.2 }], shade: [{ fn: '10', from: 0, to: 1, color: 'gold', alpha: 0.22 }, { fn: '1', from: 0, to: 10, color: 'teal', alpha: 0.22 }], points: [{ x: 1, y: 10, r: 0, color: 'gold', label: 'P', labelDx: 6, labelDy: 0 }, { x: 10, y: 1, r: 0, color: 'teal', label: 'Q', labelDx: 6, labelDy: -8 }] }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §6.4 Dirac delta and impulse response', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Dirac delta function', url: 'https://tutorial.math.lamar.edu/Classes/DE/DiracDeltaFunction.aspx' },
    { label: 'G. P. Sutton and O. Biblarz, Rocket Propulsion Elements (9th ed.): engine start and ignition', url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements%2C+9th+Edition-p-9781118753910' },
  ],
});
