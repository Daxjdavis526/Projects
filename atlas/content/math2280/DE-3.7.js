// The series RLC circuit as a second-order linear equation: Kirchhoff's loop
// rule gives L q″ + R q′ + q/C = ℰ(t), the mass–spring–damper equation with
// the full dictionary (L↔m, R↔b, 1/C↔k, q↔x, i↔v, ℰ↔F, energies and power
// lost); ζ, ω₀ and the critical resistance; switching transients — a filter's
// overshoot on a 28 V bus, a capacitor-discharge pyro igniter.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, lead, sg } from './_second.js';

const t = String.raw;

/** A still picture from em-ac (no controls, no readouts). */
const acPic = (params, caption) => ({ type: 'em-ac', params: { controls: [], readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A straight segment as a graph curve. */
const seg = (a, b, color = 'ink2', width = 2.2) => ({ param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width });
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x, y, r: 0.01, color, label, labelDx: dx, labelDy: dy });

/** A series RLC schematic: source on the left (battery or AC), R and L on top, C on the right, a switch at the bottom. */
function rlcPic({ src = 'battery', E = 'ℰ', R = 'R', L = 'L', C = 'C', closed = true, caption }) {
  const W = 'ink2';
  const zig = [[1.0, 3]];
  for (let k = 0; k < 6; k++) zig.push([1.13 + k * 0.25, 3 + (k % 2 ? -0.2 : 0.2)]);
  zig.push([2.6, 3]);
  const curves = [
    seg([0, 3], [1.0, 3]), seg([2.6, 3], [3.4, 3]), seg([5.0, 3], [6, 3]),
    ...zig.slice(1).map((p, k) => seg(zig[k], p, 'warn', 2.4)),
    ...[3.6, 4.0, 4.4, 4.8].map((c) => ({ param: [`${c} + 0.2*cos(t)`, '3 + 0.25*sin(t)'], t: ['pi', 0], color: 'teal', width: 2.4 })),
    seg([6, 3], [6, 1.62]), seg([6, 1.38], [6, 0]), seg([5.55, 1.62], [6.45, 1.62], 'violet', 3), seg([5.55, 1.38], [6.45, 1.38], 'violet', 3),
    seg([6, 0], [3.4, 0]), seg([2.6, 0], [0, 0]),
    closed ? seg([2.6, 0], [3.4, 0], W) : seg([2.6, 0], [3.25, 0.42], W),
  ];
  if (src === 'battery') curves.push(seg([0, 0], [0, 1.38]), seg([0, 1.62], [0, 3]), seg([-0.4, 1.62], [0.4, 1.62], 'gold', 3), seg([-0.2, 1.38], [0.2, 1.38], 'gold', 3));
  else curves.push(seg([0, 0], [0, 1.15]), seg([0, 1.85], [0, 3]), { param: ['0.35*cos(t)', '1.5 + 0.35*sin(t)'], t: [0, '2*pi'], color: 'gold', width: 2.4 }, { param: ['-0.2 + 0.4*t', '1.5 + 0.12*sin(2*pi*t)'], t: [0, 1], color: 'gold', width: 2 });
  return {
    type: 'graph',
    params: {
      x: [-1.6, 7.9], y: [-0.7, 3.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves,
      points: [
        tag(-0.55, 1.5, E, 'gold', -7 * E.length, 4), tag(1.8, 3.3, R, 'warn', 0, -8), tag(4.2, 3.3, L, 'teal', 0, -8), tag(6.6, 1.5, C, 'violet', 2, 4),
        { x: 2.6, y: 0, r: 3.5, color: W }, { x: 3.4, y: 0, r: 3.5, color: W }, tag(3.0, -0.25, closed ? 'switch closed at t = 0' : 'switch', W, 0, 14),
      ].map((p) => (p.r === 0.01 ? { ...p, labelDx: p.labelDx || (p.label.length > 1 ? -4 * p.label.length : -4) } : p)),
    },
    caption,
  };
}

// worked example: an LC input filter switched onto a 28 V bus
const EX = (() => {
  const L = 10e-6, C = 100e-6, R = 0.1, E = 28;
  const w0 = 1 / Math.sqrt(L * C), z = (R / 2) * Math.sqrt(C / L), wd = w0 * Math.sqrt(1 - z * z), a = R / (2 * L);
  const os = Math.exp((-Math.PI * z) / Math.sqrt(1 - z * z));
  return { L, C, R, E, w0, f0: w0 / (2 * Math.PI), z, wd, a, os, peak: E * (1 + os), tp: Math.PI / wd, Rc: 2 * Math.sqrt(L / C) };
})();

export default lesson({
  id: 'math2280.DE-3.7',
  title: 'RLC circuits',
  minutes: 14, difficulty: 3,
  intro: t`Around a series loop of a source $\mathcal{E}(t)$, a resistor $R$, a coil $L$ and a capacitor $C$, Kirchhoff’s loop rule says the voltage drops add up to the source: $L\,\dfrac{di}{dt} + Ri + \dfrac{q}{C} = \mathcal{E}(t)$. The current is the rate of flow of charge, $i = q'$, so

$$L\,q'' + R\,q' + \frac{1}{C}\,q = \mathcal{E}(t) \qquad\text{is}\qquad m\,x'' + b\,x' + k\,x = F(t).$$

The circuit **is** a forced, damped spring, term for term: inductance is inertia ($L \leftrightarrow m$), resistance is the dashpot ($R \leftrightarrow b$), and the capacitor is the spring ($1/C \leftrightarrow k$). Everything from DE-3.2 to DE-3.6 transfers: $\omega_0 = 1/\sqrt{LC}$, $\zeta = \dfrac{R}{2}\sqrt{\dfrac{C}{L}}$, critical damping at $R_c = 2\sqrt{L/C}$, and $Q = \dfrac1R\sqrt{\dfrac{L}{C}}$.`,
  symbols: [
    { tex: 'q(t)', text: 'the charge on the capacitor, in coulombs — the displacement $x$' },
    { tex: 'i = q\'', text: 'the current, in amperes — the velocity $v$' },
    { tex: 'L', text: 'inductance, in henries: the coil resists *changes* of current as a mass resists changes of velocity — the mass $m$' },
    { tex: 'R', text: 'resistance, in ohms: it turns energy into heat at the rate $i^2R$, as a dashpot does at $bv^2$ — the damping $b$' },
    { tex: 'C', text: 'capacitance, in farads; $1/C$ is the stiffness $k$: the capacitor pushes back with voltage $q/C$, as a spring with force $kx$' },
    { tex: '\\mathcal{E}(t)', text: 'the source voltage, in volts — the applied force $F(t)$' },
  ],
  why: t`Every electronic oscillator, filter, tuned receiver and power converter is this equation, and so are the transients that ring on a spacecraft’s power bus whenever a load switches on.`,
  visual: {
    type: 'em-ac',
    title: 'Resistance is the dashpot',
    lead: t`A charged capacitor connected across a coil and a resistor: the free circuit, $L\,q'' + R\,q' + q/C = 0$. The block on the spring below it obeys the same equation. Raise $R$ and watch the regimes of DE-3.5 appear in the circuit.`,
    tasks: [
      t`$R = 0$: the charge sloshes for ever at $f_0 = 1/(2\pi\sqrt{LC}) \approx 1.6$ kHz — an undamped spring.`,
      t`Raise $R$ to 10 Ω: the swings decay like $e^{-Rt/2L}$, the circuit’s $e^{-\zeta\omega_0t}$, and the heat bar fills.`,
      t`Set $R = 40$ Ω $= 2\sqrt{L/C}$: critically damped — the capacitor empties without ringing. At 80 Ω, overdamped: slower again.`,
    ],
    params: { mode: 'lc', L: 2e-3, C: 5e-6, R: 0, V0: 10, ranges: { R: [0, 80] } },
    caption: t`Ideal wires and coil; the resistance is drawn as one resistor. The block on the spring is the mechanical twin — not part of the circuit — with $x \leftrightarrow q$, $v \leftrightarrow i$, $m \leftrightarrow L$, $k \leftrightarrow 1/C$; the circuit’s resistance plays its damping. Time is slowed down; the axes show real time.`,
  },
  example: {
    prompt: t`A spacecraft’s power-processing unit has an input filter: $L = 10\ \mu\text{H}$ in series with $C = 100\ \mu\text{F}$, with $R = 0.1\ \Omega$ of wiring and capacitor resistance. A relay connects it, discharged, to the 28 V bus. Find $\omega_0$ and $\zeta$, the highest voltage the capacitor reaches, and the resistance that would make the filter critically damped.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 0.6], y: [0, 50], aspect: 'wide', xlabel: 't (ms)', ylabel: 'capacitor voltage (V)',
        curves: [{ fn: `${EX.E}*(1 - exp(-${r6(EX.a / 1000)}*x)*(cos(${r6(EX.wd / 1000)}*x) + ${r6(EX.a / EX.wd)}*sin(${r6(EX.wd / 1000)}*x)))`, color: 'accent', width: 2.4 }],
        hlines: [{ y: EX.E, label: 'bus, 28 V', color: 'gold' }],
        points: [{ x: r6(EX.tp * 1000), y: r6(EX.peak), color: 'bad', label: `${EX.peak.toFixed(1)} V`, labelDx: 8, labelDy: -8 }],
      },
      caption: 'The capacitor voltage after the relay closes: it overshoots the bus by 60% and rings at about 5 kHz. Ideal components; real capacitors and wiring add a little more loss.',
    },
    steps: [
      { label: 'The equation', text: t`Loop rule with $\mathcal{E} = 28$ V: $L\,q'' + R\,q' + q/C = 28$, starting from $q(0) = 0$ and $i(0) = q'(0) = 0$ — a spring at rest suddenly given a constant push.` },
      { label: 'Frequency and damping', text: t`$\omega_0 = 1/\sqrt{LC} = 1/\sqrt{10^{-9}} = ${tex(EX.w0, 3)}$ rad/s ($f_0 = ${tex(EX.f0, 3)}$ Hz). $\zeta = \dfrac{R}{2}\sqrt{\dfrac{C}{L}} = 0.05\sqrt{10} = ${tex(EX.z, 3)}$: underdamped.` },
      { label: 'Solve', text: t`A constant forcing has a constant particular solution, $q_p = C\mathcal{E}$ (the spring’s static stretch). The transient fits $q(0) = q'(0) = 0$: $v_C = q/C = \mathcal{E}\left[1 - e^{-\alpha t}\left(\cos\omega_dt + \dfrac{\alpha}{\omega_d}\sin\omega_dt\right)\right]$, with $\alpha = R/2L = ${tex(EX.a, 3)}$ s⁻¹ and $\omega_d = ${tex(EX.wd, 3)}$ rad/s.` },
      { label: 'The peak', text: t`The first maximum is half a damped period in, at $t = \pi/\omega_d = ${tex(EX.tp * 1e3, 3)}$ ms, where the transient’s envelope is $e^{-\pi\zeta/\sqrt{1 - \zeta^2}} = ${tex(EX.os, 3)}$. So $v_{\max} = 28(1 + ${tex(EX.os, 3)}) = ${tex(EX.peak, 3)}$ V.` },
      { label: 'Critical resistance', text: t`$\zeta = 1$ needs $R_c = 2\sqrt{L/C} = 2\sqrt{0.1} = ${tex(EX.Rc, 3)}\ \Omega$. Designers add a damping resistor (usually in series with an extra capacitor, so it wastes no power in steady state) to bring $\zeta$ near 0.5–0.7.` },
      { label: 'Sense check', text: t`An undamped filter could reach twice the bus voltage, 56 V; damping trims that to ${tex(EX.peak, 3)} V. Parts rated for 28 V alone would be overstressed at every switch-on — a real design rule for spacecraft power.` },
    ],
    answer: t`$\omega_0 \approx 3.16\times10^{4}$ rad/s, $\zeta \approx ${tex(EX.z, 2)}$; the capacitor peaks near ${Math.round(EX.peak)} V; $R_c \approx ${tex(EX.Rc, 2)}\ \Omega$.`,
  },
  practice: [
    match({
      id: 'dictionary', difficulty: 2,
      prompt: t`$L\,q'' + R\,q' + q/C = \mathcal{E}(t)$ and $m\,x'' + b\,x' + kx = F(t)$ are the same equation. Match each circuit quantity with its mechanical twin.`,
      left: [t`resistance $R$`, t`source voltage $\mathcal{E}(t)$`, t`power turned to heat, $i^2R$`, t`inductance $L$`, t`$1/C$`, t`current $i$`],
      right: ['damping coefficient b', 'applied force F(t)', 'power lost in the dashpot, b·v²', 'mass m', 'spring constant k', 'velocity v', 'displacement x', 'spring energy ½kx²'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: [t`Line the equations up term by term: the coefficient of the second derivative, of the first derivative, of the unknown itself, and the right-hand side.`, t`Multiply each by the rate: power into the resistor is $i\cdot iR$, into the dashpot $v\cdot bv$.`],
      teach: 'Term by term: L ↔ m, R ↔ b, 1/C ↔ k, ℰ ↔ F, q ↔ x, i ↔ v — and with them every energy and power.',
      explain: t`$L \leftrightarrow m$, $R \leftrightarrow b$, $1/C \leftrightarrow k$, $\mathcal{E} \leftrightarrow F$, $q \leftrightarrow x$, $i \leftrightarrow v$. Then $\tfrac12Li^2 \leftrightarrow \tfrac12mv^2$, $q^2/2C \leftrightarrow \tfrac12kx^2$, and the heat $i^2R \leftrightarrow bv^2$. Engineers once built “analog computers” on exactly this: a circuit whose voltages played a structure’s motion.`,
      visual: acPic({ mode: 'lc', L: 2e-3, C: 5e-6, R: 8, V0: 10, analog: 'always', graphs: [], bars: true, t: 1.2e-4 }, 'The circuit and its mechanical twin at the same moment: the block’s displacement follows the charge, its velocity the current. The resistance plays the twin’s damping (no dashpot drawn).'),
    }),
    num({
      id: 'zeta-circuit', difficulty: 2,
      gen(r) {
        const LmH = r.pick([1, 2, 5]), CuF = r.pick([1, 4.7, 10]), R = r.pick([5, 10, 20]);
        const L = LmH * 1e-3, C = CuF * 1e-6, z = (R / 2) * Math.sqrt(C / L);
        return {
          prompt: t`What is the damping ratio $\zeta$ of a series circuit with $R = ${R}\ \Omega$, $L = ${LmH}$ mH and $C = ${CuF}\ \mu\text{F}$?`,
          answer: z, tol: { rel: 0.005 },
          errors: [
            { value: R * Math.sqrt(C / L), feedback: t`Compare with $\zeta = b/(2\sqrt{km})$: with $b = R$, $k = 1/C$, $m = L$ it is $\dfrac{R}{2}\sqrt{\dfrac{C}{L}}$ — keep the 2.` },
            { value: (R / 2) * Math.sqrt(L / C), feedback: t`Inverted inside the root: $\sqrt{km} = \sqrt{L/C}$, so $\zeta = \dfrac{R}{2\sqrt{L/C}} = \dfrac{R}{2}\sqrt{\dfrac{C}{L}}$.` },
          ],
          hints: [t`Translate $\zeta = \dfrac{b}{2\sqrt{km}}$ with $b \to R$, $k \to 1/C$, $m \to L$.`, t`$\zeta = \dfrac{R}{2}\sqrt{\dfrac{C}{L}}$ with $C$ in farads and $L$ in henries.`],
          teach: 'Through the dictionary, the damping ratio of a series RLC is ζ = (R/2)√(C/L).',
          explain: t`$\zeta = \dfrac{${R}}{2}\sqrt{\dfrac{${CuF}\times10^{-6}}{${LmH}\times10^{-3}}} = ${tex(z, 3)}$ — ${z < 1 ? 'underdamped: it rings' : z > 1 ? 'overdamped: no ringing' : 'critically damped'}.`,
          visual: acPic({ mode: 'lc', L, C, R, V0: 10, graphs: ['q'], analog: false }, 'The free circuit and its charge after it is connected, on real time. Ideal components.'),
        };
      },
    }),
    num({
      id: 'critical-R', difficulty: 2,
      gen(r) {
        const LmH = r.pick([0.5, 2, 8]), CuF = r.pick([0.47, 2.2, 10]);
        const Rc = 2 * Math.sqrt((LmH * 1e-3) / (CuF * 1e-6));
        return {
          prompt: t`What resistance makes a series circuit with $L = ${LmH}$ mH and $C = ${CuF}\ \mu\text{F}$ critically damped?`,
          answer: Rc, units: 'Ω', tol: { rel: 0.005 },
          errors: [{ value: Rc / 2, feedback: t`Critical damping is $b_c = 2\sqrt{km}$; in the circuit $R_c = 2\sqrt{L/C}$ — keep the 2.` }, { value: 2 * Math.sqrt((CuF * 1e-6) / (LmH * 1e-3)), feedback: t`$\sqrt{km} = \sqrt{L\cdot\tfrac1C} = \sqrt{L/C}$ — that ratio is upside down.` }],
          hints: [t`A repeated root of $Lr^2 + Rr + 1/C$ needs $R^2 = 4L/C$.`],
          teach: 'A series RLC is critically damped at R = 2√(L/C) — the circuit’s 2√(km).',
          explain: t`$R_c = 2\sqrt{\dfrac{${LmH}\times10^{-3}}{${CuF}\times10^{-6}}} = ${tex(Rc, 3)}\ \Omega$. Below it the circuit rings; above, it creeps.`,
          visual: acPic({ mode: 'lc', L: LmH * 1e-3, C: CuF * 1e-6, R: Rc, V0: 10, graphs: [], analog: false, hide: ['R'] }, 'The circuit with its resistance unknown.'),
        };
      },
    }),
    num({
      id: 'switch-on-peak', difficulty: 3,
      gen(r) {
        const E = r.pick([12, 28]), LuH = r.pick([22, 47]), CuF = r.pick([47, 100, 220]), R = r.pick([0.05, 0.1, 0.2]);
        const L = LuH * 1e-6, C = CuF * 1e-6, z = (R / 2) * Math.sqrt(C / L);
        const os = Math.exp((-Math.PI * z) / Math.sqrt(1 - z * z)), V = E * (1 + os);
        const w0 = 1 / Math.sqrt(L * C), wd = w0 * Math.sqrt(1 - z * z), a = R / (2 * L), Tms = (3 * 2 * Math.PI / wd) * 1e3;
        return {
          prompt: t`A filter of $L = ${LuH}\ \mu\text{H}$ and $C = ${CuF}\ \mu\text{F}$, with $${R}\ \Omega$ of series resistance, is switched, discharged, onto a ${E} V supply. What is the highest voltage its capacitor reaches?`,
          answer: V, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: E, feedback: 'The capacitor does not stop at the supply voltage: the coil keeps the current flowing, so it overshoots, like a spring released under a sudden constant load.' }, { value: 2 * E, feedback: t`Twice the supply is the undamped limit. With $\zeta = ${tex(z, 2)}$ the overshoot is $e^{-\pi\zeta/\sqrt{1 - \zeta^2}}$ of the supply.` }],
          hints: [t`$\zeta = \dfrac{R}{2}\sqrt{C/L}$; the capacitor voltage is $\mathcal{E}$ minus a free transient that starts at $-\mathcal{E}$ with zero current.`, t`The first peak overshoots $\mathcal{E}$ by $\mathcal{E}\,e^{-\pi\zeta/\sqrt{1 - \zeta^2}}$.`],
          teach: t`Switched onto a constant voltage, an underdamped RLC overshoots by the fraction $e^{-\pi\zeta/\sqrt{1-\zeta^2}}$ — up to twice the supply.`,
          explain: t`$\zeta = \dfrac{${R}}{2}\sqrt{\dfrac{${CuF}}{${LuH}}} = ${tex(z, 3)}$, overshoot $e^{-\pi\zeta/\sqrt{1 - \zeta^2}} = ${tex(os, 3)}$, so $v_{\max} = ${E}(1 + ${tex(os, 3)}) = ${tex(V, 3)}$ V.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(Tms)], y: [0, r6(2.15 * E)], yticks: 0, aspect: 'wide', xlabel: 't (ms)', ylabel: 'capacitor voltage',
              curves: [{ fn: `${E}*(1 - exp(-${r6(a / 1000)}*x)*(cos(${r6(wd / 1000)}*x) + ${r6(a / wd)}*sin(${r6(wd / 1000)}*x)))`, color: 'accent', width: 2.4 }],
              hlines: [{ y: E, label: `supply, ${E} V`, color: 'gold' }],
            },
            caption: 'The capacitor voltage after switch-on (voltage axis unnumbered except for the supply line). Ideal components.',
          },
        };
      },
    }),
    expr({
      id: 'charge-ivp', difficulty: 3,
      gen(r) {
        const [L, R, C, al, be] = r.pick([[1, 2, 0.2, 1, 2], [1, 2, 0.1, 1, 3], [0.5, 2, 0.4, 2, 1]]), E = r.pick([5, 10, 20]);
        const Q = C * E, k = al / be;
        return {
          prompt: t`A ${L} H choke, a ${R} Ω resistor and a ${C} F supercapacitor (uncharged) are connected in series across a ${E} V battery at $t = 0$, with no current flowing. Find the charge $q(t)$ on the capacitor, in coulombs.`,
          answer: `${nice(Q)}*(1 - e^(-${al}*t)*(cos(${be}*t) + ${nice(k)}*sin(${be}*t)))`,
          answerTeX: t`${nice(Q)}\left[1 - e^{-${al === 1 ? '' : al}t}\left(\cos ${be === 1 ? '' : be}t + ${k === 0.5 ? '\\tfrac12' : nice(k)}\sin ${be === 1 ? '' : be}t\right)\right]`, lhs: 'q(t)',
          vars: { t: [0, 3] },
          errors: [{ answer: `${nice(Q)}*(1 - e^(-${al}*t)*cos(${be}*t))`, feedback: t`That meets $q(0) = 0$ but not $q'(0) = 0$: the transient needs a sine term too.` }, { answer: `${nice(Q)}*e^(-${al}*t)*cos(${be}*t)`, feedback: t`That is how a *charged* capacitor discharges. Here it starts empty and charges toward $C\mathcal{E} = ${nice(Q)}$ C.` }],
          hints: [t`$${L === 1 ? '' : L}q'' + ${R}q' + ${nice(1 / C)}q = ${E}$. Its characteristic roots are $-${al} \pm ${be}i$, and a constant forcing gives $q_p = C\mathcal{E} = ${nice(Q)}$.`, t`$q = ${nice(Q)} + e^{-${al === 1 ? '' : al}t}(A\cos ${be === 1 ? '' : be}t + B\sin ${be === 1 ? '' : be}t)$ with $q(0) = 0$ and $q'(0) = 0$.`],
          teach: 'A battery switched onto an RLC is a constant force on a spring: q = Cℰ plus a transient fitted to q(0) = 0 and i(0) = 0.',
          explain: t`$A = -${nice(Q)}$ from $q(0) = 0$; $q'(0) = -${al}A + ${be}B = 0$ gives $B = ${nice(-Q * k)}$. So $q = ${nice(Q)}\left[1 - e^{-${al === 1 ? '' : al}t}\left(\cos ${be === 1 ? '' : be}t + ${nice(k)}\sin ${be === 1 ? '' : be}t\right)\right]$: it overshoots $C\mathcal{E}$ once, then settles.`,
          visual: rlcPic({ E: `${E} V`, R: `${R} Ω`, L: `${L} H`, C: `${C} F`, caption: 'The series circuit, at the moment the switch closes. Values as given; the battery is ideal.' }),
        };
      },
    }),
    num({
      id: 'initial-slope', difficulty: 2,
      gen(r) {
        const E = r.pick([9, 12, 28]), LmH = r.pick([2, 5, 10]), R = r.pick([4, 10]);
        const s = E / (LmH * 1e-3);
        return {
          prompt: t`At $t = 0$ a switch connects a ${E} V battery to a series circuit of $R = ${R}\ \Omega$, $L = ${LmH}$ mH and an uncharged capacitor. The current starts at zero. At what rate, in A/s, does it begin to grow?`,
          answer: s, units: 'A/s', tol: { rel: 0.005 },
          errors: [{ value: E / R, feedback: t`$\mathcal{E}/R$ is a current, not a rate. At $t = 0$ the current is zero, so $R$ drops no voltage and neither does the empty capacitor: the coil takes it all.` }, { value: 0, feedback: t`The current is zero at $t = 0$, but its rate is not: $L\,di/dt = \mathcal{E} - Ri - q/C = \mathcal{E}$.` }],
          hints: [t`Write the loop rule at $t = 0$: what are $i$ and $q$ then?`, t`With $i(0) = 0$ and $q(0) = 0$: $L\,i'(0) = \mathcal{E}$.`],
          teach: 'Just after switch-on the coil takes the whole source voltage, so i′(0) = ℰ/L — the second initial condition of the current’s equation.',
          explain: t`$L\,i'(0) = \mathcal{E} - R\cdot0 - 0/C$, so $i'(0) = \mathcal{E}/L = ${E}/(${LmH}\times10^{-3}) = ${nice(s)}$ A/s. Differentiating the loop rule, the current obeys $L\,i'' + R\,i' + i/C = \mathcal{E}'(t) = 0$: a homogeneous equation, started with $i(0) = 0$ and this slope — a mass kicked from rest.`,
          visual: rlcPic({ E: `${E} V`, R: `${R} Ω`, L: `${LmH} mH`, C: 'C', caption: 'The circuit at the instant the switch closes: no current yet, no charge yet.' }),
        };
      },
    }),
    mcq({
      id: 'r-not-spring', difficulty: 2, kind: 'error',
      prompt: t`A student reasons: “Resistance opposes the current, like a spring opposing displacement — so doubling $R$ should raise the circuit’s natural frequency.” What is wrong?`,
      choices: [
        t`$R$ multiplies $q'$, so it plays the damper $b$, not the spring; doubling it makes the ringing die faster and slightly *lowers* the frequency, $\omega_d = \sqrt{1/LC - (R/2L)^2}$`,
        t`Nothing: $\omega_0 = R/\sqrt{LC}$`,
        t`$R$ plays the mass: doubling it halves the frequency`,
        t`$R$ has no effect at all on how the circuit oscillates`,
      ],
      answer: 0,
      why: {
        1: t`$\omega_0 = 1/\sqrt{LC}$ contains no $R$. The spring is the capacitor: its voltage $q/C$ grows with the displacement $q$.`,
        2: t`The mass is $L$, the coefficient of $q''$: inductance resists changes in current, as mass resists changes in velocity.`,
        3: t`It does not set the frequency, but it does set the decay $e^{-Rt/2L}$ and, through $\omega_d$, shifts the ringing slightly.`,
      },
      hints: [t`Which derivative of $q$ does $R$ multiply in $Lq'' + Rq' + q/C$?`, t`Opposing *velocity* is what a dashpot does; opposing *displacement* is what a spring does.`],
      teach: 'Match terms by the derivative they multiply: R multiplies q′, so it is damping — it sets decay, not frequency.',
      explain: t`The resistor’s voltage $Ri = Rq'$ is proportional to the rate of change of charge — a velocity-dependent force, a dashpot. The capacitor’s $q/C$ is the spring. Doubling $R$ doubles the decay rate $R/2L$ and lowers $\omega_d$ a little.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3], y: [-1.1, 1.15], aspect: 'wide', xlabel: 't (ms)', ylabel: 'q / q₀',
          curves: [
            { fn: 'exp(-0.5*x)*(cos(9.98749*x) + 0.0500626*sin(9.98749*x))', color: 'accent', width: 2, label: 'R', labelAt: 0.95, labelDx: 6, labelDy: -4 },
            { fn: 'exp(-x)*(cos(9.94987*x) + 0.100504*sin(9.94987*x))', color: 'warn', width: 2, label: '2R', labelAt: 1.55, labelDx: 6, labelDy: 10 },
          ],
        },
        caption: 'The same LC circuit with resistance R and 2R, released from the same charge: the ringing dies faster, at almost the same frequency. Illustrative values.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ringing-R', difficulty: 3,
      gen(r) {
        const f = r.pick([2, 5, 10]), n = r.pick([2, 3, 4]), LmH = r.pick([1, 5]);
        const a = (f * 1e3 * Math.LN2) / n, R = 2 * LmH * 1e-3 * a;
        return {
          prompt: t`Disconnected from its source, a series RLC circuit with $L = ${LmH}$ mH rings at ${f} kHz, and an oscilloscope shows the amplitude halving every ${n} cycles. What is its resistance?`,
          answer: R, units: 'Ω', tol: { rel: 0.01 },
          errors: [{ value: R / 2, feedback: t`The amplitude decays like $e^{-\alpha t}$ with $\alpha = R/2L$, so $R = 2L\alpha$.` }, { value: (LmH * 1e-3 * f * 1e3 * Math.log(2)) / n, feedback: t`The decay rate is $\alpha = \dfrac{\ln 2}{t_{1/2}}$ with $t_{1/2} = ${n}/f$; then $R = 2L\alpha$.` }].filter((e) => Math.abs(e.value - R) > 0.01 * R),
          hints: [t`Halving every ${n} cycles takes $t_{1/2} = ${n}/(${f}\times10^3)$ s, and the envelope is $e^{-Rt/2L}$.`, t`$\dfrac{R}{2L}\,t_{1/2} = \ln 2$, so $R = \dfrac{2L\ln 2}{t_{1/2}}$.`],
          teach: 'A circuit’s ring-down measures its resistance: the envelope is $e^{-Rt/2L}$, the twin of $e^{-bt/2m}$.',
          explain: t`$t_{1/2} = ${n}/${f * 1000} = ${tex(n / (f * 1e3), 3)}$ s, so $R = \dfrac{2(${LmH}\times10^{-3})\ln 2}{${tex(n / (f * 1e3), 3)}} = ${tex(R, 3)}\ \Omega$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, n * 2.6], y: [-1.1, 1.15], aspect: 'wide', xlabel: 't (cycles)', ylabel: 'voltage (relative)',
              curves: [
                { fn: `exp(-${r6(Math.LN2 / n)}*x)*cos(2*pi*x)`, color: 'accent', width: 1.8 },
                { fn: `exp(-${r6(Math.LN2 / n)}*x)`, color: 'ink3', width: 1.2, dash: true },
              ],
              hlines: [{ y: 0.5, label: 'half', color: 'gold' }],
              vlines: [{ x: n, label: `${n} cycles`, color: 'gold' }],
            },
            caption: 'The oscilloscope trace: the envelope (dashed) halves every few cycles.',
          },
        };
      },
    }),
    num({
      id: 'cp-peak-time', difficulty: 2,
      gen(r) {
        const LuH = r.pick([10, 22]), CuF = r.pick([47, 100]), R = r.pick([0.1, 0.2]);
        const L = LuH * 1e-6, C = CuF * 1e-6, z = (R / 2) * Math.sqrt(C / L), wd = Math.sqrt(1 / (L * C) - (R / (2 * L)) ** 2);
        const tp = (Math.PI / wd) * 1e6;
        return {
          prompt: t`A discharged filter, $L = ${LuH}\ \mu\text{H}$, $C = ${CuF}\ \mu\text{F}$ and $R = ${R}\ \Omega$ in series, is switched onto a 28 V bus. How many microseconds after switch-on does its capacitor voltage peak?`,
          answer: tp, units: 'µs', tol: { rel: 0.01 },
          errors: [{ value: (Math.PI / (2 * wd)) * 1e6, feedback: t`A quarter period is when the current peaks. The voltage peaks when the current returns to zero: half a damped period, $\pi/\omega_d$.` }, { value: 2 * tp, feedback: t`One full period brings the voltage back to its *lowest* point; the first peak is at half a period.` }],
          hints: [t`The voltage peaks when $i = q' = 0$ again: half a damped period after the start.`, t`$\omega_d = \sqrt{\dfrac{1}{LC} - \left(\dfrac{R}{2L}\right)^2}$, and $t = \pi/\omega_d$.`],
          teach: 'The first peak of a switched-on RLC comes half a damped period in, when the current has fallen back to zero.',
          explain: t`$\omega_d = ${tex(wd, 3)}$ rad/s (with $\zeta = ${tex(z, 2)}$), so $t = \pi/\omega_d = ${tex(tp, 3)}\ \mu\text{s}$.`,
          visual: rlcPic({ E: '28 V', R: `${R} Ω`, L: `${LuH} µH`, C: `${CuF} µF`, caption: 'The filter at switch-on. Ideal components.' }),
        };
      },
    }),
    num({
      id: 'cp-pyro', difficulty: 4, transfer: true,
      gen(r) {
        const R = r.pick([0.8, 1, 1.2]), LuH = r.pick([3, 5]), V0 = r.pick([28, 36]), C = 100e-6;
        const L = LuH * 1e-6, a = R / (2 * L), s = Math.sqrt(a * a - 1 / (L * C));
        const r1 = -a + s, r2 = -a - s, ts = Math.log(r2 / r1) / (r1 - r2);
        const ip = (V0 / (L * (r1 - r2))) * (Math.exp(r1 * ts) - Math.exp(r2 * ts));
        const z = (R / 2) * Math.sqrt(C / L);
        return {
          prompt: t`A rocket’s pyrotechnic igniter is fired by a 100 µF capacitor charged to ${V0} V, discharged through the igniter’s bridgewire ($R = ${R}\ \Omega$) and the cable’s inductance ($L = ${LuH}\ \mu\text{H}$). The charge obeys $Lq'' + Rq' + q/C = 0$ with $q(0) = CV_0$ and $i(0) = 0$. What peak current flows through the bridgewire?`,
          answer: ip, units: 'A', tol: { rel: 0.01 },
          errors: [
            { value: V0 / R, feedback: t`$V_0/R$ is what would flow with no inductance. The cable’s inductance holds the current back while the capacitor drains, so the peak is lower.` },
            { value: V0 * Math.sqrt(C / L), feedback: t`$V_0\sqrt{C/L}$ is the peak of an undamped LC circuit. Here $\zeta = ${tex(z, 3)} > 1$: overdamped, with real roots.` },
          ],
          hints: [t`$\zeta = \dfrac{R}{2}\sqrt{C/L} = ${tex(z, 3)} > 1$: the roots $r_{1,2} = -\dfrac{R}{2L} \pm \sqrt{\dfrac{R^2}{4L^2} - \dfrac{1}{LC}}$ are real.`, t`With these initial conditions $|i(t)| = \dfrac{V_0}{L(r_1 - r_2)}\left(e^{r_1t} - e^{r_2t}\right)$, which peaks where its derivative vanishes: $t^* = \dfrac{\ln(r_2/r_1)}{r_1 - r_2}$.`, t`Here $r_1 = ${tex(r1, 4)}$ s⁻¹ and $r_2 = ${tex(r2, 4)}$ s⁻¹.`],
          teach: 'An overdamped discharge is one pulse, the difference of two real exponentials; its peak is where the two rates balance.',
          explain: t`$r_1 = ${tex(r1, 4)}$, $r_2 = ${tex(r2, 4)}$ s⁻¹; the current peaks at $t^* = ${tex(ts * 1e6, 3)}\ \mu\text{s}$ at ${tex(ip, 3)} A. Overdamping is what an igniter wants: a single pulse that never reverses, delivering the bridgewire’s firing energy within microseconds. (The bridgewire’s resistance rises as it heats, which this linear model ignores.)`,
          visual: {
            type: 'graph',
            params: {
              x: [0, r6(8 * ts * 1e6)], y: [0, 1.15], yticks: 0, aspect: 'wide', xlabel: 't (µs)', ylabel: 'current (no scale)',
              curves: [{ fn: `(exp(${r6(r1 * 1e-6)}*x) - exp(${r6(r2 * 1e-6)}*x))/${r6(Math.exp(r1 * ts) - Math.exp(r2 * ts))}`, color: 'accent', width: 2.4 }],
            },
            caption: 'The shape of the discharge current (axis unnumbered): a fast rise held back by the inductance, then a slower decay as the capacitor empties. Linear model; constant bridgewire resistance.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.4 Mechanical vibrations (and the RLC analogy)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax University Physics Vol. 2, §14.6 RLC series circuits', url: 'https://openstax.org/books/university-physics-volume-2/pages/14-6-rlc-series-circuits' },
  ],
});
