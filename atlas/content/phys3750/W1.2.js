// Damped and driven oscillators, done the course's way: try e^{−iωt}. Free
// damping makes the frequency complex (its imaginary part is the decay); a
// sinusoidal drive gives the complex amplitude Ã = (F₀/m)/(ω₀² − ω² − iγω),
// a point that traces a loop in the complex plane as the drive frequency
// sweeps. Brief by design: the full story is PHYS 3550 M2.2–M2.3.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const DEG = 180 / Math.PI;

// R(ω) = Ã / (F₀/k) = ω₀² / (ω₀² − ω² − iγω): the response in units of the static deflection
const R = (w, w0, g) => { const d = (w0 * w0 - w * w) ** 2 + (g * w) ** 2; return [(w0 * w0 * (w0 * w0 - w * w)) / d, (w0 * w0 * g * w) / d]; };
const lag = (w, w0, g) => Math.atan2(g * w, w0 * w0 - w * w);

/**
 * The loop as a parametric curve. ω = ω₀ + (γ/2) tan t samples it evenly in
 * phase, so a sharp resonance is drawn smoothly; t runs from ω = 0 to ω = 12ω₀.
 * g may be a number or a slider key.
 */
function loopCurve(w0, g) {
  const W = `(${w0} + (${g})/2*tan(t))`, D = `((${w0 * w0} - ${W}^2)^2 + ((${g})*${W})^2)`;
  return { param: [`${w0 * w0}*(${w0 * w0} - ${W}^2)/${D}`, `${w0 * w0}*(${g})*${W}/${D}`], t: [`atan(-2*${w0}/(${g}))`, `atan(22*${w0}/(${g}))`], color: 'accent', width: 2 };
}

/** The loop Ã/(F₀/k) traces as ω sweeps from 0 upward, with optional marked points [{ w, label }]. */
function locusPic(w0, g, caption, marks = [], o = {}) {
  const Q = w0 / g, top = Math.max(1.15, Q * 1.12);
  return {
    type: 'graph',
    params: {
      x: [-0.62 * top, 0.62 * top], y: [-0.12 * top, top], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im', xticks: o.ticks ?? 0, yticks: o.ticks ?? 0,
      curves: [loopCurve(w0, g)],
      points: [{ x: 1, y: 0, color: 'ink3', r: 3, label: o.staticLabel ?? 'ω = 0', labelDx: 6, labelDy: 12 }, ...marks.map((m) => { const [x, y] = R(m.w, w0, g); return { x, y, color: m.color || 'gold', r: 5, label: m.label, labelDx: m.dx ?? 8, labelDy: m.dy ?? -8 }; })],
      arrows: o.arrow ? [{ from: [0, 0], to: R(o.arrow, w0, g), color: 'gold', width: 2.2 }] : [],
    },
    caption,
  };
}

// the worked example: a pogo-prone stage driven by thrust oscillation
const EX = (() => {
  const f0 = 16, Q = 25, f = 15, w0 = 2 * Math.PI * f0, w = 2 * Math.PI * f, g = w0 / Q;
  const [re, im] = R(w, w0, g), G = Math.hypot(re, im), d = lag(w, w0, g);
  return { f0, Q, f, w0, w, g, re, im, G, d, a: w0 * w0 - w * w, b: g * w };
})();

const W0 = 10;   // the Explore's natural frequency, rad/s

