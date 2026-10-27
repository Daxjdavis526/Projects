// Refrigerators and heat pumps: heat engines run backwards. K_R = Q_c/W,
// K_P = Q_h/W = K_R + 1; the Clausius statement; why a heat pump creates no energy.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { TD, pvPic, one, flowPic } from './_pv.js';

const t = String.raw;
const AIR = 1.4;
const NKG = 1000 / 28.965;                 // moles in one kilogram of air

// the worked example: a heat pump warming a house
const EX = { Qh: 12, KP: 3.2 };
EX.W = EX.Qh / EX.KP;                      // 3.75 kW
EX.Qc = EX.Qh - EX.W;                      // 8.25 kW

/** An air-cycle machine (a Brayton cycle run as a refrigerator), as states for a picture, and its K_R. */
function airCycle(rp, T1, T3) {
  const c = TD.brayton({ T1, P1: 100e3, rp, T3, n: NKG, g: AIR });
  const [s1, s2, s3, s4] = c.states;
  const KR = (T1 - s4.T) / (s2.T - T1 - (T3 - s4.T));
  return { s1, s2, s3, s4, KR, pic: (caption) => pvPic({ gas: 'air', n: NKG, vunit: 'm3', heat: true, legend: true,
    states: { 1: { P: 100, T: T1 }, 2: { P: 100 * rp, T: s2.T }, 3: { P: 100 * rp, T: T3 }, 4: { P: 100, T: s4.T } },
    paths: one('1', ['adiabatic', '2'], ['isobaric', '3'], ['adiabatic', '4'], ['isobaric', '1']), prange: [0, 100 * rp * 1.3], caption }) };
}

