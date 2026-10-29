// Heat and specific heat: Q = mcΔT, heat as energy in transit (not something a
// body holds), and calorimetry — with a cryogenic chill-down and a test-stand
// calorimeter.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { SPECIFIC, ssEnthalpy, bodiesPic, tqPic, cBars, cpGraph, flowPic, apart } from './_thermal.js';

const t = String.raw;
const CW = SPECIFIC.water, CAL = SPECIFIC.aluminium;
const CBAR = Math.round(ssEnthalpy(77, 293) / 216);      // 386 J/(kg K): NIST's c(T) for 304 stainless, averaged over 77–293 K
const METALS = [['aluminium', 897], ['copper', 385], ['iron', 449], ['stainless steel', 470]];

// the worked example: identifying a metal by calorimetry, cup included
const EX = { ms: 0.25, Ts: 100, mw: 0.4, Tw: 20, mc: 0.1, Tf: 24 };
EX.Qw = EX.mw * CW * (EX.Tf - EX.Tw);            // 6694.4 J
EX.Qc = EX.mc * CAL * (EX.Tf - EX.Tw);           // 358.8 J
EX.c = (EX.Qw + EX.Qc) / (EX.ms * (EX.Ts - EX.Tf));   // 371.2 J/(kg K)

export default lesson({
  id: 'phys2210.M16.3',
  title: 'Heat and specific heat',
  minutes: 10, difficulty: 2,
  intro: t`**Heat** is energy that flows from one body to another *because* their temperatures differ. A body does not contain heat — it contains *internal energy*, the random energy of its atoms. Heat is that energy in transit, and there is no such thing as “cold” flowing the other way. When heat $Q$ flows into a body and nothing melts or boils, its temperature rises in proportion:

$$Q = mc\,\Delta T$$

The **specific heat** $c$ says how much energy one kilogram needs per kelvin. Water’s is large, 4184 J/(kg·K) — nine times stainless steel’s. And in an insulated container, the heat lost by the hot parts equals the heat gained by the cold ones: that bookkeeping is **calorimetry**.`,
  symbols: [
    { tex: 'Q', text: 'the heat that flows into the body, in joules (J): positive when energy flows in, negative when it flows out' },
    { tex: 'm', text: 'the mass of the body, in kilograms (kg)' },
    { tex: 'c', text: 'the specific heat of the material, in J/(kg·K): water 4184, aluminium 897, stainless steel 470, copper 385 near room temperature. It changes with temperature, falling steeply near absolute zero' },
    { tex: '\\Delta T', text: 'the change in temperature, $T_\\text{final} - T_\\text{initial}$, in kelvin (the same number in Celsius degrees)' },
    { tex: 'C = mc', text: 'the heat capacity of the whole body, in J/K: the energy that warms *it* by one kelvin' },
  ],
  why: 'Chilling a rocket’s propellant lines before loading, sizing a spacecraft’s heat sink, and measuring how much heat a combustion chamber pushes into its walls all start from Q = mcΔT.',
  visual: {
    type: 'graph',
    title: 'The same heat, very different temperature rises',
    lead: t`Each line is a body warming from 20 °C as heat flows in. Its slope is $1/(mc)$: a large mass or a large specific heat makes a shallow line. Choose the material and the mass, and slide the heat added.`,
    tasks: [
      'Choose water, then copper: the same 20 kJ warms a kilogram of copper nearly eleven times as much (4184 / 385 ≈ 10.9).',
      'Double the mass: the line’s slope halves — the same heat spread over twice as much material.',
      'With 1 kg of water, find the heat that warms it by 20 K: about 84 kJ.',
    ],
    params: {
      x: [0, 100], y: [0, 100], aspect: 'wide', xlabel: 'heat added Q (kJ)', ylabel: 'T (°C)',
      alt: 'Temperature against heat added for several materials, with one highlighted',
      choices: [{ key: 'c', label: 'Material', options: [[4184, 'Water'], [897, 'Aluminium'], [470, 'Stainless steel'], [385, 'Copper']], value: 4184 }],
      sliders: [
        { key: 'm', label: 'Mass $m$', min: 0.2, max: 5, step: 0.1, value: 1, unit: '\\mathrm{kg}', explain: 'Every line on the graph is for this mass.' },
        { key: 'Q', label: 'Heat added $Q$', min: 0, max: 100, step: 1, value: 20, unit: '\\mathrm{kJ}', explain: 'Energy that has flowed in, with nothing melting or boiling.' },
      ],
      curves: [
        { fn: '20 + 1000*x/(m*4184)', color: 'accent', width: 1.2, dash: true, label: 'water', labelAt: 88, labelDx: -40, labelDy: -10 },
        { fn: '20 + 1000*x/(m*897)', color: 'teal', width: 1.2, dash: true, label: 'aluminium', labelAt: 52, labelDx: 8, labelDy: 6 },
        { fn: '20 + 1000*x/(m*470)', color: 'violet', width: 1.2, dash: true, label: 'steel', labelAt: 30, labelDx: 8, labelDy: 6 },
        { fn: '20 + 1000*x/(m*385)', color: 'warn', width: 1.2, dash: true, label: 'copper', labelAt: 18, labelDx: -50, labelDy: -2 },
        { fn: '20 + 1000*x/(m*c)', color: 'gold', width: 3 },
      ],
      points: [{ x: 'Q', y: '20 + 1000*Q/(m*c)', r: 5.5, color: 'gold' }],
      readouts: [
        { label: 'temperature rise $\\Delta T = Q/(mc)$', expr: '1000*Q/(m*c)', unit: '\\mathrm{K}', digits: 3 },
        { label: 'final temperature', expr: '20 + 1000*Q/(m*c)', unit: '^\\circ\\mathrm{C}', digits: 3 },
      ],
    },
    caption: 'The gold line is the material you chose; the dashed lines are the others at the same mass. Specific heats are taken as constant, which is good near room temperature; nothing melts or boils, and no heat escapes.',
  },
  example: {
    prompt: t`To identify a metal, you heat a ${EX.ms.toFixed(3)} kg sample in boiling water to ${EX.Ts.toFixed(1)} °C, then drop it into ${EX.mw.toFixed(3)} kg of water at ${EX.Tw.toFixed(1)} °C held in a ${EX.mc.toFixed(3)} kg aluminium calorimeter cup. Everything settles at ${EX.Tf.toFixed(1)} °C. What is the sample’s specific heat? Ignore heat lost to the surroundings.`,
    visual: bodiesPic({ bodies: [{ name: 'metal sample', temp: '100 °C', color: 'warn', w: 0.8, h: 0.8 }, { name: 'water + aluminium cup', temp: '20 °C', color: 'accent', w: 2.2, h: 1.4 }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: 'Heat flows from the hot sample into the water and the cup until all three share one temperature. Not to scale.' }),
    steps: [
      { label: 'Bookkeeping', text: t`The calorimeter is insulated, so energy only moves around inside it: **heat lost by the sample = heat gained by the water and the cup.** Every term below is a positive amount of energy.` },
      { label: 'What the cold parts gained', text: t`Water: $m_wc_w\Delta T = (${EX.mw})(4184)(${EX.Tf - EX.Tw}) = ${fmt(EX.Qw, 4)}$ J. Cup: $(${EX.mc})(897)(${EX.Tf - EX.Tw}) = ${fmt(EX.Qc, 4)}$ J. Together $${fmt(EX.Qw + EX.Qc, 4)}$ J. The cup is small, but leaving it out would bias the answer by ${Math.round((100 * EX.Qc) / (EX.Qw + EX.Qc))} %.` },
      { label: 'What the sample lost', text: t`$m_sc_s(T_s - T_f) = (${EX.ms})\,c_s\,(${EX.Ts} - ${EX.Tf}) = (${fmt(EX.ms * (EX.Ts - EX.Tf), 3)}\ \text{kg·K})\,c_s$.` },
      { label: 'Solve', text: t`$c_s = \dfrac{${fmt(EX.Qw + EX.Qc, 4)}\ \text{J}}{${fmt(EX.ms * (EX.Ts - EX.Tf), 3)}\ \text{kg·K}} = ${fmt(EX.c, 3)}\ \text{J/(kg·K)}$.` },
      { label: 'Sense check', text: t`Close to copper (385) and brass (about 380): probably a copper alloy. A small rise in the water’s temperature with a big drop in the metal’s is what you expect, because water’s specific heat is about eleven times larger.` },
    ],
    answer: t`$c \approx ${fmt(EX.c, 3)}\ \text{J/(kg·K)}$ — a copper alloy, most likely brass.`,
  },
  practice: [
    mcq({
      id: 'heat-vs-temp', difficulty: 1,
      prompt: 'A bathtub holds 150 kg of water at 40 °C; a mug holds 0.25 kg of coffee at 80 °C. Both are left to cool to the room’s 20 °C. Which statement is right?',
      choices: [
        'The coffee is at the higher temperature, but the bath gives far more heat to the room as it cools',
        'The coffee contains more heat, because it is hotter',
        'Both give the same heat, because they end at the same temperature',
        'The coffee gives more heat, because heat depends only on the temperature drop',
      ],
      answer: 0,
      why: {
        1: 'Bodies don’t contain heat: heat is energy *in transit*. And a higher temperature does not mean more energy to give away — mass matters too.',
        2: 'The heat given out is mcΔT: it depends on how much there is and how far it cools, not just on where it ends up.',
        3: t`The drop matters, but so does the mass: $Q = mc\Delta T$. The bath has 600 times the coffee’s mass.`,
      },
      hints: [t`Work out $Q = mc\Delta T$ for each, with $c = 4184$ J/(kg·K) for both.`],
      teach: 'Temperature is a state of a body; heat is energy that flows because of a temperature difference, and how much flows depends on the mass too.',
      explain: t`Bath: $150 \times 4184 \times 20 = 12.6$ MJ. Coffee: $0.25 \times 4184 \times 60 = 63$ kJ. The bath releases about 200 times as much heat, though its temperature is lower.`,
      visual: bodiesPic({ bodies: [{ name: 'bath: 150 kg', temp: '40 °C', color: 'accent', w: 3.2, h: 1.1 }, { name: 'mug: 0.25 kg', temp: '80 °C', color: 'warn', w: 0.45, h: 0.55 }], gap: 1.6, caption: 'The two bodies, roughly to scale in width. Both cool to the room’s 20 °C.' }),
    }),
    num({
      id: 'heat-to-warm', difficulty: 1,
      gen(r) {
        const m = r.pick([0.5, 1.2, 2, 3.5, 5]), T1 = r.pick([12, 15, 18, 20]), T2 = r.pick([60, 75, 85, 95]);
        const Q = (m * CW * (T2 - T1)) / 1000;
        return {
          prompt: t`How much heat warms ${m} kg of water from ${T1} °C to ${T2} °C? (Use $c = 4184$ J/(kg·K).)`,
          answer: Q, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: (m * CW * T2) / 1000, feedback: t`Use the *change* in temperature, $\Delta T = ${T2} - ${T1}$ K, not the final temperature.` }],
          hints: [t`$Q = mc\Delta T$ with $\Delta T = ${T2 - T1}$ K.`],
          teach: 'With no phase change, the heat needed is mass times specific heat times temperature change.',
          explain: t`$Q = (${m}\ \text{kg})(4184\ \text{J/(kg·K)})(${T2 - T1}\ \text{K}) = ${tex(Q * 1000, 3)}$ J $= ${fmt(Q, 3)}$ kJ.`,
          visual: tqPic({ T1, T2, name: `${m} kg of water`, caption: 'Temperature against heat added: a straight line while nothing boils. The heat axis has no numbers — finding Q is the question.' }),
        };
      },
    }),
    num({
      id: 'mix-temp', difficulty: 2,
      gen(r) {
        const [name, cm] = r.pick(METALS), mm = r.pick([0.5, 1, 1.5, 2]), Tm = r.pick([80, 90, 100]), mw = r.pick([2, 3, 4, 5]), Tw = r.pick([10, 15, 20]);
        const Tf = (mm * cm * Tm + mw * CW * Tw) / (mm * cm + mw * CW);
        return {
          prompt: t`A ${mm} kg ${name} part at ${Tm} °C is dropped into ${mw} kg of water at ${Tw} °C in an insulated tank. What temperature do they reach? (Specific heats: ${name} ${cm}, water 4184 J/(kg·K).)`,
          answer: Tf, tol: { rel: 0.005, abs: 0.05 },
          errors: [
            { value: (Tm + Tw) / 2, feedback: 'Halfway is right only for bodies with equal heat capacities mc. Water’s is far larger here.' },
            { value: (mm * Tm + mw * Tw) / (mm + mw), feedback: 'You weighted by mass alone. Weight each temperature by the heat capacity mc: specific heats differ a lot.' },
          ],
          hints: ['Heat lost by the metal = heat gained by the water.', t`$m_mc_m(T_m - T_f) = m_wc_w(T_f - T_w)$. Solve for $T_f$.`],
          teach: 'In an insulated system the final temperature is the heat-capacity-weighted average of the starting temperatures.',
          explain: t`$T_f = \dfrac{m_mc_mT_m + m_wc_wT_w}{m_mc_m + m_wc_w} = \dfrac{(${mm})(${cm})(${Tm}) + (${mw})(4184)(${Tw})}{(${mm})(${cm}) + (${mw})(4184)} = ${fmt(Tf, 4)}$ °C. The water’s heat capacity dominates, so the final temperature sits close to the water’s.`,
          visual: bodiesPic({ bodies: [{ name: `${name}, ${mm} kg`, temp: `${Tm} °C`, color: 'warn', w: 0.8, h: 0.8 }, { name: `water, ${mw} kg`, temp: `${Tw} °C`, color: 'accent', w: 2, h: 1.3 }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: 'Insulated: heat only moves from the hot part to the water. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'which-warms-most', difficulty: 2,
      prompt: 'One-kilogram blocks of water, aluminium, stainless steel and copper each absorb the same 10 kJ of heat. Which ends up with the largest temperature rise?',
      choices: ['Copper', 'Water', 'Aluminium', 'Stainless steel'],
      answer: 0,
      why: {
        1: t`Reversed: water has the *largest* specific heat, so it warms the least — $\Delta T = Q/(mc)$.`,
        2: 'Aluminium is the lightest metal per volume, but every block here has the same mass; what matters is the specific heat, and aluminium’s is the largest of the metals.',
        3: 'Steel’s specific heat is larger than copper’s, so the same heat warms it less.',
      },
      hints: [t`Solve $Q = mc\Delta T$ for $\Delta T$: with $Q$ and $m$ fixed, $\Delta T \propto 1/c$.`],
      teach: 'For the same heat and mass, the temperature rise is inversely proportional to the specific heat.',
      explain: t`$\Delta T = Q/(mc)$: copper (385) rises $26$ K, steel (470) $21$ K, aluminium (897) $11$ K and water (4184) only $2.4$ K.`,
      visual: cBars([['water', 4184, 'accent'], ['aluminium', 897, 'teal'], ['stainless', 470, 'violet'], ['copper', 385, 'warn']]),
    }),
    num({
      id: 'unknown-c', difficulty: 3,
      gen(r) {
        const [name, ctrue] = r.pick([['titanium', 523], ['copper', 385], ['iron', 449], ['silver', 235], ['aluminium', 897]]);
        const ms = r.pick([0.2, 0.3, 0.4]), mw = r.pick([0.4, 0.5, 0.6]), Tw = r.pick([18, 20, 22]);
        const Tf = +((ms * ctrue * 100 + mw * CW * Tw) / (ms * ctrue + mw * CW)).toFixed(1);
        const c = (mw * CW * (Tf - Tw)) / (ms * (100 - Tf));
        return {
          prompt: t`A ${ms} kg metal sample at 100.0 °C is dropped into ${mw} kg of water at ${Tw}.0 °C in an insulated cup of negligible heat capacity. The final temperature is ${Tf.toFixed(1)} °C. What is the metal’s specific heat?`,
          answer: c, units: 'J/(kg K)', tol: { rel: 0.02 },
          errors: apart([
            { value: (mw * CW * (Tf - Tw)) / (ms * 100), feedback: 'Use the sample’s temperature *drop*, $100 - T_f$, not its starting temperature.' },
            { value: (mw * CW * (Tf - Tw)) / (ms * (100 - Tw)), feedback: 'The sample ends at $T_f$, not at the water’s starting temperature: its drop is $100 - T_f$.' },
          ], c),
          hints: ['Heat lost by the sample = heat gained by the water.', t`$c_s = \dfrac{m_wc_w(T_f - T_w)}{m_s(100 - T_f)}$.`],
          teach: 'Calorimetry finds an unknown specific heat by balancing the heat lost against the heat gained.',
          explain: t`$c_s = \dfrac{(${mw})(4184)(${fmt(Tf - Tw, 3)})}{(${ms})(${fmt(100 - Tf, 3)})} = ${fmt(c, 3)}$ J/(kg·K) — close to the handbook value for ${name}, ${ctrue}.`,
          visual: bodiesPic({ bodies: [{ name: `sample, ${ms} kg`, temp: '100.0 °C', color: 'warn', w: 0.7, h: 0.7 }, { name: `water, ${mw} kg`, temp: `${Tw}.0 °C`, color: 'accent', w: 1.6, h: 1.2 }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: `Both end at ${Tf.toFixed(1)} °C. Not to scale.` }),
        };
      },
    }),
    num({
      id: 'chill-steel', difficulty: 3,
      gen(r) {
        const m = r.pick([5, 12, 25, 40, 60]);
        const Q = (m * CBAR * 216) / 1000;
        return {
          prompt: t`Before liquid oxygen is loaded, a ${m} kg stainless steel valve assembly must be chilled from 293 K to 77 K. Stainless steel’s specific heat falls a lot as it cools; averaged over this range (from NIST’s data) it is ${CBAR} J/(kg·K). How much heat must be removed?`,
          answer: Q, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: (m * 470 * 216) / 1000, feedback: 'That uses the room-temperature specific heat, 470 J/(kg·K). The steel’s c falls as it cools; use the average over the range.' }],
          hints: [t`$Q = mc\Delta T$ still works with the *average* specific heat over the range.`, t`$\Delta T = 293 - 77 = 216$ K.`],
          teach: 'When c changes with temperature, Q = m∫c dT — which equals m times the average c times ΔT.',
          explain: t`$Q = (${m})(${CBAR})(216) = ${tex(Q * 1000, 3)}$ J $\approx ${fmt(Q, 3)}$ kJ — the shaded area under the c(T) curve, times the mass. Using the room-temperature value would overestimate by ${Math.round((470 / CBAR - 1) * 100)} %.`,
          visual: cpGraph({ T1: 77, T2: 293 }),
        };
      },
    }),
    mcq({
      id: 'cold-can', difficulty: 2,
      prompt: 'A can of soda from the fridge, at 5 °C, sits on a table in a 22 °C room. A student says: “The can is giving off cold to the air around it.” Which description is physically right?',
      choices: [
        'Heat flows from the warmer air and table into the can, raising its internal energy until it reaches 22 °C',
        'Cold flows out of the can into the air until the can has run out of cold',
        'Heat flows out of the can into the air, because the can is losing its coldness',
        'No heat flows: the can warms up because the room’s temperature spreads into it',
      ],
      answer: 0,
      why: {
        1: 'There is no substance called “cold”. A cold object is simply one with less internal energy; it gains energy from its warmer surroundings.',
        2: 'Heat flows from hotter to colder — here, from the 22 °C room into the 5 °C can.',
        3: 'Temperature does not spread; energy does. The energy that flows because of a temperature difference *is* heat.',
      },
      hints: ['Which way does heat always flow, between a 22 °C body and a 5 °C one?'],
      teach: 'Heat is energy flowing from hot to cold; “cold” is not a thing that flows.',
      explain: t`The air and table, at 22 °C, are hotter than the can, so heat flows **into** the can. Its internal energy, and so its temperature, rise until it reaches 22 °C — and the nearby air cools a little, which is what the student felt.`,
      visual: bodiesPic({ bodies: [{ name: 'room air', temp: '22 °C', color: 'warn', w: 2.4, h: 1.2 }, { name: 'soda can', temp: '5 °C', color: 'accent', w: 0.5, h: 0.9 }], gap: 0.9, caption: 'The can and the air around it. Not to scale.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-chamber', difficulty: 3, transfer: true,
      gen(r) {
        const mdot = r.pick([1.5, 2, 2.5, 3]), Tin = r.pick([15, 18, 20]), Tout = r.pick([38, 45, 52, 60]);
        const P = (mdot * CW * (Tout - Tin)) / 1000;
        return {
          prompt: t`On a rocket test stand, a small “calorimeter” combustion chamber is cooled by water flowing through a jacket around it at ${mdot} kg/s. The water enters at ${Tin} °C and leaves at ${Tout} °C. How much heat per second is the hot gas pushing through the chamber walls?`,
          answer: P, units: 'kW', tol: { rel: 0.01 },
          errors: [{ value: (mdot * CW * Tout) / 1000, feedback: t`The water carries away heat according to how much it *warms*: $\Delta T = ${Tout} - ${Tin}$ K.` }],
          hints: ['Each second, a mass ṁ of water warms by ΔT.', t`Heat per second $= \dot m\,c\,\Delta T$.`],
          teach: 'A flowing coolant carries heat away at a rate ṁcΔT — which is how test stands measure the heat flowing into chamber walls.',
          explain: t`$P = \dot m c\Delta T = (${mdot}\ \text{kg/s})(4184\ \text{J/(kg·K)})(${Tout - Tin}\ \text{K}) = ${tex(P * 1000, 3)}$ W $\approx ${fmt(P, 3)}$ kW. Divide by the wall area and you have the heat flux that a regeneratively cooled engine must survive.`,
          visual: flowPic({ Tin: `${Tin} °C`, Tout: `${Tout} °C`, mdot: `${mdot} kg/s` }),
        };
      },
    }),
    mcq({
      id: 'cp-water-copper', difficulty: 2,
      prompt: 'Equal masses of water at 80 °C and copper at 20 °C are put in thermal contact, insulated from everything else. The temperature they end at is:',
      choices: ['About 75 °C', '50 °C, exactly halfway', 'About 25 °C', 'About 30 °C, because copper conducts heat so well that it sets the final temperature'],
      answer: 0,
      why: {
        1: 'Halfway needs equal heat capacities. With equal masses, water’s c is eleven times copper’s.',
        2: 'Reversed: the body with the *larger* heat capacity changes temperature less, and that is the water.',
        3: 'Conductivity sets how fast they reach equilibrium, not where. The final temperature depends only on the heat capacities.',
      },
      teach: 'The final temperature is the heat-capacity-weighted average, so it lands near the body with the larger mc.',
      hints: [t`$T_f = \dfrac{c_wT_w + c_{Cu}T_{Cu}}{c_w + c_{Cu}}$ for equal masses.`],
      explain: t`$T_f = \dfrac{4184\times80 + 385\times20}{4184 + 385} = ${fmt((4184 * 80 + 385 * 20) / (4184 + 385), 3)}$ °C. The water cools by only 5 K while the copper warms by 55 K.`,
      visual: bodiesPic({ bodies: [{ name: 'water, 1 kg', temp: '80 °C', color: 'accent', w: 1.4, h: 1.2 }, { name: 'copper, 1 kg', temp: '20 °C', color: 'warn', w: 0.6, h: 0.5 }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: 'Equal masses — the copper is much smaller because it is nine times denser. Not to scale.' }),
    }),
    num({
      id: 'cp-heater', difficulty: 2,
      gen(r) {
        const P = r.pick([1.2, 1.5, 2, 2.4]), m = r.pick([0.8, 1, 1.2, 1.5]), T1 = r.pick([10, 15, 20]);
        const tsec = (m * CW * (100 - T1)) / (P * 1000);
        return {
          prompt: t`A ${P} kW electric kettle heats ${m} kg of water from ${T1} °C to the boil, 100 °C. Ignoring heat lost to the kettle and the room, how long does it take?`,
          answer: tsec, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (m * CW * 100) / (P * 1000), feedback: t`The water warms by $100 - ${T1}$ K, not 100 K.` }],
          hints: ['First find the heat needed, Q = mcΔT.', 'Then time = energy ÷ power.'],
          teach: 'A heater of power P supplies Q = Pt, so the time is mcΔT divided by P.',
          explain: t`$Q = (${m})(4184)(${100 - T1}) = ${tex(m * CW * (100 - T1), 3)}$ J, so $t = Q/P = ${tex(m * CW * (100 - T1), 3)}/${P * 1000} = ${fmt(tsec, 3)}$ s, about ${fmt(tsec / 60, 2)} minutes. Real kettles take a little longer: some heat goes into the kettle and the air.`,
          visual: tqPic({ T1, T2: 100, name: `${m} kg of water`, xlabel: 'time (heat = power × time)', ask: 't = ?', caption: 'Steady power means heat flows in at a steady rate, so the temperature climbs in a straight line until boiling starts.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §1.4 Heat Transfer, Specific Heat, and Calorimetry', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry' },
    { label: 'NIST Cryogenic Material Properties: 304 stainless steel (specific heat fit, 4–300 K)', url: 'https://trc.nist.gov/cryogenics/materials/304Stainless/304Stainless_rev.htm' },
  ],
});
