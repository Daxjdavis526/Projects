// Step functions and shifted forcing: the unit step u(t − a), piecewise forcing
// written as sums of steps, and the second shift theorem
// L{u(t − a) f(t − a)} = e^{−as}F(s) — a delay is a factor e^{−as}. A cart on a
// spring pushed by a thruster that fires for a fixed time (Lebl's example):
// solve one switch-on, then shift it; the swing a burn leaves behind; the
// classic slip of shifting without shifting f; and an exhaust thermocouple
// through ignition and shutdown.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co, sg, lead } from './_second.js';
import { fpic, n } from './_laplace.js';

const t = String.raw;

// the Explore: x″ + x = u(t − a) − u(t − a − d), from rest
const ON = '(1 - cos(x - a))*step(x - a)', OFF = '(1 - cos(x - a - d))*step(x - a - d)';

/** A rectangular pulse of height A from a to b, as a picture (with an optional response). */
const pulsePic = (A, a, b, T, caption, extra = {}) => fpic(extra.fn ?? null, [0, T], extra.y ?? [-0.15 * A, 1.3 * A], caption, {
  ylabel: extra.ylabel ?? 'f',
  curves: [{ fn: `${A}*(step(x - ${a}) - step(x - ${b}))`, color: 'gold', width: 2.4 }, ...(extra.curves || [])],
});

