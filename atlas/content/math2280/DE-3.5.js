// Free damped oscillations in standard form x″ + 2ζω₀x′ + ω₀²x = 0: the three
// regimes from the roots, and the numbers engineers measure a free decay by —
// the quality factor Q = 1/(2ζ), the logarithmic decrement, the first
// overshoot, energy lost per cycle, the slow root of heavy damping and why
// critical damping returns fastest.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6 } from './_second.js';

const t = String.raw;
const W = 6.283185307;    // ω₀ = 2π rad/s in the Explore: one natural period per second

/** x(t) from x(0) = 1, x′(0) = 0 for x″ + 2ζωx′ + ω²x = 0, in every regime, as an expression of x (time) and zeta. */
const FREE = (() => {
  const mm = 'max(w*sqrt(abs(1 - zeta^2)), 1e-6)';
  return `exp(-zeta*w*x)*(step(1 - zeta)*cos(${mm}*x) + step(zeta - 1)*cosh(${mm}*x) + zeta*w*(step(1 - zeta)*sin(${mm}*x) + step(zeta - 1)*sinh(${mm}*x))/${mm})`;
})();

/** A still ring-down x = A e^{−γt} cos(ωt), as a graph. */
function ringdown({ A = 1, g, w, T, y, xlabel = 't (s)', ylabel = 'x', curves = [], points = [], hlines = [], vlines = [], yticks, caption }) {
  return {
    type: 'graph',
    params: {
      x: [0, T], y: y || [-1.15 * A, 1.15 * A], aspect: 'wide', xlabel, ylabel, ...(yticks === 0 ? { yticks: 0 } : {}),
      curves: [
        { fn: `${r6(A)}*exp(-${r6(g)}*x)`, color: 'ink3', width: 1.2, dash: true },
        { fn: `-${r6(A)}*exp(-${r6(g)}*x)`, color: 'ink3', width: 1.2, dash: true },
        { fn: `${r6(A)}*exp(-${r6(g)}*x)*cos(${r6(w)}*x)`, color: 'accent', width: 2 },
        ...curves,
      ],
      points, hlines, vlines,
    },
    caption,
  };
}

