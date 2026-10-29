// Temperature and thermal equilibrium: the zeroth law, and the kelvin,
// Celsius and Fahrenheit scales — with cryogenic propellants for scale.
import { lesson, mcq, num } from '../../src/core/content.js';
import { C0, toK, cToF, kToF, scalesPic, bodiesPic, equilibriumGraph, pipePic } from './_thermal.js';

const t = String.raw;
const f2 = (x) => x.toFixed(2).replace('-', '−');               // canvas text: two decimals, true minus
const tx2 = (x) => x.toFixed(2);                                  // TeX: two decimals

// the worked example: liquid oxygen's boiling point (NIST: 90.188 K) and a 20 °C test cell
const EX = { K: 90.19, cell: 20 };
EX.C = EX.K - C0;                 // −182.96 °C
EX.F = cToF(EX.C);                // −297.33 °F
EX.dT = toK(EX.cell) - EX.K;      // 202.96 K

// normal boiling points (and the sublimation point of CO₂) at one atmosphere, NIST Chemistry WebBook
const COLD = [
  ['Liquid nitrogen boils', 'N₂ boils', 77.36],
  ['Liquid argon boils', 'Ar boils', 87.3],
  ['Liquid oxygen boils', 'O₂ boils', 90.19],
  ['Liquid methane boils', 'CH₄ boils', 111.67],
  ['Solid carbon dioxide (dry ice) turns straight to gas', 'dry ice', 194.69],
];
const ZERO = { K: 0, name: 'absolute zero', color: 'violet', cells: { K: '0 K', C: '−273.15 °C', F: '−459.67 °F' } };
const ICE = { K: C0, name: 'water freezes', color: 'teal', cells: { K: '273.15 K', C: '0 °C', F: '32 °F' } };

