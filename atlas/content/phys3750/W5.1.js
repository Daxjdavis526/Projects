// Travelling waves and d'Alembert's solution, the physicist's way: a shape
// f(x − vt) is a superposition of plane waves e^{iq(x − vt)} that all move at
// one speed (so it keeps its shape — unlike on a chain); the general solution
// f(x − vt) + g(x + vt); splitting initial data into a right- and a
// left-mover; the light-cone structure |x| ≤ vt. The mathematician's version
// (characteristic coordinates, the integral formula's derivation) is st-b B3.2.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, chainPic, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: a towed-target cable with a gust-made bump that is already partly moving aft
const EX = (() => {
  const T = 3000, mu = 0.12, v = Math.sqrt(T / mu), A = 0.4, w = 2, beta = 0.5, t1 = 0.2;
  return { T, mu, v, A, w, beta, t1, R: ((1 + beta) / 2) * A, L: ((1 - beta) / 2) * A, x1: v * t1 };
})();

const bumps = (A, w, b, caption, more = {}) => curvesPic([
  { fn: `${A}*exp(-(x/${w})^2)`, color: 'accent', label: 'y(x, 0)', labelAt: 0.4 * w, labelDx: 6 },
  ...(b ? [{ fn: `${(2 * b * A) / (w * w)}*x*exp(-(x/${w})^2)`, color: 'gold', dash: [5, 4], label: 'y_t(x, 0) ÷ v'.replace('y_t', 'yₜ'), labelAt: 1.2 * w, labelDx: 6 }] : []),
], [-4 * w, 4 * w], [-0.8 * A, 1.3 * A], caption, { xlabel: 'x (m)', ylabel: '', ...more });

