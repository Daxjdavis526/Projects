// Resonance and power in AC circuits: a series RLC driven at ω₀ = 1/√(LC) has
// X_L = X_C, so Z = R and the current peaks at V/R — finite, set by R — in
// phase with the source. Average power is I_rms V_rms cos φ = I_rms²R: only R
// absorbs energy; L and C return it each cycle. Q = ω₀L/R sets the sharpness,
// with half-power bandwidth Δω = R/L = ω₀/Q.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, sf, r6, apart, acPic, acTraces, impedanceTriangle, COL } from './_maxwell.js';

const t = String.raw;
const TAU = 2 * Math.PI;

/** resonance numbers for a series RLC */
function res({ R, L, C }) {
  const w0 = 1 / Math.sqrt(L * C), g = R / (2 * L), root = Math.sqrt(g * g + w0 * w0);
  return { w0, f0: w0 / TAU, Q: (w0 * L) / R, dw: R / L, df: R / (TAU * L), f1: (root - g) / TAU, f2: (root + g) / TAU };
}
/** the rms current at frequency f for an rms source V */
const Irms = ({ V, R, L, C }, f) => V / Math.hypot(R, TAU * f * L - 1 / (TAU * f * C));

/**
 * The resonance curve: rms current (or average power) against frequency for a
 * series RLC on an rms source V. `numbers: false` hides the axis numbers;
 * `band` shades the half-power band; `f0line` marks the resonance.
 */
function resCurve({ R, L, C, V = 10, y = 'I', fmax, numbers = true, band = false, f0line = false, vl = [], extra = [], points = [], caption }) {
  const r = res({ R, L, C }), fm = fmax ?? r.f0 * 2.2;
  const I = `${r6(V)}/sqrt(${r6(R * R)} + (${r6(TAU * L)}*x - 1/(${r6(TAU * C)}*x))^2)`;
  const fn = y === 'P' ? `(${I})^2*${r6(R)}` : I;
  const top = y === 'P' ? (V * V) / R : V / R;
  return {
    type: 'graph',
    params: {
      x: [0, r6(fm)], y: [0, r6(top * 1.2)], aspect: 'wide', axesAt: 'edge', xlabel: 'f (Hz)', ylabel: y === 'P' ? 'P (W)' : 'I rms (A)',
      ...(numbers ? {} : { xticks: 0.001, yticks: 0.001 }),
      curves: [{ fn, color: y === 'P' ? COL.R : COL.i, width: 2.6, domain: [r6(fm * 0.004), r6(fm)] }, ...extra],
      shade: band ? [{ fn: r6(top * 1.2), from: r6(r.f1), to: r6(r.f2), color: 'gold', alpha: 0.14 }] : [],
      hlines: band ? [{ y: r6(y === 'P' ? top / 2 : top / Math.SQRT2), color: 'ink3', label: y === 'P' ? 'half power' : '1/√2 of the peak' }] : [],
      vlines: [...(f0line ? [{ x: r6(r.f0), color: 'gold', label: 'f₀' }] : []), ...vl],
      points,
    },
    caption,
  };
}

const EX = { R: 10, L: 0.1, C: 10e-6, V: 10 };
Object.assign(EX, res(EX));
EX.I140 = Irms(EX, 140); EX.Z140 = EX.V / EX.I140; EX.P140 = EX.I140 ** 2 * EX.R;

