// Fourier series for periodic forcing: a periodic force is a sum of
// harmonics nω; a linear oscillator answers each one separately (M2.3), so the
// steady motion is the sum of the responses — and a sharp resonance picks out
// whichever harmonic lands near ω₀, however small it is in the force. Pulse
// trains and duty cycles (which harmonics vanish), the mean term, Parseval's
// theorem, and a square-wave thruster pulse train driving a solar-panel mode.
import { lesson, mcq, num } from '../../src/core/content.js';
import * as O from '../../src/viz/model/cm-osc.js';
import { sci, r6, pl, gpic, seg, lab, distinct } from './_cm.js';

const t = String.raw;

// the worked example: 20 N thruster pulses, half of each 1.0 s, on a 3.0 Hz, Q = 50 panel mode
const EX = (() => {
  const F = 20, m = 15, tau = 1.0, d = 0.5, f0 = 3.0, Q = 50;
  const h = F / m, w = (2 * Math.PI) / tau, w0 = 2 * Math.PI * f0, beta = w0 / (2 * Q);
  const C = O.coeffs('pulse', 60, h, d), R = O.response(C, tau, w0, beta, 60);
  const H = [1, 3, 5].map((n) => ({ n, a: C.a[n - 1], A: R.harm[n - 1].A }));
  return { F, m, tau, d, f0, Q, h, w, w0, beta, C, R, H, mean: R.x0 };
})();

// a pulse train of height F (N), duty d, period tau (s), centred pulses, over [0, 3τ]
const pulsePic = (F, d, tau, caption, extra = {}) => gpic({
  x: [0, r6(3 * tau)], y: [r6(-0.2 * F), r6(1.35 * F)], xlabel: 't (s)', ylabel: 'force (N)',
  curves: [{ fn: `${F}*step(cos(2*pi*x/${tau}) - ${r6(Math.cos(Math.PI * d))})`, color: 'accent', width: 2.2, samples: 1200 }],
  ...extra,
}, caption, 'A periodic train of rectangular force pulses');

