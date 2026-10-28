// Fourier series, the physicist's way: any periodic signal is a sum of
// harmonics e^{−inω₀t} (the course's e^{−iωt} convention), each coefficient
// picked out by one integral thanks to orthogonality. Real and complex forms,
// a time delay as a turn of each cₙ, Parseval as power per harmonic, and how
// fast the coefficients fall (jumps, corners, smooth). The worked example is a
// pulsar's pulse train: a comb of harmonics under a Gaussian envelope.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tn, pn, phasorPic, curvesPic } from './_wv.js';
import { spectrumPic } from './_wv2.js';

const t = String.raw;
const SQ2LN2 = Math.sqrt(2 * Math.log(2));

// the worked example: a slow pulsar (period of PSR B0329+54) with a Gaussian pulse model
const EX = (() => {
  const P = 0.71452, sig = 0.003, f0 = 1 / P, w0 = 2 * Math.PI * f0;
  const c0 = (sig * Math.sqrt(2 * Math.PI)) / P;
  const c = (n) => c0 * Math.exp(-((n * w0 * sig) ** 2) / 2);
  const nHalf = SQ2LN2 / (w0 * sig), fHalf = SQ2LN2 / (2 * Math.PI * sig);
  return { P, sig, f0, w0, c0, c, nHalf, fHalf, c20: c(20) / c0 };
})();

// a periodic Gaussian pulse train of period 1 and rms width s, as a graph expression
const train = (s) => ({ sum: `e^(-(x - k)^2/(2*${s}^2))`, k: [-3, 3] });

