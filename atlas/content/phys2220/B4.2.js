// RL circuits: a battery switched onto a resistor and a coil in series. The
// coil's emf stops the current jumping, so it climbs exponentially to ℰ/R with
// τ = L/R; switched to a short, it decays with the same τ. At the first instant
// the coil takes the whole battery voltage; at the end it is a plain wire.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, sf, r6, apart, acPic, rlGraph, currentGraph, lab, COL } from './_maxwell.js';

const t = String.raw;

// the worked example: ℰ = 12 V, R = 4.0 Ω, L = 0.20 H
const EX = { E: 12, R: 4, L: 0.2 };
EX.tau = EX.L / EX.R; EX.I = EX.E / EX.R;
EX.i2 = EX.I * (1 - Math.exp(-2)); EX.vL2 = EX.E * Math.exp(-2); EX.t90 = EX.tau * Math.log(10);

/** the circuit alone, at a still moment (no graphs, no readings) */
const circuitOnly = (p, caption, t0 = 0) => acPic({ mode: 'rl', graphs: [], t: t0, hide: ['i', 'emf', ...(p.hide || [])], E: p.E, R: p.R, L: p.L, on: p.on ?? true }, caption);

export default lesson({
  id: 'phys2220.B4.2',
  title: 'RL circuits',
  minutes: 12, difficulty: 2,
  intro: t`Connect a battery to a resistor and a coil in series. The coil’s back emf stops the current from jumping: at the first instant the current is zero and the coil takes the **whole battery voltage**; as the current grows its rate of growth slows, and the current creeps up to $\mathcal{E}/R$ — exponentially, with the **time constant** $\tau = L/R$. The loop rule, $\mathcal{E} - IR - L\,dI/dt = 0$, gives

$$I(t) = \frac{\mathcal{E}}{R}\left(1 - e^{-t/\tau}\right), \qquad \tau = \frac{L}{R}$$

Cut the battery out of the loop and the coil keeps the current going, dying away as $I_0e^{-t/\tau}$ with the same $\tau$. It is the RC circuit’s exponential again, with $L/R$ in place of $RC$.`,
  symbols: [
    { tex: 'I(t)', text: 'the current a time $t$ after the switch closes, in amperes (A)' },
    { tex: t`\mathcal{E}`, text: 'the battery’s emf, in volts (V)' },
    { tex: 'R', text: 'the total resistance in the loop, the coil’s own winding included, in ohms (Ω)' },
    { tex: 'L', text: 'the coil’s inductance, in henries (H)' },
    { tex: t`\tau = L/R`, text: t`the time constant, in seconds: $1\ \text{H}/1\ \Omega = 1\ \text{s}$. After one $\tau$ the current has covered $1 - e^{-1} = 63.2\%$ of the way to $\mathcal{E}/R$; after $5\tau$, more than 99%` },
    { tex: 'e', text: 'Euler’s number, 2.718…; $e^{-t/\\tau}$ is the fraction of the gap still to close' },
    { tex: 't', text: 'the time since the switch moved, in seconds' },
  ],
  why: t`Every circuit with a coil in it — a relay, a valve, a motor, an ignition coil — has this delay, and $\tau = L/R$ tells you how long it lasts.`,
  visual: {
    type: 'em-ac',
    title: 'Close the switch and watch the current build',
    lead: t`The battery, a resistor and a coil in a loop. The upper graph is the current; the lower one shows how the battery’s voltage is shared between the resistor ($v_R = iR$) and the coil ($v_L = L\,di/dt$). They always add up to $\mathcal{E}$.`,
    tasks: [
      'Look at the first instant: the current is zero and the coil takes the whole battery voltage.',
      'Double L: τ doubles, but the current still ends at ℰ/R.',
      'Double R: the final current halves, and so does τ.',
      'Flip the switch to the short: the coil keeps the current flowing while it dies away, with the same τ.',
    ],
    params: { mode: 'rl', E: 12, R: 4, L: 0.2 },
  },
  example: {
    prompt: t`A 12.0 V battery is switched onto a 4.00 Ω resistor in series with a 0.200 H coil. Find (a) the time constant, (b) the final current, (c) the current and the coil’s voltage 0.100 s after the switch closes, and (d) how long the current takes to reach 90% of its final value.`,
    visual: circuitOnly(EX, 'The circuit just as the switch closes. Wires and battery are ideal; the coil’s own resistance is part of R.'),
    steps: [
      { label: 'The first instant', text: t`The loop rule, $\mathcal{E} - IR - L\,dI/dt = 0$, with $I = 0$ gives $L\,dI/dt = \mathcal{E}$: the coil takes all 12.0 V, and the current starts rising at $\mathcal{E}/L = ${EX.E / EX.L}$ A/s.` },
      { label: 'Time constant', text: t`$\tau = L/R = 0.200\ \text{H}/4.00\ \Omega = ${EX.tau}$ s $= ${EX.tau * 1e3}$ ms.` },
      { label: 'Final current', text: t`When the current stops changing, $L\,dI/dt = 0$ and the coil is just a wire: $I_\infty = \mathcal{E}/R = ${EX.I.toFixed(2)}$ A. The inductance sets how long that takes, not where it ends.` },
      { label: 'At 0.100 s', text: t`That is $t/\tau = 2$: $\;I = ${EX.I.toFixed(2)}\,(1 - e^{-2}) = ${EX.i2.toFixed(2)}$ A. The resistor has $IR = ${(EX.i2 * EX.R).toFixed(2)}$ V, so the coil has $\mathcal{E}e^{-t/\tau} = 12.0\,e^{-2} = ${EX.vL2.toFixed(2)}$ V — together 12.0 V. ✓` },
      { label: '90%', text: t`$1 - e^{-t/\tau} = 0.90 \Rightarrow e^{-t/\tau} = 0.10 \Rightarrow t = \tau\ln 10 = ${EX.t90.toFixed(3)}$ s.` },
      { label: 'Sense check', text: t`Had the current kept its first slope, 60 A/s, it would reach 3.00 A in exactly $3.00/60 = 0.050$ s $= \tau$: the tangent at $t = 0$ meets the final current one time constant later.` },
    ],
    answer: t`(a) $\tau = 50.0$ ms; (b) $I_\infty = 3.00$ A; (c) $I = 2.59$ A and $v_L = 1.62$ V; (d) $t_{90\%} = 0.115$ s.`,
  },
  practice: [
    num({
      id: 'tau', difficulty: 1,
      gen(r) {
        const LmH = r.pick([20, 50, 150, 300, 600]), R = r.pick([5, 10, 25, 40, 100]);
        const tau = (LmH * 1e-3) / R;
        return {
          prompt: t`A ${LmH} mH coil is in series with a resistance of ${R} Ω (its own winding included). What is the circuit’s time constant?`,
          visual: circuitOnly({ E: 12, R, L: LmH * 1e-3, hide: ['E'] }, 'The circuit, just before the switch closes. The battery’s voltage does not affect the time constant.'),
          answer: tau * 1e3, units: 'ms', tol: { rel: 0.005 },
          errors: apart([{ value: (R / (LmH * 1e-3)) * 1e3, feedback: t`Upside down: $\tau = L/R$, and henries per ohm are seconds.` }, { value: LmH * 1e-3 * R * 1e3, feedback: t`Divide, do not multiply: $\tau = L/R$ (it is $RC$ for a capacitor that multiplies).` }], tau * 1e3),
          hints: [t`$\tau = L/R$, with $L$ in henries: $${LmH}$ mH $= ${LmH / 1000}$ H.`],
          teach: t`An RL circuit’s time constant is $\tau = L/R$: a bigger coil is slower, a bigger resistance faster.`,
          explain: t`$\tau = \dfrac{${LmH / 1000}\ \text{H}}{${R}\ \Omega} = ${tn(tau)}$ s $= ${tn(tau * 1e3)}$ ms.`,
        };
      },
    }),
    mcq({
      id: 'first-instant', difficulty: 2,
      prompt: t`In the circuit shown ($\mathcal{E} = 12$ V, $R = 4.0\ \Omega$), the switch has just closed. At that first instant:`,
      visual: circuitOnly({ E: 12, R: 4, L: 0.2 }, 'The circuit at the instant the switch closes.'),
      choices: [
        'The current is zero, and the coil has the full 12 V across it',
        'The current is already 3.0 A, and the coil has no voltage across it',
        'The current is already 3.0 A, and the coil has 12 V across it',
        'The current is zero, and so is the voltage across the coil',
      ],
      answer: 0,
      why: {
        1: 'That treats the coil as a plain wire. A coil cannot let its current jump: going from 0 to 3.0 A in no time would need an infinite emf.',
        2: 'If 3.0 A flowed, the resistor alone would take all 12 V, leaving nothing for the coil — the loop rule allows only one of the two.',
        3: t`The loop rule must hold: with $I = 0$ the resistor has no voltage, so the coil must have all of $\mathcal{E}$.`,
      },
      hints: [t`The current through a coil cannot change instantly. What was it just before?`, t`With $I = 0$, the loop rule $\mathcal{E} - IR - v_L = 0$ gives $v_L$ directly.`],
      teach: 'At the instant the switch closes, a coil keeps its current at zero and takes the whole battery voltage; long after, it is a plain wire.',
      explain: t`The current was zero and cannot jump, so $IR = 0$ and the coil has $v_L = L\,dI/dt = \mathcal{E} = 12$ V: the current starts rising at $\mathcal{E}/L$. Long after, the reverse holds: $I = 3.0$ A and $v_L = 0$.`,
    }),
    num({
      id: 'final-current', difficulty: 1,
      gen(r) {
        const E = r.pick([6, 9, 12, 24]), R = r.pick([2, 3, 4, 6, 8]), L = r.pick([0.1, 0.5, 2.0]);
        return {
          prompt: t`A ${E} V battery drives current through a ${R} Ω resistor and a ${L} H coil in series. Long after the switch closes, what current flows?`,
          visual: circuitOnly({ E, R, L }, 'The circuit, long after the switch closed.', 20 * (L / R)),
          answer: E / R, units: 'A', tol: { rel: 0.005 },
          errors: apart([{ value: E / (R + L), feedback: 'The coil is not a resistance: its henries do not add to the ohms. Once the current is steady the coil has no voltage at all.' }, { value: E / L, feedback: t`$L$ does not limit the final current — a steady current induces no emf, so only $R$ does.` }], E / R),
          hints: ['Once the current stops changing, what voltage does an ideal coil have?'],
          teach: 'The final current in an RL circuit is ℰ/R: the coil decides how long the current takes to get there, not where it ends.',
          explain: t`Long after, $dI/dt \to 0$, so $v_L = 0$ and all of $\mathcal{E}$ is across $R$: $I = ${E}\ \text{V}/${R}\ \Omega = ${sf(E / R, 3)}$ A, whatever the ${L} H.`,
        };
      },
    }),
    num({
      id: 'current-at-t', difficulty: 2,
      gen(r) {
        const E = r.pick([9, 12, 24]), R = r.pick([3, 4, 6, 8]), LmH = r.pick([60, 120, 240]), k = r.pick([0.5, 1, 1.5, 2, 3]);
        const tau = (LmH * 1e-3) / R, tms = sf(k * tau * 1e3, 2), I = (E / R) * (1 - Math.exp(-(tms * 1e-3) / tau));
        return {
          prompt: t`A ${E} V battery is switched onto a ${R} Ω resistor and a ${LmH} mH coil in series. What is the current ${tms} ms later?`,
          visual: rlGraph({ E, R, L: LmH * 1e-3, numbers: false, vlines: [{ x: tms, color: 'violet', label: `${tms} ms` }], caption: 'The shape of the current climbing toward ℰ/R (axis numbers hidden); the violet line marks the moment asked about.' }),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: apart([
            { value: (E / R) * Math.exp(-(tms * 1e-3) / tau), feedback: t`That is the gap still to close, $e^{-t/\tau}$ of the final current. The current itself is $\frac{\mathcal{E}}{R}(1 - e^{-t/\tau})$.` },
            { value: (E / R) * ((tms * 1e-3) / tau), feedback: 'The current does not rise in a straight line: it slows as it nears ℰ/R.' },
          ], I),
          hints: [t`First $\tau = L/R$ and $\mathcal{E}/R$.`, t`$\tau = ${tn(tau * 1e3)}$ ms, so $t/\tau = ${tn((tms * 1e-3) / tau)}$; then $I = \frac{\mathcal{E}}{R}(1 - e^{-t/\tau})$.`],
          teach: t`The current climbs as $I = \frac{\mathcal{E}}{R}(1 - e^{-t/\tau})$: find $\tau = L/R$ first, then work in units of $\tau$.`,
          explain: t`$\tau = ${LmH / 1000}/${R} = ${tn(tau * 1e3)}$ ms; $\;I = \dfrac{${E}}{${R}}\left(1 - e^{-${tms}/${tn(tau * 1e3)}}\right) = ${tn(I)}$ A.`,
        };
      },
    }),
    num({
      id: 'time-to-fraction', difficulty: 2,
      gen(r) {
        const p = r.pick([50, 75, 90, 95, 99]), LmH = r.pick([40, 100, 250]), R = r.pick([5, 8, 10, 20]);
        const tau = (LmH * 1e-3) / R, tt = -tau * Math.log(1 - p / 100);
        return {
          prompt: t`An RL circuit has $L = ${LmH}$ mH and $R = ${R}\ \Omega$. After the switch closes, how long does the current take to reach ${p}% of its final value?`,
          visual: rlGraph({ E: R, R, L: LmH * 1e-3, numbers: false, ylabel: 'I / I∞', hlines: [{ y: p / 100, color: 'violet', label: `${p}%` }], caption: `The current as a fraction of its final value, axis numbers hidden; the gold line is one time constant, the violet line ${p}% of the way.` }),
          answer: tt * 1e3, units: 'ms', tol: { rel: 0.01 },
          errors: apart([{ value: (p / 100) * tau * 1e3, feedback: 'The rise is not linear in time: reaching 90% takes more than 0.9τ.' }, { value: -tau * Math.log(p / 100) * 1e3, feedback: t`Set $1 - e^{-t/\tau} = ${p / 100}$, so $e^{-t/\tau} = ${sf(1 - p / 100, 2)}$ — not $${p / 100}$.` }], tt * 1e3),
          hints: [t`Solve $1 - e^{-t/\tau} = ${p / 100}$ for $t$.`, t`$e^{-t/\tau} = ${sf(1 - p / 100, 2)}$, so $t = -\tau\ln(${sf(1 - p / 100, 2)})$ with $\tau = L/R$.`],
          teach: t`To reach a fraction $f$ of the final current takes $t = -\tau\ln(1 - f)$: 0.69τ for half, 2.3τ for 90%, 4.6τ for 99%.`,
          explain: t`$\tau = ${tn(tau * 1e3)}$ ms; $\;t = -\tau\ln(1 - ${p / 100}) = ${tn(-Math.log(1 - p / 100))}\,\tau = ${tn(tt * 1e3)}$ ms.`,
        };
      },
    }),
    num({
      id: 'decay', difficulty: 2,
      gen(r) {
        const E = r.pick([12, 24]), R = r.pick([4, 6, 8]), LmH = r.pick([40, 80, 200]), k = r.pick([0.5, 1, 2, 3]);
        const I0 = E / R, tau = (LmH * 1e-3) / R, tms = sf(k * tau * 1e3, 2), I = I0 * Math.exp(-(tms * 1e-3) / tau);
        return {
          prompt: t`A steady current flows in a ${E} V battery, a ${R} Ω resistor and a ${LmH} mH coil. The switch now cuts the battery out, leaving the coil and resistor in a closed loop. What is the current ${tms} ms later?`,
          visual: acPic({ mode: 'rl', on: false, E, R, L: LmH * 1e-3, graphs: [], t: 0, hide: ['i', 'emf'] }, 'The switch has just moved to the short: the battery is out of the loop, which still holds the coil and the resistor.'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: I0 * (1 - Math.exp(-(tms * 1e-3) / tau)), feedback: t`That is the rising curve. With the battery gone the current dies away: $I = I_0e^{-t/\tau}$.` }, { value: 0, feedback: 'The current cannot stop at once: the coil keeps it flowing, dying away with τ = L/R.' }], I),
          hints: [t`Before the switch moved, $I_0 = \mathcal{E}/R$. Afterwards $I = I_0e^{-t/\tau}$ with $\tau = L/R$.`, t`$I_0 = ${sf(I0, 3)}$ A and $\tau = ${tn(tau * 1e3)}$ ms.`],
          teach: t`Cut the battery out and the coil keeps the current going, decaying as $I_0e^{-t/\tau}$ with the same $\tau = L/R$.`,
          explain: t`$I_0 = ${E}/${R} = ${sf(I0, 3)}$ A, $\tau = ${tn(tau * 1e3)}$ ms: $\;I = ${sf(I0, 3)}\,e^{-${tms}/${tn(tau * 1e3)}} = ${tn(I)}$ A. The energy stored in the coil, $\tfrac12LI_0^2$, ends up as heat in the resistor.`,
        };
      },
    }),
    mcq({
      id: 'compare-curves', difficulty: 2,
      prompt: t`Two RL circuits have the same battery and the same resistance but different coils. Their currents after the switches close are shown. Which coil has the larger inductance?`,
      visual: { type: 'graph', params: { x: [0, 100], y: [0, 3.6], aspect: 'wide', axesAt: 'edge', xlabel: 't (ms)', ylabel: 'I (A)', curves: [{ fn: '3*(1 - e^(-x/10))', color: 'accent', width: 2.6, label: 'A', labelAt: 22, labelDy: -14 }, { fn: '3*(1 - e^(-x/30))', color: 'violet', width: 2.6, label: 'B', labelAt: 40, labelDy: 14 }], hlines: [{ y: 3, color: 'ink3', label: 'ℰ/R' }] }, caption: 'The currents in circuits A (blue) and B (violet) after their switches close.' },
      choices: ['B, the one that rises more slowly', 'A, the one that rises faster', 'Neither: they end at the same current, so their inductances are equal', 'You cannot tell without knowing the battery’s voltage'],
      answer: 0,
      why: {
        1: 'A larger inductance opposes the change more strongly, so its current rises more slowly, not faster.',
        2: 'The final current is ℰ/R for any coil — it carries no information about L. The approach does.',
        3: t`Both have the same $\mathcal{E}$ and $R$; only the shape of the rise differs, and $\tau = L/R$ sets that shape.`,
      },
      hints: [t`With $R$ the same, $\tau = L/R$ grows with $L$. Which curve has the longer time constant?`],
      teach: 'With the same resistance, a larger inductance gives a longer time constant and a slower rise to the same final current.',
      explain: t`A reaches 63% of 3 A at about 10 ms; B at about 30 ms. Same $R$, so $L_B/L_A = \tau_B/\tau_A \approx 3$.`,
    }),
    mcq({
      id: 'open-switch', difficulty: 3,
      prompt: t`A large coil carries a steady current. When a switch in its circuit is opened, a spark jumps across the switch’s contacts. Why?`,
      visual: currentGraph({ pts: [[0, 3], [2, 3], [2.02, 0], [4, 0]], tUnit: 'ms', y: [0, 3.8], marks: [lab(2.05, 1.5, 'the switch opens', 'ink', 8, 0, 'left')], caption: 'The current the switch tries to impose: from a steady 3 A to zero almost instantly.' }),
      choices: [
        t`The coil drives the current on; forcing it to stop almost instantly makes $L\,dI/dt$ enormous, enough to break down the air`,
        'The battery’s voltage piles up across the open contacts',
        'The coil has stored charge, which jumps across the gap',
        'Opening the switch makes the coil’s resistance drop to zero',
      ],
      answer: 0,
      why: {
        1: 'The battery’s voltage is only a few volts or tens of volts — far too little to spark across a gap. Something much bigger appears.',
        2: 'A coil stores energy in its magnetic field, not charge. The spark is that energy being dumped.',
        3: 'Nothing happens to the coil’s resistance; its emf is what matters.',
      },
      hints: [t`What does $\mathcal{E}_L = -L\,dI/dt$ become when $dI/dt$ is huge?`, 'The coil’s emf pushes to keep the current flowing — across the gap if it must.'],
      teach: 'Interrupting the current in a coil makes dI/dt — and so the coil’s emf — huge, which is why switches on coils spark unless the current is given another path.',
      explain: t`The coil opposes the fall in current with $|\mathcal{E}_L| = L\,|dI/dt|$. Forced from 3 A to zero in microseconds, even 0.1 H gives tens of kilovolts, ionising the air so the current can keep flowing as a spark. Car ignition coils use exactly this; relay and valve drivers prevent it with a diode across the coil.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-current', difficulty: 2,
      gen(r) {
        const E = r.pick([6, 12, 24]), R = r.pick([10, 20, 50]), LmH = r.pick([100, 250, 500]), tms = r.pick([2, 5, 10, 20]);
        const tau = (LmH * 1e-3) / R, I = (E / R) * (1 - Math.exp(-(tms * 1e-3) / tau));
        return {
          prompt: t`A ${E} V battery is switched onto a ${R} Ω resistor in series with a ${LmH} mH coil. What is the current ${tms} ms after the switch closes?`,
          visual: circuitOnly({ E, R, L: LmH * 1e-3 }, 'The circuit at the instant the switch closes.'),
          answer: I, units: 'A', tol: { rel: 0.01 },
          hints: [t`$\tau = L/R$; then $I = \frac{\mathcal{E}}{R}(1 - e^{-t/\tau})$.`, t`$\tau = ${tn(tau * 1e3)}$ ms.`],
          teach: t`Find $\tau = L/R$, then $I(t) = \frac{\mathcal{E}}{R}(1 - e^{-t/\tau})$.`,
          explain: t`$\tau = ${tn(tau * 1e3)}$ ms, $\mathcal{E}/R = ${tn(E / R)}$ A; $\;I = ${tn(E / R)}(1 - e^{-${tms}/${tn(tau * 1e3)}}) = ${tn(I)}$ A.`,
        };
      },
    }),
    mcq({
      id: 'cp-coil-voltage', difficulty: 2,
      prompt: t`One time constant after the switch closes in an RL circuit, the voltage across the (ideal) coil is about:`,
      visual: rlGraph({ E: 12, R: 4, L: 0.2, caption: 'The current in an RL circuit after the switch closes, with one time constant marked in gold.' }),
      choices: [t`37% of $\mathcal{E}$`, t`63% of $\mathcal{E}$`, 'Zero, because current is flowing', t`50% of $\mathcal{E}$`],
      answer: 0,
      why: {
        1: t`63% is how far the **current** has risen. The coil has what the resistor does not: $1 - 0.63 = 0.37$ of $\mathcal{E}$.`,
        2: 'The coil’s voltage depends on how fast the current is changing, and at t = τ it is still changing.',
        3: t`Half of $\mathcal{E}$ is reached at $t = \tau\ln2 \approx 0.69\tau$, not at $\tau$.`,
      },
      hints: [t`$v_L = \mathcal{E} - IR$, and at $t = \tau$ the current is $0.63\,\mathcal{E}/R$.`, t`Equivalently $v_L = \mathcal{E}e^{-t/\tau}$.`],
      teach: t`The coil’s voltage falls as $\mathcal{E}e^{-t/\tau}$ while the current rises: at $t = \tau$ it is $e^{-1} \approx 37\%$ of $\mathcal{E}$.`,
      explain: t`$v_L = \mathcal{E} - IR = \mathcal{E} - \mathcal{E}(1 - e^{-1}) = \mathcal{E}e^{-1} \approx 0.37\,\mathcal{E}$.`,
    }),
    num({
      id: 'cp-igniter', difficulty: 3, transfer: true,
      gen(r) {
        const LmH = r.pick([3, 4, 6]), R = r.pick([2.8, 3.5, 4.0]), p = r.pick([90, 95]);
        const tau = (LmH * 1e-3) / R, tt = -tau * Math.log(1 - p / 100);
        return {
          prompt: t`Some spark exciters for rocket-engine igniters work like a car’s ignition coil: current builds up in a primary winding, and interrupting it makes the spark. One primary has $L = ${LmH}.0$ mH and a total resistance of ${R} Ω, switched onto the vehicle’s 28 V bus. How long after the switch closes does the primary current reach ${p}% of its final value?`,
          visual: circuitOnly({ E: 28, R, L: LmH * 1e-3 }, 'The primary circuit drawn as an RL loop: the 28 V bus, the winding’s resistance and its inductance. The secondary winding that makes the spark is not shown.'),
          answer: tt * 1e3, units: 'ms', tol: { rel: 0.01 },
          errors: apart([{ value: tau * 1e3, feedback: `One time constant only gets 63% of the way; ${p}% takes longer.` }], tt * 1e3),
          hints: [t`$\tau = L/R$, and the current reaches a fraction $f$ of its final value at $t = -\tau\ln(1 - f)$.`, t`$\tau = ${LmH}\times10^{-3}/${R} = ${tn(tau * 1e3)}$ ms; $-\ln(1 - ${p / 100}) = ${tn(-Math.log(1 - p / 100))}$.`],
          teach: 'An RL time constant sets how long a coil needs to charge up — for an ignition coil, the shortest dwell time between sparks.',
          explain: t`$\tau = ${tn(tau * 1e3)}$ ms and the final current is $28/${R} = ${tn(28 / R)}$ A. $\;t = ${tn(-Math.log(1 - p / 100))}\,\tau = ${tn(tt * 1e3)}$ ms: switch the primary off sooner and the coil has stored less energy, $\tfrac12LI^2$, for the spark.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §14.4 RL circuits', url: 'https://openstax.org/books/university-physics-volume-2/pages/14-4-rl-circuits' },
  ],
});
