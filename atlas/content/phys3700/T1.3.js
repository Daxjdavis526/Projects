// Heat, work and the first law, in Schroeder's convention ΔU = Q + W (W done
// on the system): heat and work as processes, U as a state function, đQ and
// đW as inexact differentials, and Joule's equivalence of the two.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { LOX, r4, lab, apart } from './_count.js';

const t = String.raw;
const G0 = 9.8, CW = 4184;

// Q, W (on) and ΔU as signed bars; `ask` hides one of them behind "?"
function energyBars({ Q, W, dU, ask = null, unit = 'J', caption }) {
  const vals = [['Q (heat in)', Q, 'bad'], ['W (work on)', W, 'accent'], ['ΔU', dU, 'gold']];
  const top = Math.max(...vals.map((v) => Math.abs(v[1]))) * 1.35;
  const shade = [], points = [];
  vals.forEach(([name, v, color], i) => {
    if (i !== ask) shade.push({ fn: String(r4(v)), lower: '0', from: i + 0.2, to: i + 0.8, color, alpha: 0.6 });
    points.push({ x: i + 0.5, y: r4(-top * 0.88), r: 0.01, color, label: name, labelDx: -3.1 * name.length });
    points.push({ x: i + 0.5, y: i === ask ? r4(top * 0.12) : r4(v + (v >= 0 ? 0.08 : -0.12) * top), r: 0.01, color: i === ask ? 'gold' : 'ink2', label: i === ask ? '?' : `${lab(v)} ${unit}`, labelDx: i === ask ? -3 : -3.2 * (`${lab(v)} ${unit}`.length) });
  });
  return { type: 'graph', params: { x: [0, 3], y: [r4(-top), r4(top)], aspect: 'wide', xticks: 0, yticks: 0, grid: false, xlabel: '', ylabel: '', hlines: [{ y: 0, color: 'ink3' }], shade, points, alt: 'Signed bars for heat, work and the change in energy' }, caption: caption ?? 'Energy bookkeeping with ΔU = Q + W: bars above the line put energy into the system, bars below take it out. Heights to scale.' };
}

// the PV paths of the Explore: air, rectangle A (100 kPa, 10 L) → C (250 kPa, 25 L)
const RECT = {
  states: { A: { P: 100, V: 10 }, B: { P: 100, V: 25 }, C: { P: 250, V: 25 }, D: { P: 250, V: 10 } },
  paths: [
    { from: 'A', legs: [['isobaric', 'B'], ['isochoric', 'C']], label: 'A → B → C' },
    { from: 'A', legs: [['isochoric', 'D'], ['isobaric', 'C']], label: 'A → D → C' },
    { from: 'A', legs: [['isobaric', 'B'], ['isochoric', 'C'], ['isobaric', 'D'], ['isochoric', 'A']], label: 'round the cycle' },
  ],
};
const NAIR = (100e3 * 0.01) / (8.314462618 * 300);
const rectPic = (show, caption, extra = {}) => ({ type: 'therm-pv', params: { mode: 'paths', gas: 'air', n: r4(NAIR), ...RECT, show, readouts: [], vrange: [0, 30], prange: [0, 300], isotherms: false, ...extra }, caption });

// two chambers, one full and one empty (free expansion)
const chambersPic = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 10], y: [0, 4.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['1 + 8*t', '0.6'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['1 + 8*t', '3.6'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['1', '0.6 + 3*t'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['9', '0.6 + 3*t'], t: [0, 1], color: 'ink2', width: 3 }, { param: ['5', '0.6 + 3*t'], t: [0, 1], color: 'bad', width: 2, dash: true }],
    points: [...[[1.8, 1.4], [2.6, 2.6], [3.4, 1.1], [4.2, 2.1], [2.0, 3.1], [3.7, 3.0], [4.4, 1.0], [1.6, 2.2]].map(([x, y]) => ({ x, y, r: 4, color: 'accent' })),
      { x: 3, y: 4.15, r: 0.01, color: 'accent', label: 'gas', labelDx: -10 }, { x: 7, y: 4.15, r: 0.01, color: 'ink3', label: 'vacuum', labelDx: -22 }, { x: 5, y: 0.25, r: 0.01, color: 'bad', label: 'partition (removed)', labelDx: -56 }],
  },
  caption: caption ?? 'An insulated, rigid box: gas on the left, vacuum on the right. The partition is suddenly removed. Schematic.',
});

