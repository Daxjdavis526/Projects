// Amplitude, frequency and phase — y = A sin(ωt + φ) + D: four numbers fix every sinusoid.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { PI, piTeX, trigGraph } from './_m0trig.js';

const t = String.raw;
// the AC example: US mains, 120 V rms, so 170 V peak, 60 Hz, phase π/3
const AC = { A: 170, w: 120 * PI, phi: PI / 3 };

export default lesson({
  id: 'm0.M0-7.5',
  title: 'Amplitude, frequency and phase',
  minutes: 10, difficulty: 2,
  intro: t`Every steady oscillation is the sine curve stretched, squeezed and slid. Four numbers do it:

$$y(t) = A\sin(\omega t + \varphi) + D$$

$A$ stretches the heights (the **amplitude**), $D$ lifts the midline, $\omega$ squeezes time — one cycle now takes $T = 2\pi/\omega$ — and the **phase** $\varphi$ slides the wave. Two traps, both from [transformations of graphs](#/lesson/m0.M0-4.2): $\sin 3t$ has a *shorter* period, $2\pi/3$, not $6\pi$; and $\sin(\omega t + \varphi)$ is shifted *left* — earlier — by $\varphi/\omega$, not by $\varphi$, because the phase is an angle and the shift is a time. Physics texts often write the same thing with a cosine, $A\cos(\omega t + \varphi)$, as in [SHM and circular motion](#/lesson/phys2210.M15.4); the two differ only by a quarter-turn of phase.`,
  symbols: [
    { tex: 'A', text: 'the **amplitude**: the largest distance from the midline, in the units of $y$' },
    { tex: '\\omega', text: 'the **angular frequency**, in rad/s: how fast the phase angle grows; $\\omega = 2\\pi f$' },
    { tex: 'f', text: 'the **frequency**, in Hz (cycles per second); $f = 1/T$' },
    { tex: 'T', text: 'the **period**, in s: the time for one cycle, $T = 2\\pi/\\omega$' },
    { tex: 't', text: 'time, in s' },
    { tex: '\\varphi', text: 'the **phase constant**, in rad: the angle the oscillation has already reached at $t = 0$' },
    { tex: 'D', text: 'the **midline** (offset): the level the oscillation swings about, in the units of $y$' },
  ],
  why: t`Signals, vibrations, tides, AC power and light are all described by these four numbers. Engineers read them straight off an oscilloscope, and comparing the phases of two signals — which one leads, by how much — is how you diagnose circuits, aim antennas and measure vibrations.`,
  visual: {
    type: 'graph',
    title: 'Four knobs on a sine wave',
    lead: t`The dashed curve is $\sin(2\pi t)$, one cycle per second. The blue one is $A\sin(2\pi f t + \varphi) + D$; the gold dot marks its first peak. Move one slider at a time.`,
    tasks: [
      t`Double $f$: two cycles fit where one did, and the period readout halves. The amplitude is untouched.`,
      t`Raise $\varphi$ to $\pi/2 \approx 1.57$: the wave slides **left** by a quarter cycle and becomes a cosine. The time shift is $\varphi/\omega$, smaller when $f$ is larger.`,
      t`Change $D$: the whole wave rides up or down; peaks are at $D + A$, troughs at $D - A$.`,
    ],
    params: {
      x: [-0.05, 3.05], y: [-4.2, 4.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'y',
      sliders: [
        { key: 'A', label: t`Amplitude $A$`, min: 0.2, max: 3, step: 0.1, value: 1.5, explain: t`Multiplies every height: peaks at $D + A$.` },
        { key: 'f', label: t`Frequency $f$`, min: 0.25, max: 3, step: 0.05, value: 1, unit: '\\text{Hz}', explain: t`Cycles per second; $\omega = 2\pi f$.` },
        { key: 'phi', label: t`Phase $\varphi$`, min: -3.14, max: 3.14, step: 0.01, value: 0, unit: '\\text{rad}', explain: t`The angle already reached at $t = 0$: positive $\varphi$ slides the wave earlier (left).` },
        { key: 'D', label: t`Midline $D$`, min: -1.5, max: 1.5, step: 0.1, value: 0, explain: t`Added to every value: the level the wave swings about.` },
      ],
      curves: [{ fn: 'sin(2*pi*x)', color: 'ink3', dash: true, width: 1.4 }, { fn: 'A*sin(2*pi*f*x + phi) + D', color: 'accent' }],
      hlines: [{ y: 'D', color: 'ink3' }],
      points: [{ x: '(pi/2 - phi - 2*pi*floor((pi/2 - phi)/(2*pi)))/(2*pi*f)', y: 'A + D', color: 'gold', r: 5 }],
      readouts: [
        { label: t`period $T = 1/f$`, expr: '1/f', unit: '\\text{s}', digits: 3 },
        { label: t`$\omega = 2\pi f$`, expr: '2*pi*f', unit: '\\text{rad/s}', digits: 3 },
        { label: t`shift left $\varphi/\omega$`, expr: 'phi/(2*pi*f)', unit: '\\text{s}', digits: 3 },
      ],
    },
    caption: t`Exact. The gold dot is the first peak at or after $t = 0$; the thin dashed line is the midline $y = D$.`,
  },
  example: {
    prompt: t`A US wall socket supplies $v(t) = 170\sin\!\left(120\pi t + \tfrac{\pi}{3}\right)$ volts, with $t$ in seconds. Find the amplitude, the frequency, the period, and when the voltage first peaks after $t = 0$.`,
    visual: { type: 'graph', params: { x: [-0.0012, 0.0345], y: [-215, 215], aspect: 'wide', xlabel: 't (s)', ylabel: 'v (V)', curves: [{ fn: '170*sin(120*pi*x)', color: 'ink3', dash: true, width: 1.4 }, { fn: '170*sin(120*pi*x + pi/3)', color: 'accent' }], points: [{ x: N(1 / 720), y: 170, color: 'gold', r: 5, label: 'first peak', labelDx: 8, labelDy: -10 }] }, caption: t`The supply voltage (blue) and the same wave with zero phase (dashed). Real mains voltage is close to, but not exactly, a pure sinusoid.` },
    steps: [
      { label: 'Amplitude', text: t`$A = 170$ V: the voltage swings between $+170$ and $-170$ V. (The “$120$ V” on the label is the rms value, $170/\sqrt2$.)` },
      { label: 'Frequency', text: t`$\omega = 120\pi = ${sig(AC.w, 4)}$ rad/s, so $f = \dfrac{\omega}{2\pi} = 60$ Hz and $T = \dfrac{1}{f} = ${sig(1000 / 60, 3)}$ ms.` },
      { label: 'Phase as a time', text: t`The phase $\tfrac{\pi}{3}$ puts the wave ahead of $170\sin(120\pi t)$ by $\dfrac{\varphi}{\omega} = \dfrac{\pi/3}{120\pi} = \dfrac{1}{360}\ \text{s} = ${sig(1000 / 360, 3)}$ ms — a sixth of a period.` },
      { label: 'First peak', text: t`A sine peaks when its angle is $\tfrac{\pi}{2}$: $120\pi t + \tfrac{\pi}{3} = \tfrac{\pi}{2}$ gives $t = \dfrac{\pi/6}{120\pi} = \dfrac{1}{720}$ s $= ${sig(1000 / 720, 3)}$ ms.` },
      { label: 'Check', text: t`Without the phase the peak would be a quarter period in, at $${sig(1000 / 240, 3)}$ ms; $${sig(1000 / 240, 3)} - ${sig(1000 / 360, 3)} = ${sig(1000 / 720, 3)}$ ms ✓.` },
    ],
    answer: t`$A = 170$ V, $f = 60$ Hz, $T = ${sig(1000 / 60, 3)}$ ms; first peak at $t = 1/720$ s $\approx ${sig(1000 / 720, 3)}$ ms.`,
  },
  practice: [
    num({
      id: 'period-k', difficulty: 1,
      gen(r) {
        const [k, kT] = r.pick([[3, '3'], [4, '4'], [6, '6'], [0.5, '\\tfrac12'], [5, '5']]), ans = (2 * PI) / k;
        return {
          prompt: t`What is the period of $y = \sin(${kT}x)$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * PI * k, feedback: t`Multiplying the input by $${kT}$ makes the wave run $${kT}$ times *faster*, so the period is $2\pi$ **divided** by $${kT}$.` }, { value: k / (2 * PI), feedback: t`Upside down: the period is $2\pi/k$.` }],
          hints: [t`One cycle ends when the angle $${kT}x$ has grown by $2\pi$.`],
          teach: t`$\sin(kx)$ has period $2\pi/k$: a bigger $k$ squeezes the wave.`,
          explain: t`$${kT}x = 2\pi$ at $x = 2\pi/${kT} = ${piTeX(ans) ?? sig(ans, 4)} \approx ${sig(ans, 4)}$.`,
          visual: trigGraph({ curves: [{ fn: 'sin(x)', color: 'ink3', dash: true, width: 1.3 }, { fn: `sin(${k}*x)`, color: 'accent' }], lo: 0, hi: 4 * PI, step: PI, caption: t`$y = \sin x$ (dashed) and $y = \sin(${kT}x)$ (blue).` }),
        };
      },
    }),
    num({
      id: 'amp-midline', difficulty: 2,
      gen(r) {
        const D = r.pick([1, 2, -1, 3]), A = r.pick([1.5, 2, 2.5, 3]), w = r.pick([1, 2]), ask = r.pick(['A', 'D']), hi = D + A, lo = D - A;
        const ans = ask === 'A' ? A : D;
        return {
          prompt: t`A sinusoid swings between a maximum of $${hi}$ and a minimum of $${lo}$. What is its ${ask === 'A' ? 'amplitude $A$' : 'midline $D$'}?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: (ask === 'A' ? [{ value: hi - lo, feedback: t`$${hi} - (${lo}) = ${hi - lo}$ is the peak-to-peak swing. The amplitude is measured from the midline: half of it.` }, { value: hi, feedback: t`The maximum is $D + A$, not $A$: the midline is at $${D}$.` }] : [{ value: (hi - lo) / 2, feedback: t`That is the amplitude, half the swing. The midline is the average of the maximum and the minimum.` }, { value: 0, feedback: t`The midline is not the $t$-axis here: average the maximum and the minimum.` }]).filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [ask === 'A' ? t`The amplitude is half the distance from the minimum to the maximum.` : t`The midline sits halfway between the maximum and the minimum.`],
          teach: t`$A = \tfrac12(\max - \min)$, $D = \tfrac12(\max + \min)$.`,
          explain: ask === 'A' ? t`$A = \tfrac12(${hi} - (${lo})) = ${A}$.` : t`$D = \tfrac12(${hi} + (${lo})) = ${D}$.`,
          visual: { type: 'graph', params: { x: [-0.3, 7], y: [lo - 1, hi + 1.2], aspect: 'wide', yticks: 6, xlabel: 't', curves: [{ fn: `${A}*sin(${w}*x) + ${D}`, color: 'accent' }], hlines: [{ y: hi, color: 'ink3', label: `max ${hi}` }, { y: lo, color: 'ink3', label: `min ${lo}` }] }, caption: t`The sinusoid with its maximum and minimum marked.` },
        };
      },
    }),
    num({
      id: 'phase-shift', difficulty: 2,
      gen(r) {
        const b = r.pick([2, 3, 4]), q = r.pick([1, 2, 3]), c = PI / q, cT = q === 1 ? '\\pi' : `\\tfrac{\\pi}{${q}}`, ans = c / b, aT = `\\tfrac{\\pi}{${q * b}}`;
        return {
          prompt: t`The graph of $y = \sin\!\left(${b}x + ${cT}\right)$ is the graph of $y = \sin(${b}x)$ shifted left by how much?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: c, feedback: t`Factor the inside first: $${b}x + ${cT} = ${b}\left(x + \tfrac{${cT}}{${b}}\right)$. The shift is the amount added to $x$ itself.` }, { value: c * b, feedback: t`Divide by $${b}$, do not multiply: the shift is $c/b$.` }],
          hints: [t`Write the inside as $${b}(x + \text{something})$.`, t`$\text{something} = \dfrac{${cT}}{${b}}$.`],
          teach: t`$\sin(bx + c) = \sin\big(b(x + c/b)\big)$: the shift is $c/b$, not $c$.`,
          explain: t`$${b}x + ${cT} = ${b}\left(x + ${aT}\right)$: shifted left by $${aT} \approx ${sig(ans, 3)}$.`,
          visual: trigGraph({ curves: [{ fn: `sin(${b}*x)`, color: 'ink3', dash: true, width: 1.4 }, { fn: `sin(${b}*x + ${N(c)})`, color: 'accent' }], lo: -PI / 2, hi: PI, step: PI / 4, caption: t`$\sin(${b}x)$ (dashed) and the shifted wave (blue). Ticks every $\pi/4$.` }),
        };
      },
    }),
    expr({
      id: 'write-eq', difficulty: 3,
      gen(r) {
        const A = r.pick([2, 3, 5]), T = r.pick([2, 4, 0.5]), D = r.pick([0, 1, -2]);
        const ans = `${A}*sin(2*pi*t/${T})${D ? (D > 0 ? ` + ${D}` : ` - ${-D}`) : ''}`;
        const ansT = t`${A}\sin\!\left(\frac{2\pi t}{${T}}\right)${D ? (D > 0 ? ` + ${D}` : ` - ${-D}`) : ''}`;
        return {
          prompt: t`The graph shows a signal $y(t)$, with $t$ in seconds, that starts on its midline going up. Write $y(t)$ in the form $A\sin(\omega t) + D$.`,
          lhs: 'y(t)', answer: ans, answerTeX: ansT, vars: { t: [0, 3] },
          errors: [{ answer: `${A}*sin(${T}*t)${D ? (D > 0 ? ` + ${D}` : ` - ${-D}`) : ''}`, feedback: t`$\omega$ is not the period: one cycle takes $T = ${T}$ s, so $\omega = 2\pi/T$.` }, { answer: `${2 * A}*sin(2*pi*t/${T})${D ? (D > 0 ? ` + ${D}` : ` - ${-D}`) : ''}`, feedback: t`That doubles the amplitude: $A$ is measured from the midline, half the peak-to-peak swing.` }],
          hints: [t`Read the midline, the peak height above it, and the time for one full cycle.`, t`$A = ${A}$, $D = ${D}$, and $T = ${T}$ s, so $\omega = 2\pi/${T}$.`],
          teach: t`From a graph: $A$ from the swing, $D$ from the midline, $\omega = 2\pi/T$ from one cycle.`,
          explain: t`$A = ${A}$, $D = ${D}$, $T = ${T}$ s gives $\omega = 2\pi/${T} = ${sig((2 * PI) / T, 3)}$ rad/s: $y = ${ansT}$.`,
          visual: { type: 'graph', params: { x: [-0.05 * 2 * T, 2.1 * T], y: [D - A - 1, D + A + 1.4], aspect: 'wide', xlabel: 't (s)', ylabel: 'y', xticks: 8, yticks: 6, curves: [{ fn: `${A}*sin(2*pi*x/${T}) + ${D}`, color: 'accent' }], hlines: [{ y: D, color: 'ink3' }], points: [{ x: N(T / 4), y: D + A, color: 'gold', r: 4.5 }, { x: N((5 * T) / 4), y: D + A, color: 'gold', r: 4.5 }] }, caption: t`Two cycles of the signal; the gold dots are successive peaks, and the dashed line is the midline.` },
        };
      },
    }),
    num({
      id: 'omega-scope', difficulty: 2,
      gen(r) {
        const f = r.pick([50, 60, 400]), n = r.pick([3, 4]), win = n / f, ans = 2 * PI * f;
        return {
          prompt: t`An oscilloscope shows exactly $${n}$ full cycles of a signal across a $${sig(win * 1000, 4)}$ ms window. What is its angular frequency $\omega$?`,
          answer: ans, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: f, feedback: t`$${f}$ is the frequency $f$ in cycles per second (Hz). Each cycle is $2\pi$ rad: $\omega = 2\pi f$.` }, { value: n / win / (2 * PI), feedback: t`Multiply by $2\pi$, do not divide: $\omega = 2\pi f$.` }],
          hints: [t`One period is $T = ${sig(win * 1000, 4)}\ \text{ms} / ${n}$.`, t`$f = 1/T$ and $\omega = 2\pi f$.`],
          teach: t`Count cycles in a known time to get $f$; then $\omega = 2\pi f$.`,
          explain: t`$T = ${sig((win * 1000) / n, 4)}$ ms, $f = ${f}$ Hz, $\omega = 2\pi \times ${f} = ${sig(ans, 4)}$ rad/s.`,
          visual: { type: 'graph', params: { x: [0, N(win * 1000)], y: [-1.4, 1.4], aspect: 'wide', xlabel: 't (ms)', ylabel: 'signal', yticks: 4, curves: [{ fn: `sin(2*pi*${f}*x/1000)`, color: 'good' }] }, caption: t`The oscilloscope trace across the whole window.` },
        };
      },
    }),
    mcq({
      id: 'phase-direction', difficulty: 2,
      prompt: t`The blue curve is $\sin(\omega t)$. Which curve is $\sin(\omega t + \tfrac{\pi}{4})$?`,
      visual: trigGraph({ curves: [{ fn: 'sin(x)', color: 'accent', label: 'blue', labelAt: N(PI / 2), labelDx: -12, labelDy: -12 }, { fn: 'sin(x + pi/4)', color: 'warn', label: 'orange', labelAt: N(PI / 4), labelDx: -24, labelDy: -12 }, { fn: 'sin(x - pi/4)', color: 'good', label: 'green', labelAt: N((3 * PI) / 4), labelDx: 0, labelDy: -12 }], lo: -PI / 2, hi: 2 * PI, step: PI / 4, xlabel: 'ωt', caption: t`Three curves against $\omega t$, ticks every $\pi/4$.` }),
      choices: ['the orange one, peaking earlier', 'the green one, peaking later', 'the blue one: phase does not change the graph', 'neither: a phase changes the amplitude'],
      answer: 0,
      why: {
        1: t`The green curve is $\sin(\omega t - \pi/4)$: it reaches each angle *later*.`,
        2: t`The phase slides the whole wave along the time axis; the curves are visibly shifted.`,
        3: t`All three curves have the same amplitude; only their timing differs.`,
      },
      hints: [t`$\sin(\omega t + \pi/4)$ peaks when $\omega t + \pi/4 = \pi/2$. Is that before or after $\omega t = \pi/2$?`],
      teach: t`A positive phase means the wave is *ahead*: it reaches every point earlier, so its graph sits to the left.`,
      explain: t`It peaks at $\omega t = \pi/4$, a quarter of $\pi$ before the blue curve: the orange curve **leads**.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-period', difficulty: 1,
      gen(r) {
        const k = r.pick([3, 4, 6]);
        return {
          prompt: t`What is the period of $\cos(${k}t)$?`,
          visual: trigGraph({ curves: [{ fn: `cos(${k}*x)`, color: 'accent' }], lo: 0, hi: 2 * PI, xlabel: 't', caption: t`The curve over $0 \le t \le 2\pi$.` }),
          choices: [t`$${piTeX((2 * PI) / k)}$`, t`$${2 * k}\pi$`, t`$${k}$`, t`$2\pi$`],
          answer: 0,
          why: { 1: t`$${2 * k}\pi$ would mean the wave runs $${k}$ times *slower*. The factor $${k}$ makes it faster: divide.`, 2: t`$${k}$ is the number of cycles in $2\pi$, not the length of one.`, 3: t`$2\pi$ is the period of $\cos t$; the factor $${k}$ squeezes it.` },
          hints: [t`Count the cycles in the picture between $0$ and $2\pi$.`],
          teach: t`$\cos(kt)$ completes $k$ cycles in $2\pi$, so its period is $2\pi/k$.`,
          explain: t`$${k}t$ grows by $2\pi$ when $t$ grows by $2\pi/${k} = ${piTeX((2 * PI) / k)}$; the picture shows $${k}$ cycles in $2\pi$.`,
        };
      },
    }),
    num({
      id: 'cp-cepheid', difficulty: 2, transfer: true,
      prompt: t`The star $\delta$ Cephei pulses with a period of $5.366$ days, its apparent magnitude ranging from $3.48$ (brightest) to $4.37$ (faintest). Modelling it as $m(t) = D + A\sin(\omega t)$, what is $\omega$ in rad/day?`,
      answer: (2 * PI) / 5.366, units: 'rad/day', tol: { rel: 0.005 },
      errors: [{ value: 1 / 5.366, feedback: t`$1/5.366$ is the frequency in cycles per day. Each cycle is $2\pi$ rad.` }, { value: 5.366 / (2 * PI), feedback: t`Upside down: $\omega = 2\pi/T$.` }, { value: (4.37 - 3.48) / 2, feedback: t`That is the amplitude $A$. The question asks for the angular frequency.` }],
      hints: [t`$\omega = 2\pi/T$ with $T$ in days.`],
      teach: t`$\omega = 2\pi/T$ in whatever time unit $T$ is given.`,
      explain: t`$\omega = 2\pi/5.366\ \text{d} = ${sig((2 * PI) / 5.366, 4)}$ rad/day. (And $A = ${nice((4.37 - 3.48) / 2)}$ mag, $D = ${nice((4.37 + 3.48) / 2)}$ mag.) Cepheids’ periods reveal their true brightness, which is how Hubble measured the distance to other galaxies.`,
      visual: { type: 'graph', params: { x: [-0.3, 11.2], y: [3.3, 4.55], aspect: 'wide', xlabel: 't (days)', ylabel: 'magnitude', yticks: 5, curves: [{ fn: '3.925 + 0.445*sin(2*pi*x/5.366)', color: 'gold' }], hlines: [{ y: 3.925, color: 'ink3' }] }, caption: t`The sinusoidal model over two periods. The real light curve is lopsided — a fast rise and a slow fade — so a sine is only a first approximation. Larger magnitude means fainter.` },
    }),
    num({
      id: 'cp-lag', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([40, 50, 80, 120]), d = r.pick([0.4, 0.6, 0.9, 1.2]), ans = (d / (2 * PI * f)) * 1000;
        return {
          prompt: t`Two accelerometers on a rocket-engine test stand record the same vibration: $a_1 = a_0\sin(2\pi \cdot ${f}\,t)$ and $a_2 = a_0\sin(2\pi \cdot ${f}\,t - ${d})$, with $t$ in seconds and the phase in radians. By how many milliseconds does the second signal lag the first?`,
          answer: ans, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: d * 1000, feedback: t`$${d}$ is a phase angle in radians, not a time. Divide by $\omega$: $\Delta t = \varphi/\omega$.` }, { value: (d / f) * 1000, feedback: t`Divide by $\omega = 2\pi f$, not by $f$: the phase is in radians.` }],
          hints: [t`The second signal reaches each angle when $2\pi \cdot ${f}\,t - ${d}$ equals what the first had at $t$: a delay of $\Delta t$ with $\omega\,\Delta t = ${d}$.`, t`$\Delta t = \dfrac{${d}}{2\pi \times ${f}}$ s.`],
          teach: t`A phase difference $\Delta\varphi$ is a time difference $\Delta\varphi/\omega$.`,
          explain: t`$\Delta t = \dfrac{${d}}{2\pi \times ${f}} = ${sig(ans / 1000, 3)}$ s $= ${sig(ans, 3)}$ ms — $${sig((d / (2 * PI)) * 100, 3)}\%$ of a period.`,
          visual: { type: 'graph', params: { x: [0, N(2 / f)], y: [-1.4, 1.4], aspect: 'wide', xlabel: 't (s)', ylabel: 'a / a₀', yticks: 4, curves: [{ fn: `sin(2*pi*${f}*x)`, color: 'accent', label: 'a₁', labelAt: N(0.25 / f), labelDx: -6, labelDy: -12 }, { fn: `sin(2*pi*${f}*x - ${d})`, color: 'warn', label: 'a₂', labelAt: N(0.25 / f + d / (2 * PI * f)), labelDx: 4, labelDy: -12 }] }, caption: t`Two periods of both signals; the orange one reaches every peak later.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §6.1 Graphs of the Sine and Cosine Functions', url: 'https://openstax.org/books/precalculus-2e/pages/6-1-graphs-of-the-sine-and-cosine-functions' },
    { label: 'AAVSO, Variable Star of the Month: Delta Cephei', url: 'https://www.aavso.org/vsots_delcep' },
  ],
});
