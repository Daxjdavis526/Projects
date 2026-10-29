// The first law: ΔE_int = Q − W. Internal energy is a property of the state;
// heat and work are energy in transit and depend on the path.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, TD, molesOf, pvPic, one, ledger, freeBoxPic } from './_pv.js';

const t = String.raw;
const HE = 5 / 3, AIR = 1.4;
// internal-energy change of an ideal gas between two states given as kPa and L: (C_V/R) Δ(PV), in J
const dUof = (g, PA, VA, PB, VB) => (PB * VB - PA * VA) / (g - 1);

// the Explore: helium from A (300 kPa, 1 L, 300 K) to B (100 kPa, 4 L, 400 K) by three paths
const N0 = molesOf(300, 1, 300);
const ROUTES = {
  states: { A: { P: 300, V: 1 }, B: { P: 100, V: 4 }, C: { P: 300, V: 4 }, D: { P: 100, V: 1 } },
  paths: [
    { from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']], label: 'A → C → B' },
    { from: 'A', legs: [['isochoric', 'D'], ['isobaric', 'B']], label: 'A → D → B' },
    { from: 'A', legs: [['line', 'B']], label: 'straight A → B' },
  ],
};

// the worked example: air round A → B (straight) → C (constant pressure) → A (constant volume)
const EX = { A: [300, 1], B: [200, 3], C: [200, 1] };
EX.W1 = Math.round(0.5 * (EX.A[0] + EX.B[0]) * (EX.B[1] - EX.A[1]));    // 500 J (these are whole joules by design)
EX.dU = Math.round(dUof(AIR, ...EX.A, ...EX.B));                         // 750 J
EX.Q1 = EX.dU + EX.W1;                                                   // 1250 J
EX.W2 = Math.round(EX.B[0] * (EX.C[1] - EX.B[1]));                       // −400 J
EX.Q2 = -EX.dU + EX.W2;                                                  // −1150 J
EX.QBC = Math.round((AIR / (AIR - 1)) * EX.B[0] * (EX.C[1] - EX.B[1])); // −1400 J: B → C at constant pressure
EX.QCA = Math.round(dUof(AIR, ...EX.C, ...EX.A));                        // +250 J: C → A at constant volume

export default lesson({
  id: 'phys2210.M18.2',
  title: 'The first law',
  minutes: 10, difficulty: 2,
  intro: t`A gas holds energy in the random motion of its molecules: its **internal energy**. It can gain or lose energy in only two ways — **heat** $Q$, flowing in because something hotter touches it, and **work** $W$, done when it pushes its surroundings back. Energy is conserved, so the change in internal energy is what comes in as heat minus what goes out as work:

$$\Delta E_\text{int} = Q - W$$

That is the **first law of thermodynamics**. Internal energy is a property of the gas's *state*; heat and work are not — they are energy *in transit*, and both depend on the path. Their difference does not. Over a complete cycle the gas returns to its state, so $\Delta E_\text{int} = 0$ and **net heat in equals net work out**: the bookkeeping behind every engine.`,
  symbols: [
    { tex: '\\Delta E_\\text{int}', text: 'the change in the gas’s internal energy, in joules (J) — the energy of its molecules’ random motion. It depends only on the state; for an ideal gas only on the temperature: $E_\\text{int} = \\tfrac32 nRT$ for a monatomic gas such as helium, $\\tfrac52 nRT$ for air near room temperature (lesson M17.4). Many books write $U$' },
    { tex: 'Q', text: 'the heat flowing **into** the gas, in J: positive when heat flows in, negative when it flows out. Heat is energy crossing the boundary because of a temperature difference; a gas does not *contain* heat' },
    { tex: 'W', text: 'the work done **by** the gas, in J, as in M18.1: positive when it expands. (Chemists and some engineers write $\\Delta E = Q + W$ with $W$ the work done *on* the gas: same physics, opposite sign for $W$)' },
  ],
  why: 'Every engine, refrigerator and rocket motor in the rest of this module is an exercise in this bookkeeping: heat in, work out, and nothing left behind in a gas that goes round a cycle.',
  visual: {
    type: 'therm-pv',
    title: 'Three paths, one change in internal energy',
    lead: t`Helium goes from state A (300 kPa, 1 L, 300 K) to state B (100 kPa, 4 L, 400 K). Pick a path. The readouts give the heat $Q$ into the gas, the work $W$ it does and $\Delta E_\text{int}$, path by path and leg by leg. Red legs take heat in; blue legs give it out.`,
    tasks: [
      t`Switch between the three paths: $W$ and $Q$ change every time, yet $\Delta E_\text{int}$ stays at +150 J.`,
      'A → C → B takes in 2250 J along A → C and gives out 1200 J along C → B: heat flows both ways on one path, and only the net 1050 J enters the first law.',
      t`Watch $W$: it is still just the area under each path, as in M18.1 — 900 J, 300 J and 600 J.`,
    ],
    params: { mode: 'paths', gas: 'He', n: N0, ...ROUTES, controls: ['path'], readouts: ['Q', 'W', 'dU', 'legs'], vrange: [0, 5], prange: [0, 400], isotherms: [300, 400] },
    caption: 'Helium as an ideal gas, every path quasi-static. Shaded: the work done by the gas, the area under the chosen path. Dashed: the isotherms of A (300 K) and B (400 K). The legs are coloured by the sign of the heat; a straight leg can take heat in on part of its length and give some out on the rest — the colour shows the net.',
  },
  example: {
    prompt: t`Air in a cylinder goes from state A to state B along the straight path in the figure, taking in ${EX.Q1} J of heat while doing ${EX.W1} J of work. It then returns to A along B → C → A, during which ${-EX.W2} J of work is done **on** it. (a) What is $\Delta E_\text{int}$ from A to B? (b) How much heat flows on the way back, and which way? (c) Check the whole cycle.`,
    visual: pvPic({ gas: 'air', n: molesOf(300, 1, 300), heat: true, legend: true, states: { A: { P: EX.A[0], V: EX.A[1] }, B: { P: EX.B[0], V: EX.B[1] }, C: { P: EX.C[0], V: EX.C[1] } }, paths: one('A', ['line', 'B'], ['isobaric', 'C'], ['isochoric', 'A']), vrange: [0, 4], prange: [0, 400], caption: 'The cycle A → B → C → A. Red legs take heat in, blue legs give it out; the gold area inside is the net work per cycle.' }),
    steps: [
      { label: 'First law, A to B', text: t`$\Delta E_\text{int} = Q - W = ${EX.Q1}\ \text{J} - ${EX.W1}\ \text{J} = +${EX.dU}$ J. The gas took in more energy as heat than it gave out as work, so its internal energy — and its temperature — rose.` },
      { label: 'A property of the state', text: t`Going back from B to A, $\Delta E_\text{int} = -${EX.dU}$ J, **whatever the path**, because internal energy depends only on the state the gas is in.` },
      { label: 'First law, B to A', text: t`Work done on the gas means $W = -${-EX.W2}$ J. So $Q = \Delta E_\text{int} + W = -${EX.dU} + (-${-EX.W2}) = ${EX.Q2}$ J: ${-EX.Q2} J of heat flows **out**. (On B → C ${-EX.QBC} J leaves and on C → A ${EX.QCA} J comes back in; the first law only needs the total.)` },
      { label: 'Check the cycle', text: t`Net heat in: $${EX.Q1} - ${-EX.Q2} = ${EX.Q1 + EX.Q2}$ J. Net work out: $${EX.W1} - ${-EX.W2} = ${EX.W1 + EX.W2}$ J. Equal, as they must be when $\Delta E_\text{int} = 0$ — and ${EX.W1 + EX.W2} J is the triangle’s area, $\tfrac12(2\ \text{L})(100\ \text{kPa})$.` },
    ],
    answer: t`(a) $\Delta E_\text{int} = +${EX.dU}$ J; (b) ${-EX.Q2} J of heat flows out; (c) over the cycle, net heat in = net work out = ${EX.W1 + EX.W2} J.`,
  },
  practice: [
    num({
      id: 'first-law', difficulty: 1,
      gen(r) {
        const Q = r.pick([800, 1000, 1200, 1500]), W = r.pick([250, 400, 600, 1800]);
        return {
          prompt: t`A gas takes in ${Q} J of heat and does ${W} J of work on a piston. What is the change in its internal energy?`,
          answer: Q - W, units: 'J', tol: { rel: 0.005, abs: 0.5 },
          errors: [{ value: Q + W, feedback: t`The work is done *by* the gas: energy leaves it. $\Delta E_\text{int} = Q - W$.` }],
          hints: [t`$\Delta E_\text{int} = Q - W$, with $Q$ positive for heat in and $W$ positive for work done by the gas.`],
          teach: 'Internal energy rises by the heat that comes in and falls by the work the gas does.',
          explain: t`$\Delta E_\text{int} = ${Q} - ${W} = ${Q - W}$ J.${W > Q ? ' The gas did more work than the heat it received, so it paid the difference out of its own internal energy and cooled.' : ''}`,
          visual: ledger({ Q, W, dU: Q - W, ask: 'dU' }),
        };
      },
    }),
    mcq({
      id: 'signs', difficulty: 2,
      prompt: 'A gas is compressed: the piston does 500 J of work on it while it gives 200 J of heat to its surroundings. The change in its internal energy is:',
      visual: ledger({ Q: -200, W: -500, dU: 300, ask: 'dU', caption: 'Work done on the gas counts as negative W; heat leaving it counts as negative Q.' }),
      choices: ['+300 J', '−700 J', '+700 J', '−300 J'],
      answer: 0,
      why: {
        1: t`That treats both as losses. Work done *on* the gas brings energy in: $W = -500$ J, and $-W = +500$ J.`,
        2: t`The 200 J of heat *left* the gas: $Q = -200$ J, not $+200$ J.`,
        3: 'Both signs are reversed. Energy comes in as work (500 J) and goes out as heat (200 J); more comes in than leaves.',
      },
      hints: [t`Write $Q$ and $W$ with signs first: heat out means $Q < 0$; work done on the gas means $W < 0$.`, t`$\Delta E_\text{int} = Q - W = (-200) - (-500)$.`],
      teach: 'Get the signs first: heat into the gas is positive, work done by the gas is positive — so work done on the gas is negative.',
      explain: t`$Q = -200$ J and $W = -500$ J, so $\Delta E_\text{int} = -200 - (-500) = +300$ J. The gas gains 500 J as work and loses 200 J as heat: it warms up.`,
    }),
    multi({
      id: 'state-functions', difficulty: 2,
      prompt: 'Which of these are properties of the **state** of a gas — fixed once you know its state, however it got there? Select all that apply.',
      visual: pvPic({ gas: 'He', n: N0, states: { ...ROUTES.states }, paths: ROUTES.paths.slice(0, 2), show: 'all', shade: false, vrange: [0, 5], prange: [0, 400], caption: 'Two different paths between the same two states A and B.' }),
      choices: [t`its internal energy $E_\text{int}$`, t`its temperature $T$`, t`its pressure $P$`, t`the heat $Q$ it has taken in`, t`the work $W$ it has done`, t`its volume $V$`],
      answer: [0, 1, 2, 5],
      why: {
        3: 'Heat depends on the path: going A → C → B takes in 1050 J, A → D → B only 450 J. A gas does not contain heat.',
        4: 'Work is the area under the path, different for every path between A and B.',
      },
      hints: ['Imagine the gas sitting in state B. Which of these could you measure on it, with no record of its history?'],
      teach: 'Pressure, volume, temperature and internal energy are properties of the state; heat and work are energy in transit and belong to the process.',
      explain: t`$P$, $V$, $T$ and $E_\text{int}$ have one value in each state. $Q$ and $W$ describe what happened on the way, and differ between paths — only their difference, $\Delta E_\text{int}$, does not.`,
    }),
    num({
      id: 'path-two', difficulty: 2,
      gen(r) {
        const PA = r.pick([300, 400]), PB = r.pick([100, 150]), VA = r.pick([1, 2]), VB = VA + r.pick([2, 3]);
        // whole joules: every PV here is a multiple of 50 J, so ΔE_int is a multiple of 75 J
        const dU = Math.round(dUof(HE, PA, VA, PB, VB)), W1 = PA * (VB - VA), W2 = PB * (VB - VA), Q1 = dU + W1, Q2 = dU + W2;
        return {
          prompt: t`Helium goes from A to B along path 1 (A → C → B), taking in ${Q1} J of heat and doing ${W1} J of work. Along path 2 (A → D → B) it does ${W2} J of work. How much heat does it take in along path 2?`,
          answer: Q2, units: 'J', tol: { rel: 0.005, abs: 0.5 },
          errors: [{ value: Q1, feedback: t`Heat depends on the path. What is the same on both paths is $\Delta E_\text{int} = Q - W$.` }, { value: dU, feedback: t`That is $\Delta E_\text{int}$. Now add the work done along path 2: $Q_2 = \Delta E_\text{int} + W_2$.` }],
          hints: [t`Find $\Delta E_\text{int}$ from path 1: $Q_1 - W_1$.`, t`Path 2 has the same $\Delta E_\text{int}$, so $Q_2 = \Delta E_\text{int} + W_2$.`],
          teach: t`Use one path to find $\Delta E_\text{int}$, which every path between the same states shares, then apply the first law along the other.`,
          explain: t`$\Delta E_\text{int} = ${Q1} - ${W1} = ${dU}$ J on either path. Along path 2, $Q_2 = ${dU} + ${W2} = ${Q2}$ J${Q2 < 0 ? ' — negative: along path 2 the gas gives out heat overall' : Q2 === 0 ? ' — zero: along path 2 the heat the gas gives out at constant volume exactly balances the heat it takes in at constant pressure' : ''}.`,
          visual: pvPic({ gas: 'He', n: 0.1, states: { A: { P: PA, V: VA }, B: { P: PB, V: VB }, C: { P: PA, V: VB }, D: { P: PB, V: VA } }, paths: [{ from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']] }, { from: 'A', legs: [['isochoric', 'D'], ['isobaric', 'B']] }], show: 'all', shade: false, vrange: [0, VB + 1], prange: [0, PA * 1.3], caption: 'Path 1: A → C → B. Path 2: A → D → B.' }),
        };
      },
    }),
    num({
      id: 'cycle-work', difficulty: 2,
      gen(r) {
        const V1 = r.pick([1, 2]), V2 = V1 + r.pick([2, 3]), P1 = r.pick([100, 150]), P2 = P1 + r.pick([100, 200, 300]);
        const n = molesOf(P1, V1, 300), c = TD.rect({ V1: V1 * 1e-3, V2: V2 * 1e-3, P1: P1 * 1e3, P2: P2 * 1e3, n });
        const A = TD.analyse(TD.cycleLegs(c, n, HE), n, HE);
        return {
          prompt: t`Helium goes once round the cycle shown. It takes in ${fmt(A.Qin, 4)} J of heat on the red legs and gives out ${fmt(A.Qout, 4)} J on the blue ones. How much net work does it do?`,
          answer: A.W, units: 'J', tol: { rel: 0.005, abs: 0.5 },
          errors: [{ value: A.Qin, feedback: 'Not all the heat taken in becomes work: some leaves on the blue legs.' }, { value: A.Qin + A.Qout, feedback: 'The heat given out is lost, not gained: subtract it.' }],
          hints: [t`Over a full cycle the gas returns to its state, so $\Delta E_\text{int} = 0$.`, t`Then $Q_\text{net} = W_\text{net}$, with $Q_\text{net} = Q_\text{in} - Q_\text{out}$.`],
          teach: t`Round a cycle $\Delta E_\text{int} = 0$, so the net work equals the net heat taken in.`,
          explain: t`$W_\text{net} = Q_\text{in} - Q_\text{out} = ${fmt(A.Qin, 4)} - ${fmt(A.Qout, 4)} = ${fmt(A.W, 4)}$ J — and that is the gold rectangle: $(${P2 - P1}\ \text{kPa})(${V2 - V1}\ \text{L})$.`,
          visual: pvPic({ gas: 'He', n, heat: true, legend: true, states: { A: { P: P1, V: V1 }, B: { P: P2, V: V1 }, C: { P: P2, V: V2 }, D: { P: P1, V: V2 } }, paths: one('A', ['isochoric', 'B'], ['isobaric', 'C'], ['isochoric', 'D'], ['isobaric', 'A']), areaLabel: 'W_{net} = ?', vrange: [0, V2 + 1], prange: [0, P2 * 1.3], caption: 'A rectangular cycle. Red legs take heat in, blue legs give it out; gold: the area enclosed.' }),
        };
      },
    }),
    mcq({
      id: 'free-expansion', difficulty: 2,
      prompt: 'An insulated box is divided by a partition: an ideal gas fills one half, the other half is empty. The partition is pulled out and the gas fills the whole box. Once it settles, its temperature is:',
      visual: freeBoxPic(),
      choices: ['The same as before', 'Lower: expanding gases cool', 'Higher: the molecules spread out and speed up', 'Half what it was, since the volume doubled'],
      answer: 0,
      why: {
        1: t`A gas cools when it expands *against a piston*, doing work (lesson M18.4). Here it pushes on nothing: $W = 0$.`,
        2: 'Nothing pushes the molecules faster: no heat comes in and no work is done on them.',
        3: t`$PV = nRT$ alone cannot tell you: both $P$ and $V$ change. The first law can: $Q = 0$, $W = 0$, so $\Delta E_\text{int} = 0$.`,
      },
      hints: ['Insulated walls: what is Q?', 'The gas rushes into a vacuum — what does it push against? So what is W?'],
      teach: t`In a free expansion $Q = 0$ and $W = 0$, so $\Delta E_\text{int} = 0$ — and for an ideal gas, an unchanged internal energy means an unchanged temperature.`,
      explain: t`$Q = 0$ (insulated) and $W = 0$ (nothing is pushed back), so $\Delta E_\text{int} = 0$. An ideal gas's internal energy depends only on $T$, so $T$ is unchanged; the pressure halves because the volume doubled. (Real gases cool or warm very slightly, because their molecules attract or repel.)`,
    }),
    num({
      id: 'ideal-dU', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2, 3]), T1 = r.pick([250, 300]), dT = r.pick([50, 100, 150, -80]), T2 = T1 + dT;
        const dU = 1.5 * n * R * dT;
        const VA = 25 * n, VB = VA * 1.6;                       // L
        const PA = (n * R * T1) / VA, PB = (n * R * T2) / VB;   // kPa
        return {
          prompt: t`${n} mol of helium is taken from ${T1} K to ${T2} K. It could go by either path in the figure, or any other. What is the change in its internal energy? (For a monatomic ideal gas, $E_\text{int} = \tfrac32 nRT$.)`,
          answer: dU, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: 2.5 * n * R * dT, feedback: t`That is $nC_P\Delta T$, the heat at constant *pressure*. $\Delta E_\text{int} = \tfrac32 nR\Delta T$ for any process.` }, { value: n * R * dT, feedback: t`That is $nR\Delta T$; the internal energy of a monatomic gas carries a factor $\tfrac32$.` }],
          hints: ['Internal energy depends only on the state — for an ideal gas, only on the temperature.', t`$\Delta E_\text{int} = \tfrac32 nR\,\Delta T$, whatever the path.`],
          teach: t`An ideal gas’s internal energy depends only on its temperature, so $\Delta E_\text{int} = \tfrac32 nR\Delta T$ for helium by any process.`,
          explain: t`$\Delta E_\text{int} = \tfrac32(${n})(8.314)(${dT}) = ${fmt(dU, 4)}$ J, the same for both paths — though the heat and work along them differ.`,
          visual: pvPic({ gas: 'He', n, isotherms: [T1, T2], isoLabels: true, states: { A: { P: PA, V: VA }, B: { P: PB, V: VB }, C: { P: PA, V: VB } }, paths: [{ from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']] }, { from: 'A', legs: [['line', 'B']] }], show: 'all', shade: false, vrange: [0, VB * 1.35], prange: [0, Math.max(PA, PB) * 1.5], caption: 'Two paths from A on one isotherm to B on another. The dashed curves are the isotherms.' }),
        };
      },
    }),
    mcq({
      id: 'cycle-error', difficulty: 3, kind: 'error',
      prompt: t`A student analyses one cycle of a gas: “It takes in 800 J of heat and gives out 600 J. It ends in exactly the state it started in, so nothing about it has changed — it has done no net work.” What is wrong?`,
      visual: pvPic({ gas: 'He', n: 0.1, heat: true, legend: true, states: { A: { P: 100, V: 1 }, B: { P: 200, V: 1 }, C: { P: 200, V: 3 }, D: { P: 100, V: 3 } }, paths: one('A', ['isochoric', 'B'], ['isobaric', 'C'], ['isochoric', 'D'], ['isobaric', 'A']), vrange: [0, 4], prange: [0, 260], caption: 'A cycle: red legs take heat in, blue legs give it out.' }),
      choices: [
        t`Returning to its state makes $\Delta E_\text{int} = 0$, not $W = 0$: the net work equals the net heat, 200 J`,
        'The gas cannot give out heat during a cycle that takes heat in',
        t`$\Delta E_\text{int}$ is not zero over a cycle, because heat was added`,
        'The net work is 1400 J, the total heat exchanged',
      ],
      answer: 0,
      why: {
        1: 'Every heat engine does exactly that: it takes heat in on some legs and gives heat out on others.',
        2: t`Internal energy is a property of the state; back in the same state, $\Delta E_\text{int} = 0$ exactly.`,
        3: 'Heat given out is energy leaving the gas: it subtracts, it does not add.',
      },
      hints: ['Which quantities return to their starting values when the gas returns to its state? Is work one of them?', t`Apply $\Delta E_\text{int} = Q - W$ to the whole cycle.`],
      teach: 'Over a cycle only the state functions return to their start; the net heat and the net work are equal, not zero.',
      explain: t`$\Delta E_\text{int} = 0$ over the cycle, so $W_\text{net} = Q_\text{net} = 800 - 600 = 200$ J — the area enclosed by the loop. Work and heat are not properties of the state, so nothing forces them back to zero.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-diesel', difficulty: 3, transfer: true,
      gen(r) {
        const Won = r.pick([280, 300, 320]), Qout = r.pick([20, 25, 30]), n = 0.024;
        const dT = (Won - Qout) / (n * 2.5 * R);
        return {
          prompt: t`In a diesel engine's compression stroke the piston does ${Won} J of work on the ${n} mol of air in the cylinder, while ${Qout} J of heat leaks out into the cylinder walls. By how much does the air's temperature rise? (Air: $E_\text{int} = \tfrac52 nRT$.)`,
          answer: dT, units: 'K', difference: true, tol: { rel: 0.01 },
          errors: [{ value: Won / (n * 2.5 * R), feedback: t`Some energy leaks out as heat: $\Delta E_\text{int} = Q - W$ with $Q$ negative.` }, { value: (Won + Qout) / (n * 2.5 * R), feedback: 'The heat leaves the air, so it subtracts from the work done on it.' }, { value: (Won - Qout) / (n * 1.5 * R), feedback: t`Air is diatomic: $E_\text{int} = \tfrac52 nRT$, not $\tfrac32 nRT$.` }],
          hints: [t`$Q = -${Qout}$ J and $W = -${Won}$ J (work done on the air).`, t`$\Delta E_\text{int} = Q - W = ${Won - Qout}$ J, and $\Delta E_\text{int} = \tfrac52 nR\,\Delta T$.`],
          teach: 'Work done on a gas raises its internal energy, minus whatever leaks away as heat; for an ideal gas that sets the temperature rise.',
          explain: t`$\Delta E_\text{int} = -${Qout} - (-${Won}) = ${Won - Qout}$ J, so $\Delta T = \dfrac{${Won - Qout}}{\tfrac52(${n})(8.314)} = ${fmt(dT, 3)}$ K. From about 300 K at intake, the air reaches roughly ${Math.round(300 + dT)} K — hot enough to ignite the diesel fuel sprayed into it, with no spark plug.`,
          visual: ledger({ Q: -Qout, W: -Won, dU: Won - Qout, ask: 'dU', caption: 'The compression stroke’s energy bookkeeping. Work done on the air is negative W; heat leaking out is negative Q.' }),
        };
      },
    }),
    num({
      id: 'cp-heat-out', difficulty: 2,
      gen(r) {
        const V1 = r.pick([1, 2]), V2 = V1 + r.pick([1, 2, 3]), P1 = r.pick([100, 200]), P2 = P1 + r.pick([100, 200]);
        const n = molesOf(P1, V1, 300), c = TD.rect({ V1: V1 * 1e-3, V2: V2 * 1e-3, P1: P1 * 1e3, P2: P2 * 1e3, n });
        const A = TD.analyse(TD.cycleLegs(c, n, AIR), n, AIR);
        return {
          prompt: t`Air goes once round the rectangular cycle shown — corners at ${V1}.0 L and ${V2}.0 L, ${P1} kPa and ${P2} kPa — taking in ${fmt(A.Qin, 4)} J of heat on the red legs. How much heat does it give out on the blue legs?`,
          answer: A.Qout, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: A.Qin, feedback: 'If it gave out all the heat it took in, it would do no net work — but the loop encloses an area.' }, { value: A.Qin + A.W, feedback: t`Net heat in equals net work: $Q_\text{in} - Q_\text{out} = W$, so subtract.` }],
          hints: [t`Net work = enclosed area = $(P_2 - P_1)(V_2 - V_1)$.`, t`Over a cycle $Q_\text{in} - Q_\text{out} = W_\text{net}$.`],
          teach: 'Round a cycle the heat given out is the heat taken in minus the net work done.',
          explain: t`$W_\text{net} = (${P2 - P1}\ \text{kPa})(${V2 - V1}\ \text{L}) = ${fmt(A.W, 4)}$ J, so $Q_\text{out} = ${fmt(A.Qin, 4)} - ${fmt(A.W, 4)} = ${fmt(A.Qout, 4)}$ J.`,
          visual: pvPic({ gas: 'air', n, heat: true, legend: true, states: { A: { P: P1, V: V1 }, B: { P: P2, V: V1 }, C: { P: P2, V: V2 }, D: { P: P1, V: V2 } }, paths: one('A', ['isochoric', 'B'], ['isobaric', 'C'], ['isochoric', 'D'], ['isobaric', 'A']), vrange: [0, V2 + 1], prange: [0, P2 * 1.3], caption: 'Red legs take heat in, blue legs give it out; gold: the area enclosed.' }),
        };
      },
    }),
    mcq({
      id: 'cp-same', difficulty: 2,
      prompt: 'A gas goes from state A to state B, once along the straight path and once along A → C → B. Which quantity must be the same for both trips?',
      visual: pvPic({ gas: 'air', n: 0.12, states: { A: { P: 300, V: 1 }, B: { P: 100, V: 4 }, C: { P: 300, V: 4 } }, paths: [{ from: 'A', legs: [['line', 'B']] }, { from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']] }], show: 'all', shade: false, vrange: [0, 5], prange: [0, 400], caption: 'Two paths between the same two states.' }),
      choices: [t`$\Delta E_\text{int}$`, t`$Q$`, t`$W$`, t`$Q + W$`],
      answer: 0,
      why: {
        1: 'The heat depends on the path: more work along A → C → B needs more heat in.',
        2: 'The work is the area under each path; the two areas differ.',
        3: t`$Q + W$ is not path-independent; it is $Q - W$ that equals $\Delta E_\text{int}$.`,
      },
      hints: ['Which of these is a change in a property of the state?'],
      teach: t`Only $\Delta E_\text{int} = Q - W$ is fixed by the end states; $Q$ and $W$ separately depend on the path.`,
      explain: t`$\Delta E_\text{int}$ depends only on A and B. $W$ is the area under the path (here 600 J straight, 900 J via C), and $Q = \Delta E_\text{int} + W$ changes with it.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §3.3 First Law of Thermodynamics', url: 'https://openstax.org/books/university-physics-volume-2/pages/3-3-first-law-of-thermodynamics' },
    { label: 'Loverude, Kautz & Heron, “Student understanding of the first law of thermodynamics”, Am. J. Phys. 70, 137 (2002)', url: 'https://doi.org/10.1119/1.1417532' },
  ],
});
