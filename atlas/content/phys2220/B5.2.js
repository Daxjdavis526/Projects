// The series RLC circuit: one current through R, L and C, whose voltages are
// out of step (v_R with i, v_L 90° ahead, v_C 90° behind), so the amplitudes
// add as phasors: V₀ = I₀Z with Z = √(R² + (X_L − X_C)²) and
// tan φ = (X_L − X_C)/R. Element voltages can exceed the source's.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, sf, r6, apart, acPic, phasorPic, COL, DEG } from './_maxwell.js';

const t = String.raw;
const TAU = 2 * Math.PI;

/** series RLC at frequency f: reactances, impedance, phase (degrees), current and element amplitudes */
function rlc({ V0, f, R, L, C }) {
  const w = TAU * f, XL = w * L, XC = 1 / (w * C), X = XL - XC, Z = Math.hypot(R, X), phi = Math.atan2(X, R) / DEG, I = V0 / Z;
  return { w, XL, XC, X, Z, phi, I, VR: I * R, VL: I * XL, VC: I * XC };
}
const EX = rlc({ V0: 10, f: 120, R: 40, L: 0.1, C: 50e-6 });

/** the impedance triangle: R along x, the net reactance up (inductive) or down (capacitive), Z the hypotenuse */
function impedanceTriangle({ R, X, labels = { R: 'R', X: 'X_L − X_C', Z: 'Z' }, showZ = true, caption }) {
  const s = 1 / Math.max(R, Math.abs(X), 1e-9);
  const r = R * s, x = X * s;
  return {
    type: 'graph',
    params: {
      x: [-0.35, 1.45], y: [Math.min(-0.25, x - 0.2), Math.max(0.25, x + 0.2)], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      arrows: [
        { from: [0, 0], to: [r6(r), 0], color: COL.R, label: labels.R, labelDx: -10, labelDy: x >= 0 ? 14 : -12, labelAlign: 'center' },
        { from: [r6(r), 0], to: [r6(r), r6(x)], color: x >= 0 ? COL.L : COL.C, label: labels.X, labelDx: 8, labelDy: 0, labelAlign: 'left' },
        ...(showZ ? [{ from: [0, 0], to: [r6(r), r6(x)], color: COL.v, label: labels.Z, labelDx: -16, labelDy: x >= 0 ? -10 : 10 }] : []),
      ],
    },
    caption: caption ?? 'The impedance triangle: R along the current’s direction, the net reactance at right angles, and Z their phasor sum.',
  };
}

