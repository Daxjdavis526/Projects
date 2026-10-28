// Forced oscillations and resonance, the mathematical view: the solution is
// the free motion plus one particular solution; complex exponentials turn the
// ODE into algebra; the gain and phase lag as functions of ω/ω₀ and the
// damping ratio; the peak's shift below ω₀; pure resonance t·sin ωt.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_partials.js';

const t = String.raw;

/** A still c3-roots picture of the forced oscillator (no sliders, no numbers). */
const forcedPic = (zeta, w0, W, { T = 30, panels = 'both', marks = true, caption } = {}) => ({
  type: 'c3-roots',
  params: { mode: 'forced', zeta: r6(zeta), w0: r6(w0), W: r6(W), T, sliders: false, readout: false, panels, marks, yname: 'y' },
  caption,
});

export default lesson({
  id: 'math2210.C3-6.2',
  title: 'Forced oscillations and resonance',
  minutes: 12, difficulty: 3,
  intro: t`Drive an oscillator periodically and its equation gains a right-hand side. In standard form,

$$y'' + 2\zeta\omega_0\,y' + \omega_0^2\,y = \omega_0^2 X\cos\omega t.$$

Every solution is the free motion from the last lesson plus **one particular solution** that follows the drive. Look for it as the real part of $Ye^{i\omega t}$: each derivative becomes a multiplication by $i\omega$, and the differential equation becomes algebra. The steady amplitude $A$, as a multiple of the static deflection $X$, is the **gain** $M = A/X = 1/\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}$, with $\Omega = \omega/\omega_0$. It peaks near $\Omega = 1$ — **resonance** — at about $1/(2\zeta)$, while the free motion, the **transient**, dies away. That is why spacecraft are shaken on vibration tables before launch, and why LIGO hangs its mirrors on pendulums tuned far below the frequencies it listens to.`,
  symbols: [
    { tex: 'y(t)', text: 'the response: a displacement, a charge, an angle' },
    { tex: '\\omega_0', text: 'the natural angular frequency, $\\sqrt{k/m}$ for a mass on a spring, in rad/s' },
    { tex: '\\zeta', text: 'the damping ratio, $b/(2\\sqrt{km})$: 0 for no damping, 1 for critical. The quality factor of Physics I is $Q = 1/(2\\zeta)$' },
    { tex: 'X', text: 'the static deflection: how far a steady push of the same size would move it, $F_0/k$' },
    { tex: '\\omega', text: 'the driving angular frequency, set from outside; $\\Omega = \\omega/\\omega_0$ is its ratio to the natural one' },
  ],
  why: t`The same algebra — derivatives become factors of $i\omega$ — is the phasor method of AC circuits and the transfer function of every linear instrument, from an accelerometer to a gravitational-wave detector.`,
  visual: {
    type: 'c3-roots',
    title: 'Sweep the drive through resonance',
    lead: t`Top: the steady gain $A/X$ against $\Omega = \omega/\omega_0$, for your damping ratio (blue) and a few others (grey); the gold dot is your drive. Bottom: the motion from rest — the transient and the steady state together — with the steady part dashed.`,
    tasks: [
      t`At $\zeta = 0.1$, sweep $\omega/\omega_0$ through 1: the gain climbs to about $1/(2\zeta) = 5$ and the phase lag swings from near $0^\circ$, through $90^\circ$, to near $180^\circ$.`,
      t`Drive at $\omega/\omega_0 = 1$ and watch the bottom plot: the amplitude builds up over many cycles, because the transient that cancels the steady motion at the start dies only as $e^{-\zeta\omega_0 t}$.`,
      t`Raise $\zeta$: the peak drops and slides below $\Omega = 1$, to $\sqrt{1 - 2\zeta^2}$; past $\zeta = 0.707$ there is no peak at all. Then set $\zeta = 0$ at $\omega/\omega_0 = 1$: no steady state, just growth.`,
    ],
    params: { mode: 'forced', zeta: 0.1, w0: 2, W: 0.8, T: 30, yname: 'y' },
  },
  example: {
    prompt: t`Find the steady-state solution of $y'' + 2y' + 5y = 10\cos t$, its amplitude, and how far it lags the drive.`,
    visual: forcedPic(1 / Math.sqrt(5), Math.sqrt(5), 1 / Math.sqrt(5), { T: 15, caption: t`This oscillator ($\omega_0 = \sqrt5$, $\zeta = 1/\sqrt5$) driven at $\omega = 1$: top, its gain curve with the drive marked; bottom, the motion from rest settling within a few seconds onto the steady oscillation (dashed). Heights are in units of the static deflection $X = 2$.` }),
    steps: [
      { label: 'Go complex', text: t`$10\cos t$ is the real part of $10e^{it}$. Try $y = Ye^{it}$: then $y' = iYe^{it}$ and $y'' = -Ye^{it}$.` },
      { label: 'Algebra', text: t`$(-1 + 2i + 5)Ye^{it} = 10e^{it}$, so $Y = \dfrac{10}{4 + 2i} = \dfrac{10(4 - 2i)}{16 + 4} = 2 - i$.` },
      { label: 'Back to real', text: t`$y_p = \mathrm{Re}\big[(2 - i)(\cos t + i\sin t)\big] = 2\cos t + \sin t$.` },
      { label: 'Amplitude and lag', text: t`$|Y| = \sqrt{2^2 + 1^2} = \sqrt5 \approx 2.24$, and $y_p = \sqrt5\cos(t - \varphi)$ with $\varphi = \arg(4 + 2i) = \arctan\tfrac{2}{4} = 26.6^\circ$: the response peaks $26.6^\circ$ of a cycle after the force.` },
      { label: 'The whole solution', text: t`The roots of $r^2 + 2r + 5 = 0$ are $-1 \pm 2i$, so $y = e^{-t}(C_1\cos2t + C_2\sin2t) + 2\cos t + \sin t$. The first part dies within a few seconds; the steady part stays.` },
      { label: 'Sense check', text: t`Substitute: $y_p'' + 2y_p' + 5y_p = (-2\cos t - \sin t) + 2(-2\sin t + \cos t) + 5(2\cos t + \sin t) = 10\cos t$. ✓ In standard form $\Omega = 1/\sqrt5$ and $\zeta = 1/\sqrt5$, so $M = 1/\sqrt{0.64 + 0.16} = 1.118$ and $A = MX = 1.118\times2 = 2.24$. ✓` },
    ],
    answer: t`$y_p = 2\cos t + \sin t = \sqrt5\cos(t - 26.6^\circ)$: amplitude $\sqrt5 \approx 2.24$, lagging the drive by $26.6^\circ$.`,
  },
  practice: [
    num({
      id: 'amplitude', difficulty: 2,
      gen(r) {
        const [b, c] = r.pick([[2, 5], [2, 10], [4, 13], [1, 4]]), w = r.pick([1, 2, 3]), F = r.pick([6, 10, 12]);
        const A = F / Math.hypot(c - w * w, b * w);
        const w0 = Math.sqrt(c), zeta = b / (2 * w0);
        return {
          prompt: t`What is the amplitude of the steady-state solution of $y'' + ${b === 1 ? '' : b}y' + ${c}y = ${F}\cos ${w === 1 ? '' : w}t$?`,
          visual: forcedPic(zeta, w0, w / w0, { panels: 'top', caption: t`The gain curve of this oscillator, with the drive at $\omega = ${w}$ marked. The vertical axis is in units of the static deflection $X = ${nice(F / c)}$.` }),
          answer: A, tol: { rel: 0.005 },
          errors: [
            { value: F / c, feedback: t`That is the static deflection $X = F/c$, the response to a very slow push. At $\omega = ${w}$ the inertia and damping terms matter.` },
            ...(Math.abs(c - w * w) > 1e-9 ? [{ value: F / Math.abs(c - w * w), feedback: t`You left out the damping term: $|c - \omega^2 + ib\omega| = \sqrt{(c - \omega^2)^2 + (b\omega)^2}$.` }] : []),
          ],
          hints: [t`With $y = Ye^{i${w === 1 ? '' : w}t}$: $(-${w * w} + ${b * w}i + ${c})Y = ${F}$.`, t`The amplitude is $|Y| = \dfrac{${F}}{|${c - w * w} + ${b * w}i|}$.`],
          teach: 'For y″ + by′ + cy = F cos ωt the steady amplitude is F/√((c − ω²)² + (bω)²).',
          explain: t`$Y = \dfrac{${F}}{${c - w * w} + ${b * w}i}$, so $|Y| = \dfrac{${F}}{\sqrt{${(c - w * w) ** 2} + ${(b * w) ** 2}}} = ${nice(+A.toPrecision(4))}$.`,
        };
      },
    }),
    mcq({
      id: 'above-resonance', difficulty: 2,
      prompt: t`A lightly damped oscillator ($\zeta = 0.05$) is driven at three times its natural frequency. How does its steady motion line up with the driving force?`,
      visual: forcedPic(0.05, 2, 3, { panels: 'top', caption: t`The gain curve for $\zeta = 0.05$, with the drive at $\omega = 3\omega_0$: far above the peak.` }),
      choices: [
        'Nearly opposite: it lags by almost 180°, moving left while the force pushes right',
        'In step: the displacement follows the force exactly',
        'A quarter cycle behind (90°), as at resonance',
        'There is no fixed relation; the phase drifts',
      ],
      answer: 0,
      why: {
        1: t`In step is the slow-drive limit, $\Omega \ll 1$, where the spring dominates.`,
        2: t`The lag is $90^\circ$ only at $\Omega = 1$. It is $\arctan\!\big(2\zeta\Omega/(1 - \Omega^2)\big)$ measured into the second quadrant when $\Omega > 1$.`,
        3: t`The steady state locks to the drive with a fixed lag $\varphi$; only the transient, which dies away, has its own frequency.`,
      },
      hints: [t`The lag is $\varphi = \arg\big(1 - \Omega^2 + 2i\zeta\Omega\big)$.`, t`At $\Omega = 3$: $1 - \Omega^2 = -8$ and $2\zeta\Omega = 0.3$. Which quadrant is $-8 + 0.3i$ in?`],
      teach: 'Far above resonance the response lags the drive by nearly 180°: the mass is too sluggish to follow and moves opposite to the force.',
      explain: t`$\varphi = \arg(-8 + 0.3i) = 177.9^\circ$. Far above resonance the inertia term $-\omega^2 y$ dominates, so $y \approx -X\cos\omega t/\Omega^2$: small, and opposite to the force. A shaker driving a heavy mount fast barely moves it, and what little it moves is out of step.`,
    }),
    num({
      id: 'peak-shift', difficulty: 3,
      gen(r) {
        const zeta = r.pick([0.3, 0.4, 0.5, 0.6]);
        const W = Math.sqrt(1 - 2 * zeta * zeta);
        return {
          prompt: t`An oscillator has damping ratio $\zeta = ${zeta}$. At what fraction of its natural frequency, $\Omega = \omega/\omega_0$, is the steady amplitude largest? (Minimise $D(\Omega) = (1 - \Omega^2)^2 + (2\zeta\Omega)^2$.)`,
          visual: forcedPic(zeta, 2, 1, { panels: 'top', marks: false, caption: t`The gain curve for $\zeta = ${zeta}$ (blue), with grey curves for other damping. The dashed line is $\Omega = 1$.` }),
          answer: W, tol: { rel: 0.003 },
          errors: [{ value: 1, feedback: 'The peak is at ω₀ only without damping. Damping pulls it lower.' }, { value: Math.sqrt(1 - zeta * zeta), feedback: t`That is $\omega_d/\omega_0$, the frequency of the free damped motion. The forced peak sits lower still: set $D'(\Omega) = 0$.` }],
          hints: [t`Write $u = \Omega^2$: $D = (1 - u)^2 + 4\zeta^2u$, and set $dD/du = 0$.`, t`$-2(1 - u) + 4\zeta^2 = 0$ gives $u = 1 - 2\zeta^2$.`],
          teach: 'With damping the amplitude peak moves below ω₀, to Ω = √(1 − 2ζ²) — and vanishes when ζ > 1/√2.',
          explain: t`$\Omega_{\text{peak}} = \sqrt{1 - 2(${zeta})^2} = ${nice(+W.toPrecision(4))}$. Note that this differs from both $\omega_0$ and the free damped frequency $\omega_d = \omega_0\sqrt{1 - \zeta^2}$: three different “resonant frequencies” that agree only for light damping.`,
        };
      },
    }),
    expr({
      id: 'pure-resonance', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        const kt = k === 1 ? '' : k;
        return {
          prompt: t`Solve $y'' + ${k * k === 1 ? '' : k * k}y = \cos ${kt}t$ with $y(0) = 0$ and $y'(0) = 0$. (The drive is exactly at the natural frequency, and there is no damping.)`,
          visual: forcedPic(0, k, 1, { panels: 'motion', T: r6(30 / k), caption: 'The motion from rest when an undamped oscillator is driven exactly at its natural frequency: no steady state — the swings grow without limit.' }),
          answer: `t*sin(${k}*t)/${2 * k}`,
          answerTeX: t`\dfrac{t\sin ${kt}t}{${2 * k}}`,
          vars: { t: [0, 4] }, lhs: 'y(t)',
          errors: [{ answer: `sin(${k}*t)/${2 * k}`, feedback: t`That has the right shape but no growth, and it does not solve the equation: the trial $A\cos ${kt}t + B\sin ${kt}t$ fails because it already solves $y'' + ${k * k === 1 ? '' : k * k}y = 0$. Multiply the trial by $t$.` }, { answer: `t*cos(${k}*t)/${2 * k}`, feedback: t`Check $y'(0)$ and substitute: the cosine version gives $-\sin$ terms that nothing cancels.` }],
          hints: [t`$\cos ${kt}t$ already solves the homogeneous equation, so try $y_p = t(A\cos ${kt}t + B\sin ${kt}t)$.`, t`Substituting gives $${2 * k}(-A\sin ${kt}t + B\cos ${kt}t) = \cos ${kt}t$, so $A = 0$ and $B = \tfrac{1}{${2 * k}}$; this $y_p$ already has $y(0) = y'(0) = 0$.`],
          teach: 'When the drive matches a solution of the homogeneous equation, multiply the trial solution by t: pure resonance grows like t·sin ωt.',
          explain: t`$y = \dfrac{t\sin ${kt}t}{${2 * k}}$: its amplitude grows linearly for ever. Check: $y'' = \cos ${kt}t - \tfrac{${kt}t}{2}\sin ${kt}t$, so $y'' + ${k * k === 1 ? '' : k * k}y = \cos ${kt}t$. ✓ Any damping at all caps the growth at the finite peak $X/(2\zeta)$.`,
        };
      },
    }),
    mcq({
      id: 'transient', difficulty: 2,
      prompt: t`The full solution of a damped, driven oscillator is $y = y_h + y_p$: a solution of the homogeneous equation plus the particular, steady one. Long after the drive starts, what is left, and why?`,
      visual: forcedPic(0.15, 2, 0.6, { panels: 'motion', T: 30, caption: 'The motion from rest (blue) and the steady solution (gold, dashed): at first they differ, later they coincide.' }),
      choices: [
        t`Only $y_p$: $y_h$ is built from $e^{rt}$ with roots of negative real part, so it decays`,
        t`Only $y_h$: the natural frequency always wins in the end`,
        'Both, forever: the motion keeps two frequencies',
        t`Neither: damping eventually stops all motion`,
      ],
      answer: 0,
      why: {
        1: t`The natural motion is exactly what damping kills: $|y_h| \le Ce^{-\zeta\omega_0 t}$.`,
        2: 'That happens only with no damping at all; any damping removes the free part, leaving one frequency, the drive’s.',
        3: 'Damping stops the free motion, but the drive keeps putting energy in, so the steady oscillation continues.',
      },
      hints: ['Where do the characteristic roots of a damped oscillator sit?', t`$y_h$ carries the factor $e^{-\zeta\omega_0 t}$.`],
      teach: 'With damping the homogeneous part is a transient: only the particular solution, at the driving frequency, survives.',
      explain: t`The homogeneous part is $e^{-\zeta\omega_0 t}$ times an oscillation (or a sum of decaying exponentials), so it dies on the time scale $1/(\zeta\omega_0)$. What remains is $y_p$, at the driving frequency — whatever the starting conditions were. That is why it is called the steady state.`,
    }),
    mcq({
      id: 'error-infinite', difficulty: 2, kind: 'error',
      prompt: t`A student says: “At resonance the amplitude of a driven oscillator becomes infinite, so a structure with $\zeta = 0.02$ driven at its natural frequency will always break.” What is wrong?`,
      visual: forcedPic(0.02, 2, 1, { panels: 'top', caption: t`The gain curve for $\zeta = 0.02$ (blue): tall, but with a finite top.` }),
      choices: [
        t`With any damping the peak is finite: about $X/(2\zeta) = 25X$ here — large, but whether it breaks depends on $X$ and the strength`,
        'Nothing: resonance always means infinite amplitude',
        'The amplitude at resonance is zero, because the drive and the motion are out of phase',
        'The amplitude at resonance equals the static deflection X',
      ],
      answer: 0,
      why: {
        1: t`Infinite growth needs $\zeta = 0$ exactly; real structures always have some damping. The peak is $1/(2\zeta\sqrt{1 - \zeta^2})$ times $X$.`,
        2: t`At resonance the motion lags the drive by $90^\circ$ — in step with the velocity — which is when the drive puts in the most energy, not none.`,
        3: t`That is the response to a very slow push. At resonance it is multiplied by about $1/(2\zeta)$.`,
      },
      hints: [t`What is the gain $M = 1/\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}$ at $\Omega = 1$?`],
      teach: 'Damped resonance is large but finite: the peak gain is about 1/(2ζ), the quality factor Q.',
      explain: t`At $\Omega = 1$, $M = 1/(2\zeta) = 25$. Whether that breaks the structure depends on the forcing and the material — which is why engineers keep natural frequencies away from strong drives, add damping, and test. Unbounded growth $t\sin\omega t$ needs exactly zero damping.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gain', difficulty: 2,
      gen(r) {
        const zeta = r.pick([0.1, 0.2, 0.3]), W = r.pick([0.5, 0.8, 1.5, 2]), X = r.pick([1, 2, 5]);
        const A = X / Math.sqrt((1 - W * W) ** 2 + (2 * zeta * W) ** 2);
        return {
          prompt: t`An oscillator with $\zeta = ${zeta}$ and static deflection $X = ${X}$ mm is driven at $\omega = ${W}\,\omega_0$. What is its steady amplitude, in mm?`,
          visual: forcedPic(zeta, 2, W, { panels: 'top', marks: false, caption: t`The gain curve for $\zeta = ${zeta}$ (blue).` }),
          answer: A, units: 'mm', tol: { rel: 0.005 },
          hints: [t`$A = \dfrac{X}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}}$ with $\Omega = ${W}$.`],
          teach: 'Steady amplitude = static deflection × gain M(Ω, ζ).',
          explain: t`$A = \dfrac{${X}}{\sqrt{(1 - ${W}^2)^2 + (2\cdot${zeta}\cdot${W})^2}} = ${nice(+A.toPrecision(4))}$ mm.`,
        };
      },
    }),
    num({
      id: 'cp-isolation', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), f = r.pick([10, 30]);
        const f0 = Math.sqrt(9.8 / L) / (2 * Math.PI), O = f / f0, ratio = 1 / (O * O - 1);
        return {
          prompt: t`A test mirror hangs from a ${L} m pendulum ($f_0 = \tfrac{1}{2\pi}\sqrt{g/L} = ${f0.toFixed(3)}$ Hz). When the suspension point shakes horizontally at frequency $f$, the mirror obeys $y'' + \omega_0^2 y = \omega_0^2 X\cos\omega t$ (damping negligible), where $X$ is the suspension point’s amplitude. At $f = ${f}$ Hz, what is the ratio of the mirror’s amplitude to $X$?`,
          visual: { type: 'graph', params: { x: [0, 12], y: [-4, 1.5], aspect: 'wide', xlabel: 'f (Hz)', ylabel: 'log₁₀ (amplitude ratio)', curves: [{ fn: `-log10(abs(1 - (x/${r6(f0)})^2))`, color: 'accent', width: 2.4 }], vlines: [{ x: r6(f0), label: 'f₀' }] }, caption: t`The mirror’s amplitude over the suspension’s, on a logarithmic scale, against shaking frequency: a spike at $f_0$, then a steady fall. (One idealised stage.)` },
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: O * O - 1, feedback: 'Upside down: far above resonance the mirror moves much LESS than its support.' }, { value: 1 / O, feedback: t`The suppression goes as $(f_0/f)^2$, not $f_0/f$.` }],
          hints: [t`The gain is $M = \dfrac{1}{|1 - \Omega^2|}$ with $\Omega = f/f_0$ and no damping.`, t`$\Omega = ${f}/${f0.toFixed(3)} = ${O.toFixed(2)}$.`],
          teach: 'Far above its resonance a pendulum passes on only about (f₀/f)² of its support’s motion: that is passive vibration isolation.',
          explain: t`$\Omega = ${O.toFixed(2)}$, so $M = 1/(\Omega^2 - 1) = ${(ratio).toPrecision(3)}$ — the mirror moves about ${Math.round(1 / ratio)} times less than its support. LIGO chains four such stages (and active isolation below them); the stages are coupled, so the total is not simply a product, but each stage far above its resonances contributes a factor of roughly $(f_0/f)^2$.`,
        };
      },
    }),
    mcq({
      id: 'cp-quadrature', difficulty: 3, transfer: true,
      prompt: t`Before launch, a satellite panel is shaken on a vibration table while the frequency is swept slowly. An accelerometer on the panel shows its motion lagging the table’s drive by exactly $90^\circ$ at 212 Hz. What does that tell you?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 180], aspect: 'wide', xlabel: 'ω/ω₀', ylabel: 'phase lag (°)', yticks: 6, curves: [0.05, 0.2, 0.5].map((z, k) => ({ fn: `atan2(${2 * z}*x, 1 - x^2)*180/pi`, color: ['accent', 'violet', 'teal'][k], width: 2.2, label: `ζ = ${z}`, labelAt: 1.6 + 0.35 * k, labelDy: k === 0 ? -12 : 14 })), hlines: [{ y: 90, label: '90°' }] }, caption: t`The phase lag of the steady response against driving frequency, for three damping ratios.` },
      choices: [
        t`212 Hz is the panel’s natural frequency $f_0$: the lag is exactly $90^\circ$ at $\omega = \omega_0$, whatever the damping`,
        t`212 Hz is where the amplitude peaks, which is $f_0\sqrt{1 - 2\zeta^2}$`,
        t`The panel is critically damped at 212 Hz`,
        t`212 Hz is above $f_0$, because the lag has passed $45^\circ$`,
      ],
      answer: 0,
      why: {
        1: t`The amplitude peak sits slightly below $f_0$ for a damped structure; the $90^\circ$ crossing sits exactly at $f_0$. They differ, a little, when $\zeta$ is not small.`,
        2: 'Damping is a property of the panel, not of one frequency; and a 90° lag says nothing about ζ by itself.',
        3: t`$45^\circ$ is passed below $f_0$; the lag reaches $90^\circ$ exactly at $f_0$ and heads toward $180^\circ$ above.`,
      },
      hints: [t`The lag is $\varphi = \arg(1 - \Omega^2 + 2i\zeta\Omega)$.`, t`When is the real part $1 - \Omega^2$ zero?`],
      teach: 'The steady response lags the drive by exactly 90° at ω = ω₀ for any damping — the basis of phase-quadrature modal testing.',
      explain: t`$\varphi = 90^\circ$ exactly when $1 - \Omega^2 = 0$, that is at $\omega = \omega_0$, independent of $\zeta$. Modal-test engineers use this phase crossing to pin down natural frequencies, because the amplitude peak is broad and slightly shifted while the phase swings sharply through $90^\circ$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §7.2 Nonhomogeneous linear equations and §7.4 Applications', url: 'https://openstax.org/books/calculus-volume-3/pages/7-4-applications' },
    { label: 'OpenStax University Physics Vol. 1, §15.6 Forced oscillations', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations' },
  ],
});