export default lesson({
  id: 'phys3750.W5.1',
  title: 'Travelling waves and d’Alembert’s solution',
  minutes: 15, difficulty: 3,
  intro: t`A plane wave $e^{iq(x - vt)}$ is a pattern sliding along at speed $v$. Since the wave equation gives every wavenumber the **same** speed ($\omega = vq$), a sum of such waves — any shape $f$ you like — slides along unchanged: $f(x - vt)$. Waves running the other way add $g(x + vt)$, and d’Alembert showed that is everything:

$$y(x, t) = f(x - vt) + g(x + vt)$$

The two shapes are fixed by the starting data: the displacement $y_0(x)$ and the velocity $u_0(x)$. With $U$ an antiderivative of $u_0$, $f = \tfrac12\big[y_0 - U/v\big]$ and $g = \tfrac12\big[y_0 + U/v\big]$ (up to a constant that cancels). Released from rest, a bump splits into two half-height copies running apart. And no signal outruns $v$: a disturbance at the origin reaches only $|x| \le vt$ — the wave equation’s light cone. [The PDE course](#/lesson/st-b.B3.2) derives the formula with characteristic coordinates.`,
  symbols: [
    { tex: 'f(x - vt)', text: 'a shape moving toward $+x$ at speed $v$ without changing' },
    { tex: 'g(x + vt)', text: 'a shape moving toward $-x$ at speed $v$' },
    { tex: 'y_0(x),\\ u_0(x)', text: 'the displacement (m) and velocity (m/s) along the medium at $t = 0$' },
    { tex: 'U(x)', text: 'an antiderivative of $u_0$, in m²/s: $U\' = u_0$' },
    { tex: 'v', text: 'the wave speed, in m/s' },
  ],
  why: t`“Shapes travel unchanged at one speed, and nothing outruns it” is the physics of light in vacuum; in relativity the lines $x = \pm ct$ become light cones and decide which events can affect which.`,
  visual: {
    type: 'pde-player',
    title: 'One pulse, two halves, one light cone',
    lead: t`Above: the string at time $t$, with the starting shape dashed and the right- and left-moving parts drawn separately. Below: the $x$–$t$ plane, where each part rides along the lines $x \mp vt = $ constant.`,
    tasks: ['Release from rest (pluck): two half-height copies run apart.', 'Choose a right-moving start: the same bump with the right initial velocity travels off whole.', 'Drag the probe: only the starting data inside its backward cone can reach it.'],
    params: { mode: 'wave', init: 'pluck', halves: true, probe: [4, 3], controls: ['init', 'c', 't'], tmax: 6 },
  },
  example: {
    prompt: t`A ${EX.T / 1000}.0 kN towed-target cable ($\mu = ${EX.mu}$ kg/m) behind a test aircraft is struck by a gust that leaves a bump $y_0 = A e^{-x^2/w^2}$, $A = ${EX.A}$ m, $w = ${EX.w}$ m — and, because the gust swept aft, the cable is already moving with $u_0 = -\tfrac12 v\,y_0'(x)$. Split this into its travelling parts. Where are they, and how tall, ${EX.t1} s later?`,
    steps: [
      { label: 'Speed', text: t`$v = \sqrt{T/\mu} = \sqrt{${EX.T}/${EX.mu}} = ${tn(EX.v)}$ m/s.` },
      { label: 'Antiderivative', text: t`$u_0 = -\tfrac12 v\,y_0'$, so $U = -\tfrac12 v\,y_0$ and $U/v = -\tfrac12 y_0$.` },
      { label: 'Split', text: t`$f = \tfrac12\big[y_0 - U/v\big] = \tfrac34\,y_0$ and $g = \tfrac12\big[y_0 + U/v\big] = \tfrac14\,y_0$: three quarters of the bump runs aft (toward $+x$), one quarter forward.` },
      { label: 'Later', text: t`$y = \tfrac34 A e^{-(x - vt)^2/w^2} + \tfrac14 A e^{-(x + vt)^2/w^2}$. At $t = ${EX.t1}$ s the peaks are at $x = \pm vt = \pm${tn(EX.x1)}$ m, with heights $${tn(EX.R, 2)}$ m (aft) and $${tn(EX.L, 2)}$ m (forward).` },
      { label: 'Sense check', text: t`At $t = 0$ the two parts add back to $y_0$, and the velocity $-v f' + v g' = -\tfrac12 v y_0'$ matches $u_0$. Released from rest ($u_0 = 0$) the split would be half and half.` },
    ],
    answer: t`A $${tn(EX.R, 2)}$ m bump at $x = +${tn(EX.x1)}$ m and a $${tn(EX.L, 2)}$ m bump at $x = -${tn(EX.x1)}$ m, each still Gaussian with $w = ${EX.w}$ m.`,
    visual: curvesPic([
      { fn: `${EX.A}*exp(-(x/${EX.w})^2)`, color: 'ink3', dash: [5, 4], label: 't = 0', labelAt: 0, labelDy: -12 },
      { fn: `${EX.R}*exp(-((x - ${EX.x1})/${EX.w})^2) + ${EX.L}*exp(-((x + ${EX.x1})/${EX.w})^2)`, color: 'accent', label: `t = ${EX.t1} s`, labelAt: EX.x1 + 1.5, labelDx: 6 },
    ], [-50, 50], [-0.05, 0.5], t`The cable at $t = 0$ (dashed) and $${EX.t1}$ s later (solid). Small slopes, no air drag; the cable is treated as uniform and infinitely long.`, { xlabel: 'x (m)', ylabel: 'y (m)' }),
  },
  practice: [
    mcq({
      id: 'why-unchanged', difficulty: 2,
      prompt: t`Any shape can be written as a sum of sines, $f(x) = \sum_q F_q e^{iqx}$. Why does $f(x - vt)$ keep its shape on a string, while the same pulse on a chain of beads spreads into ripples?`,
      visual: chainPic({ N: 40, start: 'pulse', width: 1, time: 0.75 }, 'A pulse only about one bead spacing wide, some time after launch on a chain: it has shed ripples behind it.'),
      choices: [
        t`On a string $\omega = vq$, so every component moves at the same speed $\omega/q$; on a chain short waves are slower`,
        t`A string has no friction while the chain’s springs lose energy, which smears the pulse into ripples`,
        t`The chain’s pulse reflects off the individual beads, while a string has nothing to reflect from`,
        t`A string obeys a nonlinear equation that holds pulses together, while the chain is linear`,
      ],
      answer: 0,
      why: {
        1: 'Both are lossless here: the chain’s motion is an exact, energy-conserving sum of modes.',
        2: 'A uniform chain does not reflect a wave bead by bead; its ripples come from each component travelling at its own speed.',
        3: 'Both are linear. It is the dispersion relation — straight line or not — that decides.',
      },
      hints: [t`Each component $e^{iq(x - \omega t/q)}$ moves at $\omega/q$.`, t`For the chain, $\omega/q = v\,\frac{\sin(qa/2)}{qa/2}$ depends on $q$.`],
      teach: 'A shape keeps its form only if every Fourier component travels at the same speed: a straight-line dispersion relation.',
      explain: t`$\omega = vq$ makes the phase speed $\omega/q = v$ the same for all $q$, so the components stay in step and the sum is $f(x - vt)$. On the chain, short-wavelength components fall behind and trail as ripples — dispersion.`,
    }),
    num({
      id: 'split-height', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 4, 6]), b = r.pick([0.2, 0.4, 0.6, -0.4, -0.2]), w = 1;
        const left = ((1 - b) / 2) * A;
        return {
          prompt: t`A long string starts with $y_0 = ${A}\,e^{-x^2}$ cm and velocity $u_0 = ${b < 0 ? '+' : '-'}${tn(Math.abs(b), 2)}\,v\,y_0'(x)$. What is the height of the part that runs toward $-x$, in cm?`,
          visual: bumps(A, w, b, 'The starting displacement (blue) and the starting velocity divided by v (gold, dashed), x in m, y in cm.', { ylabel: '' }),
          answer: left, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ((1 + b) / 2) * A, feedback: t`That is the right-moving part. $g = \tfrac12[y_0 + U/v]$ runs toward $-x$.` }, { value: A / 2, feedback: 'Half and half is the split for a release from rest; this string is already moving.' }],
          hints: [t`$U = ${b < 0 ? '+' : '-'}${tn(Math.abs(b), 2)}\,v\,y_0$, so $U/v = ${b < 0 ? '+' : '-'}${tn(Math.abs(b), 2)}\,y_0$.`, t`$g = \tfrac12[y_0 + U/v] = ${tn((1 - b) / 2, 2)}\,y_0$.`],
          teach: t`Initial velocity tips the split: $f = \tfrac12[y_0 - U/v]$ runs right, $g = \tfrac12[y_0 + U/v]$ runs left.`,
          explain: t`$g = \tfrac12(1 - (${tn(b, 2)}))\,y_0$, a bump $${tn(left)}$ cm high moving toward $-x$; the other $${tn(((1 + b) / 2) * A)}$ cm moves toward $+x$.`,
        };
      },
    }),
    expr({
      id: 'release', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 4, 6]), v = r.pick([2, 3, 5]);
        return {
          prompt: t`A long string with $v = ${v}$ m/s is held in the shape $y_0 = \dfrac{${A}}{1 + x^2}$ cm ($x$ in m) and released from rest. Write $y(x, t)$ in cm.`,
          visual: curvesPic([{ fn: `${A}/(1 + x^2)`, color: 'accent', label: 'y₀', labelAt: 0.8, labelDx: 6 }], [-6, 6], [-0.3, A * 1.25], 'The starting shape (y in cm against x in m), at rest.', { xlabel: 'x (m)', ylabel: 'y (cm)' }),
          answer: `${A / 2}/(1 + (x - ${v} t)^2) + ${A / 2}/(1 + (x + ${v} t)^2)`,
          answerTeX: t`\frac{${A / 2}}{1 + (x - ${v}t)^2} + \frac{${A / 2}}{1 + (x + ${v}t)^2}`,
          lhs: 'y(x, t)', vars: { x: [-3, 3], t: [0, 2] },
          errors: [{ answer: `${A}/(1 + (x - ${v} t)^2) + ${A}/(1 + (x + ${v} t)^2)`, feedback: t`At $t = 0$ that gives twice $y_0$: each travelling part carries **half** the starting shape.` }, { answer: `${A}/(1 + (x - ${v} t)^2)`, feedback: 'A release from rest sends equal halves both ways; a single right-mover needs a starting velocity.' }],
          hints: [t`From rest, $u_0 = 0$, so $U$ is a constant and $f = g = \tfrac12 y_0$.`, t`$y = \tfrac12y_0(x - vt) + \tfrac12y_0(x + vt)$.`],
          teach: t`Released from rest: $y = \tfrac12\big[y_0(x - vt) + y_0(x + vt)\big]$.`,
          explain: t`Two bumps of height $${A / 2}$ cm, centred at $x = \pm${v}t$. Check: at $t = 0$ they add to $y_0$, and $y_t(x, 0) = \tfrac{v}{2}[-y_0' + y_0'] = 0$.`,
        };
      },
    }),
    {
      type: 'point', id: 'where-peak', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3]), x0 = r.pick([-2, -1, 0]), v = r.pick([1.5, 2, 2.5]), tt = r.pick([1, 1.5, 2]);
        return {
          prompt: t`A bump of height ${A} cm centred at $x = ${x0}$ m is released from rest on a long string with $v = ${v}$ m/s. Drag the point to the peak of the **right-moving** part at $t = ${tt}$ s.`,
          visual: { type: 'graph', params: { x: [-8, 8], y: [-0.5, A * 1.3], aspect: 'wide', xlabel: 'x (m)', ylabel: 'y (cm)', xticks: 9, curves: [{ fn: `${A}*exp(-(x - ${x0})^2)`, color: 'ink3', dash: [5, 4], label: 't = 0', labelAt: x0, labelDy: -12 }], drag: [{ key: 'p', x: -6, y: 0.5, snap: 0.05 }] }, caption: 'The starting shape (dashed), released from rest.' },
          answer: { x: x0 + v * tt, y: A / 2 }, tol: { x: 0.3, y: 0.2 },
          instruction: 'Drag the point to the peak, then check.',
          hints: [t`From rest, each half is $\tfrac12y_0$.`, t`The right-moving half is centred at $x_0 + vt$.`],
          teach: 'Released from rest, a bump becomes two half-height bumps moving apart at v.',
          explain: t`Peak at $x = ${x0} + ${v}(${tt}) = ${tn(x0 + v * tt)}$ m, height $${A / 2}$ cm (once the halves have separated).`,
        };
      },
    },
    num({
      id: 'first-arrival', difficulty: 2,
      gen(r) {
        const E = 70e9, rho = 2700, v = Math.sqrt(E / rho), D = r.pick([6, 9, 12, 15]), a = r.pick([0.2, 0.5]);
        const tt = ((D - a) / v) * 1000;
        return {
          prompt: t`A micrometeoroid strikes a long aluminium truss member, disturbing it only within ${a} m of the impact point. Lengthwise waves in it obey the wave equation with $v = \sqrt{E/\rho} = ${tn(v)}$ m/s. A strain gauge sits ${D} m from the impact point. What is the earliest moment it can register anything, in ms?`,
          visual: { type: 'graph', params: { x: [-D - 3, D + 3], y: [0, ((D + 3) / v) * 1000], aspect: 'wide', xlabel: 'x (m)', ylabel: 't (ms)', curves: [{ fn: `(abs(x) - ${a})/${v}*1000`, color: 'warn', dash: [5, 4], domain: [a, D + 3] }, { fn: `(abs(x) - ${a})/${v}*1000`, color: 'warn', dash: [5, 4], domain: [-D - 3, -a] }], shade: [{ fn: `${((D + 3) / v) * 1000}`, lower: `max(0, (abs(x) - ${a})/${v}*1000)`, from: -D - 3, to: D + 3, color: 'warn', alpha: 0.12 }], vlines: [{ x: D, label: 'gauge', color: 'gold' }] }, caption: 'The x–t plane: the region the impact can influence (shaded) is bounded by lines of slope ±1/v starting from the edges of the struck zone.' },
          answer: tt, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: (D / v) * 1000, feedback: t`The disturbance starts at the edge of the struck zone, ${a} m out, not at its centre.` }],
          hints: ['Nothing travels faster than v.', t`The nearest disturbed point is $${D} - ${a}$ m from the gauge.`],
          teach: t`The wave equation’s influence spreads at exactly $v$: a point at distance $d$ from the disturbed region hears nothing before $t = d/v$.`,
          explain: t`$t = (${D} - ${a})/${tn(v)} = ${tn(tt)}$ ms.`,
        };
      },
    }),
    mcq({
      id: 'one-way', difficulty: 3,
      prompt: t`What starting velocity $u_0$ makes a bump $y_0(x)$ travel off **entirely toward $-x$**, with nothing going the other way?`,
      visual: bumps(3, 1, 0, 'The starting displacement y₀ (cm against x in m).'),
      choices: [t`$u_0 = +v\,y_0'(x)$`, t`$u_0 = -v\,y_0'(x)$`, t`$u_0 = 0$`, t`$u_0 = -v\,y_0(x)$`],
      answer: 0,
      why: {
        1: t`$-v\,y_0'$ is the velocity of a right-mover: $\partial_t f(x - vt) = -v f'$.`,
        2: 'From rest the bump splits in two.',
        3: t`A velocity proportional to $y_0$ itself pushes the whole bump down; it does not send it sideways.`,
      },
      hints: [t`For $y = g(x + vt)$, $y_t = +v\,g'$.`, t`At $t = 0$, $g = y_0$.`],
      teach: t`A left-mover has $y_t = +v\,y_x$; a right-mover has $y_t = -v\,y_x$.`,
      explain: t`With $u_0 = v y_0'$, $U = v y_0$, so $f = \tfrac12[y_0 - y_0] = 0$ and $g = y_0$: the whole bump leaves toward $-x$. The leading (left) edge of the bump rises and the trailing edge falls.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-towed', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([2000, 3000, 4500]), mu = r.pick([0.1, 0.15]), v = Math.sqrt(T / mu), A = r.pick([0.3, 0.5]), w = 2, b = r.pick([0.2, 0.6]), tt = r.pick([0.15, 0.25]);
        const X = Math.round(v * tt + r.pick([-1, 1]) * 1.5), y = ((1 + b) / 2) * A * Math.exp(-(((X - v * tt) / w) ** 2)) + ((1 - b) / 2) * A * Math.exp(-(((X + v * tt) / w) ** 2));
        return {
          prompt: t`A towed sensor cable (tension ${T} N, $\mu = ${mu}$ kg/m) is left by a gust with $y_0 = ${A}\,e^{-x^2/4}$ m ($x$ in m) and velocity $u_0 = -${b}\,v\,y_0'(x)$. What is its displacement at $x = ${X}$ m, $t = ${tt}$ s, in m?`,
          visual: bumps(A, w, b, 'The starting displacement (blue) and velocity ÷ v (gold, dashed), in m against x in m.'),
          answer: y, units: 'm', tol: { rel: 0.02, abs: 0.002 },
          errors: [{ value: (A / 2) * Math.exp(-(((X - v * tt) / w) ** 2)), feedback: 'That treats the release as from rest (half and half). The starting velocity sends more than half toward +x.' }],
          hints: [t`$v = \sqrt{T/\mu}$; split $f = \tfrac12(1 + ${b})y_0$, $g = \tfrac12(1 - ${b})y_0$.`, t`$y(X, t) = f(X - vt) + g(X + vt)$; the left-mover is far away by then.`],
          teach: 'Split the starting data into its two travelling parts, then slide each one.',
          explain: t`$v = ${tn(v)}$ m/s, so the right-mover (height $${tn(((1 + b) / 2) * A)}$ m) is centred at $${tn(v * tt)}$ m: $y = ${tn(y)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'cp-cone', difficulty: 2,
      prompt: t`A sharp tap at $x = 0$, $t = 0$ disturbs a long cable on which $v = 2$ m/s. Which of the events marked in the $x$–$t$ plane can be affected by it?`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [0, 3], aspect: 'wide', xlabel: 'x (m)', ylabel: 't (s)', curves: [{ fn: 'abs(x)/2', color: 'warn', dash: [5, 4] }], points: [{ x: 3, y: 1, label: 'P', color: 'gold' }, { x: -1, y: 2, label: 'Q', color: 'gold' }, { x: 4, y: 2, label: 'R', color: 'gold' }, { x: -5, y: 1.5, label: 'S', color: 'gold' }] }, caption: 'The x–t plane; dashed: the lines x = ±2t through the tap.' },
      choices: ['Q and R', 'Q only', 'P and S', 'All four of them'],
      answer: 0,
      why: {
        1: t`R lies exactly on the front $x = vt$: the leading edge of the disturbance arrives there.`,
        2: t`P needs $3$ m in $1$ s and S needs $5$ m in $1.5$ s — faster than 2 m/s.`,
        3: 'The wave equation sends nothing faster than v, so events outside the cone cannot be affected.',
      },
      hints: [t`An event $(x, t)$ can be reached only if $|x| \le vt$.`, 'Check each point: is |x| ≤ 2t?'],
      teach: t`The wave equation has a light cone: a disturbance at the origin affects only $|x| \le vt$.`,
      explain: t`Q: $1 \le 4$ ✓; R: $4 \le 4$ ✓ (on the front); P: $3 > 2$; S: $5 > 3$. In relativity the same picture, with $v = c$, decides cause and effect.`,
    }),
    num({
      id: 'cp-ratio', difficulty: 2,
      gen(r) {
        const b = r.pick([0.2, 0.25, 0.5, 0.6]);
        return {
          prompt: t`A bump starts with velocity $u_0 = -${b}\,v\,y_0'$. What is the ratio of the height of the part moving toward $+x$ to the part moving toward $-x$?`,
          visual: bumps(2, 1, b, 'The starting displacement (blue) and velocity ÷ v (gold, dashed).'),
          answer: (1 + b) / (1 - b), tol: { rel: 0.01 },
          errors: [{ value: (1 - b) / (1 + b), feedback: 'Upside down: the velocity −βv y₀′ favours +x.' }],
          hints: [t`$U/v = -${b}\,y_0$.`, t`$f = \tfrac12(1 + ${b})y_0$, $g = \tfrac12(1 - ${b})y_0$.`],
          teach: t`A starting velocity $-\beta v y_0'$ splits the bump in the ratio $(1 + \beta) : (1 - \beta)$.`,
          explain: t`$(1 + ${b})/(1 - ${b}) = ${tn((1 + b) / (1 - b))}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 6: Elementary Solutions to the Wave Equation', url: 'https://digitalcommons.usu.edu/foundation_wave/17/' },
    { label: 'Georgi, The Physics of Waves, ch. 7 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