export default lesson({
  id: 'phys2220.B5.2',
  title: 'The RLC series circuit',
  minutes: 13, difficulty: 3,
  intro: t`Put a resistor, a coil and a capacitor in series across an AC source. The **same current** flows through all three, but their voltages are out of step: $v_R$ is in phase with the current, $v_L$ a quarter cycle ahead of it, $v_C$ a quarter cycle behind. So their amplitudes add as **phasors** — as arrows — not as plain numbers:

$$V_0 = I_0Z, \qquad Z = \sqrt{R^2 + (X_L - X_C)^2}, \qquad \tan\phi = \frac{X_L - X_C}{R}$$

$Z$ is the **impedance**, the AC circuit’s overall ratio of voltage to current, and $\phi$ is the angle by which the source voltage leads the current. Because $v_L$ and $v_C$ point opposite ways they partly cancel — so each can be **larger than the source voltage** itself.`,
  symbols: [
    { tex: 'Z', text: 'the impedance, in ohms: amplitude of the source voltage over amplitude of the current' },
    { tex: 'R', text: 'the resistance (Ω); its voltage $v_R = iR$ is in step with the current' },
    { tex: 'X_L - X_C', text: t`the net reactance, $\omega L - 1/\omega C$ (Ω): positive when the coil wins (high frequency), negative when the capacitor wins (low frequency)` },
    { tex: t`\phi`, text: t`the phase angle, from $-90^\circ$ to $+90^\circ$: positive means the source voltage leads the current (an **inductive** circuit), negative that the current leads (**capacitive**)` },
    { tex: 'V_0,\\ I_0', text: 'the amplitudes of the source voltage and of the current' },
  ],
  why: t`Every AC load — a motor, a loudspeaker, an antenna — is some mix of R, L and C, and its impedance and phase angle decide how much current it draws and how much power it really uses.`,
  visual: {
    type: 'em-ac',
    title: 'Three voltages, one current',
    lead: t`The element voltages $v_R$, $v_L$, $v_C$ drawn head to tail as phasors: their sum is the source voltage $v$ (gold). The current $i$ (blue) is in step with $v_R$. Graphs on the right show all five against time.`,
    tasks: [
      'Follow the chain of arrows: v_R, then v_L, then v_C — it ends exactly at the tip of v.',
      'Compare lengths: v_L is longer than v itself. The coil and the capacitor partly cancel each other.',
      'Lower f until the source voltage lines up with the current: there X_L = X_C and φ = 0.',
      'Raise R: the phase angle shrinks and the current falls.',
    ],
    params: { mode: 'ac', elements: 'RLC', V0: 10, f: 120, R: 40, L: 0.1, C: 50e-6 },
  },
  example: {
    prompt: t`A source of amplitude 10.0 V at 120 Hz drives $R = 40.0\ \Omega$, $L = 0.100$ H and $C = 50.0\ \mu$F in series. Find the reactances, the impedance, the current amplitude, the phase angle, and the voltage amplitude across each element.`,
    visual: impedanceTriangle({ R: EX.R ?? 40, X: EX.X, caption: 'The impedance triangle for this circuit, to scale: R = 40.0 Ω along the current, the net reactance 48.9 Ω upward (the coil wins at 120 Hz), and Z.' }),
    steps: [
      { label: 'Reactances', text: t`$\omega = 2\pi(120) = ${tn(EX.w)}$ rad/s: $X_L = \omega L = ${tn(EX.XL)}\ \Omega$ and $X_C = 1/\omega C = ${tn(EX.XC)}\ \Omega$.` },
      { label: 'Impedance', text: t`$Z = \sqrt{40.0^2 + (${tn(EX.XL)} - ${tn(EX.XC)})^2} = \sqrt{40.0^2 + ${tn(EX.X)}^2} = ${tn(EX.Z)}\ \Omega$.` },
      { label: 'Current', text: t`$I_0 = V_0/Z = 10.0/${tn(EX.Z)} = ${tn(EX.I)}$ A — the same in all three elements.` },
      { label: 'Phase', text: t`$\tan\phi = ${tn(EX.X)}/40.0$, so $\phi = ${tn(EX.phi)}^\circ$: positive, so the circuit is inductive and the current lags the source by ${tn(EX.phi)}°.` },
      { label: 'Element voltages', text: t`$V_R = I_0R = ${tn(EX.VR)}$ V, $V_L = I_0X_L = ${tn(EX.VL)}$ V, $V_C = I_0X_C = ${tn(EX.VC)}$ V. Note $V_L$ is **larger than the source’s 10.0 V**.` },
      { label: 'Phasor check', text: t`As numbers they add to ${tn(EX.VR + EX.VL + EX.VC)} V — not 10.0 V. As phasors, $\sqrt{V_R^2 + (V_L - V_C)^2} = \sqrt{${tn(EX.VR)}^2 + ${tn(EX.VL - EX.VC)}^2} = ${tn(Math.hypot(EX.VR, EX.VL - EX.VC))}$ V. ✓ The peaks happen at different moments, so the amplitudes do not simply add.` },
    ],
    answer: t`$X_L = ${tn(EX.XL)}\ \Omega$, $X_C = ${tn(EX.XC)}\ \Omega$, $Z = ${tn(EX.Z)}\ \Omega$, $I_0 = ${tn(EX.I)}$ A, $\phi = +${tn(EX.phi)}^\circ$; $V_R = ${tn(EX.VR)}$ V, $V_L = ${tn(EX.VL)}$ V, $V_C = ${tn(EX.VC)}$ V.`,
  },
  practice: [
    num({
      id: 'impedance', difficulty: 2,
      gen(r) {
        const R = r.pick([30, 40, 60, 80]), XL = r.pick([50, 90, 120, 200]), XC = r.pick([20, 60, 150, 250]);
        const Z = Math.hypot(R, XL - XC);
        return {
          prompt: t`In a series RLC circuit at some frequency, $R = ${R}\ \Omega$, $X_L = ${XL}\ \Omega$ and $X_C = ${XC}\ \Omega$. What is the impedance?`,
          visual: impedanceTriangle({ R, X: XL - XC, labels: { R: `R = ${R} Ω`, X: `X_L − X_C = ${XL - XC} Ω`.replace('X_L − X_C', 'net reactance'), Z: 'Z = ?' }, caption: 'The impedance triangle, to scale: R along the current, the net reactance at right angles.' }),
          answer: Z, units: 'Ω', tol: { rel: 0.005 },
          errors: apart([
            { value: R + XL + XC, feedback: 'Impedances do not add as numbers: R and the reactances are at right angles, and X_L and X_C oppose each other.' },
            { value: Math.sqrt(R * R + XL * XL + XC * XC), feedback: t`$X_L$ and $X_C$ point opposite ways: subtract them first, $Z = \sqrt{R^2 + (X_L - X_C)^2}$.` },
            { value: R + Math.abs(XL - XC), feedback: t`R and the net reactance are at right angles: combine them with Pythagoras.` },
          ], Z),
          hints: [t`$Z = \sqrt{R^2 + (X_L - X_C)^2}$.`],
          teach: t`Impedance combines resistance and net reactance at right angles: $Z = \sqrt{R^2 + (X_L - X_C)^2}$.`,
          explain: t`$X_L - X_C = ${XL - XC}\ \Omega$, so $Z = \sqrt{${R}^2 + (${XL - XC})^2} = ${tn(Z)}\ \Omega$.`,
        };
      },
    }),
    num({
      id: 'phase-angle', difficulty: 2,
      gen(r) {
        const R = r.pick([20, 50, 100]), XL = r.pick([30, 80, 150]), XC = r.pick([10, 60, 200]);
        const phi = Math.atan2(XL - XC, R) / DEG;
        return {
          prompt: t`A series RLC circuit has $R = ${R}\ \Omega$, $X_L = ${XL}\ \Omega$ and $X_C = ${XC}\ \Omega$. By what phase angle $\phi$ does the source voltage lead the current? (Negative if it lags.)`,
          visual: impedanceTriangle({ R, X: XL - XC, labels: { R: 'R', X: 'net reactance', Z: 'Z' }, caption: 'The impedance triangle, to scale. The angle at the origin, between R and Z, is the phase angle.' }),
          answer: phi, units: '°', tol: { rel: 0.01, abs: 0.2 },
          errors: apart([{ value: Math.atan2(XL + XC, R) / DEG, feedback: t`Use the net reactance, $X_L - X_C$: the two reactances push in opposite directions.` }, { value: Math.atan2(R, XL - XC) / DEG, feedback: t`$\tan\phi$ is reactance over resistance: $\tan\phi = (X_L - X_C)/R$.` }], phi),
          hints: [t`$\tan\phi = \dfrac{X_L - X_C}{R}$; keep the sign.`],
          teach: t`The phase angle comes from $\tan\phi = (X_L - X_C)/R$: positive (inductive) when the coil wins, negative (capacitive) when the capacitor wins.`,
          explain: t`$\tan\phi = \dfrac{${XL} - ${XC}}{${R}} = ${tn((XL - XC) / R)}$, so $\phi = ${tn(phi)}^\circ$ — ${phi > 0 ? 'positive: inductive, the current lags the source' : 'negative: capacitive, the current leads the source'}.`,
        };
      },
    }),
    num({
      id: 'current', difficulty: 2,
      gen(r) {
        const V0 = r.pick([10, 20, 50]), f = r.pick([60, 100, 500]), R = r.pick([25, 50, 100]), LmH = r.pick([50, 100, 200]), CuF = r.pick([5, 20, 50]);
        const c = rlc({ V0, f, R, L: LmH * 1e-3, C: CuF * 1e-6 });
        return {
          prompt: t`A source of amplitude ${V0} V at ${f} Hz drives $R = ${R}\ \Omega$, $L = ${LmH}$ mH and $C = ${CuF}\ \mu$F in series. What is the current amplitude?`,
          visual: acPic({ mode: 'ac', elements: 'RLC', V0, f, R, L: LmH * 1e-3, C: CuF * 1e-6, phase: 70, strip: true, phasors: ['R', 'L', 'C'], traces: ['i'] }, 'The circuit, its element voltages as phasors drawn head to tail, and the current against time (to its own scale).'),
          answer: c.I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: V0 / (R + c.XL + c.XC), feedback: 'Add R and the reactances as phasors, not as numbers: Z = √(R² + (X_L − X_C)²).' }, { value: V0 / R, feedback: t`That ignores the reactances: only at resonance is $Z = R$.` }], c.I),
          hints: [t`Find $X_L = \omega L$ and $X_C = 1/\omega C$, then $Z$, then $I_0 = V_0/Z$.`, t`$X_L = ${tn(c.XL)}\ \Omega$ and $X_C = ${tn(c.XC)}\ \Omega$.`],
          teach: t`In a series AC circuit, $I_0 = V_0/Z$ with $Z = \sqrt{R^2 + (X_L - X_C)^2}$.`,
          explain: t`$X_L = ${tn(c.XL)}\ \Omega$, $X_C = ${tn(c.XC)}\ \Omega$, $Z = \sqrt{${R}^2 + (${tn(c.X)})^2} = ${tn(c.Z)}\ \Omega$, so $I_0 = ${V0}/${tn(c.Z)} = ${tn(c.I)}$ A.`,
        };
      },
    }),
    mcq({
      id: 'voltages-dont-add', difficulty: 2,
      prompt: t`In a series RLC circuit, an AC voltmeter shows these amplitudes: $V_R = 30$ V across the resistor, $V_L = 80$ V across the coil and $V_C = 40$ V across the capacitor. What is the amplitude of the source voltage?`,
      visual: phasorPic({ items: [{ len: 0.45, deg: 0, color: COL.R, label: 'V_R = 30 V'.replace('V_R', 'resistor') }, { len: 1.2, deg: 90, color: COL.L, label: 'coil 80 V', ldx: 6, ldy: -6 }, { len: 0.6, deg: -90, color: COL.C, label: 'capacitor 40 V', ldx: 6, ldy: 12 }], R: 1.25, circle: false, caption: 'The three element voltages as phasors, to scale, at an instant when the current points to the right. The source voltage is not drawn.' }),
      choices: ['50 V', '150 V', '70 V', '10 V'],
      answer: 0,
      why: {
        1: 'The three voltages peak at different moments, so their amplitudes do not add as numbers.',
        2: t`$V_L - V_C = 40$ V is right, but it is at right angles to $V_R$: combine them with Pythagoras, not by adding.`,
        3: t`That subtracts $V_R$ too. Only $v_L$ and $v_C$ point in opposite directions.`,
      },
      hints: [t`$v_L$ and $v_C$ point opposite ways; $v_R$ is at right angles to both.`, t`$V_0 = \sqrt{V_R^2 + (V_L - V_C)^2}$.`],
      teach: 'Element voltages in an AC series circuit add as phasors: the source amplitude is √(V_R² + (V_L − V_C)²), less than their plain sum.',
      explain: t`$V_0 = \sqrt{30^2 + (80 - 40)^2} = \sqrt{900 + 1600} = 50$ V. The coil alone has more voltage across it than the whole source — possible because the capacitor’s voltage is opposite to it at every instant.`,
    }),
    mcq({
      id: 'leads-or-lags', difficulty: 2,
      prompt: t`A series RLC circuit is driven below its resonant frequency, where $X_C > X_L$. The element phasors are drawn head to tail. How is the current timed relative to the source voltage?`,
      visual: acPic({ mode: 'ac', elements: 'RLC', V0: 10, f: 50, R: 40, L: 0.1, C: 50e-6, phase: 60, phasors: ['i', 'R', 'L', 'C'], traces: [] }, 'The element voltages v_R, v_L, v_C drawn head to tail, and the current phasor (blue). The source voltage is the arrow from the centre to the end of the chain — not drawn.'),
      choices: ['The current leads the source voltage', 'The current lags the source voltage', 'They are in phase', 'The current leads by exactly 90°'],
      answer: 0,
      why: {
        1: 'That happens above resonance, where the coil wins.',
        2: 'Only at resonance, where X_L = X_C.',
        3: t`With a resistor in the loop the angle is between 0 and 90°: $\tan\phi = (X_L - X_C)/R$ is finite.`,
      },
      hints: ['The chain ends below the current’s direction: the net reactive voltage points along v_C.', t`$\tan\phi = (X_L - X_C)/R < 0$: what does a negative $\phi$ mean?`],
      teach: 'Below resonance a series RLC circuit is capacitive: the current leads the source voltage.',
      explain: t`At 50 Hz, $X_L = 31.4\ \Omega$ and $X_C = 63.7\ \Omega$, so $\tan\phi = (31.4 - 63.7)/40$ and $\phi = -38.9^\circ$: the source voltage is behind the current, i.e. the current leads.`,
    }),
    num({
      id: 'element-voltage', difficulty: 2,
      gen(r) {
        const V0 = r.pick([5, 10, 12]), f = r.pick([100, 150]), R = r.pick([10, 20]), L = r.pick([0.2, 0.3]), CuF = r.pick([10, 20]);
        const c = rlc({ V0, f, R, L, C: CuF * 1e-6 });
        return {
          prompt: t`A source of amplitude ${V0} V at ${f} Hz drives $R = ${R}\ \Omega$, $L = ${L}$ H and $C = ${CuF}\ \mu$F in series. What is the amplitude of the voltage across the coil?`,
          visual: acPic({ mode: 'ac', elements: 'RLC', V0, f, R, L, C: CuF * 1e-6, phase: 20, strip: true, phasors: ['v', 'i'], traces: ['v', 'i'] }, 'The circuit, the source voltage v and the current i; the element voltages are not drawn.'),
          answer: c.VL, units: 'V', tol: { rel: 0.01 },
          errors: apart([{ value: V0, feedback: 'The coil’s voltage is not capped at the source’s: it is I₀X_L, and here the capacitor cancels much of it.' }, { value: V0 * c.XL / (R + c.XL + c.XC), feedback: 'Share the voltage with the impedance Z = √(R² + (X_L − X_C)²), not with the plain sum of R and the reactances.' }], c.VL),
          hints: [t`Find $I_0 = V_0/Z$, then $V_L = I_0X_L$.`, t`$X_L = ${tn(c.XL)}\ \Omega$, $X_C = ${tn(c.XC)}\ \Omega$, $Z = ${tn(c.Z)}\ \Omega$.`],
          teach: 'Each element’s voltage amplitude is I₀ times its own resistance or reactance — and near resonance the coil’s and capacitor’s can far exceed the source’s.',
          explain: t`$Z = ${tn(c.Z)}\ \Omega$, $I_0 = ${V0}/${tn(c.Z)} = ${tn(c.I)}$ A, so $V_L = I_0X_L = ${tn(c.VL)}$ V${c.VL > V0 ? ` — ${tn(c.VL / V0, 2)} times the source’s amplitude` : ''}.`,
        };
      },
    }),
    num({
      id: 'R-from-measurement', difficulty: 3,
      gen(r) {
        const V0 = r.pick([12, 24, 60]), I0 = r.pick([0.2, 0.3, 0.5]), phi = r.pick([25, 37, 53, 60]);
        const Z = V0 / I0, R = Z * Math.cos(phi * DEG);
        return {
          prompt: t`A source of amplitude ${V0} V drives a series RLC circuit. The current has amplitude ${I0} A and lags the source voltage by ${phi}°. What is the circuit’s resistance?`,
          visual: impedanceTriangle({ R: Math.cos(phi * DEG), X: Math.sin(phi * DEG), labels: { R: 'R = ?', X: 'net reactance', Z: `Z = ${V0} V / ${I0} A` }, caption: `The impedance triangle, with the phase angle ${phi}° at the origin.` }),
          answer: R, units: 'Ω', tol: { rel: 0.01 },
          errors: apart([{ value: Z, feedback: t`That is the whole impedance $Z = V_0/I_0$. The resistance is its component along the current: $R = Z\cos\phi$.` }, { value: Z * Math.sin(phi * DEG), feedback: t`That is the net reactance, $Z\sin\phi$. The resistance is the adjacent side: $Z\cos\phi$.` }], R),
          hints: [t`$Z = V_0/I_0$.`, t`In the impedance triangle $R = Z\cos\phi$.`],
          teach: t`From a measured amplitude ratio and phase, $R = Z\cos\phi$ and $X_L - X_C = Z\sin\phi$.`,
          explain: t`$Z = ${V0}/${I0} = ${tn(Z)}\ \Omega$ and $R = Z\cos ${phi}^\circ = ${tn(R)}\ \Omega$. (The net reactance is $Z\sin ${phi}^\circ = ${tn(Z * Math.sin(phi * DEG))}\ \Omega$, positive because the current lags.)`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student analyses a series circuit with $R = 40\ \Omega$, $X_L = 30\ \Omega$ and $X_C = 70\ \Omega$: “$\tan\phi = (70 - 30)/40 = 1$, so $\phi = +45^\circ$ and the current lags the source voltage.” What is wrong?`,
      visual: impedanceTriangle({ R: 40, X: -40, labels: { R: 'R = 40 Ω', X: 'net reactance', Z: 'Z' }, caption: 'The impedance triangle for this circuit, to scale.' }),
      choices: [
        t`The net reactance is $X_L - X_C = -40\ \Omega$: $\phi = -45^\circ$, so the current leads`,
        t`$\tan\phi$ should be $R/(X_L - X_C)$`,
        t`The angle should be $90^\circ$, because the circuit contains a coil`,
        'Nothing: a capacitive circuit makes the current lag',
      ],
      answer: 0,
      why: {
        1: 'The phase angle is measured from the current’s direction (R) to Z: tan φ is reactance over resistance.',
        2: 'Only a coil alone gives 90°. Here R, L and C share the voltage.',
        3: 'In a capacitor the current leads; a circuit dominated by its capacitor behaves the same way.',
      },
      hints: [t`Is it $X_C - X_L$ or $X_L - X_C$ in $\tan\phi$?`, 'Which element dominates here, the coil or the capacitor?'],
      teach: t`Keep the sign: $\tan\phi = (X_L - X_C)/R$, so a capacitor-dominated circuit has $\phi < 0$ and a leading current.`,
      explain: t`$\tan\phi = (30 - 70)/40 = -1$, so $\phi = -45^\circ$. The capacitor dominates, the circuit is capacitive, and the current **leads** the source voltage by 45°.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-Z', difficulty: 2,
      gen(r) {
        const f = r.pick([60, 200, 1000]), R = r.pick([15, 33, 68]), LmH = r.pick([20, 50, 120]), CuF = r.pick([2.2, 10, 47]);
        const c = rlc({ V0: 1, f, R, L: LmH * 1e-3, C: CuF * 1e-6 });
        return {
          prompt: t`What is the impedance at ${f} Hz of $R = ${R}\ \Omega$, $L = ${LmH}$ mH and $C = ${CuF}\ \mu$F in series?`,
          visual: acPic({ mode: 'ac', elements: 'RLC', V0: 10, f, R, L: LmH * 1e-3, C: CuF * 1e-6, phase: 45, strip: true, phasors: ['R', 'L', 'C'], traces: [] }, 'The circuit and its element voltages as phasors, head to tail.'),
          answer: c.Z, units: 'Ω', tol: { rel: 0.01 },
          hints: [t`$Z = \sqrt{R^2 + (\omega L - 1/\omega C)^2}$.`, t`$X_L = ${tn(c.XL)}\ \Omega$.`],
          teach: t`$Z = \sqrt{R^2 + (X_L - X_C)^2}$.`,
          explain: t`$X_L = ${tn(c.XL)}\ \Omega$, $X_C = ${tn(c.XC)}\ \Omega$: $\;Z = \sqrt{${R}^2 + (${tn(c.X)})^2} = ${tn(c.Z)}\ \Omega$.`,
        };
      },
    }),
    mcq({
      id: 'cp-max-voltage', difficulty: 2,
      prompt: t`In a series RLC circuit driven by a source of amplitude 10 V, can the voltage amplitude across the capacitor be 25 V?`,
      visual: phasorPic({ items: [{ len: 0.4, deg: 0, color: COL.R, label: 'resistor', ldy: 14 }, { len: 1.1, deg: 90, color: COL.L, label: 'coil', ldx: 6, ldy: -4 }, { len: 1.0, deg: -90, color: COL.C, label: 'capacitor', ldx: 6, ldy: 10 }], R: 1.15, circle: false, caption: 'Element voltages near resonance, as phasors at one instant: the coil’s and capacitor’s are large and nearly cancel.' }),
      choices: ['Yes: the coil’s and capacitor’s voltages are opposite, so they can each exceed the source’s while nearly cancelling', 'No: no element can have more voltage than the source', 'Only if the resistor’s voltage is negative', 'No: energy conservation forbids it'],
      answer: 0,
      why: {
        1: 'That holds for amplitudes in a DC loop. In AC the element voltages peak at different times and can partly cancel.',
        2: 'All three amplitudes are positive; it is the phases that let v_L and v_C cancel.',
        3: 'No energy is created: the large voltages belong to energy sloshing between the coil and the capacitor, not drawn from the source.',
      },
      hints: [t`Do $v_L$ and $v_C$ peak at the same time, or in opposition?`],
      teach: 'Because v_L and v_C are in opposition, each can be many times the source voltage near resonance.',
      explain: t`$V_0 = \sqrt{V_R^2 + (V_L - V_C)^2}$ constrains only the difference $V_L - V_C$. Near resonance $V_L \approx V_C$ and both can be $Q$ times the source amplitude — 25 V from a 10 V source is easy.`,
    }),
    num({
      id: 'cp-aircraft', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([20, 30]), LmH = r.pick([15, 20, 30]), CuF = r.pick([5, 10, 20]);
        const c = rlc({ V0: 115, f: 400, R, L: LmH * 1e-3, C: CuF * 1e-6 });
        return {
          prompt: t`An aircraft’s 115 V rms, 400 Hz bus feeds a load that behaves like $R = ${R}\ \Omega$, $L = ${LmH}$ mH and $C = ${CuF}\ \mu$F in series. What rms current does it draw?`,
          visual: acPic({ mode: 'ac', elements: 'RLC', V0: 162.6, f: 400, R, L: LmH * 1e-3, C: CuF * 1e-6, phase: 30, strip: true, phasors: ['R', 'L', 'C', 'i'], traces: ['v', 'i'], hide: ['V0'] }, 'The load on the 400 Hz bus: its element voltages as phasors and the source voltage and current against time. The peak voltage is √2 × 115 V ≈ 163 V.'),
          answer: c.I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: 115 / R, feedback: 'At 400 Hz the reactances do not cancel: use Z, not R.' }], c.I),
          hints: [t`$V = IZ$ holds for rms values. Find $X_L$ and $X_C$ at 400 Hz.`, t`$X_L = 2\pi(400)(${LmH}\times10^{-3}) = ${tn(c.XL)}\ \Omega$, $X_C = ${tn(c.XC)}\ \Omega$.`],
          teach: 'For an AC load, the rms current is the rms voltage over the impedance at the supply’s frequency.',
          explain: t`$Z = \sqrt{${R}^2 + (${tn(c.XL)} - ${tn(c.XC)})^2} = ${tn(c.Z)}\ \Omega$, so $I_\text{rms} = 115/${tn(c.Z)} = ${tn(c.I)}$ A, ${c.phi > 0 ? 'lagging' : 'leading'} the voltage by ${tn(Math.abs(c.phi), 2)}°.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §15.3 RLC series circuits with AC', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-3-rlc-series-circuits-with-ac' },
  ],
});
