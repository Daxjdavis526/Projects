// Driven oscillators and resonance in Taylor's notation: the complex amplitude
// C = f₀/(ω₀² − ω² + 2iβω) gives A² = f₀²/[(ω₀² − ω²)² + 4β²ω²] and the phase
// lag δ, which climbs through 90° at ω₀; near resonance A² is a Lorentzian
// of full width 2β, so Q = ω₀/FWHM; the power absorbed (velocity in phase
// with the force at resonance) and its exact width 2β; where A actually
// peaks; mass- and spring-dominated limits. Uses the cm-resonance sim.
import { lesson, mcq, num } from '../../src/core/content.js';
import * as O from '../../src/viz/model/cm-osc.js';
import { sci, r6, pl, gpic, seg, lab, distinct } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;
const deg = (x) => (x * 180) / Math.PI;

// the worked example: a MEMS gyroscope's drive mode
const EX = (() => {
  const f0 = 20000, Q = 5000, df = 2;
  const w0 = 2 * Math.PI * f0, beta = w0 / (2 * Q), fw = (2 * beta) / (2 * Math.PI);
  const w = 2 * Math.PI * (f0 - df);
  const ratio = O.amp(w, w0, beta) ** 2 / O.amp(O.wPeak(w0, beta), w0, beta) ** 2;
  return { f0, Q, df, w0, beta, fw, w, ratio, dl: deg(O.phase(w, w0, beta)), dlUp: deg(O.phase(2 * Math.PI * (f0 + df), w0, beta)), tring: 1 / beta };
})();

// a still cm-resonance picture
const res = (params, caption) => ({ type: 'cm-resonance', params: { sliders: [], readouts: [], ...params }, caption });