export default lesson({
  id: 'phys2210.M16.1',
  title: 'Temperature and thermal equilibrium',
  minutes: 9, difficulty: 1,
  intro: t`**Temperature** is what a thermometer reads — and, as kinetic theory will show, a measure of how hard the atoms of a body jiggle. Put two bodies in contact and energy flows from the hotter to the colder until their temperatures are equal: they reach **thermal equilibrium**. The **zeroth law of thermodynamics** says that if bodies A and B are each in equilibrium with a third body C, they are in equilibrium with each other. That is why a thermometer (body C) can compare two things that never touch.

Physics measures temperature from **absolute zero**, on the kelvin scale:

$$T_\text{K} = T_\text{C} + 273.15$$

A kelvin and a Celsius degree are the same size; the two scales differ only in where zero sits. Cryogenic engineering lives near the bottom: liquid nitrogen boils at 77.4 K, liquid oxygen at 90.2 K.`,
  symbols: [
    { tex: 'T_\\text{K}', text: 'temperature on the kelvin scale, in kelvin (K) — written without a degree sign. 0 K is absolute zero, the coldest anything can be' },
    { tex: 'T_\\text{C}', text: 'temperature on the Celsius scale, in °C. At one atmosphere water freezes at 0 °C and boils at about 100 °C' },
    { tex: '273.15', text: 'the offset between the scales, fixed by definition: 0 °C is 273.15 K. A temperature *difference* of 1 K is exactly a difference of 1 °C' },
    { tex: 'T_\\text{F} = \\tfrac95 T_\\text{C} + 32', text: 'Fahrenheit, still common in US engineering: water freezes at 32 °F and boils at 212 °F, and one Fahrenheit degree is $\\tfrac59$ of a kelvin' },
  ],
  why: 'Every gas law needs temperatures in kelvin, and every thermal design — a propellant line, a spacecraft radiator — starts by asking which way heat will flow: always from hotter to colder, until the temperatures match.',
  visual: {
    type: 'graph',
    title: 'Two bodies in contact settle at one temperature',
    lead: t`Body A (orange) and body B (blue) touch, insulated from everything else. Energy flows from the hotter to the colder until their temperatures meet. **Where** they meet depends on their heat capacities — how much energy each needs per kelvin of warming (lesson M16.3) — not on how fast they exchange it.`,
    tasks: [
      t`Make B tiny, $C_B/C_A = 0.05$, like a small thermometer: B swings to A’s temperature while A hardly moves — the thermometer reads A correctly.`,
      'Now make B huge: A does all the changing. A big probe drags what it measures toward its own temperature.',
      t`Change only $\tau$: the curves meet sooner or later, but always at the same temperature.`,
    ],
    params: {
      x: [0, 10], y: [0, 420], aspect: 'wide', xlabel: 't (min)', ylabel: 'T (K)',
      alt: 'Temperatures of two bodies in contact, approaching a common value',
      sliders: [
        { key: 'TA', label: 'Starting temperature of A, $T_A$', min: 50, max: 400, step: 1, value: 350, unit: '\\mathrm{K}', explain: 'Body A’s temperature at the moment the two touch.' },
        { key: 'TB', label: 'Starting temperature of B, $T_B$', min: 50, max: 400, step: 1, value: 80, unit: '\\mathrm{K}', explain: 'Body B’s temperature at the moment the two touch.' },
        { key: 'r', label: 'Heat-capacity ratio $C_B/C_A$', min: 0.05, max: 20, value: 1, logScale: true, unit: '', explain: 'How much energy B needs per kelvin compared with A. At 1 the bodies are alike.' },
        { key: 'tau', label: 'Time constant $\\tau$', min: 0.3, max: 4, step: 0.1, value: 1.5, unit: '\\mathrm{min}', explain: 'How quickly they exchange energy, set by the contact and the materials. Smaller is faster.' },
      ],
      curves: [
        { fn: '(TA + r*TB)/(1 + r) + (TA - (TA + r*TB)/(1 + r))*exp(-x/tau)', color: 'warn', width: 2.8, label: 'A', labelAt: 0.12, labelDx: 8, labelDy: -12 },
        { fn: '(TA + r*TB)/(1 + r) + (TB - (TA + r*TB)/(1 + r))*exp(-x/tau)', color: 'accent', width: 2.8, label: 'B', labelAt: 0.12, labelDx: 8, labelDy: 14 },
      ],
      hlines: [{ y: '(TA + r*TB)/(1 + r)', label: 'equilibrium', color: 'ink3' }],
      readouts: [
        { label: 'equilibrium temperature', expr: '(TA + r*TB)/(1 + r)', unit: '\\mathrm{K}', digits: 4 },
        { label: 'in Celsius', expr: '(TA + r*TB)/(1 + r) - 273.15', unit: '^\\circ\\mathrm{C}', digits: 4 },
      ],
    },
    caption: 'Each body is taken to have one uniform temperature, and the heat flow to be proportional to the temperature difference, so both temperatures approach equilibrium exponentially. The pair is perfectly insulated; real bodies also trade heat with their surroundings.',
  },
  example: {
    prompt: t`Liquid oxygen boils at ${EX.K} K at atmospheric pressure. (a) Express this in °C and in °F. (b) A LOX line at that temperature runs through a test cell at ${EX.cell} °C. What is the temperature difference across the line’s wall and insulation, in kelvin and in Celsius degrees?`,
    visual: scalesPic({
      cols: ['K', 'C', 'F'],
      marks: [ZERO, { K: EX.K, name: 'LOX boils', cells: { K: `${EX.K} K`, C: `${f2(EX.C)} °C`, F: `${f2(EX.F)} °F` } }, { K: toK(EX.cell), name: 'test cell', color: 'warn', cells: { K: `${tx2(toK(EX.cell))} K`, C: `${EX.cell} °C`, F: `${cToF(EX.cell)} °F` } }],
      bracket: { from: EX.K, to: toK(EX.cell), label: 'ΔT' },
      caption: 'Three scales side by side, heights to scale. Each scale’s zero sits somewhere different, but kelvin and Celsius steps are the same size, so ΔT is the same on both.',
    }),
    steps: [
      { label: 'Kelvin to Celsius', text: t`Subtract the offset: $T_\text{C} = T_\text{K} - 273.15 = ${EX.K} - 273.15 = ${tx2(EX.C)}\ ^\circ\text{C}$.` },
      { label: 'Celsius to Fahrenheit', text: t`A Fahrenheit degree is $\tfrac59$ of a Celsius degree, and the scale is offset by 32: $T_\text{F} = \tfrac95(${tx2(EX.C)}) + 32 = ${tx2(1.8 * EX.C)} + 32 = ${tx2(EX.F)}\ ^\circ\text{F}$.` },
      { label: 'The difference', text: t`The cell is at $${EX.cell} + 273.15 = ${tx2(toK(EX.cell))}$ K, so $\Delta T = ${tx2(toK(EX.cell))} - ${EX.K} = ${tx2(EX.dT)}$ K. In Celsius: $${EX.cell} - (${tx2(EX.C)}) = ${tx2(EX.dT)}\ ^\circ\text{C}$ — **the same number**, because the two scales have the same step size. A difference never needs the 273.15.` },
      { label: 'Sense check', text: t`About −183 °C and −297 °F are the figures on any LOX data sheet. A 200-kelvin difference across a thin wall is why an uninsulated LOX line grows a coat of frost within minutes.` },
    ],
    answer: t`(a) $${tx2(EX.C)}\ ^\circ\text{C}$ and $${tx2(EX.F)}\ ^\circ\text{F}$; (b) $\Delta T = ${tx2(EX.dT)}$ K, which is also $${tx2(EX.dT)}\ ^\circ\text{C}$.`,
  },
  practice: [
    mcq({
      id: 'feels-colder', difficulty: 1,
      prompt: 'A steel wrench and a wooden mallet have lain side by side on a workshop bench overnight, with the room at 15 °C. In the morning the steel feels much colder to your hand than the wood. Which explanation is right?',
      choices: [
        'Both are at 15 °C; steel conducts energy away from your warmer hand much faster, and your skin senses that loss',
        'The steel is colder than the wood: metals cool below the temperature of the room',
        'The steel holds more cold, and the cold flows into your hand',
        'The wood is warmer because, as an insulator, it keeps its own heat in',
      ],
      answer: 0,
      why: {
        1: 'Overnight, everything on the bench settles at the room’s temperature — that is thermal equilibrium. Nothing cools itself below its surroundings.',
        2: 'There is no substance called “cold”. Energy flows *out of your hand* into the steel; the cold you feel is that loss of energy.',
        3: 'An insulator slows heat flow, but the wood has had all night to settle at 15 °C like everything else. It feels warmer only because it draws energy from your skin slowly.',
      },
      hints: ['After a night on the same bench, what can you say about the temperatures of everything on it?', 'Your skin senses how fast energy leaves it, not the temperature of what it touches.'],
      teach: 'Bodies left together reach the same temperature; how cold something feels depends on how fast it conducts heat away from you.',
      explain: t`Both have reached **thermal equilibrium** with the room: 15 °C. Your hand, at about 33 °C, loses energy to both, but steel conducts heat a hundred times or more better than wood, so it pulls energy from your skin far faster — and that is what “cold” feels like.`,
      visual: bodiesPic({ bodies: [{ name: 'steel wrench', temp: '15 °C', color: 'ink3', w: 1.8, h: 0.45 }, { name: 'wooden mallet', temp: '15 °C', color: 'warn', w: 1.8, h: 0.45 }], gap: 0.9, caption: 'Both have lain on the same bench all night. Not to scale.' }),
    }),
    num({
      id: 'k-to-c', difficulty: 1,
      gen(r) {
        const [what, short, K] = r.pick(COLD);
        const C = +(K - C0).toFixed(2);
        return {
          prompt: t`${what} at ${tx2(K)} K at atmospheric pressure. What is this temperature in degrees Celsius?`,
          answer: C, tol: { rel: 0, abs: 0.2 },
          errors: [{ value: +(K + C0).toFixed(2), feedback: 'A Celsius number is *smaller* than the kelvin number by 273.15: subtract, don’t add.' }],
          hints: [t`$T_\text{C} = T_\text{K} - 273.15$.`],
          teach: 'Kelvin and Celsius have the same step size, so converting is just subtracting 273.15.',
          explain: t`$T_\text{C} = ${tx2(K)} - 273.15 = ${tx2(C)}\ ^\circ\text{C}$.`,
          visual: scalesPic({ cols: ['K', 'C'], marks: [ZERO, { K, name: short, cells: { K: `${tx2(K)} K`, C: '? °C' } }, ICE], caption: 'The kelvin scale starts at absolute zero; the Celsius scale puts its zero at the freezing point of water, 273.15 K higher. Heights to scale.' }),
        };
      },
    }),
    num({
      id: 'c-to-f', difficulty: 2,
      gen(r) {
        const [lead, short, C] = r.pick([
          ['In the International Standard Atmosphere, the air between 11 and 20 km altitude — where airliners cruise — sits at', 'cruise altitude', -56.5],
          ['Liquid nitrogen boils at', 'N₂ boils', -195.8],
          ['Liquid oxygen boils at', 'O₂ boils', -182.96],
          ['The lowest air temperature ever recorded at Earth’s surface, at Vostok Station, Antarctica, in 1983, was', 'Vostok, 1983', -89.2],
        ]);
        const F = cToF(C);
        const marks = [{ K: toK(C), name: short, cells: { C: `${String(C).replace('-', '−')} °C`, F: '? °F' } }, ICE, { K: toK(100), name: 'water boils', color: 'warn', cells: { C: '100 °C', F: '212 °F' } }];
        return {
          prompt: t`${lead} $${C}$ °C. What is this in degrees Fahrenheit?`,
          answer: +F.toFixed(2), tol: { rel: 0, abs: 0.3 },
          errors: [
            { value: +((5 / 9) * C + 32).toFixed(2), feedback: t`A Fahrenheit degree is *smaller* than a Celsius degree, so the same temperature change is a bigger number in °F: multiply by $\tfrac95$, not $\tfrac59$.` },
            { value: +(1.8 * C).toFixed(2), feedback: 'Don’t forget the offset: on the Fahrenheit scale water freezes at 32, not 0. Add 32.' },
            { value: +(1.8 * (C + 32)).toFixed(2), feedback: t`Multiply first, then add 32: $T_\text{F} = \tfrac95 T_\text{C} + 32$.` },
          ],
          hints: [t`$T_\text{F} = \tfrac95 T_\text{C} + 32$.`, 'Multiply by 1.8 first, then add 32.'],
          teach: 'A Fahrenheit degree is 5/9 of a Celsius degree, and the Fahrenheit scale puts water’s freezing point at 32.',
          explain: t`$T_\text{F} = 1.8\times(${C}) + 32 = ${tx2(1.8 * C)} + 32 = ${tx2(F)}\ ^\circ\text{F}$.`,
          visual: scalesPic({ cols: ['C', 'F'], marks, caption: 'Celsius and Fahrenheit side by side, heights to scale. Between water’s freezing and boiling points there are 100 Celsius degrees but 180 Fahrenheit degrees.' }),
        };
      },
    }),
    mcq({
      id: 'ratio-celsius', difficulty: 2,
      prompt: t`On Monday the air on the launch pad is 10 °C; on Tuesday it is 20 °C. A colleague says Tuesday is “twice as hot”. On the absolute (kelvin) scale — the one the gas laws use — by what factor did the temperature actually rise?`,
      choices: ['About 1.035', '2', 'About 1.36', '10'],
      answer: 0,
      why: {
        1: 'Doubling a Celsius number doubles nothing physical: the Celsius zero is just the freezing point of water, not zero temperature.',
        2: t`That is the Fahrenheit ratio, $68/50$. The Fahrenheit zero is just as arbitrary; only ratios of absolute temperatures mean anything.`,
        3: 'Ten degrees were *added*, not multiplied. Ratios need temperatures measured from absolute zero.',
      },
      hints: ['Convert both temperatures to kelvin.', t`Then divide: $\dfrac{293.15\ \text{K}}{283.15\ \text{K}}$.`],
      teach: 'Only temperatures measured from absolute zero — kelvin — can be compared as ratios.',
      explain: t`$T_1 = 283.15$ K and $T_2 = 293.15$ K, so $T_2/T_1 = 1.035$: a 3.5 % rise. It is this ratio that sets, for instance, how much the pressure in a sealed gas bottle rises (lesson M17.1).`,
      visual: scalesPic({ cols: ['K', 'C'], marks: [ZERO, ICE], range: [0, 300], caption: 'Where each scale puts its zero. Celsius starts at water’s freezing point; kelvin starts at absolute zero, 273.15 K below it.' }),
    }),
    num({
      id: 'delta-t', difficulty: 2,
      gen(r) {
        const Tc = r.pick([15, 18, 20, 22, 25, 28]);
        const dT = toK(Tc) - 77.36;
        return {
          prompt: t`A stainless steel propellant line is chilled from the test cell’s ${Tc} °C down to 77.36 K by flowing liquid nitrogen through it. By how many kelvin does its temperature fall?`,
          answer: +dT.toFixed(2), units: 'K', difference: true, tol: { rel: 0, abs: 0.2 },
          errors: [
            { value: +(Tc - 77.36).toFixed(2), feedback: 'You subtracted a kelvin temperature from a Celsius one. Put both on the same scale first.' },
            { value: +(toK(Tc) + 77.36).toFixed(2), feedback: 'The fall is the difference between the two temperatures, not their sum.' },
          ],
          hints: [t`Convert ${Tc} °C to kelvin first: add 273.15.`, 'Then subtract the final temperature, 77.36 K.'],
          teach: 'A temperature difference is the same number in kelvin and in Celsius degrees — but only once both temperatures are on the same scale.',
          explain: t`$${Tc}\ ^\circ\text{C} = ${tx2(toK(Tc))}$ K, so $\Delta T = ${tx2(toK(Tc))} - 77.36 = ${tx2(dT)}$ K. Equally, in Celsius: $${Tc} - (-195.79) = ${tx2(dT)}\ ^\circ\text{C}$.`,
          visual: scalesPic({ cols: ['K', 'C'], marks: [{ K: 77.36, name: 'LN₂ boils', cells: { K: '77.36 K', C: '−195.79 °C' } }, { K: toK(Tc), name: 'test cell', color: 'warn', cells: { K: '? K', C: `${Tc} °C` } }], bracket: { from: 77.36, to: toK(Tc), label: 'ΔT = ?' }, range: [60, 300] }),
        };
      },
    }),
    mcq({
      id: 'zeroth-law', difficulty: 2,
      prompt: 'A calibrated thermometer C is pressed against copper block A until its reading stops changing: 296.4 K. It is then pressed against aluminium block B, and again settles at 296.4 K. If A and B are now clamped together, insulated from everything else, what happens?',
      choices: [
        'No net energy flows between them: they are already in thermal equilibrium',
        'Energy flows from the copper to the aluminium, because copper conducts heat better',
        'Energy flows from the block with more internal energy to the one with less',
        'There is no way to know without putting them in contact and measuring',
      ],
      answer: 0,
      why: {
        1: 'Conductivity sets how *fast* heat would flow, not whether it flows. Heat flows only down a temperature difference.',
        2: 'A bigger block can hold far more internal energy at the same temperature, yet no heat flows between equal temperatures. Temperature, not energy content, decides the direction.',
        3: 'That is exactly what the zeroth law lets you skip: two bodies each in equilibrium with the same thermometer are in equilibrium with each other.',
      },
      hints: ['What does it mean that the thermometer’s reading stopped changing?', 'Zeroth law: two bodies each in equilibrium with a third are in equilibrium with each other.'],
      teach: 'The zeroth law: if A and B are each in thermal equilibrium with C, they are in equilibrium with each other — which is what makes thermometers meaningful.',
      explain: t`A steady reading means C reached equilibrium with each block, so each is at 296.4 K. By the **zeroth law**, A and B are in equilibrium with each other: clamped together, no net heat flows. (Atoms still trade energy back and forth across the contact; the two flows simply balance.)`,
      visual: bodiesPic({ bodies: [{ name: 'copper A', color: 'warn', w: 1.4 }, { name: 'thermometer C', temp: 'reads 296.4 K', color: 'ink3', w: 0.35, h: 1.3 }, { name: 'aluminium B', color: 'ink2', w: 1.4 }], gap: 1.2, caption: 'C was pressed against A, then against B, and settled at 296.4 K both times. Not to scale.' }),
    }),
    mcq({
      id: 'thermometer-size', difficulty: 3,
      prompt: t`You need the temperature of a 3-gram sample of liquid just taken from a cold bath. Which probe gives the reading closest to the sample’s temperature *before* the probe went in?`,
      choices: [
        'A thin thermocouple wire, whose tip has a tiny heat capacity',
        'A thick metal-sheathed probe, because metal reaches equilibrium quickly',
        'Any probe: once it reaches equilibrium it reads the sample’s original temperature',
        'A probe that starts as far as possible from the sample’s temperature, so the change is easy to see',
      ],
      answer: 0,
      why: {
        1: 'A fast response is good, but a thick probe has a large heat capacity: the energy it trades with a small sample shifts the sample’s temperature a lot.',
        2: 'Equilibrium is reached at a temperature *between* the two starting ones. The probe reads that shared temperature, which matches the original only if the probe barely disturbs the sample.',
        3: 'A bigger starting difference means more energy exchanged, and a bigger shift in the sample’s temperature.',
      },
      hints: ['A thermometer reads its own temperature — the one it shares with the sample at equilibrium.', 'Where does the shared temperature end up when the probe’s heat capacity is large next to the sample’s? Try the heat-capacity ratio in Explore.'],
      teach: 'A thermometer reads only its own temperature; it reports a sample’s fairly when its heat capacity is small next to the sample’s.',
      explain: t`At equilibrium probe and sample share a temperature between their starting values, weighted by heat capacity. A probe with a tiny heat capacity — a fine thermocouple junction — moves almost all the way to the sample’s temperature while hardly changing it. That is the Explore picture with $C_B/C_A$ small.`,
      visual: equilibriumGraph({ TA: 90, TB: 293, r: 1, tau: 1.5, names: ['sample', 'probe'], caption: 'A sample and a probe with equal heat capacities, starting at 90 K and 293 K, meet halfway. Insulated from everything else.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-webb', difficulty: 2, transfer: true,
      prompt: t`To see faint infrared light, the James Webb Space Telescope must keep its mirror and instruments colder than 50 K; its tennis-court-sized sunshield lets them cool there passively, 1.5 million kilometres from Earth. What is 50 K in degrees Fahrenheit?`,
      answer: +kToF(50).toFixed(2), tol: { rel: 0, abs: 0.5 },
      errors: [
        { value: cToF(50), feedback: 'You treated 50 K as 50 °C. Convert kelvin to Celsius first.' },
        { value: +(50 - C0).toFixed(2), feedback: t`That is the Celsius value. One more step: $T_\text{F} = \tfrac95 T_\text{C} + 32$.` },
        { value: +((5 / 9) * (50 - C0) + 32).toFixed(2), feedback: t`Multiply by $\tfrac95$, not $\tfrac59$: a Fahrenheit degree is the smaller step.` },
      ],
      hints: ['Two steps: kelvin to Celsius, then Celsius to Fahrenheit.'],
      teach: 'From kelvin to Fahrenheit: subtract 273.15, then multiply by 9/5 and add 32.',
      explain: t`$50 - 273.15 = -223.15\ ^\circ\text{C}$, and $\tfrac95(-223.15) + 32 = ${tx2(kToF(50))}\ ^\circ\text{F}$ — NASA rounds it to −370 °F.`,
      visual: scalesPic({ cols: ['K', 'C', 'F'], marks: [ZERO, { K: 50, name: 'Webb’s limit', color: 'accent', cells: { K: '50 K', C: '?', F: '?' } }, ICE], caption: 'Three scales, heights to scale. Webb’s limit sits just 50 kelvins above absolute zero.' }),
    }),
    mcq({
      id: 'cp-frost', difficulty: 2,
      prompt: 'Within minutes of liquid oxygen starting to flow through an uninsulated steel line, a thick layer of frost grows on its outside. Which description is physically right?',
      choices: [
        'Energy flows from the moist air into the cold line; water vapour that loses enough energy freezes onto it',
        'Cold flows out of the line into the air and freezes the water vapour',
        'Nothing flows: the line is simply below 0 °C, so ice appears on it',
        'The cold line attracts water vapour, which freezes because the pressure there is high',
      ],
      answer: 0,
      why: {
        1: 'There is no “cold” to flow out. Energy flows *in*, from the warmer air and vapour to the colder steel.',
        2: 'A low temperature alone does nothing. Vapour freezes only if energy leaves it — and that energy goes into the line, as heat.',
        3: 'No attraction or pressure is involved: vapour that touches the cold surface loses energy to it and freezes there.',
      },
      hints: ['Heat always flows from hotter to colder. Which is hotter here?'],
      teach: 'Heat flows from hot to cold: a cold object never gives out “cold” — warmer things lose energy to it.',
      explain: t`The air and its water vapour (about 293 K) are hotter than the line (about 90 K), so energy flows **into** the line. Vapour touching the surface gives up energy and freezes. Every joule the air and frost deliver ends up warming the LOX — which is why cryogenic lines are insulated.`,
      visual: pipePic({ caption: 'A LOX line seen end-on, with the frost that forms on it. Not to scale.' }),
    }),
    num({
      id: 'cp-two-blocks', difficulty: 2,
      gen(r) {
        const Tc = r.pick([15, 20, 25, 30]), T2 = r.pick([77.4, 90.2, 120, 150]);
        const T1 = toK(Tc), Tf = (T1 + T2) / 2;
        return {
          prompt: t`Two identical aluminium blocks — same mass, same alloy — are clamped together in a vacuum chamber, insulated from everything else. One starts at ${Tc} °C, the other at ${T2} K. Treating aluminium’s specific heat as constant, what common temperature do they reach, in kelvin?`,
          answer: +Tf.toFixed(2), units: 'K', tol: { rel: 0, abs: 0.3 },
          errors: [
            { value: +((Tc + T2) / 2).toFixed(2), feedback: 'You averaged a Celsius number with a kelvin number. Convert first.' },
            { value: +(Tf - C0).toFixed(2), feedback: 'That is the answer in °C; the box asks for kelvin.' },
          ],
          hints: ['Identical blocks have identical heat capacities: the energy one loses, the other gains, so their temperatures change by equal amounts.', 'Put both temperatures in kelvin, then take the midpoint.'],
          teach: 'Two identical bodies meet exactly halfway — once both temperatures are on one scale.',
          explain: t`$${Tc}\ ^\circ\text{C} = ${tx2(T1)}$ K. Equal heat capacities mean equal and opposite temperature changes, so they meet at the midpoint: $(${tx2(T1)} + ${T2})/2 = ${tx2(Tf)}$ K. (Real aluminium’s specific heat falls by a third or more at these low temperatures, so the real blocks would meet somewhat warmer.)`,
          visual: bodiesPic({ bodies: [{ name: 'block 1', temp: `${Tc} °C`, color: 'warn' }, { name: 'block 2', temp: `${T2} K`, color: 'accent' }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: 'Two identical blocks, clamped together in vacuum. Not to scale.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §1.1 Temperature and Thermal Equilibrium', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-1-temperature-and-thermal-equilibrium' },
    { label: 'OpenStax University Physics Vol. 2, §1.2 Thermometers and Temperature Scales', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-2-thermometers-and-temperature-scales' },
    { label: 'NIST Chemistry WebBook: thermophysical properties of fluids (boiling points)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
    { label: 'NASA: Webb’s sunshield (below 50 K, about −370 °F)', url: 'https://science.nasa.gov/mission/webb/webbs-sunshield' },
  ],
});