export default lesson({
  id: 'phys3750.W1.2',
  title: 'Damped and driven oscillators revisited',
  minutes: 12, difficulty: 2,
  intro: t`Add a drag force $-m\gamma\dot x$ and a drive $F_0\cos\omega t$ and the equation stays **linear**, so the guess $\tilde x = \tilde A e^{-i\omega t}$ still works. Every $d/dt$ becomes $-i\omega$, and the differential equation collapses into one line of algebra:

$$\ddot x + \gamma\dot x + \omega_0^2 x = \frac{F_0}{m}\cos\omega t \quad\Longrightarrow\quad \tilde A = \frac{F_0/m}{\omega_0^2 - \omega^2 - i\gamma\omega}$$

The size of $\tilde A$ is the steady amplitude; its angle $\delta$ is how far the motion lags the drive. With no drive, the same guess makes the frequency itself complex — its imaginary part is the decay. This lesson is the complex-number view in brief; the regimes, energy and resonance curves are worked out in [damped oscillators](#/lesson/phys3550.M2.2) and [driven oscillators](#/lesson/phys3550.M2.3), which write $\beta = \gamma/2$.`,
  symbols: [
    { tex: '\\gamma', text: 'the damping rate, in s⁻¹: the drag force is $-m\\gamma\\dot x$' },
    { tex: '\\omega_0 = \\sqrt{k/m}', text: 'the natural angular frequency of the undamped oscillator, in rad/s' },
    { tex: 'F_0,\\ \\omega', text: 'the drive’s force amplitude (N) and angular frequency (rad/s)' },
    { tex: 'm', text: 'the mass, in kg' },
    { tex: '\\tilde A = |\\tilde A|e^{i\\delta}', text: 'the complex amplitude of the steady motion $x = |\\tilde A|\\cos(\\omega t - \\delta)$, in m' },
    { tex: '\\delta', text: 'the phase lag of the motion behind the drive, between $0$ and $\\pi$' },
    { tex: 'Q = \\omega_0/\\gamma', text: 'the quality factor: the resonant amplitude is $Q$ times the static deflection $F_0/k$' },
  ],
  why: t`A complex amplitude that solves an algebraic equation is how every driven system in the course is handled — and with many masses the denominator becomes a matrix, whose zeros are the normal modes.`,
  visual: {
    type: 'graph',
    title: 'The complex amplitude as the drive frequency sweeps',
    lead: t`The blue loop is every possible $\tilde A$, divided by the static deflection $F_0/k$, as $\omega$ runs from $0$ upward; the gold arrow is $\tilde A$ at the drive frequency you choose ($\omega_0 = ${W0}$ rad/s). Its **length** is the amplitude gain and its **angle** is the lag $\delta$.`,
    tasks: [
      t`Sweep $\omega$ up from 0: the arrow starts along the real axis (in phase), stands straight up at $\omega = \omega_0$ ($\delta = 90^\circ$, gain $Q$), and ends pointing left (out of phase).`,
      t`Lower $\gamma$: the loop grows; its top sits at height $Q = \omega_0/\gamma$.`,
      'The arrow never dips below the real axis: a damped oscillator never leads its drive.',
    ],
    params: {
      x: [-6.5, 6.5], y: [-1.2, 10.8], equal: true, aspect: 'wide', xlabel: 'Re (Ã ÷ static)', ylabel: 'Im', xticks: 7, yticks: 6,
      sliders: [
        { key: 'w', label: 'Drive frequency $\\omega$', min: 0, max: 25, step: 0.1, value: 7, unit: '\\mathrm{rad/s}', explain: t`The natural frequency is $\omega_0 = ${W0}$ rad/s.` },
        { key: 'g', label: 'Damping rate $\\gamma$', min: 1, max: 10, step: 0.1, value: 2, unit: '\\mathrm{s^{-1}}', explain: t`Free motion dies like $e^{-\gamma t/2}$.` },
      ],
      curves: [loopCurve(W0, 'g')],
      arrows: [{ from: [0, 0], to: [`${W0 * W0}*(${W0 * W0} - w^2)/((${W0 * W0} - w^2)^2 + (g*w)^2)`, `${W0 * W0}*g*w/((${W0 * W0} - w^2)^2 + (g*w)^2)`], color: 'gold', width: 2.6, label: 'Ã', labelDx: 6, labelDy: -8 }],
      points: [{ x: 1, y: 0, color: 'ink3', r: 3, label: 'ω = 0', labelDx: 6, labelDy: 12 }],
      readouts: [
        { label: 'gain $|\\tilde A|/(F_0/k)$', expr: `${W0 * W0}/sqrt((${W0 * W0} - w^2)^2 + (g*w)^2)`, digits: 3 },
        { label: 'lag $\\delta$', expr: `atan2(g*w, ${W0 * W0} - w^2)*180/pi`, unit: '^\\circ', digits: 3 },
        { label: '$Q = \\omega_0/\\gamma$', expr: `${W0}/g`, digits: 3 },
      ],
    },
    caption: t`Steady state only (the transient has died away); linear damping $-m\gamma\dot x$. Lengths are in units of the static deflection $F_0/k$.`,
  },
  example: {
    prompt: t`**Pogo** is a lengthwise vibration of a liquid-fuelled rocket: the stack’s first longitudinal structural mode couples to oscillations in engine thrust. Model that mode as a damped oscillator with $f_0 = ${EX.f0}$ Hz and $Q = ${EX.Q}$, driven by a thrust oscillation at $f = ${EX.f}$ Hz. How many times larger is the response than the static deflection the same force would give, and how far does it lag the thrust?`,
    steps: [
      { label: 'Rates', text: t`$\omega_0 = 2\pi f_0 = ${tn(EX.w0, 4)}$ rad/s, $\omega = 2\pi f = ${tn(EX.w, 4)}$ rad/s, and $\gamma = \omega_0/Q = ${tn(EX.g)}\ \text{s}^{-1}$.` },
      { label: 'Divide by the static deflection', text: t`The static deflection is $F_0/k = F_0/(m\omega_0^2)$, so $\dfrac{\tilde A}{F_0/k} = \dfrac{\omega_0^2}{\omega_0^2 - \omega^2 - i\gamma\omega}$. Only rates appear — no mass or force is needed.` },
      { label: 'The denominator', text: t`$\omega_0^2 - \omega^2 = ${tn(EX.a, 4)}\ \text{s}^{-2}$ and $\gamma\omega = ${tn(EX.b, 3)}\ \text{s}^{-2}$, so it is $${tn(EX.a, 4)} - ${tn(EX.b, 3)}\,i$.` },
      { label: 'Gain', text: t`$\left|\dfrac{\tilde A}{F_0/k}\right| = \dfrac{${tn(EX.w0 ** 2, 4)}}{\sqrt{${tn(EX.a, 4)}^2 + ${tn(EX.b, 3)}^2}} = ${tn(EX.G)}$.` },
      { label: 'Lag', text: t`Dividing by $a - ib$ multiplies by $a + ib$ (over $a^2 + b^2$), so $\tilde A$ points at angle $\delta = \arctan\dfrac{${tn(EX.b, 3)}}{${tn(EX.a, 4)}} = ${tn(EX.d * DEG)}^\circ$ — a lag, because the motion is $|\tilde A|\cos(\omega t - \delta)$.` },
      { label: 'Sense check', text: t`Just below resonance the gain is well short of $Q = ${EX.Q}$ and the lag is under $90^\circ$, as on the loop. Real pogo is worse than this picture: the stack’s motion changes the pressure at the pump inlets, which changes thrust — a feedback loop. NASA’s cure on Saturn V was to detune the propellant lines with gas-filled accumulators.` },
    ],
    answer: t`The response is about $${tn(EX.G, 2)}$ times the static deflection and lags the thrust by about $${tn(EX.d * DEG, 2)}^\circ$.`,
    visual: locusPic(EX.w0, EX.g, t`$\tilde A/(F_0/k)$ for $f_0 = ${EX.f0}$ Hz, $Q = ${EX.Q}$, with the ${EX.f} Hz drive marked (gold arrow). The top of the loop, at ${EX.f0} Hz, reaches $Q$.`, [], { arrow: EX.w }),
  },
  practice: [
    num({
      id: 'complex-omega', difficulty: 2,
      gen(r) {
        const f0 = r.pick([0.5, 1, 2]), z = r.pick([0.5, 0.6, 0.7, 0.8]), w0 = 2 * Math.PI * f0, g = 2 * z * w0;
        const wd = Math.sqrt(w0 * w0 - g * g / 4);
        return {
          prompt: t`A seismometer’s pendulum has natural frequency ${f0} Hz and eddy-current damping $\gamma = ${tn(g)}\ \text{s}^{-1}$. Trying $x = e^{-i\omega t}$ in $\ddot x + \gamma\dot x + \omega_0^2x = 0$ gives a complex $\omega$. What is its **real part** (the angular frequency at which it rings), in rad/s?`,
          visual: curvesPic([
            { fn: `exp(-${g / 2}*x)*cos(${wd}*x)`, color: 'accent' },
            { fn: `exp(-${g / 2}*x)`, color: 'ink4', dash: [4, 4] },
            { fn: `-exp(-${g / 2}*x)`, color: 'ink4', dash: [4, 4] },
          ], [0, 3 / f0], [-1.15, 1.15], t`The pendulum released from rest at $x = 1$: a decaying oscillation inside its envelope $e^{-\gamma t/2}$ (dashed). Time in s across.`, { xlabel: 't (s)', ylabel: '' }),
          answer: wd, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: w0, feedback: t`That is $\omega_0$, the undamped frequency. Damping this heavy slows the ringing noticeably: $\operatorname{Re}\omega = \sqrt{\omega_0^2 - \gamma^2/4}$.` }],
          hints: [t`Substitute: $(-i\omega)^2 + \gamma(-i\omega) + \omega_0^2 = 0$, i.e. $\omega^2 + i\gamma\omega - \omega_0^2 = 0$.`, t`The quadratic formula gives $\omega = -\tfrac{i\gamma}{2} \pm \sqrt{\omega_0^2 - \gamma^2/4}$; $\omega_0 = 2\pi f_0$.`],
          teach: t`Damping makes $\omega$ complex: $\omega = \pm\sqrt{\omega_0^2 - \gamma^2/4} - i\gamma/2$, the real part rings and the imaginary part decays.`,
          explain: t`$\omega_0 = ${tn(w0)}$ rad/s, so $\operatorname{Re}\omega = \sqrt{${tn(w0)}^2 - ${tn(g / 2)}^2} = ${tn(wd)}$ rad/s, and $e^{-i\omega t} = e^{-\gamma t/2}e^{\mp i(${tn(wd)})t}$.`,
        };
      },
    }),
    mcq({
      id: 'roots-plane', difficulty: 2,
      prompt: t`The complex frequencies $\omega$ of two free damped oscillators, P (blue) and S (gold), are plotted. Which statement is right?`,
      visual: {
        type: 'graph',
        params: {
          x: [-14, 14], y: [-5, 1.2], aspect: 'wide', xlabel: 'Re ω (rad/s)', ylabel: 'Im ω', xticks: 7, yticks: 4,
          points: [{ x: 10, y: -1, color: 'accent', r: 6, label: 'P' }, { x: -10, y: -1, color: 'accent', r: 6, label: 'P' }, { x: 8, y: -4, color: 'gold', r: 6, label: 'S' }, { x: -8, y: -4, color: 'gold', r: 6, label: 'S' }],
        },
        caption: t`Each oscillator has a pair of frequencies $\omega = \pm\omega_d - i\gamma/2$, mirror images across the imaginary axis.`,
      },
      choices: ['S dies away four times faster and rings a little slower', 'S rings faster, because it sits lower', 'P dies away faster, because it is nearer the real axis', 'Both die away equally fast; only their ringing frequencies differ'],
      answer: 0,
      why: {
        1: t`How far below the axis a frequency sits is the decay rate $\gamma/2$, not the ringing frequency; the ringing frequency is the horizontal position, and S’s is smaller.`,
        2: t`$e^{-i\omega t}$ with $\operatorname{Im}\omega = -\gamma/2$ gives $e^{-\gamma t/2}$: the nearer the axis, the *slower* the decay.`,
        3: t`Their imaginary parts differ, $-1$ against $-4\ \text{s}^{-1}$, and the imaginary part is the decay rate.`,
      },
      hints: [t`Write $e^{-i\omega t}$ with $\omega = a - ib$: it equals $e^{-bt}e^{-iat}$.`, 'Compare the vertical positions for decay and the horizontal positions for ringing.'],
      teach: t`For $e^{-i\omega t}$, the real part of $\omega$ is how fast it rings and $-\operatorname{Im}\omega$ is how fast it decays.`,
      explain: t`P: rings at 10 rad/s, amplitude $\propto e^{-t}$. S: rings at 8 rad/s, amplitude $\propto e^{-4t}$ — heavier damping both speeds the decay and slows the ringing, $\omega_d = \sqrt{\omega_0^2 - \gamma^2/4}$.`,
    }),
    num({
      id: 'amp-at-w', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 4, 5]), f0 = r.pick([20, 25, 30]), w0 = 2 * Math.PI * f0, k = m * w0 * w0, Q = r.pick([5, 8, 10]), g = w0 / Q;
        const f = f0 * r.pick([0.6, 0.8, 1.25, 1.5]), w = 2 * Math.PI * f, F0 = r.pick([20, 40, 50]);
        const A = (F0 / m) / Math.hypot(w0 * w0 - w * w, g * w);
        return {
          prompt: t`A ${m} kg avionics box sits on a shock mount with natural frequency ${f0} Hz and $Q = ${Q}$. Engine vibration shakes it with a force of amplitude ${F0} N at ${tn(f)} Hz. What is the amplitude of its steady motion, in mm?`,
          visual: locusPic(w0, g, t`The loop of $\tilde A/(F_0/k)$ for this mount, with the drive frequency marked. The static deflection would be $F_0/k = ${tn(F0 / k * 1000)}$ mm.`, [{ w, label: `${tn(f)} Hz` }]),
          answer: A * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (F0 / k) * 1000, feedback: t`That is the static deflection $F_0/k$. A shaking force is amplified (or reduced) by $\omega_0^2/|\omega_0^2 - \omega^2 - i\gamma\omega|$.` }, ...(Math.abs((w0 * w0 - w * w) / Math.hypot(w0 * w0 - w * w, g * w)) < 0.97 ? [{ value: ((F0 / m) / Math.abs(w0 * w0 - w * w)) * 1000, feedback: t`You left out the damping term $-i\gamma\omega$; this close to resonance it matters.` }] : [])],
          hints: [t`$|\tilde A| = \dfrac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}}$ with $\gamma = \omega_0/Q$.`, t`Convert both frequencies to rad/s first: $\omega = 2\pi f$.`],
          teach: t`The steady amplitude is $|\tilde A| = (F_0/m)/|\omega_0^2 - \omega^2 - i\gamma\omega|$.`,
          explain: t`$\omega_0 = ${tn(w0, 4)}$, $\omega = ${tn(w, 4)}$ rad/s, $\gamma = ${tn(g)}\ \text{s}^{-1}$: $|\tilde A| = ${tn(F0 / m)}/\sqrt{(${tn(w0 * w0 - w * w, 4)})^2 + (${tn(g * w, 4)})^2} = ${tn(A * 1000)}$ mm.`,
        };
      },
    }),
    num({
      id: 'lag', difficulty: 3,
      gen(r) {
        const w0 = r.pick([10, 20, 40]), g = w0 * r.pick([0.1, 0.2, 0.25]), w = w0 * r.pick([0.5, 0.8, 1.2, 1.6, 2]);
        const d = lag(w, w0, g) * DEG, naive = Math.atan((g * w) / (w0 * w0 - w * w)) * DEG;
        return {
          prompt: t`An oscillator with $\omega_0 = ${w0}$ rad/s and $\gamma = ${tn(g)}\ \text{s}^{-1}$ is driven at $\omega = ${tn(w)}$ rad/s. By how many degrees does its steady motion lag the drive?`,
          visual: locusPic(w0, g, t`The loop of possible complex amplitudes for this oscillator, starting at $\omega = 0$ on the right.`),
          answer: d, units: 'deg', tol: { rel: 0.01, abs: 0.5 },
          errors: w > w0 ? [{ value: naive, feedback: t`Above resonance $\omega_0^2 - \omega^2 < 0$, so $\tilde A$ lies in the second quadrant: add $180^\circ$ to the calculator’s arctangent.` }] : [],
          hints: [t`$\tilde A \propto \dfrac{1}{(\omega_0^2 - \omega^2) - i\gamma\omega} = \dfrac{(\omega_0^2 - \omega^2) + i\gamma\omega}{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}$.`, t`So $\delta$ is the angle of the point $(\omega_0^2 - \omega^2,\ \gamma\omega)$; its imaginary part is always positive.`, t`If $\omega > \omega_0$ the real part is negative, and $\delta$ is between $90^\circ$ and $180^\circ$.`],
          teach: t`The lag is the angle of $(\omega_0^2 - \omega^2) + i\gamma\omega$: from $0$ below resonance, through $90^\circ$ at $\omega_0$, toward $180^\circ$ above.`,
          explain: t`$\omega_0^2 - \omega^2 = ${tn(w0 * w0 - w * w, 4)}$ and $\gamma\omega = ${tn(g * w)}$, so $\delta = ${tn(d)}^\circ$ — ${w > w0 ? 'more' : 'less'} than $90^\circ$ because the drive is ${w > w0 ? 'above' : 'below'} resonance.`,
        };
      },
    }),
    mcq({
      id: 'sign-error', difficulty: 3, kind: 'error',
      prompt: t`A student, using $\tilde x = \tilde Ae^{-i\omega t}$, writes for $\ddot x + \gamma\dot x + \omega_0^2x = (F_0/m)\cos\omega t$:

$$\tilde A = \frac{F_0/m}{\omega_0^2 - \omega^2 + i\gamma\omega}$$

and concludes that a damped oscillator **leads** its drive. What went wrong?`,
      visual: locusPic(10, 2, t`The correct loop for $\omega_0 = 10$ rad/s, $\gamma = 2\ \text{s}^{-1}$: every point lies above the real axis.`),
      choices: [t`$\dot{\tilde x} = -i\omega\tilde x$, so the damping term is $-i\gamma\omega$; their $+$ sign belongs to $e^{+i\omega t}$`, t`The $\omega^2$ term should be $+\omega^2$, since $\ddot{\tilde x} = (i\omega)^2\tilde x$ in their convention`, t`Nothing: with $e^{-i\omega t}$ a damped oscillator really does lead its drive slightly`, t`The numerator should be $F_0/k$ rather than $F_0/m$, which flips the sign of the phase`],
      answer: 0,
      why: {
        1: t`$(-i\omega)^2 = -\omega^2$ in either convention, so the $-\omega^2$ is right. The slip is in the first derivative.`,
        2: t`Energy flows from the drive into the damper only if the motion lags; a lead would mean the damper pumps energy back. The sign is the error.`,
        3: t`$F_0/m$ is right when the equation is divided by $m$, and a positive real factor cannot change any angle.`,
      },
      hints: [t`Differentiate $\tilde Ae^{-i\omega t}$ once. What factor comes down?`, t`$\gamma\dot{\tilde x} = \gamma(-i\omega)\tilde x$.`],
      teach: t`With $e^{-i\omega t}$, each derivative brings $-i\omega$: the damping term is $-i\gamma\omega$, and $\tilde A$ lies in the upper half-plane (a lag).`,
      explain: t`Substituting gives $(-\omega^2 - i\gamma\omega + \omega_0^2)\tilde A = F_0/m$. Their $+i\gamma\omega$ is the $e^{+i\omega t}$ denominator — mixing conventions mirrors $\tilde A$ below the real axis and turns the lag into a false lead.`,
    }),
    mcq({
      id: 'where-on-loop', difficulty: 2,
      prompt: t`Three drive frequencies are marked on the loop of $\tilde A/(F_0/k)$ for an oscillator with $Q = 4$. Which point is the drive **far above** resonance, where an instrument on a soft mount is best isolated?`,
      visual: locusPic(10, 2.5, t`$\omega_0 = 10$ rad/s, $\gamma = 2.5\ \text{s}^{-1}$. The loop runs counterclockwise from $\omega = 0$ as the drive frequency rises.`, [{ w: 5, label: 'P' }, { w: 10, label: 'R', dx: 10, dy: -4 }, { w: 30, label: 'S', dx: -16, dy: -10 }]),
      choices: ['S, near the origin on the left: small, and half a cycle out of step', 'R, at the top of the loop, where the arrow is longest', 'P, nearest the starting point at the right', 'R, because a lag of exactly 90° cancels the force'],
      answer: 0,
      why: {
        1: t`R is resonance, $\omega = \omega_0$: the gain there is $Q = 4$ — the worst place for an instrument.`,
        2: t`P is below resonance, where the arrow is still longer than 1: the mount amplifies the shaking.`,
        3: t`At $90^\circ$ lag the amplitude is largest, not cancelled; the drive is then in step with the velocity and pumps in the most energy.`,
      },
      hints: [t`At $\omega = 0$, $\tilde A/(F_0/k) = 1$. What does $\dfrac{\omega_0^2}{\omega_0^2 - \omega^2 - i\gamma\omega}$ do when $\omega \gg \omega_0$?`, t`For large $\omega$ it is about $-\omega_0^2/\omega^2$: small, real and negative.`],
      teach: t`Far above resonance $\tilde A \approx -F_0/(m\omega^2)$: tiny, and opposite to the drive — the mass’s inertia, not the spring, controls it.`,
      explain: t`S, at $\omega = 30$ rad/s, gives a gain of about $${tn(Math.hypot(...R(30, 10, 2.5)), 2)}$ with lag $${tn(lag(30, 10, 2.5) * DEG, 3)}^\circ$. Soft mounts work by putting every vibration frequency far above the mount’s $\omega_0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pogo', difficulty: 3, transfer: true,
      gen(r) {
        const f0 = r.pick([5, 11, 16]), Q = r.pick([10, 20, 30]), f = f0 * r.pick([0.9, 0.95, 1.05, 1.1]);
        const w0 = 2 * Math.PI * f0, w = 2 * Math.PI * f, g = w0 / Q, G = Math.hypot(...R(w, w0, g));
        return {
          prompt: t`A launch vehicle’s first longitudinal mode is at ${f0} Hz with $Q = ${Q}$. A combustion oscillation drives it at ${tn(f, 3)} Hz. By what factor is the stack’s steady response larger than the static deflection the same force amplitude would cause? (Treat the thrust oscillation as a given drive — no feedback.)`,
          visual: locusPic(w0, g, t`The loop of $\tilde A/(F_0/k)$ for this mode; the drive frequency is not marked.`),
          answer: G, tol: { rel: 0.01 },
          errors: [{ value: Q, feedback: t`$Q$ is the gain exactly at resonance. This drive is off resonance: compute $\omega_0^2/|\omega_0^2 - \omega^2 - i\gamma\omega|$.` }, { value: (w0 * w0) / Math.abs(w0 * w0 - w * w), feedback: 'You dropped the damping term; so close to resonance it is not small.' }],
          hints: [t`Gain $= \dfrac{\omega_0^2}{\sqrt{(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2}}$ with $\gamma = \omega_0/Q$.`, t`Only the ratio $\omega/\omega_0$ and $Q$ matter: gain $= 1/\sqrt{(1 - r^2)^2 + (r/Q)^2}$ with $r = \omega/\omega_0$.`],
          teach: t`Divide $\tilde A$ by the static deflection $F_0/k$ and the gain depends only on $\omega/\omega_0$ and $Q$.`,
          explain: t`$r = ${tn(f / f0, 3)}$, so gain $= 1/\sqrt{(1 - ${tn(f / f0, 3)}^2)^2 + (${tn(f / f0, 3)}/${Q})^2} = ${tn(G)}$. A few per cent off resonance already cuts the gain well below $Q$.`,
        };
      },
    }),
    num({
      id: 'cp-roots', difficulty: 2,
      gen(r) {
        const wd = r.pick([12, 20, 35]), b = r.pick([0.5, 0.8, 1.2, 2]);
        const th = Math.log(2) / b;
        return {
          prompt: t`A tank test measures the complex frequencies of a propellant-slosh mode as $\omega = \pm ${wd} - ${b}i$ rad/s (with $x \propto e^{-i\omega t}$). How long does the slosh amplitude take to halve, in s?`,
          visual: {
            type: 'graph',
            params: { x: [-1.4 * wd, 1.4 * wd], y: [-2.5, 0.6], aspect: 'wide', xlabel: 'Re ω (rad/s)', ylabel: 'Im ω', xticks: 6, yticks: 4, points: [{ x: wd, y: -b, color: 'gold', r: 6 }, { x: -wd, y: -b, color: 'gold', r: 6 }] },
            caption: 'The measured pair of complex frequencies, to scale.',
          },
          answer: th, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Math.log(2) / (2 * b), feedback: t`$-\operatorname{Im}\omega$ is already the amplitude’s decay rate ($\gamma/2$); do not double it.` }, { value: 1 / b, feedback: t`$1/b$ is the time to fall to $1/e$. Halving takes $\ln 2/b$.` }],
          hints: [t`$e^{-i\omega t} = e^{-i(\pm${wd})t}\,e^{-${b}t}$.`, t`Solve $e^{-${b}t} = \tfrac12$.`],
          teach: t`The amplitude decays as $e^{\operatorname{Im}\omega\,t}$; it halves after $\ln 2/|\operatorname{Im}\omega|$.`,
          explain: t`$e^{-${b}t} = \tfrac12$ gives $t = \ln 2/${b} = ${tn(th)}$ s. (In the damped-oscillator form, $\gamma/2 = ${b}\ \text{s}^{-1}$.)`,
        };
      },
    }),
    mcq({
      id: 'cp-undamped', difficulty: 2,
      prompt: t`As the damping $\gamma \to 0$, what happens to the loop of $\tilde A/(F_0/k)$ and to the lag $\delta$?`,
      visual: locusPic(10, 4, t`The loop for $\gamma = 4\ \text{s}^{-1}$ ($Q = 2.5$), with $\omega_0 = 10$ rad/s.`),
      choices: [t`The loop grows without limit, and $\delta$ jumps abruptly from $0$ to $180^\circ$ at $\omega_0$`, t`The loop shrinks to the point 1, and $\delta$ stays $0$ for every drive frequency`, t`The loop keeps its size, but $\delta$ becomes $90^\circ$ at every drive frequency`, t`The loop grows without limit, and $\delta$ stays $90^\circ$ for every drive frequency`],
      answer: 0,
      why: {
        1: t`Without damping the denominator $\omega_0^2 - \omega^2$ vanishes at resonance: the amplitude blows up, it does not shrink.`,
        2: t`The loop’s height is $Q = \omega_0/\gamma$, which grows as $\gamma$ falls; and $90^\circ$ is the lag only at $\omega_0$.`,
        3: t`With $\gamma = 0$, $\tilde A$ is real: positive below $\omega_0$ (no lag) and negative above it (lag $180^\circ$).`,
      },
      hints: [t`Set $\gamma = 0$: $\tilde A = (F_0/m)/(\omega_0^2 - \omega^2)$ is real. What is its sign on each side of $\omega_0$?`, t`The top of the loop is at height $Q = \omega_0/\gamma$.`],
      teach: t`Damping rounds off resonance: it caps the gain at $Q$ and spreads the switch from in-phase to out-of-phase over a band of width about $\gamma$.`,
      explain: t`With no damping $\tilde A$ runs along the real axis, through $+\infty$ to $-\infty$ at $\omega_0$: the motion is in phase below resonance and exactly out of phase above it.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 1 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Larsen, “NASA Experience with Pogo in Human Spaceflight Vehicles”, NATO RTO-MP-AVT-152 (2008)', url: 'https://ntrs.nasa.gov/search?q=NASA%20Experience%20with%20Pogo%20in%20Human%20Spaceflight%20Vehicles' },
  ],
});
