// Phasors and reactance: a sinusoidal source driving R, L or C alone. The
// current has the source's frequency; it is in step with the voltage in R,
// lags it by 90° in L and leads it by 90° in C. Amplitudes are related by the
// reactances X_L = ωL and X_C = 1/ωC. A phasor is a rotating arrow whose
// height is the instantaneous value.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, sf, r6, apart, acPic, acTraces, COL } from './_maxwell.js';

const t = String.raw;
const TAU = 2 * Math.PI;

// the worked example: amplitude 10.0 V at 60.0 Hz across 50.0 mH, then across 20.0 µF
const EX = (() => {
  const w = TAU * 60, XL = w * 0.05, XC = 1 / (w * 20e-6);
  return { w, XL, XC, IL: 10 / XL, IC: 10 / XC };
})();

/** X_L and X_C against frequency (Hz), for a coil L (H) and a capacitor C (F) */
function reactanceGraph({ L, C, fmax, Xmax, show = ['L', 'C'], numbers = true, vl = [], caption }) {
  const curves = [];
  if (show.includes('L')) curves.push({ fn: `${r6(TAU * L)}*x`, color: COL.L, width: 2.6, label: 'coil: ωL', labelAt: r6(fmax * 0.62), labelDx: 6, labelDy: -14 });
  if (show.includes('C')) curves.push({ fn: `1/(${r6(TAU * C)}*x)`, color: COL.C, width: 2.6, domain: [r6(fmax * 0.01), r6(fmax)], label: 'capacitor: 1/ωC', labelAt: r6(fmax * 0.1), labelDx: 8, labelDy: -6 });
  return {
    type: 'graph',
    params: { x: [0, r6(fmax)], y: [0, r6(Xmax)], aspect: 'wide', axesAt: 'edge', xlabel: 'f (Hz)', ylabel: 'reactance (Ω)', ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }), curves, vlines: vl },
    caption,
  };
}

