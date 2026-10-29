// Forced oscillations and resonance, the engineer's reading: transient plus
// steady state; the half-power bandwidth Δω = 2ζω₀ = ω₀/Q and its twin, the
// ring-down (and build-up) time 2Q/ω₀; beats when a lightly damped system is
// driven near resonance from rest; force transmissibility through a machine's
// mounts (isolation only above √2·ω₀, where damping hurts); a pogo-like
// frequency crossing; and a numerical check of the steady amplitude.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6 } from './_second.js';

const t = String.raw;

const gain = (W, z) => 1 / Math.sqrt((1 - W * W) ** 2 + (2 * z * W) ** 2);
const trans = (W, z) => Math.sqrt(1 + (2 * z * W) ** 2) * gain(W, z);
const TRANS_FN = (z) => `sqrt(1 + (${2 * z}*x)^2)/sqrt((1 - x^2)^2 + (${2 * z}*x)^2)`;

// the worked example: a pump on rubber mounts
const EX = (() => {
  const m = 120, k = 4.8e5, z = 0.1, rpm = 3000, F0 = 300;
  const w0 = Math.sqrt(k / m), w = (rpm * 2 * Math.PI) / 60, W = w / w0, X = F0 / k;
  const A = X * gain(W, z), T = trans(W, z);
  return { m, k, z, rpm, F0, w0, f0: w0 / (2 * Math.PI), w, W, X, A, T, Ft: T * F0, Q: 1 / (2 * z), rpm0: (w0 / (2 * Math.PI)) * 60 };
})();

/** Beats from rest, x/X for an undamped oscillator: (cos Ωτ − cos τ)/(1 − Ω²) in τ = ω₀t. */
const beatsFn = (W) => `(cos(${W}*x) - cos(x))/(1 - ${r6(W * W)})`;