export default lesson({
  id: 'phys2220.B5.3',
  title: 'Resonance and power in AC circuits',
  minutes: 13, difficulty: 3,
  intro: t`Drive a series RLC circuit with the same source at different frequencies. Low down the capacitor blocks; high up the coil does; in between, at one frequency, their reactances cancel exactly. There $X_L = X_C$, the impedance falls to $Z = R$, and the current peaks — at $V/R$, **large but finite**, and in phase with the source. That is **resonance**. Averaged over a cycle, the source delivers power

$$P_\text{avg} = I_\text{rms}V_\text{rms}\cos\phi = I_\text{rms}^2R, \qquad \omega_0 = \frac{1}{\sqrt{LC}}, \qquad Q = \frac{\omega_0L}{R}$$

Only the resistor absorbs energy; the coil and the capacitor store it and hand it back every cycle. The **quality factor** $Q$ measures how sharp the peak is: the band between the two half-power frequencies is $\Delta\omega = R/L = \omega_0/Q$ wide.`,
  symbols: [
    { tex: t`P_\text{avg}`, text: 'the average power the source delivers — all of it into the resistance — in watts (W)' },
    { tex: t`I_\text{rms},\ V_\text{rms}`, text: t`root-mean-square values, the amplitudes divided by $\sqrt2$: the steady DC values that would heat a resistor equally. Mains and aircraft voltages (120 V, 230 V, 115 V) are quoted as rms` },
    { tex: t`\cos\phi`, text: t`the **power factor**, $R/Z$: 1 at resonance, smaller the more the current is out of step with the voltage` },
    { tex: t`\omega_0`, text: t`the resonant angular frequency, where $X_L = X_C$; $f_0 = \omega_0/2\pi$ — the frequency at which the LC pair would oscillate on its own` },
    { tex: 'Q', text: t`the quality factor (no units): large $Q$ means a tall, narrow peak. At resonance $V_L = V_C = Q\,V$` },
    { tex: t`\Delta\omega`, text: t`the bandwidth between the two frequencies where the power falls to half its peak (and the current to $1/\sqrt2$ of its peak); in hertz, $\Delta f = R/2\pi L$` },
  ],
  why: 'Resonance is how a radio picks one station out of thousands, how a filter passes one band, and — in its mechanical form — why engineers keep structures and engines away from their natural frequencies.',
  visual: {
    type: 'em-ac',
    title: 'Tune through the resonance',
    lead: t`The current amplitude of a series RLC circuit against the drive frequency, with the half-power band shaded. On the right, the phasors at the drive frequency, measured from the current: $v_R$ along it, the net $v_L - v_C$ at right angles, and the source voltage $v$ their sum.`,
    tasks: [
      'Slide f to f₀: the coil and capacitor voltages cancel and the source voltage lines up with the current.',
      'Halve R: the peak doubles in height and halves in width — Q doubles.',
      'Read the coil voltage at f₀: ten times the source’s, though nothing is “amplified” — energy just sloshes between L and C.',
      'Switch to average power: it falls to half its peak at the edges of the band.',
    ],
    params: { mode: 'resonance', R: 10, L: 0.1, C: 10e-6, V0: 14.142, f: 140 },
  },
  example: {
    prompt: t`A 10.0 V rms source drives $R = 10.0\ \Omega$, $L = 0.100$ H and $C = 10.0\ \mu$F in series. Find (a) the resonant frequency, (b) the rms current and the average power there, (c) $Q$ and the bandwidth, and (d) the rms current, power factor and power at 140 Hz.`,
    visual: resCurve({ ...EX, band: true, f0line: true, points: [{ x: 140, y: r6(Irms(EX, 140)), color: 'violet', r: 5, label: '140 Hz', labelDx: -54, labelDy: -4 }], caption: 'The rms current against frequency for this circuit, with the half-power band shaded; the violet dot is the circuit driven at 140 Hz.' }),
    steps: [
      { label: '(a) Resonance', text: t`$\omega_0 = 1/\sqrt{LC} = 1/\sqrt{(0.100)(10.0\times10^{-6})} = ${tn(EX.w0)}$ rad/s, so $f_0 = ${tn(EX.f0)}$ Hz.` },
      { label: '(b) At resonance', text: t`$X_L = X_C = \omega_0L = 100\ \Omega$ cancel, so $Z = R = 10.0\ \Omega$: $I_\text{rms} = 10.0/10.0 = 1.00$ A, and $P = I_\text{rms}^2R = 10.0$ W. The current is finite: $R$ alone limits it.` },
      { label: 'The hidden voltages', text: t`Across the coil alone, $V_L = I_\text{rms}X_L = (1.00)(100) = 100$ V rms — ten times the source. The capacitor has the same, in opposition, so they cancel in the loop.` },
      { label: '(c) Sharpness', text: t`$Q = \omega_0L/R = (${tn(EX.w0)})(0.100)/10.0 = ${tn(EX.Q)}$ (just the ratio $V_L/V$ found above). The bandwidth is $\Delta f = R/2\pi L = ${tn(EX.df)}$ Hz $= f_0/Q$: half power at $${tn(EX.f1, 4)}$ Hz and $${tn(EX.f2, 4)}$ Hz.` },
      { label: '(d) Off resonance', text: t`At 140 Hz: $X_L = ${tn(TAU * 140 * EX.L)}\ \Omega$, $X_C = ${tn(1 / (TAU * 140 * EX.C))}\ \Omega$, $Z = ${tn(EX.Z140)}\ \Omega$, so $I_\text{rms} = ${tn(EX.I140)}$ A. The power factor is $\cos\phi = R/Z = ${tn(EX.R / EX.Z140)}$ and $P = I_\text{rms}^2R = ${tn(EX.P140)}$ W — check: $V_\text{rms}I_\text{rms}\cos\phi$ gives the same.` },
      { label: 'Sense check', text: t`19 Hz off resonance — a bit more than the bandwidth — the power has dropped from 10.0 W to ${tn(EX.P140, 2)} W: a $Q$ of 10 already picks one frequency out quite sharply.` },
    ],
    answer: t`(a) $f_0 = ${tn(EX.f0)}$ Hz; (b) 1.00 A, 10.0 W; (c) $Q = 10.0$, $\Delta f = ${tn(EX.df)}$ Hz; (d) ${tn(EX.I140)} A, $\cos\phi = ${tn(EX.R / EX.Z140)}$, ${tn(EX.P140)} W.`,
  },
  practice: [
    num({
      id: 'f0', difficulty: 1,
      gen(r) {
        const LmH = r.pick([10, 50, 200]), CuF = r.pick([1, 4.7, 22, 100]);
        const p = { R: 10, L: LmH * 1e-3, C: CuF * 1e-6 }, f0 = res(p).f0;
        return {
          prompt: t`At what frequency does a series circuit with $L = ${LmH}$ mH and $C = ${CuF}\ \mu$F resonate?`,
          visual: resCurve({ ...p, numbers: false, caption: 'The shape of the circuit’s response against frequency (axis numbers hidden): one peak, at resonance.' }),
          answer: f0, units: 'Hz', tol: { rel: 0.01 },
          errors: apart([{ value: TAU * f0, feedback: t`That is $\omega_0$ in rad/s; the frequency is $f_0 = \omega_0/2\pi$.` }, { value: 1 / (TAU * p.L * p.C), feedback: t`Take the square root: $f_0 = 1/(2\pi\sqrt{LC})$.` }], f0),
          hints: [t`$X_L = X_C$ gives $\omega_0 = 1/\sqrt{LC}$; then $f_0 = \omega_0/2\pi$.`],
          teach: t`A series RLC resonates at $f_0 = 1/(2\pi\sqrt{LC})$, whatever its resistance.`,
          explain: t`$f_0 = \dfrac{1}{2\pi\sqrt{(${LmH}\times10^{-3})(${CuF}\times10^{-6})}} = ${tn(f0)}$ Hz.`,
        };
      },
    }),
    mcq({
      id: 'finite-peak', difficulty: 2,
      prompt: t`A series RLC circuit with $R = 5.0\ \Omega$ is driven by a 10 V rms source exactly at its resonant frequency. What rms current flows?`,
      visual: acPic({ mode: 'ac', elements: 'RLC', V0: 14.14, f: 159.15, R: 5, L: 0.1, C: 10e-6, phase: 50, strip: true, traces: ['v', 'i'], hide: ['V0'] }, 'The circuit at resonance: the coil and capacitor voltages are equal and opposite, the source voltage lines up with the current, and the graphs peak together. The current is drawn to its own scale.'),
      choices: ['2.0 A', 'Infinite: the reactances cancel, so nothing limits the current', 'Zero: the coil and the capacitor cancel each other out', 'It cannot be found without L and C'],
      answer: 0,
      why: {
        1: t`The reactances cancel, but the resistance does not: $Z = R = 5.0\ \Omega$, so the current is $V/R$. It would grow without limit only if $R$ were zero.`,
        2: 'They cancel each other’s voltages in the loop — which makes the current larger, not zero.',
        3: t`At resonance $L$ and $C$ drop out: $Z = R$, so $I_\text{rms} = V_\text{rms}/R$.`,
      },
      hints: [t`At resonance $X_L - X_C = 0$. What is $Z$ then?`],
      teach: 'At resonance the impedance falls to R, so the current peaks at V/R — finite, and limited by the resistance alone.',
      explain: t`$Z = \sqrt{R^2 + 0^2} = 5.0\ \Omega$, so $I_\text{rms} = 10/5.0 = 2.0$ A. Resonance makes the current as large as the resistance allows — not infinite.`,
    }),
    num({
      id: 'Q', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 5, 20]), L = r.pick([0.05, 0.2]), CuF = r.pick([1, 10]);
        const p = { R, L, C: CuF * 1e-6 }, Q = res(p).Q;
        return {
          prompt: t`What is the quality factor of a series RLC circuit with $R = ${R}\ \Omega$, $L = ${L}$ H and $C = ${CuF}\ \mu$F?`,
          visual: resCurve({ ...p, numbers: false, band: true, caption: 'The circuit’s resonance peak with its half-power band shaded (axis numbers hidden).' }),
          answer: Q, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / Q, feedback: t`Upside down: $Q = \omega_0L/R$ grows as $R$ shrinks.` }, { value: res(p).w0 / R, feedback: t`$Q = \omega_0L/R$ — the inductance belongs on top.` }], Q),
          hints: [t`$Q = \omega_0L/R$ with $\omega_0 = 1/\sqrt{LC}$.`, t`Equivalently $Q = \dfrac{1}{R}\sqrt{\dfrac{L}{C}}$.`],
          teach: t`$Q = \omega_0L/R = \frac{1}{R}\sqrt{L/C}$: a small resistance gives a sharp, high-$Q$ resonance.`,
          explain: t`$\omega_0 = ${tn(res(p).w0)}$ rad/s, so $Q = (${tn(res(p).w0)})(${L})/${R} = ${tn(Q)}$.`,
        };
      },
    }),
    num({
      id: 'bandwidth', difficulty: 2,
      gen(r) {
        const R = r.pick([4, 10, 25]), LmH = r.pick([20, 100, 250]), CuF = r.pick([0.47, 2.2, 10]);
        const p = { R, L: LmH * 1e-3, C: CuF * 1e-6 }, x = res(p);
        return {
          prompt: t`A series RLC circuit has $R = ${R}\ \Omega$, $L = ${LmH}$ mH and $C = ${CuF}\ \mu$F. How wide, in hertz, is the band between its half-power frequencies?`,
          visual: resCurve({ ...p, y: 'P', numbers: false, band: true, caption: 'The average power against frequency (axis numbers hidden). The shaded band runs between the two half-power frequencies.' }),
          answer: x.df, units: 'Hz', tol: { rel: 0.01 },
          errors: apart([{ value: x.dw, feedback: t`$R/L$ is the bandwidth in rad/s; divide by $2\pi$ for hertz.` }, { value: x.f0, feedback: 'That is the resonant frequency itself, not the width of the peak.' }], x.df),
          hints: [t`$\Delta\omega = R/L$, so $\Delta f = R/2\pi L$ — or find $f_0$ and $Q$ and use $\Delta f = f_0/Q$.`],
          teach: t`The half-power bandwidth of a series RLC is $\Delta f = R/2\pi L = f_0/Q$.`,
          explain: t`$\Delta f = \dfrac{${R}}{2\pi(${LmH}\times10^{-3})} = ${tn(x.df)}$ Hz, around $f_0 = ${tn(x.f0)}$ Hz: $Q = f_0/\Delta f = ${tn(x.Q)}$.`,
        };
      },
    }),
    num({
      id: 'avg-power', difficulty: 2,
      gen(r) {
        const [R, X, Z] = r.pick([[30, 40, 50], [60, 80, 100], [12, 16, 20], [20, 21, 29]]), V = r.pick([120, 115, 230]);
        const I = V / Z, P = I * I * R;
        return {
          prompt: t`A ${V} V rms source drives a series circuit with resistance ${R} Ω and net reactance ${X} Ω. What average power does the source deliver?`,
          visual: impedanceTriangle({ R, X, labels: { R: `R = ${R} Ω`, X: `net reactance ${X} Ω`, Z: 'Z' }, caption: 'The impedance triangle, to scale.' }),
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: apart([{ value: V * I, feedback: t`$V_\text{rms}I_\text{rms}$ is the apparent power: multiply by the power factor $\cos\phi = R/Z$.` }, { value: (V * V) / R, feedback: t`Not all of the source voltage is across $R$: first find $I = V/Z$, then $P = I^2R$.` }], P),
          hints: [t`$Z = \sqrt{R^2 + X^2}$, then $I_\text{rms} = V/Z$ and $P = I_\text{rms}^2R$.`, t`Or $P = V_\text{rms}I_\text{rms}\cos\phi$ with $\cos\phi = R/Z$.`],
          teach: t`Average power goes only into resistance: $P = I_\text{rms}^2R = V_\text{rms}I_\text{rms}\cos\phi$.`,
          explain: t`$Z = ${Z}\ \Omega$, $I_\text{rms} = ${V}/${Z} = ${tn(I)}$ A, so $P = (${tn(I)})^2(${R}) = ${tn(P)}$ W. The power factor is $${R}/${Z} = ${tn(R / Z)}$.`,
        };
      },
    }),
    mcq({
      id: 'power-in-L', difficulty: 2,
      prompt: t`Averaged over a whole cycle, how much power does an ideal coil take from an AC source?`,
      visual: acTraces({ phi: 90, caption: 'The voltage across an ideal coil (gold) and the current through it (blue), against time in periods. Where they have the same sign, power flows into the coil; where opposite, out.' }),
      choices: ['None', t`$I_\text{rms}^2X_L$`, t`$I_\text{rms}V_\text{rms}$`, t`Half of $I_\text{rms}V_\text{rms}$`],
      answer: 0,
      why: {
        1: 'That treats reactance like resistance. Reactance sets how much current flows, but no energy is lost in it.',
        2: t`That is the apparent power. With the current 90° out of step, $\cos\phi = 0$.`,
        3: 'The coil takes energy in for one quarter cycle and gives all of it back in the next.',
      },
      hints: [t`$P = I_\text{rms}V_\text{rms}\cos\phi$. What is $\phi$ for an ideal coil?`, 'Compare the signs of v and i on the graph, quarter cycle by quarter cycle.'],
      teach: 'Ideal coils and capacitors store energy and return it each cycle: on average they take no power.',
      explain: t`With $\phi = 90^\circ$, $\cos\phi = 0$. In each quarter cycle where $v$ and $i$ have the same sign the coil stores $\tfrac12LI^2$; in the next it gives it all back. Only resistance turns electrical energy into heat.`,
    }),
    num({
      id: 'rms-peak', difficulty: 1,
      gen(r) {
        const [V, what] = r.pick([[120, 'a North American wall outlet'], [230, 'a European wall outlet'], [115, 'an aircraft’s 400 Hz bus']]);
        return {
          prompt: t`The voltage of ${what} is quoted as ${V} V rms. What is its peak voltage?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (periods)', ylabel: 'v', yticks: 0.001, curves: [{ fn: 'sin(2*pi*x)', color: COL.v, width: 2.6 }], hlines: [{ y: 1, color: 'ink3', label: 'peak' }, { y: r6(1 / Math.SQRT2), color: 'violet', label: 'rms' }] }, caption: 'One sinusoidal voltage against time: the peak, and the rms value at 1/√2 of it.' },
          answer: V * Math.SQRT2, units: 'V', tol: { rel: 0.01 },
          errors: apart([{ value: V / Math.SQRT2, feedback: t`The peak is larger than the rms value: $V_0 = \sqrt2\,V_\text{rms}$.` }, { value: 2 * V, feedback: t`The factor is $\sqrt2$, not 2.` }], V * Math.SQRT2),
          hints: [t`$V_\text{rms} = V_0/\sqrt2$.`],
          teach: t`For a sinusoid, $V_\text{rms} = V_0/\sqrt2$, so the peak is $\sqrt2 \approx 1.41$ times the rms value.`,
          explain: t`$V_0 = \sqrt2\,(${V}\ \text{V}) = ${tn(V * Math.SQRT2)}$ V. The rms value is the steady voltage that would heat a resistor equally: $\overline{v^2} = V_0^2/2$.`,
        };
      },
    }),
    mcq({
      id: 'halve-R', difficulty: 3,
      prompt: t`The resistance of a series RLC circuit is halved; $L$ and $C$ stay the same. What happens to its resonance peak (current against frequency)?`,
      visual: resCurve({ R: 10, L: 0.1, C: 10e-6, numbers: false, band: true, f0line: true, caption: 'The resonance peak before the change, with its half-power band shaded (axis numbers hidden).' }),
      choices: ['It becomes twice as tall and half as wide, at the same frequency', 'It becomes twice as tall, with the same width', 'It moves to a higher frequency', 'It keeps its height and becomes half as wide'],
      answer: 0,
      why: {
        1: t`The width is $\Delta f = R/2\pi L$: halving $R$ halves it too.`,
        2: t`$f_0 = 1/2\pi\sqrt{LC}$ does not involve $R$.`,
        3: t`The peak current is $V/R$, so halving $R$ doubles it.`,
      },
      hints: [t`Which of $f_0 = 1/2\pi\sqrt{LC}$, $I_\text{peak} = V/R$ and $\Delta f = R/2\pi L$ depend on $R$?`, t`$Q = \omega_0L/R$ doubles.`],
      teach: 'Resistance sets the height (V/R) and width (R/2πL) of the resonance peak, but not where it is.',
      explain: t`$f_0$ is unchanged, $I_\text{peak} = V/R$ doubles and $\Delta f = R/2\pi L$ halves: $Q$ doubles. A radio with less resistance in its tuned circuit picks out stations more sharply.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-power-at-f', difficulty: 2,
      gen(r) {
        const f = r.pick([120, 140, 180, 200]);
        const p = { R: 10, L: 0.1, C: 10e-6, V: 10 }, I = Irms(p, f), P = I * I * p.R;
        return {
          prompt: t`A 10.0 V rms source drives $R = 10.0\ \Omega$, $L = 0.100$ H and $C = 10.0\ \mu$F in series at ${f} Hz. What average power does it deliver?`,
          visual: resCurve({ ...p, y: 'P', numbers: false, vl: [{ x: f, color: 'violet', label: `${f} Hz` }], caption: 'The average power against frequency for this circuit (axis numbers hidden); the violet line marks the drive frequency.' }),
          answer: P, units: 'W', tol: { rel: 0.01 },
          hints: [t`Find $Z$ at ${f} Hz, then $I_\text{rms} = V/Z$ and $P = I_\text{rms}^2R$.`, t`$X_L = ${tn(TAU * f * p.L)}\ \Omega$ and $X_C = ${tn(1 / (TAU * f * p.C))}\ \Omega$.`],
          teach: t`Off resonance, $P = V_\text{rms}^2R/Z^2$ — less than the peak $V_\text{rms}^2/R$.`,
          explain: t`$Z = \sqrt{10.0^2 + (${tn(TAU * f * p.L)} - ${tn(1 / (TAU * f * p.C))})^2} = ${tn(p.V / I)}\ \Omega$, $I_\text{rms} = ${tn(I)}$ A, $P = I_\text{rms}^2R = ${tn(P)}$ W (it would be 10.0 W at resonance, 159 Hz).`,
        };
      },
    }),
    mcq({
      id: 'cp-power-factor', difficulty: 2,
      prompt: t`What is the power factor $\cos\phi$ of a series RLC circuit driven exactly at its resonant frequency?`,
      visual: resCurve({ R: 20, L: 0.1, C: 10e-6, numbers: false, f0line: true, caption: 'A series RLC circuit’s current against frequency (axis numbers hidden), driven at the frequency marked f₀.' }),
      choices: ['1', '0', t`$1/\sqrt2$`, 'It depends on R'],
      answer: 0,
      why: {
        1: 'Zero would mean a purely reactive circuit, taking no power at all. At resonance the circuit looks like a pure resistance.',
        2: t`$1/\sqrt2$ is the power factor at the half-power frequencies, where $|X_L - X_C| = R$.`,
        3: t`$\cos\phi = R/Z$, and at resonance $Z = R$ for any $R$.`,
      },
      hints: [t`$\cos\phi = R/Z$. What is $Z$ at resonance?`],
      teach: 'At resonance the source voltage and the current are in phase, so the power factor is 1.',
      explain: t`At resonance $X_L = X_C$, so $Z = R$, $\phi = 0$ and $\cos\phi = 1$: the source sees a plain resistor and every volt-ampere does real work.`,
    }),
    num({
      id: 'cp-gps-filter', difficulty: 3, transfer: true,
      gen(r) {
        const [bw, what] = r.pick([[2.046, 'the C/A-code signal, whose main lobe is 2.046 MHz wide'], [20.46, 'the P(Y)-code signal, whose main lobe is 20.46 MHz wide']]);
        const f0 = 1575.42, Q = f0 / bw;
        return {
          prompt: t`GPS satellites broadcast the L1 signal on a carrier at 1575.42 MHz. A receiver’s front-end filter should pass ${what}, centred on the carrier. If one tuned circuit did the filtering with exactly that half-power bandwidth, what quality factor $Q$ would it need?`,
          visual: { type: 'graph', params: { x: [r6(f0 - 3 * bw), r6(f0 + 3 * bw)], y: [0, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'f (MHz)', ylabel: 'response', yticks: 0.001, curves: [{ fn: `1/sqrt(1 + ${r6(Q * Q)}*(x/${f0} - ${f0}/x)^2)`, color: COL.i, width: 2.6 }], hlines: [{ y: r6(1 / Math.SQRT2), color: 'ink3', label: 'half power' }], vlines: [{ x: f0, color: 'gold', label: 'L1' }], shade: [{ fn: 1.25, from: r6(f0 - bw / 2), to: r6(f0 + bw / 2), color: 'gold', alpha: 0.14 }] }, caption: 'The current response of the filter wanted, around the L1 carrier; the shaded band is the signal it must pass.' },
          answer: Q, tol: { rel: 0.01 },
          errors: apart([{ value: bw / f0, feedback: t`Upside down: $Q = f_0/\Delta f$, a large number for a narrow band.` }, { value: (TAU * f0) / bw, feedback: t`Use $f_0$ and $\Delta f$ both in hertz (or both in rad/s): $Q = f_0/\Delta f$.` }], Q),
          hints: [t`$Q = \omega_0/\Delta\omega = f_0/\Delta f$.`, t`$f_0 = 1575.42$ MHz and $\Delta f = ${bw}$ MHz.`],
          teach: t`$Q = f_0/\Delta f$: picking a narrow band out of a high carrier frequency needs a very high $Q$.`,
          explain: t`$Q = 1575.42/${bw} = ${tn(Q)}$. ${Q > 300 ? 'That is far beyond what a coil and a capacitor manage at 1.5 GHz, which is one reason GPS receivers filter with ceramic or surface-acoustic-wave filters and do the fine selection after shifting the signal to a lower frequency.' : 'Achievable, but at 1.5 GHz the coil and capacitor are tiny and lossy, so receivers use ceramic or surface-acoustic-wave filters instead of a plain LC circuit.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §15.4 Power in an AC circuit', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-4-power-in-an-ac-circuit' },
    { label: 'OpenStax University Physics Vol. 2, §15.5 Resonance in an AC circuit', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-5-resonance-in-an-ac-circuit' },
    { label: 'GPS.gov: the GPS signal in space (IS-GPS-200)', url: 'https://www.gps.gov/technical/icwg/' },
  ],
});