const EX = { m: 20, h: 1.5, drops: 30, mw: 2.0 };
EX.W = EX.drops * EX.m * G0 * EX.h; EX.dT = EX.W / (EX.mw * CW);

export default lesson({
  id: 'phys3700.T1.3',
  title: 'Heat, work and the first law',
  minutes: 11, difficulty: 2,
  intro: t`Energy gets into a system in two ways. **Heat**, $Q$, is energy that flows because of a temperature difference. **Work**, $W$, is every other transfer — a piston pushed in, a paddle turned, a current driven through a resistor. Energy is conserved, so

$$\Delta U = Q + W.$$

This course follows Schroeder: $Q$ is heat *into* the system and $W$ is work done *on* it, so compression is positive work. (PHYS 2210 wrote $\Delta E_\text{int} = Q - W$ with $W$ done *by* the gas — the same physics with the opposite sign on $W$.) Crucially, a system **contains** energy $U$, but it does not contain heat or work: those describe processes, and they depend on the path taken between two states.`,
  symbols: [
    { tex: 'U', text: 'the internal energy of the system, in J: a function of its state alone (for an ideal gas, of $T$ alone)' },
    { tex: '\\Delta U', text: 'the change in $U$ during a process: final minus initial' },
    { tex: 'Q', text: 'heat into the system, in J: positive when energy flows in because the surroundings are hotter' },
    { tex: 'W', text: 'work done **on** the system, in J: positive when the surroundings push on it (compression), negative when it expands against them' },
    { tex: '\\oint', text: 'a sum around a closed cycle: $\\oint dU = 0$ for any cycle, while $\\oint đQ$ and $\\oint đW$ need not vanish (the bar marks an inexact differential)' },
  ],
  why: 'Every engine, refrigerator and turbopump is first-law bookkeeping, and the path dependence of Q and W is exactly what lets an engine turn heat into net work around a cycle.',
  visual: {
    type: 'therm-pv',
    title: 'Two paths, one ΔU — and a cycle with ΔU = 0',
    lead: t`Air goes from state A to state C by two different routes, or round the whole rectangle. **The readout $W$ is the work done *by* the gas**, so in this course’s convention the work done on it is $-W$. Red legs take heat in; blue legs give it out.`,
    tasks: [
      t`Compare A → B → C with A → D → C: $Q$ and $W$ both change, but $\Delta U$ does not.`,
      t`Choose “round the cycle”: $\Delta U = 0$, yet heat and work are not zero — they are equal and opposite in our convention.`,
      'The cycle runs counter-clockwise, so the surroundings do net work on the gas, and the gas gives out the same amount as heat.',
    ],
    params: { mode: 'paths', gas: 'air', n: r4(NAIR), ...RECT, controls: ['path'], readouts: ['Q', 'W', 'dU', 'legs'], vrange: [0, 30], prange: [0, 300], isotherms: false },
    caption: 'Air (γ = 1.4) as an ideal gas, about 0.4 mol, every leg quasi-static. Shaded: the area under the chosen path, which is the work done by the gas (negative where the gas is compressed).',
  },
  example: {
    prompt: t`Joule’s experiment: a ${EX.m} kg mass falls ${EX.h} m, turning paddles in ${EX.mw.toFixed(1)} kg of water in an insulated can; this is repeated ${EX.drops} times. By how much does the water’s temperature rise? Could a thermometer tell whether the energy came in as work or as heat?`,
    visual: energyBars({ Q: 0, W: EX.W, dU: EX.W, caption: 'The water’s energy bookkeeping: no heat (insulated can), work done on it by the paddles, all of it becoming internal energy.' }),
    steps: [
      { label: 'Work on the water', text: t`Each fall delivers $mgh = (${EX.m})(9.8)(${EX.h}) = ${fmt(EX.m * G0 * EX.h, 3)}$ J through the paddles; ${EX.drops} falls give $W = ${fmt(EX.W, 4)}$ J (ignoring friction in the pulleys).` },
      { label: 'No heat', text: t`The can is insulated and starts at room temperature: $Q = 0$. So $\Delta U = Q + W = ${fmt(EX.W, 4)}$ J.` },
      { label: 'Temperature', text: t`$\Delta T = \Delta U/(mc) = ${fmt(EX.W, 4)}/(${EX.mw}\times4184) = ${fmt(EX.dT, 3)}$ K.` },
      { label: 'Work or heat?', text: t`A burner supplying $Q = ${fmt(EX.W, 4)}$ J would leave the water in exactly the same state. The final state carries no record of *how* the energy arrived — which is why “the heat in the water” means nothing.` },
      { label: 'Sense check', text: t`A small rise: Joule needed thermometers reading hundredths of a degree to find 4.18 J per calorie.` },
    ],
    answer: t`$\Delta T \approx ${fmt(EX.dT, 3)}$ K; no — the final state is the same either way.`,
  },
  practice: [
    num({
      id: 'signs', difficulty: 1,
      gen(r) {
        const Q = r.int(4, 12) * 100, Wby = r.int(2, 9) * 100, dU = Q - Wby;
        return {
          prompt: t`A gas absorbs $${Q}$ J of heat while expanding and doing $${Wby}$ J of work on its surroundings. What is $\Delta U$?`,
          answer: dU, units: 'J', tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: Q + Wby, feedback: t`Expanding, the gas does work *on* the surroundings, so the work done on it is $W = -${Wby}$ J.` }, { value: Wby - Q, feedback: 'Heat flowing in raises U: Q is +.' }], dU),
          hints: [t`$\Delta U = Q + W$ with $W$ the work done **on** the gas.`, t`$W = -${Wby}$ J.`],
          teach: 'Work done by an expanding gas is negative work done on it.',
          explain: t`$\Delta U = Q + W = ${Q} + (-${Wby}) = ${dU}$ J.`,
          visual: energyBars({ Q, W: -Wby, dU, ask: 2 }),
        };
      },
    }),
    multi({
      id: 'classify', difficulty: 2,
      prompt: 'Which of these transfer energy to the system as **work** (rather than heat)?',
      choices: [
        'A paddle wheel stirring a liquid',
        'A piston compressing a gas',
        'A current flowing through a heater coil inside the system',
        'A flame under a pot of water',
        'A cold drink sitting in a warm room',
        'Sunlight warming a satellite panel',
      ],
      answer: [0, 1, 2],
      why: { 3: 'The flame is hotter than the pot: energy flows because of the temperature difference — heat.', 4: 'The room is warmer than the drink: heat.', 5: 'Radiation from a hotter body (the Sun’s 5800 K surface) is counted as heat.' },
      hints: ['Ask: does the energy flow only because something nearby is hotter?', 'Electrical work done on a coil inside the system is work, even though the coil then warms the system.'],
      teach: 'Heat is energy flowing because of a temperature difference; work is every other transfer.',
      explain: 'Stirring, compressing and driving a current through the system are work: none needs a temperature difference. The flame, the room and the Sun pass energy because they are hotter — heat.',
      visual: energyBars({ Q: 300, W: 500, dU: 800, caption: 'Two ways in, one account: heat and work both raise U, and the system cannot tell them apart afterwards.' }),
    }),
    multi({
      id: 'state-functions', difficulty: 2,
      prompt: 'A gas goes from state A to state C by two different paths. Which quantities are certainly the same for both paths?',
      choices: [t`$\Delta U$`, t`$\Delta T$`, t`$\Delta V$`, t`$Q$`, t`$W$`],
      answer: [0, 1, 2],
      why: { 3: 'Heat depends on the path: in the figure the two paths take in different amounts.', 4: 'Work is the area under the path, different for each.' },
      hints: ['A state function’s change depends only on the end points.', 'The work is the area under the path on a PV diagram.'],
      teach: 'U, T, P and V are state functions; Q and W belong to processes.',
      explain: t`$U$, $T$ and $V$ are properties of the state, so their changes depend only on A and C. $W$ is the area under the path, and $Q = \Delta U - W$ differs with it.`,
      visual: rectPic('all', 'Two paths from A to C for the same gas.', { shade: false }),
    }),
    num({
      id: 'cycle', difficulty: 2,
      gen(r) {
        const Wby = r.int(3, 15) * 100;
        return {
          prompt: t`Gas in an engine goes once around a cycle, doing a net $${Wby}$ J of work on the piston. What net heat flows into the gas during the cycle?`,
          answer: Wby, units: 'J', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: -Wby, feedback: t`Around a cycle $\Delta U = 0$, so $Q = -W$, and here $W$ (on the gas) is $-${Wby}$ J.` }],
          hints: [t`What is $\Delta U$ when the gas returns to its starting state?`, t`$0 = Q + W$ with $W = -${Wby}$ J.`],
          teach: t`Around any cycle $\Delta U = 0$, so the net heat in equals the net work out.`,
          explain: t`$\Delta U = 0 = Q + W$ and $W = -${Wby}$ J, so $Q = +${Wby}$ J: an engine turns net heat into net work.`,
          visual: { type: 'therm-pv', params: { mode: 'cycle', cycle: 'rect', gas: 'air', P1: 100, V1: 1, P2: 300, V2: 3, readouts: [], vrange: [0, 3.5], prange: [0, 350] }, caption: 'An engine cycle (clockwise): the gold area is the net work done by the gas per cycle. Schematic numbers on the axes.' },
        };
      },
    }),
    num({
      id: 'paddle', difficulty: 2,
      gen(r) {
        const m = r.pick([10, 15, 25]), h = r.pick([1.0, 2.0, 2.5]), n = r.pick([20, 40, 50]), mw = r.pick([1.0, 1.5, 3.0]);
        const W = n * m * G0 * h, dT = W / (mw * CW);
        return {
          prompt: t`A ${m} kg mass falls ${h.toFixed(1)} m, ${n} times, turning paddles in ${mw.toFixed(1)} kg of water in an insulated can. By how much does the water warm? ($c = 4184$ J/(kg·K), $g = 9.8$ m/s².)`,
          answer: dT, units: 'K', difference: true, tol: { rel: 0.01 },
          errors: apart([{ value: (m * G0 * h) / (mw * CW), feedback: `That is one fall. The mass falls ${n} times.` }], dT),
          hints: ['All the work done on the water becomes internal energy (Q = 0).', t`$\Delta T = \dfrac{n\,mgh}{m_w c}$.`],
          teach: 'Work done on an insulated system raises its internal energy just as heat would.',
          explain: t`$W = ${n}\times${m}\times9.8\times${h} = ${fmt(W, 4)}$ J, so $\Delta T = ${fmt(W, 4)}/(${mw}\times4184) = ${fmt(dT, 3)}$ K.`,
          visual: energyBars({ Q: 0, W, dU: W, caption: 'No heat; all the paddle work becomes internal energy of the water. Heights to scale.' }),
        };
      },
    }),
    mcq({
      id: 'convention-error', difficulty: 3, kind: 'error',
      prompt: t`A gas is compressed: 500 J of work is done on it while it gives off 200 J of heat. A student writes $\Delta U = Q - W = (-200) - (500) = -700$ J. What went wrong?`,
      choices: [
        t`They used $W$ for work done *on* the gas in the formula meant for work done *by* it; $\Delta U = -200 + 500 = +300$ J`,
        'Nothing: compression lowers the internal energy',
        'The heat should be +200 J, since it is released',
        t`$\Delta U$ cannot be found without the temperature`,
      ],
      answer: 0,
      why: { 1: 'Compression puts energy in; the gas got warmer unless more heat left than work entered.', 2: 'Heat leaving the system is negative Q.', 3: 'The first law needs only Q and W.' },
      hints: ['Write down which convention each symbol uses before adding.', t`In $\Delta U = Q + W$, $W$ is the work done on the gas: $+500$ J.`],
      teach: 'Pick one sign convention and use it for every symbol: ΔU = Q + W (on), or ΔU = Q − W (by).',
      explain: t`With $W$ on the gas, $\Delta U = Q + W = -200 + 500 = +300$ J. The student mixed conventions: $Q - W$ needs $W$ done *by* the gas, which is $-500$ J — and that also gives $+300$ J.`,
      visual: energyBars({ Q: -200, W: 500, dU: 300, ask: 2, caption: 'Heat out (below the line), work on the gas (above). What must ΔU be?' }),
    }),
    mcq({
      id: 'free-expansion', difficulty: 2,
      prompt: 'An ideal gas fills the left half of a rigid, insulated box; the right half is empty. The partition is removed and the gas fills the box. What happens to its temperature?',
      choices: ['Nothing: Q = 0 and W = 0, so ΔU = 0 and T is unchanged', 'It falls, because the gas expands', 'It rises, because the molecules speed up into the vacuum', 'It falls, because the pressure halves'],
      answer: 0,
      why: { 1: 'Expansion cools a gas only when it pushes something — here there is nothing to push.', 2: 'No force acts to speed them up; their energy is unchanged.', 3: 'The pressure does halve, but because the volume doubled, not because T changed.' },
      hints: ['Is there anything for the expanding gas to push on?', 'For an ideal gas, U depends on T alone.'],
      teach: 'Free expansion: no heat, no work, no change in U — and for an ideal gas, no change in T.',
      explain: t`The box is insulated ($Q = 0$) and rigid, and the gas pushes against nothing ($W = 0$). So $\Delta U = 0$; for an ideal gas $U$ depends on $T$ only, so $T$ is unchanged. (Lesson T2.5 shows the entropy does change.)`,
      visual: chambersPic(),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turbopump', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([15, 20, 25]), eta = r.pick([0.7, 0.75, 0.8]), mdot = r.pick([350, 400, 450]);
        const dT = ((1 - eta) * P * 1e6) / (mdot * LOX.c);
        return {
          prompt: t`A turbopump puts $${P}$ MW of shaft work into liquid oxygen flowing at $${mdot}$ kg/s. It is ${Math.round(eta * 100)}% efficient: the rest of the work ends up as internal energy of the LOX. By how much does the LOX warm across the pump? (Take $c = ${LOX.c}$ J/(kg·K).)`,
          answer: dT, units: 'K', difference: true, tol: { rel: 0.01 },
          errors: apart([{ value: (P * 1e6) / (mdot * LOX.c), feedback: 'Only the lost fraction, 1 − η, heats the LOX; the rest raises its pressure.' }, { value: (eta * P * 1e6) / (mdot * LOX.c), feedback: 'You used the useful fraction. The losses are 1 − η.' }], dT),
          hints: [t`Per second: $(1-\eta)P$ joules become internal energy of $\dot m$ kilograms.`, t`$\Delta T = \dfrac{(1-\eta)P}{\dot m c}$.`],
          teach: 'Work dissipated in a fluid raises its internal energy exactly as heat would.',
          explain: t`$\Delta T = \dfrac{(${fmt(1 - eta, 2)})(${P}\times10^{6})}{(${mdot})(${LOX.c})} = ${fmt(dT, 3)}$ K — enough to matter, because warmer LOX is closer to boiling and the pump inlet must avoid cavitation.`,
          visual: energyBars({ Q: 0, W: (1 - eta) * P, dU: (1 - eta) * P, unit: 'MW', caption: 'Per second, for the LOX passing through: the dissipated part of the shaft work becomes internal energy (the useful part, raising the pressure, is left out). A simplification: real pumps also lose energy to bearings, seals and recirculated flow.' }),
        };
      },
    }),
    mcq({
      id: 'cp-contains', difficulty: 2,
      prompt: 'Which statement is correct?',
      choices: [
        'A hot brick contains more internal energy than the same brick cold; it does not contain “heat”',
        'A hot brick contains more heat than the same brick cold',
        'Heat and temperature are two names for the same quantity',
        'Work done on a system is stored as work inside it',
      ],
      answer: 0,
      why: { 1: 'Heat is energy in transit, defined by a process; once it arrives it is just internal energy.', 2: 'Temperature is a property of a state; heat is a transfer. A bathtub at 40 °C holds far more energy than a match flame.', 3: 'Once inside, work is indistinguishable from any other internal energy.' },
      hints: ['Which quantities describe a state, and which a process?', 'Q and W are names for energy crossing a boundary.'],
      teach: 'Systems contain internal energy; heat and work are energy on the move.',
      explain: 'U is a property of the brick’s state; heat and work are ways energy crosses the boundary, and once inside they are simply U.',
      visual: energyBars({ Q: 400, W: 0, dU: 400, caption: 'Heating a brick: heat crosses the boundary, internal energy goes up. Afterwards only ΔU remains.' }),
    }),
    num({
      id: 'cp-compressor', difficulty: 2,
      gen(r) {
        const W = r.int(5, 12) * 100, Qout = r.int(1, 4) * 100, dU = W - Qout;
        return {
          prompt: t`A compressor does $${W}$ J of work on a gas, which loses $${Qout}$ J of heat through the cylinder walls. What is the change in the gas’s internal energy?`,
          answer: dU, units: 'J', tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: W + Qout, feedback: 'Heat leaving the gas is negative Q.' }, { value: -dU, feedback: 'Work done on the gas raises its energy: W is +.' }], dU),
          hints: [t`$Q = -${Qout}$ J and $W = +${W}$ J.`],
          teach: 'ΔU = Q + W with each term signed by the direction energy flows.',
          explain: t`$\Delta U = -${Qout} + ${W} = ${dU}$ J.`,
          visual: energyBars({ Q: -Qout, W, dU, ask: 2 }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §1.4', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Loverude, Kautz & Heron, Student understanding of the first law of thermodynamics, Am. J. Phys. 70, 137 (2002)', url: 'https://doi.org/10.1119/1.1417532' },
  ],
});