export default lesson({
  id: 'phys2220.B5.1',
  title: 'Phasors and reactance',
  minutes: 12, difficulty: 2,
  intro: t`Drive a resistor, a coil or a capacitor with a sinusoidal voltage, $v = V_0\sin\omega t$. The current is sinusoidal too, at the same frequency — but not always in step. In a resistor the two peak together. In an inductor the current peaks a quarter cycle **later**: it lags the voltage by $90^\circ$. In a capacitor it peaks a quarter cycle **earlier**: it leads by $90^\circ$. The ratio of the amplitudes is the **reactance**, measured in ohms:

$$X_L = \omega L, \qquad X_C = \frac{1}{\omega C}, \qquad V_0 = I_0X$$

A **phasor** is an arrow as long as the amplitude, turning counter-clockwise at $\omega$; its height at each instant is the value at that instant. A lag or a lead becomes an angle between two arrows.`,
  symbols: [
    { tex: 'X_L', text: 'the inductive reactance, in ohms (Ω): it grows with frequency, because a faster-changing current meets a larger back emf' },
    { tex: 'X_C', text: 'the capacitive reactance, in ohms: it falls with frequency, because a faster swing moves more charge on and off the plates each second' },
    { tex: t`\omega = 2\pi f`, text: 'the angular frequency, in rad/s; $f$ is the frequency in hertz (60 Hz for North American mains, 400 Hz for aircraft power)' },
    { tex: 'L,\\ C', text: 'the inductance (H) and capacitance (F)' },
    { tex: 'V_0,\\ I_0', text: t`the amplitudes — the peak voltage and current. Mains voltages are quoted as **rms** values, $V_\text{rms} = V_0/\sqrt2$, so a 120 V outlet peaks at 170 V; $V = IX$ holds for rms values too` },
  ],
  why: t`Reactance is how circuits filter frequencies: a coil blocks high frequencies and passes low ones, a capacitor does the opposite. Every radio, power supply and audio crossover is built from that.`,
  visual: {
    type: 'em-ac',
    title: 'Who peaks first: voltage or current?',
    lead: t`The source’s voltage $v$ (gold) and the current $i$ (blue), as rotating phasors on the left and as graphs against time on the right. Each phasor’s height is the value at the moment marked by the grey line. The arc marks the phase angle $\phi$ between them.`,
    tasks: [
      'Choose the resistor: voltage and current peak together, and their phasors turn as one.',
      'Choose the inductor: the current peaks a quarter cycle after the voltage — it lags by 90°.',
      'Choose the capacitor: now the current peaks a quarter cycle earlier — it leads.',
      'Raise f: the inductor lets less current through and the capacitor more; the resistor does not care.',
    ],
    params: { mode: 'ac', elements: 'L', elementChoice: true, controls: ['element', 'f', 'R', 'L', 'C'], V0: 10, f: 60, R: 20, L: 0.05, C: 100e-6 },
  },
  example: {
    prompt: t`A source of amplitude 10.0 V at 60.0 Hz drives (a) a 50.0 mH coil alone, then (b) a 20.0 µF capacitor alone. For each, find the reactance and the current amplitude, and say when the current peaks.`,
    visual: acPic({ mode: 'ac', elements: 'L', V0: 10, f: 60, L: 0.05, phase: 120 }, 'The coil’s case: its current phasor (blue) is a quarter turn behind the voltage phasor (gold). Phasors drawn as they would be a third of a cycle after the voltage crossed zero going up.'),
    steps: [
      { label: 'Angular frequency', text: t`$\omega = 2\pi f = 2\pi(60.0\ \text{Hz}) = ${tn(EX.w)}$ rad/s.` },
      { label: '(a) Coil', text: t`$X_L = \omega L = (${tn(EX.w)})(0.0500\ \text{H}) = ${tn(EX.XL)}\ \Omega$, so $I_0 = V_0/X_L = 10.0/${tn(EX.XL)} = ${tn(EX.IL)}$ A.` },
      { label: 'Why it lags', text: t`An ideal coil’s voltage is $L\,di/dt$, so the voltage is largest where the current changes fastest — where the current crosses zero. The current reaches its peak a quarter cycle after the voltage: it **lags by 90°**.` },
      { label: '(b) Capacitor', text: t`$X_C = \dfrac{1}{\omega C} = \dfrac{1}{(${tn(EX.w)})(20.0\times10^{-6})} = ${tn(EX.XC)}\ \Omega$, so $I_0 = 10.0/${tn(EX.XC)} = ${tn(EX.IC * 1e3)}$ mA.` },
      { label: 'Why it leads', text: t`A capacitor’s current is $C\,dv/dt$: largest where the voltage changes fastest, as the voltage crosses zero. So the current peaks a quarter cycle **before** the voltage: it **leads by 90°**.` },
      { label: 'Sense check', text: t`At ten times the frequency, 600 Hz, $X_L$ would be ten times larger (${tn(EX.XL * 10)} Ω) and $X_C$ ten times smaller (${tn(EX.XC / 10)} Ω): the coil chokes high frequencies, the capacitor passes them.` },
    ],
    answer: t`(a) $X_L = ${tn(EX.XL)}\ \Omega$, $I_0 = ${tn(EX.IL)}$ A, lagging by $90^\circ$. (b) $X_C = ${tn(EX.XC)}\ \Omega$, $I_0 = ${tn(EX.IC * 1e3)}$ mA, leading by $90^\circ$.`,
  },
  practice: [
    num({
      id: 'XL', difficulty: 1,
      gen(r) {
        const LmH = r.pick([10, 25, 80, 150, 400]), f = r.pick([50, 60, 400, 1000, 5000]);
        const X = TAU * f * LmH * 1e-3;
        return {
          prompt: t`What is the reactance of a ${LmH} mH coil at ${f} Hz?`,
          visual: reactanceGraph({ L: LmH * 1e-3, C: 1, fmax: f * 2, Xmax: X * 2.4, show: ['L'], numbers: false, vl: [{ x: f, color: 'gold', label: `${f} Hz` }], caption: 'The coil’s reactance rises in proportion to the frequency (axis numbers hidden); the gold line marks the frequency asked about.' }),
          answer: X, units: 'Ω', tol: { rel: 0.01 },
          errors: apart([{ value: f * LmH * 1e-3, feedback: t`Use the angular frequency: $X_L = \omega L = 2\pi fL$.` }, { value: 1 / (TAU * f * LmH * 1e-3), feedback: t`That is the capacitor’s form, upside down. A coil’s reactance grows with frequency: $X_L = \omega L$.` }], X),
          hints: [t`$X_L = \omega L$ with $\omega = 2\pi f$ and $L$ in henries.`],
          teach: t`A coil’s reactance is $X_L = \omega L = 2\pi fL$: proportional to both frequency and inductance.`,
          explain: t`$X_L = 2\pi(${f})(${LmH}\times10^{-3}) = ${tn(X)}\ \Omega$.`,
        };
      },
    }),
    num({
      id: 'XC', difficulty: 1,
      gen(r) {
        const CuF = r.pick([0.1, 1, 4.7, 22, 100]), f = r.pick([60, 120, 1000, 10000]);
        const X = 1 / (TAU * f * CuF * 1e-6);
        return {
          prompt: t`What is the reactance of a ${CuF} µF capacitor at ${f} Hz?`,
          visual: reactanceGraph({ L: 1, C: CuF * 1e-6, fmax: f * 2, Xmax: X * 3, show: ['C'], numbers: false, vl: [{ x: f, color: 'gold', label: `${f} Hz` }], caption: 'The capacitor’s reactance falls as the frequency rises (axis numbers hidden); the gold line marks the frequency asked about.' }),
          answer: X, units: 'Ω', tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (f * CuF * 1e-6), feedback: t`Use $\omega = 2\pi f$: $X_C = 1/(2\pi fC)$.` }, { value: TAU * f * CuF * 1e-6, feedback: t`Upside down: a capacitor’s reactance is $1/\omega C$ — it falls as the frequency rises.` }], X),
          hints: [t`$X_C = \dfrac{1}{\omega C} = \dfrac{1}{2\pi fC}$, with $C$ in farads.`],
          teach: t`A capacitor’s reactance is $X_C = 1/(2\pi fC)$: it falls as frequency or capacitance rises.`,
          explain: t`$X_C = \dfrac{1}{2\pi(${f})(${CuF}\times10^{-6})} = ${tn(X)}\ \Omega$.`,
        };
      },
    }),
    mcq({
      id: 'phase-L', difficulty: 2,
      prompt: t`A source drives an ideal coil with the voltage shown. When does the current through the coil reach its positive peak?`,
      visual: acTraces({ show: ['v'], caption: 'The source voltage across the coil against time, in periods of the source. The current is not drawn.' }),
      choices: ['A quarter period after the voltage peaks', 'At the same moment as the voltage peaks', 'A quarter period before the voltage peaks', 'Half a period after the voltage peaks'],
      answer: 0,
      why: {
        1: t`That is a resistor. A coil’s voltage is $L\,di/dt$, so its voltage peaks where the current is changing fastest — not where the current peaks.`,
        2: 'That is a capacitor: there the current leads. In a coil it lags.',
        3: 'Half a period would put current and voltage in opposition; a coil shifts the current by a quarter period.',
      },
      hints: [t`$v = L\,di/dt$: the voltage is largest where the current is steepest.`, 'The current is steepest where it crosses zero, so its peak comes a quarter cycle after the voltage’s.'],
      teach: 'In an inductor the current lags the voltage by 90°: it peaks a quarter period after the voltage.',
      explain: t`With $v = V_0\sin\omega t$ across the coil, $di/dt = v/L$ gives $i = -\dfrac{V_0}{\omega L}\cos\omega t = I_0\sin(\omega t - 90^\circ)$: the same wave shifted a quarter period later.`,
    }),
    mcq({
      id: 'which-element', difficulty: 2,
      prompt: t`An unknown single element in the box is driven by an AC source. Its phasors and graphs are shown. What is in the box?`,
      visual: acPic({ mode: 'ac', elements: 'C', V0: 10, f: 100, C: 20e-6, phase: 40, hide: ['element', 'C'] }, 'The source voltage v (gold) and the current i (blue), as phasors and against time. The current is drawn to its own scale.'),
      choices: ['A capacitor', 'A coil', 'A resistor', 'You cannot tell without knowing the frequency'],
      answer: 0,
      why: {
        1: 'In a coil the current lags: its phasor would be a quarter turn behind (clockwise from) the voltage. Here it is a quarter turn ahead.',
        2: 'In a resistor the two phasors point the same way and the graphs peak together.',
        3: 'The phase shift alone tells you: +90° for a capacitor and −90° for a coil at any frequency.',
      },
      hints: ['The phasors turn counter-clockwise. Is the current’s arrow ahead of the voltage’s or behind it?', 'On the graph, which peaks first, v or i?'],
      teach: 'A current phasor a quarter turn ahead of the voltage means a capacitor; a quarter turn behind means a coil; in line means a resistor.',
      explain: t`The current phasor leads the voltage by $90^\circ$, and on the graph the current peaks a quarter period before the voltage: a capacitor, where $i = C\,dv/dt$.`,
    }),
    num({
      id: 'current-amplitude', difficulty: 2,
      gen(r) {
        const V0 = r.pick([5, 12, 24, 170]), f = r.pick([60, 400, 2000]), CuF = r.pick([2.2, 10, 47]);
        const XC = 1 / (TAU * f * CuF * 1e-6), I = V0 / XC;
        return {
          prompt: t`A ${CuF} µF capacitor is connected across a source of amplitude ${V0} V at ${f} Hz. What is the amplitude of the current?`,
          visual: acPic({ mode: 'ac', elements: 'C', V0, f, C: CuF * 1e-6, phase: 50 }, 'The capacitor’s voltage and current, as phasors and against time; the current is drawn to its own scale, so its size cannot be read from the picture.'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: V0 * XC, feedback: t`Divide by the reactance: $I_0 = V_0/X_C$.` }, { value: V0 * f * CuF * 1e-6, feedback: t`$X_C = 1/(2\pi fC)$ — the $2\pi$ is missing.` }], I),
          hints: [t`First $X_C = 1/(2\pi fC)$; then $I_0 = V_0/X_C$.`, t`$X_C = ${tn(XC)}\ \Omega$.`],
          teach: t`For a capacitor alone, $I_0 = V_0/X_C = \omega CV_0$.`,
          explain: t`$X_C = 1/(2\pi\cdot${f}\cdot${CuF}\times10^{-6}) = ${tn(XC)}\ \Omega$, so $I_0 = ${V0}/${tn(XC)} = ${tn(I)}$ A, leading the voltage by a quarter cycle.`,
        };
      },
    }),
    mcq({
      id: 'frequency-limits', difficulty: 2,
      prompt: t`As the frequency falls toward zero (steady DC), a capacitor behaves more and more like ______ and a coil more and more like ______.`,
      visual: reactanceGraph({ L: 0.1, C: 50e-6, fmax: 200, Xmax: 120, caption: 'The reactances of a 0.1 H coil (teal) and a 50 µF capacitor (violet) against frequency.' }),
      choices: ['a break in the circuit; a plain wire', 'a plain wire; a break in the circuit', 'a plain wire; a plain wire', 'a resistor; a resistor'],
      answer: 0,
      why: {
        1: t`That is the high-frequency limit. As $f \to 0$, $X_C = 1/\omega C \to \infty$ while $X_L = \omega L \to 0$.`,
        2: t`Only the coil becomes a wire at DC: a capacitor’s gap blocks a steady current.`,
        3: t`Neither turns into a resistor: reactances change with frequency, and an ideal L or C never dissipates energy.`,
      },
      hints: [t`What do $\omega L$ and $1/\omega C$ do as $\omega \to 0$?`],
      teach: 'At DC a capacitor blocks current and a coil passes it freely; at high frequency the roles swap.',
      explain: t`$X_C \to \infty$: no steady current crosses a capacitor’s gap. $X_L \to 0$: a steady current induces no emf in a coil. That matches what you saw in the RC and RL circuits once their transients had died.`,
    }),
    num({
      id: 'equal-reactance', difficulty: 3,
      gen(r) {
        const LmH = r.pick([10, 50, 100, 250]), CuF = r.pick([1, 10, 47]);
        const L = LmH * 1e-3, C = CuF * 1e-6, f = 1 / (TAU * Math.sqrt(L * C));
        return {
          prompt: t`At what frequency does a ${LmH} mH coil have the same reactance as a ${CuF} µF capacitor?`,
          visual: reactanceGraph({ L, C, fmax: f * 2.2, Xmax: TAU * f * L * 2.6, numbers: false, caption: 'The two reactances against frequency (axis numbers hidden): one rises, one falls, so they cross once.' }),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: apart([{ value: 1 / Math.sqrt(L * C), feedback: t`That is the angular frequency $\omega$ in rad/s; divide by $2\pi$ for hertz.` }, { value: 1 / (TAU * L * C), feedback: t`Take the square root: $\omega^2 = 1/LC$.` }], f),
          hints: [t`Set $\omega L = \dfrac{1}{\omega C}$ and solve for $\omega$.`, t`$\omega = 1/\sqrt{LC}$, then $f = \omega/2\pi$.`],
          teach: t`A coil and a capacitor have equal reactances at $f = 1/(2\pi\sqrt{LC})$ — the LC circuit’s natural frequency.`,
          explain: t`$\omega L = 1/\omega C \Rightarrow \omega = 1/\sqrt{LC} = ${tn(TAU * f)}$ rad/s, so $f = ${tn(f)}$ Hz — the same frequency at which the LC pair would oscillate on its own. That is no coincidence (next lesson: resonance).`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “A capacitor’s reactance is $X_C = \omega C$. So doubling the frequency doubles $X_C$, and the capacitor lets **less** current through at high frequency.” What is wrong?`,
      visual: reactanceGraph({ L: 1, C: 10e-6, fmax: 2000, Xmax: 120, show: ['C'], caption: 'The reactance of a 10 µF capacitor against frequency.' }),
      choices: [
        t`$X_C = 1/\omega C$: doubling the frequency halves the reactance, so a capacitor passes more current at high frequency`,
        t`Nothing: higher frequency means a larger $X_C$`,
        t`$X_C = \omega C$ is right, but a larger reactance lets more current through`,
        t`A capacitor has no reactance; only coils do`,
      ],
      answer: 0,
      why: {
        1: 'The graph shows the opposite: the capacitor’s reactance falls as the frequency rises.',
        2: t`Reactance is volts per ampere, like resistance: a larger $X$ means less current for the same voltage. The slip is $\omega C$ itself.`,
        3: t`Capacitors have reactance $X_C = 1/\omega C$, measured in ohms like a coil’s.`,
      },
      hints: [t`Check the units: $\omega C$ has units of $1/\Omega$. What has units of ohms?`, t`$i = C\,dv/dt$: does a faster-changing voltage drive more current or less?`],
      teach: t`A capacitor’s reactance is $1/\omega C$: it falls with frequency, so capacitors pass high frequencies.`,
      explain: t`$i = C\,dv/dt$, and a faster swing moves charge on and off the plates faster: $I_0 = \omega CV_0$, so $X_C = V_0/I_0 = 1/\omega C$. $\omega C$ is the reciprocal of a reactance — in siemens, not ohms.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coil-current', difficulty: 2,
      gen(r) {
        const V0 = r.pick([10, 24, 50]), f = r.pick([50, 60, 1000]), LmH = r.pick([20, 100, 300]);
        const XL = TAU * f * LmH * 1e-3, I = V0 / XL;
        return {
          prompt: t`A source of amplitude ${V0} V at ${f} Hz drives an ideal ${LmH} mH coil. What is the current amplitude?`,
          visual: acPic({ mode: 'ac', elements: 'L', V0, f, L: LmH * 1e-3, phase: 150 }, 'The coil’s voltage and current as phasors and against time; the current is drawn to its own scale.'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          hints: [t`$I_0 = V_0/X_L$ with $X_L = 2\pi fL$.`],
          teach: t`For a coil alone, $I_0 = V_0/(\omega L)$.`,
          explain: t`$X_L = 2\pi(${f})(${LmH}\times10^{-3}) = ${tn(XL)}\ \Omega$, so $I_0 = ${V0}/${tn(XL)} = ${tn(I)}$ A, lagging by $90^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'cp-capacitor-phase', difficulty: 2,
      prompt: t`A source drives a capacitor alone with the voltage shown. When does the current reach its positive peak?`,
      visual: acTraces({ show: ['v'], caption: 'The voltage across the capacitor against time, in periods. The current is not drawn.' }),
      choices: ['A quarter period before the voltage peaks', 'A quarter period after the voltage peaks', 'At the same moment as the voltage peaks', 'Only when the voltage is zero and falling'],
      answer: 0,
      why: {
        1: 'That is a coil, where the current lags.',
        2: t`That is a resistor. A capacitor’s current is $C\,dv/dt$, largest where the voltage changes fastest.`,
        3: t`The current is largest as the voltage crosses zero — but rising, not falling: with $v = V_0\sin\omega t$, $i = \omega CV_0\cos\omega t$ peaks at $t = 0$, a quarter period before $v$ does.`,
      },
      hints: [t`$i = C\,dv/dt$.`],
      teach: 'In a capacitor the current leads the voltage by 90°.',
      explain: t`$i = C\,\dfrac{dv}{dt} = \omega CV_0\cos\omega t = I_0\sin(\omega t + 90^\circ)$: it peaks where the voltage is rising fastest, a quarter period before the voltage peaks.`,
    }),
    num({
      id: 'cp-400hz', difficulty: 3, transfer: true,
      gen(r) {
        const LmH = r.pick([10, 20, 50]);
        const XL = TAU * 400 * LmH * 1e-3, I = 115 / XL;
        return {
          prompt: t`Aircraft electrical systems run at 115 V rms and 400 Hz rather than 60 Hz, so their transformers and motors can be smaller and lighter. A coil of ${LmH} mH (treat it as ideal) is connected across the 400 Hz bus. What rms current flows?`,
          visual: acPic({ mode: 'ac', elements: 'L', V0: 162.6, f: 400, L: LmH * 1e-3, phase: 60, hide: ['V0'] }, 'The coil on the 400 Hz bus: voltage and current as phasors and against time. Its peak voltage is √2 × 115 V ≈ 163 V.'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: 115 / (TAU * 60 * LmH * 1e-3), feedback: 'That is the current at 60 Hz. At 400 Hz the reactance is 400/60 ≈ 6.7 times larger.' }, { value: 115 / (400 * LmH * 1e-3), feedback: t`Use $\omega = 2\pi f$ in $X_L = \omega L$.` }], I),
          hints: [t`$V = IX$ holds for rms values: $I_\text{rms} = V_\text{rms}/X_L$.`, t`$X_L = 2\pi(400)(${LmH}\times10^{-3})$.`],
          teach: 'Reactance scales with frequency, so the same coil on a 400 Hz aircraft bus draws a sixth or so of the current it would at 60 Hz.',
          explain: t`$X_L = 2\pi(400)(${LmH}\times10^{-3}) = ${tn(XL)}\ \Omega$, so $I_\text{rms} = 115/${tn(XL)} = ${tn(I)}$ A. At 60 Hz it would be ${tn((115 / (TAU * 60 * LmH * 1e-3)))} A: at 400 Hz a much smaller inductance does the same job, which is why aircraft transformers and filters are light.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §15.2 Simple AC circuits', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits' },
  ],
});
