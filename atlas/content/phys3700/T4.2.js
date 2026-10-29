// Refrigerators by entropy bookkeeping: COP ≤ T_c/(T_h − T_c); the cost of
// cold rising without limit toward absolute zero; real cryocoolers; throttling
// at constant enthalpy and the Joule–Thomson inversion temperature; the least
// work to liquefy a gas, W = T₀Δs − Δh, for hydrogen, oxygen and nitrogen.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart } from './_count.js';
import { JT, LIQUEFY, liqWork } from './_phase.js';

const t = String.raw;
const flowF = (Qh, Qc, W, labels, caption, device = 'fridge') => ({ type: 'therm-pv', params: { mode: 'flow', device, Qh, Qc, W, labels }, caption });
// the least work per joule of heat lifted, against the cold temperature (log–log)
const MARKS = [[255, 'freezer', -52, -6], [90.19, 'LOX', 6, 10], [77.35, 'LN₂', -26, -8], [20.27, 'LH₂', 6, -8], [4.22, 'LHe', 6, -8]];
function costPic({ Th = 300, mark = null, caption, labels = true } = {}) {
  return {
    type: 'graph',
    params: { x: [0, 2.48], y: [-1, 2.2], aspect: 'wide', xlog: true, ylog: true, xlabel: 'cold temperature (K)', ylabel: 'least work per joule lifted', axesAt: 'edge',
      curves: [{ fn: `log10(${Th}/10^x - 1)`, domain: [0, 2.46], color: 'accent' }],
      points: [...(labels ? MARKS.map(([T, n, dx, dy]) => ({ x: r4(Math.log10(T)), y: r4(Math.log10(Th / T - 1)), r: 4, color: 'ink2', label: n, labelDx: dx, labelDy: dy })) : []),
        ...(mark ? [{ x: r4(Math.log10(mark)), y: r4(Math.log10(Th / mark - 1)), r: 6, color: 'gold' }] : [])] },
    caption: caption ?? `The least work needed to pump one joule of heat out of a space at the cold temperature and into surroundings at ${Th} K, on log–log axes: Tₕ/T − 1.`,
  };
}

const N2 = { dh: 32.09, cp: 1.041 };
const T1 = 300, dh = N2.dh, T2 = T1 - dh / N2.cp, P2 = 1;     // kJ/kg: h(300 K, 1 bar) − h(300 K, 200 bar); kJ/(kg K) near 1 bar (NIST, via the reference equation)
const EX = { g: 'H2', T0: 300 };
EX.W = liqWork('H2', EX.T0); EX.kWh = EX.W / 3.6e6; EX.TdS = EX.T0 * LIQUEFY.H2.ds;

