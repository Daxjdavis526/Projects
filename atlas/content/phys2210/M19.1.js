// Heat engines: heat in from a hot reservoir, work out, heat rejected to a cold
// one; e = W/Q_h = 1 − Q_c/Q_h; the Kelvin–Planck statement of the second law.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { TD, molesOf, pvPic, one, flowPic } from './_pv.js';

const t = String.raw;
const HE = 5 / 3;

// the worked example: one cylinder of a four-stroke petrol engine
const EX = { Qh: 1400, W: 420, rpm: 3000, cyl: 4 };
EX.e = EX.W / EX.Qh;                          // 0.30
EX.Qc = EX.Qh - EX.W;                         // 980 J
EX.rate = (EX.rpm / 60 / 2) * EX.cyl;         // 100 power strokes per second
EX.P = EX.W * EX.rate;                        // 42 kW
EX.Pc = EX.Qc * EX.rate;                      // 98 kW

// the Explore: helium round a rectangle from A (100 kPa, 1 L, 300 K)
const N0 = molesOf(100, 1, 300);

export default lesson({
  id: 'phys2210.M19.1',
  title: 'Heat engines',
  minutes: 10, difficulty: 2,
  intro: t`A **heat engine** turns heat into work again and again by taking a working substance round a cycle. Each cycle it takes heat $Q_h$ from something hot, turns part of it into work $W$, and gives the rest, $Q_c$, to something colder. The substance ends each cycle where it began, so $\Delta E_\text{int} = 0$ and $W = Q_h - Q_c$. Its **thermal efficiency** is

$$e = \frac{W}{Q_h} = 1 - \frac{Q_c}{Q_h}$$

The **second law of thermodynamics**, in Kelvin and Planck's form, says $Q_c$ can never be zero: **no engine working in a cycle turns heat entirely into work.** That is not a matter of friction or poor design; a perfectly frictionless engine must still reject heat. Real engines: a car's petrol engine at best about 35–40 % (much less in town), a large ship's diesel about 50 %, a combined-cycle power station about 60 %.`,
  symbols: [
    { tex: 'e', text: 'the thermal efficiency: the fraction of the heat taken in that comes out as work, a pure number between 0 and 1 (often written as a percentage)' },
    { tex: 'W', text: 'the net work the engine does per cycle, in joules (J): $W = Q_h - Q_c$' },
    { tex: 'Q_h', text: 'the heat taken in per cycle from the hot side — burning fuel, a reactor, a radioactive source — in J. In this module $Q_h$ and $Q_c$ are both **magnitudes**, always positive, and the arrows say which way they go' },
    { tex: 'Q_c', text: 'the heat given out per cycle to the cold side — the exhaust, a river, a radiator, the air — in J' },
  ],
  why: 'Every power station, car, jet and spacecraft power source is a heat engine, and the second law sets a ceiling on all of them — the subject of the next three lessons.',
  visual: {
    type: 'therm-pv',
    title: 'Heat in, work out, heat out',
    lead: t`Helium goes round a rectangular cycle, clockwise: heat flows in on the red legs and out on the blue ones, and the gold area inside is the net work. Stretch the rectangle with the sliders and watch the efficiency.`,
    tasks: [
      t`Make the rectangle as large as you can: $W$ and $Q_h$ both grow, but $e$ stays below 30 %.`,
      t`Look at the blue legs: whatever you do, heat leaves the gas there. $Q_c$ is never zero.`,
      t`Read the leg-by-leg table: the two red legs supply $Q_h$, and $Q_h - Q_c$ always equals the gold area $W$.`,
    ],
    params: {
      mode: 'cycle', cycle: 'rect', gas: 'He', n: N0, V1: 1, P1: 100, V2: 3, P2: 300, controls: ['V2', 'P2'],
      ranges: { V2: [1.5, 5, 0.1], P2: [150, 500, 10] }, readouts: ['Qh', 'Qc', 'Wnet', 'e', 'legs'], isotherms: false, vrange: [0, 6], prange: [0, 600],
    },
    caption: 'Helium as an ideal gas going round quasi-statically. Red legs take heat in, blue legs give it out; the gold area is the net work per cycle. A rectangle is a teaching cycle, not a real engine’s — but every real engine obeys the same bookkeeping.',
  },
  example: {
    prompt: t`Each cycle, one cylinder of a petrol engine takes in ${fmt(EX.Qh / 1000, 3)} kJ of heat from burning fuel and does ${fmt(EX.W / 1000, 2)} kJ of net work. (a) What is its efficiency? (b) How much heat leaves per cycle in the exhaust and the cooling water? (c) The engine has ${EX.cyl} cylinders, runs at ${EX.rpm} rpm, and each cylinder fires once every two revolutions. What is its power, and how fast does it shed heat?`,
    visual: flowPic({ Qh: EX.Qh, Qc: EX.Qc, W: EX.W, labels: { Qh: 'Q_h = 1.40 kJ', Qc: 'Q_c = ?', W: 'W = 0.42 kJ', hot: 'burning fuel–air mixture', cold: 'exhaust and cooling water' }, caption: 'One cylinder’s cycle as an energy-flow diagram, widths to scale. A petrol engine has no separate hot reservoir — the fuel burns inside the working gas — but the bookkeeping is the same.' }),
    steps: [
      { label: 'Efficiency', text: t`$e = \dfrac{W}{Q_h} = \dfrac{0.42\ \text{kJ}}{1.40\ \text{kJ}} = ${fmt(EX.e, 2)}$, or ${Math.round(EX.e * 100)} %.` },
      { label: 'Heat rejected', text: t`Over a cycle $\Delta E_\text{int} = 0$, so $Q_c = Q_h - W = 1.40 - 0.42 = ${fmt(EX.Qc / 1000, 2)}$ kJ per cycle — more than twice the work.` },
      { label: 'Cycles per second', text: t`${EX.rpm} rpm is ${EX.rpm / 60} revolutions per second; each cylinder fires every second revolution, ${EX.rpm / 120} times a second; four cylinders make ${EX.rate} power strokes per second.` },
      { label: 'Power', text: t`$P = (${EX.W}\ \text{J})(${EX.rate}\ \text{s}^{-1}) = ${EX.P / 1000}$ kW of work, while $(${EX.Qc}\ \text{J})(${EX.rate}\ \text{s}^{-1}) = ${EX.Pc / 1000}$ kW of heat goes out of the exhaust and the radiator.` },
      { label: 'Sense check', text: t`${EX.P / 1000} kW is about ${Math.round(EX.P / 745.7)} horsepower, ordinary for a small car at moderate revs. And the radiator really does have to dump more power than the wheels get — which is why it is so big.` },
    ],
    answer: t`(a) $e = ${fmt(EX.e, 2)}$; (b) ${fmt(EX.Qc / 1000, 2)} kJ per cycle; (c) ${EX.P / 1000} kW of work, ${EX.Pc / 1000} kW of heat rejected.`,
  },
  practice: [
    num({
      id: 'efficiency', difficulty: 1,
      gen(r) {
        const Qh = r.pick([800, 1000, 1500, 2000, 2500]), W = Math.round(Qh * r.pick([0.2, 0.25, 0.3, 0.35, 0.4])), e = W / Qh;
        return {
          prompt: t`An engine takes in ${Qh} J of heat each cycle and does ${W} J of net work. What is its efficiency? (Give a decimal.)`,
          answer: e, tol: { rel: 0.005 },
          errors: [{ value: W / (Qh - W), feedback: t`Efficiency compares the work with the heat taken *in*, $Q_h$, not with the heat rejected.` }, { value: 1 - e, feedback: t`That is $Q_c/Q_h$, the share wasted. Efficiency is the share turned into work.` }],
          hints: [t`$e = W/Q_h$.`],
          teach: 'Efficiency is the fraction of the heat taken in that comes out as work.',
          explain: t`$e = W/Q_h = ${W}/${Qh} = ${fmt(e, 2)}$, or ${Math.round(e * 100)} %. The other ${Qh - W} J leaves as heat.`,
          visual: flowPic({ Qh, Qc: Qh - W, W, labels: { Qh: `Q_h = ${Qh} J`, Qc: 'Q_c', W: `W = ${W} J` } }),
        };
      },
    }),
    num({
      id: 'heat-out', difficulty: 1,
      gen(r) {
        const Qh = r.pick([1200, 2000, 3000, 5000]), e = r.pick([0.25, 0.3, 0.35, 0.4]);
        const Qc = Qh * (1 - e);
        return {
          prompt: t`An engine with an efficiency of ${Math.round(e * 100)} % takes in ${Qh} J of heat per cycle. How much heat does it give out per cycle?`,
          answer: Qc, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: Qh * e, feedback: t`That is the work, $eQ_h$. The heat given out is what is left: $Q_c = Q_h - W$.` }],
          hints: [t`$W = eQ_h$, and $Q_c = Q_h - W$.`],
          teach: t`What an engine does not turn into work, it must give out as heat: $Q_c = (1 - e)Q_h$.`,
          explain: t`$W = ${e}\times${Qh} = ${fmt(Qh * e, 4)}$ J, so $Q_c = ${Qh} - ${fmt(Qh * e, 4)} = ${fmt(Qc, 4)}$ J.`,
          visual: flowPic({ Qh, Qc, W: Qh * e, labels: { Qh: `Q_h = ${Qh} J`, Qc: 'Q_c = ?', W: `e = ${Math.round(e * 100)} %` } }),
        };
      },
    }),
    mcq({
      id: 'perfect', difficulty: 2,
      prompt: 'An inventor claims that because his engine has perfect bearings and no friction at all, it will turn all of the heat from its fuel into work, cycle after cycle. Is that possible?',
      visual: flowPic({ Qh: 1000, Qc: 0, W: 1000, labels: { Qh: 'Q_h = 1000 J', Qc: 'Q_c = 0 ?', W: 'W = 1000 J ?', hot: 'burning fuel', cold: 'surroundings' }, caption: 'The inventor’s claim: every joule of heat becomes work, and nothing goes to the cold side.' }),
      choices: [
        'No: the second law requires every cyclic engine to reject some heat, friction or not',
        'Yes, if friction really is zero',
        'Yes, if the fuel burns hot enough',
        'No, but only because real bearings always have some friction',
      ],
      answer: 0,
      why: {
        1: 'Friction wastes some work, but removing it does not remove the heat an engine must reject. That limit comes from the second law, not from engineering.',
        2: 'A hotter source raises the possible efficiency (lesson M19.3) but never to 100 %.',
        3: 'Even with no friction at all, a cyclic engine must reject heat. Friction only makes things worse.',
      },
      hints: ['Does the Kelvin–Planck statement mention friction?'],
      teach: 'The second law caps every cyclic engine below 100 % efficiency, even with no friction at all.',
      explain: t`The Kelvin–Planck statement of the second law: no device working in a cycle can take heat from a source and turn it all into work. Some heat, $Q_c > 0$, must go to a colder body. The next lessons find how much at the very least.`,
    }),
    num({
      id: 'power-plant', difficulty: 2,
      gen(r) {
        const P = r.pick([500, 800, 1000, 1200]), e = r.pick([0.33, 0.36, 0.4]);
        const Pc = P * (1 / e - 1);
        return {
          prompt: t`A power station delivers ${P} MW of electrical power at an overall efficiency of ${Math.round(e * 100)} %. At what rate does it reject heat to its cooling water?`,
          answer: Pc, units: 'MW', tol: { rel: 0.01 },
          errors: [{ value: P / e, feedback: 'That is the rate heat comes in. Subtract the useful power to find what is rejected.' }, { value: P * (1 - e), feedback: t`The efficiency compares with the heat *in*, not with the output: heat in $= P/e$.` }],
          hints: [t`Heat in per second $= P/e$.`, t`Heat out per second $= P/e - P$.`],
          teach: 'Rates obey the same bookkeeping as energies per cycle: heat in = power out + heat rejected.',
          explain: t`Heat in: $${P}/${e} = ${fmt(P / e, 4)}$ MW. Rejected: $${fmt(P / e, 4)} - ${P} = ${fmt(Pc, 4)}$ MW — about twice the electrical output, carried away by a river or a cooling tower.`,
          visual: flowPic({ Qh: P / e, Qc: Pc, W: P, labels: { Qh: 'heat in', Qc: 'heat out = ?', W: `${P} MW electric`, hot: 'boiler or reactor', cold: 'cooling water' }, caption: 'Power flows per second, widths to scale.' }),
        };
      },
    }),
    num({
      id: 'fuel-rate', difficulty: 2,
      gen(r) {
        const P = r.pick([40, 60, 80]), e = r.pick([0.25, 0.3]), L = 44;   // kW, MJ/kg
        const mdot = (P * 1000) / e / (L * 1e6) * 1000;                    // g/s
        return {
          prompt: t`A car engine delivers ${P} kW at an efficiency of ${Math.round(e * 100)} %. Its petrol releases 44 MJ of heat per kilogram burned. How many grams of fuel does it burn per second?`,
          answer: mdot, units: 'g/s', tol: { rel: 0.01 },
          errors: [{ value: ((P * 1000) / (L * 1e6)) * 1000, feedback: 'The fuel must supply the heat input, P/e, not just the work output.' }],
          hints: [t`The heat input rate is $P/e$.`, t`Fuel rate = (heat input rate)/(44 MJ/kg).`],
          teach: 'An engine’s fuel supplies its heat input, which is its power divided by its efficiency.',
          explain: t`Heat input $= ${P}/${e} = ${fmt(P / e, 3)}$ kW; fuel $= ${fmt((P * 1000) / e, 3)}\ \text{W} / (44\times10^{6}\ \text{J/kg}) = ${fmt(mdot, 3)}$ g/s, about ${fmt((mdot * 3.6) / 0.74, 2)} litres an hour.`,
          visual: flowPic({ Qh: P / e, Qc: P / e - P, W: P, labels: { Qh: 'fuel’s heat = ?', Qc: 'exhaust + radiator', W: `${P} kW`, hot: 'burning petrol', cold: 'the air' }, caption: 'Power flows, widths to scale.' }),
        };
      },
    }),
    num({
      id: 'cycle-e', difficulty: 3,
      gen(r) {
        const P2 = r.pick([200, 300, 400]), V2 = r.pick([2, 3, 4]), P1 = 100, V1 = 1;
        const n = molesOf(P1, V1, 300), c = TD.rect({ V1: V1 * 1e-3, V2: V2 * 1e-3, P1: P1 * 1e3, P2: P2 * 1e3, n });
        const A = TD.analyse(TD.cycleLegs(c, n, HE), n, HE);
        return {
          prompt: t`Helium goes round the rectangle clockwise: A (1.0 L, 100 kPa) → B (1.0 L, ${P2} kPa) → C (${V2}.0 L, ${P2} kPa) → D (${V2}.0 L, 100 kPa) → A. Heat flows in along A → B and B → C. Find the efficiency. (Helium: $C_V = \tfrac32R$, $C_P = \tfrac52R$.)`,
          answer: A.e, tol: { rel: 0.01 },
          errors: [{ value: A.W / (1.5 * V1 * (P2 - P1) + 1.5 * P2 * (V2 - V1)), feedback: t`Along B → C the pressure is constant, so the heat there is $nC_P\Delta T = \tfrac52P\Delta V$, not $\tfrac32P\Delta V$.` }, { value: A.W / (2.5 * P2 * (V2 - V1)), feedback: 'Include the heat taken in along A → B as well.' }],
          hints: [t`Net work = enclosed area $= (P_2 - P_1)(V_2 - V_1)$.`, t`Heat in: A → B at constant volume, $nC_V\Delta T = \tfrac32V\Delta P$; B → C at constant pressure, $nC_P\Delta T = \tfrac52P\Delta V$ (using $nR\Delta T = \Delta(PV)$).`, t`$e = W/Q_h$ with $Q_h$ the sum of those two.`],
          teach: 'An engine’s efficiency needs all the heat taken in, leg by leg — not just the heat on one leg.',
          explain: t`$W = (${P2 - P1})(${V2 - V1}) = ${fmt(A.W, 4)}$ J. $Q_{AB} = \tfrac32(1.0)(${P2 - P1}) = ${fmt(1.5 * (P2 - P1), 4)}$ J and $Q_{BC} = \tfrac52(${P2})(${V2 - V1}) = ${fmt(2.5 * P2 * (V2 - V1), 4)}$ J, so $Q_h = ${fmt(A.Qin, 4)}$ J and $e = ${fmt(A.W, 4)}/${fmt(A.Qin, 4)} = ${fmt(A.e, 3)}$.`,
          visual: pvPic({ gas: 'He', n, heat: true, legend: true, states: { A: { P: P1, V: V1 }, B: { P: P2, V: V1 }, C: { P: P2, V: V2 }, D: { P: P1, V: V2 } }, paths: one('A', ['isochoric', 'B'], ['isobaric', 'C'], ['isochoric', 'D'], ['isobaric', 'A']), vrange: [0, V2 + 1], prange: [0, P2 * 1.3], caption: 'Red legs take heat in, blue legs give it out; the gold area is the net work.' }),
        };
      },
    }),
    mcq({
      id: 'kelvin-planck', difficulty: 2,
      prompt: 'Which of these would violate the second law of thermodynamics?',
      visual: flowPic({ Qh: 1000, Qc: 700, W: 300, labels: { Qh: 'Q_h = 1000 J', Qc: 'Q_c = 700 J', W: 'W = 300 J' }, caption: 'One of the proposals, drawn as an energy-flow diagram: an engine taking in 1000 J per cycle.' }),
      choices: [
        'A ship’s engine that runs by taking heat from the ocean and turning all of it into work, cycle after cycle',
        'A gas that expands isothermally once, turning all the heat it absorbs into work',
        'An engine that takes in 1000 J per cycle, does 300 J of work and rejects 700 J',
        'A refrigerator that uses electrical work to move heat from its cold inside to a warm kitchen',
      ],
      answer: 0,
      why: {
        1: 'That happens in a single process, not a cycle: the gas ends at a larger volume and could not do it again without being compressed — which takes work back.',
        2: 'Energy balances and some heat is rejected: an ordinary engine with e = 30 %.',
        3: 'Moving heat from cold to hot is allowed when work is put in. That is what refrigerators do (next lesson).',
      },
      hints: ['The Kelvin–Planck statement is about devices working in a cycle.', 'Which device turns heat entirely into work and returns to its starting state?'],
      teach: 'No cyclic device can turn heat from a single reservoir entirely into work — though a single, one-off process can.',
      explain: 'The ocean engine would be a perpetual-motion machine of the second kind: it takes heat from one reservoir and converts all of it to work, cycle after cycle. Energy would be conserved, yet it is impossible. The one-off isothermal expansion is allowed because the gas does not return to its starting state.',
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`An engine takes in 1500 J of heat per cycle and rejects 1050 J. A student writes: $e = Q_c/Q_h = 1050/1500 = 70\ \%$. What is wrong?`,
      visual: flowPic({ Qh: 1500, Qc: 1050, W: 450, labels: { Qh: 'Q_h = 1500 J', Qc: 'Q_c = 1050 J', W: 'W' } }),
      choices: [
        t`Efficiency is the work over the heat in: $e = (Q_h - Q_c)/Q_h = 450/1500 = 30\ \%$`,
        t`Efficiency is the work over the heat out: $450/1050 = 43\ \%$`,
        'Efficiency cannot be found without the temperatures of the reservoirs',
        'The energies must be in kilojoules first',
      ],
      answer: 0,
      why: {
        1: 'The work is compared with what you pay for — the heat taken in — not with what is thrown away.',
        2: 'The temperatures set the *best possible* efficiency (lesson M19.3). The actual efficiency comes from the energies alone.',
        3: 'A ratio of two energies has no units: joules and kilojoules give the same answer.',
      },
      hints: ['Efficiency = what you get / what you pay for.', t`What you get is $W = Q_h - Q_c$.`],
      teach: t`Efficiency is the work out divided by the heat in: $e = 1 - Q_c/Q_h$.`,
      explain: t`$W = 1500 - 1050 = 450$ J, so $e = 450/1500 = 0.30$. The student's 70 % is the fraction of the heat *wasted*, $Q_c/Q_h$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rtg', difficulty: 2, transfer: true,
      gen(r) {
        const Qh = r.pick([1900, 2000, 2100]), W = r.pick([100, 110, 120]);
        return {
          prompt: t`The Curiosity rover's radioisotope power source (an MMRTG) takes in about ${Qh} W of heat from decaying plutonium-238 and turns about ${W} W into electricity with thermocouples. How much heat must it shed through its fins each second?`,
          answer: Qh - W, units: 'W', tol: { rel: 0.005 },
          errors: [{ value: W, feedback: 'That is the electrical output. The heat shed is everything that does not become electricity.' }, { value: Qh, feedback: 'Some of the heat does become electricity: subtract it.' }],
          hints: ['Energy in = electricity out + heat out, every second.'],
          teach: 'A thermoelectric generator is a heat engine too: whatever heat it does not turn into electricity, it must reject.',
          explain: t`Heat shed $= ${Qh} - ${W} = ${Qh - W}$ W; efficiency $= ${W}/${Qh} = ${fmt((100 * W) / Qh, 2)}$ %. Thermocouples have no moving parts, but they are heat engines all the same, bound by the same second law. On Mars that waste heat is welcome: it keeps the rover's electronics warm through the night.`,
          visual: flowPic({ Qh, Qc: Qh - W, W, labels: { Qh: `${Qh} W of heat`, Qc: 'heat shed = ?', W: `${W} W electric`, hot: 'plutonium-238 fuel, hot', cold: 'Martian surroundings', device: 'thermocouples' }, caption: 'Power flows per second, widths to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-car', difficulty: 2,
      gen(r) {
        const P = r.pick([50, 75, 100]), e = r.pick([0.25, 0.3, 0.35]);
        return {
          prompt: t`A car engine produces ${P} kW of mechanical power at ${Math.round(e * 100)} % efficiency. At what rate does it reject heat?`,
          answer: P / e - P, units: 'kW', tol: { rel: 0.01 },
          errors: [{ value: P / e, feedback: 'That is the heat input rate. Subtract the useful power.' }, { value: P * (1 - e), feedback: t`The heat input is $P/e$, not $P$.` }],
          hints: [t`Heat in $= P/e$.`],
          teach: 'Heat rejected per second = heat in − power out = P/e − P.',
          explain: t`Heat in $= ${P}/${e} = ${fmt(P / e, 4)}$ kW, so it rejects $${fmt(P / e - P, 4)}$ kW through the exhaust and radiator.`,
          visual: flowPic({ Qh: P / e, Qc: P / e - P, W: P, labels: { Qh: 'heat in', Qc: 'heat out = ?', W: `${P} kW`, hot: 'burning fuel', cold: 'exhaust and radiator' } }),
        };
      },
    }),
    mcq({
      id: 'cp-bookkeeping', difficulty: 2,
      prompt: 'An engine does 400 J of work per cycle and gives out 600 J of heat per cycle. Which is true?',
      visual: flowPic({ Qh: 1000, Qc: 600, W: 400, labels: { Qh: 'Q_h = ?', Qc: 'Q_c = 600 J', W: 'W = 400 J' } }),
      choices: ['It takes in 1000 J per cycle and its efficiency is 40 %', 'It takes in 600 J per cycle and its efficiency is 67 %', 'Its efficiency is 60 %', 'It takes in 400 J per cycle and its efficiency is 100 %'],
      answer: 0,
      why: {
        1: 'The 600 J is heat going *out*. The heat in must cover both the work and the heat out.',
        2: t`60 % is $Q_c/Q_h$, the share wasted.`,
        3: 'The heat in must also supply the 600 J that goes out.',
      },
      hints: [t`$Q_h = W + Q_c$.`],
      teach: t`Over a cycle the heat in pays for the work and the heat out: $Q_h = W + Q_c$.`,
      explain: t`$Q_h = W + Q_c = 400 + 600 = 1000$ J, so $e = 400/1000 = 40\ \%$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §4.2 Heat Engines', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-2-heat-engines' },
    { label: 'NASA Mars 2020 mission: the rover’s electrical power (MMRTG)', url: 'https://mars.nasa.gov/mars2020/spacecraft/rover/electrical-power/' },
  ],
});