export default lesson({
  id: 'math2280.DE-3.6',
  title: 'Forced oscillations and resonance',
  minutes: 15, difficulty: 3,
  intro: t`Drive a damped oscillator at angular frequency $\omega$:

$$x'' + 2\zeta\omega_0\,x' + \omega_0^2\,x = \frac{F_0}{m}\cos\omega t.$$

By DE-3.3 the solution is the free motion — the **transient**, dying like $e^{-\zeta\omega_0t}$ — plus the **steady state** $A\cos(\omega t - \varphi)$, with $A = \dfrac{F_0/k}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}}$ and $\Omega = \omega/\omega_0$. Four things an engineer reads off it: how **sharp** the resonance is — the half-power bandwidth $\Delta\omega = 2\zeta\omega_0 = \omega_0/Q$; how **long** the steady state takes to arrive — the same $2Q/\omega_0$ the free motion takes to ring down; the **beats** of transient against steady state when a lightly damped system is driven near resonance from rest; and how much force a vibrating machine passes through its mounts.`,
  symbols: [
    { tex: 'F_0/m', text: 'the drive’s amplitude per unit mass, in m/s²; $F_0/k$ is the static deflection a steady push $F_0$ would give' },
    { tex: '\\omega,\\ \\Omega', text: 'the driving angular frequency (rad/s), and its ratio $\\Omega = \\omega/\\omega_0$ to the natural one' },
    { tex: '\\omega_0,\\ \\zeta', text: 'natural frequency and damping ratio, as in DE-3.5' },
    { tex: 'A,\\ \\varphi', text: 'the steady amplitude and the angle by which the response lags the drive' },
    { tex: 'Q', text: 'the quality factor $1/(2\\zeta)$: the peak gain, and $\\omega_0/\\Delta\\omega$' },
    { tex: '\\Delta\\omega', text: 'the half-power bandwidth: the width of the band where the response power is at least half its peak, $2\\zeta\\omega_0$' },
  ],
  why: t`Every launch vehicle, satellite and engine is designed around its resonances: shaken on tables to find them, kept away from the strongest drives, and isolated by mounts whose own resonance is placed deliberately low.`,
  visual: {
    type: 'c3-roots',
    title: 'Transient against steady state',
    lead: t`Top: the steady gain $A/(F_0/k)$ against $\Omega = \omega/\omega_0$ for your damping (blue). Bottom: the motion from rest — transient plus steady state — with the steady part dashed. Here $\omega_0 = 2$ rad/s.`,
    tasks: [
      t`Set $\zeta = 0$ and $\omega/\omega_0 = 0.90$: from rest the motion swells and fades again and again — **beats**, repeating every $2\pi/(\omega_0 - \omega) \approx 31$ s, and reaching twice the steady amplitude.`,
      t`Raise $\zeta$ to 0.03: the beats fade as the transient decays (time constant $1/(\zeta\omega_0) \approx 17$ s), leaving only the steady oscillation.`,
      t`Drive at $\omega/\omega_0 = 1$ with $\zeta = 0.05$ ($Q = 10$): the amplitude creeps up toward $Q$ times the static deflection, covering 63% of the way in about $Q/\pi \approx 3$ cycles — the same time it would take to ring down.`,
    ],
    params: { mode: 'forced', zeta: 0.02, w0: 2, W: 0.92, T: 80, yname: 'x' },
    caption: t`Top: gain curves (blue: yours; grey: $\zeta$ = 0.05, 0.1, 0.2, 0.4, 0.7, 1). Bottom: $x/(F_0/k)$ from rest (blue) and the steady state (gold, dashed). Linear spring, viscous damping.`,
  },
  example: {
    prompt: t`A ${EX.m} kg fuel-pump assembly sits on rubber mounts of total stiffness $k = 4.8\times10^{5}$ N/m with damping ratio $\zeta = ${EX.z}$. Its rotor runs at ${EX.rpm} rpm, and a residual imbalance shakes it with a force of amplitude ${EX.F0} N at the running speed. Find the mount’s natural frequency, the steady vibration amplitude, the force passed into the vehicle’s structure, and the mount’s $Q$ and bandwidth.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 6], y: [-0.3, 3.4], aspect: 'wide', xlabel: 'Ω = ω/ω₀', ylabel: 'transmitted / applied force',
        curves: [{ fn: TRANS_FN(EX.z), color: 'accent', width: 2.4 }],
        hlines: [{ y: 1, color: 'ink3' }],
        vlines: [{ x: 1.41421, label: '√2' }],
        points: [{ x: r6(EX.W), y: r6(EX.T), color: 'gold', label: `running speed, ${(100 * EX.T).toFixed(0)}%`, labelDx: -60, labelDy: -14 }],
      },
      caption: t`The mount’s force transmissibility for $\zeta = ${EX.z}$: it amplifies forces below $\Omega = \sqrt2$ (peak about 5 at resonance) and reduces them above. The pump runs far up the right-hand tail.`,
    },
    steps: [
      { label: 'Natural frequency', text: t`$\omega_0 = \sqrt{k/m} = \sqrt{4.8\times10^5/${EX.m}} = ${fmt(EX.w0, 3)}$ rad/s, so $f_0 = ${fmt(EX.f0, 3)}$ Hz. The rotor turns at ${EX.rpm}/60 = 50 Hz, so $\Omega = ${fmt(EX.W, 3)}$.` },
      { label: 'Steady amplitude', text: t`The static deflection is $F_0/k = ${fmt(EX.X * 1e3, 3)}$ mm. $A = \dfrac{F_0/k}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}} = \dfrac{${fmt(EX.X * 1e3, 3)}\ \text{mm}}{${fmt(1 / gain(EX.W, EX.z), 3)}} = ${fmt(EX.A * 1e6, 2)}\ \mu\text{m}$.` },
      { label: 'Force on the structure', text: t`The mounts push on the vehicle with $kx + cx'$, whose amplitude is $kA\sqrt{1 + (2\zeta\Omega)^2}$. As a fraction of $F_0$ that is the **transmissibility** $T = \dfrac{\sqrt{1 + (2\zeta\Omega)^2}}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}} = ${fmt(EX.T, 3)}$: about ${fmt(EX.Ft, 2)} N reaches the structure, of the ${EX.F0} N.` },
      { label: 'Q and bandwidth', text: t`$Q = 1/(2\zeta) = ${EX.Q}$, and the half-power bandwidth is $\Delta f = f_0/Q = ${fmt(EX.f0 / EX.Q, 2)}$ Hz: forces between roughly 9 and 11 Hz are amplified up to five-fold.` },
      { label: 'Spin-up', text: t`On the way to full speed the rotor passes ${Math.round(EX.rpm0)} rpm, where $\Omega = 1$. It must not linger there: run it up briskly so the response never has the $\sim Q/\pi$ cycles it needs to build up.` },
      { label: 'Sense check', text: t`Isolation needs $\Omega > \sqrt2$, whatever the damping; the further above, the better. That is why mounts are made **soft** — a low $f_0$ — and why a stiff mount would be worse than none.` },
    ],
    answer: t`$f_0 \approx ${fmt(EX.f0, 3)}$ Hz; $A \approx ${fmt(EX.A * 1e6, 2)}\ \mu\text{m}$; about ${fmt(EX.Ft, 2)} N (${(100 * EX.T).toFixed(0)}%) reaches the structure; $Q = ${EX.Q}$, $\Delta f \approx ${fmt(EX.f0 / EX.Q, 2)}$ Hz.`,
  },
  practice: [
    num({
      id: 'bandwidth-ringdown', difficulty: 2,
      gen(r) {
        const [what, f0, dfs] = r.pick([['A quartz tuning-fork crystal', 32768, [2, 4]], ['A MEMS gyroscope’s resonator', 20000, [5, 10]], ['A satellite’s solar-array panel', 1.6, [0.05, 0.08]]]);
        const df = r.pick(dfs), tau = 1 / (Math.PI * df);
        const unit = tau < 1 ? 'ms' : 's', fac = tau < 1 ? 1e3 : 1;
        const Q = f0 / df, z = 1 / (2 * Q);
        return {
          prompt: t`${what} resonates at $f_0 = ${nice(f0)}$ Hz; a slow frequency sweep shows a half-power bandwidth of $\Delta f = ${df}$ Hz. If it is struck and left to ring, how long does its amplitude take to fall by a factor $e$?`,
          answer: tau * fac, units: unit, tol: { rel: 0.005 },
          errors: [
            { value: fac / df, feedback: t`$\Delta\omega = 2\zeta\omega_0$ is an *angular* frequency width: in hertz, $\Delta f = \zeta\omega_0/\pi$, so $1/(\zeta\omega_0) = 1/(\pi\Delta f)$.` },
            { value: fac / (2 * Math.PI * df), feedback: t`The bandwidth is $2\zeta\omega_0$, twice the decay rate: $\zeta\omega_0 = \Delta\omega/2 = \pi\Delta f$.` },
          ],
          hints: [t`The free amplitude decays like $e^{-\zeta\omega_0t}$, and the half-power bandwidth is $\Delta\omega = 2\zeta\omega_0$.`, t`So $\zeta\omega_0 = \Delta\omega/2 = \pi\Delta f$, and the decay time is $1/(\pi\Delta f)$ — whatever $f_0$ is.`],
          teach: 'A resonance’s width and its ring-down time are two views of one number: τ = 1/(π Δf).',
          explain: t`$\tau = \dfrac{1}{\pi\Delta f} = \dfrac{1}{\pi\times${df}} = ${fmt(tau * fac, 3)}$ ${unit}. Its $Q = f_0/\Delta f = ${fmt(Q, 3)}$. A narrow resonance must ring long, and a quickly damped one must be broad: you cannot have a sharp filter that also settles fast.`,
          visual: {
            type: 'graph',
            params: {
              x: [0.9, 1.1], y: [0, 1.15], aspect: 'wide', xlabel: 'f / f₀', ylabel: 'response power / peak', xticks: 4,
              curves: [{ fn: `x^2/((1 - x^2)^2*${r6(1 / (4 * 0.012 * 0.012))} + x^2)`, color: 'accent', width: 2.4 }],
              shade: [{ fn: `x^2/((1 - x^2)^2*${r6(1 / (4 * 0.012 * 0.012))} + x^2)`, from: 0.988, to: 1.012, color: 'gold', alpha: 0.3 }],
              hlines: [{ y: 0.5, label: 'half power', color: 'gold' }],
            },
            caption: 'A resonance peak in response power and its half-power band (shaded), drawn for a Q of about 40 — not to the scale of this resonator, whose peak is far narrower or wider.',
          },
        };
      },
    }),
    num({
      id: 'beat-period', difficulty: 2,
      gen(r) {
        const f0 = r.pick([20, 25, 40]), d = r.pick([0.5, 1, 2]) * r.sign(), f = f0 + d;
        const Tb = 1 / Math.abs(d);
        return {
          prompt: t`In a ground vibration test a shaker drives a lightly damped panel, whose natural frequency is ${f0} Hz, at ${nice(f)} Hz, starting from rest. Before damping smooths it out, the panel’s vibration swells and fades. How many seconds apart are the swells?`,
          answer: Tb, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 2 * Tb, feedback: t`The envelope is $|\sin(\Delta\omega\,t/2)|$: it returns to zero every $2\pi/\Delta\omega$, so the swells repeat at the beat frequency $|f_0 - f|$, not half of it.` }, { value: 1 / (f0 + f), feedback: 'That is set by the sum of the frequencies, the fast oscillation inside the envelope. The swells come from their difference.' }],
          hints: [t`From rest, the undamped solution is proportional to $\cos\omega t - \cos\omega_0t = 2\sin\dfrac{(\omega_0 - \omega)t}{2}\sin\dfrac{(\omega_0 + \omega)t}{2}$.`, t`The slow factor’s magnitude repeats every $\dfrac{2\pi}{|\omega_0 - \omega|} = \dfrac{1}{|f_0 - f|}$.`],
          teach: 'Driven near resonance from rest, a lightly damped system beats at the difference frequency |f₀ − f| until its transient dies.',
          explain: t`$|f_0 - f| = ${Math.abs(d)}$ Hz, so the swells come every $1/${Math.abs(d)} = ${nice(Tb)}$ s. The transient rings at $f_0$, the steady state at $f$; they drift in and out of step at the difference frequency, and damping slowly removes the transient.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 160], y: [-1.15, 1.15], xticks: 0, yticks: 0, aspect: 'wide', xlabel: 't', ylabel: 'panel',
              curves: [{ fn: 'exp(-0.004*x)*sin(0.08*x)*sin(1.6*x)', color: 'accent', width: 1.4 }, { fn: 'exp(-0.004*x)*abs(sin(0.08*x))', color: 'ink3', width: 1.2, dash: true }],
            },
            caption: 'A sketch of beats: a fast vibration inside a slowly swelling and fading envelope (dashed), shrinking as the transient decays. Not to scale; no numbers.',
          },
        };
      },
    }),
    num({
      id: 'beat-max', difficulty: 3,
      gen(r) {
        const m = r.pick([2, 5]), w0 = r.pick([10, 20]), W = r.pick([0.9, 0.95, 1.05, 1.1]), F0 = r.pick([1, 2, 4]);
        const w = W * w0, k = m * w0 * w0;
        const ss = F0 / (m * Math.abs(w0 * w0 - w * w)), big = 2 * ss;
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${nice(k)}$ N/m, with negligible damping, starts at rest and is driven by $${F0}\cos(${nice(w)}t)$ N. What is the largest displacement it reaches, in mm?`,
          answer: big * 1000, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: ss * 1000, feedback: t`That is the steady amplitude. From rest the motion is the steady part *minus* a free part of the same size, $\dfrac{F_0/m}{\omega_0^2 - \omega^2}(\cos\omega t - \cos\omega_0t)$, and the two line up to double it.` }],
          hints: [t`$\omega_0 = \sqrt{k/m} = ${w0}$ rad/s. Undetermined coefficients gives the steady part $\dfrac{F_0/m}{\omega_0^2 - \omega^2}\cos\omega t$; from rest, add $-\dfrac{F_0/m}{\omega_0^2 - \omega^2}\cos\omega_0t$.`, t`$\cos\omega t - \cos\omega_0t$ swings between $-2$ and $2$ once the two drift half a cycle apart.`],
          teach: 'Started from rest without damping, the transient and steady state are equal in size, so the beats peak at twice the steady amplitude.',
          explain: t`$\dfrac{F_0/m}{|\omega_0^2 - \omega^2|} = \dfrac{${F0}/${m}}{|${w0 * w0} - ${nice(w * w)}|} = ${fmt(ss * 1000, 3)}$ mm is the steady amplitude; the beats reach twice that, ${fmt(big * 1000, 3)} mm.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(Math.min(4 * Math.PI / Math.abs(1 - W), 160))], y: [-2.3, 2.3], yticks: 0, aspect: 'wide', xlabel: 'ω₀ t', ylabel: 'x (no scale)',
              curves: [{ fn: `cos(${W}*x) - cos(x)`, color: 'accent', width: 1.4 }],
              hlines: [{ y: 1, color: 'gold' }, { y: -1, color: 'gold' }],
            },
            caption: 'The motion from rest (vertical axis unnumbered). The gold lines mark the size of the steady part alone; the beats overshoot them.',
          },
        };
      },
    }),
    num({
      id: 'buildup', difficulty: 2,
      gen(r) {
        const Q = r.pick([10, 25, 50]), f0 = r.pick([2, 10, 50]);
        const w0 = 2 * Math.PI * f0, tt = (Math.log(20) * 2 * Q) / w0;
        return {
          prompt: t`A lightly damped structure with $Q = ${Q}$ and $f_0 = ${f0}$ Hz is driven exactly at resonance, starting from rest. Its amplitude grows like $A_\infty\big(1 - e^{-\zeta\omega_0t}\big)$. How long until it reaches 95% of its final value?`,
          answer: tt, units: 's', tol: { rel: 0.005 },
          errors: [
            { value: (2 * Q) / w0, feedback: t`After one time constant $1/(\zeta\omega_0)$ the amplitude is only 63% of the way. For 95%, $e^{-\zeta\omega_0t} = 0.05$.` },
            { value: (Math.log(20) * Q) / w0, feedback: t`$\zeta = 1/(2Q)$, so $\zeta\omega_0 = \omega_0/(2Q)$ — keep the 2.` },
          ],
          hints: [t`Set $e^{-\zeta\omega_0t} = 0.05$: $t = \dfrac{\ln 20}{\zeta\omega_0}$.`, t`$\zeta\omega_0 = \dfrac{\omega_0}{2Q} = \dfrac{2\pi\times${f0}}{${2 * Q}}$.`],
          teach: 'A resonance builds up on the same time scale it rings down on, 2Q/ω₀ per factor e — high-Q systems are slow to respond as well as slow to settle.',
          explain: t`$\zeta\omega_0 = \pi f_0/Q = ${fmt(w0 / (2 * Q), 3)}$ s⁻¹, so $t = \ln 20/${fmt(w0 / (2 * Q), 3)} = ${fmt(tt, 3)}$ s — about ${Math.round(tt * f0)} cycles. A frequency sweep through the resonance faster than this never sees the full peak.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 5], y: [-1.15, 1.15], xticks: 0, yticks: 0, aspect: 'wide', xlabel: 't', ylabel: 'x / A∞',
              curves: [
                { fn: '(1 - exp(-x))*sin(12*x)', color: 'accent', width: 1.4 },
                { fn: '1 - exp(-x)', color: 'gold', width: 2.2, label: 'A∞ (1 − e^(−ζω₀t))', labelAt: 2.2, labelDx: 6, labelDy: -12 },
              ],
              hlines: [{ y: 0.95, label: '95%', color: 'ink3' }],
            },
            caption: 'The build-up at resonance from rest, sketched: the oscillation (blue) fills its growing envelope (gold). Real oscillations are far more numerous; no numbers on the axes.',
          },
        };
      },
    }),
    num({
      id: 'isolation-damping', difficulty: 3,
      gen(r) {
        const W = r.pick([2.5, 3, 4]), z1 = 0.05, z2 = r.pick([0.25, 0.3, 0.4]);
        const T1 = trans(W, z1), T2 = trans(W, z2), ratio = T2 / T1;
        return {
          prompt: t`An engine mount works at $\Omega = \omega/\omega_0 = ${W}$ with damping ratio $\zeta = ${z1}$. To tame the resonance the engine passes through while starting, an engineer raises the damping to $\zeta = ${z2}$. By what factor does the force transmitted at the running speed change? (Give $T_\text{new}/T_\text{old}$.)`,
          answer: ratio, tol: { rel: 0.005 },
          errors: [{ value: 1 / ratio, feedback: t`Upside down — and the wrong direction: above $\Omega = \sqrt2$ the damper’s force $cx'$ adds to what reaches the structure, so more damping transmits *more*.` }, { value: gain(W, z2) / gain(W, z1), feedback: t`That is the ratio of displacement amplitudes. The transmitted force carries the extra factor $\sqrt{1 + (2\zeta\Omega)^2}$ from the damper.` }],
          hints: [t`$T = \dfrac{\sqrt{1 + (2\zeta\Omega)^2}}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}}$; evaluate it at both dampings.`, t`At $\Omega = ${W}$: $(1 - \Omega^2)^2 = ${nice((1 - W * W) ** 2)}$; $2\zeta\Omega$ is ${nice(2 * z1 * W)} and then ${nice(2 * z2 * W)}.`],
          teach: 'Above Ω = √2 damping makes isolation worse: it lowers the resonance peak but passes more force at the running speed.',
          explain: t`$T_\text{old} = ${fmt(T1, 3)}$ and $T_\text{new} = ${fmt(T2, 3)}$: the transmitted force grows by a factor ${fmt(ratio, 3)}. Real mounts compromise — enough damping to survive start-up, not so much that running isolation suffers — or use dampers that work only at low frequency.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 4.5], y: [0, 4], aspect: 'wide', xlabel: 'Ω = ω/ω₀', ylabel: 'transmissibility',
              curves: [
                { fn: TRANS_FN(z1), color: 'accent', width: 2.2, label: `ζ = ${z1}`, labelAt: 0.82, labelDx: -52, labelDy: -2 },
                { fn: TRANS_FN(z2), color: 'warn', width: 2.2, label: `ζ = ${z2}`, labelAt: 1.25, labelDx: 8, labelDy: -6 },
              ],
              vlines: [{ x: 1.41421, label: '√2' }, { x: W, label: 'running', color: 'gold' }],
            },
            caption: 'Force transmissibility for the old and new damping. Every curve passes through 1 at Ω = √2.',
          },
        };
      },
    }),
    num({
      id: 'pogo-crossing', difficulty: 3, transfer: true,
      gen(r) {
        const m0 = r.pick([500, 550]), md = r.pick([2.5, 3]), f0 = r.pick([4, 4.5]), ff = r.pick([5.5, 6]);
        const m = m0 * (f0 / ff) ** 2, tc = (m0 - m) / md;
        return {
          prompt: t`Treat a launcher’s lowest lengthwise vibration as a mass $m(t)$ on a fixed effective spring, so its frequency is $f = \tfrac{1}{2\pi}\sqrt{k/m}$. At lift-off $m_0 = ${m0}$ t and $f = ${f0}$ Hz; propellant burns at ${md} t/s. Its engines’ propellant feed lines resonate at ${ff} Hz. When, after lift-off, does the structure’s frequency rise to meet the feed lines’ — the coincidence that lets pogo grow?`,
          answer: tc, units: 's', tol: { rel: 0.005 },
          errors: [{ value: (m0 * (1 - f0 / ff)) / md, feedback: t`The frequency goes as $1/\sqrt m$, so the mass must fall by the *square* of the frequency ratio: $m = m_0(f_0/f)^2$.` }],
          hints: [t`$f \propto 1/\sqrt m$, so $f$ reaches ${ff} Hz when $m = m_0\,(${f0}/${ff})^2$.`, t`$m = ${m0}\times(${f0}/${ff})^2 = ${fmt(m, 4)}$ t; then $t = (m_0 - m)/\dot m$.`],
          teach: 'As propellant burns, a launcher’s structural frequencies rise and can sweep through a feed-system resonance — the setting for pogo.',
          explain: t`$m = ${m0}\,(${f0}/${ff})^2 = ${fmt(m, 4)}$ t, reached at $t = (${m0} - ${fmt(m, 4)})/${md} = ${fmt(tc, 3)}$ s. A teaching model: real stiffness changes too, and the liquid’s own sloshing and compressibility matter. Titan II and Saturn V both suffered pogo when a structural frequency met a feed-system one; detuning the feed lines with gas accumulators was the cure.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(1.25 * tc)], y: [r6(0.8 * f0), r6(1.15 * ff)], xticks: 0, aspect: 'wide', xlabel: 't after lift-off', ylabel: 'frequency (Hz)',
              curves: [{ fn: `${f0}*sqrt(${m0}/(${m0} - ${md}*x))`, color: 'accent', width: 2.4, label: 'structure', labelAt: r6(0.3 * tc), labelDx: 6, labelDy: -10 }],
              hlines: [{ y: ff, label: 'feed lines', color: 'warn' }],
            },
            caption: 'The structure’s lowest frequency rising as propellant burns (time axis unnumbered), and the feed lines’ resonance (orange). Teaching model: fixed effective stiffness.',
          },
        };
      },
    }),
    code({
      id: 'steady-numeric', difficulty: 3,
      prompt: t`Check the steady-amplitude formula numerically. Write \`steady_amplitude(zeta, W)\` that integrates $x'' + 2\zeta x' + x = \cos(Wt)$ (so $\omega_0 = 1$ and the static deflection is 1) **from rest** with \`scipy.integrate.solve_ivp\`, runs long enough for the transient to die — say to $t = 12/\zeta$ — and returns the largest $|x|$ over the last five drive periods. The formula says it should be $1/\sqrt{(1 - W^2)^2 + (2\zeta W)^2}$.`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

def steady_amplitude(zeta, W):
    # x'' = cos(W t) - 2 zeta x' - x, as a first-order system for [x, x']
    pass
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

def steady_amplitude(zeta, W):
    def rhs(t, y):
        return [y[1], np.cos(W * t) - 2 * zeta * y[1] - y[0]]
    t_end = 12 / zeta                      # the transient has fallen by e^-12
    period = 2 * np.pi / W
    t_eval = np.linspace(t_end - 5 * period, t_end, 2000)
    sol = solve_ivp(rhs, (0, t_end), [0.0, 0.0], t_eval=t_eval, rtol=1e-9, atol=1e-12)
    return np.max(np.abs(sol.y[0]))

def formula(zeta, W):
    return 1 / np.sqrt((1 - W**2)**2 + (2 * zeta * W)**2)

for zeta, W in [(0.1, 0.9), (0.05, 1.0), (0.2, 2.0)]:
    print(zeta, W, steady_amplitude(zeta, W), formula(zeta, W))`,
      tests: [
        { name: t`near resonance ($\zeta = 0.1$, $W = 0.9$) it matches the formula within 1%`, code: 'abs(steady_amplitude(0.1, 0.9) * ((1 - 0.81)**2 + 0.18**2)**0.5 - 1) < 0.01' },
        { name: t`at resonance ($\zeta = 0.05$, $W = 1$) it is close to $Q = 10$`, code: 'abs(steady_amplitude(0.05, 1.0) - 10) < 0.1' },
        { name: t`well above resonance ($\zeta = 0.2$, $W = 2$) it is about $1/3$`, code: 'abs(steady_amplitude(0.2, 2.0) * ((1 - 4)**2 + 0.8**2)**0.5 - 1) < 0.01' },
      ],
      hints: [t`Write the system as $y = [x, x']$: \`rhs\` returns \`[y[1], np.cos(W*t) - 2*zeta*y[1] - y[0]]\`.`, t`Pass \`t_eval=np.linspace(t_end - 5*period, t_end, 2000)\` to \`solve_ivp\`, then take \`np.max(np.abs(sol.y[0]))\`. Tight tolerances (\`rtol=1e-9\`) keep the long run accurate.`],
      teach: 'Integrating long enough for the transient to die, then measuring, is how any steady response — linear or not — is found numerically.',
      explain: t`The integrator knows nothing of the formula, yet after the transient has died its amplitude agrees with $1/\sqrt{(1 - W^2)^2 + (2\zeta W)^2}$: about 3.8 at $W = 0.9$, 10 at resonance with $\zeta = 0.05$ (that is $Q$), and 0.32 at $W = 2$. The same program would handle a nonlinear spring, where no formula exists.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cryocooler', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([40, 50, 60]), f0 = r.pick([6, 8, 10]), z = r.pick([0.05, 0.1]);
        const W = f / f0, T = trans(W, z);
        return {
          prompt: t`A satellite’s cryocooler compressor vibrates at ${f} Hz. To keep that out of a telescope, it sits on isolators that make it a mass on a spring with natural frequency ${f0} Hz and damping ratio ${z}. What percentage of the compressor’s vibrating force reaches the spacecraft structure?`,
          answer: 100 * T, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * gain(W, z), feedback: t`That is the displacement gain. The structure feels the spring **and** damper forces: multiply by $\sqrt{1 + (2\zeta\Omega)^2}$.` }],
          hints: [t`The structure feels the isolator’s spring and damper forces; their amplitude, as a fraction of the compressor’s force, is the transmissibility $T = \dfrac{\sqrt{1 + (2\zeta\Omega)^2}}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}}$.`, t`$\Omega = ${f}/${f0} = ${nice(W)}$, so $(1 - \Omega^2)^2 = ${nice((1 - W * W) ** 2)}$ and $(2\zeta\Omega)^2 = ${nice((2 * z * W) ** 2)}$.`],
          teach: 'An isolator passes the fraction T(Ω, ζ) of a vibrating force; far above √2·f₀ it is small.',
          explain: t`$\Omega = ${nice(W)}$, so $T = \dfrac{\sqrt{1 + ${nice((2 * z * W) ** 2)}}}{\sqrt{${nice((1 - W * W) ** 2)} + ${nice((2 * z * W) ** 2)}}} = ${fmt(T, 3)}$: about ${fmt(100 * T, 2)}%. Real spacecraft add active cancellation on top, because telescopes need even less.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(1.3 * W)], ylog: true, y: [-3, 1.2], aspect: 'wide', xlabel: 'Ω = f / f₀', ylabel: 'transmissibility',
              curves: [{ fn: `log10(${TRANS_FN(z)})`, color: 'accent', width: 2.4 }],
              vlines: [{ x: 1.41421, label: '√2' }, { x: r6(W), label: 'compressor', color: 'gold' }],
            },
            caption: 'The isolator’s transmissibility on a logarithmic scale: amplification near resonance, then a steady fall. One idealised stage; real isolators have more modes.',
          },
        };
      },
    }),
    num({
      id: 'cp-bandwidth', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.8, 1.5, 4]), f0 = r.pick([12, 30]);
        const df = 1 / (Math.PI * tau), Q = Math.PI * f0 * tau;
        return {
          prompt: t`Tapped, a satellite’s antenna reflector rings at ${f0} Hz, its amplitude falling by a factor $e$ every ${tau} s. What half-power bandwidth, in Hz, will a slow frequency sweep through this resonance show?`,
          answer: df, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: 1 / tau, feedback: t`The decay rate is $\zeta\omega_0 = 1/\tau$, and $\Delta\omega = 2\zeta\omega_0$; in hertz divide by $2\pi$: $\Delta f = 1/(\pi\tau)$.` }],
          hints: [t`$\Delta\omega = 2\zeta\omega_0 = 2/\tau$, and $\Delta f = \Delta\omega/2\pi$.`],
          teach: 'Ring-down time and bandwidth determine each other: Δf = 1/(πτ).',
          explain: t`$\Delta f = \dfrac{1}{\pi\tau} = ${fmt(df, 3)}$ Hz, a quality factor $Q = f_0/\Delta f = ${fmt(Q, 3)}$.`,
          visual: { type: 'c3-roots', params: { mode: 'forced', zeta: r6(1 / (2 * Q)), w0: 2, W: 1, T: 40, sliders: false, readout: false, panels: 'top', marks: false, yname: 'x' }, caption: 'The reflector’s resonance curve (blue) among curves for other damping (grey). Its peak rises to Q — off the top of the chart when Q is large; its width is what is asked.' },
        };
      },
    }),
    mcq({
      id: 'cp-beats-why', difficulty: 2,
      prompt: t`A lightly damped panel, driven from rest a little below its natural frequency, first swells and fades several times, then settles into a steady vibration. Why?`,
      choices: [
        t`The free motion (at $\omega_d$) and the steady response (at $\omega$) drift in and out of step, making beats; damping kills the free part, leaving the steady one`,
        'The drive’s frequency slowly changes while the panel warms up',
        'The panel’s natural frequency changes as it vibrates',
        'Damping makes the steady state itself swell and fade',
      ],
      answer: 0,
      why: {
        1: 'The drive is steady; the swells come from inside the solution.',
        2: 'A linear spring has a fixed natural frequency; nothing here changes it.',
        3: t`The steady state $A\cos(\omega t - \varphi)$ has a constant amplitude; it is the transient that fades.`,
      },
      hints: [t`Write the solution as transient plus steady state. What frequency does each have?`, t`Two sinusoids at nearby frequencies add to beats; one of them carries $e^{-\zeta\omega_0t}$.`],
      teach: 'Beats in a driven system are transient against steady state — they last only as long as the transient does.',
      explain: t`$x = e^{-\zeta\omega_0t}(\dots\cos\omega_dt\dots) + A\cos(\omega t - \varphi)$. Near resonance the two frequencies are close, so their sum beats at $|\omega_d - \omega|$; as $e^{-\zeta\omega_0t}$ shrinks, so do the beats, until only the steady state remains.`,
      visual: { type: 'c3-roots', params: { mode: 'forced', zeta: 0.02, w0: 2, W: 0.9, T: 90, sliders: false, readout: false, panels: 'motion', yname: 'x' }, caption: 'The panel’s motion from rest (blue) and its steady state (gold, dashed).' },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.6 Forced oscillations and resonance', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'NASA SP-8055, Prevention of coupled structure–propulsion instability (pogo), 1970', url: 'https://ntrs.nasa.gov/citations/19710016604' },
    { label: 'OpenStax University Physics Vol. 1, §15.6 Forced oscillations', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations' },
  ],
});