export default lesson({
  id: 'phys3750.W6.1',
  title: 'Fourier series',
  minutes: 16, difficulty: 3,
  intro: t`A signal that repeats every $T$ seconds can only contain frequencies that also repeat every $T$: the fundamental $\omega_0 = 2\pi/T$ and its whole multiples, the **harmonics**. So it is a sum of them, written in this course’s convention $e^{-i\omega t}$:

$$f(t) = \sum_{n=-\infty}^{\infty} c_n\,e^{-in\omega_0t}, \qquad c_n = \frac1T\int_0^T f(t)\,e^{in\omega_0t}\,dt$$

Each coefficient comes from **one integral**, because over a period $e^{in\omega_0t}e^{-im\omega_0t}$ averages to zero unless $n = m$ — the harmonics are orthogonal, just like the mode vectors of the chain in [superposition and initial conditions](#/lesson/phys3750.W5.3). The same series drives oscillators in [periodic forcing](#/lesson/phys3550.M2.4) and solves boundary-value problems in [Fourier series solutions](#/lesson/st-b.B8.1); here it is a **spectrum**, the list of what a signal is made of.`,
  symbols: [
    { tex: 'f(t)', text: 'a periodic signal: a voltage, a pressure, a pulsar’s radio flux — anything with $f(t + T) = f(t)$' },
    { tex: 'T,\\ \\omega_0 = 2\\pi/T', text: 'the period (s) and the fundamental angular frequency (rad/s)' },
    { tex: 'n', text: 'the harmonic number, any integer; $\\pm n$ together make one real harmonic at frequency $n\\omega_0$' },
    { tex: 'c_n', text: 'the complex amplitude of harmonic $n$, in the units of $f$: its size $|c_n|$ and phase $\\arg c_n$. For a real signal $c_{-n} = c_n^*$' },
    { tex: 'c_0', text: 'the average of $f$ over a period (the DC level)' },
  ],
  why: t`Spectrum analysers, pulsar searches, audio codecs and gravitational-wave pipelines all work with $c_n$ instead of $f(t)$: in the frequency domain a linear system acts on each harmonic separately.`,
  visual: {
    type: 'graph',
    title: 'Building a signal from harmonics',
    lead: t`Three periodic signals (grey) over two periods, $t$ in units of $T$, and the sum of their first $N$ harmonics (blue). The readout compares the last harmonic’s size with the first’s.`,
    tasks: [
      t`Sawtooth: raise $N$. The sum converges, but slowly, and overshoots at every jump: there $|c_N|$ falls only like $1/N$.`,
      t`Rectified sine: by $N = 3$ the sum is hard to tell from the signal. It has corners but no jumps, and $|c_N| \propto 1/N^2$.`,
      t`Pulse train: halve the pulse width $\sigma$ and count how many harmonics you now need. A narrower pulse has a **wider** spectrum.`,
    ],
    params: {
      x: [-1, 1], y: [-1.3, 1.45], aspect: 'wide', xlabel: 't / T', ylabel: 'f', xticks: 8, yticks: 5,
      choices: [{ key: 'sh', label: 'Signal', options: [[0, 'sawtooth'], [1, 'rectified sine'], [2, 'Gaussian pulse train']], value: 0, explain: 'A jump, a corner, or perfectly smooth: the smoother the signal, the faster its coefficients fall.' }],
      sliders: [
        { key: 'N', label: 'Harmonics $N$', min: 1, max: 30, step: 1, value: 3, explain: 'How many harmonics, $n = 1 \\ldots N$ (with $-n$ and the average $c_0$), are added up.' },
        { key: 's', label: 'Pulse width $\\sigma$', min: 0.02, max: 0.2, step: 0.01, value: 0.08, unit: 'T', explain: 'Pulse train only: the rms width of each Gaussian pulse, as a fraction of the period.' },
      ],
      curves: [
        { fn: '2*(x - round(x))', color: 'ink3', width: 1.5, when: 'step(0.5 - abs(sh))' },
        { sum: '2*(-1)^(k + 1)/(pi*k)*sin(2*pi*k*x)*step(N + 0.5 - k)', k: [1, 30], color: 'accent', width: 2.2, when: 'step(0.5 - abs(sh))' },
        { fn: 'abs(sin(pi*x))', color: 'ink3', width: 1.5, when: 'step(0.5 - abs(sh - 1))' },
        { sum: '(2/pi)*step(0.5 - k) - (4/pi)*cos(2*pi*k*x)/(4*k^2 - 1)*step(k - 0.5)*step(N + 0.5 - k)', k: [0, 30], color: 'accent', width: 2.2, when: 'step(0.5 - abs(sh - 1))' },
        { sum: 'e^(-(x - k)^2/(2*s^2))', k: [-3, 3], color: 'ink3', width: 1.5, when: 'step(0.5 - abs(sh - 2))' },
        { sum: 's*sqrt(2*pi)*(2 - step(0.5 - k))*e^(-(2*pi*k*s)^2/2)*cos(2*pi*k*x)*step(N + 0.5 - k)', k: [0, 30], color: 'accent', width: 2.2, when: 'step(0.5 - abs(sh - 2))' },
      ],
      readouts: [{ label: t`$|c_N| / |c_1|$`, expr: 'step(0.5 - abs(sh))/N + step(0.5 - abs(sh - 1))*3/(4*N^2 - 1) + step(0.5 - abs(sh - 2))*e^(-(2*pi*s)^2*(N^2 - 1)/2)', digits: 3, zero: 0 }],
    },
    caption: t`Each signal has period $T$ and peak height 1. The sawtooth’s near-vertical line is drawn where it jumps. Sums are exact partial sums of each signal’s series.`,
  },
  example: {
    prompt: t`A radio pulsar with period $P = ${EX.P}$ s (that of PSR B0329+54) sends one pulse per turn. Model each pulse as a Gaussian of rms width $\sigma = ${EX.sig * 1e3}$ ms and peak 1: $f(t) = \sum_m e^{-(t - mP)^2/2\sigma^2}$. Find its Fourier coefficients, and how many harmonics are at least half as strong as $c_0$.`,
    steps: [
      { label: 'The comb', text: t`The signal repeats every $P$, so its harmonics sit at $nf_0$ with $f_0 = 1/P = ${tn(EX.f0, 4)}$ Hz: a comb of lines ${tn(EX.f0, 3)} Hz apart.` },
      { label: 'Unfold the integral', text: t`$c_n = \frac1P\int_{-P/2}^{P/2}\sum_m e^{-(t - mP)^2/2\sigma^2}e^{in\omega_0t}\,dt$. Shifting each image by $mP$ changes $e^{in\omega_0t}$ by $e^{in\omega_0mP} = e^{2\pi inm} = 1$, so the images’ pieces tile the whole line: $c_n = \frac1P\int_{-\infty}^{\infty}e^{-t^2/2\sigma^2}e^{in\omega_0t}\,dt$.` },
      { label: 'One Gaussian integral', text: t`$\int e^{-t^2/2\sigma^2}e^{i\Omega t}\,dt = \sigma\sqrt{2\pi}\,e^{-\Omega^2\sigma^2/2}$, so $c_n = \dfrac{\sigma\sqrt{2\pi}}{P}\,e^{-(n\omega_0\sigma)^2/2}$ — real, because the pulse is symmetric about $t = 0$.` },
      { label: 'Numbers', text: t`$c_0 = \sigma\sqrt{2\pi}/P = ${tn(EX.c0, 3)}$: the average flux is about 1% of the peak, the pulse’s duty cycle. At $n = 20$, $c_{20}/c_0 = ${tn(EX.c20, 3)}$.` },
      { label: 'Half strength', text: t`$e^{-(n\omega_0\sigma)^2/2} = \tfrac12$ at $n = \sqrt{2\ln 2}/(\omega_0\sigma) = ${tn(EX.nHalf, 3)}$, i.e. at $f = \sqrt{2\ln2}/(2\pi\sigma) = ${tn(EX.fHalf, 3)}$ Hz.` },
      { label: 'Sense check', text: t`The envelope’s width in frequency, $\sim 1/(2\pi\sigma)$, depends only on the pulse width, not on the period: a narrow pulse has a wide spectrum. The period only sets the spacing of the comb.` },
    ],
    answer: t`$c_n = \dfrac{\sigma\sqrt{2\pi}}{P}e^{-(n\omega_0\sigma)^2/2}$; the first ${Math.floor(EX.nHalf)} harmonics (up to about ${Math.round(EX.fHalf)} Hz) are above half of $c_0$. Pulsar searches add these harmonics’ power together (“harmonic summing”) to dig a faint pulsar out of the noise.`,
    visual: spectrumPic(
      Array.from({ length: 31 }, (_, j) => ({ x: 4 * j * EX.f0, y: EX.c(4 * j) / EX.c0 })),
      [-3, 180], [0, 1.15], t`Every fourth harmonic of the model pulsar, $c_n/c_0$ against frequency (the comb is four times denser than drawn), under the Gaussian envelope (dashed). Model pulse; real pulse profiles are not exact Gaussians.`,
      { xlabel: 'frequency (Hz)', ylabel: 'cₙ / c₀', curves: [{ fn: `e^(-(2*pi*x*${EX.sig})^2/2)`, color: 'gold', dash: [5, 4], width: 1.5 }], params: { hlines: [{ y: 0.5, label: 'half', color: 'ink3' }] }, r: 2.5, width: 1.4 },
    ),
  },
  practice: [
    mcq({
      id: 'orthogonal', difficulty: 2,
      prompt: t`Why does the integral $c_n = \frac1T\int_0^T f(t)\,e^{in\omega_0t}\,dt$ pick out harmonic $n$ alone, when $f$ contains every harmonic at once?`,
      visual: curvesPic([{ fn: 'cos(2*2*pi*x)*cos(3*2*pi*x)', color: 'accent' }], [0, 1], [-1.2, 1.2], t`The product of harmonics 2 and 3 over one period: the shaded area above the axis equals the area below.`, { xlabel: 't / T', ylabel: '', shade: [{ fn: 'cos(2*2*pi*x)*cos(3*2*pi*x)', from: 0, to: 1, color: 'accent', alpha: 0.2 }] }),
      choices: [
        t`Over a whole period, $e^{i(n - m)\omega_0t}$ averages to zero unless $m = n$, so every other harmonic integrates away`,
        t`The higher harmonics are much smaller than harmonic $n$, so their contributions are negligible`,
        t`The integral only works for signals that contain a single harmonic, so it cannot be used here`,
        t`Multiplying by $e^{in\omega_0t}$ removes all frequencies below $n\omega_0$ and keeps those above it`,
      ],
      answer: 0,
      why: {
        1: t`No size argument is needed: harmonic $m \ne n$ contributes **exactly** zero, however large it is.`,
        2: t`The integral is designed for a sum of many harmonics; orthogonality is what makes it work term by term.`,
        3: t`Multiplying shifts every frequency by $n\omega_0$; it removes nothing. The averaging over a period then keeps only the term that was shifted to zero frequency.`,
      },
      hints: [t`Put $f = \sum_m c_me^{-im\omega_0t}$ into the integral.`, t`$\frac1T\int_0^Te^{i(n - m)\omega_0t}\,dt$: for $n \ne m$ this is a whole number of turns around the unit circle.`],
      teach: t`Orthogonality: $\frac1T\int_0^Te^{i(n - m)\omega_0t}\,dt = 1$ if $n = m$, else 0 — so each $c_n$ is one integral.`,
      explain: t`Multiplying by $e^{in\omega_0t}$ turns harmonic $n$ into a constant and leaves every other harmonic still turning a whole number of times per period, averaging to zero — like the picture, where the area above the axis cancels the area below.`,
    }),
    num({
      id: 'sawtooth-n', difficulty: 2,
      gen(r) {
        const V = r.pick([2, 3, 5, 8]), n = r.int(2, 5);
        const A = (2 * V) / (Math.PI * n);
        return {
          prompt: t`An old radar display’s sweep voltage ramps linearly from $-${V}$ V to $+${V}$ V over each period and snaps back: a sawtooth, $f(t) = ${2 * V}\,t/T$ for $-T/2 < t < T/2$. Its series is $\sum_{n \ge 1} b_n\sin n\omega_0t$ with $b_n = (-1)^{n+1}\,\dfrac{2V}{\pi n}$. What is the amplitude $|b_{${n}}|$ of harmonic ${n}, in V?`,
          visual: curvesPic([
            { fn: `${V}*2*(x - round(x))`, color: 'ink3', width: 1.5 },
            { sum: `${(2 * V) / Math.PI}*(-1)^(k + 1)/k*sin(2*pi*k*x)`, k: [1, n], color: 'accent', width: 2.2 },
          ], [-1, 1], [-V * 1.35, V * 1.35], t`The sweep (grey) and the sum of its first ${n} harmonics (blue), voltage in V against $t/T$.`, { xlabel: 't / T', ylabel: 'V' }),
          answer: A, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (4 * V) / (Math.PI * n), feedback: t`That is twice too big: with peak $V$, $b_n = 2V/(\pi n)$ — the $4/\pi$ belongs to the square wave.` }, { value: V / (Math.PI * n), feedback: t`The ramp goes from $-V$ to $+V$, so its peak is $V$: $b_n = 2V/(\pi n)$.` }],
          hints: [t`Substitute $V = ${V}$ V and $n = ${n}$.`, t`$|b_n| = 2V/(\pi n)$.`],
          teach: t`A signal with a jump has harmonics that fall only like $1/n$.`,
          explain: t`$|b_{${n}}| = 2(${V})/(${n}\pi) = ${tn(A)}$ V. The slow $1/n$ fall-off is the signature of the jump at each snap-back.`,
        };
      },
    }),
    num({
      id: 'rectifier', difficulty: 2,
      gen(r) {
        const [Vr, fm] = r.pick([[230, 50], [120, 60], [240, 50]]);
        const Vp = Vr * Math.SQRT2, A = (4 * Vp) / (3 * Math.PI);
        return {
          prompt: t`A full-wave rectifier turns ${Vr} V rms, ${fm} Hz mains (peak $V_p = ${tn(Vp, 4)}$ V) into $|V_p\sin(2\pi f t)|$, whose series is $V_p\left[\dfrac2\pi - \dfrac4\pi\sum_{n \ge 1}\dfrac{\cos(4\pi nft)}{4n^2 - 1}\right]$. What is the amplitude of its lowest ripple harmonic, in V?`,
          visual: curvesPic([{ fn: `${tn(Vp, 4)}*abs(sin(pi*x))`, color: 'accent' }], [0, 3], [0, Vp * 1.2], t`The rectified voltage against $t$ in half-cycles of the mains, with its average (dashed).`, { xlabel: 't (half-cycles)', ylabel: 'V', hlines: [{ y: (2 * Vp) / Math.PI, color: 'gold', label: 'average' }] }),
          answer: A, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (2 * Vp) / Math.PI, feedback: t`That is $c_0$, the average (DC) level, not a ripple harmonic.` }, { value: (4 * Vp) / Math.PI, feedback: t`Divide by $4n^2 - 1 = 3$ for $n = 1$.` }],
          hints: [t`The lowest ripple harmonic is $n = 1$, at $${2 * fm}$ Hz — twice the mains frequency.`, t`Its amplitude is $\dfrac{4V_p}{\pi(4 - 1)}$.`],
          teach: t`A rectified sine has corners but no jumps, so its harmonics fall like $1/n^2$; the lowest ripple sits at twice the mains frequency.`,
          explain: t`$\dfrac{4V_p}{3\pi} = \dfrac{4(${tn(Vp, 4)})}{3\pi} = ${tn(A)}$ V at ${2 * fm} Hz, on top of an average of $${tn((2 * Vp) / Math.PI)}$ V. A smoothing capacitor is chosen to kill exactly this line.`,
        };
      },
    }),
    expr({
      id: 'complex-to-real', difficulty: 3,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-3, 3, [0]), n = r.int(2, 4), w0 = r.pick([5, 10, 50]);
        const W = n * w0;
        return {
          prompt: t`A real signal with $\omega_0 = ${w0}$ rad/s has $c_{${n}} = ${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i$ (and so $c_{-${n}} = c_{${n}}^*$). Write the real term $c_{${n}}e^{-i${n}\omega_0t} + c_{-${n}}e^{i${n}\omega_0t}$ as a function of $t$.`,
          visual: phasorPic(a, b, t`The complex amplitude $c_{${n}}$ in the complex plane, with its real and imaginary parts.`, { name: `c${'₀₁₂₃₄'[n]}`, parts: [`${a}`, `${b}i`] }),
          answer: `${2 * a}*cos(${W}*t) + (${2 * b})*sin(${W}*t)`,
          answerTeX: t`${2 * a}\cos(${W}t) ${b < 0 ? '-' : '+'} ${Math.abs(2 * b)}\sin(${W}t)`,
          vars: { t: [0, 1] },
          errors: [
            { answer: `${2 * a}*cos(${W}*t) - (${2 * b})*sin(${W}*t)`, feedback: t`With $e^{-i\theta}$, $\operatorname{Re}\big[(a + ib)(\cos\theta - i\sin\theta)\big] = a\cos\theta + b\sin\theta$: the sine term keeps the sign of $b$. (The minus sign belongs to the $e^{+i\omega t}$ convention.)` },
            { answer: `${a}*cos(${W}*t) + (${b})*sin(${W}*t)`, feedback: t`The two terms $\pm${n}$ are complex conjugates; together they make **twice** the real part.` },
          ],
          hints: [t`$c\,e^{-i\theta} + c^*e^{i\theta} = 2\operatorname{Re}\big(c\,e^{-i\theta}\big)$ with $\theta = ${n}\omega_0t = ${W}t$.`, t`$\operatorname{Re}\big[(a + ib)(\cos\theta - i\sin\theta)\big] = a\cos\theta + b\sin\theta$.`],
          teach: t`Real signal: $c_ne^{-in\omega_0t} + c_{-n}e^{in\omega_0t} = 2\operatorname{Re}(c_n)\cos n\omega_0t + 2\operatorname{Im}(c_n)\sin n\omega_0t$.`,
          explain: t`$2\operatorname{Re}\big[(${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i)e^{-i${W}t}\big] = ${2 * a}\cos(${W}t) ${b < 0 ? '-' : '+'} ${Math.abs(2 * b)}\sin(${W}t)$. The size $|c_{${n}}| = ${tn(Math.hypot(a, b))}$ gives the amplitude $${tn(2 * Math.hypot(a, b))}$; the angle of the arrow gives the phase.`,
        };
      },
    }),
    {
      type: 'point', id: 'delay-turns', difficulty: 3,
      gen(r) {
        const m = r.pick([0.6, 0.8]), n = r.pick([1, 2]), [num_, den] = r.pick([[1, 12], [1, 8], [1, 6]]);
        const ang = 2 * Math.PI * n * (num_ / den), x = m * Math.cos(ang), y = m * Math.sin(ang);
        return {
          prompt: t`An even signal has the real coefficient $c_{${n}} = ${m}$ (the arrow). The signal is delayed by $t_0 = T/${den}$: $g(t) = f(t - t_0)$. Drag the point to $g$’s coefficient $c_{${n}}$. (Write $g = \sum c_ne^{-in\omega_0(t - t_0)}$.)`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, 1], y: [-1, 1], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im', xticks: 4, yticks: 4,
              curves: [{ param: [`${m}*cos(t)`, `${m}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1, dash: [3, 4] }],
              arrows: [{ from: [0, 0], to: [m, 0], color: 'accent', width: 2.5, label: `c${'₀₁₂'[n]} of f`, labelDx: -10, labelDy: 14 }],
              drag: [{ key: 'p', x: -0.5, y: -0.5, snap: 0.01 }],
            },
            caption: t`The complex plane; the dashed circle has radius $|c_{${n}}|$.`,
          },
          answer: { x, y }, tol: { x: 0.08, y: 0.08 },
          instruction: 'Drag the point to the delayed coefficient, then check.',
          hints: [t`$e^{-in\omega_0(t - t_0)} = e^{-in\omega_0t}\,e^{in\omega_0t_0}$: each coefficient is multiplied by $e^{in\omega_0t_0}$.`, t`$n\omega_0t_0 = ${n} \cdot 2\pi/${den}$ rad: turn the arrow anticlockwise by that angle, keeping its length.`],
          teach: t`A delay $t_0$ leaves every $|c_n|$ alone and turns $c_n$ by the angle $n\omega_0t_0$ — higher harmonics turn further.`,
          explain: t`$c_{${n}} \to ${m}\,e^{i${n}\cdot 2\pi/${den}}$: angle $${tn((ang * 180) / Math.PI)}^\circ$, so the point $(${tn(x)}, ${tn(y)})$. The spectrum $|c_n|$ cannot tell when a signal happened; the phases can.`,
        };
      },
    },
    num({
      id: 'parseval', difficulty: 3,
      gen(r) {
        const n = r.int(1, 4);
        let frac = 0; for (let k = 1; k <= n; k++) frac += 6 / (Math.PI * Math.PI * k * k);
        return {
          prompt: t`A sawtooth of peak $V$ has mean square $\langle f^2\rangle = V^2/3$ and harmonics $b_k = (-1)^{k+1}\,2V/(\pi k)$. A real harmonic $b_k\sin k\omega_0t$ has mean square $b_k^2/2$ (Parseval). What fraction of the signal’s power is in its first ${n === 1 ? 'harmonic' : `${n} harmonics`}? Give 3 significant figures.`,
          visual: spectrumPic(Array.from({ length: 8 }, (_, j) => ({ x: j + 1, y: 6 / (Math.PI * Math.PI * (j + 1) ** 2) })), [0, 8.7], [0, 0.72], t`Each harmonic’s share of the sawtooth’s power, $(b_k^2/2)/\langle f^2\rangle$.`, { ylabel: 'share of power' }),
          answer: frac, tol: { rel: 0.004 },
          errors: [{ value: frac / 2, feedback: t`A sine of amplitude $b$ has mean square $b^2/2$, not $b^2/4$.` }, ...(n > 1 ? [{ value: 6 / (Math.PI * Math.PI * n * n), feedback: t`That is harmonic ${n} alone; add the shares of harmonics 1 to ${n}.` }] : [])],
          hints: [t`Share of harmonic $k$: $\dfrac{(2V/\pi k)^2/2}{V^2/3} = \dfrac{6}{\pi^2k^2}$.`, t`Add $k = 1$ to ${n}.`],
          teach: t`Parseval: the mean square of a signal is the sum of its harmonics’ mean squares, $\langle f^2\rangle = \sum_n |c_n|^2$.`,
          explain: t`$\sum_{k=1}^{${n}}\dfrac{6}{\pi^2k^2} = ${tn(frac, 4)}$. All of them together give $\frac{6}{\pi^2}\sum 1/k^2 = \frac{6}{\pi^2}\cdot\frac{\pi^2}{6} = 1$, as they must.`,
        };
      },
    }),
    mcq({
      id: 'falloff', difficulty: 3,
      prompt: t`A periodic signal’s measured spectrum falls off as $|c_n| \propto 1/n^2$ at high $n$, as pictured. What does that tell you about the signal?`,
      visual: spectrumPic(Array.from({ length: 10 }, (_, j) => ({ x: j + 1, y: 1 / (j + 1) ** 2 })), [0, 10.7], [0, 1.15], t`Harmonic sizes $|c_n|/|c_1|$ falling like $1/n^2$.`),
      choices: [
        t`It is continuous but has corners — kinks where its slope jumps`,
        t`It has jumps, where the signal itself changes suddenly`,
        t`It is perfectly smooth, with every derivative continuous`,
        t`It is a train of very short spikes, almost delta functions`,
      ],
      answer: 0,
      why: {
        1: t`A jump gives coefficients falling only like $1/n$ (the sawtooth).`,
        2: t`A signal with every derivative continuous has coefficients falling faster than any power of $1/n$ — like the Gaussian pulse train’s $e^{-(n\omega_0\sigma)^2/2}$.`,
        3: t`A train of spikes has a flat spectrum, $|c_n|$ nearly the same for every $n$ up to $1/(\text{spike width})$.`,
      },
      hints: [t`Integrate $c_n$ by parts: each integration by parts brings out a factor $1/(in\omega_0)$ and a derivative of $f$.`, t`If $f$ is continuous but $f'$ jumps, the first integration by parts leaves no boundary term but the second does.`],
      teach: t`Each continuous derivative buys one more power of $1/n$: a jump in $f$ gives $1/n$, a jump in $f'$ (a corner) gives $1/n^2$, smooth gives faster than any power.`,
      explain: t`The rectified sine and the triangle wave are examples. It works the other way too: a measured spectrum tells you how sharp a signal’s features are, without ever looking at $f(t)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-msp', difficulty: 3, transfer: true,
      gen(r) {
        const sig = r.pick([0.05, 0.08, 0.12, 0.2]);    // ms
        const fh = SQ2LN2 / (2 * Math.PI * sig * 1e-3);
        return {
          prompt: t`The millisecond pulsar PSR J0437−4715 turns every 5.757 ms. Model its pulse as a Gaussian of rms width $\sigma = ${sig}$ ms. Above what frequency are its harmonics weaker than half of $c_0$? Give Hz.`,
          visual: curvesPic([train(sig / 5.757)], [-1.5, 1.5], [-0.1, 1.25], t`The model pulse train, flux against $t$ in pulse periods (not the real pulse profile).`, { xlabel: 't / P', ylabel: 'flux' }),
          answer: fh, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: fh * 2 * Math.PI, feedback: t`That is an angular frequency in rad/s; divide by $2\pi$.` }, { value: 1 / (2 * Math.PI * sig * 1e-3), feedback: t`Set $e^{-(\omega\sigma)^2/2} = \tfrac12$: the factor $\sqrt{2\ln 2} = ${tn(SQ2LN2, 4)}$ is missing.` }],
          hints: [t`$c_n/c_0 = e^{-(n\omega_0\sigma)^2/2}$, and $n\omega_0 = 2\pi f$ is the harmonic’s angular frequency.`, t`Solve $(2\pi f\sigma)^2/2 = \ln 2$: $f = \sqrt{2\ln 2}/(2\pi\sigma)$.`],
          teach: t`The width of a pulse train’s spectrum, $\sim 1/(2\pi\sigma)$, is set by the pulse width; the period only spaces the comb.`,
          explain: t`$f = ${tn(SQ2LN2, 4)}/(2\pi \times ${tn(sig * 1e-3)}\ \text{s}) = ${tn(fh)}$ Hz — about harmonic $${Math.floor(fh * 5.757e-3)}$ of $f_0 = ${tn(1 / 5.757e-3, 4)}$ Hz. The period never entered.`,
        };
      },
    }),
    mcq({
      id: 'cp-halfwave', difficulty: 2,
      prompt: t`An inverter’s output satisfies $f(t + T/2) = -f(t)$: the second half of every cycle is the first half upside down (pictured). Which harmonics can it contain?`,
      visual: curvesPic([{ fn: 'sin(2*pi*x) + 0.3*sin(6*pi*x)', color: 'accent' }], [0, 2], [-1.4, 1.4], t`Two periods of a half-wave-symmetric signal.`, { xlabel: 't / T', ylabel: 'f' }),
      choices: ['Only the odd harmonics, n = 1, 3, 5, …', 'Only the even harmonics, n = 2, 4, 6, …', 'Every harmonic, but with no average (DC) term', 'Only the fundamental, n = 1'],
      answer: 0,
      why: {
        1: t`An even harmonic is unchanged by a half-period shift, $e^{-i2m\omega_0T/2} = 1$, so it cannot flip sign as the signal does.`,
        2: t`The DC term is indeed absent, but so is every even harmonic: shifting by $T/2$ multiplies $c_n$ by $(-1)^n$, and the signal demands $-1$.`,
        3: t`The picture already contains a third harmonic; nothing forbids $n = 3, 5, \ldots$`,
      },
      hints: [t`Shifting $t \to t + T/2$ multiplies harmonic $n$ by $e^{-in\omega_0T/2} = e^{-in\pi} = (-1)^n$.`, t`The condition needs $(-1)^nc_n = -c_n$ for every $n$.`],
      teach: t`Half-wave symmetry, $f(t + T/2) = -f(t)$, keeps only odd harmonics.`,
      explain: t`$(-1)^nc_n = -c_n$ forces $c_n = 0$ for every even $n$ (including $n = 0$). That is why a well-made inverter or a symmetric square wave has a spectrum of odd harmonics only.`,
    }),
    num({
      id: 'cp-mean', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([0.25, 0.5, 1.2]), sig = r.pick([2, 4, 6]), S = r.pick([5, 10, 40]);
        const c0 = (S * sig * 1e-3 * Math.sqrt(2 * Math.PI)) / P;
        return {
          prompt: t`A pulsar with period ${P} s has Gaussian pulses of rms width ${sig} ms and peak flux density ${S} mJy. A radio telescope that cannot resolve the pulses measures only the average. What does it measure, in mJy?`,
          visual: curvesPic([train((sig * 1e-3) / P)], [-1.5, 1.5], [-0.1, 1.25], t`The model pulse train, flux in units of the peak against $t$ in periods; the average is the area under one pulse divided by the period.`, { xlabel: 't / P', ylabel: 'flux / peak' }),
          answer: c0, tol: { rel: 0.01 },
          errors: [{ value: S / 2, feedback: t`Averaging a narrow pulse is not halving it: $c_0$ is the area under one pulse divided by the period.` }, { value: (S * sig * 1e-3) / P, feedback: t`The area under a Gaussian of rms width $\sigma$ and peak $S$ is $S\sigma\sqrt{2\pi}$, not $S\sigma$.` }],
          hints: [t`The average is $c_0 = \frac1P\int_0^P f\,dt$.`, t`Area under one pulse: $S\sigma\sqrt{2\pi}$.`],
          teach: t`$c_0$ is the time average: for a pulse train, (area of one pulse)/(period).`,
          explain: t`$c_0 = ${S} \times ${tn(sig * 1e-3)}\sqrt{2\pi}/${P} = ${tn(c0)}$ mJy. This is how pulsar catalogues quote flux densities: averaged over the whole turn.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 8: Fourier Analysis (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Lorimer & Kramer, Handbook of Pulsar Astronomy (CUP, 2005), §6.1: harmonic summing', url: 'https://www.cambridge.org/9780521828239' },
    { label: 'ATNF Pulsar Catalogue (Manchester et al. 2005): periods of B0329+54 and J0437−4715', url: 'https://www.atnf.csiro.au/research/pulsar/psrcat/' },
  ],
});