export default lesson({
  id: 'phys2210.M19.2',
  title: 'Refrigerators and heat pumps',
  minutes: 10, difficulty: 2,
  intro: t`Run a heat engine backwards and it becomes a **refrigerator**: work $W$ goes in, heat $Q_c$ is pumped out of a cold space, and both are dumped as $Q_h = Q_c + W$ into a warmer one. Heat never flows from cold to hot *by itself* — that is the **Clausius statement** of the second law — but with work put in, it can be pumped uphill. What a refrigerator is for is $Q_c$, so its **coefficient of performance** is

$$K_R = \frac{Q_c}{W}$$

A **heat pump** is the same machine used for heating: what we want is $Q_h$, so $K_P = Q_h/W = K_R + 1$. These are not efficiencies, and they are usually larger than 1. A heat pump with $K_P = 3$ delivers 3 J of heat for each joule of electricity — not by creating energy, but by moving 2 J in from the cold outdoors.`,
  symbols: [
    { tex: 'K_R', text: 'the refrigerator’s coefficient of performance (COP): joules of heat removed from the cold space per joule of work. A kitchen fridge manages about 2 to 3' },
    { tex: 'Q_c', text: 'the heat taken from the cold side per cycle, in J (a magnitude, like all heats and works in this module)' },
    { tex: 'W', text: 'the work put in per cycle, in J — usually by an electric motor driving a compressor' },
    { tex: 'Q_h', text: 'the heat delivered to the hot side per cycle, $Q_h = Q_c + W$, in J' },
    { tex: 'K_P', text: 'the heat pump’s coefficient of performance, $Q_h/W = K_R + 1$: joules of heat delivered per joule of work, about 3 to 4 for a modern air-source heat pump in mild weather' },
  ],
  why: 'Refrigerators keep food, vaccines and cryogenic propellants cold, and heat pumps are replacing furnaces — and the second law, next lesson, sets the best either can ever do.',
  visual: {
    type: 'therm-pv',
    title: 'An airliner’s air-cycle refrigerator',
    lead: t`Airliners cool their cabins with air alone, in an **air-cycle machine**: a gas turbine run backwards. One kilogram of air is compressed (1 → 2), cooled by outside air at high pressure (2 → 3), expanded through a turbine, which chills it (3 → 4), and then soaks up heat from the cabin (4 → 1). The loop runs **anticlockwise**: work goes in.`,
    tasks: [
      t`Read $T_4$: at $r_p = 3$ the turbine delivers air near 234 K (about −39 °C), from a machine whose warmest surroundings are at 320 K.`,
      t`Raise the pressure ratio: the air leaves the turbine colder, but $K_R$ falls — each joule of cooling costs more work.`,
      t`Check the bookkeeping: $Q_h = Q_c + W$ every time. The heat dumped outside includes all the work you put in.`,
    ],
    params: {
      mode: 'cycle', cycle: 'brayton', gas: 'air', n: NKG, vunit: 'm3', P1: 100, T1: 300, rp: 3, T3: 320, controls: ['rp', 'T3'],
      ranges: { rp: [2, 5, 0.1], T3: [300, 330, 2] },
      sliderText: { rp: { explain: 'Compressor outlet pressure over inlet pressure. A higher ratio chills the air more but costs more work.' }, T3: { label: 'Heat-exchanger outlet $T_3$', explain: 'The compressed air is cooled by outside air to this temperature before the turbine.' } },
      readouts: ['Qc', 'Qh', 'Wnet', 'COP', 'T4'], isotherms: false, vrange: [0, 1], prange: [0, 600],
    },
    caption: 'One kilogram of air as an ideal gas going round the reverse Brayton cycle quasi-statically; cabin air returns at 300 K. Real aircraft packs run open — engine bleed air is cooled, expanded through a turbine and blown into the cabin, then leaves through outflow valves — and their compressors and turbines are not perfectly adiabatic, so their COPs are lower.',
  },
  example: {
    prompt: t`On a mild winter day (5 °C outside) a house needs ${EX.Qh} kW of heat to stay at 20 °C. Its heat pump has $K_P = ${EX.KP}$. (a) How much electrical power does it draw? (b) How much heat does it take from the outdoor air? (c) How does that compare with electric resistance heating?`,
    visual: flowPic({ device: 'pump', Qh: EX.Qh, Qc: EX.Qc, W: EX.W, labels: { Qh: `Q_h = ${EX.Qh} kW`, Qc: 'Q_c = ?', W: 'W = ?', hot: 'the house, 20 °C', cold: 'outdoor air, 5 °C' }, caption: 'The heat pump’s energy flows per second, widths to scale.' }),
    steps: [
      { label: 'Work in', text: t`$K_P = Q_h/W$, so $W = Q_h/K_P = ${EX.Qh}/${EX.KP} = ${fmt(EX.W, 3)}$ kW of electricity.` },
      { label: 'Heat from outside', text: t`Energy is conserved: $Q_c = Q_h - W = ${EX.Qh} - ${fmt(EX.W, 3)} = ${fmt(EX.Qc, 3)}$ kW, pumped out of 5 °C air into a 20 °C house. Cold air still holds plenty of internal energy; the heat pump moves some of it uphill.` },
      { label: 'Compare', text: t`A resistance heater turns electricity into heat one for one: it would need the full ${EX.Qh} kW. The heat pump needs ${fmt(EX.W, 3)} kW — about a third.` },
      { label: 'Sense check', text: t`Nothing is created: ${fmt(EX.W, 3)} kW in as work plus ${fmt(EX.Qc, 3)} kW in as heat equals ${EX.Qh} kW out. $K_P > 1$ is ordinary, because most of what is delivered was never paid for — it was moved, not made.` },
    ],
    answer: t`(a) ${fmt(EX.W, 3)} kW; (b) ${fmt(EX.Qc, 3)} kW from the outdoor air; (c) resistance heating would draw ${EX.Qh} kW, about ${fmt(EX.KP, 2)} times as much.`,
  },
  practice: [
    num({
      id: 'cop', difficulty: 1,
      gen(r) {
        const Qc = r.pick([300, 450, 600, 900]), W = r.pick([100, 150, 200, 250]);
        return {
          prompt: t`Each cycle, a refrigerator removes ${Qc} J of heat from its interior using ${W} J of work. What is its coefficient of performance $K_R$?`,
          answer: Qc / W, tol: { rel: 0.005 },
          errors: [{ value: W / Qc, feedback: t`Upside down: $K_R$ is the heat removed per joule of work, $Q_c/W$.` }, { value: (Qc + W) / W, feedback: t`That is $Q_h/W = K_P$, the heat-pump figure. A refrigerator is judged by the heat it removes, $Q_c$.` }],
          hints: [t`$K_R = Q_c/W$.`],
          teach: 'A refrigerator’s COP is the heat it removes from the cold space per joule of work put in.',
          explain: t`$K_R = Q_c/W = ${Qc}/${W} = ${fmt(Qc / W, 3)}$. Each joule of work moves ${fmt(Qc / W, 3)} J of heat out of the cold box — and ${fmt((Qc + W) / W, 3)} J into the kitchen.`,
          visual: flowPic({ device: 'fridge', Qh: Qc + W, Qc, W, labels: { Qh: 'Q_h', Qc: `Q_c = ${Qc} J`, W: `W = ${W} J`, hot: 'the kitchen', cold: 'inside the fridge' } }),
        };
      },
    }),
    num({
      id: 'heat-dumped', difficulty: 1,
      gen(r) {
        const KR = r.pick([2, 2.5, 3]), W = r.pick([100, 120, 150]);
        return {
          prompt: t`A freezer with $K_R = ${KR}$ draws ${W} W of electrical power. At what rate does it dump heat into the kitchen?`,
          answer: W * (KR + 1), units: 'W', tol: { rel: 0.005 },
          errors: [{ value: W * KR, feedback: t`That is $Q_c$, the heat taken out of the freezer. The kitchen gets that **plus** the work: $Q_h = Q_c + W$.` }, { value: W, feedback: 'The kitchen receives the heat pumped out of the freezer as well as the electrical energy.' }],
          hints: [t`$Q_c = K_RW$.`, t`$Q_h = Q_c + W$.`],
          teach: t`A refrigerator dumps more heat into the room than it removes from inside: $Q_h = Q_c + W$.`,
          explain: t`$Q_c = ${KR}\times${W} = ${KR * W}$ W is pumped out of the freezer, and $Q_h = ${KR * W} + ${W} = ${W * (KR + 1)}$ W comes out of the coils at the back.`,
          visual: flowPic({ device: 'fridge', Qh: W * (KR + 1), Qc: W * KR, W, labels: { Qh: 'Q_h = ?', Qc: 'Q_c', W: `W = ${W} W`, hot: 'the kitchen', cold: 'inside the freezer' }, caption: 'Power flows per second, widths to scale.' }),
        };
      },
    }),
    mcq({
      id: 'open-door', difficulty: 2,
      prompt: 'On a hot day, someone leaves the refrigerator door open, hoping to cool the closed kitchen. Over an hour the kitchen becomes:',
      visual: flowPic({ device: 'fridge', Qh: 400, Qc: 300, W: 100, labels: { Qh: 'Q_h', Qc: 'Q_c', W: 'W (electricity)', hot: 'the kitchen (behind the fridge)', cold: 'the kitchen (in front of the open door)' }, caption: 'With the door open, the fridge’s cold side and hot side are the same room.' }),
      choices: ['Warmer', 'Cooler', 'Unchanged', 'Cooler at first, then unchanged'],
      answer: 0,
      why: {
        1: t`The cold air pouring out is matched by heat pumped out of the back — plus the work. The room loses $Q_c$ and gains $Q_c + W$.`,
        2: 'All the electrical energy the motor uses ends up as heat in the room, so the room cannot stay the same.',
        3: 'The air near the door feels cool, but the whole room gains energy from the very start.',
      },
      hints: ['Both the cold side and the hot side are now the same room. What is the net heat into the room per cycle?'],
      teach: 'A refrigerator moving heat around a single room heats the room by the work it uses.',
      explain: t`The room loses $Q_c$ through the open door and gains $Q_h = Q_c + W$ at the back, a net gain of $W$ each cycle: the fridge becomes an electric heater of power equal to its motor's. To cool a room you must dump the heat *outside* — which is what an air conditioner does.`,
    }),
    mcq({
      id: 'where-from', difficulty: 2,
      prompt: 'A heat pump delivers 4 kJ of heat to a house for every 1 kJ of electrical energy it uses. Where do the other 3 kJ come from?',
      visual: flowPic({ device: 'pump', Qh: 4, Qc: 3, W: 1, labels: { Qh: 'Q_h = 4 kJ', Qc: 'Q_c = ?', W: 'W = 1 kJ', hot: 'the house', cold: 'outdoor air' } }),
      choices: [
        'They are heat taken from the cold outdoor air and pumped into the house',
        'The heat pump creates them: a COP above 1 means it makes energy',
        'Friction in the compressor turns into heat',
        'Nowhere: a COP of 4 breaks the conservation of energy, so the claim is false',
      ],
      answer: 0,
      why: {
        1: 'No machine creates energy. A COP above 1 only means most of the heat delivered was moved, not made.',
        2: 'Friction can only turn work into heat; it could never give back more than the 1 kJ put in.',
        3: t`Energy is conserved: $Q_h = Q_c + W$, with $Q_c = 3$ kJ from outside. A COP is not an efficiency and can exceed 1.`,
      },
      hints: [t`$Q_h = Q_c + W$. What is $Q_c$, and where does it come from?`],
      teach: 'A heat pump moves heat rather than making it: the heat delivered is the work plus the heat drawn from the cold outdoors.',
      explain: t`$Q_c = Q_h - W = 3$ kJ is drawn from the outdoor air, which, even at 0 °C, holds a great deal of internal energy. The work's job is to move that heat uphill against the second law's grain.`,
    }),
    num({
      id: 'kp-from-kr', difficulty: 2,
      gen(r) {
        const KR = r.pick([1.8, 2.4, 3.0, 3.6]);
        return {
          prompt: t`A refrigerator has $K_R = ${KR}$. The same machine, going through exactly the same cycle, is used as a heat pump to warm the space it dumps heat into. What is its $K_P$?`,
          answer: KR + 1, tol: { rel: 0.005 },
          errors: [{ value: KR, feedback: t`Same cycle, but now we value $Q_h$, which is larger than $Q_c$ by the work.` }, { value: 1 / KR, feedback: t`$K_P$ is $Q_h/W$, not the inverse of $K_R$.` }],
          hints: [t`$K_P = \dfrac{Q_h}{W} = \dfrac{Q_c + W}{W}$.`],
          teach: t`For the same cycle $K_P = K_R + 1$, because the heat delivered includes the work.`,
          explain: t`$K_P = \dfrac{Q_c + W}{W} = K_R + 1 = ${fmt(KR + 1, 2)}$.`,
          visual: flowPic({ device: 'pump', Qh: KR + 1, Qc: KR, W: 1, labels: { Qh: 'Q_h', Qc: `Q_c = ${KR} × W`, W: 'W', hot: 'the warm side', cold: 'the cold side' }, caption: t`The same cycle, per joule of work: $Q_c = K_RW$, and $Q_h = Q_c + W$.` }),
        };
      },
    }),
    num({
      id: 'cost', difficulty: 2,
      gen(r) {
        const Q = r.pick([40, 50, 60, 80]), KP = r.pick([2.5, 3, 3.5, 4]);
        return {
          prompt: t`A house needs ${Q} kWh of heat on a winter day. How much electrical energy does a heat pump with $K_P = ${KP}$ use to supply it? (Resistance heating would use all ${Q} kWh.)`,
          answer: Q / KP, units: 'kWh', tol: { rel: 0.005 },
          errors: [{ value: Q * KP, feedback: t`$K_P$ is heat delivered per unit of work, so the work is the heat *divided* by $K_P$.` }, { value: Q / (KP - 1), feedback: t`That divides by $K_R = K_P - 1$; for heating use $K_P$.` }],
          hints: [t`$W = Q_h/K_P$.`],
          teach: t`A heat pump needs only $Q_h/K_P$ of electrical energy to deliver $Q_h$ of heat.`,
          explain: t`$W = ${Q}/${KP} = ${fmt(Q / KP, 3)}$ kWh — ${Math.round(100 / KP)} % of what resistance heating would use. The rest, ${fmt(Q - Q / KP, 3)} kWh, is heat pulled in from outside.`,
          visual: flowPic({ device: 'pump', Qh: Q, Qc: Q - Q / KP, W: Q / KP, labels: { Qh: `Q_h = ${Q} kWh`, Qc: 'from outdoors', W: 'W = ?', hot: 'the house', cold: 'outdoor air' }, caption: 'A day’s energy flows, widths to scale.' }),
        };
      },
    }),
    mcq({
      id: 'clausius', difficulty: 2,
      prompt: 'Which of these is the Clausius statement of the second law of thermodynamics?',
      visual: flowPic({ device: 'fridge', Qh: 400, Qc: 300, W: 100, labels: { Qh: 'Q_h = 400 J', Qc: 'Q_c = 300 J', W: 'W = 100 J', hot: 'warm room', cold: 'cold interior' }, caption: 'An ordinary refrigerator, for reference.' }),
      choices: [
        'Heat cannot flow from a colder body to a hotter one with no other effect',
        'Heat can never flow from a colder body to a hotter one',
        'A refrigerator must use more work than the heat it removes',
        'Heat always flows from the body with more internal energy to the one with less',
      ],
      answer: 0,
      why: {
        1: 'Refrigerators do move heat from cold to hot every day — but only with work put in. The “no other effect” is the whole point.',
        2: t`A refrigerator with $K_R = 3$ removes three times its work in heat. Nothing forbids that.`,
        3: 'Heat flows from higher *temperature* to lower. An iceberg holds far more internal energy than a cup of hot tea, yet heat flows from the tea into the ice.',
      },
      hints: ['Refrigerators exist. So the statement cannot forbid all heat flow from cold to hot — only some of it.'],
      teach: 'The Clausius statement forbids heat flowing from cold to hot on its own; with work put in, a refrigerator can do it.',
      explain: 'Clausius: no process can have as its sole result the transfer of heat from a colder body to a hotter one. A refrigerator does transfer heat from cold to hot, but not as the sole result: work is used up. The Clausius and Kelvin–Planck statements turn out to be equivalent — a device that broke one could be used to break the other.',
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A freezer removes 450 J from its interior for every 150 J of electrical work. A student writes: “Its coefficient of performance is $W/Q_c = 150/450 = 0.33$, so it wastes two-thirds of the energy it uses.” What is wrong?`,
      visual: flowPic({ device: 'fridge', Qh: 600, Qc: 450, W: 150, labels: { Qh: 'Q_h', Qc: 'Q_c = 450 J', W: 'W = 150 J', hot: 'the kitchen', cold: 'inside the freezer' } }),
      choices: [
        t`The COP is $Q_c/W = 3.0$: the freezer moves three joules of heat per joule of work, and wastes nothing it was meant to move`,
        t`The COP should be $Q_h/W = 4.0$ for a freezer`,
        'A freezer’s COP must be below 1, so 0.33 is right but it wastes nothing',
        t`It should be $W/Q_h = 0.25$`,
      ],
      answer: 0,
      why: {
        1: t`$Q_h/W$ is the heat-pump figure $K_P$. A freezer is judged by what it takes out of the cold space, $Q_c$.`,
        2: 'Refrigerators routinely have COPs above 1; a COP is not an efficiency.',
        3: 'That inverts the heat-pump figure, and still treats the COP as an efficiency.',
      },
      hints: ['What does a freezer exist to do? Put that on top of the fraction.', t`$K_R = Q_c/W$.`],
      teach: t`A refrigerator’s COP is heat removed per work in, $Q_c/W$, and it is usually larger than 1.`,
      explain: t`$K_R = Q_c/W = 450/150 = 3.0$. The student inverted it and then read it as an efficiency. Nothing is “wasted”: the 150 J of work and the 450 J of heat both leave through the coils into the kitchen, as they must.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-air-cycle', difficulty: 3, transfer: true,
      gen(r) {
        const rp = r.pick([2.5, 3, 4]), T1 = 300, T3 = r.pick([310, 320]);
        const C = airCycle(rp, T1, T3);
        // the temperatures as printed, and the answer from exactly those
        const T2 = +fmt(C.s2.T, 4), T4 = +fmt(C.s4.T, 4), KR = (T1 - T4) / (T2 - T3 - (T1 - T4));
        return {
          prompt: t`In an airliner's air-cycle machine (modelled as a closed cycle of air at constant $c_P$), air at ${T1} K is compressed to ${T2} K, cooled at constant pressure to ${T3} K by outside air, expanded through a turbine to ${T4} K, and then warmed back to ${T1} K by the cabin, at constant pressure. Find its coefficient of performance $K_R$.`,
          answer: KR, tol: { rel: 0.01 },
          errors: [{ value: (T2 - T3) / (T2 - T3 - (T1 - T4)), feedback: t`That is $Q_h/W = K_P$. Cooling the cabin is the point: use $Q_c$, the heat absorbed from ${T4} K to ${T1} K.` }, { value: (T1 - T4) / (T2 - T1), feedback: 'The turbine gives back some work: the net work is the compressor’s work minus the turbine’s.' }],
          hints: [t`Heat taken from the cabin: $Q_c = nc_P(T_1 - T_4)$. Heat dumped outside: $Q_h = nc_P(T_2 - T_3)$.`, t`$W = Q_h - Q_c$, so $K_R = \dfrac{T_1 - T_4}{(T_2 - T_3) - (T_1 - T_4)}$; $nc_P$ cancels.`],
          teach: t`For any refrigerator $K_R = Q_c/W$, with the work the difference between the heat dumped and the heat absorbed.`,
          explain: t`$Q_c \propto ${T1} - ${T4} = ${fmt(T1 - T4, 3)}$ K and $Q_h \propto ${T2} - ${T3} = ${fmt(T2 - T3, 3)}$ K, so $K_R = \dfrac{${fmt(T1 - T4, 3)}}{${fmt(T2 - T3, 3)} - ${fmt(T1 - T4, 3)}} = ${fmt(KR, 3)}$. Air is a poor refrigerant next to the vapours in a kitchen fridge, but it is light, free, and already on board — and the turbine's cold air goes straight into the cabin.`,
          visual: C.pic('The air-cycle machine’s loop for one kilogram of air: compress (1 → 2), cool (2 → 3), expand (3 → 4), absorb heat from the cabin (4 → 1). It runs anticlockwise: work goes in.'),
        };
      },
    }),
    num({
      id: 'cp-cryocooler', difficulty: 2, transfer: true,
      gen(r) {
        const Qc = r.pick([4, 5, 6, 8]), KR = r.pick([0.01, 0.012, 0.015]);
        return {
          prompt: t`To stop liquid hydrogen boiling away on a long space mission, a cryocooler removes the ${Qc} W of heat that leaks into the tank at 20 K. Its coefficient of performance is $K_R = ${KR}$. How much electrical power does it need?`,
          answer: Qc / KR, units: 'W', tol: { rel: 0.005 },
          errors: [{ value: Qc * KR, feedback: t`$K_R = Q_c/W$, so $W = Q_c/K_R$: divide, do not multiply.` }],
          hints: [t`$W = Q_c/K_R$.`],
          teach: 'Cooling at very low temperature has a tiny COP, so each watt removed costs many watts of work.',
          explain: t`$W = Q_c/K_R = ${Qc}/${KR} = ${fmt(Qc / KR, 3)}$ W — about ${Math.round(1 / KR)} W of electricity for every watt of heat removed — and the spacecraft's radiators must then shed $Q_c + W = ${fmt(Qc + Qc / KR, 3)}$ W. Next lesson shows that even a perfect refrigerator working between 20 K and room temperature needs about 14 W per watt.`,
          visual: flowPic({ device: 'fridge', Qh: Qc + Qc / KR, Qc, W: Qc / KR, labels: { Qh: 'Q_h to the radiator', Qc: `Q_c = ${Qc} W`, W: 'W = ?', hot: 'spacecraft radiator, about 280 K', cold: 'liquid hydrogen, 20 K', device: 'cryocooler' }, caption: 'Power flows per second, widths to scale: the work dwarfs the heat removed.' }),
        };
      },
    }),
    num({
      id: 'cp-pump', difficulty: 2,
      gen(r) {
        const W = r.pick([2, 2.5, 3]), KP = r.pick([2.8, 3.2, 3.6]);
        return {
          prompt: t`A heat pump with $K_P = ${KP}$ draws ${W} kW of electricity. How much heat per second does it take from the outdoor air?`,
          answer: W * (KP - 1), units: 'kW', tol: { rel: 0.005 },
          errors: [{ value: W * KP, feedback: t`That is $Q_h$, the heat delivered indoors. The outdoor air supplies $Q_h - W$.` }],
          hints: [t`$Q_h = K_PW$, and $Q_c = Q_h - W$.`],
          teach: t`The heat drawn from outdoors is the heat delivered minus the work: $Q_c = (K_P - 1)W$.`,
          explain: t`$Q_h = ${KP}\times${W} = ${fmt(KP * W, 3)}$ kW indoors, of which $Q_c = ${fmt(KP * W, 3)} - ${W} = ${fmt(W * (KP - 1), 3)}$ kW came from outside.`,
          visual: flowPic({ device: 'pump', Qh: W * KP, Qc: W * (KP - 1), W, labels: { Qh: 'Q_h', Qc: 'Q_c = ?', W: `W = ${W} kW`, hot: 'the house', cold: 'outdoor air' } }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §4.3 Refrigerators and Heat Pumps', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-3-refrigerators-and-heat-pumps' },
    { label: 'OpenStax University Physics Vol. 2, §4.4 Statements of the Second Law of Thermodynamics', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-4-statements-of-the-second-law-of-thermodynamics' },
  ],
});