export default lesson({
  id: 'phys3550.M2.4',
  title: 'Fourier series for periodic forcing',
  minutes: 18, difficulty: 4,
  intro: t`A periodic force is rarely a pure sinusoid — think of thruster pulses, a piston's kicks or a walking crowd. But any reasonable periodic $f(t)$ with period $\tau$ is a **Fourier series** of harmonics at $\omega, 2\omega, 3\omega, \ldots$, with $\omega = 2\pi/\tau$. The oscillator's equation is linear, so each harmonic drives its own steady response, exactly as in [M2.3](#/lesson/phys3550.M2.3), and the motion is their **sum**. A sharp resonance therefore acts as a filter. If some harmonic $n\omega$ lands near $\omega_0$, that one dominates the motion even when it is a small part of the force. The coefficients come from the same orthogonality as [Fourier series for boundary-value problems](#/lesson/math2280.DE-8.3), with time in place of space.`,
  equation: t`f(t) = \frac{a_0}{2} + \sum_{n=1}^\infty\big(a_n\cos n\omega t + b_n\sin n\omega t\big), \quad a_n = \frac{2}{\tau}\int_{-\tau/2}^{\tau/2}\!f(t)\cos n\omega t\,dt`,
  symbols: [
    { tex: 'f(t)', text: 'the periodic force per unit mass, $F(t)/m$, in m/s², with $f(t + \\tau) = f(t)$' },
    { tex: '\\tau,\\ \\omega = 2\\pi/\\tau', text: 'the period (s) and the fundamental angular frequency (rad/s); the $n$th harmonic oscillates at $n\\omega$' },
    { tex: 'a_n,\\ b_n', text: 'the Fourier coefficients (m/s²); $b_n = \\frac{2}{\\tau}\\int f\\sin n\\omega t\\,dt$, and $a_0/2$ is the mean of $f$' },
    { tex: 'n', text: 'the harmonic number, 1, 2, 3, …' },
  ],
  why: t`Real drives are periodic but not sinusoidal; Fourier series is how you find out which of their harmonics a structure will feel — the reason attitude-control software picks pulse rates with care.`,
  visual: {
    type: 'cm-fourier',
    title: 'A pulse train through a resonance',
    lead: t`Top: a train of rectangular force pulses (grey) and its Fourier partial sum (blue). Middle: the harmonics of the force (blue bars) and of the response (gold bars), with the oscillator's gain curve (violet, dashed). Bottom: the steady motion (blue) and its largest single harmonic (gold, dashed). Here $\omega_0 = 3\pi$ rad/s and $\beta = 0.15$ s⁻¹ ($Q \approx 31$).`,
    tasks: [
      t`At $\tau = 2$ s the third harmonic, $3\omega = 3\pi$, sits right on $\omega_0$. The force is square, yet the motion is almost a pure sinusoid at $3\omega$: the resonance filters it.`,
      t`Now set the duty cycle to $d = 0.33$: the third harmonic of the force vanishes (since $\sin 3\pi d \approx 0$), and the response collapses.`,
      t`Set $\tau = 1.0$ s: $\omega_0$ falls between the first and second harmonics, and the response shrinks to a small, square-ish wiggle.`,
    ],
    params: { wave: 'pulse', h: 1, d: 0.5, tau: 2, w0: 9.42478, beta: 0.15, N: 9, nmax: 9, sliders: ['tau', 'N', 'd', 'beta'], ranges: { tau: [0.5, 4], beta: [0.03, 1] }, readouts: ['w', 'near', 'share'] },
    caption: t`Force height 1 m/s² (per unit mass). Steady state only; the transient after switch-on is left out. The response sums 60 harmonics. Spectrum bars are each scaled to their own largest member.`,
  },
  example: {
    prompt: t`An attitude thruster fires ${EX.F} N pulses for half of every ${EX.tau.toFixed(1)} s. It sits on a spacecraft whose solar panel has a bending mode at $f_0 = ${EX.f0.toFixed(1)}$ Hz with $Q = ${EX.Q}$; model the panel tip as an effective mass of ${EX.m} kg on that mode. Find the panel's steady response: its mean deflection, and the amplitudes driven by the first three nonzero harmonics.`,
    visual: { type: 'cm-fourier', params: { wave: 'pulse', h: r6(EX.h), d: 0.5, tau: EX.tau, w0: r6(EX.w0), beta: r6(EX.beta), N: 7, nmax: 7, sliders: [], readouts: [] }, caption: t`The thruster force per unit mass (top), its harmonics against the panel's gain curve (middle) and the panel's steady motion (bottom). Teaching model: one mode, effective mass, linear.` },
    steps: [
      { label: 'Fourier coefficients', text: t`With $h = F/m = ${sci(EX.h, 3)}$ m/s² and duty $d$, the centred pulse is even, so $b_n = 0$ and $\dfrac{a_0}{2} = hd$, $a_n = \dfrac{2}{\tau}\displaystyle\int_{-d\tau/2}^{d\tau/2}h\cos n\omega t\,dt = \dfrac{2h}{n\pi}\sin(n\pi d)$.` },
      { label: 'Half duty', text: t`$d = \tfrac12$: $\sin(n\pi/2)$ kills every even harmonic. $a_1 = ${sci(EX.H[0].a, 3)}$, $a_3 = ${sci(EX.H[1].a, 3)}$, $a_5 = ${sci(EX.H[2].a, 3)}$ m/s².` },
      { label: 'Superpose', text: t`Linear equation: $x(t) = \dfrac{a_0/2}{\omega_0^2} + \sum_n A_n\cos(n\omega t - \delta_n)$, with $A_n = \dfrac{|a_n|}{\sqrt{(\omega_0^2 - n^2\omega^2)^2 + 4\beta^2n^2\omega^2}}$.` },
      { label: 'Panel numbers', text: t`$\omega = 2\pi$ rad/s, $\omega_0 = ${sci(EX.w0, 4)}$ rad/s, $\beta = \omega_0/2Q = ${sci(EX.beta, 3)}$ s⁻¹. Mean: $hd/\omega_0^2 = ${sci(EX.mean * 1e3, 3)}$ mm.` },
      { label: 'Harmonic by harmonic', text: t`$A_1 = ${sci(EX.H[0].A * 1e3, 3)}$ mm, $A_3 = ${sci(EX.H[1].A * 1e3, 3)}$ mm, $A_5 = ${sci(EX.H[2].A * 1e3, 3)}$ mm. The third harmonic is only a third of the fundamental in the force, but $3\omega = \omega_0$: it is amplified $Q$-fold and dominates by a factor of $${sci(EX.H[1].A / EX.H[0].A, 2)}$.` },
      { label: 'Sense check', text: t`The panel vibrates mostly at 3 Hz, not at the 1 Hz pulse rate. Fix: change the duty cycle to $\tfrac13$ (then $\sin 3\pi d = 0$) or move the pulse rate so that no strong harmonic lands within a few half-widths, $\beta/2\pi \approx ${sci(EX.beta / (2 * Math.PI), 2)}$ Hz, of 3 Hz.` },
    ],
    answer: t`Mean sag $${sci(EX.mean * 1e3, 3)}$ mm; $A_1 \approx ${sci(EX.H[0].A * 1e3, 2)}$ mm, $A_3 \approx ${sci(EX.H[1].A * 1e3, 3)}$ mm, $A_5 \approx ${sci(EX.H[2].A * 1e3, 2)}$ mm — the resonant third harmonic dominates.`,
  },
  practice: [
    num({
      id: 'pulse-an', difficulty: 2,
      gen(r) {
        const F = r.pick([10, 20, 40]), d = r.pick([0.2, 0.25, 0.4, 0.5]), n = r.pick([1, 2, 3]), tau = r.pick([0.5, 1, 2]);
        let an = ((2 * F) / (n * Math.PI)) * Math.sin(n * Math.PI * d);
        const nn = Math.abs(an) < 1e-9 ? 1 : n;
        an = ((2 * F) / (nn * Math.PI)) * Math.sin(nn * Math.PI * d);
        return {
          prompt: t`A thruster gives ${F} N pulses lasting a fraction $d = ${d}$ of each ${tau} s period (zero otherwise), with $t = 0$ at the middle of a pulse. What is the Fourier coefficient $a_{${nn}}$ of the force, in newtons?`,
          answer: an, units: 'N', tol: { rel: 0.01, abs: 0.01 },
          integrand: `(2/${tau})*${F}*cos(2*pi*${nn}*x/${tau})`, limits: [r6((-d * tau) / 2), r6((d * tau) / 2)], vars: { x: [-tau / 2, tau / 2] },
          errors: distinct([{ value: (F / (nn * Math.PI)) * Math.sin(nn * Math.PI * d), feedback: t`The prefactor is $2/\tau$, not $1/\tau$.` }, { value: ((2 * F) / (nn * Math.PI)) * Math.sin(2 * nn * Math.PI * d), feedback: t`The pulse runs from $-d\tau/2$ to $d\tau/2$: the sine's argument is $n\pi d$, not $2n\pi d$.` }], an),
          hints: [t`$a_n = \dfrac{2}{\tau}\displaystyle\int_{-d\tau/2}^{d\tau/2}F\cos\dfrac{2\pi nt}{\tau}\,dt$.`, t`The integral gives $a_n = \dfrac{2F}{n\pi}\sin(n\pi d)$.`],
          teach: t`For a centred rectangular pulse train, $a_n = \dfrac{2F}{n\pi}\sin(n\pi d)$: the duty cycle sets which harmonics are strong.`,
          explain: t`$a_{${nn}} = \dfrac{2(${F})}{${nn}\pi}\sin(${nn}\pi\times${d}) = ${sci(an)}$ N.`,
          visual: pulsePic(F, d, tau, t`Three periods of the pulse train (${F} N, duty ${d}, period ${tau} s).`),
        };
      },
    }),
    mcq({
      id: 'missing', difficulty: 2,
      prompt: t`A pulse train has duty cycle $d = \tfrac14$ (on a quarter of each period). Which harmonics are missing from its Fourier series?`,
      visual: { type: 'cm-fourier', params: { wave: 'pulse', h: 1, d: 0.25, tau: 2, w0: 40, beta: 0.5, N: 12, nmax: 12, sliders: [], readouts: [], panels: ['force'], response: false }, caption: t`The pulse train with $d = \tfrac14$ (grey) and its 12-term Fourier partial sum (blue).` },
      choices: ['Every fourth: n = 4, 8, 12, …', 'Every even one: n = 2, 4, 6, …', 'Every odd one: n = 1, 3, 5, …', 'None: every harmonic is present'],
      answer: 0,
      why: { 1: t`That is the half-duty square wave, where $\sin(n\pi/2) = 0$ for even $n$. With $d = \tfrac14$, $\sin(n\pi/4)$ vanishes only for multiples of 4.`, 2: t`The fundamental is never missing from a pulse train with $0 < d < 1$: $\sin(\pi d) > 0$.`, 3: t`$\sin(n\pi/4) = 0$ for $n = 4, 8, \ldots$: those vanish exactly — visible as gaps in the spectrum.` },
      hints: [t`$a_n \propto \sin(n\pi d)$. When is $\sin(n\pi/4) = 0$?`],
      teach: t`A duty cycle of $1/k$ removes every $k$th harmonic: $\sin(n\pi/k) = 0$ when $n$ is a multiple of $k$.`,
      explain: t`$a_n = \dfrac{2h}{n\pi}\sin\dfrac{n\pi}{4}$, zero for $n = 4, 8, 12, \ldots$ — the gaps in the spectrum.`,
    }),
    num({
      id: 'harmonic-response', difficulty: 3,
      gen(r) {
        const f0 = r.pick([4, 6]), Q = r.pick([20, 40]), fp = r.pick([1, 1.5]), F = r.pick([5, 10]), m = r.pick([10, 20]), n = r.pick([1, 3]);
        const w0 = 2 * Math.PI * f0, beta = w0 / (2 * Q), w = 2 * Math.PI * fp, an = ((2 * F) / (n * Math.PI * m)) * Math.sin((n * Math.PI) / 2);
        const A = O.amp(n * w, w0, beta, Math.abs(an));
        return {
          prompt: t`A square-wave pulse train ($d = \tfrac12$) of ${F} N pulses at ${fp} Hz drives a mode with effective mass ${m} kg, $f_0 = ${f0}$ Hz and $Q = ${Q}$. What steady amplitude does its harmonic $n = ${n}$ (at ${n * fp} Hz) produce, in mm?`,
          answer: A * 1e3, units: 'mm', tol: { rel: 0.01 },
          errors: distinct([{ value: O.amp(n * w, w0, beta, Math.abs((2 * F) / (n * Math.PI))) * 1e3, feedback: t`Divide the force by the mass: the equation is per unit mass, $a_n/m$.` }, { value: (Math.abs(an) / (w0 * w0)) * 1e3, feedback: t`That is the static response $a_n/\omega_0^2$: at ${n * fp} Hz the dynamic factor matters.` }], A * 1e3),
          hints: [t`$a_n = \dfrac{2F}{n\pi m}\sin\dfrac{n\pi}{2}$ (force per unit mass).`, t`$A_n = \dfrac{|a_n|}{\sqrt{(\omega_0^2 - n^2\omega^2)^2 + 4\beta^2n^2\omega^2}}$, with $\beta = \omega_0/2Q$.`],
          teach: t`Each harmonic goes through the oscillator's amplitude formula at its own frequency $n\omega$.`,
          explain: t`$|a_${n}| = ${sci(Math.abs(an))}$ m/s², $\omega_0 = ${sci(w0)}$ rad/s, $n\omega = ${sci(n * w)}$ rad/s, $\beta = ${sci(beta)}$ s⁻¹, so $A_${n} = ${sci(A * 1e3)}$ mm.`,
          visual: { type: 'cm-fourier', params: { wave: 'pulse', h: r6(F / m), d: 0.5, tau: r6(1 / fp), w0: r6(w0), beta: r6(beta), N: 7, nmax: 7, sliders: [], readouts: [], panels: ['spectrum'], values: true }, caption: t`The force harmonics (blue) against the mode's gain curve (violet), and the response harmonics (gold); bars are relative, not to scale with each other.` },
        };
      },
    }),
    num({
      id: 'parseval', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 3, 5]);
        const frac = 8 / (Math.PI * Math.PI * n * n);
        return {
          prompt: t`A force switches between $+h$ and $-h$, spending half of each period at each (a symmetric square wave, mean zero). Its series is $\dfrac{4h}{\pi}\left(\cos\omega t - \tfrac13\cos 3\omega t + \tfrac15\cos 5\omega t - \cdots\right)$. What fraction of its mean-square value $\langle f^2\rangle = h^2$ is carried by harmonic $n = ${n}$ alone?`,
          answer: frac, tol: { rel: 0.01 },
          errors: [{ value: 4 / (Math.PI * n), feedback: t`That is the harmonic's amplitude over $h$. Its share of the mean square is (amplitude)²/2 over $h^2$.` }, { value: 16 / (Math.PI * Math.PI * n * n), feedback: t`A sinusoid of amplitude $a$ has mean square $a^2/2$, not $a^2$.` }],
          hints: [t`Parseval: $\langle f^2\rangle = (a_0/2)^2 + \tfrac12\sum(a_n^2 + b_n^2)$.`, t`Harmonic $n$ contributes $\tfrac12\left(\dfrac{4h}{n\pi}\right)^2$.`],
          teach: t`Parseval's theorem splits the mean square — the average power, for a force on a resistance-like load — among the harmonics: $\tfrac12a_n^2$ each.`,
          explain: t`$\tfrac12\left(\dfrac{4h}{${n}\pi}\right)^2\Big/h^2 = \dfrac{8}{${n * n}\pi^2} = ${sci(frac)}$. The fundamental alone carries 81%; all the odd harmonics together carry the rest, since $\sum 1/n^2$ over odd $n$ is $\pi^2/8$.`,
          visual: { type: 'cm-fourier', params: { wave: 'square', h: 1, tau: 2, w0: 40, beta: 0.5, N: 9, nmax: 9, sliders: [], readouts: [], panels: ['force', 'spectrum'], response: false }, caption: t`The square wave, its 9-term partial sum, and its harmonic amplitudes (bars, relative to the largest).` },
        };
      },
    }),
    mcq({
      id: 'linear', difficulty: 2,
      prompt: t`Why may we find the response to each harmonic separately and add them?`,
      visual: { type: 'cm-fourier', params: { wave: 'pulse', h: 1, d: 0.5, tau: 2, w0: 9.42478, beta: 0.15, N: 5, nmax: 7, sliders: [], readouts: [], panels: ['response'] }, caption: t`The steady response (blue): a sum of harmonic responses, the largest dashed in gold.` },
      choices: [
        t`The equation $\ddot x + 2\beta\dot x + \omega_0^2x = f(t)$ is linear: if $x_1$ answers $f_1$ and $x_2$ answers $f_2$, then $x_1 + x_2$ answers $f_1 + f_2$`,
        t`Because the harmonics are orthogonal, so they cannot interact`,
        t`Because the damping is small`,
        t`It is an approximation that works only near resonance`,
      ],
      answer: 0,
      why: {
        1: t`Orthogonality is what lets you *compute* each coefficient separately. Independence of the responses comes from linearity: a nonlinear spring would mix harmonics however orthogonal they are.`,
        2: t`Superposition is exact for any damping, as long as the damping force is linear in $\dot x$.`,
        3: t`For a linear oscillator it is exact at every frequency; it is the oscillator that might not be linear (a large-amplitude pendulum, say).`,
      },
      hints: [t`Substitute $x_1 + x_2$ into the left-hand side. What do you get?`],
      teach: t`Superposition is a property of linear equations: responses to separate drives add.`,
      explain: t`Every term of the left side is linear in $x$, so the left side of $x_1 + x_2$ is $f_1 + f_2$. With a Fourier series that means infinitely many separate, easy problems.`,
    }),
    num({
      id: 'sawtooth', difficulty: 3,
      gen(r) {
        const h = r.pick([2, 3, 5]), tau = r.pick([1, 2, 4]), n = r.pick([1, 2, 3]);
        const bn = ((2 * h) / (n * Math.PI)) * (n % 2 ? 1 : -1);
        return {
          prompt: t`A force per unit mass rises steadily from $-${h}$ to $+${h}$ m/s² over each period $\tau = ${tau}$ s and then drops back: $f(t) = ${2 * h / tau === 1 ? '' : 2 * h / tau}t$ for $-${tau / 2} < t < ${tau / 2}$ s, repeated. Find the sine coefficient $b_{${n}}$.`,
          answer: bn, units: 'm/s^2', tol: { rel: 0.01 },
          integrand: `(2/${tau})*(${2 * h}*x/${tau})*sin(2*pi*${n}*x/${tau})`, limits: [-tau / 2, tau / 2], vars: { x: [-tau / 2, tau / 2] },
          errors: distinct([{ value: -bn, feedback: t`Check the sign of the boundary term: $\int t\sin kt\,dt = -\tfrac{t}{k}\cos kt + \tfrac{1}{k^2}\sin kt$, and $\cos n\pi = (-1)^n$.` }, { value: bn / 2, feedback: t`The coefficient formula has $2/\tau$ in front.` }], bn),
          hints: [t`$f$ is odd, so only sine terms appear: $b_n = \dfrac{2}{\tau}\displaystyle\int_{-\tau/2}^{\tau/2}f(t)\sin n\omega t\,dt$.`, t`Integrate by parts; the result is $b_n = \dfrac{2h}{n\pi}(-1)^{n+1}$ for a sawtooth of height $\pm h$.`],
          teach: t`An odd periodic function has only sine terms; a sawtooth's coefficients fall off like $1/n$ because it jumps once per period.`,
          explain: t`$b_n = \dfrac{2\times${h}}{${n}\pi}(-1)^{${n + 1}} = ${sci(bn)}$ m/s². Jumps make coefficients fall like $1/n$; a smooth corner like a triangle wave's gives $1/n^2$.`,
          visual: gpic({ x: [r6(-1.5 * tau), r6(1.5 * tau)], y: [-h * 1.3, h * 1.3], xlabel: 't (s)', ylabel: 'f (m/s²)', curves: [{ fn: `${2 * h}*(x/${tau} - floor(x/${tau} + 0.5))`, color: 'accent', width: 2.2, samples: 1500 }] }, t`The sawtooth over three periods; it jumps from $+${h}$ to $-${h}$ at $t = \pm${tau / 2}$ s.`, 'A sawtooth wave'),
        };
      },
    }),
    num({
      id: 'mean-sag', difficulty: 2,
      gen(r) {
        const F = r.pick([10, 20, 30]), d = r.pick([0.1, 0.25, 0.5]), m = r.pick([10, 15, 25]), f0 = r.pick([2, 3, 5]);
        const w0 = 2 * Math.PI * f0, x0 = (F * d) / (m * w0 * w0);
        return {
          prompt: t`A ${F} N pulse train with duty cycle ${d} drives a mode of effective mass ${m} kg and natural frequency ${f0} Hz. Apart from the vibration, by how much is the mode's average position shifted? Give mm.`,
          answer: x0 * 1e3, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (F / (m * w0 * w0)) * 1e3, feedback: t`That is the deflection under the full ${F} N. The mean force is only $Fd$.` }, { value: ((F * d) / (m * f0 * f0)) * 1e3, feedback: t`Use $\omega_0 = 2\pi f_0$ in $k = m\omega_0^2$.` }],
          hints: [t`The $a_0/2$ term is the mean force per unit mass, $Fd/m$, and it is constant.`, t`A constant drive gives a constant deflection $(a_0/2)/\omega_0^2$.`],
          teach: t`The $n = 0$ term of the series is a steady push; it shifts the equilibrium by mean force over stiffness.`,
          explain: t`$\bar x = \dfrac{Fd/m}{\omega_0^2} = \dfrac{${F}\times${d}/${m}}{(2\pi\times${f0})^2} = ${sci(x0 * 1e3)}$ mm.`,
          visual: pulsePic(F, d, 1, t`The pulse train (period shown as 1 s); its mean, the dashed line, is the steady part of the push.`, { hlines: [{ y: r6(F * d), color: 'gold', label: 'mean' }] }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thruster', difficulty: 3, transfer: true,
      gen(r) {
        const F = r.pick([10, 22, 40]), m = r.pick([8, 12]), fp = r.pick([0.5, 1, 2]), n = r.pick([3, 5]), Q = r.pick([30, 60]);
        const f0 = n * fp, w0 = 2 * Math.PI * f0, beta = w0 / (2 * Q);
        const an = (2 * F) / (n * Math.PI * m), A = an / (2 * beta * w0);
        return {
          prompt: t`An attitude thruster fires ${F} N pulses at ${fp} Hz, on for half of each cycle. A boom on the spacecraft has a bending mode at ${f0} Hz with $Q = ${Q}$ and effective mass ${m} kg. Which harmonic of the thrust excites the mode, and what steady amplitude does it drive? Give the amplitude in mm.`,
          answer: A * 1e3, units: 'mm', tol: { rel: 0.01 },
          errors: distinct([{ value: ((2 * F) / (Math.PI * m) / (2 * beta * w0)) * 1e3, feedback: t`You used the fundamental's coefficient. The mode is at harmonic $n = ${n}$, whose coefficient is $1/${n}$ as big.` }, { value: (an / (w0 * w0)) * 1e3, feedback: t`At exact resonance the amplitude is $a_n/(2\beta\omega_0) = Q\,a_n/\omega_0^2$, not the static $a_n/\omega_0^2$.` }], A * 1e3),
          hints: [t`$${f0}/${fp} = ${n}$: harmonic ${n} lands exactly on the mode. For half duty $|a_n| = \dfrac{2F}{n\pi m}$ for odd $n$.`, t`At resonance $A_n = \dfrac{|a_n|}{2\beta\omega_0}$, with $\beta = \omega_0/2Q$.`],
          teach: t`A pulse rate that is a whole fraction of a structural mode's frequency excites it through a harmonic, amplified $Q$-fold.`,
          explain: t`Harmonic ${n}: $|a_${n}| = ${sci(an)}$ m/s². $\omega_0 = ${sci(w0)}$ rad/s, $\beta = ${sci(beta)}$ s⁻¹, so $A_${n} = |a_${n}|/(2\beta\omega_0) = ${sci(A * 1e3)}$ mm — from a harmonic carrying only $1/${n}$ of the fundamental's force. Flight software avoids such pulse rates, or shapes the pulses to null the offending harmonic.`,
          visual: { type: 'cm-fourier', params: { wave: 'pulse', h: r6(F / m), d: 0.5, tau: r6(1 / fp), w0: r6(w0), beta: r6(beta), N: 9, nmax: 9, sliders: [], readouts: [], panels: ['force', 'spectrum'] }, caption: t`The thrust per unit mass and its harmonics against the boom's gain curve (relative bars). Teaching model: one mode, effective mass, linear.` },
        };
      },
    }),
    mcq({
      id: 'cp-duty', difficulty: 2, transfer: true,
      prompt: t`A pulse train at 1 Hz with half duty excites a 3 Hz panel mode through its third harmonic. Keeping the rate at 1 Hz, which duty cycle removes the third harmonic entirely?`,
      visual: { type: 'cm-fourier', params: { wave: 'pulse', h: 1, d: 0.5, tau: 1, w0: 18.8496, beta: 0.2, N: 9, nmax: 9, sliders: [], readouts: [], panels: ['spectrum'] }, caption: t`At half duty: the force harmonics (blue), the panel's gain curve (violet) and the response harmonics (gold), each set relative to its largest.` },
      choices: ['1/3', '1/4', '1/6', '1/2'],
      answer: 0,
      why: { 1: t`$\sin(3\pi/4) \ne 0$: a quarter duty removes every fourth harmonic, not the third.`, 2: t`$\sin(3\pi/6) = \sin(\pi/2) = 1$: that makes the third harmonic as large as it can be.`, 3: t`That is the starting duty: $\sin(3\pi/2) = -1$, the third harmonic at full strength.` },
      hints: [t`$a_3 \propto \sin(3\pi d)$. When is it zero for $0 < d < 1$?`],
      teach: t`Shaping the pulse can null a harmonic: $a_n \propto \sin(n\pi d)$ vanishes when $nd$ is a whole number.`,
      explain: t`$\sin 3\pi d = 0$ for $d = \tfrac13$ or $\tfrac23$. With $d = \tfrac13$ the train has no 3 Hz component, so the panel mode is barely driven (its neighbours at 2 and 4 Hz sit many half-widths away).`,
    }),
    num({
      id: 'cp-dc-share', difficulty: 2,
      gen(r) {
        const d = r.pick([0.1, 0.2, 0.25, 0.4]);
        return {
          prompt: t`A pulse train of height $h$ is on for a fraction $d = ${d}$ of each period. What fraction of its mean square $\langle f^2\rangle$ is in the constant ($n = 0$) term? (Use Parseval: $\langle f^2\rangle = (a_0/2)^2 + \tfrac12\sum(a_n^2 + b_n^2)$.)`,
          answer: d, tol: { rel: 0.01 },
          errors: [{ value: d * d, feedback: t`$(a_0/2)^2 = h^2d^2$, but $\langle f^2\rangle$ is $h^2d$, not $h^2$: divide by it.` }, { value: 1 - d, feedback: t`That is the share in the oscillating harmonics.` }],
          hints: [t`$\langle f^2\rangle = h^2d$ (it is $h^2$ for a fraction $d$ of the time) and $a_0/2 = hd$.`, t`Fraction $= (hd)^2/(h^2d)$.`],
          teach: t`Parseval lets you check a series' bookkeeping: the mean term's share of a pulse train's mean square is exactly its duty cycle.`,
          explain: t`$(hd)^2/(h^2d) = d = ${d}$. The other $${sci(1 - d, 2)}$ is spread over the harmonics — short, sharp pulses put most of their power into oscillation.`,
          visual: pulsePic(1, d, 1, t`The pulse train ($h = 1$, duty ${d}), over three periods.`, { ylabel: 'f / h' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 5: Fourier series and periodic driving forces', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 18.03SC Differential Equations: Fourier series and periodic forcing', url: 'https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/' },
  ],
});