export default lesson({
  id: 'phys3700.T4.2',
  title: 'Refrigerators',
  minutes: 14, difficulty: 3,
  intro: t`A refrigerator is an engine run backwards: work $W$ pumps heat $Q_c$ out of a cold space and dumps $Q_h = Q_c + W$ into warmer surroundings. Heat leaving the cold space carries entropy $Q_c/T_c$; at least that much must arrive in the surroundings as $Q_h/T_h$. So the coefficient of performance — heat lifted per unit of work — is capped:

$$\text{COP} = \frac{Q_c}{W} \le \frac{T_c}{T_h - T_c}.$$

([PHYS 2210 M19.2](#/lesson/phys2210.M19.2) introduced the coefficients; this is their ceiling from entropy.) The cap falls toward zero as $T_c$ does: each joule pumped out at 4 K costs at least 70 J of work, and **absolute zero would cost infinitely much**. Real cryogenics adds a second idea: a gas forced through a valve keeps its enthalpy, and whether it cools or warms depends on which side of its **inversion temperature** it starts.`,
  symbols: [
    { tex: '\\text{COP}', text: 'coefficient of performance of a refrigerator: heat removed from the cold space per joule of work' },
    { tex: 'Q_c', text: 'heat removed from the cold space per cycle (or per second), J (or W)' },
    { tex: 'W', text: 'work (usually electrical) supplied, J (or W)' },
    { tex: 'T_c,\\ T_h', text: 'temperatures of the cold space and of the surroundings that receive the heat, in kelvin' },
  ],
  why: 'Cryogenic propellants, superconducting magnets and infrared space telescopes all live or die by this cost of cold — and liquefying hydrogen is the biggest energy bill of a hydrogen rocket or aircraft.',
  visual: {
    type: 'graph',
    title: 'The price of cold',
    lead: t`The least work needed to pump one joule of heat out of a cold space, against the cold temperature, on log–log axes. The marks are a freezer and the boiling points of liquid oxygen, nitrogen, hydrogen and helium. Slide the cold temperature and the surroundings’ temperature.`,
    tasks: [
      'At a freezer’s 255 K a joule of work moves several joules of heat: COP above 1.',
      'At liquid hydrogen’s 20 K each joule removed costs about 14 J of work; at liquid helium’s 4.2 K about 70 J.',
      'Hotter surroundings (a sunlit radiator, a hot desert) raise the whole curve.',
    ],
    params: {
      x: [0, 2.48], y: [-1, 2.2], aspect: 'wide', xlog: true, ylog: true, xlabel: 'cold temperature (K)', ylabel: 'least work per joule lifted', axesAt: 'edge',
      sliders: [
        { key: 'Tc', label: 'Cold space $T_c$', min: 2, max: 290, step: 0.5, value: 20, logScale: true, unit: '\\text{K}', explain: 'The temperature you are keeping cold.' },
        { key: 'Th', label: 'Surroundings $T_h$', min: 250, max: 330, step: 5, value: 300, unit: '\\text{K}', explain: 'Where the heat is dumped: room air, a radiator.' },
      ],
      curves: [{ fn: 'log10(Th/10^x - 1)', domain: [0, 'log10(Th) - 0.02'], color: 'accent' }],
      points: [...MARKS.map(([T, n, dx, dy]) => ({ x: r4(Math.log10(T)), y: `log10(Th/${T} - 1)`, r: 4, color: 'ink2', label: n, labelDx: dx, labelDy: dy })),
        { x: 'log10(Tc)', y: 'log10(Th/Tc - 1)', r: 6, color: 'gold' }],
      readouts: [
        { label: 'COP limit $T_c/(T_h - T_c)$', expr: 'Tc/(Th - Tc)', digits: 3 },
        { label: 'least work per J lifted', expr: 'Th/Tc - 1', digits: 3 },
      ],
    },
    caption: 'Reversible (Carnot) refrigerators only. Real machines need several times more work — at 4 K, about a hundred times more.',
  },
  example: {
    prompt: t`What is the least work needed to liquefy 1 kg of hydrogen, starting from gas at $${EX.T0}$ K and 1 atm and ending as liquid at its boiling point, with the surroundings at $${EX.T0}$ K? From NIST’s hydrogen tables: cooling and condensing removes $\Delta h = ${fmt(LIQUEFY.H2.dh / 1e6, 4)}$ MJ/kg of enthalpy and $\Delta s = ${fmt(LIQUEFY.H2.ds / 1e3, 4)}$ kJ/(kg·K) of entropy.`,
    visual: costPic({ caption: 'The least work per joule lifted climbs steeply as the gas cools: the last joules, removed near 20 K, are the most expensive.', mark: 20.27 }),
    steps: [
      { label: 'Entropy budget', text: t`The hydrogen loses entropy $\Delta s$. A reversible liquefier sends it all to the surroundings, as heat $Q_\text{out} = T_0\Delta s = (${EX.T0})(${fmt(LIQUEFY.H2.ds, 5)}) = ${fmt(EX.TdS / 1e6, 4)}$ MJ per kg.` },
      { label: 'Energy budget', text: t`That heat comes from the hydrogen’s enthalpy drop plus the work put in: $Q_\text{out} = \Delta h + W$. So $W_\text{min} = T_0\Delta s - \Delta h$.` },
      { label: 'Numbers', text: t`$W_\text{min} = ${fmt(EX.TdS / 1e6, 4)} - ${fmt(LIQUEFY.H2.dh / 1e6, 4)} = ${fmt(EX.W / 1e6, 4)}$ MJ/kg $= ${fmt(EX.kWh, 3)}$ kWh/kg.` },
      { label: 'Compare', text: t`Burning a kilogram of hydrogen releases about 120 MJ (lower heating value), so even a perfect liquefier spends $${fmt((100 * EX.W) / 120e6, 2)}\,\%$ of the fuel’s energy. Real plants need several times this, and must also convert ortho- to para-hydrogen (heat released inside the cold box), which raises the minimum further.` },
      { label: 'Sense check', text: t`$T_0\Delta s$ is four times $\Delta h$: most of the cost is entropy, not energy. Nitrogen, liquefied at a much higher temperature, needs only about $${fmt(liqWork('N2') / 1e6, 2)}$ MJ/kg.` },
    ],
    answer: t`$W_\text{min} = T_0\Delta s - \Delta h = ${fmt(EX.W / 1e6, 4)}$ MJ/kg, about $${fmt(EX.kWh, 3)}$ kWh per kilogram.`,
  },
  practice: [
    num({
      id: 'pump-Sgen', difficulty: 2,
      gen(r) {
        const Tc = r.pick([268, 273, 278]), Th = r.pick([308, 313, 318]), W = r.pick([1, 2]), cop = r.pick([3, 3.5, 4]);
        const Qh = W * (cop + 1), Qc = W * cop, S = (Qh / Th - Qc / Tc) * 1000;
        return {
          prompt: t`A heat pump draws $${W}$ kW of electricity, takes heat from outdoor air at $${Tc}$ K, and delivers $${Qh}$ kW into a house at $${Th}$ K. At what rate does it generate entropy? Give it in W/K.`,
          answer: S, units: 'W/K', tol: { rel: 0.01 },
          errors: apart([{ value: (Qh / Th) * 1000, feedback: t`Subtract the entropy taken from the outdoor air, $Q_c/T_c$, with $Q_c = Q_h - W$.` }, { value: (Qc / Tc - Qh / Th) * 1000, feedback: t`Sign: the house gains entropy $Q_h/T_h$; the outdoors loses $Q_c/T_c$.` }], S),
          hints: [t`$Q_c = Q_h - W = ${Qc}$ kW.`, t`$\dot S_\text{gen} = Q_h/T_h - Q_c/T_c$.`],
          teach: 'For a refrigerator or heat pump the entropy delivered as heat must at least match the entropy taken.',
          explain: t`$\dot S_\text{gen} = ${Qh * 1000}/${Th} - ${Qc * 1000}/${Tc} = ${fmt(S, 3)}$ W/K. Positive, so it is allowed; its COP as a heater, $${fmt(Qh / W, 3)}$, is below the limit $T_h/(T_h - T_c) = ${fmt(Th / (Th - Tc), 3)}$.`,
          visual: flowF(Qh, Qc, W, { Qh: `Q_h = ${Qh} kW`, Qc: 'Q_c = ?', W: `W = ${W} kW`, hot: `house, ${Th} K`, cold: `outdoors, ${Tc} K`, device: 'heat pump' }, 'The heat pump’s flows per second, widths to scale.', 'pump'),
        };
      },
    }),
    num({
      id: 'intercept', difficulty: 3,
      gen(r) {
        const Tlow = r.pick([4.2, 2]), Tmid = r.pick([50, 77]), Th = 300, ratio = (Th / Tlow - 1) / (Th / Tmid - 1);
        return {
          prompt: t`An infrared detector sits at $${Tlow}$ K inside a radiation shield at $${Tmid}$ K. Each watt of heat leak that the shield intercepts, instead of letting it reach the detector stage, saves refrigeration work. With the room at $${Th}$ K, how many times more work (at the Carnot limit) does it cost to remove a watt at $${Tlow}$ K than at $${Tmid}$ K?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: apart([{ value: Tmid / Tlow, feedback: t`Compare the work per watt, $T_h/T_c - 1$, at each stage — not just the temperatures.` }, { value: (Tmid / Tlow) ** 2, feedback: t`The cost per watt goes as $T_h/T_c - 1$, not as a square.` }], ratio),
          hints: [t`Least work per watt removed at $T$: $T_h/T - 1$.`, t`Ratio $= (${Th}/${Tlow} - 1)/(${Th}/${Tmid} - 1)$.`],
          teach: 'Intercept heat at the warmest stage you can: cold watts cost far more.',
          explain: t`$(${Th}/${Tlow} - 1)/(${Th}/${Tmid} - 1) = ${fmt(Th / Tlow - 1, 3)}/${fmt(Th / Tmid - 1, 3)} = ${fmt(ratio, 3)}$. That is why cryostats and space telescopes nest shields at intermediate temperatures.`,
          visual: costPic({ mark: Tlow, caption: 'Least work per joule lifted against cold temperature (log–log); gold: the detector stage.' }),
        };
      },
    }),
    mcq({
      id: 'throttle-sign', difficulty: 2,
      prompt: t`Nitrogen at 300 K cools when it is throttled from 200 bar to 1 bar, but hydrogen at 300 K **warms** slightly. Why?`,
      choices: [
        'Throttling keeps enthalpy fixed; each gas cools only below its inversion temperature — about 620 K for nitrogen but only about 200 K for hydrogen',
        'Hydrogen molecules are lighter, so they speed up in the valve',
        'Hydrogen reacts with the valve and releases heat',
        'Throttling always warms a gas; nitrogen only looks colder because it starts to liquefy',
      ],
      answer: 0,
      why: { 1: 'Molecular mass alone does not set the sign; helium (heavier than hydrogen) warms too. What matters is the balance of attraction and repulsion between molecules at that temperature.', 2: 'No reaction is involved; it is a property of the gas’s equation of state.', 3: 'Throttling can cool or warm; at 300 K nitrogen cools by about 30 K without liquefying.' },
      hints: ['Throttling conserves H = U + PV. When does that force the temperature down?'],
      teach: 'A throttled real gas cools only below its Joule–Thomson inversion temperature.',
      explain: t`At constant enthalpy, attraction between molecules makes the gas cool as they move apart; at high temperature the repulsive part wins and it warms. The crossover — the inversion temperature — is about ${JT.N2.Tinv} K for nitrogen, ${JT.H2.Tinv} K for hydrogen and ${JT.He.Tinv} K for helium at low pressure (NIST data). Hydrogen and helium must be precooled before a throttle can liquefy them.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 3.05], aspect: 'wide', xlog: false, xlabel: '', ylabel: 'inversion temperature (log scale)', xticks: 0, ylog: true, axesAt: 'edge',
        shade: [{ fn: r4(Math.log10(JT.N2.Tinv)), from: 0.5, to: 1.5, color: 'accent', alpha: 0.6 }, { fn: r4(Math.log10(JT.O2.Tinv)), from: 1.75, to: 2.75, color: 'teal', alpha: 0.6 }, { fn: r4(Math.log10(JT.H2.Tinv)), from: 3, to: 4, color: 'warn', alpha: 0.6 }, { fn: r4(Math.log10(JT.He.Tinv)), from: 4.1, to: 4.9, color: 'violet', alpha: 0.6 }],
        hlines: [{ y: r4(Math.log10(300)), label: 'room, 300 K', color: 'gold' }],
        points: [{ x: 1, y: 0.25, r: 0.01, color: 'ink', label: 'N₂', labelDx: -8 }, { x: 2.25, y: 0.25, r: 0.01, color: 'ink', label: 'O₂', labelDx: -8 }, { x: 3.5, y: 0.25, r: 0.01, color: 'ink', label: 'H₂', labelDx: -8 }, { x: 4.5, y: 0.25, r: 0.01, color: 'ink', label: 'He', labelDx: -8 }] },
        caption: 'Low-pressure Joule–Thomson inversion temperatures (from the NIST reference equations, rounded), on a log scale. Gases whose bar ends below room temperature warm when throttled from room temperature.' },
    }),
    num({
      id: 'throttle-N2', difficulty: 3,
          prompt: t`Nitrogen at $${T1}$ K and $200$ bar is throttled to $${P2}$ bar (no heat, no work, so $h$ is unchanged). From NIST’s tables, at $${T1}$ K the specific enthalpy at 200 bar is $${dh}$ kJ/kg **lower** than at 1 bar, and near 1 bar $c_P = ${N2.cp}$ kJ/(kg·K). What temperature does the gas leave at?`,
          answer: T2, units: 'K', tol: { abs: 0.6, rel: 0 },
          errors: apart([{ value: T1 + dh / N2.cp, feedback: 'The gas leaves with the low enthalpy it had at 200 bar: at 1 bar that enthalpy belongs to a lower temperature.' }, { value: T1, feedback: 'An ideal gas would stay at 300 K; real nitrogen’s enthalpy depends on pressure.' }], T2),
          hints: [t`At 1 bar the gas must reach an enthalpy $${dh}$ kJ/kg below $h(300\ \text{K}, 1\ \text{bar})$.`, t`$\Delta T = -\Delta h/c_P = -${dh}/${N2.cp}$.`],
          teach: 'Throttling conserves enthalpy; real-gas enthalpy depends on pressure, so the temperature changes.',
          explain: t`$T_2 = ${T1} - ${dh}/${N2.cp} = ${fmt(T2, 4)}$ K — a drop of about 31 K. (The full reference equation gives 269.2 K.) Linde’s liquefier repeats this, precooling the incoming gas with the cold outgoing gas until some of it liquefies.`,
          visual: { type: 'graph', params: { x: [0, 210], y: [255, 305], aspect: 'wide', xlabel: 'pressure (bar)', ylabel: 'temperature (K)', axesAt: 'edge', points: [{ x: 200, y: 300, r: 5, color: 'warn', label: 'in: 200 bar, 300 K', labelDx: -140, labelDy: -10 }, { x: 1, y: 300, r: 4, color: 'ink3', label: 'ideal-gas expectation', labelDx: 8, labelDy: -10 }], arrows: [{ from: [200, 300], to: [6, 300], color: 'ink3', dash: true }] }, caption: 'Nitrogen entering the valve. Where does it leave on the 1-bar line? (An ideal gas would leave at the same temperature.)' },
    }),
    num({
      id: 'liquefy-N2', difficulty: 2,
      gen(r) {
        const T0 = r.pick([290, 300, 310]), W = liqWork('N2', T0) / 1e3;
        return {
          prompt: t`What is the least work needed to liquefy 1 kg of nitrogen, from gas at 300 K and 1 atm to liquid at its boiling point, if the plant rejects heat at $${T0}$ K? Cooling and condensing it removes $\Delta h = ${fmt(LIQUEFY.N2.dh / 1e3, 4)}$ kJ/kg and $\Delta s = ${fmt(LIQUEFY.N2.ds / 1e3, 4)}$ kJ/(kg·K) (NIST).`,
          answer: W, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: LIQUEFY.N2.dh / 1e3, feedback: 'That is the heat to remove, not the work. Entropy must also be dumped at T₀.' }, { value: (T0 * LIQUEFY.N2.ds) / 1e3, feedback: t`Subtract $\Delta h$: the gas’s own enthalpy drop supplies part of the heat dumped.` }], W),
          hints: [t`$W_\text{min} = T_0\Delta s - \Delta h$.`],
          teach: t`The least work to liquefy is the change in exergy: $T_0\Delta s - \Delta h$.`,
          explain: t`$W_\text{min} = (${T0})(${fmt(LIQUEFY.N2.ds / 1e3, 4)}) - ${fmt(LIQUEFY.N2.dh / 1e3, 4)} = ${fmt(W, 4)}$ kJ/kg, about $${fmt(W / 3600, 3)}$ kWh.`,
          visual: costPic({ mark: 77.35, caption: 'Least work per joule lifted against cold temperature (log–log): nitrogen’s boiling point marked in gold.' }),
        };
      },
    }),
    mcq({
      id: 'absolute-zero', difficulty: 2,
      prompt: 'Why can no refrigerator cool anything all the way to absolute zero?',
      choices: [
        t`The least work per joule removed, $T_h/T_c - 1$, grows without limit as the cold temperature falls`,
        'Molecules stop moving at absolute zero, so there is nothing left to remove',
        'Refrigerants freeze before reaching it',
        'Energy conservation forbids it',
      ],
      answer: 0,
      why: { 1: 'Quantum zero-point motion remains even at 0 K, but that is not why refrigeration stalls.', 2: 'A practical problem for some machines, but adiabatic demagnetization and laser cooling use no refrigerant and still cannot reach 0 K.', 3: 'Energy could be conserved at any temperature; the obstacle is entropy.' },
      hints: ['Look at the price-of-cold curve as the cold temperature heads to zero.'],
      teach: 'The cost of cold diverges as T → 0: the third law in engineering form.',
      explain: t`Each joule removed at $T_c$ carries entropy $1/T_c$, which must be dumped at $T_h$ as heat $T_h/T_c$. As $T_c \to 0$ that, and so the work, diverges. Every cooling step gets you a fraction closer, never there — one statement of the third law.`,
      visual: costPic({ caption: 'The least work per joule lifted, on log–log axes, keeps rising as the cold temperature falls toward zero.' }),
    }),
    num({
      id: 'real-fraction', difficulty: 2,
      gen(r) {
        const Q = r.pick([1, 1.5]), P = r.pick([7, 7.5, 8]), Tc = 4.2, Th = 300;
        const cop = Q / (P * 1000), carnot = Tc / (Th - Tc), f = (100 * cop) / carnot;
        return {
          prompt: t`A two-stage cryocooler lifts $${Q}$ W at $${Tc}$ K while its compressor draws $${P}$ kW (typical of commercial coolers), rejecting heat at $${Th}$ K. What percentage of the Carnot COP does it reach?`,
          answer: f, units: '%', tol: { rel: 0.01 },
          errors: apart([{ value: 100 * cop, feedback: t`That is its COP as a percentage. Divide by the Carnot COP, $T_c/(T_h - T_c)$.` }, { value: (100 * cop) / (Tc / Th), feedback: t`The Carnot COP is $T_c/(T_h - T_c)$, not $T_c/T_h$.` }], f),
          hints: [t`COP $= ${Q}/${P * 1000}$.`, t`Carnot COP $= ${Tc}/(${Th} - ${Tc}) = ${fmt(carnot, 3)}$.`],
          teach: 'Real coolers near 4 K reach only about a per cent of the Carnot limit.',
          explain: t`COP $= ${texNum(cop, 3)}$; Carnot $= ${fmt(carnot, 3)}$; ratio $${fmt(f, 3)}\,\%$. Friction in the regenerators and imperfect heat exchange cost dearly at low temperature, where every entropy leak is magnified by $T_h/T_c$.`,
          visual: flowF(r4(Q + P * 1000), Q, P * 1000, { Qh: 'Q_h ≈ W', Qc: `Q_c = ${Q} W`, W: `W = ${P} kW`, hot: `room, ${Th} K`, cold: `cold head, ${Tc} K`, device: 'cryocooler' }, 'The cryocooler’s flows: the heat lifted is too small to see beside the work.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lox', difficulty: 3, transfer: true,
      gen(r) {
        const T0 = r.pick([290, 300, 310]), W = liqWork('O2', T0) / 1e3;
        return {
          prompt: t`A launch site makes its own liquid oxygen. What is the least work to liquefy 1 kg of oxygen, from gas at 300 K and 1 atm to liquid at its boiling point (90.2 K), rejecting heat at $${T0}$ K? Cooling and condensing it removes $\Delta h = ${fmt(LIQUEFY.O2.dh / 1e3, 4)}$ kJ/kg and $\Delta s = ${fmt(LIQUEFY.O2.ds / 1e3, 4)}$ kJ/(kg·K) (NIST). (Separating the oxygen from air costs extra and is not included.)`,
          answer: W, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: LIQUEFY.O2.dh / 1e3, feedback: 'That is the enthalpy to remove; the least work is T₀Δs − Δh.' }, { value: (T0 * LIQUEFY.O2.ds) / 1e3, feedback: 'Subtract Δh.' }], W),
          hints: [t`$W_\text{min} = T_0\Delta s - \Delta h$.`, t`$T_0\Delta s = (${T0})(${fmt(LIQUEFY.O2.ds / 1e3, 4)})$ kJ/kg.`],
          teach: 'Least liquefaction work: dump the entropy at the surroundings’ temperature, minus the enthalpy the gas gives up.',
          explain: t`$W_\text{min} = ${fmt((T0 * LIQUEFY.O2.ds) / 1e3, 4)} - ${fmt(LIQUEFY.O2.dh / 1e3, 4)} = ${fmt(W, 4)}$ kJ/kg, about $${fmt(W / 3600, 2)}$ kWh/kg — some twenty times less than hydrogen, because oxygen boils at 90 K, not 20 K.`,
          visual: costPic({ mark: 90.19, caption: 'Least work per joule lifted against cold temperature (log–log); gold: oxygen’s boiling point.' }),
        };
      },
    }),
    num({
      id: 'cp-zbo', difficulty: 3, transfer: true,
      gen(r) {
        const Q = r.pick([20, 50, 100]), Th = r.pick([230, 250, 270]), Tc = 90.19, W = Q * (Th / Tc - 1);
        return {
          prompt: t`On a long Mars mission, a cryocooler keeps a liquid-oxygen tank (at its boiling point, $90.2$ K) from boiling off by removing the $${Q}$ W that leaks in. It rejects heat from a radiator at $${Th}$ K. What is the least electrical power it needs?`,
          answer: W, units: 'W', tol: { rel: 0.01 },
          errors: apart([{ value: Q * (Th / Tc), feedback: t`The heat rejected is $Q_cT_h/T_c$; the work is that minus $Q_c$.` }, { value: Q * (300 / Tc - 1), feedback: `Use the radiator’s temperature, ${Th} K.` }, { value: Q * (Tc / (Th - Tc)), feedback: 'That is the heat lifted per watt (the COP limit), not the watts needed.' }], W),
          hints: [t`Entropy $Q_c/T_c$ leaves the tank; at least that much must reach the radiator as heat $Q_h/T_h$.`, t`$W_\text{min} = Q_c(T_h/T_c - 1)$.`],
          teach: t`Zero-boil-off cooling costs at least $Q_c(T_h/T_c - 1)$; a colder radiator helps.`,
          explain: t`$W_\text{min} = ${Q}(${Th}/90.2 - 1) = ${fmt(W, 3)}$ W. A real cooler at this temperature might need four or five times that — still often lighter than carrying the boil-off.`,
          visual: costPic({ Th, mark: 90.19, caption: 'Least work per joule lifted for this radiator temperature (log–log); gold: liquid oxygen.' }),
        };
      },
    }),
    mcq({
      id: 'cp-helium', difficulty: 3,
      prompt: 'A helium liquefier ends with a throttling valve, but the helium reaching that valve must already be very cold. Below roughly what temperature must it be for the throttle to cool it at all?',
      choices: ['About 45 K, helium’s inversion temperature', 'About 4.2 K, its boiling point', 'About 200 K, as for hydrogen', 'Any temperature below room temperature'],
      answer: 0,
      why: { 1: 'At 4.2 K it is already liquefied; throttling starts working well above that.', 2: 'That is hydrogen’s inversion temperature; helium’s is much lower.', 3: 'At room temperature helium warms when throttled.' },
      hints: ['Throttling cools only below the inversion temperature.', 'Hydrogen’s inversion temperature is about 200 K; helium’s attraction between atoms is far weaker still.'],
      teach: 'Helium must be precooled below about 45 K (expansion engines, liquid nitrogen, or liquid hydrogen) before a Joule–Thomson valve can cool it.',
      explain: t`Helium’s low-pressure inversion temperature is about ${JT.He.Tinv} K. Kamerlingh Onnes first liquefied it in 1908 by precooling with liquid hydrogen; modern liquefiers use expansion turbines, which cool any gas because the gas does work.`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 2.6], aspect: 'wide', ylog: true, xlabel: '', xticks: 0, ylabel: 'temperature (log scale)', axesAt: 'edge', hlines: [{ y: r4(Math.log10(300)), label: 'room', color: 'ink3' }, { y: r4(Math.log10(4.22)), label: 'helium boils, 4.2 K', color: 'violet' }], points: [{ x: 1.5, y: 1.2, r: 0.01, color: 'gold', label: 'throttle cools helium only below ?', labelDx: -100 }] }, caption: 'A temperature ladder on a log scale: where must helium be before a throttle can cool it?' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §4.2–4.4', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook, Thermophysical Properties of Fluid Systems (hydrogen, nitrogen, oxygen, helium)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
  ],
});