export default lesson({
  id: 'math2280.DE-3.5',
  title: 'Free oscillations: damping regimes',
  minutes: 13, difficulty: 3,
  intro: t`Divide $m\,x'' + b\,x' + k\,x = 0$ by $m$ and name the two numbers that matter: the natural frequency $\omega_0 = \sqrt{k/m}$ and the **damping ratio** $\zeta = b/(2\sqrt{km})$, the damping as a fraction of the critical amount. Then every free oscillator — a spring, a circuit, a pointing loop — reads

$$x'' + 2\zeta\omega_0\,x' + \omega_0^2\,x = 0, \qquad r = -\zeta\omega_0 \pm \omega_0\sqrt{\zeta^2 - 1}.$$

Below $\zeta = 1$ the roots are complex: it rings at $\omega_d = \omega_0\sqrt{1 - \zeta^2}$ inside the envelope $e^{-\zeta\omega_0t}$. At $\zeta = 1$ they meet: **critical damping**, the fastest return that never overshoots. Above, two real roots, and the slow one makes the return drag. Engineers describe a ringing system by its **quality factor** $Q = 1/(2\zeta)$: it rings about $Q/\pi$ cycles while its amplitude falls by a factor $e$, losing a fraction $2\pi/Q$ of its energy each cycle.`,
  symbols: [
    { tex: 'x(t)', text: 'the displacement from equilibrium' },
    { tex: '\\omega_0', text: 'the undamped natural frequency $\\sqrt{k/m}$, in rad/s' },
    { tex: '\\zeta', text: 'the damping ratio $b/(2\\sqrt{km}) = b/b_c$: 0 undamped, below 1 underdamped, 1 critical, above 1 overdamped' },
    { tex: '\\omega_d', text: 'the damped angular frequency $\\omega_0\\sqrt{1 - \\zeta^2}$ at which an underdamped system actually rings' },
    { tex: 'r', text: 'the characteristic roots, in s⁻¹' },
    { tex: 'Q', text: 'the quality factor $1/(2\\zeta)$: large $Q$, a long ring-down' },
    { tex: '\\delta', text: 'the logarithmic decrement $\\ln(x_n/x_{n+1})$ between successive peaks, $= 2\\pi\\zeta/\\sqrt{1 - \\zeta^2}$' },
  ],
  why: t`Choosing $\zeta$ is a design decision every time something must stop moving — a suspension, a meter, a gimbal, a landing leg — and measuring it from a ring-down is how every real structure’s damping is known.`,
  visual: {
    type: 'graph',
    title: 'One oscillator, every amount of damping',
    lead: t`A system with $\omega_0 = 2\pi$ rad/s — one natural period per second — released from $x = 1$ at rest. Move the damping ratio and read the numbers an engineer would quote.`,
    tasks: [
      t`At $\zeta = 0.05$ ($Q = 10$) the envelope falls by a factor $e$ in about $Q/\pi \approx 3.2$ cycles: count them.`,
      t`Raise $\zeta$ toward 1: the decay time shrinks to its smallest, $1/\omega_0 \approx 0.16$ s, at critical damping. Past 1 it grows again — at $\zeta = 2.5$ the slow root is about $-\omega_0/(2\zeta)$ and the return drags.`,
      t`Watch the first overshoot: 73% at $\zeta = 0.1$, 16% at 0.5, under 5% at 0.7 — one reason pointing loops and suspensions are often tuned near $\zeta \approx 0.7$.`,
    ],
    params: {
      x: [0, 4], y: [-1, 1.1], aspect: 'wide', xlabel: 't (s)', ylabel: 'x',
      constants: { w: W },
      sliders: [{ key: 'zeta', label: 'Damping ratio $\\zeta$', min: 0.02, max: 2.5, step: 0.01, value: 0.1, explain: '$\\zeta = b/(2\\sqrt{km})$: the damping as a fraction of the critical damping.' }],
      curves: [
        { fn: '(1 + w*x)*exp(-w*x)', color: 'good', width: 1.4, dash: true, label: 'critical', labelAt: 0.35, labelDx: 8, labelDy: -4 },
        { fn: 'exp(-zeta*w*x)', color: 'ink3', width: 1.2, dash: true, when: 'step(1 - zeta)' },
        { fn: '-exp(-zeta*w*x)', color: 'ink3', width: 1.2, dash: true, when: 'step(1 - zeta)' },
        { fn: FREE, color: 'accent', width: 2.6 },
      ],
      hlines: [{ y: 0.02, color: 'ink4' }, { y: -0.02, color: 'ink4' }],
      readouts: [
        { label: '$Q = 1/2\\zeta$', expr: '1/(2*zeta)', digits: 3 },
        { label: 'log decrement $\\delta$', expr: '2*pi*zeta/sqrt(1 - zeta^2)', digits: 3 },
        { label: 'first overshoot', expr: 'exp(-pi*zeta/sqrt(1 - zeta^2))', digits: 2 },
        { label: 'decay time (s)', expr: '1/(w*(zeta - sqrt(max(zeta^2 - 1, 0))))', digits: 3 },
      ],
    },
    caption: t`Blue: the motion. Grey dashed: its envelope $\pm e^{-\zeta\omega_0t}$ while it oscillates. Green dashed: the critically damped motion, for comparison. The faint lines mark ±2%. A dash in a readout means it does not apply (no oscillation, no overshoot). Linear spring, viscous damping.`,
  },
  example: {
    prompt: t`A satellite’s antenna boom is plucked in a ground test, and its tip rings at 2.4 Hz. One peak measures 10.0 mm; five cycles later a peak measures 6.0 mm. Find the logarithmic decrement, the damping ratio and $Q$, and how long the vibration takes to die to 1% of the first peak.`,
    visual: ringdown({ A: 10, g: 0.245217, w: 15.0796, T: 3, ylabel: 'tip (mm)', points: [{ x: 0, y: 10, color: 'gold', label: '10.0 mm', labelDx: 8, labelDy: -8 }, { x: r6(5 / 2.4), y: r6(10 * Math.exp(-0.245217 * 5 / 2.4)), color: 'gold', label: '6.0 mm, five cycles later', labelDx: 8, labelDy: -10 }], caption: 'The measured ring-down: 2.4 Hz inside a slowly shrinking envelope (dashed).' }),
    steps: [
      { label: 'Decrement', text: t`Over $n$ cycles the envelope falls by $e^{-n\delta}$, so $\delta = \dfrac1n\ln\dfrac{x_0}{x_n} = \dfrac15\ln\dfrac{10.0}{6.0} = 0.1022$.` },
      { label: 'Damping ratio', text: t`$\delta = \dfrac{2\pi\zeta}{\sqrt{1 - \zeta^2}}$ solves to $\zeta = \dfrac{\delta}{\sqrt{4\pi^2 + \delta^2}} = \dfrac{0.1022}{6.284} = 0.0163$ — 1.6% of critical.` },
      { label: 'Quality factor', text: t`$Q = \dfrac{1}{2\zeta} = 30.8$. At this light damping $\omega_d$ and $\omega_0$ differ by about one part in 8000, so $\omega_0 \approx 2\pi(2.4) = 15.08$ rad/s.` },
      { label: 'Time to 1%', text: t`The envelope is $e^{-\zeta\omega_0t}$ with $\zeta\omega_0 = 0.245$ s⁻¹: $t = \dfrac{\ln 100}{0.245} = 18.8$ s, about 45 cycles.` },
      { label: 'Sense check', text: t`$Q/\pi \approx 9.8$ cycles per factor $e$, and $\ln 100 \approx 4.6$ factors of $e$: $4.6 \times 9.8 \approx 45$ cycles ✓. Damping of a few per cent of critical is typical of bolted metal structures — which is why spacecraft wait, or damp actively, after a manoeuvre.` },
    ],
    answer: t`$\delta = 0.102$, $\zeta = 0.0163$, $Q \approx 31$; down to 1% after about 19 s (45 cycles).`,
  },
  practice: [
    num({
      id: 'q-ringdown', difficulty: 2,
      gen(r) {
        const [what, f, taus] = r.pick([['a tuning fork, ringing at 440 Hz', 440, [1.5, 2, 3]], ['a wine glass, ringing at 700 Hz', 700, [0.3, 0.5]], ['a MEMS gyroscope’s vibrating ring, at 20 kHz', 20000, [0.05, 0.1]]]);
        const tau = r.pick(taus), Q = Math.PI * f * tau;
        return {
          prompt: t`Struck once, ${what}, loses amplitude so that it falls by a factor $e$ every ${tau} s. What is its quality factor $Q$?`,
          answer: Q, tol: { rel: 0.005 },
          errors: [
            { value: f * tau, feedback: t`That counts the cycles in one decay time; $Q$ is $\pi$ times that. The envelope is $e^{-\zeta\omega_0t} = e^{-\omega_0t/2Q}$, so $Q = \omega_0\tau/2 = \pi f\tau$.` },
            { value: 2 * Math.PI * f * tau, feedback: t`The amplitude envelope is $e^{-\omega_0t/(2Q)}$ — the 2 matters: $Q = \omega_0\tau/2$.` },
          ],
          hints: [t`The amplitude envelope is $e^{-\zeta\omega_0t}$, with $\zeta = 1/(2Q)$, so it falls by $e$ in $\tau = 2Q/\omega_0$.`, t`$Q = \dfrac{\omega_0\tau}{2} = \pi f\tau$ with $f = ${f}$ Hz.`],
          teach: 'The amplitude of a free oscillator falls by e in τ = 2Q/ω₀ — so Q = πfτ, π times the cycles in one decay time.',
          explain: t`$Q = \pi f\tau = \pi \times ${f} \times ${tau} = ${fmt(Q, 3)}$. A high $Q$ means many cycles per decay: the resonator stores energy far faster than it loses it.`,
          visual: ringdown({ A: 1, g: 1 / tau, w: r6(2 * Math.PI * Math.min(f, 6 / tau)), T: r6(2.5 * tau), yticks: 0, ylabel: 'amplitude', vlines: [{ x: tau, label: 'τ', color: 'gold' }], hlines: [{ y: 0.3679, label: '1/e', color: 'gold' }], caption: 'The ring-down and its envelope (dashed), which reaches 1/e of its start at τ. The oscillation is drawn far slower than the real one, so its cycles can be seen.' }),
        };
      },
    }),
    num({
      id: 'overshoot', difficulty: 2,
      gen(r) {
        const P = r.pick([2, 5, 10, 20]), L = Math.log(100 / P);
        const z = L / Math.sqrt(Math.PI ** 2 + L * L);
        const w = 2 * Math.PI, wd = w * Math.sqrt(1 - z * z);
        return {
          prompt: t`A thrust-vector-control actuator is pushed off centre and released from rest. On its first swing past centre it overshoots to ${P}% of its starting offset, on the other side. What is its damping ratio $\zeta$?`,
          answer: z, tol: { rel: 0.005 },
          errors: [{ value: L / Math.PI, feedback: t`That drops the $\sqrt{1 - \zeta^2}$, which is not small here. Solve $\dfrac{\pi\zeta}{\sqrt{1 - \zeta^2}} = \ln\dfrac{100}{${P}}$ exactly: $\zeta = \dfrac{L}{\sqrt{\pi^2 + L^2}}$.` }].filter((e) => Math.abs(e.value - z) > 0.01 * z),
          hints: [t`The first overshoot is half a damped period after release, where the envelope has fallen to $e^{-\zeta\omega_0\cdot\pi/\omega_d} = e^{-\pi\zeta/\sqrt{1 - \zeta^2}}$.`, t`Set $\dfrac{\pi\zeta}{\sqrt{1 - \zeta^2}} = L = \ln\dfrac{100}{${P}}$ and solve: $\zeta = \dfrac{L}{\sqrt{\pi^2 + L^2}}$.`],
          teach: t`Released from rest, an underdamped system overshoots by the fraction $e^{-\pi\zeta/\sqrt{1-\zeta^2}}$ — measure the overshoot and you know ζ.`,
          explain: t`$L = \ln(100/${P}) = ${fmt(L, 3)}$, so $\zeta = \dfrac{${fmt(L, 3)}}{\sqrt{\pi^2 + ${fmt(L * L, 3)}}} = ${fmt(z, 3)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(1.6 * Math.PI / wd)], y: [-0.4, 1.1], aspect: 'wide', xlabel: 't', ylabel: 'x / x₀', xticks: 0,
              curves: [{ fn: `exp(-${r6(z * w)}*x)*(cos(${r6(wd)}*x) + ${r6(z * w / wd)}*sin(${r6(wd)}*x))`, color: 'accent', width: 2.4 }],
              points: [{ x: r6(Math.PI / wd), y: r6(-P / 100), color: 'gold', label: `−${P}%`, labelDx: 6, labelDy: 14 }],
            },
            caption: 'The release from rest and the first overshoot past centre (gold).',
          },
        };
      },
    }),
    num({
      id: 'slow-root', difficulty: 3,
      gen(r) {
        const z = r.pick([2, 3, 4]), w0 = r.pick([5, 10, 20]);
        const tau = 1 / (w0 * (z - Math.sqrt(z * z - 1)));
        const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1));
        const c1 = -r2 / (r1 - r2), c2 = 1 - c1;
        return {
          prompt: t`A door closer is heavily overdamped: $\omega_0 = ${w0}$ rad/s and $\zeta = ${z}$. Long after release, the door’s remaining offset shrinks like $e^{-t/\tau}$. What is $\tau$, in seconds — and compare it with the critically damped $1/\omega_0$.`,
          answer: tau, units: 's', tol: { rel: 0.005 },
          errors: [
            { value: 1 / (z * w0), feedback: t`$e^{-\zeta\omega_0t}$ is the envelope of an *underdamped* motion. Overdamped, the roots are real, and the slow one is $-\omega_0(\zeta - \sqrt{\zeta^2 - 1})$.` },
            { value: 1 / (w0 * (z + Math.sqrt(z * z - 1))), feedback: t`That is the fast root, whose term dies almost at once. Late in the motion the slow root, $-\omega_0(\zeta - \sqrt{\zeta^2 - 1})$, is all that is left.` },
          ],
          hints: [t`The roots are $r = -\omega_0\big(\zeta \pm \sqrt{\zeta^2 - 1}\big)$, both real and negative.`, t`The term with the root nearer zero lasts longest: $\tau = \dfrac{1}{\omega_0(\zeta - \sqrt{\zeta^2 - 1})}$.`],
          teach: 'An overdamped return is ruled by its slow root, −ω₀(ζ − √(ζ² − 1)) ≈ −ω₀/(2ζ): more damping makes it slower, not faster.',
          explain: t`$\tau = \dfrac{1}{${w0}(${z} - \sqrt{${z * z - 1}})} = ${fmt(tau, 3)}$ s — about $2\zeta = ${2 * z}$ times longer than the critically damped $1/\omega_0 = ${fmt(1 / w0, 3)}$ s. Too much damping is sluggish: the closer has to push fluid through a valve before the spring can move the door.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(3 * tau)], y: [-0.05, 1.05], aspect: 'wide', xlabel: 't (s)', ylabel: 'offset / start',
              curves: [
                { fn: `(1 + ${w0}*x)*exp(-${w0}*x)`, color: 'good', width: 2, dash: true, label: 'critical', labelAt: r6(0.6 / w0), labelDx: 8, labelDy: -6 },
                { fn: `${r6(c1)}*exp(${r6(r1)}*x) + ${r6(c2)}*exp(${r6(r2)}*x)`, color: 'accent', width: 2.4, label: `ζ = ${z}`, labelAt: r6(1.2 * tau), labelDx: 6, labelDy: -10 },
              ],
            },
            caption: 'Released from rest: the overdamped closer (blue) against the same spring critically damped (green, dashed).',
          },
        };
      },
    }),
    mcq({
      id: 'energy-cycle', difficulty: 2,
      prompt: t`A resonator has $Q = 50$. Roughly what fraction of its stored energy does it lose in each cycle of free oscillation?`,
      choices: ['About 12.6%', 'About 2%', 'About 6.3%', 'About 50%'],
      answer: 0,
      why: {
        1: t`That is $1/Q$. The energy envelope is $e^{-2\zeta\omega_0t}$, and one cycle lasts $2\pi/\omega_0$, so the loss is about $4\pi\zeta = 2\pi/Q$.`,
        2: t`$\pi/Q \approx 6.3\%$ is the loss of *amplitude* per cycle. Energy goes as amplitude squared, so it falls twice as fast.`,
        3: t`$Q$ is not a percentage; a high $Q$ means a small loss per cycle.`,
      },
      hints: [t`Energy goes as amplitude squared, and the amplitude envelope is $e^{-\zeta\omega_0t}$ with $\zeta = 1/(2Q)$.`, t`Over one period $2\pi/\omega_0$ the energy falls by $e^{-2\zeta\omega_0\cdot2\pi/\omega_0} = e^{-2\pi/Q} \approx 1 - 2\pi/Q$.`],
      teach: 'A free oscillator loses about 2π/Q of its energy per cycle — one way to define Q.',
      explain: t`$e^{-2\pi/50} = e^{-0.126} = 0.882$: about 12% of the energy goes each cycle (the approximation $2\pi/Q$ gives 12.6%). The amplitude falls by only about 6% per cycle.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [-1.1, 1.15], aspect: 'wide', xlabel: 't (cycles)', ylabel: '',
          curves: [
            { fn: 'exp(-pi*x/50)*cos(2*pi*x)', color: 'accent', width: 1.8, label: 'x', labelAt: 0.5, labelDx: 4, labelDy: 14 },
            { fn: 'exp(-pi*x/50)', color: 'ink3', width: 1.4, dash: true, label: 'amplitude', labelAt: 7.2, labelDx: 4, labelDy: -10 },
            { fn: 'exp(-2*pi*x/50)', color: 'gold', width: 2, label: 'energy / start', labelAt: 8.4, labelDx: -40, labelDy: 18 },
          ],
        },
        caption: 'Ten cycles of a Q = 50 oscillator: the amplitude envelope (dashed) and the stored energy (gold), which falls twice as fast.',
      },
    }),
    num({
      id: 'critical-crossing', difficulty: 3,
      gen(r) {
        const w0 = r.pick([4, 5, 8]), x0 = r.pick([2, 3, 5]);
        const v = w0 * x0;
        return {
          prompt: t`A critically damped instrument needle ($\omega_0 = ${w0}$ rad/s) sits ${x0} mm from zero and is flicked toward zero. It obeys $x = \big(x_0 + (v_0 + \omega_0x_0)\,t\big)e^{-\omega_0t}$, where $v_0 < 0$ is its starting velocity. What is the smallest flick speed $|v_0|$, in mm/s, that makes it swing past zero?`,
          answer: v, units: 'mm/s', tol: { rel: 0.005 },
          errors: [
            { value: x0 / w0, feedback: t`Check the units: $x_0/\omega_0$ is mm·s. The bracket $x_0 + (v_0 + \omega_0x_0)t$ must reach zero at some $t > 0$.` },
            { value: 2 * w0 * x0, feedback: t`It crosses as soon as $v_0 + \omega_0x_0 < 0$ — no factor 2.` },
          ],
          hints: [t`Only the bracket can vanish: $x = 0$ when $x_0 + (v_0 + \omega_0x_0)t = 0$.`, t`That happens at a positive time only if $v_0 + \omega_0x_0 < 0$, that is $|v_0| > \omega_0x_0$.`],
          teach: 'A critically damped system can cross equilibrium at most once — and only if it is flung toward it faster than ω₀ times its offset.',
          explain: t`$x = 0$ at $t^* = \dfrac{x_0}{|v_0| - \omega_0x_0}$, which is positive only when $|v_0| > \omega_0x_0 = ${w0}\times${x0} = ${v}$ mm/s. Faster flicks cross once and come back; slower ones never cross. No critically or overdamped system crosses zero more than once.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(6 / w0)], y: [r6(-0.45 * x0), r6(1.1 * x0)], aspect: 'wide', xlabel: 't (s)', ylabel: 'x (mm)',
              curves: [0.4, 0.75, 1.4, 2.2].map((f, k) => ({ fn: `(${x0} + (${r6(w0 * x0 * (1 - f))})*x)*exp(-${w0}*x)`, color: ['teal', 'good', 'gold', 'warn'][k], width: 2, label: k === 0 ? 'gentle flick' : k === 3 ? 'hard flick' : undefined, labelAt: r6([1.6, 0, 0, 0.55][k] / w0), labelDx: 6, labelDy: k === 0 ? -8 : 14 })),
            },
            caption: 'The needle flicked toward zero at four speeds: the two gentle flicks never cross, the two hard ones overshoot once and return. The dividing speed is not drawn.',
          },
        };
      },
    }),
    match({
      id: 'regimes', difficulty: 2,
      prompt: t`Explore the phase portrait of $x'' + 4\zeta\,x' + 4x = 0$ (position across, velocity up) with the slider, then match each damping ratio with what the motion does.`,
      left: [t`$\zeta = 0$`, t`$0 < \zeta < 1$`, t`$\zeta = 1$`, t`$\zeta > 1$`, t`$\zeta < 0$`],
      right: ['closed loops: it rings for ever', 'spirals in: it overshoots and rings down', 'the fastest return that never overshoots', 'creeps back, slower than critical', 'spirals out: energy is fed in', 'returns in a straight line at constant speed'],
      answer: [0, 1, 2, 3, 4],
      hints: [t`The roots are $-2\zeta \pm 2\sqrt{\zeta^2 - 1}$: complex when $|\zeta| < 1$, with real part $-2\zeta$.`, 'Complex roots spiral (in if the real part is negative); real negative roots come straight in; purely imaginary roots go round for ever.'],
      teach: 'The sign of ζ decides growth or decay, and whether |ζ| is below 1 decides oscillation: closed loops, inward spirals, critical, overdamped, outward spirals.',
      explain: t`$\zeta = 0$: roots $\pm2i$, closed loops. $0 < \zeta < 1$: complex with negative real part, inward spirals. $\zeta = 1$: a double root, the quickest non-oscillating return. $\zeta > 1$: two negative real roots, the slow one dragging. $\zeta < 0$: positive real part, outward spirals — negative damping, as in flutter.`,
      visual: { type: 'phase', params: { fx: 'y', fy: '-4*x - 4*zeta*y', x: [-3, 3], y: [-3, 3], xlabel: 'x', ylabel: 'x′', sliders: [{ key: 'zeta', label: 'Damping ratio $\\zeta$', min: -0.3, max: 2, step: 0.05, value: 0.3, explain: 'Here $\\omega_0 = 2$ rad/s, so the damping term is $4\\zeta x\'$.' }], seeds: [[2.5, 0], [-2.5, 0], [0, 2.8]] }, caption: 'Phase portrait: grey arrows give the direction of motion only; click to add trajectories.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-decrement', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5]), [A1, A2] = r.pick([[8.0, 5.0], [12.0, 7.5], [5.0, 4.0]]);
        const d = Math.log(A1 / A2) / n, z = d / Math.sqrt(4 * Math.PI ** 2 + d * d), Q = 1 / (2 * z);
        return {
          prompt: t`A bridge-deck model in a wind tunnel is tapped and rings down. One peak of its vibration measures ${A1.toFixed(1)} mm; ${n} cycles later a peak measures ${A2.toFixed(1)} mm. What is its quality factor $Q$?`,
          answer: Q, tol: { rel: 0.01 },
          errors: [{ value: 1 / (2 * d), feedback: t`$\delta \approx 2\pi\zeta$, so $Q = 1/(2\zeta) \approx \pi/\delta$ — you used $1/(2\delta)$.` }],
          hints: [t`$\delta = \dfrac1n\ln\dfrac{A_1}{A_2}$, then $\zeta = \delta/\sqrt{4\pi^2 + \delta^2}$ and $Q = 1/(2\zeta)$.`],
          teach: 'Peaks n cycles apart give δ = ln(A₁/A₂)/n, and for light damping Q ≈ π/δ.',
          explain: t`$\delta = \dfrac{1}{${n}}\ln\dfrac{${A1}}{${A2}} = ${fmt(d, 3)}$, $\zeta = ${fmt(z, 3)}$, so $Q = ${fmt(Q, 3)}$ (close to $\pi/\delta = ${fmt(Math.PI / d, 3)}$).`,
          visual: ringdown({ A: A1, g: r6(d * 1.2), w: r6(2 * Math.PI * 1.2), T: r6((n + 1.2) / 1.2), xlabel: 't (s)', ylabel: 'deck (mm)', points: [{ x: 0, y: A1, color: 'gold', label: `${A1.toFixed(1)} mm`, labelDx: 8, labelDy: -8 }, { x: r6(n / 1.2), y: A2, color: 'gold', label: `${A2.toFixed(1)} mm, ${n} cycles later`, labelDx: 8, labelDy: -10 }], caption: 'The tapped deck’s vibration, with the two measured peaks. Drawn at 1.2 Hz; the frequency does not affect the answer.' }),
        };
      },
    }),
    num({
      id: 'cp-gimbal', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([2, 5, 10]), I = r.pick([80, 120, 200]), k = r.pick([2.4e5, 4.8e5]);
        const L = Math.log(100 / P), z = L / Math.sqrt(Math.PI ** 2 + L * L), c = 2 * z * Math.sqrt(k * I);
        return {
          prompt: t`A rocket engine on its thrust-vector-control gimbal swings like $I\theta'' + c\,\theta' + k\theta = 0$ about its pivot, with $I = ${I}$ kg·m² and actuator stiffness $k = ${nice(k / 1e5)}\times10^{5}$ N·m/rad. The specification allows at most ${P}% overshoot after a step. What damping coefficient $c$, in N·m·s/rad, just meets it?`,
          answer: c, units: 'N*m*s/rad', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.sqrt(k * I), feedback: t`That is critical damping, $\zeta = 1$: no overshoot at all, but slower than the specification needs. Find the $\zeta$ that gives exactly ${P}% overshoot.` }],
          hints: [t`Overshoot ${P}% means $e^{-\pi\zeta/\sqrt{1 - \zeta^2}} = ${P / 100}$, so $\zeta = L/\sqrt{\pi^2 + L^2}$ with $L = \ln(100/${P})$.`, t`Then $c = 2\zeta\sqrt{kI}$.`],
          teach: 'An overshoot specification fixes ζ; the physical damping is then c = 2ζ√(kI).',
          explain: t`$L = ${fmt(L, 3)}$, $\zeta = ${fmt(z, 3)}$, and $c = 2(${fmt(z, 3)})\sqrt{${nice(k)}\times${I}} = ${fmt(c, 3)}$ N·m·s/rad. Less damping overshoots too far; more is allowed but settles more slowly.`,
          visual: { type: 'c3-roots', params: { mode: 'free', zeta: r6(z), w0: r6(Math.sqrt(k / I)), x0: 1, v0: 0, T: r6(10 / Math.sqrt(k / I)), sliders: false, readout: false, panels: 'motion', yname: 'θ' }, caption: 'A gimbal released from an offset with the damping that meets the specification: one small overshoot, then it settles. Linear model; real actuators also saturate.' },
        };
      },
    }),
    mcq({
      id: 'cp-heavier', difficulty: 2,
      prompt: t`A designer wants a landing-gear strut to stop bouncing as fast as possible and says: “more damping is always faster — let’s use $\zeta = 3$.” What is wrong?`,
      choices: [
        t`Above $\zeta = 1$ the slow root $-\omega_0(\zeta - \sqrt{\zeta^2 - 1})$ moves toward zero, so the return gets slower; the fastest decay is at $\zeta = 1$`,
        'Nothing: the decay rate grows in proportion to the damping',
        t`At $\zeta = 3$ the strut oscillates faster, so it settles sooner`,
        t`Damping above 1 is physically impossible`,
      ],
      answer: 0,
      why: {
        1: t`That is true only below $\zeta = 1$, where the decay rate is $\zeta\omega_0$. Overdamped, the slow root is about $-\omega_0/(2\zeta)$: it *shrinks* as damping grows.`,
        2: t`Overdamped systems do not oscillate at all.`,
        3: 'Overdamped systems are common — a door closer, a heavily oiled dashpot — they are just slow.',
      },
      hints: [t`Write the roots for $\zeta > 1$ and find the one nearer zero.`, t`At $\zeta = 3$: $-\omega_0(3 - \sqrt8) = -0.17\,\omega_0$, against $-\omega_0$ at $\zeta = 1$.`],
      teach: 'Critical damping gives the fastest-dying free motion; beyond it, extra damping only slows the return.',
      explain: t`The slowest-decaying term sets the settling time. Its rate is $\zeta\omega_0$ for $\zeta \le 1$ and $\omega_0(\zeta - \sqrt{\zeta^2 - 1})$ above — largest, $\omega_0$, exactly at $\zeta = 1$. At $\zeta = 3$ it is $0.17\,\omega_0$: about six times slower than critical. Real struts are tuned below 1, accepting a little overshoot for speed.`,
      visual: { type: 'c3-roots', params: { mode: 'free', zeta: 3, w0: 2, x0: 1, v0: 0, T: 10, sliders: false, readout: false, yname: 'x' }, caption: 'The proposal, ζ = 3: one root sits close to the imaginary axis (top), and the motion it makes creeps back (bottom).' },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.4 Mechanical vibrations', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax University Physics Vol. 1, §15.5 Damped oscillations', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-5-damped-oscillations' },
  ],
});