export default lesson({
  id: 'math2280.DE-6.3',
  title: 'Step functions and shifted forcing',
  minutes: 13, difficulty: 3,
  intro: t`Real forcing switches on and off: a valve opens, a motor ignites and burns out, a heater is turned on. The **unit step** $u(t - a)$ is $0$ before $t = a$ and $1$ after, so $f(t)\,u(t - a)$ is $f$ switched on at time $a$, and a pulse that lasts from $a$ to $b$ is $u(t - a) - u(t - b)$. The transform handles a delay with a single factor:

$$\mathcal{L}\{u(t - a)\,f(t - a)\} = e^{-as}F(s)$$

This is the **second shift theorem**: delaying a function by $a$ multiplies its transform by $e^{-as}$. Read backwards, it says a factor $e^{-as}$ in $Y(s)$ means “the same response, starting $a$ seconds later” — so every switched input is solved once and then shifted.`,
  symbols: [
    { tex: t`u(t - a)`, text: t`the unit (Heaviside) step: $0$ for $t < a$, $1$ for $t > a$. In an answer box, type it as \`step(t - a)\`` },
    { tex: t`a`, text: t`the switch-on time, in s ($a \ge 0$)` },
    { tex: t`f(t - a)`, text: t`$f$ delayed by $a$: its whole graph moved $a$ to the right` },
    { tex: t`F(s)`, text: t`the transform of the undelayed $f(t)$` },
    { tex: t`e^{-as}`, text: t`the delay, as it appears in the $s$-domain` },
  ],
  why: t`Burns, valve sequences and switched circuits are steps and pulses; with the second shift theorem each switch is the same algebra as a single switch-on.`,
  visual: {
    type: 'graph',
    title: 'A thruster burn on a spring',
    lead: t`A cart on a spring ($k/m = 1\ \text{s}^{-2}$) carries a thruster that pushes with $1\ \text{m/s}^2$ per unit mass from $t = a$ to $t = a + d$: $\;x'' + x = u(t - a) - u(t - a - d)$, from rest. The violet curve is the response to switching on; the teal one, to switching off — the same curve, delayed by $d$ and upside down. Their sum (blue) is the motion.`,
    tasks: [
      'Set the burn to one full period, d = 2π ≈ 6.3 s: the cart ends exactly at rest — the switch-off undoes the switch-on.',
      'Set d = π, half a period: the cart is left swinging 2 m each way, twice the 1 m static deflection — the most a burn of this thrust can leave.',
      'Move the start a: the whole motion slides to the right, unchanged. That is all the factor $e^{-as}$ does.',
    ],
    params: {
      x: [0, 20], y: [-2.5, 2.7], xlabel: 't (s)', ylabel: 'x (m)',
      sliders: [
        { key: 'a', label: 'Ignition time $a$', min: 0, max: 5, step: 0.1, value: 1, unit: t`\text{s}`, explain: 'When the thruster starts.' },
        { key: 'd', label: 'Burn duration $d$', min: 0.2, max: 9, step: 0.01, value: 3.14, unit: t`\text{s}`, explain: t`How long it fires. The natural period is $2\pi \approx 6.28$ s.` },
      ],
      curves: [
        { fn: 'step(x - a) - step(x - a - d)', color: 'gold', width: 1.8, label: 'thrust', labelAt: 'a + d/2', labelDx: -16, labelDy: -12 },
        { fn: ON, color: 'violet', dash: true, width: 1.6 },
        { fn: `-${OFF}`, color: 'teal', dash: true, width: 1.6 },
        { fn: `${ON} - ${OFF}`, color: 'accent', width: 2.8 },
      ],
      legend: [{ label: 'x(t)', color: 'accent' }, { label: 'switch-on response', color: 'violet', dash: [6, 5] }, { label: 'switch-off response', color: 'teal', dash: [6, 5] }],
      legendAt: 'br',
      readouts: [{ label: 'swing left after the burn, $2|\\sin(d/2)|$', expr: '2*abs(sin(d/2))', unit: t`\text{m}`, digits: 3 }],
    },
    caption: t`$x'' + x = u(t - a) - u(t - a - d)$ from rest: a cart with $k/m = 1\ \text{s}^{-2}$ and a thrust of 1 N per kilogram while the thruster fires. No friction, and the thrust switches instantly — real engines take tens of milliseconds to build and lose thrust.`,
  },
  example: {
    prompt: t`A 1 kg cart on a spring with $k = 4$ N/m sits at rest. A thruster pushes it with 8 N from $t = 1$ s to $t = 1 + \pi/2 \approx 2.57$ s, so $x'' + 4x = 8\big[u(t - 1) - u(t - 1 - \tfrac{\pi}{2})\big]$. Find $x(t)$, and the swing the burn leaves behind.`,
    visual: pulsePic(8, 1, 1 + Math.PI / 2, 8, t`The thrust (gold, in N) and the cart’s position (blue, in m). During the burn it swings about the new balance point 2 m; afterwards about 0.`, {
      fn: `2*(1 - cos(2(x - 1)))*step(x - 1) - 2*(1 - cos(2(x - 1 - pi/2)))*step(x - 1 - pi/2)`, y: [-4.6, 9.4], ylabel: '',
    }),
    steps: [
      { label: 'Steps for the burn', text: t`The thrust is $8$ switched on at $t = 1$ and off at $t = 1 + \pi/2$: $\;8u(t - 1) - 8u(t - 1 - \tfrac{\pi}{2})$, with transform $\dfrac{8}{s}\left(e^{-s} - e^{-(1 + \pi/2)s}\right)$.` },
      { label: 'Transform', text: t`From rest, $(s^2 + 4)X = \dfrac{8}{s}\left(e^{-s} - e^{-(1 + \pi/2)s}\right)$, so $X = \left(e^{-s} - e^{-(1 + \pi/2)s}\right)G(s)$ with $G(s) = \dfrac{8}{s(s^2 + 4)}$.` },
      { label: 'One switch-on', text: t`$G(s) = \dfrac{2}{s} - \dfrac{2s}{s^2 + 4}$, so $g(t) = 2(1 - \cos 2t)$: the response to switching 8 N on at $t = 0$ — a swing between 0 and 4 m about the static deflection $F/k = 2$ m.` },
      { label: 'Shift', text: t`Each factor $e^{-as}$ delays $g$ by $a$: $\;x(t) = g(t - 1)\,u(t - 1) - g(t - 1 - \tfrac{\pi}{2})\,u(t - 1 - \tfrac{\pi}{2})$.` },
      { label: 'After the burn', text: t`For $t > 1 + \pi/2$ both steps are 1, and $\cos\big(2(t - 1) - \pi\big) = -\cos 2(t - 1)$: $\;x = 2\big(1 - \cos 2(t - 1)\big) - 2\big(1 + \cos 2(t - 1)\big) = -4\cos 2(t - 1)$.` },
      { label: 'Sense check', text: t`The burn lasted exactly half a period, $\pi/2$ s: it ended with the cart at rest at its far point, 4 m out, just as the balance point jumped back to 0. So it is left swinging $\pm 4$ m — twice the static deflection, the largest swing an 8 N burn can leave.` },
    ],
    answer: t`$x(t) = 2\big(1 - \cos 2(t - 1)\big)u(t - 1) - 2\big(1 - \cos(2t - 2 - \pi)\big)u(t - 1 - \tfrac{\pi}{2})$; after the burn, $x = -4\cos 2(t - 1)$: a swing of 4 m each way.`,
  },
  practice: [
    mcq({
      id: 'write-steps', difficulty: 1,
      prompt: t`A heater supplies 5 kW from $t = 2$ h to $t = 6$ h and is off otherwise. Which expression is its power, in kW?`,
      choices: [t`$5u(t - 2) - 5u(t - 6)$`, t`$5u(t - 2) + 5u(t - 6)$`, t`$5u(t - 6) - 5u(t - 2)$`, t`$5u(t - 2) - 5u(t - 4)$`],
      answer: 0,
      why: {
        1: t`After $t = 6$ this gives $5 + 5 = 10$ kW: the switch-off must be **subtracted**.`,
        2: t`This is $-5$ kW between 2 and 6 h: the order of the steps is backwards.`,
        3: t`4 h is how long it runs, not when it stops; the switch-off step sits at $t = 6$.`,
      },
      hints: ['Switch on at t = 2 with a step up; switch off at t = 6 with a step down.'],
      teach: t`A pulse from $a$ to $b$ is $u(t - a) - u(t - b)$: one step up when it starts, one step down when it ends.`,
      explain: t`$5u(t - 2)$ switches 5 kW on at 2 h; $-5u(t - 6)$ cancels it from 6 h on. Together: 0, then 5, then 0.`,
      visual: pulsePic(5, 2, 6, 9, t`The heater’s power: 5 kW from 2 h to 6 h.`, { ylabel: 'kW' }),
    }),
    expr({
      id: 'pulse-transform', difficulty: 2,
      gen(r) {
        const A = r.int(2, 9), a = r.int(1, 3), b = a + r.int(1, 4);
        return {
          prompt: t`Find the Laplace transform of the pulse $f(t) = ${A}\big[u(t - ${a}) - u(t - ${b})\big]$.`,
          answer: `${A}*(e^(-${a}s) - e^(-${b}s))/s`, answerTeX: t`\frac{${A}\left(e^{-${co(a)}s} - e^{-${b}s}\right)}{s}`, lhs: 'F(s)',
          vars: { s: [0.3, 2] },
          errors: [
            { answer: `${A}*(e^(-${a}s) - e^(-${b}s))`, feedback: t`Each step has transform $e^{-as}/s$: the $1/s$ is $\mathcal{L}\{1\}$, the function being delayed.` },
            { answer: `${A}*(e^(${a}s) - e^(${b}s))/s`, feedback: t`A delay gives $e^{-as}$, with a minus sign: it shrinks the transform, since the function starts later.` },
            { answer: `${A}*e^(-${a}s)*(1 - e^(-${b}s))/s`, feedback: t`The pulse ends at $t = ${b}$, not ${b} s after it starts: the second step is $u(t - ${b})$, so its factor is $e^{-${b}s}$.` },
          ],
          hints: [t`$u(t - a)$ is the constant 1 delayed by $a$, so $\mathcal{L}\{u(t - a)\} = e^{-as}\cdot\dfrac{1}{s}$.`],
          teach: t`$\mathcal{L}\{u(t - a)\} = e^{-as}/s$, so a pulse from $a$ to $b$ transforms to $(e^{-as} - e^{-bs})/s$.`,
          explain: t`$${A}\left(\dfrac{e^{-${co(a)}s}}{s} - \dfrac{e^{-${b}s}}{s}\right)$. As $s \to 0$ it tends to $${A}\times${b - a} = ${A * (b - a)}$, the pulse’s area — the transform at $s = 0$ is always the total area.`,
          visual: pulsePic(A, a, b, b + 3, t`The pulse: height ${A} from $t = ${a}$ to $t = ${b}$.`),
        };
      },
    }),
    expr({
      id: 'shift-slip', difficulty: 3,
      gen(r) {
        const a = r.int(1, 4), c = r.int(1, 3);
        return {
          prompt: t`Find $\mathcal{L}\{${co(c)}t\,u(t - ${a})\}$ — a ramp that is switched on at $t = ${a}$, already at height $${c * a}$.`,
          answer: `${c}*e^(-${a}s)*(1/s^2 + ${a}/s)`, answerTeX: t`${co(c)}e^{-${co(a)}s}\left(\frac{1}{s^2} + \frac{${a}}{s}\right)`, lhs: 'F(s)',
          vars: { s: [0.3, 2] },
          errors: [{ answer: `${c}*e^(-${a}s)/s^2`, feedback: t`That is the transform of $${co(c)}(t - ${a})\,u(t - ${a})$, a ramp starting from zero. The theorem needs $f(t - a)$: rewrite $t = (t - ${a}) + ${a}$ first.` }],
          hints: [t`The second shift theorem needs the form $u(t - ${a})\,f(t - ${a})$. Write $t = (t - ${a}) + ${a}$.`, t`$${co(c)}t\,u(t - ${a}) = ${co(c)}(t - ${a})u(t - ${a}) + ${c * a}u(t - ${a})$: a delayed ramp plus a delayed step.`],
          teach: t`$\mathcal{L}\{u(t - a)g(t)\}$ is $e^{-as}$ times the transform of $g(t + a)$, not of $g(t)$: rewrite the function in powers of $(t - a)$ first.`,
          explain: t`$${co(c)}t\,u(t - ${a}) = ${co(c)}(t - ${a})\,u(t - ${a}) + ${c * a}\,u(t - ${a})$, so $F = e^{-${co(a)}s}\left(\dfrac{${c}}{s^2} + \dfrac{${c * a}}{s}\right)$. The second term is the jump to height $${c * a}$ at the switch-on.`,
          visual: fpic(`${c}x*step(x - ${a})`, [0, a + 3], [-0.5, c * (a + 3) * 1.12], t`$${co(c)}t\,u(t - ${a})$ (blue) against the ramp that starts from zero at $t = ${a}$ (dashed): they differ by a step of height $${c * a}$.`, { curves: [{ fn: `${c}*(x - ${a})*step(x - ${a})`, color: 'ink3', dash: true, width: 1.6 }] }),
        };
      },
    }),
    expr({
      id: 'inverse-delay', difficulty: 3,
      gen(r) {
        const a = r.int(1, 3), w = r.int(2, 4), m = r.int(1, 3);
        return {
          prompt: t`Find $f(t) = \mathcal{L}^{-1}\left\{\dfrac{${m * w}\,e^{-${co(a)}s}}{s^2 + ${w * w}}\right\}$ for all $t \ge 0$. Type the step $u(t - ${a})$ as \`step(t - ${a})\`.`,
          answer: `${m}*sin(${w}*(t - ${a}))*step(t - ${a})`, answerTeX: t`${co(m)}\sin\big(${w}(t - ${a})\big)\,u(t - ${a})`, lhs: 'f(t)',
          vars: { t: [0, a + 4] }, keys: [['u(t − a)', 'step(t - )']],
          errors: [
            { answer: `${m}*sin(${w}*(t - ${a}))`, feedback: t`Before $t = ${a}$ the function is zero: keep the step $u(t - ${a})$, written \`step(t - ${a})\`.` },
            { answer: `${m}*sin(${w}t)*step(t - ${a})`, feedback: t`The factor $e^{-${co(a)}s}$ delays the whole function: the sine starts from zero at $t = ${a}$, so it is $\sin\big(${w}(t - ${a})\big)$.` },
            { answer: `${m * w}*sin(${w}*(t - ${a}))*step(t - ${a})`, feedback: t`$\dfrac{${w}}{s^2 + ${w * w}}$ is $\sin ${w}t$, so the numerator $${m * w}$ gives $${m}\sin ${w}t$.` },
          ],
          hints: [t`Without the exponential: $\mathcal{L}^{-1}\left\{\dfrac{${m * w}}{s^2 + ${w * w}}\right\} = ${co(m)}\sin ${w}t$.`, t`The factor $e^{-${co(a)}s}$ delays that by ${a}: replace $t$ by $t - ${a}$ and multiply by $u(t - ${a})$.`],
          teach: t`A factor $e^{-as}$ in a transform means: invert without it, then delay the result — replace $t$ by $t - a$ and multiply by $u(t - a)$.`,
          explain: t`$f(t) = ${co(m)}\sin\big(${w}(t - ${a})\big)\,u(t - ${a})$: nothing until $t = ${a}$, then a sine that starts from zero.`,
          visual: fpic(`${m}*sin(${w}x)`, [0, a + 4], [-1.4 * m, 1.4 * m], t`The undelayed $${co(m)}\sin ${w}t$, the inverse transform without the factor $e^{-${co(a)}s}$. The answer is this curve delayed.`, { vlines: [{ x: a, label: `t = ${a}`, color: 'gold' }] }),
        };
      },
    }),
    num({
      id: 'burn-swing', difficulty: 3,
      gen(r) {
        const w = r.pick([1, 2, 3]), A = r.pick([0.5, 1, 2]), frac = r.pick([0.2, 0.3, 0.35, 0.65, 0.8]);
        const d = +((frac * 2 * Math.PI) / w).toFixed(2);
        const amp = ((2 * A) / (w * w)) * Math.abs(Math.sin((w * d) / 2));
        return {
          prompt: t`A cart on a spring, $x'' + ${co(w * w)}x = ${A}\big[u(t) - u(t - ${d})\big]$ (m and s), starts at rest; the right side is a thruster’s push per unit mass, in $\text{m/s}^2$, for ${d} s. After the burn the cart oscillates freely about $x = 0$. What is the amplitude of that oscillation?`,
          answer: amp, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: A / (w * w), feedback: t`That is the static deflection $F/k$, the balance point during the burn — not the swing left afterwards.` }, { value: (2 * A) / (w * w), feedback: 'That is the largest swing any burn of this thrust can leave — only a burn of exactly half a period (or 1½, 2½ …) achieves it.' }].filter((e) => Math.abs(e.value - amp) > 0.02 * amp),
          hints: [t`The switch-on alone gives $g(t) = ${nice(A / (w * w))}\big(1 - \cos ${w === 1 ? '' : w}t\big)$. After the burn, $x = g(t) - g(t - ${d})$.`, t`$g(t) - g(t - d) = ${nice(A / (w * w))}\big[\cos ${w === 1 ? '' : w}(t - d) - \cos ${w === 1 ? '' : w}t\big] = ${nice((2 * A) / (w * w))}\sin\dfrac{${w === 1 ? '' : w}d}{2}\,\sin ${w === 1 ? '' : w}\left(t - \dfrac{d}{2}\right)$.`],
          teach: t`A pulse is a step up and a delayed step down; after it ends the two responses partly cancel, leaving a swing of $2\frac{F}{k}\left|\sin\frac{\omega_0 d}{2}\right|$.`,
          explain: t`$\text{amplitude} = \dfrac{2\times${A}}{${w * w}}\left|\sin\dfrac{${w}\times${d}}{2}\right| = ${fmt(amp, 3)}$ m. It is zero when the burn lasts a whole number of periods and largest, $2F/k$, for half a period.`,
          visual: pulsePic(A, 0, d, Math.max(3 * d, 6.5 / w), t`The thrust per unit mass, ${A} m/s² for ${d} s. The natural period is $${w === 1 ? '2\\pi' : `2\\pi/${w}`} = ${fmt((2 * Math.PI) / w, 3)}$ s.`, { ylabel: 'm/s²' }),
        };
      },
    }),
    mcq({
      id: 'quiet-burn', difficulty: 2,
      prompt: t`An undamped cart on a spring (natural period $T_0$) is pushed by a constant thrust that switches on at $t = 0$ and off at $t = d$. For which burn lengths $d$ is the cart left exactly at rest when the burn ends?`,
      choices: [t`Whole numbers of periods: $d = T_0, 2T_0, \ldots$`, t`Half a period, $d = T_0/2$`, 'Only very short burns', 'None: without damping it always keeps oscillating'],
      answer: 0,
      why: {
        1: t`Half a period leaves the **largest** swing: the switch-off finds the cart at rest at its far point, $2F/k$ from the new balance.`,
        2: t`A short burn still leaves a swing, roughly the impulse divided by $m\omega_0$ — small, but not zero.`,
        3: t`The switch-off response is the switch-on response delayed and inverted. When the delay is a whole period they cancel exactly.`,
      },
      hints: [t`After the burn, $x = g(t) - g(t - d)$, where $g(t) = \frac{F}{k}(1 - \cos\omega_0 t)$ is the switch-on response.`, t`$g(t) - g(t - d)$ is zero for all later $t$ exactly when $\cos\omega_0(t - d) = \cos\omega_0 t$ for every $t$.`],
      teach: 'The response to a pulse is the switch-on response minus the same response delayed; they cancel when the delay is a whole number of natural periods.',
      explain: t`$g(t) - g(t - d) = \frac{F}{k}\big[\cos\omega_0(t - d) - \cos\omega_0 t\big]$ vanishes for all $t$ only if $\omega_0 d$ is a multiple of $2\pi$: $d = nT_0$. The cart then completes whole oscillations during the burn and stops exactly where it started. Spacecraft thrusters exploit the same idea (“input shaping”) to manoeuvre without exciting flexible appendages.`,
      visual: fpic('1 - cos(x)', [0, 13], [-0.3, 2.5], t`The response to the switch-on alone, $\frac{F}{k}(1 - \cos\omega_0 t)$, in units of $F/k$, over two periods. The switch-off adds the same curve, delayed by $d$ and turned upside down.`, { xlabel: 't (s, for T₀ = 2π s)', ylabel: 'x', curves: [{ fn: '1', color: 'ink3', dash: true, width: 1.4 }] }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-delayed', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4), q = r.int(1, 3), A = k * q, a = r.int(1, 3);
        const ans = `${q}*(1 - e^(-${k}*(t - ${a})))`;
        return {
          prompt: t`Solve $y' + ${k}y = ${A}\,u(t - ${a})$ with $y(0) = 0$, and give $y(t)$ for $t > ${a}$.`,
          answer: ans, answerTeX: t`${q}\left(1 - e^{-${k}(t - ${a})}\right)`, lhs: 'y(t)',
          vars: { t: [a + 0.05, a + 3] },
          integrand: `${A} - ${k}*(${ans})`,
          errors: [{ answer: `${q}*(1 - e^(-${k}t))`, feedback: t`That is the response to a step at $t = 0$. The factor $e^{-${co(a)}s}$ delays it: replace $t$ by $t - ${a}$.` }],
          hints: [t`$Y = \dfrac{${A}\,e^{-${co(a)}s}}{s(s + ${k})}$.`, t`Without the delay, $\dfrac{${A}}{s(s + ${k})} = \dfrac{${q}}{s} - \dfrac{${q}}{s + ${k}}$, which is $${q}(1 - e^{-${k}t})$. Then delay by ${a}.`],
          teach: 'Solve for the undelayed input, then shift the answer by the delay.',
          explain: t`$y = ${q}\left(1 - e^{-${k}(t - ${a})}\right)u(t - ${a})$: nothing until $t = ${a}$, then the usual approach to $${A}/${k} = ${q}$.`,
          visual: pulsePic(A, a, 1e6, a + 3, t`The forcing: $${A}$ switched on at $t = ${a}$ and left on.`, { y: [-0.15 * A, 1.25 * A] }),
        };
      },
    }),
    num({
      id: 'cp-thermocouple', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([0.5, 1, 1.5, 2]), dT = r.pick([900, 1200]), a = 1, Lb = r.pick([2, 3, 4]), b = a + Lb, tr = b + r.pick([0.5, 1]);
        const T = 300 + dT * (Math.exp(-(tr - b) / tau) - Math.exp(-(tr - a) / tau));
        const naive = 300 + dT * Math.exp(-(tr - b) / tau);
        return {
          prompt: t`A thermocouple in a test engine’s exhaust reads $T$, obeying $T' = \dfrac{T_\text{gas}(t) - T}{\tau}$ with $\tau = ${tau}$ s. The gas is at 300 K until ignition at $t = ${a}$ s, at ${300 + dT} K during the burn, and back at 300 K from shutdown at $t = ${b}$ s. The reading starts at 300 K. What does it read at $t = ${tr}$ s?`,
          answer: T, units: 'K', tol: { rel: 0.005 },
          errors: [
            ...(Math.abs(naive - T) > 0.01 * T ? [{ value: naive, feedback: 'That assumes the reading reached the full gas temperature before shutdown. It only got part of the way, and the switch-off response starts from there.' }] : []),
            { value: 300, feedback: 'The reading lags: it is still falling back toward 300 K, not there yet.' },
          ],
          hints: [t`Let $\theta = T - 300$: $\;\theta' + \theta/\tau = \dfrac{${dT}}{\tau}\big[u(t - ${a}) - u(t - ${b})\big]$. One switch-on gives $${dT}\big(1 - e^{-t/\tau}\big)$.`, t`$\theta(t) = ${dT}\big(1 - e^{-(t - ${a})/\tau}\big)u(t - ${a}) - ${dT}\big(1 - e^{-(t - ${b})/\tau}\big)u(t - ${b})$; for $t > ${b}$ both steps are on.`],
          teach: 'A burn is a step up and a delayed step down; a first-order sensor’s reading is the difference of the two delayed step responses.',
          explain: t`For $t > ${b}$: $\theta = ${dT}\left(e^{-(t - ${b})/\tau} - e^{-(t - ${a})/\tau}\right)$, so at $t = ${tr}$ s, $T = 300 + ${dT}\left(e^{-${n((tr - b) / tau)}} - e^{-${n((tr - a) / tau)}}\right) = ${fmt(T, 4)}$ K. A real thermocouple’s $\tau$ also depends on the gas flow, and radiation biases its reading.`,
          visual: fpic(`300 + ${dT}*(step(x - ${a}) - step(x - ${b}))`, [0, tr + 1.5], [0, 300 + 1.2 * dT], t`The gas temperature: a ${Lb} s burn at ${300 + dT} K. The thermocouple’s reading lags behind it.`, { ylabel: 'K', vlines: [{ x: tr, label: `t = ${tr} s`, color: 'gold' }] }),
        };
      },
    }),
    mcq({
      id: 'cp-shift-slip', difficulty: 2,
      prompt: t`What is $\mathcal{L}\{u(t - \pi)\sin t\}$?`,
      choices: [t`$-\dfrac{e^{-\pi s}}{s^2 + 1}$`, t`$\dfrac{e^{-\pi s}}{s^2 + 1}$`, t`$\dfrac{e^{\pi s}}{s^2 + 1}$`, t`$\dfrac{e^{-\pi s}\,s}{s^2 + 1}$`],
      answer: 0,
      why: {
        1: t`That is $\mathcal{L}\{u(t - \pi)\sin(t - \pi)\}$. The theorem shifts $f(t - a)$, and $\sin t = -\sin(t - \pi)$.`,
        2: t`A delay brings $e^{-as}$, with the minus sign.`,
        3: t`That would be $\mathcal{L}\{u(t - \pi)\cos(t - \pi)\}$.`,
      },
      hints: [t`Write $\sin t$ in terms of $t - \pi$ first.`],
      teach: t`Before applying the second shift theorem, rewrite the switched function in terms of $t - a$.`,
      explain: t`$\sin t = \sin\big((t - \pi) + \pi\big) = -\sin(t - \pi)$, so $\mathcal{L}\{u(t - \pi)\sin t\} = -e^{-\pi s}\cdot\dfrac{1}{s^2 + 1}$.`,
      visual: fpic('sin(x)*step(x - pi)', [0, 12], [-1.4, 1.4], t`$u(t - \pi)\sin t$ (blue) and $\sin(t - \pi)$ switched on at $\pi$ (dashed): mirror images.`, { curves: [{ fn: 'sin(x - pi)*step(x - pi)', color: 'ink3', dash: true, width: 1.6 }], vlines: [{ x: Math.PI, label: 't = π', color: 'gold' }] }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §6.2 (Heaviside function, shifting, a cart pushed by a rocket)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Step functions; IVPs with step functions', url: 'https://tutorial.math.lamar.edu/Classes/DE/StepFunctions.aspx' },
  ],
});
