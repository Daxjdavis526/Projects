// Convolution and transfer functions: from rest, Y(s) = H(s)F(s) with
// H = 1/P(s), the transform of the impulse response h(t); in time the product
// is the convolution (h * f)(t) = ∫ h(t − τ) f(τ) dτ — the input as a stream of
// kicks, each answered by a delayed copy of h. Poles of H decide how h rings
// and decays; on the imaginary axis, H(iω) is the frequency response, built
// from the distances to the poles. The spring–mass–damper and the RC filter,
// a numerical convolution for a thruster mount, and a pendulum suspension.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co, sg, lead } from './_second.js';
import { fpic, polePic, n } from './_laplace.js';

const t = String.raw;

/** The s-plane with a conjugate pair, the probe point iω and its distances to the poles (a static graph). */
function probePic(sig, wd, w, caption) {
  const ymax = Math.max(wd, w) + 1.2;
  return {
    type: 'graph',
    params: {
      x: [-sig - 2.5, 2.5], y: [-ymax, ymax], equal: true, xlabel: 'Re s', ylabel: 'Im s', aspect: 'wide',
      curves: [
        { param: [`${-sig}*t`, `${w} + (${wd - w})*t`], t: [0, 1], color: 'gold', dash: true, width: 1.6 },
        { param: [`${-sig}*t`, `${w} - (${wd + w})*t`], t: [0, 1], color: 'gold', dash: true, width: 1.6 },
      ],
      points: [
        { x: -sig, y: wd, color: 'bad', r: 5.5, label: `${n(-sig)} + ${wd}i`, labelDx: -12, labelDy: -12, labelAlign: 'right' },
        { x: -sig, y: -wd, color: 'bad', r: 5.5, label: `${n(-sig)} − ${wd}i`, labelDx: -12, labelDy: 12, labelAlign: 'right' },
        { x: 0, y: w, color: 'gold', r: 5, label: `iω = ${w}i`, labelDx: 10, labelDy: -10 },
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'math2280.DE-6.5',
  title: 'Convolution and transfer functions',
  minutes: 15, difficulty: 3,
  intro: t`Start a linear system $P(D)\,y = f$ from rest and transform: $P(s)\,Y = F$, so $Y = H(s)\,F(s)$ with $H = 1/P(s)$, the **transfer function**. Feed in an impulse, $F = 1$, and the output is $H$ itself: $H$ is the transform of the **impulse response** $h(t)$. Back in time, the product of two transforms is a **convolution**:

$$y(t) = (h * f)(t) = \int_0^t h(t - \tau)\,f(\tau)\,d\tau \quad\Longleftrightarrow\quad Y(s) = H(s)\,F(s)$$

Read the input as a stream of small kicks $f(\tau)\,d\tau$; each is answered by a copy of $h$ that starts at $\tau$, and the output is their sum. The poles of $H$ — the characteristic roots — decide how $h$ rings and decays. And on the imaginary axis, $s = i\omega$, $H$ is the **frequency response**: a steady sine of angular frequency $\omega$ comes out multiplied by $|H(i\omega)|$ and shifted in phase by $\arg H(i\omega)$.`,
  symbols: [
    { tex: t`h(t)`, text: t`the impulse response: the output from rest after a unit impulse $\delta(t)$ — the system’s fingerprint` },
    { tex: t`H(s)`, text: t`the transfer function, $\mathcal{L}\{h\} = 1/P(s)$; its poles are the characteristic roots` },
    { tex: t`f,\ F`, text: 'the input (a force, a voltage) and its transform' },
    { tex: t`y,\ Y`, text: 'the output from rest and its transform' },
    { tex: t`\tau`, text: t`the time of an earlier kick, $0 \le \tau \le t$; $t - \tau$ is how long ago it landed` },
    { tex: t`*`, text: t`convolution: flip one function, slide it to $t$, multiply and integrate` },
  ],
  why: t`Every linear instrument, structure and circuit is specified this way: an engineer reads a filter’s or a mount’s behaviour off $H(s)$ — its poles, its gain at each frequency — without solving a differential equation for each new input.`,
  visual: {
    type: 'de-poles',
    title: 'Poles, responses and the frequency response',
    lead: t`Each cross is a pole of $H(s)$; drag them. The middle panel is the impulse response $h(t) = \mathcal{L}^{-1}\{H\}$ (or the step response); the bottom panel is the gain $|H(i\omega)|$. The gold point $i\omega$ slides up the imaginary axis as you change $\omega$: the gain is $|K|$ divided by the product of the dashed distances.`,
    tasks: [
      'Spring–mass–damper: drag the pair towards the imaginary axis. The impulse response rings longer, and the resonance peak grows taller and narrower — the probe passes close to a pole.',
      'RC filter: the gain falls to the half-power line where ω equals the pole’s distance from the origin, 1/RC.',
      'Drag any pole into the right half-plane: its term grows without limit. The system is unstable, whatever the input.',
    ],
    params: {
      presets: [
        { label: 'Spring–mass–damper', poles: [{ re: -0.4, im: 2 }] },
        { label: 'RC filter', poles: [{ re: -1 }] },
        { label: 'Two real poles', poles: [{ re: -0.6 }, { re: -2.5 }] },
        { label: 'A pole and a pair', poles: [{ re: -1.5 }, { re: -0.3, im: 1.6 }] },
      ],
      responses: ['impulse', 'step'], terms: 'toggle', w: 1, wmax: 5, T: 12,
      window: { re: [-4, 1], im: [-3, 3] },
    },
    caption: t`$H(s) = K/\big((s - p_1)\cdots(s - p_n)\big)$ with $K$ chosen so that $H(0) = 1$: a constant input passes unchanged, like a spring’s static deflection in units of $F/k$. Responses are exact; the system is ideal, linear and time-invariant.`,
  },
  example: {
    prompt: t`An RC filter with $RC = 1$ s obeys $y' + y = f(t)$, from rest. Find its transfer function and impulse response, its response to the ramp $f = t$ by convolution (and check it with transforms), and its frequency response.`,
    visual: fpic('x - 1 + exp(-x)', [0, 5], [-0.3, 5.2], t`The ramp input (dashed) and the filter’s output (blue): after the transient it runs parallel to the input, $RC = 1$ s behind.`, { ylabel: 'V', curves: [{ fn: 'x', color: 'ink3', dash: true, width: 1.6 }] }),
    steps: [
      { label: 'Transfer function', text: t`$(s + 1)Y = F$, so $H(s) = \dfrac{1}{s + 1}$ and $h(t) = e^{-t}$: after a kick, the output decays with time constant $RC$.` },
      { label: 'Convolve', text: t`$y(t) = \displaystyle\int_0^t e^{-(t - \tau)}\,\tau\,d\tau = e^{-t}\int_0^t \tau e^{\tau}\,d\tau = e^{-t}\Big[(\tau - 1)e^{\tau}\Big]_0^t = t - 1 + e^{-t}$.` },
      { label: 'Check with transforms', text: t`$Y = H\cdot\mathcal{L}\{t\} = \dfrac{1}{(s + 1)s^2} = \dfrac{1}{s^2} - \dfrac{1}{s} + \dfrac{1}{s + 1}$, which inverts to $t - 1 + e^{-t}$ ✓. The convolution theorem at work.` },
      { label: 'Read it', text: t`Once $e^{-t}$ has died, $y = t - 1$: the output follows the ramp exactly one time constant behind — the sensor lag of DE-2.6, now read off from $h$.` },
      { label: 'Frequency response', text: t`$H(i\omega) = \dfrac{1}{1 + i\omega}$: $\;|H| = \dfrac{1}{\sqrt{1 + \omega^2}}$ and $\arg H = -\arctan\omega$. With $RC$ restored, $1/\sqrt{1 + (\omega RC)^2}$ — the low-pass filter of [DE-2.6](#/lesson/math2280.DE-2.6), found without solving any differential equation.` },
    ],
    answer: t`$H = \dfrac{1}{s + 1}$, $h = e^{-t}$; the ramp response is $t - 1 + e^{-t}$; the gain at $\omega$ is $1/\sqrt{1 + \omega^2}$, the lag $\arctan\omega$.`,
  },
  practice: [
    expr({
      id: 'transfer-smd', difficulty: 1,
      gen(r) {
        const m = r.int(1, 3), c = r.int(1, 4), k = r.int(5, 20) * m;
        const re = -c / (2 * m), im = Math.sqrt(4 * m * k - c * c) / (2 * m);
        return {
          prompt: t`A mass–spring–damper obeys $${co(m)}x'' + ${co(c)}x' + ${k}x = f(t)$ (SI units). What is its transfer function $H(s)$, from the force $f$ to the position $x$?`,
          answer: `1/(${m}s^2 + ${c}s + ${k})`, answerTeX: t`\frac{1}{${co(m)}s^2 + ${co(c)}s + ${k}}`, lhs: 'H(s)',
          vars: { s: [0.3, 3] },
          errors: [
            { answer: `${m}s^2 + ${c}s + ${k}`, feedback: t`That is $P(s)$. From rest $P(s)X = F$, so $H = X/F = 1/P(s)$.` },
            { answer: `1/(${m}s^2 + ${c}s)`, feedback: t`Every term of the equation transforms, the spring’s $${k}x$ too: $P(s) = ${co(m)}s^2 + ${co(c)}s + ${k}$.` },
          ],
          hints: [t`From rest, $\mathcal{L}\{x''\} = s^2X$ and $\mathcal{L}\{x'\} = sX$.`, t`$(${co(m)}s^2 + ${co(c)}s + ${k})X = F$; divide.`],
          teach: t`From rest every derivative becomes a power of $s$, so $H(s)$ is one over the characteristic polynomial.`,
          explain: t`$H(s) = \dfrac{1}{${co(m)}s^2 + ${co(c)}s + ${k}}$, in metres per newton·second. Its poles are the characteristic roots, $${n(re)} \pm ${n(im)}i$ — shown above. $H(0) = 1/${k}$ m/N is the spring’s static compliance.`,
          visual: polePic([{ re: +re.toFixed(4), im: +im.toFixed(4) }], t`The poles of this system’s transfer function: the roots of $${co(m)}s^2 + ${co(c)}s + ${k}$.`),
        };
      },
    }),
    mcq({
      id: 'poles-to-motion', difficulty: 2,
      prompt: t`A system’s transfer function has the poles shown: $-0.1 \pm 3i$. What does its impulse response look like?`,
      choices: [
        'An oscillation at 3 rad/s that rings for a long time, its amplitude halving roughly every 7 s',
        'A smooth decay with no oscillation, over about 10 s',
        'An oscillation at 3 rad/s that grows',
        'An oscillation at 0.1 rad/s that decays at rate 3 per second',
      ],
      answer: 0,
      why: {
        1: 'Real poles give smooth decays; these have an imaginary part, so the response oscillates.',
        2: t`The real part is negative ($-0.1$): the poles are in the left half-plane, so the oscillation decays.`,
        3: 'Real and imaginary parts are the other way round: the imaginary part sets the angular frequency, the real part the decay rate.',
      },
      hints: [t`A pair $\sigma \pm i\omega$ gives terms $e^{\sigma t}\cos\omega t$ and $e^{\sigma t}\sin\omega t$.`, t`Here $\sigma = -0.1$ s⁻¹ and $\omega = 3$ rad/s: how long does $e^{-0.1t}$ take to halve?`],
      teach: 'The imaginary part of a pole is the angular frequency of its term, the real part its growth or decay rate.',
      explain: t`$h \propto e^{-0.1t}\sin 3t$: a 2.1 s period inside an envelope that halves every $\ln 2/0.1 \approx 6.9$ s — about three cycles per halving. Poles this close to the imaginary axis mean light damping: $\zeta = 0.1/\sqrt{0.01 + 9} \approx 0.033$.`,
      visual: polePic([{ re: -0.1, im: 3 }], t`The two poles of $H(s)$, at $-0.1 \pm 3i$.`, { window: { re: [-3, 1], im: [-3.8, 3.8] } }),
    }),
    expr({
      id: 'convolve', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [2, 5]]);
        return {
          prompt: t`Compute the convolution $\left(e^{-${co(a)}t} * e^{-${b}t}\right)(t) = \displaystyle\int_0^t e^{-${co(a)}\tau}\,e^{-${b}(t - \tau)}\,d\tau$.`,
          answer: `(e^(-${a}t) - e^(-${b}t))/${b - a}`, answerTeX: t`\frac{e^{-${co(a)}t} - e^{-${b}t}}{${b - a}}`, lhs: '(f * g)(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `e^(-${a + b}t)`, feedback: 'A convolution is not the product of the two functions: it integrates one against the other, flipped and slid.' },
            { answer: `e^(-${a}t) - e^(-${b}t)`, feedback: t`Check the constant: $\int_0^t e^{${b - a}\tau}\,d\tau = \dfrac{e^{${b - a}t} - 1}{${b - a}}$.` },
          ],
          hints: [t`Pull out what does not depend on $\tau$: $e^{-${b}t}\displaystyle\int_0^t e^{(${b} - ${a})\tau}\,d\tau$.`, t`Or use the convolution theorem: $\dfrac{1}{s + ${a}}\cdot\dfrac{1}{s + ${b}}$, then partial fractions.`],
          teach: t`Convolve by integrating over $\tau$ with $t$ held fixed — or multiply the transforms and invert.`,
          explain: t`$e^{-${b}t}\cdot\dfrac{e^{${b - a}t} - 1}{${b - a}} = \dfrac{e^{-${co(a)}t} - e^{-${b}t}}{${b - a}}$. Check: $\dfrac{1}{(s + ${a})(s + ${b})} = \dfrac{1}{${b - a}}\left(\dfrac{1}{s + ${a}} - \dfrac{1}{s + ${b}}\right)$ ✓. Physically, two first-order stages in series — a thermocouple behind a filter.`,
          visual: fpic(`exp(-${a}x)*exp(-${b}*(1.5 - x))`, [0, 2.5], [0, 1.15], t`The convolution at $t = 1.5$, as a picture: $e^{-${co(a)}\tau}$ (dashed), the flipped and slid $e^{-${b}(1.5 - \tau)}$ (gold), and their product (blue), whose shaded area is the value at $t = 1.5$.`, {
            xlabel: 'τ', ylabel: '', domain: [0, 1.5],
            curves: [{ fn: `exp(-${a}x)`, color: 'ink3', dash: true, width: 1.6 }, { fn: `exp(-${b}*(1.5 - x))`, color: 'gold', width: 1.8, domain: [0, 1.5] }],
            shade: [{ fn: `exp(-${a}x)*exp(-${b}*(1.5 - x))`, from: 0, to: 1.5, color: 'accent', alpha: 0.25 }],
            vlines: [{ x: 1.5, label: 'τ = t', color: 'gold' }],
          }),
        };
      },
    }),
    mcq({
      id: 'kick-sum', difficulty: 2,
      prompt: t`In $y(t) = \displaystyle\int_0^t h(t - \tau)\,f(\tau)\,d\tau$, what does the piece $h(t - \tau)\,f(\tau)\,d\tau$ stand for?`,
      choices: [
        t`The response, at time $t$, to the small kick $f(\tau)\,d\tau$ delivered at the earlier time $\tau$`,
        t`The input at time $t - \tau$`,
        t`The response at time $\tau$ to the input at time $t$`,
        t`The energy the input delivers between $\tau$ and $\tau + d\tau$`,
      ],
      answer: 0,
      why: {
        1: t`$t - \tau$ is the **age** of the kick — how long ago it landed — and $h$ is evaluated there.`,
        2: 'Causes come before effects: the integral runs over earlier times τ ≤ t, and the response at τ cannot depend on the later input.',
        3: 'Nothing here is an energy: f is a force (or voltage), and h turns an impulse into a response.',
      },
      hints: [t`$f(\tau)\,d\tau$ is a force times a short time: an impulse.`, t`A unit impulse at time $\tau$ produces $h(t - \tau)$ at time $t$.`],
      teach: 'Convolution is superposition: the input chopped into kicks, each answered by the impulse response, delayed to when it landed.',
      explain: t`The input is a stream of kicks; the one at $\tau$, of size $f(\tau)\,d\tau$, produces $h(t - \tau)\,f(\tau)\,d\tau$ at time $t$ (linearity scales $h$, time-invariance delays it). Summing every earlier kick gives $y(t)$. That is why the impulse response is all there is to know about a linear, time-invariant system.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 8], y: [-0.7, 1.3], xlabel: 't (s)', ylabel: '', aspect: 'wide',
          arrows: [[1, 0.5, 'violet'], [2.5, 0.8, 'teal'], [4, 0.4, 'gold']].map(([tau, J, color]) => ({ from: [tau, 0], to: [tau, J], color, width: 2.4 })),
          curves: [
            ...[[1, 0.5, 'violet'], [2.5, 0.8, 'teal'], [4, 0.4, 'gold']].map(([tau, J, color]) => ({ fn: `${J}*exp(-0.5*(x - ${tau}))*sin(2*(x - ${tau}))*step(x - ${tau})`, color, dash: true, width: 1.6 })),
            { fn: '0.5*exp(-0.5*(x - 1))*sin(2*(x - 1))*step(x - 1) + 0.8*exp(-0.5*(x - 2.5))*sin(2*(x - 2.5))*step(x - 2.5) + 0.4*exp(-0.5*(x - 4))*sin(2*(x - 4))*step(x - 4)', color: 'accent', width: 2.6 },
          ],
        },
        caption: 'Three kicks (arrows) and the delayed impulse response each one starts (dashed, in its colour). The output is their sum (blue); a continuous input is the limit of many small kicks.',
      },
    }),
    num({
      id: 'distance-gain', difficulty: 3,
      gen(r) {
        const sig = r.pick([0.25, 0.5, 1]), wd = r.int(2, 4);
        const K = sig * sig + wd * wd, d1 = sig, d2 = Math.sqrt(sig * sig + 4 * wd * wd), gain = K / (d1 * d2);
        return {
          prompt: t`$H(s) = \dfrac{${n(K)}}{(s - p)(s - \bar p)}$ has poles $p, \bar p = ${n(-sig)} \pm ${wd}i$, so $H(0) = 1$. Using $|H(i\omega)| = \dfrac{${n(K)}}{|i\omega - p|\,|i\omega - \bar p|}$ — the product of distances in the picture — find the gain at $\omega = ${wd}$ rad/s.`,
          answer: gain, tol: { rel: 0.005 },
          errors: [{ value: K / (d1 * d1), feedback: t`The two distances differ: from $${wd}i$ to the upper pole it is ${n(sig)}, but to the lower pole it is $\sqrt{${n(sig * sig)} + ${4 * wd * wd}}$.` }, { value: 1, feedback: t`$H(0) = 1$, but this asks for the gain at $\omega = ${wd}$, right beside a pole, where it is much larger.` }],
          hints: [t`The distance from $${wd}i$ to $${n(-sig)} + ${wd}i$ is just the horizontal gap, ${n(sig)}.`, t`To the lower pole $${n(-sig)} - ${wd}i$: $\sqrt{${n(sig)}^2 + (${2 * wd})^2}$.`],
          teach: t`$|H(i\omega)|$ is $|K|$ over the product of the distances from $i\omega$ to the poles, so a pole near the imaginary axis makes the gain peak as $\omega$ passes it.`,
          explain: t`$|H(${wd}i)| = \dfrac{${n(K)}}{${n(sig)}\times${fmt(d2, 4)}} = ${fmt(gain, 3)}$. The closer the pole to the axis (the smaller ${n(sig)}), the taller this resonance: halving the damping roughly doubles it.`,
          visual: probePic(sig, wd, wd, t`The poles (red) and the probe $i\omega$ (gold) at $\omega = ${wd}$ rad/s, with its distances to both poles dashed.`),
        };
      },
    }),
    code({
      id: 'mount-convolution', difficulty: 3,
      prompt: t`A thruster’s mount obeys, per unit mass, $y'' + y' + 4.25\,y = f(t)$, with impulse response $h(t) = \tfrac12 e^{-t/2}\sin 2t$. The thrust ramps up over 1 s and then holds: $f(t) = \min(t, 1)$. Compute the response by **numerical convolution** on a grid of step $dt$: $\;y(t_i) \approx \sum_j h(t_j)\,f(t_i - t_j)\,dt$, which \`np.convolve(h, f)[:len(t)] * dt\` does. Then set \`peak\` to the largest value of $y$ and \`t_peak\` to when it happens.`,
      starter: t`import numpy as np

dt = 0.001
t = np.arange(0, 10, dt)
h = 0.5 * np.exp(-t / 2) * np.sin(2 * t)    # impulse response
f = np.minimum(t, 1.0)                      # thrust per unit mass

y = None        # the convolution, one value per time in t
peak = None
t_peak = None
print(peak, t_peak)
`,
      answer: t`import numpy as np

dt = 0.001
t = np.arange(0, 10, dt)
h = 0.5 * np.exp(-t / 2) * np.sin(2 * t)    # impulse response
f = np.minimum(t, 1.0)                      # thrust per unit mass

y = np.convolve(h, f)[:len(t)] * dt
peak = y.max()
t_peak = t[y.argmax()]
print(peak, t_peak)`,
      tests: [
        { name: 'there is one output value per time step', code: 'len(y) == len(t)' },
        { name: t`$y(2\ \text{s})$ matches the exact solution, 0.32211`, code: 'abs(y[2000] - 0.322107148) < 1e-4' },
        { name: t`the peak is 0.3247, at $t \approx 2.12$ s`, code: 'abs(peak - 0.3247207) < 2e-4 and abs(t_peak - 2.1153) < 0.01' },
        { name: t`by $t = 10$ s it has settled near the steady value $1/4.25$`, code: 'abs(y[-1] - 1 / 4.25) < 3e-3' },
      ],
      hints: [t`\`np.convolve(h, f)\` returns \`2*len(t) - 1\` values; keep the first \`len(t)\` and multiply by \`dt\` — the width of each kick.`, t`\`y.max()\` and \`y.argmax()\` give the largest value and its index; \`t[index]\` is the time.`],
      teach: 'A numerical convolution is a Riemann sum of delayed impulse responses: it gives the response to any sampled input without solving the equation again.',
      explain: t`The mount peaks at about 0.325 m per unit (per newton per kilogram of thrust) at $t \approx 2.1$ s, 38% above the steady $1/4.25 = 0.235$: the ramp is short compared with the 3.2 s natural period, so the structure overshoots. A designer checks exactly this peak load, for measured thrust curves, with exactly this sum.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-impulse-response', difficulty: 2,
      gen(r) {
        const c = r.int(1, 3), w = r.int(2, 4);
        return {
          prompt: t`What is the impulse response $h(t)$ of the system with transfer function $H(s) = \dfrac{1}{s^2 + ${2 * c}s + ${c * c + w * w}}$?`,
          answer: `e^(-${c}t)*sin(${w}t)/${w}`, answerTeX: t`\frac{1}{${w}}e^{-${co(c)}t}\sin ${w}t`, lhs: 'h(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `e^(-${c}t)*sin(${w}t)`, feedback: t`$\dfrac{${w}}{(s + ${c})^2 + ${w * w}}$ is $e^{-${co(c)}t}\sin ${w}t$; with 1 on top you need $\dfrac{1}{${w}}$ of it.` },
            { answer: `e^(-${c}t)*cos(${w}t)`, feedback: t`The cosine’s transform has $(s + ${c})$ on top. Here the numerator is a constant: a sine.` },
          ],
          hints: [t`Complete the square: $s^2 + ${2 * c}s + ${c * c + w * w} = (s + ${c})^2 + ${w * w}$.`, t`$\mathcal{L}\{e^{-at}\sin\omega t\} = \dfrac{\omega}{(s + a)^2 + \omega^2}$.`],
          teach: t`The impulse response is the inverse transform of the transfer function.`,
          explain: t`$H = \dfrac{1}{${w}}\cdot\dfrac{${w}}{(s + ${c})^2 + ${w * w}}$, so $h = \dfrac{1}{${w}}e^{-${co(c)}t}\sin ${w}t$: from the poles $-${c} \pm ${w}i$, a ${w} rad/s ring decaying at ${c} s⁻¹.`,
          visual: polePic([{ re: -c, im: w }], t`The poles of $H(s)$.`),
        };
      },
    }),
    num({
      id: 'cp-pendulum', difficulty: 3, transfer: true,
      gen(r) {
        const f0 = r.pick([0.5, 0.75, 1]), f = r.pick([10, 20, 50]);
        const att = (f / f0) ** 2 - 1;
        return {
          prompt: t`A gravitational-wave detector hangs its mirrors as pendulums, so ground motion is filtered before it reaches them. Model one stage, with negligible damping, as $H(s) = \dfrac{\omega_0^2}{s^2 + \omega_0^2}$ from the motion of the suspension point to the motion of the mirror, with $f_0 = \omega_0/2\pi = ${f0}$ Hz. Ground vibration at ${f} Hz shakes the suspension point. By what factor is it reduced at the mirror, $1/|H(i\omega)|$?`,
          answer: att, tol: { rel: 0.005 },
          errors: [{ value: f / f0, feedback: t`The gain falls like $(\omega_0/\omega)^2$, not $\omega_0/\omega$: the factor ${n(f / f0)} must be squared.` }, { value: (f / f0) ** 2 + 1, feedback: t`At $s = i\omega$, $s^2 = -\omega^2$: the denominator is $\omega_0^2 - \omega^2$, so the factor is $(f/f_0)^2 - 1$.` }],
          hints: [t`At $s = i\omega$: $H(i\omega) = \dfrac{\omega_0^2}{\omega_0^2 - \omega^2}$.`, t`$\dfrac{1}{|H|} = \left|1 - \dfrac{\omega^2}{\omega_0^2}\right| = \left(\dfrac{f}{f_0}\right)^2 - 1$ above resonance.`],
          teach: t`Far above its resonance a mass on a pendulum (or spring) follows its support with gain $(f_0/f)^2$, falling a hundredfold per tenfold in frequency.`,
          explain: t`$1/|H| = (${f}/${f0})^2 - 1 = ${fmt(att, 4)}$. Stacking stages multiplies the factors, which is why LIGO’s test masses hang from a four-stage pendulum, on top of active seismic isolation. A single ideal stage only: real suspensions have several modes and some damping, and below $f_0$ a pendulum does not isolate at all.`,
          visual: fpic(`1/abs(1 - (x/${f0})^2)`, [0, 6 * f0], [0, 6], t`The gain $|H(i\omega)|$ of one ideal stage against frequency: 1 at low frequency, a resonance at $f_0 = ${f0}$ Hz, and a steady fall above it.`, { xlabel: 'f (Hz)', ylabel: '|H|', vlines: [{ x: f0, label: 'f₀', color: 'gold' }] }),
        };
      },
    }),
    mcq({
      id: 'cp-integral', difficulty: 2,
      prompt: t`Running total: $g(t) = \displaystyle\int_0^t f(\tau)\,d\tau$ is the convolution of $f$ with the constant 1. What is $G(s)$?`,
      choices: [t`$\dfrac{F(s)}{s}$`, t`$sF(s) - f(0)$`, t`$s\,F(s)$`, t`$\dfrac{F(0)}{s}$`],
      answer: 0,
      why: {
        1: t`That is the transform of the **derivative** $f'$. Integrating is the opposite: divide by $s$.`,
        2: t`Multiplying by $s$ differentiates; integrating divides by $s$.`,
        3: t`$F(0)/s$ is the transform of the constant $\int_0^\infty f\,dt$, not of the running total.`,
      },
      hints: [t`Convolution theorem: $\mathcal{L}\{1 * f\} = \mathcal{L}\{1\}\cdot F(s)$.`],
      teach: t`Convolving with 1 integrates, so its transform is $F(s)/s$ — the mirror image of $\mathcal{L}\{f'\} = sF - f(0)$.`,
      explain: t`$\int_0^t f(\tau)\cdot 1\,d\tau = (1 * f)(t)$, so $G = \dfrac1s\cdot F(s)$. Dividing by $s$ integrates, as multiplying by $s$ differentiates — which is why a pole at $s = 0$ means an integrator: a rocket’s velocity is the running integral of its thrust per unit mass.`,
      visual: fpic('2*x - x^2/2', [0, 4.5], [-0.5, 2.6], t`An example: $f(t) = 2 - t$ (dashed) and its running integral $g(t) = 2t - t^2/2$ (blue), which climbs while $f > 0$.`, { ylabel: '', domain: [0, 4.5], curves: [{ fn: '2 - x', color: 'ink3', dash: true, width: 1.6 }] }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §6.2 (transfer functions) and §6.3 Convolution', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'MIT OCW 18.03SC, Unit III: Fourier series and Laplace transform (convolution, transfer functions, poles)', url: 'https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/' },
    { label: 'LIGO Laboratory: seismic isolation and suspensions', url: 'https://www.ligo.caltech.edu/page/vibration-isolation' },
  ],
});
