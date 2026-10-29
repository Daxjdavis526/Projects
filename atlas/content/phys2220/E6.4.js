// Kirchhoff's rules: the junction rule (charge conservation) and the loop
// rule (a conservative field: back where you started, back at the same
// potential). Series and parallel rules follow from them; circuits that do
// not reduce — two batteries, bridges — are solved with them directly.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sf, apart, circuit } from './_circuits.js';

const t = String.raw;
const par = (...R) => 1 / R.reduce((a, r) => a + 1 / r, 0);
/** The two-loop circuit (E₁–R₁ left, R₃ in the middle, R₂–E₂ right, both + at the top): the middle node's potential. */
const twoLoopVc = (E1, E2, R1, R2, R3) => (E1 / R1 + E2 / R2) / (1 / R1 + 1 / R2 + 1 / R3);
const ARROWS = { R1: ['I₁', 1], R2: ['I₂', -1], R3: ['I₃', 1] };

export default lesson({
  id: 'phys2220.E6.4',
  title: 'Kirchhoff’s rules',
  minutes: 13, difficulty: 3,
  intro: t`Two conservation laws are enough to solve any circuit of batteries and resistors.

- **The junction rule.** At any junction, the current flowing in equals the current flowing out. Charge is conserved and, in a steady current, does not pile up anywhere.
- **The loop rule.** Round any closed loop, the changes in potential add up to zero. The field of the circuit’s charges is conservative, so walking round a loop and back to your start brings you back to the same potential — just as walking round a hill brings you back to the same height.

Crossing a battery from its − to its + terminal is a rise of $\mathcal{E}$; crossing a resistor **in the direction of its current** is a drop of $IR$ (against the current, a rise). Applied to elements in a row, the rules give the familiar results: in **series** there is one current and the voltages add, so $R = R_1 + R_2 + \cdots$; in **parallel** there is one voltage and the currents add, so $1/R = 1/R_1 + 1/R_2 + \cdots$. When a circuit does not reduce to series and parallel pieces, you write the rules down directly and solve the equations.`,
  equation: t`\sum I_\text{in} = \sum I_\text{out}, \qquad \sum_\text{loop} \Delta V = 0`,
  symbols: [
    { tex: 'I_\\text{in},\\ I_\\text{out}', text: 'the currents flowing into and out of one junction, in A' },
    { tex: '\\Delta V', text: 'the change in potential crossing each element on the way round a loop: $+\\mathcal{E}$ across a battery from − to +, $-IR$ across a resistor in the direction of its current' },
    { tex: 'R_\\text{s} = R_1 + R_2', text: 'resistors in series: one current through both' },
    { tex: '1/R_\\text{p} = 1/R_1 + 1/R_2', text: 'resistors in parallel: one voltage across both; the combination is smaller than either' },
  ],
  why: 'Every circuit simulator — and every strain-gauge bridge, power bus and sensor network you will meet — is Kirchhoff’s two rules written down for each junction and loop and solved together.',
  visual: {
    type: 'em-circuit',
    title: 'Two batteries, three currents',
    lead: t`Two batteries feed one middle resistor. Pick a loop to trace: the readout adds up the changes in potential round it. The junction line checks the currents at the top middle junction.`,
    tasks: [
      'Trace the left loop, then the right one and the outer one: each time the changes add up to zero.',
      'Check the junction: the current arriving through R₁ equals the currents leaving through R₂ and R₃.',
      'Lower ℰ₂ to 6 V and below: the current through R₂ flows into ℰ₂’s + terminal — the 12 V battery is charging the smaller one. Above 7.2 V it reverses.',
    ],
    params: { circuit: 'twoloop', values: { E1: 12, E2: 6, R1: 4, R2: 2, R3: 6 }, sliders: [{ key: 'E2', min: 0, max: 12, step: 0.2 }, { key: 'R3', min: 1, max: 20, step: 0.5 }], loop: 'left', loopChoice: true, junction: true, show: { I: true, V: true } },
  },
  example: {
    prompt: t`In the circuit shown, $\mathcal{E}_1 = 12$ V, $\mathcal{E}_2 = 6.0$ V, $R_1 = 4.0\ \Omega$, $R_2 = 2.0\ \Omega$ and $R_3 = 6.0\ \Omega$. Find the three currents.`,
    visual: circuit('twoloop', { values: { E1: 12, E2: 6, R1: 4, R2: 2, R3: 6 }, arrows: ARROWS, caption: 'The circuit with a guessed direction for each current (gold arrows). A guess that turns out wrong just gives a negative answer.' }),
    steps: [
      { label: 'Name the currents', text: t`Guess directions: $I_1$ rightward through $R_1$, $I_2$ leftward through $R_2$ (both toward the top middle junction), $I_3$ down through $R_3$.` },
      { label: 'Junction', text: t`At the top middle junction: in $= I_1 + I_2$, out $= I_3$, so $I_1 + I_2 = I_3$.` },
      { label: 'Left loop', text: t`Clockwise from the bottom left: up through $\mathcal{E}_1$ ($+12$), along $R_1$ with $I_1$ ($-4I_1$), down $R_3$ with $I_3$ ($-6I_3$): $\;12 - 4I_1 - 6I_3 = 0$.` },
      { label: 'Right loop', text: t`From the bottom right: up through $\mathcal{E}_2$ ($+6$), left along $R_2$ with $I_2$ ($-2I_2$), down $R_3$ ($-6I_3$): $\;6 - 2I_2 - 6I_3 = 0$.` },
      { label: 'Solve', text: t`So $I_1 = 3 - 1.5I_3$ and $I_2 = 3 - 3I_3$. The junction gives $6 - 4.5I_3 = I_3$: $I_3 = 12/11 = 1.09$ A, then $I_1 = 15/11 = 1.36$ A and $I_2 = -3/11 = -0.27$ A.` },
      { label: 'Read the sign', text: t`$I_2$ came out negative: it really flows the other way, rightward through $R_2$ and into the + terminal of the 6 V battery. The 12 V battery is charging it. Check with the outer loop, clockwise (crossing $R_2$ against the guessed $I_2$ is $+2I_2$): $12 - 4I_1 + 2I_2 - 6 = 12 - \tfrac{60}{11} - \tfrac{6}{11} - 6 = 0$. ✓` },
    ],
    answer: t`$I_1 = 1.36$ A, $I_3 = 1.09$ A, and $0.27$ A through $R_2$ toward the 6 V battery (charging it).`,
  },
  practice: [
    num({
      id: 'series', difficulty: 1,
      gen(r) {
        const R = [r.pick([2, 3, 4, 5]), r.pick([6, 8, 10]), r.pick([12, 15, 20])], E = r.pick([9, 12, 24]);
        const Rs = R[0] + R[1] + R[2];
        return {
          prompt: t`Resistors of ${R[0]} Ω, ${R[1]} Ω and ${R[2]} Ω are in series with a ${E} V battery. What current flows?`,
          answer: E / Rs, units: 'A', tol: { rel: 0.005 },
          errors: apart([{ value: E / par(...R), feedback: 'That uses the parallel rule. In series there is one path: the resistances add.' }, { value: E / R[0] + E / R[1] + E / R[2], feedback: 'In series the same current goes through every resistor; it is not the sum of separate currents.' }], E / Rs),
          hints: ['One current through all three: they add as R₁ + R₂ + R₃.', t`$I = \mathcal{E}/(R_1 + R_2 + R_3)$.`],
          teach: 'In series one current flows through every resistor, and the resistances add.',
          explain: t`$R = ${R.join(' + ')} = ${Rs}\ \Omega$, so $I = ${E}/${Rs} = ${nice(sf(E / Rs))}$ A — the same in all three. The loop rule then checks: the drops $IR_i$ add to ${E} V.`,
          visual: circuit('series', { opts: { n: 3 }, values: { E, R1: R[0], R2: R[1], R3: R[2] }, caption: 'Three resistors in one loop with the battery.' }),
        };
      },
    }),
    num({
      id: 'parallel', difficulty: 2,
      gen(r) {
        const set = r.pick([[4, 12], [6, 3], [10, 15], [12, 6, 4], [20, 30, 60], [8, 8, 4]]);
        const Rp = par(...set);
        return {
          prompt: t`Resistors of ${set.map((x) => `${x} Ω`).join(set.length === 3 ? ', ' : ' and ').replace(/, ([^,]*)$/, ' and $1')} are connected in parallel. What is their equivalent resistance?`,
          answer: Rp, units: 'Ω', tol: { rel: 0.005 },
          errors: apart([{ value: set.reduce((a, b) => a + b, 0), feedback: 'Adding is the series rule. In parallel the reciprocals add.' }, { value: set.reduce((a, b) => a + 1 / b, 0), feedback: t`That is $1/R_\text{p}$, in 1/Ω. Take the reciprocal.` }], Rp),
          hints: [t`$\dfrac{1}{R_\text{p}} = ${set.map((x) => `\\dfrac{1}{${x}}`).join(' + ')}$.`, 'The answer must be smaller than the smallest resistor.'],
          teach: 'In parallel the reciprocals of the resistances add, and the result is below the smallest one: each new path lets more current through.',
          explain: t`$1/R_\text{p} = ${set.map((x) => `1/${x}`).join(' + ')} = ${nice(sf(1 / Rp, 4))}\ \Omega^{-1}$, so $R_\text{p} = ${nice(sf(Rp))}\ \Omega$.`,
          visual: circuit('parallel', { opts: { n: set.length }, values: { E: 12, ...Object.fromEntries(set.map((x, i) => [`R${i + 1}`, x])) }, caption: 'The resistors side by side across the battery.' }),
        };
      },
    }),
    num({
      id: 'combo', difficulty: 2,
      gen(r) {
        const [R1, R2, R3] = r.pick([[2, 6, 3], [4, 12, 6], [1, 4, 4], [3, 6, 12], [5, 20, 20]]), E = r.pick([12, 18, 24]);
        const Req = R1 + par(R2, R3);
        return {
          prompt: t`In the circuit, $R_1 = ${R1}\ \Omega$ is in series with the parallel pair $R_2 = ${R2}\ \Omega$ and $R_3 = ${R3}\ \Omega$, on a ${E} V battery. What current does the battery supply?`,
          answer: E / Req, units: 'A', tol: { rel: 0.005 },
          errors: apart([{ value: E / (R1 + R2 + R3), feedback: 'R₂ and R₃ are side by side: combine them in parallel first.' }, { value: E / par(R1, R2, R3), feedback: 'R₁ is in series with the pair, not in parallel with it.' }], E / Req),
          hints: [t`First $R_2 \parallel R_3 = R_2R_3/(R_2 + R_3)$.`, t`Then add $R_1$: $R = R_1 + R_2\parallel R_3$, and $I = \mathcal{E}/R$.`],
          teach: 'Reduce step by step: combine the parallel pair, then add the series resistor.',
          explain: t`$R_2\parallel R_3 = \dfrac{${R2}\times${R3}}{${R2 + R3}} = ${nice(sf(par(R2, R3)))}\ \Omega$; $R = ${R1} + ${nice(sf(par(R2, R3)))} = ${nice(sf(Req))}\ \Omega$; $I = ${E}/${nice(sf(Req))} = ${nice(sf(E / Req))}$ A.`,
          visual: circuit('combo', { values: { E, R1, R2, R3 }, caption: 'R₁ along the top, then R₂ and R₃ side by side.' }),
        };
      },
    }),
    num({
      id: 'junction', difficulty: 1,
      gen(r) {
        const [R1, R2, R3] = r.pick([[2, 6, 3], [4, 12, 6], [3, 6, 12], [1, 3, 6]]), E = 12;
        const I = E / (R1 + par(R2, R3)), V23 = I * par(R2, R3), I2 = V23 / R2, I3 = V23 / R3;
        return {
          prompt: t`The battery supplies ${nice(sf(I))} A, and ${nice(sf(I2))} A of it flows through $R_2$. How much flows through $R_3$?`,
          answer: I3, units: 'A', tol: { rel: 0.01 },
          errors: apart([{ value: I, feedback: 'The current splits at the junction: R₃ gets only what does not go through R₂.' }, { value: I + I2, feedback: 'Out of the junction must equal in, so subtract.' }], I3),
          hints: ['At the junction above R₂ and R₃: current in = current out.'],
          teach: 'The junction rule: the currents leaving a junction add up to the current arriving.',
          explain: t`$I_3 = I - I_2 = ${nice(sf(I))} - ${nice(sf(I2))} = ${nice(sf(I3))}$ A. (Check: both have the same voltage, so the currents are in the ratio $R_3 : R_2$ reversed.)`,
          visual: circuit('combo', { values: { E, R1, R2, R3 }, show: { I: true }, hide: ['I:R3'], caption: 'The currents through the battery, R₁ and R₂ are marked; the one through R₃ is what you are finding.' }),
        };
      },
    }),
    mcq({
      id: 'loop-sign', difficulty: 2,
      prompt: t`Going round the right-hand loop in the direction of the gold arrow, you cross $R_3$ upward, against the current $I_3$ flowing down through it. What term does $R_3$ add to the loop equation?`,
      choices: [t`$+I_3R_3$`, t`$-I_3R_3$`, '0: it belongs to the other loop', t`$+\mathcal{E}_2$`],
      answer: 0,
      why: {
        1: t`Crossing a resistor *with* its current is a drop, $-IR$. Against the current you go from low potential to high: a rise.`,
        2: 'A resistor shared by two loops appears in both loop equations.',
        3: 'The battery contributes its own term; R₃ contributes I₃R₃ with a sign.',
      },
      hints: ['Current flows from higher to lower potential through a resistor.', 'Going against the current, are you climbing or descending?'],
      teach: 'Crossing a resistor against its current is a rise of IR; with the current, a drop.',
      explain: t`The current runs down through $R_3$ from high potential to low, so the top of $R_3$ is $I_3R_3$ higher. Climbing up through it raises your potential by $I_3R_3$: the term is $+I_3R_3$.`,
      visual: circuit('twoloop', { values: { E1: 12, E2: 6, R1: 4, R2: 2, R3: 6 }, loop: 'right', arrows: { R3: ['I₃', 1] }, caption: 'The right-hand loop traced in the direction of the arrow on the highlight; I₃ flows down through R₃.' }),
    }),
    num({
      id: 'two-loop', difficulty: 3,
      gen(r) {
        const [E1, E2] = r.pick([[12, 6], [9, 3], [24, 12], [12, 9], [6, 3]]);
        const [R1, R2, R3] = r.pick([[4, 2, 6], [2, 3, 6], [3, 6, 2], [6, 3, 4], [2, 2, 4]]);
        const Vc = twoLoopVc(E1, E2, R1, R2, R3), I3 = Vc / R3;
        return {
          prompt: t`In the circuit, $\mathcal{E}_1 = ${E1}$ V, $\mathcal{E}_2 = ${E2}$ V, $R_1 = ${R1}\ \Omega$, $R_2 = ${R2}\ \Omega$ and $R_3 = ${R3}\ \Omega$. What current flows through $R_3$?`,
          answer: I3, units: 'A', tol: { rel: 0.005 },
          errors: apart([{ value: E1 / (R1 + R3), feedback: 'That ignores the second battery and R₂: both loops share R₃, so you need both loop equations.' }, { value: (E1 + E2) / R3, feedback: 'The batteries are not simply added: each drives its current through its own resistor first.' }], I3),
          hints: ['Guess directions: I₁ through R₁ and I₂ through R₂ both toward the top middle junction, I₃ down through R₃.', t`Junction: $I_1 + I_2 = I_3$. Left loop: $\mathcal{E}_1 - I_1R_1 - I_3R_3 = 0$. Right loop: $\mathcal{E}_2 - I_2R_2 - I_3R_3 = 0$.`, t`Substitute $I_1 = (\mathcal{E}_1 - I_3R_3)/R_1$ and $I_2 = (\mathcal{E}_2 - I_3R_3)/R_2$ into the junction equation and solve for $I_3$.`],
          teach: 'Write one junction equation and one equation per independent loop, then solve them together.',
          explain: t`With $V$ the potential at the top middle junction ($= I_3R_3$): $\dfrac{${E1} - V}{${R1}} + \dfrac{${E2} - V}{${R2}} = \dfrac{V}{${R3}}$, so $V = ${nice(sf(Vc, 4))}$ V and $I_3 = V/${R3} = ${nice(sf(I3))}$ A. Then $I_1 = ${nice(sf((E1 - Vc) / R1))}$ A and $I_2 = ${nice(sf((E2 - Vc) / R2))}$ A${(E2 - Vc) / R2 < 0 ? ' — negative: that current really flows into the smaller battery, charging it' : ''}.`,
          visual: circuit('twoloop', { values: { E1, E2, R1, R2, R3 }, arrows: ARROWS, caption: 'Gold arrows: guessed directions of the three currents.' }),
        };
      },
    }),
    num({
      id: 'ladder', difficulty: 3,
      gen(r) {
        const [R1, R2, R3, R4] = r.pick([[2, 4, 2, 2], [1, 6, 1, 2], [3, 12, 2, 4], [5, 10, 4, 6], [2, 3, 4, 2]]);
        const Req = R1 + par(R2, R3 + R4);
        return {
          prompt: t`What is the equivalent resistance of the ladder seen by the battery? $R_1 = ${R1}\ \Omega$, $R_2 = ${R2}\ \Omega$, $R_3 = ${R3}\ \Omega$, $R_4 = ${R4}\ \Omega$.`,
          answer: Req, units: 'Ω', tol: { rel: 0.005 },
          errors: apart([{ value: R1 + R2 + R3 + R4, feedback: 'Not all in series: R₂ branches off the path.' }, { value: R1 + par(R2, R3) + R4, feedback: 'R₃ and R₄ are in series with each other on the far branch; that pair is in parallel with R₂.' }], Req),
          hints: ['Start from the end farthest from the battery.', t`$R_3$ and $R_4$ are in series: $${R3 + R4}\ \Omega$. That branch is in parallel with $R_2$.`, t`Then add $R_1$: $R = R_1 + R_2\parallel(R_3 + R_4)$.`],
          teach: 'Reduce a ladder from the far end inward: series along the rungs, parallel at each branch.',
          explain: t`$R_3 + R_4 = ${R3 + R4}\ \Omega$; in parallel with $R_2$: $\dfrac{${R2}\times${R3 + R4}}{${R2 + R3 + R4}} = ${nice(sf(par(R2, R3 + R4)))}\ \Omega$; plus $R_1$: $${nice(sf(Req))}\ \Omega$.`,
          visual: circuit('ladder', { values: { E: 12, R1, R2, R3, R4 }, caption: 'A two-section ladder: R₁ and R₃ along the top, R₂ and R₄ down to the bottom rail.' }),
        };
      },
    }),
    num({
      id: 'bridge', difficulty: 2,
      gen(r) {
        const [R1, R2, R3] = r.pick([[100, 200, 150], [120, 120, 350], [470, 330, 100], [1000, 2200, 470]]);
        const R4 = (R3 * R2) / R1;
        return {
          prompt: t`In the Wheatstone bridge, $R_1 = ${R1}\ \Omega$, $R_2 = ${R2}\ \Omega$ and $R_3 = ${R3}\ \Omega$. What must $R_4$ be for the galvanometer to read zero?`,
          answer: R4, units: 'Ω', tol: { rel: 0.005 },
          errors: apart([{ value: (R3 * R1) / R2, feedback: t`Upside down: balance needs $R_1/R_2 = R_3/R_4$ (the same ratio on each side).` }], R4),
          hints: ['Zero current through the galvanometer means its two ends are at the same potential.', t`Each side is then a simple divider; equal potentials need $R_1/R_2 = R_3/R_4$.`],
          teach: 'A Wheatstone bridge balances — no current through the meter — when the two dividers have the same ratio, R₁/R₂ = R₃/R₄.',
          explain: t`$R_4 = R_3R_2/R_1 = (${R3})(${R2})/${R1} = ${nice(sf(R4))}\ \Omega$. Balance does not depend on the battery’s voltage, which is why bridges make such precise comparisons.`,
          visual: circuit('bridge', { opts: { det: 'galv' }, values: { E: 10, R1, R2, R3, R4, Rg: 50 }, hide: ['R4'], caption: 'The bridge: two voltage dividers side by side, with a galvanometer (G) between their midpoints.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-strain', difficulty: 3, transfer: true,
      gen(r) {
        const eps = r.pick([500, 1000, 1500, 2000]), Vx = r.pick([5, 10]), GF = r.pick([2.0, 2.1]), R0 = 350;
        const Rg = R0 * (1 + GF * eps * 1e-6), V = Vx * (Rg / (R0 + Rg) - 0.5);
        return {
          prompt: t`A strut on a rocket-engine test stand carries a ${R0} Ω strain gauge (gauge factor ${GF.toFixed(1)}) as $R_4$ in a quarter bridge: the other three arms are fixed ${R0} Ω resistors, and the bridge is excited with ${Vx} V. Under load the strut stretches by ${eps} microstrain, so the gauge’s resistance rises by the fraction $\text{GF}\times\varepsilon$. What voltage appears between the bridge’s midpoints?`,
          answer: V * 1e3, units: 'mV', tol: { rel: 0.01 },
          errors: apart([{ value: Vx * GF * eps * 1e-6 * 1e3, feedback: 'That is four times too big: a quarter bridge gives about V·GF·ε/4.' }, { value: Vx * GF * eps * 1e-6 / 2 * 1e3, feedback: 'Each midpoint is a divider: the change at one midpoint is about V·ΔR/(4R).' }], V * 1e3),
          hints: [t`$R_4 = ${R0}(1 + ${GF}\times${eps}\times10^{-6})$. The left midpoint sits at exactly half the excitation.`, t`The right midpoint is at $V_x\dfrac{R_4}{R_3 + R_4}$; subtract half of $V_x$.`, t`For small strain this is about $V_x\cdot\text{GF}\cdot\varepsilon/4$.`],
          teach: 'A strain-gauge bridge turns a tiny change in resistance into a small voltage between two divider midpoints: about V·GF·ε/4 for a quarter bridge.',
          explain: t`$R_4 = ${nice(sf(Rg, 6))}\ \Omega$. Right midpoint: $${Vx}\times\dfrac{${nice(sf(Rg, 6))}}{${nice(sf(R0 + Rg, 6))}} = ${nice(sf(Vx * Rg / (R0 + Rg), 6))}$ V; left: $${Vx / 2}$ V. The difference is $${nice(sf(V * 1e3, 4))}$ mV, close to the small-strain estimate $V_x\text{GF}\varepsilon/4 = ${nice(sf(Vx * GF * eps * 1e-6 / 4 * 1e3))}$ mV — a few millivolts, which is why bridge outputs go to an instrumentation amplifier.`,
          visual: circuit('bridge', { opts: { det: 'volt' }, values: { E: Vx, R1: R0, R2: R0, R3: R0, R4: Rg }, names: { R4: 'gauge' }, hide: ['Vout', 'R4'], caption: 'The quarter bridge: three fixed resistors and the gauge (R₄), with a voltmeter between the midpoints.' }),
        };
      },
    }),
    num({
      id: 'cp-node', difficulty: 3,
      gen(r) {
        const [E1, E2] = r.pick([[12, 6], [9, 6], [24, 6], [12, 3]]);
        const [R1, R2, R3] = r.pick([[2, 4, 4], [4, 4, 2], [3, 6, 6], [6, 3, 2]]);
        const Vc = twoLoopVc(E1, E2, R1, R2, R3);
        return {
          prompt: t`For the circuit shown ($\mathcal{E}_1 = ${E1}$ V, $\mathcal{E}_2 = ${E2}$ V, $R_1 = ${R1}\ \Omega$, $R_2 = ${R2}\ \Omega$, $R_3 = ${R3}\ \Omega$), what is the voltage across $R_3$?`,
          answer: Vc, units: 'V', tol: { rel: 0.005 },
          errors: apart([{ value: E1, feedback: 'Some of the battery’s emf is dropped across R₁ on the way.' }, { value: (E1 + E2) / 2, feedback: 'The middle node is not simply halfway between the emfs; it depends on the resistors.' }], Vc),
          hints: [t`Call the top middle node’s potential $V$ (bottom = 0). Then $I_1 = (\mathcal{E}_1 - V)/R_1$, $I_2 = (\mathcal{E}_2 - V)/R_2$, $I_3 = V/R_3$.`, t`The junction rule: $I_1 + I_2 = I_3$. Solve for $V$.`],
          teach: 'Choosing the potential of a junction as the unknown turns the junction rule into one equation: nodal analysis.',
          explain: t`$\dfrac{${E1} - V}{${R1}} + \dfrac{${E2} - V}{${R2}} = \dfrac{V}{${R3}}$ gives $V = ${nice(sf(Vc, 4))}$ V. This is exactly how circuit simulators — including the one in this lesson — solve circuits: one unknown potential per node.`,
          visual: circuit('twoloop', { values: { E1, E2, R1, R2, R3 }, caption: 'The two-battery circuit; the bottom wire is at 0 V.' }),
        };
      },
    }),
    num({
      id: 'cp-feeder', difficulty: 3, transfer: true,
      gen(r) {
        const Rw = r.pick([0.1, 0.2, 0.3]), loads = r.pick([[4, 7, 14], [6, 12, 12], [5, 10, 10], [8, 8, 4]]);
        const Rp = par(...loads), V = (28 * Rp) / (Rp + Rw);
        return {
          prompt: t`A 28 V spacecraft bus feeds three payloads in parallel — ${loads[0]} Ω, ${loads[1]} Ω and ${loads[2]} Ω — through a shared feeder line of ${Rw} Ω. Treating the bus as ideal, what voltage do the payloads receive?`,
          answer: V, units: 'V', tol: { rel: 0.002 },
          errors: apart([{ value: 28, feedback: 'The whole current passes through the feeder, which drops some voltage before the payloads.' }, { value: 28 - (28 / loads[0]) * Rw, feedback: 'All three payloads’ currents share the feeder: use the total current.' }], V),
          hints: ['The three payloads are in parallel; the feeder is in series with that group.', t`$R_\text{loads} = 1/(1/${loads[0]} + 1/${loads[1]} + 1/${loads[2]})$; the bus sees $R_\text{loads} + ${Rw}$.`, t`The payload voltage is a divider: $28\times R_\text{loads}/(R_\text{loads} + ${Rw})$.`],
          teach: 'Parallel loads on a shared feeder see the bus voltage minus the feeder’s drop, which grows with the total current.',
          explain: t`$R_\text{loads} = ${nice(sf(Rp, 4))}\ \Omega$, so $I = 28/(${nice(sf(Rp, 4))} + ${Rw}) = ${nice(sf(28 / (Rp + Rw)))}$ A and $V = 28 - I(${Rw}) = ${nice(sf(V, 4))}$ V. Switching on another payload raises the total current and lowers this further — which is why power buses are regulated at the point of load.`,
          visual: circuit('parallel', { opts: { n: 3, line: true }, values: { E: 28, Rw, R1: loads[0], R2: loads[1], R3: loads[2] }, names: { Rw: 'feeder' }, caption: 'The bus, the shared feeder line and three payloads in parallel.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §10.2 Resistors in Series and Parallel and §10.3 Kirchhoff’s Rules', url: 'https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules' },
  ],
});
