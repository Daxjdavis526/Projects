// RC circuits: the loop rule ℰ − iR − q/C = 0 is a first-order differential
// equation; its solution is an exponential approach with time constant
// τ = RC. An empty capacitor acts like a wire at first and a full one like a
// break; after τ it is 63% of the way, after 5τ over 99%.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sf, apart, circuit, rcGraph } from './_circuits.js';

const t = String.raw;
/** Time units for a time constant: [scale, unit]. */
const unitOf = (tau) => (tau >= 0.5 ? [1, 's'] : tau >= 5e-4 ? [1e-3, 'ms'] : [1e-6, 'µs']);

export default lesson({
  id: 'phys2220.E6.5',
  title: 'RC circuits',
  minutes: 12, difficulty: 3,
  intro: t`Close a switch that connects an empty capacitor to a battery through a resistor. At first the capacitor has no charge and so no voltage: it acts like a plain wire, and the current jumps to $\mathcal{E}/R$. As charge piles up, the capacitor’s voltage $q/C$ pushes back against the battery, the voltage left across the resistor shrinks, and the current dies away. The loop rule says it all: $\mathcal{E} - iR - q/C = 0$ with $i = dq/dt$, a first-order differential equation whose solution approaches its final value exponentially. The pace is set by one number, the **time constant** $\tau = RC$: after one $\tau$ the capacitor is 63% of the way there, after $5\tau$ more than 99%. Discharging through a resistor, the voltage simply decays: $V_C = V_0e^{-t/RC}$.`,
  equation: t`V_C(t) = \mathcal{E}\left(1 - e^{-t/RC}\right), \qquad \tau = RC`,
  symbols: [
    { tex: 'V_C(t)', text: 'the voltage across the capacitor at time $t$ after the switch closes, in volts' },
    { tex: '\\mathcal{E}', text: 'the battery’s emf: the voltage the capacitor heads toward' },
    { tex: 'R,\\ C', text: 'the resistance (Ω) and capacitance (F) the charge flows through and onto' },
    { tex: '\\tau = RC', text: 'the time constant, in seconds (Ω × F = s): the time to cover 63% of the way to the final value' },
    { tex: 'e', text: 'Euler’s number, 2.718…; $e^{-1} = 0.368$, so one time constant leaves 36.8% of the change still to come' },
    { tex: 'I(t) = \\dfrac{\\mathcal{E}}{R}e^{-t/RC}', text: 'the current while charging: largest at the start, decaying with the same time constant' },
  ],
  why: 'RC time constants are everywhere: timers and delays, the smoothing of power supplies, how fast a sensor responds — and how quickly a firing capacitor dumps its energy into an igniter, or a charged person into a spark.',
  visual: {
    type: 'em-circuit',
    title: 'Charging and discharging',
    lead: t`The switch connects the battery to the resistor and capacitor (Charge), or cuts the battery out and lets the capacitor discharge through the resistor (Discharge). The graph follows the capacitor’s voltage in time, with the time constant marked.`,
    tasks: [
      'Charge and read the voltage at the τ line: 63% of the battery’s 12 V, about 7.6 V.',
      'Double R and Restart: τ doubles, and so does the time to reach any level.',
      'Switch to Discharge: after one τ, 37% of the voltage is left; the current flows the other way.',
    ],
    params: { circuit: 'rc', opts: { net: 'single' }, values: { E: 12, R: 1000, C: 1e-3 }, sliders: [{ key: 'R', min: 100, max: 5000, step: 100 }, 'C'], show: { I: true, drop: true } },
  },
  example: {
    prompt: t`A 9.0 V battery charges an empty 100 µF capacitor through a 47 kΩ resistor. Find the time constant, the capacitor’s voltage and the current 2.0 s after the switch closes, and how long it takes to reach 90% of 9.0 V.`,
    visual: circuit('rc', { opts: { net: 'single' }, values: { E: 9, R: 47e3, C: 100e-6 }, graph: 'static', t: 2, caption: 'The circuit and the capacitor’s voltage against time; the dot marks t = 2.0 s. Ideal capacitor, no leakage.' }),
    steps: [
      { label: 'Time constant', text: t`$\tau = RC = (47\times10^3\ \Omega)(100\times10^{-6}\ \text{F}) = 4.7$ s. (Ω·F = (V/A)(C/V) = C/A = s.)` },
      { label: 'Voltage at 2.0 s', text: t`$V_C = 9.0\left(1 - e^{-2.0/4.7}\right) = 9.0(1 - 0.653) = 3.1$ V.` },
      { label: 'Current at 2.0 s', text: t`The rest of the 9.0 V is across the resistor: $I = (9.0 - 3.1)/47\,\text{k}\Omega = 0.13$ mA — or directly, $\dfrac{9.0}{47\times10^3}e^{-2.0/4.7} = 0.13$ mA.` },
      { label: '90%', text: t`$1 - e^{-t/\tau} = 0.90$ means $e^{-t/\tau} = 0.10$, so $t = \tau\ln 10 = 4.7\times2.303 = 10.8$ s.` },
      { label: 'Sense check', text: t`2.0 s is less than half a time constant, so the capacitor is only about a third charged; 90% takes about $2.3\tau$. Neither depends on the battery’s voltage — only on $RC$.` },
    ],
    answer: t`$\tau = 4.7$ s; at 2.0 s, $V_C = 3.1$ V and $I = 0.13$ mA; 90% after 10.8 s.`,
  },
  practice: [
    num({
      id: 'tau', difficulty: 1,
      gen(r) {
        const R = r.pick([1, 2.2, 4.7, 10, 47]), C = r.pick([10, 22, 100, 470]);   // kΩ, µF
        const tau = R * 1e3 * C * 1e-6;
        return {
          prompt: t`What is the time constant of a ${R} kΩ resistor charging a ${C} µF capacitor?`,
          answer: tau, units: 's', tol: { rel: 0.005 },
          errors: apart([{ value: (R * 1e3) / (C * 1e-6), feedback: t`Multiply: $\tau = RC$.` }], tau),
          hints: [t`$\tau = RC$ with $R$ in Ω and $C$ in F.`, 'kΩ × µF = 10³ × 10⁻⁶ = ms.'],
          teach: t`The time constant is $\tau = RC$; in convenient units, kΩ × µF gives milliseconds.`,
          explain: t`$\tau = (${R}\times10^3)(${C}\times10^{-6}) = ${nice(sf(tau))}$ s.`,
          visual: circuit('rc', { opts: { net: 'single' }, values: { E: 12, R: R * 1e3, C: C * 1e-6 }, caption: 'The charging circuit, just after the switch closes.' }),
        };
      },
    }),
    num({
      id: 'v-at-t', difficulty: 2,
      gen(r) {
        const E = r.pick([5, 9, 12]), R = r.pick([10, 22, 47]), C = r.pick([47, 100, 220]);    // V, kΩ, µF
        const tau = R * C * 1e-3;   // s
        const tt = sf(r.pick([0.3, 0.7, 1.5, 2.5]) * tau, 2);
        const V = E * (1 - Math.exp(-tt / tau));
        return {
          prompt: t`A ${E} V battery charges an empty ${C} µF capacitor through ${R} kΩ. What is the capacitor’s voltage ${tt} s after the switch closes?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: apart([{ value: E * Math.exp(-tt / tau), feedback: t`That is the voltage still *to come* (or a discharging capacitor’s). Charging: $V = \mathcal{E}(1 - e^{-t/RC})$.` }, { value: E * (1 - Math.exp(-tt * tau)), feedback: t`Divide $t$ by $\tau$ in the exponent: $e^{-t/RC}$.` }], V),
          hints: [t`$\tau = RC = ${nice(sf(tau))}$ s.`, t`$V_C = \mathcal{E}\left(1 - e^{-t/\tau}\right)$.`],
          teach: t`A charging capacitor’s voltage is $\mathcal{E}(1 - e^{-t/RC})$.`,
          explain: t`$\tau = (${R}\times10^3)(${C}\times10^{-6}) = ${nice(sf(tau))}$ s; $V_C = ${E}\left(1 - e^{-${tt}/${nice(sf(tau))}}\right) = ${nice(sf(V))}$ V.`,
          visual: circuit('rc', { opts: { net: 'single' }, values: { E, R: R * 1e3, C: C * 1e-6 }, graph: 'static', caption: 'The charging curve over five time constants (the τ line dashed).' }),
        };
      },
    }),
    num({
      id: 'time-to', difficulty: 3,
      gen(r) {
        const f = r.pick([0.5, 0.9, 0.95, 0.99]), tau = r.pick([0.2, 1.5, 4.7, 10]);
        const T = -tau * Math.log(1 - f);
        return {
          prompt: t`A capacitor charges through a resistor with $\tau = ${tau}$ s. How long after the switch closes does it reach ${f * 100}% of its final voltage?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: apart([{ value: tau * f, feedback: 'The approach is exponential, not linear: use the logarithm.' }, { value: -tau * Math.log(f), feedback: t`Solve $1 - e^{-t/\tau} = ${f}$, so $e^{-t/\tau} = ${nice(sf(1 - f))}$ — not $${f}$.` }], T),
          hints: [t`Set $1 - e^{-t/\tau} = ${f}$.`, t`Then $e^{-t/\tau} = ${nice(sf(1 - f))}$; take logs: $t = \tau\ln\dfrac{1}{${nice(sf(1 - f))}}$.`],
          teach: t`To reach a fraction $f$ of the final value takes $t = \tau\ln\dfrac{1}{1 - f}$: about $0.69\tau$ for half, $2.3\tau$ for 90%, $4.6\tau$ for 99%.`,
          explain: t`$t = ${tau}\ln\dfrac{1}{${nice(sf(1 - f))}} = ${tau}\times${nice(sf(Math.log(1 / (1 - f)), 4))} = ${nice(sf(T))}$ s.`,
          visual: rcGraph({ tau, Vf: 1, vLabel: 'V / ℰ', extra: { hlines: [{ y: 1, color: 'ink3' }, { y: f, label: `${f * 100}%`, color: 'gold' }] }, caption: 'The charging curve, as a fraction of the final voltage; the gold line is the level you are timing.' }),
        };
      },
    }),
    mcq({
      id: 'ends', difficulty: 2,
      prompt: t`An empty capacitor $C$ is connected to a battery $\mathcal{E}$ through a resistor $R$. Which describes the moment just after the switch closes, and the state long afterwards?`,
      choices: [
        t`Just after: $I = \mathcal{E}/R$, $V_C = 0$ (the capacitor acts like a wire). Long after: $I = 0$, $V_C = \mathcal{E}$ (like a break)`,
        t`Just after: $I = 0$, because the capacitor is empty. Long after: $I = \mathcal{E}/R$`,
        t`The current is $\mathcal{E}/R$ throughout, until the capacitor is full`,
        t`Just after: $V_C = \mathcal{E}$, since the battery’s voltage appears at once. Long after: $V_C = 0$`,
      ],
      answer: 0,
      why: {
        1: 'An empty capacitor has no voltage to oppose the battery, so the current is largest at the start, not zero.',
        2: 'As charge builds up, the capacitor’s voltage subtracts from the battery’s, so the current falls steadily.',
        3: 'The capacitor’s voltage is q/C: it starts at zero and can only build up as charge flows on.',
      },
      hints: [t`At $t = 0$, $q = 0$, so $V_C = q/C = 0$. What does the loop rule leave across $R$?`, 'When the current has stopped, there is no voltage across R.'],
      teach: 'An empty capacitor behaves like a wire at the instant of switching, and a fully charged one like a break.',
      explain: t`With $q = 0$, the loop rule puts all of $\mathcal{E}$ across $R$: $I = \mathcal{E}/R$. Long after, $I \to 0$, so nothing is dropped across $R$ and $V_C \to \mathcal{E}$. These two limits let you sketch any RC circuit before solving it.`,
      visual: circuit('rc', { opts: { net: 'single' }, values: { E: 12, R: 1000, C: 1e-3 }, caption: 'The circuit at the instant the switch moves to Charge.' }),
    }),
    num({
      id: 'discharge', difficulty: 2,
      gen(r) {
        const V0 = r.pick([12, 24, 50]), tau = r.pick([0.5, 2, 5]), n = r.pick([0.5, 1, 2, 3]);
        const tt = sf(n * tau, 3), V = V0 * Math.exp(-tt / tau);
        return {
          prompt: t`A capacitor charged to ${V0} V discharges through a resistor with $\tau = ${tau}$ s. What is its voltage ${tt} s later?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: apart([{ value: V0 * (1 - Math.exp(-tt / tau)), feedback: t`That is the charging curve. Discharging is a pure decay: $V = V_0e^{-t/\tau}$.` }], V),
          hints: [t`$V = V_0e^{-t/\tau}$.`],
          teach: t`A discharging capacitor’s voltage decays as $V_0e^{-t/RC}$, losing 63% of what is left in every time constant.`,
          explain: t`$V = ${V0}e^{-${tt}/${tau}} = ${V0}\times${nice(sf(Math.exp(-tt / tau), 4))} = ${nice(sf(V))}$ V.`,
          visual: rcGraph({ tau, V0, Vf: 0, vLabel: 'V (V)', caption: 'The discharge: an exponential decay toward zero (the τ line dashed).' }),
        };
      },
    }),
    num({
      id: 'semilog', difficulty: 3,
      gen(r) {
        const tau = r.pick([2, 3.5, 5, 8]), V0 = r.pick([10, 12]);
        const ts = [0, 2, 4, 6, 8, 10];
        const pts = ts.map((x) => ({ x, y: +Math.log(V0 * Math.exp(-x / tau)).toFixed(3), color: 'gold', r: 4.5 }));
        const t2 = 10, V2 = V0 * Math.exp(-t2 / tau);
        return {
          prompt: t`In a lab, a capacitor discharges through a resistor. The student plots $\ln V$ against time and gets the straight line shown: $\ln V$ falls from $${nice(sf(Math.log(V0), 4))}$ at $t = 0$ to $${nice(sf(Math.log(V2), 4))}$ at $t = 10$ s. What is the time constant?`,
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: apart([{ value: 1 / tau, feedback: t`That is the size of the slope, $1/\tau$. The time constant is its reciprocal.` }], tau),
          hints: [t`$V = V_0e^{-t/\tau}$ gives $\ln V = \ln V_0 - t/\tau$: a straight line of slope $-1/\tau$.`, t`Slope $= (${nice(sf(Math.log(V2), 4))} - ${nice(sf(Math.log(V0), 4))})/10$ per second.`],
          teach: t`Plotting $\ln V$ against $t$ turns an exponential decay into a straight line of slope $-1/\tau$.`,
          explain: t`Slope $= \dfrac{${nice(sf(Math.log(V2), 4))} - ${nice(sf(Math.log(V0), 4))}}{10\ \text{s}} = ${nice(sf(-1 / tau, 3))}\ \text{s}^{-1}$, so $\tau = ${tau}$ s. Fitting the line uses every point, which is why labs linearize data this way.`,
          visual: {
            type: 'graph',
            params: { x: [0, 11], y: [Math.floor(Math.log(V2)) - 0.5, Math.ceil(Math.log(V0)) + 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'ln(V / 1 V)', points: pts,
              curves: [{ fn: `${sf(Math.log(V0), 8)} - x/${tau}`, color: 'ink3', width: 1.2, dash: true }] },
            caption: 'The measurements, with ln V on the vertical axis: a straight line, so the decay is exponential.',
          },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student says: “After one time constant, a charging capacitor has 37% of its final charge, because $e^{-1} = 0.37$.” What is wrong?`,
      choices: [
        t`$e^{-1}$ is the fraction still to come: the capacitor has $1 - e^{-1} = 63\%$`,
        t`It should be 50%: a time constant is the half-life`,
        t`$e^{-1} = 0.5$, not 0.37`,
        'Nothing: 37% is right',
      ],
      answer: 0,
      why: {
        1: t`The half-life is $\tau\ln 2 = 0.69\tau$, shorter than $\tau$.`,
        2: t`$e^{-1} = 1/2.718 = 0.368$.`,
        3: t`37% would be right for a *discharging* capacitor (what is left of its charge), not a charging one.`,
      },
      hints: [t`Charging: $q = Q_f(1 - e^{-t/\tau})$. Put $t = \tau$.`, t`What does the $e^{-t/\tau}$ term describe — the part done, or the part left?`],
      teach: t`After one time constant a charging capacitor is 63% full; a discharging one has 37% left.`,
      explain: t`$q(\tau) = Q_f(1 - e^{-1}) = 0.632\,Q_f$. The 37% describes what is still to come — or, for a discharge, what remains. The curve shows the τ line crossing the charging curve at 63%.`,
      visual: rcGraph({ tau: 1, Vf: 1, vLabel: 'fraction charged', tUnit: 'τ', caption: 'A charging curve with time in units of τ; the dashed line marks t = τ.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fire', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.pick([2200, 3300, 4700]), Rb = r.pick([1.0, 1.1]), V0 = r.pick([24, 28]), Iaf = 3.5;
        const tau = Rb * C * 1e-6, I0 = V0 / Rb, T = tau * Math.log(I0 / Iaf);
        return {
          prompt: t`A firing unit’s ${C} µF bank, charged to ${V0} V, is switched across a ${Rb} Ω bridgewire. The igniter is reliably fired by any current above ${Iaf} A. For how long does the current stay above ${Iaf} A? (Ignore the wiring’s resistance.)`,
          answer: T * 1e3, units: 'ms', tol: { rel: 0.01 },
          errors: apart([{ value: tau * 1e3, feedback: 'That is the time constant. The current starts well above 3.5 A, so it takes several time constants to fall that far.' }, { value: tau * Math.log(V0 / Iaf) * 1e3, feedback: 'The initial current is V₀/R, not V₀ in amperes.' }], T * 1e3),
          hints: [t`The current decays as $I = (V_0/R)e^{-t/RC}$, starting at $${nice(sf(I0))}$ A.`, t`Solve $(V_0/R)e^{-t/\tau} = ${Iaf}$: $t = \tau\ln\dfrac{V_0/R}{${Iaf}}$.`],
          teach: 'A capacitor discharging into a load delivers a current that decays exponentially: the time above any threshold is τ ln(I₀/I).',
          explain: t`$\tau = RC = (${Rb})(${C}\times10^{-6}) = ${nice(sf(tau * 1e3))}$ ms, $I_0 = ${V0}/${Rb} = ${nice(sf(I0))}$ A, so $t = ${nice(sf(tau * 1e3))}\ln(${nice(sf(I0))}/${Iaf}) = ${nice(sf(T * 1e3))}$ ms — plenty for a bridgewire that fires within a few milliseconds. (Real bridgewires heat up and change resistance as they fire; this treats R as fixed.)`,
          visual: circuit('firing', { values: { E: V0, Rc: 1000, C: C * 1e-6, Rb }, switches: { S1: false, S2: true }, graph: 'static', caption: 'The arm switch open and the fire switch closed: the bank discharges through the igniter. Below, the bank’s voltage against time (the igniter current follows the same curve, V/R).' }),
        };
      },
    }),
    num({
      id: 'cp-hbm', difficulty: 2, transfer: true,
      gen(r) {
        const C = r.pick([100, 150, 200]), R = 1500, pct = r.pick([10, 1]);
        const tau = R * C * 1e-12, T = tau * Math.log(100 / pct);
        return {
          prompt: t`Electronics for flight hardware are tested against the Human Body Model of an electrostatic discharge: a charged capacitance discharging through ${R} Ω. Taking a body capacitance of ${C} pF, how long does the voltage take to fall to ${pct}% of its starting value?`,
          answer: T * 1e9, units: 'ns', tol: { rel: 0.01 },
          errors: apart([{ value: tau * 1e9, feedback: 'That is one time constant, which leaves 37%.' }], T * 1e9),
          hints: [t`$\tau = RC$ — with $C$ in pF it comes out in nanoseconds-scale.`, t`$V = V_0e^{-t/\tau}$; set $V/V_0 = ${pct / 100}$ and solve: $t = \tau\ln(${100 / pct})$.`],
          teach: 'An electrostatic discharge is an RC discharge: tiny capacitance through modest resistance gives a time constant of a fraction of a microsecond.',
          explain: t`$\tau = (${R})(${C}\times10^{-12}) = ${nice(sf(tau * 1e9))}$ ns, so $t = ${nice(sf(tau * 1e9))}\ln(${100 / pct}) = ${nice(sf(T * 1e9))}$ ns. The whole spark is over in well under a microsecond, so its peak current — kilovolts over 1.5 kΩ, amperes — is what damages circuits.`,
          visual: circuit('rc', { opts: { net: 'single' }, values: { E: 2000, R, C: C * 1e-12 }, switches: { mode: 'discharge' }, graph: 'static', names: { R: 'R', C: 'body' }, caption: 'The Human Body Model as an RC circuit, switched to discharge. Below, the body’s voltage falling over five time constants.' }),
        };
      },
    }),
    num({
      id: 'cp-delay', difficulty: 2,
      gen(r) {
        const T = r.pick([1, 2, 3, 5]), C = r.pick([10, 22, 47, 100]);   // s, µF
        const R = T / (C * 1e-6);
        return {
          prompt: t`An arming-delay circuit charges a ${C} µF capacitor through a resistor; a comparator trips when the capacitor reaches 63% of the supply voltage. What resistance gives a ${T} s delay?`,
          answer: R / 1e3, units: 'kΩ', tol: { rel: 0.005 },
          errors: apart([{ value: T * C * 1e-6 / 1e3, feedback: t`$\tau = RC$, so $R = \tau/C$, not $\tau C$.` }], R / 1e3),
          hints: ['63% of the final voltage is reached after exactly one time constant.', t`So $RC = ${T}$ s: $R = ${T}/(${C}\times10^{-6})$.`],
          teach: 'Reaching 63% takes one time constant, so a delay circuit sets RC equal to the delay it needs.',
          explain: t`$R = \tau/C = ${T}/(${C}\times10^{-6}) = ${nice(sf(R))}\ \Omega = ${nice(sf(R / 1e3))}$ kΩ. In practice the capacitor’s tolerance (often ±10–20%) sets how accurate such a delay can be.`,
          visual: circuit('rc', { opts: { net: 'single' }, values: { E: 5, R: R, C: C * 1e-6 }, hide: ['R'], caption: 'The delay circuit: the resistor is the part being chosen.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §10.5 RC Circuits', url: 'https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits' },
    { label: 'ANSI/ESDA/JEDEC JS-001: Human Body Model (100 pF, 1.5 kΩ)', url: 'https://www.esda.org/standards/' },
  ],
});
