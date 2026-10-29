// LC oscillations: a charged capacitor discharging through a coil overshoots
// and recharges the other way, again and again. L d²q/dt² + q/C = 0 is the
// mass–spring equation with L ↔ m and 1/C ↔ k, so q = Q cos(ωt + φ) with
// ω = 1/√(LC), and the energy q²/2C + ½Li² stays fixed (with no resistance).
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { tn, sf, r6, apart, acPic, COL } from './_maxwell.js';

const t = String.raw;

// the worked example: L = 2.00 mH, C = 5.00 µF, charged to 10.0 V
const EX = (() => {
  const L = 2e-3, C = 5e-6, V = 10, w = 1 / Math.sqrt(L * C);
  return { L, C, V, w, f: w / (2 * Math.PI), T: (2 * Math.PI) / w, Q: C * V, I: C * V * w, U: 0.5 * C * V * V };
})();

/** the LC circuit alone (no graphs, optionally the energy bars) at a still moment */
const lcCircuit = ({ L, C, V0 = 10, bars = false, hide = [], analog = false }, caption) => acPic({ mode: 'lc', L, C, V0, R: 0, t: 0, graphs: [], bars, hide, analog: analog ? 'always' : false }, caption);

/** q(t) = Q cos(ωt) against time in periods (or in a time unit), optional markers */
function chargeGraph({ periods = 2, vl = [], points = [], caption, numbers = true, curves = [] }) {
  return {
    type: 'graph',
    params: {
      x: [0, periods], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (periods)', ylabel: 'q / Q', xticks: periods * 4,
      ...(numbers ? {} : { yticks: 0.001 }),
      curves: [{ fn: 'cos(2*pi*x)', color: COL.C, width: 2.6 }, ...curves], vlines: vl, points,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.B4.4',
  title: 'LC oscillations',
  minutes: 12, difficulty: 2,
  intro: t`Charge a capacitor, then connect it across a coil. The capacitor drives a current through the coil; by the time the capacitor is empty, all the energy is in the coil’s magnetic field — and the coil keeps the current going, charging the capacitor up the other way. Then everything runs backwards. The loop rule, $L\,\ddot q + q/C = 0$, is the equation of a **mass on a spring**, so the charge oscillates:

$$q(t) = Q\cos(\omega t + \phi), \qquad \omega = \frac{1}{\sqrt{LC}}$$

Energy sloshes between the capacitor’s electric field, $q^2/2C$, and the coil’s magnetic field, $\tfrac12Li^2$; with no resistance their sum never changes. Radio tuners, electronic oscillators and the resonant cavity of a microwave oven all start here.`,
  symbols: [
    { tex: 'q(t)', text: 'the charge on one plate of the capacitor at time $t$, in coulombs (C); the other plate holds $-q$' },
    { tex: 'Q', text: 'the amplitude: the largest charge, which the capacitor holds when the current is momentarily zero' },
    { tex: t`\omega`, text: t`the angular frequency, in radians per second; the frequency is $f = \omega/2\pi$ (Hz) and the period $T = 2\pi\sqrt{LC}$` },
    { tex: t`\phi`, text: 'the phase constant, set by how the oscillation starts; $\\phi = 0$ when the capacitor starts fully charged' },
    { tex: 'L', text: 'the coil’s inductance (H): the circuit’s inertia, playing the part of the mass' },
    { tex: 'C', text: 'the capacitance (F); $1/C$ plays the part of the spring constant' },
    { tex: t`i = \dot q`, text: 'the current, the rate of change of the charge — the circuit’s velocity' },
  ],
  why: t`The same equation describes a mass on a spring, a pendulum, a tuned radio circuit and the modes of an electromagnetic cavity: learn the oscillator once and you can read all of them.`,
  visual: {
    type: 'em-ac',
    title: 'Charge sloshing through a coil',
    lead: t`The capacitor starts charged and is connected across the coil at $t = 0$. Watch the charge (violet) and the current (blue) take turns, the energy pass between the electric field ($U_E$) and the magnetic field ($U_B$), and the block on the spring move in step.`,
    tasks: [
      'Pause when the capacitor is empty: the current is at its peak and all the energy is in the coil.',
      'Quadruple C: the period doubles.',
      'Watch the block: it moves exactly as the charge does — L plays the mass, 1/C the spring.',
      'Raise R: the oscillation dies away as the energy turns into heat.',
    ],
    params: { mode: 'lc', L: 2e-3, C: 5e-6, V0: 10, R: 0 },
  },
  example: {
    prompt: t`A 5.00 µF capacitor charged to 10.0 V is connected at $t = 0$ across a 2.00 mH coil (no resistance). Find (a) the angular frequency, frequency and period, (b) the largest current, and (c) when the capacitor first empties.`,
    visual: lcCircuit({ L: EX.L, C: EX.C, bars: true }, 'The capacitor fully charged at the moment it is connected: all the energy is in its electric field (violet bar).'),
    steps: [
      { label: 'Loop rule', text: t`Around the loop, $L\,\dfrac{di}{dt} + \dfrac{q}{C} = 0$ with $i = \dfrac{dq}{dt}$: so $\ddot q = -\dfrac{1}{LC}\,q$ — the oscillator equation $\ddot x = -\dfrac{k}{m}x$.` },
      { label: '(a) Frequency', text: t`$\omega = \dfrac{1}{\sqrt{LC}} = \dfrac{1}{\sqrt{(2.00\times10^{-3})(5.00\times10^{-6})}} = \dfrac{1}{10^{-4}\ \text{s}} = ${tn(EX.w)}$ rad/s, so $f = \omega/2\pi = ${tn(EX.f)}$ Hz and $T = 1/f = ${tn(EX.T * 1e3)}$ ms.` },
      { label: 'Amplitude', text: t`It starts fully charged and at rest: $Q = CV = (5.00\ \mu\text{F})(10.0\ \text{V}) = ${tn(EX.Q * 1e6)}\ \mu$C, and $q = Q\cos\omega t$.` },
      { label: '(b) Largest current', text: t`$i = \dot q = -\omega Q\sin\omega t$, so $I_{\max} = \omega Q = (${tn(EX.w)})(${tn(EX.Q)}) = ${tn(EX.I)}$ A.` },
      { label: 'Energy check', text: t`$\tfrac12CV^2 = \tfrac12(5.00\times10^{-6})(10.0)^2 = ${tn(EX.U * 1e3)}$ mJ, and $\tfrac12LI_{\max}^2 = \tfrac12(2.00\times10^{-3})(${tn(EX.I)})^2 = ${tn(0.5 * EX.L * EX.I ** 2 * 1e3)}$ mJ. ✓ The same energy, all electric at first, all magnetic a quarter period later.` },
      { label: '(c) First empty', text: t`$\cos\omega t = 0$ first at $\omega t = \pi/2$: $t = T/4 = ${tn((EX.T / 4) * 1e3)}$ ms. That is when the current peaks.` },
    ],
    answer: t`(a) $\omega = 1.00\times10^4$ rad/s, $f = 1.59$ kHz, $T = 0.628$ ms; (b) $I_{\max} = 0.500$ A; (c) at $T/4 = 0.157$ ms.`,
  },
  practice: [
    num({
      id: 'freq', difficulty: 1,
      gen(r) {
        const LmH = r.pick([1, 2, 5, 10]), CuF = r.pick([0.5, 1, 2, 10]);
        const f = 1 / (2 * Math.PI * Math.sqrt(LmH * 1e-3 * CuF * 1e-6));
        return {
          prompt: t`A ${CuF} µF capacitor and a ${LmH} mH coil form an LC circuit. At what frequency does it oscillate?`,
          visual: lcCircuit({ L: LmH * 1e-3, C: CuF * 1e-6 }, 'The LC circuit. Its starting charge sets how big the oscillation is, not how fast.'),
          answer: f / 1e3, units: 'kHz', tol: { rel: 0.01 },
          errors: apart([{ value: (2 * Math.PI * f) / 1e3, feedback: t`That is $\omega = 1/\sqrt{LC}$ in rad/s. Divide by $2\pi$ for the frequency in hertz.` }, { value: 1 / (2 * Math.PI * LmH * 1e-3 * CuF * 1e-6) / 1e3, feedback: t`Take the square root of $LC$: $f = \dfrac{1}{2\pi\sqrt{LC}}$.` }], f / 1e3),
          hints: [t`$f = \dfrac{1}{2\pi\sqrt{LC}}$ with $L$ in henries and $C$ in farads.`],
          teach: t`An LC circuit oscillates at $f = \dfrac{1}{2\pi\sqrt{LC}}$.`,
          explain: t`$f = \dfrac{1}{2\pi\sqrt{(${LmH}\times10^{-3})(${CuF}\times10^{-6})}} = ${tn(f)}$ Hz $= ${tn(f / 1e3)}$ kHz.`,
        };
      },
    }),
    num({
      id: 'max-current', difficulty: 2,
      gen(r) {
        const CuF = r.pick([2, 4.7, 10, 22]), V = r.pick([5, 9, 12, 20]), LmH = r.pick([1, 3, 8, 20]);
        const C = CuF * 1e-6, L = LmH * 1e-3, I = V * Math.sqrt(C / L);
        return {
          prompt: t`A ${CuF} µF capacitor charged to ${V} V is connected across a ${LmH} mH coil. What is the largest current in the circuit?`,
          visual: lcCircuit({ L, C, V0: V, bars: true }, 'The circuit at the moment of connection: all the energy is in the capacitor (violet bar).'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: C * V, feedback: 'That is the largest charge, CV, in coulombs — not a current.' }, { value: V * Math.sqrt(C / (2 * L)), feedback: t`The ½ appears on both sides: $\tfrac12CV^2 = \tfrac12LI^2$, so $I = V\sqrt{C/L}$.` }], I),
          hints: ['When the current is largest, the capacitor is empty: all the energy is in the coil.', t`$\tfrac12CV^2 = \tfrac12LI_{\max}^2 \Rightarrow I_{\max} = V\sqrt{C/L}$.`],
          teach: t`Energy conservation links the peaks: $\tfrac12CV_{\max}^2 = \tfrac12LI_{\max}^2$.`,
          explain: t`$I_{\max} = V\sqrt{C/L} = ${V}\sqrt{\dfrac{${CuF}\times10^{-6}}{${LmH}\times10^{-3}}} = ${tn(I)}$ A — the same as $\omega Q$.`,
        };
      },
    }),
    match({
      id: 'analogy', difficulty: 2,
      prompt: t`The LC circuit obeys $L\,\ddot q + q/C = 0$ and a mass on a spring obeys $m\,\ddot x + kx = 0$. Match each circuit quantity with its mechanical twin.`,
      visual: acPic({ mode: 'lc', L: 2e-3, C: 5e-6, V0: 10, analog: 'always', graphs: [], bars: true, t: 1e-4 }, 'The circuit and its mechanical twin at the same moment: the block’s displacement follows the charge, its velocity the current.'),
      left: [t`$L$`, t`$1/C$`, t`$q$`, t`$i = \dot q$`, t`$\tfrac12Li^2$`, t`$q^2/2C$`],
      right: ['velocity v', 'spring constant k', 'kinetic energy ½mv²', 'mass m', 'spring energy ½kx²', 'displacement x'],
      answer: [3, 1, 5, 0, 2, 4],
      hints: [t`Line the two equations up term by term: $L \leftrightarrow m$ and $1/C \leftrightarrow k$.`, 'The charge plays the displacement, so the current — its rate of change — plays the velocity.'],
      teach: 'An LC circuit is a mass on a spring in disguise: inductance is inertia, inverse capacitance is stiffness, charge is displacement and current is velocity.',
      explain: t`$L \leftrightarrow m$, $1/C \leftrightarrow k$, $q \leftrightarrow x$, $i \leftrightarrow v$; then $\tfrac12Li^2 \leftrightarrow \tfrac12mv^2$ and $q^2/2C \leftrightarrow \tfrac12kx^2$, and $\omega = 1/\sqrt{LC} \leftrightarrow \sqrt{k/m}$.`,
    }),
    mcq({
      id: 'quarter-period', difficulty: 2,
      prompt: t`A fully charged capacitor is connected across a coil at $t = 0$ (no resistance). Where is the energy a quarter of a period later?`,
      visual: chargeGraph({ periods: 1.5, vl: [{ x: 0.25, color: 'gold', label: 'T/4' }], caption: 'The charge on the capacitor as a fraction of its starting value, against time in periods.' }),
      choices: [
        'All in the coil’s magnetic field; the current is at its largest',
        'All in the capacitor: the charge has nowhere else to go',
        'Half in the capacitor and half in the coil',
        'None is left: it has turned into heat',
      ],
      answer: 0,
      why: {
        1: 'The charge flows off the plates through the coil — at T/4 the capacitor is empty.',
        2: t`The split is equal at $T/8$, when $q = Q/\sqrt2$. At $T/4$, $q = 0$.`,
        3: 'With no resistance nothing turns into heat: the energy keeps moving between the two fields.',
      },
      hints: [t`What is $q$ at $T/4$? Then what is $q^2/2C$?`, t`The total $q^2/2C + \tfrac12Li^2$ is constant.`],
      teach: 'In an LC circuit the energy is all electric when the charge peaks and all magnetic when the current peaks, a quarter period later.',
      explain: t`$q = Q\cos(2\pi\cdot\tfrac14) = 0$, so $U_E = 0$ and all the energy, $Q^2/2C$, is in the coil: $\tfrac12LI_{\max}^2$. The current is at its peak and still flowing, which is why the capacitor charges up again the other way.`,
    }),
    num({
      id: 'tuning-C', difficulty: 2,
      gen(r) {
        const fk = r.pick([540, 700, 1000, 1600]), LuH = r.pick([200, 240, 330]);
        const f = fk * 1e3, L = LuH * 1e-6, C = 1 / (4 * Math.PI ** 2 * f * f * L);
        return {
          prompt: t`An AM radio is tuned by an LC circuit with a ${LuH} µH coil. What capacitance tunes it to a station at ${fk} kHz?`,
          visual: lcCircuit({ L, C, hide: ['C'] }, 'The tuning circuit: a fixed coil and a variable capacitor.'),
          answer: C * 1e12, units: 'pF', tol: { rel: 0.01 },
          errors: apart([{ value: (1 / (f * f * L)) * 1e12, feedback: t`The $2\pi$ went missing: $\omega = 2\pi f$, so $C = 1/(\omega^2L) = 1/(4\pi^2f^2L)$.` }, { value: (1 / (2 * Math.PI * f * L)) * 1e12, feedback: t`Square the frequency: from $f = 1/(2\pi\sqrt{LC})$, $C = 1/(4\pi^2f^2L)$.` }], C * 1e12),
          hints: [t`Solve $f = \dfrac{1}{2\pi\sqrt{LC}}$ for $C$.`, t`$C = \dfrac{1}{4\pi^2f^2L}$ with $f$ in Hz and $L$ in H.`],
          teach: t`To tune an LC circuit to a frequency $f$, choose $C = 1/(4\pi^2f^2L)$.`,
          explain: t`$C = \dfrac{1}{4\pi^2(${fk}\times10^{3})^2(${LuH}\times10^{-6})} = ${tn(C)}\ \text{F} = ${tn(C * 1e12)}$ pF. Turning the tuning knob turns a variable capacitor across the band.`,
        };
      },
    }),
    mcq({
      id: 'scaling', difficulty: 2,
      prompt: t`The capacitor in an LC circuit is replaced with one of four times the capacitance; the coil is unchanged. The oscillation frequency:`,
      visual: lcCircuit({ L: 2e-3, C: 20e-6, hide: ['C'] }, 'The circuit with its new capacitor.'),
      choices: ['Halves', 'Quarters', 'Doubles', 'Stays the same: only L sets the frequency'],
      answer: 0,
      why: {
        1: t`$f \propto 1/\sqrt{C}$: four times $C$ divides $f$ by $\sqrt4 = 2$, not 4.`,
        2: 'A bigger capacitance is a softer spring: the oscillation gets slower, not faster.',
        3: t`Both $L$ and $C$ enter: $f = 1/(2\pi\sqrt{LC})$.`,
      },
      hints: [t`$f = \dfrac{1}{2\pi\sqrt{LC}}$. What does $\sqrt{4C}$ do?`],
      teach: 'The LC frequency goes as 1/√(LC): four times either L or C halves it.',
      explain: t`$f' = \dfrac{1}{2\pi\sqrt{L(4C)}} = \dfrac{f}{2}$. Like a spring four times softer, the charge sloshes half as fast.`,
    }),
    num({
      id: 'charge-at-time', difficulty: 3,
      gen(r) {
        const [LmH, CuF] = r.pick([[2, 5], [8, 5], [2, 20], [0.5, 5]]), tus = r.pick([50, 100, 150, 250]), QuC = r.pick([20, 40, 60]);
        const w = 1 / Math.sqrt(LmH * 1e-3 * CuF * 1e-6), q = QuC * Math.cos(w * tus * 1e-6);
        return {
          prompt: t`An LC circuit with $L = ${LmH}$ mH and $C = ${CuF}\ \mu$F starts at $t = 0$ with ${QuC} µC on the capacitor’s upper plate and no current. What is the charge on that plate at $t = ${tus}\ \mu$s? (Give the sign.)`,
          visual: { type: 'graph', params: { x: [0, 400], y: [-1.3 * QuC, 1.3 * QuC], aspect: 'wide', axesAt: 'edge', xlabel: 't (µs)', ylabel: 'q', yticks: 0.001, curves: [{ fn: `${QuC}*cos(${r6(w * 1e-6)}*x)`, color: COL.C, width: 2.6 }], vlines: [{ x: tus, color: 'gold', label: `${tus} µs` }] }, caption: 'The charge on the upper plate against time (charge axis left unnumbered); the gold line marks the moment asked about.' },
          answer: q, units: 'µC', tol: { rel: 0.01, abs: 0.05 },
          errors: apart([{ value: QuC * Math.cos(((w * tus * 1e-6) * Math.PI) / 180), feedback: t`$\omega t$ is in radians: set your calculator to radians.` }, { value: QuC * Math.cos((w * tus * 1e-6) / (2 * Math.PI)), feedback: t`$\omega = 1/\sqrt{LC}$ is already in rad/s — the phase is simply $\omega t$.` }], q),
          hints: [t`$q = Q\cos\omega t$ with $\omega = 1/\sqrt{LC}$.`, t`$\omega = ${tn(w)}$ rad/s, so $\omega t = ${tn(w * tus * 1e-6)}$ rad.`],
          teach: t`Started fully charged and at rest, the charge follows $q = Q\cos\omega t$ — evaluate the phase $\omega t$ in radians.`,
          explain: t`$\omega = 1/\sqrt{(${LmH}\times10^{-3})(${CuF}\times10^{-6})} = ${tn(w)}$ rad/s, $\omega t = ${tn(w * tus * 1e-6)}$ rad, $\;q = ${QuC}\cos(${tn(w * tus * 1e-6)}) = ${tn(q)}\ \mu$C${q < 0 ? ' — negative: the upper plate now holds the negative charge' : ''}.`,
        };
      },
    }),
    mcq({
      id: 'damped', difficulty: 2,
      prompt: t`The same LC circuit, now with a few ohms of resistance in the loop. Why does its oscillation die away?`,
      visual: acPic({ mode: 'lc', L: 2e-3, C: 5e-6, V0: 10, R: 4, t: 1.2e-3, bars: false }, 'The circuit with a 4 Ω resistance, and its charge and current. Time is real; the window is three periods long.'),
      choices: [
        'Each cycle the resistor turns some of the energy into heat',
        'Charge leaks across the capacitor’s gap',
        'The coil’s inductance falls as the current flows',
        'The resistor stops the current from reversing',
      ],
      answer: 0,
      why: {
        1: 'An ideal capacitor’s gap is an insulator; no charge crosses it.',
        2: 'Inductance is fixed by the coil’s shape and turns; it does not wear out.',
        3: 'The current still reverses every half period — the swings just shrink.',
      },
      hints: [t`Which element takes energy out of the circuit for good? What does it turn it into?`],
      teach: 'Resistance in an LC circuit turns energy into heat each cycle, so the oscillation decays — the electrical twin of friction.',
      explain: t`The resistor dissipates $i^2R$ whenever current flows, so the total $q^2/2C + \tfrac12Li^2$ falls cycle by cycle and the amplitude decays as $e^{-Rt/2L}$. With small $R$ the frequency barely changes. Real circuits also lose a little energy to radiation — that is how an antenna works.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-period', difficulty: 2,
      gen(r) {
        const LmH = r.pick([0.5, 4, 15, 50]), CnF = r.pick([10, 47, 100, 470]);
        const T = 2 * Math.PI * Math.sqrt(LmH * 1e-3 * CnF * 1e-9);
        return {
          prompt: t`What is the period of oscillation of an LC circuit made of a ${LmH} mH coil and a ${CnF} nF capacitor?`,
          visual: lcCircuit({ L: LmH * 1e-3, C: CnF * 1e-9 }, 'The LC circuit.'),
          answer: T * 1e6, units: 'µs', tol: { rel: 0.01 },
          hints: [t`$T = 2\pi\sqrt{LC}$, with $L$ in henries and $C$ in farads.`],
          teach: t`The period of an LC circuit is $T = 2\pi\sqrt{LC}$.`,
          explain: t`$T = 2\pi\sqrt{(${LmH}\times10^{-3})(${CnF}\times10^{-9})} = ${tn(T)}$ s $= ${tn(T * 1e6)}\ \mu$s.`,
        };
      },
    }),
    num({
      id: 'cp-max-current', difficulty: 2,
      gen(r) {
        const CuF = r.pick([1, 3.3, 6.8]), V = r.pick([6, 15, 30]), LmH = r.pick([0.5, 2, 5]);
        const I = V * Math.sqrt((CuF * 1e-6) / (LmH * 1e-3));
        return {
          prompt: t`A ${CuF} µF capacitor charged to ${V} V is connected across a ${LmH} mH coil. What is the peak current?`,
          visual: lcCircuit({ L: LmH * 1e-3, C: CuF * 1e-6, V0: V, bars: true }, 'The circuit at the moment of connection, all its energy in the capacitor.'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          hints: [t`$\tfrac12CV^2 = \tfrac12LI_{\max}^2$.`],
          teach: 'All the energy moves from the capacitor to the coil and back, so ½CV² = ½LI²max.',
          explain: t`$I_{\max} = V\sqrt{C/L} = ${V}\sqrt{${CuF}\times10^{-6}/${LmH}\times10^{-3}} = ${tn(I)}$ A.`,
        };
      },
    }),
    num({
      id: 'cp-weather', difficulty: 3, transfer: true,
      gen(r) {
        const LuH = r.pick([0.1, 0.15, 0.22]), fM = r.pick([137.1, 137.5, 137.9]);
        const f = fM * 1e6, L = LuH * 1e-6, C = 1 / (4 * Math.PI ** 2 * f * f * L);
        return {
          prompt: t`Weather satellites in polar orbit send their pictures down in the 137 MHz band. A ground station’s receiver selects ${fM} MHz with an LC circuit built around a ${LuH} µH coil. What capacitance does the circuit need?`,
          visual: lcCircuit({ L, C, hide: ['C'] }, 'The receiver’s tuned circuit drawn as a plain LC loop. At these frequencies a coil is a few turns of wire and the capacitor a few picofarads, so even the wiring’s stray capacitance matters.'),
          answer: C * 1e12, units: 'pF', tol: { rel: 0.01 },
          errors: apart([{ value: (1 / (f * f * L)) * 1e12, feedback: t`Include the $2\pi$: $C = 1/(4\pi^2f^2L)$.` }], C * 1e12),
          hints: [t`$f = \dfrac{1}{2\pi\sqrt{LC}}$, so $C = \dfrac{1}{4\pi^2f^2L}$.`, t`$f = ${fM}\times10^6$ Hz and $L = ${LuH}\times10^{-6}$ H.`],
          teach: 'The same LC formula tunes everything from AM radio to satellite receivers; at higher frequency the parts just get smaller.',
          explain: t`$C = \dfrac{1}{4\pi^2(${fM}\times10^6)^2(${LuH}\times10^{-6})} = ${tn(C * 1e12)}$ pF — only a few picofarads, so the layout of the circuit board itself becomes part of the tuning.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §14.5 Oscillations in an LC circuit', url: 'https://openstax.org/books/university-physics-volume-2/pages/14-5-oscillations-in-an-lc-circuit' },
  ],
});