export default lesson({
  id: 'phys3550.M2.3',
  title: 'Driven oscillators and resonance',
  minutes: 18, difficulty: 4,
  intro: t`Push a damped oscillator with $F_0\cos\omega t$: $\ddot x + 2\beta\dot x + \omega_0^2x = f_0\cos\omega t$, with $f_0 = F_0/m$. Solve the complex version $\ddot z + 2\beta\dot z + \omega_0^2z = f_0e^{i\omega t}$ with $z = Ce^{i\omega t}$, and the derivatives become multiplications: $C = f_0/(\omega_0^2 - \omega^2 + 2i\beta\omega)$. Its size is the steady **amplitude**; its angle is the **phase lag** $\delta$ by which the motion trails the push. Once the transient (which dies like $e^{-\beta t}$) is gone, that is the whole motion. Near $\omega_0$, $A^2$ becomes a **Lorentzian** whose width is $2\beta$ — so the sharpness of a resonance and the ring-down of [M2.2](#/lesson/phys3550.M2.2) are one number. Compare [forced oscillations](#/lesson/math2280.DE-3.6) in MATH 2280.`,
  equation: t`A^2 = \frac{f_0^2}{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}, \qquad \delta = \arctan\frac{2\beta\omega}{\omega_0^2 - \omega^2}`,
  symbols: [
    { tex: 'A', text: 'the steady-state amplitude, in m' },
    { tex: 'f_0 = F_0/m', text: 'the drive’s amplitude per unit mass, in m/s²' },
    { tex: '\\omega,\\ \\omega_0', text: 'the drive’s angular frequency and the natural one, in rad/s' },
    { tex: '\\beta = b/2m', text: 'the damping constant, in s⁻¹' },
    { tex: '\\delta', text: 'the phase lag, $0 \\le \\delta \\le \\pi$: the response is $A\\cos(\\omega t - \\delta)$. The arctan is taken in the right quadrant: past $90^\\circ$ once $\\omega > \\omega_0$' },
  ],
  why: t`Resonance decides what breaks and what works: structures are shaken on tables to find it, gyroscopes and clocks are built to exploit it, and every detector from a radio to LIGO is a driven oscillator.`,
  visual: {
    type: 'cm-resonance',
    title: 'Amplitude, phase and the Lorentzian',
    lead: t`Top: $A^2$ against the drive frequency, as a fraction of its peak (blue), with the Lorentzian approximation dashed and its width $2\beta$ marked. Middle: the phase lag. Bottom: the drive (grey) and the response (blue) in time, each scaled to its own height. The orange marks are your drive frequency.`,
    tasks: [
      t`Sweep $\omega$ through $\omega_0 = 10$ rad/s: the lag climbs from near 0 through exactly $90^\circ$ to near $180^\circ$; at resonance the response's crest falls a quarter-cycle behind the push.`,
      t`Halve $\beta$: the peak gets narrower (width $2\beta$) and taller, and the phase switches over more abruptly.`,
      t`Raise $\beta$ to 3: the Lorentzian (violet) drifts away from the true curve — it is a light-damping approximation.`,
    ],
    params: { w0: 10, beta: 1, w: 9, wmax: 20, y: 'A2', sliders: ['w', 'beta'], ranges: { beta: [0.2, 4] }, readouts: ['A', 'delta', 'Q', 'width', 'P'] },
    caption: t`$f_0 = 1$ m/s², $\omega_0 = 10$ rad/s. Linear spring, viscous damping, steady state only. In the bottom panel the curves are scaled to equal heights: only their timing is to scale.`,
  },
  example: {
    prompt: t`A MEMS gyroscope's drive mode resonates at $f_0 = 20.000$ kHz with $Q = ${EX.Q}$. Find $\beta$, the full width of the resonance in hertz, and the amplitude (relative to its peak) and phase lag when it is driven $${EX.df}$ Hz below resonance. How long does it take to settle after a change?`,
    visual: res({ w0: 10, beta: 0.4, w: 9.6, wmax: 20, y: 'A2', panels: ['amp', 'phase'] }, t`The shape of a sharp resonance (drawn with $Q = 12.5$ so that it is visible; at $Q = 5000$ it would be a line). Orange: a drive one half-width below the peak.`),
    steps: [
      { label: 'Complex amplitude', text: t`$z = Ce^{i\omega t}$ turns the equation into $(-\omega^2 + 2i\beta\omega + \omega_0^2)C = f_0$. So $A = |C| = f_0/\sqrt{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}$, and $C = Ae^{-i\delta}$ gives $\tan\delta = 2\beta\omega/(\omega_0^2 - \omega^2)$.` },
      { label: 'Damping constant', text: t`$\omega_0 = 2\pi\times20\,000 = ${sci(EX.w0, 4)}$ rad/s, $\beta = \omega_0/2Q = ${sci(EX.beta, 4)}$ s⁻¹.` },
      { label: 'Lorentzian', text: t`Near resonance $\omega_0^2 - \omega^2 \approx 2\omega_0(\omega_0 - \omega)$ and $2\beta\omega \approx 2\beta\omega_0$, so $A^2 \approx \dfrac{f_0^2/4\omega_0^2}{(\omega - \omega_0)^2 + \beta^2}$: it halves at $\omega = \omega_0 \pm \beta$.` },
      { label: 'Width', text: t`Full width $2\beta = ${sci(2 * EX.beta, 4)}$ rad/s, which is $2\beta/2\pi = ${sci(EX.fw, 3)}$ Hz $= f_0/Q$. A 20 kHz resonator only 4 Hz wide.` },
      { label: 'Two hertz below', text: t`$2\pi\times2 = ${sci(2 * Math.PI * EX.df, 4)}$ rad/s $= \beta$: one half-width. So $A^2$ is at $${sci(EX.ratio, 3)}$ of its peak and $\tan\delta = 2\beta\omega/(\omega_0^2 - \omega^2) \approx \beta/(\omega_0 - \omega) = 1$: $\delta = ${sci(EX.dl, 3)}^\circ$ ($${sci(EX.dlUp, 3)}^\circ$ two hertz above).` },
      { label: 'Settling', text: t`The transient dies like $e^{-\beta t}$: time constant $1/\beta = ${sci(EX.tring * 1e3, 3)}$ ms. Sharp resonance and slow settling come together — a trade-off every sensor designer meets.` },
    ],
    answer: t`$\beta = ${sci(EX.beta, 3)}$ s⁻¹; full width $${sci(EX.fw, 2)}$ Hz; at 2 Hz below, $A^2$ is half its peak and the lag is $45^\circ$; it settles with time constant $${sci(EX.tring * 1e3, 3)}$ ms.`,
  },
  practice: [
    num({
      id: 'phase', difficulty: 2,
      gen(r) {
        const w0 = 10, beta = r.pick([0.5, 1, 2]), w = r.pick([6, 8, 9, 11, 12, 15]);
        const d = deg(O.phase(w, w0, beta)), naive = deg(Math.atan((2 * beta * w) / (w0 * w0 - w * w)));
        return {
          prompt: t`An oscillator with $\omega_0 = ${w0}$ rad/s and $\beta = ${beta}$ s⁻¹ is driven at $\omega = ${w}$ rad/s. By how many degrees does its steady motion lag the driving force?`,
          answer: d, units: 'deg', tol: { rel: 0.005, abs: 0.3 },
          errors: distinct([{ value: naive, feedback: t`Above resonance $\omega_0^2 - \omega^2 < 0$, so $\delta$ lies between $90^\circ$ and $180^\circ$: add $180^\circ$ to the calculator's arctan.` }, { value: deg((2 * beta * w) / (w0 * w0 - w * w)), feedback: t`Take the arctangent: $\tan\delta = 2\beta\omega/(\omega_0^2 - \omega^2)$.` }], d, 0.005),
          hints: [t`$\tan\delta = \dfrac{2\beta\omega}{\omega_0^2 - \omega^2}$, with $0 \le \delta \le 180^\circ$.`, t`If $\omega > \omega_0$ the denominator is negative and $\delta > 90^\circ$.`],
          teach: t`The lag is the angle of the complex number $\omega_0^2 - \omega^2 + 2i\beta\omega$: below $90^\circ$ under resonance, above it over resonance.`,
          explain: t`$\tan\delta = \dfrac{2(${beta})(${w})}{${w0 * w0} - ${w * w}} = ${sci((2 * beta * w) / (w0 * w0 - w * w))}$, so $\delta = ${sci(d)}^\circ$.`,
          visual: res({ w0, beta, w, wmax: 20, panels: ['phase'], marks: false }, t`The phase-lag curve for this oscillator; your drive frequency is not marked.`),
        };
      },
    }),
    num({
      id: 'q-width', difficulty: 2,
      gen(r) {
        const [what, f0, df] = r.pick([['A quartz crystal', 10e6, 50], ['A guitar body’s main air resonance', 98, 6.5], ['A satellite reaction-wheel mount', 140, 3.5], ['A 440 Hz tuning fork', 440, 0.06]]);
        const Q = f0 / df;
        return {
          prompt: t`${what} resonates at $${sci(f0, 3)}$ Hz. A slow sweep finds that $A^2$ is above half its peak over a band $${sci(df, 2)}$ Hz wide. What is its $Q$?`,
          answer: Q, tol: { rel: 0.01 },
          errors: [{ value: Q / 2, feedback: t`The band's full width is $2\beta$, so $Q = \omega_0/2\beta = f_0/\Delta f$, with no extra 2.` }, { value: 2 * Math.PI * Q, feedback: t`Width and frequency are both in hertz here; the $2\pi$'s cancel: $Q = f_0/\Delta f$.` }],
          hints: [t`The full width at half maximum of $A^2$ is $2\beta$ (in rad/s).`, t`$Q = \omega_0/2\beta = f_0/\Delta f$.`],
          teach: t`$Q$ is the resonance frequency over the full width at half power: $Q = f_0/\Delta f$.`,
          explain: t`$Q = f_0/\Delta f = ${sci(f0, 3)}/${sci(df, 2)} = ${sci(Q)}$.`,
          visual: res({ w0: 10, beta: 0.6, w: 10, wmax: 20, y: 'A2', panels: ['amp'], marks: false, lorentz: false }, t`A resonance curve's shape, with its half-maximum and full width marked (drawn with $Q \approx 8$; yours is far sharper).`),
        };
      },
    }),
    mcq({
      id: 'in-phase', difficulty: 2,
      prompt: t`Driven exactly at $\omega_0$, an oscillator absorbs the most power from the drive. Why, in terms of the phase?`,
      visual: res({ w0: 10, beta: 1, w: 10, wmax: 20, panels: ['time'] }, t`Drive (grey, dashed) and displacement (blue) at resonance: the displacement lags by a quarter-cycle.`),
      choices: [
        t`The lag is $90^\circ$, so the **velocity** $\dot x$ is in phase with the force: the drive pushes forward exactly when the mass moves forward`,
        t`The displacement is in phase with the force, so the force does the most work`,
        t`The lag is $180^\circ$, so the force always opposes the motion and stores energy`,
        t`At resonance the damping force vanishes, so nothing is lost`,
      ],
      answer: 0,
      why: {
        1: t`Power is $F\dot x$, not $Fx$. In-phase *displacement* happens far below resonance, where the drive and spring just push against each other and little energy flows.`,
        2: t`At $180^\circ$ (far above resonance) the velocity is $90^\circ$ out of phase with the force: as much energy flows back as in, on average almost none.`,
        3: t`The damping force $-b\dot x$ is largest at resonance, because the speed is; steady state means the drive's power equals the damping's.`,
      },
      hints: [t`Power is $F\dot x$. If $x = A\cos(\omega t - \delta)$, what is the phase of $\dot x$?`],
      teach: t`At resonance the displacement lags the force by $90^\circ$, which puts the velocity in step with the force: maximum power.`,
      explain: t`$\dot x = -\omega A\sin(\omega t - \delta) = \omega A\cos(\omega t - \delta + 90^\circ)$. With $\delta = 90^\circ$ the velocity is in phase with $F_0\cos\omega t$, and $\langle F\dot x\rangle = \tfrac12F_0\omega A$ is as large as it can be.`,
    }),
    num({
      id: 'power', difficulty: 3,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), beta = r.pick([0.2, 0.5, 1]), F0 = r.pick([0.5, 1, 2]);
        const P = (F0 * F0) / (4 * m * beta);
        return {
          prompt: t`A ${m} kg oscillator with $\beta = ${beta}$ s⁻¹ is driven exactly at resonance by $F_0\cos\omega_0t$ with $F_0 = ${F0}$ N. What average power does it absorb (and dissipate)?`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: (F0 * F0) / (2 * m * beta), feedback: t`Average $\cos^2$ over a cycle: it is $\tfrac12$. $\langle P\rangle = \tfrac12F_0\omega_0A$.` }, { value: F0 * F0 / (8 * m * beta), feedback: t`At resonance $A = f_0/2\beta\omega_0$: check the factor of 2 in the amplitude.` }],
          hints: [t`At resonance $A = \dfrac{f_0}{2\beta\omega_0}$ and the velocity is in phase with the force.`, t`$\langle P\rangle = \tfrac12F_0\,\omega_0A = \dfrac{F_0^2}{4m\beta}$.`],
          teach: t`At resonance $\langle P\rangle = F_0^2/4m\beta = F_0^2/2b$: less damping, more power absorbed — and a taller, narrower peak.`,
          explain: t`$\langle P\rangle = \tfrac12F_0\omega_0A = \tfrac12F_0\omega_0\cdot\dfrac{F_0/m}{2\beta\omega_0} = \dfrac{F_0^2}{4m\beta} = ${sci(P)}$ W, independent of $\omega_0$. Check: the damping dissipates $b\langle\dot x^2\rangle = 2m\beta\cdot\tfrac12\omega_0^2A^2$, the same.`,
          visual: res({ w0: 10, beta: 1, w: 10, wmax: 20, panels: ['time'] }, t`At resonance: drive and displacement a quarter-cycle apart (shape only; your numbers differ).`),
        };
      },
    }),
    num({
      id: 'lorentz-offset', difficulty: 3,
      gen(r) {
        const beta = r.pick([0.5, 2, 5]), n = r.pick([2, 5, 10]);
        const d = beta * Math.sqrt(n - 1);
        return {
          prompt: t`A lightly damped oscillator has $\beta = ${beta}$ s⁻¹. Using the Lorentzian approximation, how far from $\omega_0$ (in rad/s) must the drive be for $A^2$ to fall to $1/${n}$ of its peak?`,
          answer: d, units: 'rad/s', tol: { rel: 0.01 },
          errors: distinct([{ value: beta * (n - 1), feedback: t`Solve $\beta^2/\big[(\omega - \omega_0)^2 + \beta^2\big] = 1/${n}$: the offset enters squared, so take a square root.` }, { value: beta * Math.sqrt(n), feedback: t`$(\omega - \omega_0)^2 + \beta^2 = ${n}\beta^2$ leaves $(${n} - 1)\beta^2$, not $${n}\beta^2$.` }], d),
          hints: [t`Lorentzian: $\dfrac{A^2}{A^2_\text{peak}} = \dfrac{\beta^2}{(\omega - \omega_0)^2 + \beta^2}$.`, t`Set that to $1/${n}$: $(\omega - \omega_0)^2 = (${n} - 1)\beta^2$.`],
          teach: t`A Lorentzian falls to $1/n$ of its peak at $|\omega - \omega_0| = \beta\sqrt{n - 1}$ — half height at one $\beta$.`,
          explain: t`$|\omega - \omega_0| = \beta\sqrt{${n} - 1} = ${sci(d)}$ rad/s. Lorentzian tails are long: at 10 half-widths off, $A^2$ is still about 1% of its peak.`,
          visual: res({ w0: 10, beta: 0.8, w: 10, wmax: 20, y: 'A2', panels: ['amp'], marks: false, width: false }, t`The exact $A^2$ (blue) and the Lorentzian (violet, dashed), for $\beta = 0.8$ s⁻¹ (shape only).`),
        };
      },
    }),
    mcq({
      id: 'above', difficulty: 2,
      prompt: t`An oscillator is driven at three times its natural frequency, $\omega = 3\omega_0$, with light damping. How does its steady motion look?`,
      visual: res({ w0: 10, beta: 0.5, w: 30, wmax: 35, panels: ['time'] }, t`Drive (grey, dashed) and displacement (blue) at $\omega = 3\omega_0$, each scaled to its own height.`),
      choices: [
        t`Small and almost exactly out of phase: the mass moves opposite to the force, $A \approx f_0/\omega^2$, as if there were no spring`,
        t`In phase with the force, with $A \approx f_0/\omega_0^2$, the static deflection`,
        t`A quarter-cycle behind, with the largest amplitude`,
        t`At its natural frequency $\omega_0$, not at the drive's frequency`,
      ],
      answer: 0,
      why: {
        1: t`That is the low-frequency limit $\omega \ll \omega_0$: there the spring dominates and the mass follows the force.`,
        2: t`That is resonance, $\omega = \omega_0$.`,
        3: t`Once the transient has died, a linear oscillator moves at the drive's frequency — always.`,
      },
      hints: [t`Far above resonance, which term in $\ddot x + 2\beta\dot x + \omega_0^2x$ is largest for $x \propto \cos\omega t$?`],
      teach: t`Far above resonance inertia dominates: $\ddot x \approx f_0\cos\omega t$, so $x \approx -(f_0/\omega^2)\cos\omega t$ — small and opposite.`,
      explain: t`For $\omega \gg \omega_0$, $\ddot x$ is $\omega^2/\omega_0^2$ times bigger than $\omega_0^2x$: the mass behaves as a free mass, accelerating with the force, so its displacement is opposite to it ($\delta \to 180^\circ$) and $A \approx f_0/\omega^2$. This is why a seismometer's mass stays still while the ground shakes above its resonance.`,
    }),
    num({
      id: 'peak', difficulty: 3,
      gen(r) {
        const w0 = 10, beta = r.pick([2, 3, 4, 5]);
        const wp = O.wPeak(w0, beta), w1 = Math.sqrt(w0 * w0 - beta * beta);
        return {
          prompt: t`An oscillator with $\omega_0 = ${w0}$ rad/s is heavily damped, $\beta = ${beta}$ s⁻¹. At what drive frequency is its steady amplitude $A$ largest?`,
          answer: wp, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: w0, feedback: t`That is where the lag is $90^\circ$ and the power peaks. $A$ itself peaks a little lower: minimize $(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2$.` }, { value: w1, feedback: t`That is the free oscillation frequency $\omega_1 = \sqrt{\omega_0^2 - \beta^2}$. The amplitude peak is lower still: $\sqrt{\omega_0^2 - 2\beta^2}$.` }],
          hints: [t`Maximize $A$ by minimizing $D(\omega) = (\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2$ as a function of $u = \omega^2$.`, t`$dD/du = -2(\omega_0^2 - u) + 4\beta^2 = 0$ gives $u = \omega_0^2 - 2\beta^2$.`],
          teach: t`Three "resonant" frequencies: the amplitude peaks at $\sqrt{\omega_0^2 - 2\beta^2}$, free oscillation runs at $\sqrt{\omega_0^2 - \beta^2}$, and the power peaks at $\omega_0$ — all equal for light damping.`,
          explain: t`$\omega_\text{peak} = \sqrt{${w0 * w0} - 2(${beta})^2} = ${sci(wp)}$ rad/s, below $\omega_1 = ${sci(w1)}$ and $\omega_0 = ${w0}$. With $\beta \ll \omega_0$ the three merge.`,
          visual: res({ w0, beta, w: w0, wmax: 20, y: 'A', panels: ['amp'], marks: false }, t`The amplitude curve for $\beta = ${beta}$ s⁻¹: its peak sits visibly left of $\omega_0$ (dotted).`),
        };
      },
    }),
    mcq({
      id: 'width-error', difficulty: 3, kind: 'error',
      prompt: t`A student reads a resonance curve of the **amplitude** $A(\omega)$, measures its full width where $A$ is half its peak, and reports that width as $2\beta$. What is wrong?`,
      visual: res({ w0: 10, beta: 0.8, w: 10, wmax: 20, y: 'A', panels: ['amp'], marks: false }, t`An amplitude curve, $A(\omega)$ — not $A^2$.`),
      choices: [
        t`$2\beta$ is the width of $A^2$ at half height (equivalently of $A$ at $1/\sqrt2$); $A$ at half height is wider, about $2\sqrt3\,\beta$`,
        t`Nothing: $A$ and $A^2$ peak at the same place, so they have the same width`,
        t`The width of $A$ at half height is $\beta$, not $2\beta$`,
        t`The width should be measured at $1/e$ of the peak`,
      ],
      answer: 0,
      why: {
        1: t`Same peak position, different shapes: squaring makes a curve narrower. Where $A^2$ is half its peak, $A$ is still $1/\sqrt2 \approx 71\%$ of its peak.`,
        2: t`At $\omega = \omega_0 \pm \beta$ the Lorentzian gives $A^2 = \tfrac12$ of the peak, so $A = 0.71$ of the peak — not one half. Half height in $A$ is farther out.`,
        3: t`The standard definition is the half-power width: full width at half maximum of $A^2$ (or of the absorbed power).`,
      },
      hints: [t`Which curve is $2\beta$ the half-maximum width of: $A$ or $A^2$?`, t`In the Lorentzian, $A/A_\text{peak} = \beta/\sqrt{(\omega - \omega_0)^2 + \beta^2}$. Where is it $\tfrac12$?`],
      teach: t`The width $2\beta$ belongs to $A^2$ (the "half-power" width); always say which curve a width refers to.`,
      explain: t`$A/A_\text{peak} = \tfrac12$ needs $(\omega - \omega_0)^2 + \beta^2 = 4\beta^2$, so the full width is $2\sqrt3\,\beta \approx 3.5\beta$: the student overestimates $\beta$ by 73% and underestimates $Q$ to match.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([8, 12, 20]), f0 = r.pick([1.2, 2.0, 3.5]), Q = r.pick([25, 50, 100]), F0 = r.pick([0.05, 0.1, 0.2]), frac = r.pick([0.97, 0.99, 1.02]);
        const w0 = 2 * Math.PI * f0, beta = w0 / (2 * Q), w = frac * w0;
        const A = O.amp(w, w0, beta, F0 / m);
        return {
          prompt: t`A satellite's solar-array panel has a bending mode at ${f0} Hz with $Q = ${Q}$ and effective mass ${m} kg. An imbalance in a reaction wheel spinning at ${sci(frac * f0 * 60, 4)} rpm shakes it with a force of amplitude ${F0} N at the wheel's rotation frequency. What steady amplitude does the panel's tip reach, in mm?`,
          answer: A * 1e3, units: 'mm', tol: { rel: 0.01 },
          errors: distinct([{ value: (Q * F0) / (m * w0 * w0) * 1e3, feedback: t`That is the amplitude exactly at resonance. The wheel is ${Math.round(Math.abs(frac - 1) * 100)}% off — with $Q = ${Q}$ that matters: use the full formula.` }, { value: (F0 / (m * w0 * w0)) * 1e3, feedback: t`That is the static deflection $F_0/k$; near resonance the response is amplified.` }], A * 1e3),
          hints: [t`$\omega = 2\pi\times(\text{rpm}/60)$, $\omega_0 = 2\pi f_0$, $\beta = \omega_0/2Q$, $f_0 = F_0/m$ (here the force per unit mass).`, t`$A = \dfrac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + 4\beta^2\omega^2}}$.`],
          teach: t`Near a sharp resonance a small detuning changes the response a lot: always use the full amplitude formula.`,
          explain: t`$\omega_0 = ${sci(w0)}$ rad/s, $\omega = ${sci(w)}$ rad/s, $\beta = ${sci(beta)}$ s⁻¹, so $A = ${sci(A * 1e3)}$ mm. Spacecraft designers keep wheel speeds out of bands near panel modes for exactly this reason.`,
          visual: res({ w0: r6(w0), beta: r6(beta), w: r6(w), wmax: r6(2 * w0), y: 'A2', panels: ['amp'], width: false, lorentz: false }, t`The panel's resonance curve ($A^2$, relative to its peak) with the wheel's frequency marked in orange.`),
        };
      },
    }),
    num({
      id: 'cp-lag', difficulty: 2,
      gen(r) {
        const f0 = r.pick([1000, 5000, 32768]), Q = r.pick([200, 1000, 5000]), k = r.pick([0.5, 1, 2]) * r.sign();
        const w0 = 2 * Math.PI * f0, beta = w0 / (2 * Q), w = w0 + k * beta, d = deg(O.phase(w, w0, beta));
        const df = (k * beta) / (2 * Math.PI);
        return {
          prompt: t`A resonator with $f_0 = ${sci(f0, 5)}$ Hz and $Q = ${sci(Q, 2)}$ is driven $${sci(Math.abs(df), 3)}$ Hz ${k > 0 ? 'above' : 'below'} $f_0$. By how many degrees does its motion lag the drive?`,
          answer: d, units: 'deg', tol: { rel: 0.005, abs: 0.3 },
          errors: distinct([{ value: 180 - d, feedback: t`${k > 0 ? 'Above' : 'Below'} resonance the lag is ${k > 0 ? 'more' : 'less'} than $90^\circ$.` }], d, 0.005),
          hints: [t`$\beta = \omega_0/2Q$; the detuning is $\Delta\omega = 2\pi\Delta f$.`, t`Near resonance $\tan\delta \approx \beta/(\omega_0 - \omega)$.`],
          teach: t`Near resonance the lag depends only on the detuning in half-widths: $\tan\delta \approx \beta/(\omega_0 - \omega)$.`,
          explain: t`$\beta = ${sci(beta)}$ s⁻¹ and $\omega - \omega_0 = ${sci(k * beta)}$ rad/s $= ${k}\beta$, so $\delta = ${sci(d)}^\circ$. Phase-locked loops use exactly this steep phase change to hold an oscillator on its resonance.`,
          visual: res({ w0: 10, beta: 0.5, w: r6(10 + k * 0.5), wmax: 20, panels: ['phase'], marks: false }, t`The phase curve's shape near a resonance (drawn with $Q = 10$; yours is far steeper).`),
        };
      },
    }),
    mcq({
      id: 'cp-90', difficulty: 2,
      prompt: t`A shaker table sweeps slowly up through a structure's resonance while an accelerometer records its motion. Which observation most reliably locates $\omega_0$, even when the damping is heavy?`,
      visual: res({ w0: 10, beta: 2.5, w: 10, wmax: 20, y: 'A', panels: ['amp', 'phase'], marks: false }, t`Heavy damping ($\beta = 2.5$ s⁻¹, $\omega_0 = 10$ rad/s): amplitude (top) and phase lag (bottom).`),
      choices: [t`The frequency where the displacement lags the force by exactly $90^\circ$`, t`The frequency where the displacement amplitude is largest`, t`The frequency where the motion is in phase with the force`, t`The frequency where the amplitude equals the static deflection`],
      answer: 0,
      why: { 1: t`The amplitude peaks at $\sqrt{\omega_0^2 - 2\beta^2}$, noticeably below $\omega_0$ when the damping is heavy.`, 2: t`In-phase motion happens far below resonance, at $\omega \to 0$.`, 3: t`That happens at $\omega = 0$ and again somewhere above resonance — neither is $\omega_0$.` },
      hints: [t`At $\omega = \omega_0$, what is $\tan\delta$, whatever $\beta$ is?`],
      teach: t`$\delta = 90^\circ$ exactly at $\omega_0$ for any damping, which makes phase the cleanest marker of a natural frequency.`,
      explain: t`At $\omega = \omega_0$ the denominator $\omega_0^2 - \omega^2$ vanishes, so $\delta = 90^\circ$ for every $\beta$. The amplitude peak shifts with damping; the $90^\circ$ point does not — which is why modal testing reads phase.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 5: driven damped oscillations and resonance', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 8.03SC Physics III: Vibrations and Waves — forced oscillations and resonance', url: 'https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/' },
  ],
});
