// Phase changes and latent heat: Q = mL, the flat steps of a heating curve,
// and boil-off — the heat that leaks into a cryogenic tank becomes vapour.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { LN2, LOX, WATER, ssEnthalpy, heatingCurve, waterSegs, vesselPic, bodiesPic, apart } from './_thermal.js';

const t = String.raw;
const LF = WATER.Lf / 1000, LVW = WATER.Lv / 1000;              // 334 and 2257 kJ/kg
const LVN = LN2.Lv / 1000, LVO = LOX.Lv / 1000;                // 199 and 213 kJ/kg

// one kilogram of nitrogen: liquid at 65 K, boiling at 77.36 K, gas warmed to 300 K
const N = { T0: 65, Tb: LN2.Tb, cL: 2.04, cG: 1.04 };
N.Q1 = N.cL * (N.Tb - N.T0);                  // 25.2 kJ
N.Q2 = N.Q1 + LVN;                            // 224.2 kJ
N.Q3 = N.Q2 + N.cG * (300 - N.Tb);            // 455.8 kJ
const nT = (q) => `${N.T0} + min(max(${q}, 0), ${N.Q1.toFixed(4)})/${N.cL} + min(max(${q} - ${N.Q2.toFixed(4)}, 0), ${(N.Q3 - N.Q2).toFixed(4)})/${N.cG}`;

// the worked example: chilling a stainless valve assembly with liquid nitrogen
const EX = { m: 25 };
EX.q = ssEnthalpy(LN2.Tb, 293.15) / 1000;     // 83.3 kJ/kg (NIST's c(T) for 304, integrated)
EX.Q = EX.m * EX.q;                            // 2082 kJ
EX.mN = EX.Q / LVN;                            // 10.5 kg
EX.V = (EX.mN / LN2.rho) * 1000;               // 13.0 L
EX.gas = N.cG * (293.15 - LN2.Tb);             // 224 kJ/kg more if the vapour leaves warm
EX.mN2 = EX.Q / (LVN + EX.gas);                // 4.9 kg

export default lesson({
  id: 'phys2210.M16.4',
  title: 'Phase changes and latent heat',
  minutes: 10, difficulty: 2,
  intro: t`While a substance melts or boils, the heat you add goes into pulling molecules apart, not into making them move faster — so **the temperature stays fixed until the change is complete**. The heat needed per kilogram is the **latent heat**:

$$Q = mL$$

Water needs 334 kJ/kg to melt and 2257 kJ/kg to boil — over five times the 418 kJ/kg that warms it from 0 to 100 °C. Liquid nitrogen boils at 77.4 K with $L_v = 199$ kJ/kg; liquid oxygen at 90.2 K with 213 kJ/kg. Every joule that leaks into a cryogenic tank boils some propellant away: that is **boil-off**, and it is why fuelled rockets vent white plumes on the pad.`,
  symbols: [
    { tex: 'Q', text: 'the heat that flows in (or out, when vapour condenses or liquid freezes), in joules (J)' },
    { tex: 'm', text: 'the mass that changes phase, in kilograms (kg)' },
    { tex: 'L', text: 'the latent heat, in J/kg: $L_f$ (fusion) for melting or freezing, $L_v$ (vaporization) for boiling or condensing. Water: $L_f = 334$ kJ/kg, $L_v = 2257$ kJ/kg; nitrogen: $L_v = 199$ kJ/kg; oxygen: $L_v = 213$ kJ/kg' },
    { tex: 'T_b', text: 'the boiling point, where the change happens; it depends on pressure. At one atmosphere: water 373.15 K (100 °C), oxygen 90.19 K, nitrogen 77.36 K' },
  ],
  why: 'Boil-off sets how long a rocket can sit fuelled on the pad, how big a cryogenic tank’s vent must be, and how many litres of liquid nitrogen it takes to chill a test article.',
  visual: {
    type: 'graph',
    title: 'Heat one kilogram of nitrogen from liquid to room-temperature gas',
    lead: t`Slide the heat added. The liquid warms to its boiling point, then sits **at 77.4 K for the whole of the boiling** — 199 kJ go in and the thermometer does not move — and only once the last drop is gone does the gas warm up.`,
    tasks: [
      'Slide through the flat step: the temperature stays at 77.4 K while the share boiled away climbs from 0 to 100 %.',
      'Compare the flat step with the last slope: warming the cold gas to room temperature takes about 232 kJ — more than boiling it did. Cryogenic engineers use that cold gas to pre-cool hardware.',
      'Find the heat at which the last liquid boils away, about 224 kJ: only now can the temperature rise again.',
    ],
    params: {
      x: [0, 480], y: [50, 320], aspect: 'wide', xlabel: 'heat added, Q (kJ)', ylabel: 'T (K)',
      alt: 'The heating curve of one kilogram of nitrogen, with a long flat step at its boiling point',
      sliders: [{ key: 'Q', label: 'Heat added $Q$', min: 0, max: 460, step: 1, value: 120, unit: '\\mathrm{kJ}', explain: 'Energy that has flowed into the one-kilogram sample, slowly, at one atmosphere.' }],
      curves: [{ fn: nT('x'), domain: [0, +N.Q3.toFixed(2)], color: 'accent', width: 3 }],
      shade: [{ fn: nT('x'), lower: '50', from: +N.Q1.toFixed(3), to: +N.Q2.toFixed(3), color: 'warn', alpha: 0.12 }],
      points: [
        { x: 'Q', y: nT('Q'), r: 6, color: 'gold' },
        { x: 4, y: 72, r: 0.01, color: 'ink2', label: 'liquid warms', labelDx: 10, labelDy: 10 },
        { x: 70, y: N.Tb, r: 0.01, color: 'warn', label: 'boiling at 77.4 K: T stays put', labelDx: 0, labelDy: -14 },
        { x: 340, y: 190, r: 0.01, color: 'ink2', label: 'gas warms', labelDx: 10, labelDy: 10 },
      ],
      readouts: [
        { label: 'temperature', expr: nT('Q'), unit: '\\mathrm{K}', digits: 4 },
        { label: 'share boiled away', expr: `100*min(max(Q - ${N.Q1.toFixed(4)}, 0), ${LVN})/${LVN}`, unit: '\\%', digits: 3 },
      ],
    },
    caption: 'One kilogram of nitrogen at one atmosphere, starting as liquid at 65 K, heated slowly so it keeps one temperature. Specific heats are taken as constant in each phase (liquid 2.04, gas 1.04 kJ/(kg·K), NIST); the real gas value is a few per cent higher just above the boiling point.',
  },
  example: {
    prompt: t`Before a test, a ${EX.m} kg stainless steel valve assembly is chilled from 293 K to 77 K by flooding it with liquid nitrogen. Integrating NIST’s specific-heat data for 304 stainless gives ${fmt(EX.q, 3)} kJ to remove from each kilogram of steel. How much liquid nitrogen boils away, in kilograms and in litres? Assume the vapour leaves at 77 K.`,
    visual: vesselPic({ bolt: 'valve assembly', liquid: 'LN₂, 77 K', caption: 'The steel (drawn as a block) sits in boiling liquid nitrogen; the vapour escapes through the vent. Cross-section, not to scale.' }),
    steps: [
      { label: 'Heat to remove', text: t`$Q = m_\text{steel}\times${fmt(EX.q, 3)}\ \text{kJ/kg} = ${EX.m}\times${fmt(EX.q, 3)} = ${fmt(EX.Q, 4)}$ kJ. (This is $m\int c\,dT$ from lesson M16.3: stainless steel’s specific heat falls as it cools.)` },
      { label: 'Boil-off', text: t`Every kilogram of nitrogen that boils absorbs $L_v = 199$ kJ and stays at 77 K: $m_{\mathrm{N_2}} = Q/L_v = ${fmt(EX.Q, 4)}/199 = ${fmt(EX.mN, 3)}$ kg.` },
      { label: 'In litres', text: t`Liquid nitrogen’s density is 806 kg/m³: $V = ${fmt(EX.mN, 3)}/806 = ${fmt(EX.V / 1000, 3)}$ m³ $\approx ${fmt(EX.V, 3)}$ L.` },
      { label: 'Sense check', text: t`About half a litre per kilogram of stainless — the rule of thumb in cryogenics labs. If the cold vapour is made to flow over the steel and leave warm, each kilogram of nitrogen absorbs another $1.04\times216 \approx ${fmt(EX.gas, 3)}$ kJ, cutting the liquid needed to ${fmt(EX.mN2, 2)} kg: that is why chill-downs start slowly, with cold gas.` },
    ],
    answer: t`About $${fmt(EX.mN, 3)}$ kg of liquid nitrogen, or $${fmt(EX.V, 3)}$ litres.`,
  },
  practice: [
    mcq({
      id: 'boiling-temp', difficulty: 1,
      prompt: 'A technician drops a room-temperature steel bolt into an open dewar of liquid nitrogen, which boils at 77.4 K. While the bolt cools, what happens to the temperature of the liquid nitrogen?',
      choices: [
        'It stays at 77.4 K; the nitrogen just boils faster',
        'It rises, because the warm bolt heats it',
        'It rises until the bolt and the nitrogen meet halfway between 77 K and 293 K',
        'It falls, because faster boiling cools the liquid',
      ],
      answer: 0,
      why: {
        1: 'The bolt does deliver heat — but at one atmosphere, heat added to a boiling liquid goes into boiling more of it, not into warming it.',
        2: 'Meeting halfway would need the nitrogen to warm far above its boiling point while still liquid. It cannot: any heat it gets boils some of it away first.',
        3: 'In an open dewar the pressure stays at one atmosphere, and so does the boiling temperature. Faster boiling just carries the extra heat away as vapour.',
      },
      hints: ['What is special about the temperature of a liquid that is boiling at fixed pressure?'],
      teach: 'While a liquid boils at fixed pressure, added heat changes how much boils, not the temperature.',
      explain: t`The liquid stays at its boiling point, 77.4 K, the whole time; the bolt’s heat goes into latent heat of vaporization, so the nitrogen boils furiously until the bolt itself reaches 77 K.`,
      visual: vesselPic({ bolt: true, caption: 'A warm bolt in an open dewar of liquid nitrogen. Cross-section, not to scale.' }),
    }),
    num({
      id: 'melt-ice', difficulty: 1,
      gen(r) {
        const m = r.pick([0.25, 0.5, 1.5, 2, 3.2]);
        return {
          prompt: t`How much heat melts ${m} kg of ice that is already at 0 °C? ($L_f = 334$ kJ/kg.)`,
          answer: m * LF, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: m * LVW, feedback: t`That uses the latent heat of *vaporization*. Melting needs $L_f = 334$ kJ/kg.` }],
          hints: [t`$Q = mL_f$.`],
          teach: 'Melting a solid at its melting point takes Q = mL_f, with no change of temperature.',
          explain: t`$Q = mL_f = (${m}\ \text{kg})(334\ \text{kJ/kg}) = ${fmt(m * LF, 3)}$ kJ — and the result is water still at 0 °C.`,
          visual: heatingCurve({ segs: waterSegs(), hi: 1, caption: 'The heating curve of 1 kg of water. Highlighted: melting, at 0 °C. Specific heats taken as constant within each phase.' }),
        };
      },
    }),
    num({
      id: 'boiloff-day', difficulty: 2,
      gen(r) {
        const P = r.pick([20, 35, 50, 80, 120]);
        const m = (P * 86400) / LOX.Lv;
        return {
          prompt: t`Despite its insulation, ${P} W of heat leaks into a liquid-oxygen storage tank. How many kilograms of LOX boil away per day? ($L_v = 213$ kJ/kg.)`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: apart([
            { value: (P * 3600) / LOX.Lv, feedback: 'That is one hour’s boil-off. A day is 86 400 s.' },
            { value: (P * 86400) / LN2.Lv, feedback: 'That uses nitrogen’s latent heat. For oxygen, $L_v = 213$ kJ/kg.' },
          ], m),
          hints: ['A watt is a joule per second, so first find the heat delivered in a day.', t`$m = \dfrac{P\,t}{L_v}$ with $t = 86\,400$ s.`],
          teach: 'A steady heat leak $P$ boils off liquid at a rate $P/L_v$.',
          explain: t`In a day $Q = (${P}\ \text{W})(86\,400\ \text{s}) = ${fmt(P * 86400, 3)}$ J, so $m = Q/L_v = ${fmt(P * 86400, 3)}/(213\times10^{3}) = ${fmt(m, 3)}$ kg. Long-duration missions fight every watt with vacuum and multilayer insulation (lesson M16.5).`,
          visual: vesselPic({ kind: 'tank', liquid: 'LOX, 90 K', leak: true, vent: 'O₂ gas out', level: 0.7, caption: 'Heat leaking into a LOX tank boils it; the vapour is vented. Cross-section, not to scale.' }),
        };
      },
    }),
    num({
      id: 'ice-to-steam', difficulty: 3,
      gen(r) {
        const m = r.pick([0.2, 0.5, 1]), Ti = r.pick([-20, -10, -5]);
        const parts = [2.09 * -Ti, LF, 418.4, LVW];
        const Q = m * parts.reduce((a, b) => a + b, 0);
        return {
          prompt: t`How much heat turns ${m} kg of ice at $${Ti}$ °C into steam at 100 °C? (Ice: $c = 2.09$ kJ/(kg·K); water: $c = 4.184$ kJ/(kg·K); $L_f = 334$ kJ/kg; $L_v = 2257$ kJ/kg.)`,
          answer: Q, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([
            { value: m * (parts[0] + parts[1] + parts[2]), feedback: 'That stops at boiling water. Turning it into steam takes the latent heat of vaporization too — the biggest step of all.' },
            { value: m * (parts[0] + parts[2] + parts[3]), feedback: 'You left out melting: 334 kJ/kg at 0 °C.' },
          ], Q),
          hints: ['Four steps: warm the ice to 0 °C, melt it, warm the water to 100 °C, boil it.', t`Per kilogram: $2.09\times${-Ti} + 334 + 4.184\times100 + 2257$ kJ.`],
          teach: 'A heating curve is a sum of sloped steps (mcΔT) and flat steps (mL).',
          explain: t`Per kilogram: warm the ice $${fmt(parts[0], 3)}$, melt $334$, warm the water $418.4$, boil $2257$ — total $${fmt(Q / m, 4)}$ kJ/kg, so $Q = ${fmt(Q, 4)}$ kJ. Boiling alone is three-quarters of it.`,
          visual: heatingCurve({ segs: waterSegs(Ti, 100), numbers: false, caption: 'The four steps, from ice to steam (heat axis without numbers). Specific heats taken as constant within each phase.' }),
        };
      },
    }),
    mcq({
      id: 'which-segment', difficulty: 2,
      prompt: 'The graph is the heating curve of a kilogram of water, from ice to steam. During which segment is the water boiling?',
      choices: ['D', 'B', 'C', 'E'],
      answer: 0,
      why: {
        1: 'B is a flat step too — but at 0 °C. That is melting.',
        2: 'On C the temperature is rising: liquid water is warming from 0 °C to 100 °C, and nothing is changing phase.',
        3: 'On E the temperature is rising again: the boiling is finished, and the steam is warming up.',
      },
      hints: ['During a phase change the temperature does not change. Which segments are flat?', 'Of the two flat ones, which is at 100 °C?'],
      teach: 'On a heating curve, flat segments are phase changes; sloped ones are a single phase warming up.',
      explain: t`D is the long flat step at 100 °C: the water is boiling, and it is long because $L_v = 2257$ kJ/kg is by far the largest heat in the whole process.`,
      visual: heatingCurve({ segs: waterSegs(-20, 120), letters: true, labels: false, caption: 'One kilogram of water, heated slowly from −20 °C. Specific heats taken as constant within each phase.' }),
    }),
    num({
      id: 'ice-in-drink', difficulty: 3,
      gen(r) {
        const mi = r.pick([0.03, 0.05, 0.08]), mw = r.pick([0.3, 0.4, 0.5]), T = r.pick([25, 30, 35]);
        const c = 4.184;
        const Tf = (mw * c * T - mi * LF) / ((mw + mi) * c);
        return {
          prompt: t`You drop ${mi * 1000} g of ice at 0 °C into ${mw * 1000} g of water at ${T} °C in an insulated cup. All the ice melts. What is the final temperature?`,
          answer: Tf, tol: { rel: 0.01, abs: 0.05 },
          errors: apart([
            { value: (mw * T) / (mw + mi), feedback: 'You treated the ice as cold water at 0 °C. It must melt first, which takes 334 kJ/kg without warming it.' },
            { value: (mw * c * T - mi * LF) / (mw * c), feedback: 'Once melted, the ice’s water must also warm up to the final temperature: include its mass when you share out the heat.' },
          ], Tf),
          hints: [t`Heat lost by the warm water = heat to melt the ice + heat to warm the meltwater from 0 °C to $T_f$.`, t`$m_wc(${T} - T_f) = m_iL_f + m_ic(T_f - 0)$.`],
          teach: 'Ice cools a drink mostly by melting: its latent heat soaks up far more energy than warming its meltwater does.',
          explain: t`$m_wc(${T} - T_f) = m_iL_f + m_icT_f$ gives $T_f = \dfrac{m_wcT - m_iL_f}{(m_w + m_i)c} = ${fmt(Tf, 3)}$ °C. Melting the ice took $${fmt(mi * LF, 3)}$ kJ — far more than warming its meltwater did.`,
          visual: bodiesPic({ bodies: [{ name: `ice, ${mi * 1000} g`, temp: '0 °C', color: 'teal', w: 0.5, h: 0.5 }, { name: `water, ${mw * 1000} g`, temp: `${T} °C`, color: 'accent', w: 1.6, h: 1.2 }], flows: [{ from: 1, to: 0, label: 'Q' }], caption: 'Heat flows from the warm water into the ice: first to melt it, then to warm the meltwater. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'steam-burn', difficulty: 2,
      prompt: 'Why does a puff of steam at 100 °C scald your skin far worse than the same mass of water at 100 °C?',
      choices: [
        'Condensing on your skin, the steam releases its latent heat of vaporization as well',
        'Steam is hotter than 100 °C water',
        'Steam has a higher specific heat than water',
        'Steam molecules move faster, so they hit your skin harder',
      ],
      answer: 0,
      why: {
        1: 'Both are at 100 °C. The difference is energy content, not temperature.',
        2: 'Steam’s specific heat (about 2.0 kJ/(kg·K)) is half of liquid water’s — so that would make steam *less* harmful.',
        3: 'At the same temperature the molecules have the same average kinetic energy (lesson M17.2). The extra energy in steam is the latent heat that separated the molecules.',
      },
      hints: ['Before steam can cool down on your skin, what must happen to it first?'],
      teach: 'Condensing vapour gives back its latent heat, which is why steam burns are so severe.',
      explain: t`Each gram of steam that condenses on your skin releases 2.26 kJ of latent heat *before* it starts cooling as water — more than eight times what that gram releases cooling from 100 °C to skin temperature, about 37 °C.`,
      visual: heatingCurve({ segs: waterSegs(-20, 120), hi: 3, caption: 'The heating curve of water, run backwards for steam condensing: the highlighted step is the energy released at 100 °C before any cooling begins.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pad-hold', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([20, 30, 45, 60]), tm = r.pick([15, 30, 45, 60]);
        const m = (P * 1000 * tm * 60) / LOX.Lv;
        return {
          prompt: t`During a launch hold, the sunlit wall of a rocket’s liquid-oxygen tank absorbs about ${P} kW. The launch team must keep topping the tank up. How much LOX boils away during a ${tm}-minute hold? ($L_v = 213$ kJ/kg.)`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: apart([
            { value: (P * 1000 * tm) / LOX.Lv, feedback: 'Convert the minutes to seconds: watts are joules per second.' },
            { value: (P * 1000 * tm * 60) / LN2.Lv, feedback: 'That is nitrogen’s latent heat; oxygen’s is 213 kJ/kg.' },
          ], m),
          hints: ['Energy absorbed = power × time, with the time in seconds.', t`$m = Pt/L_v$.`],
          teach: 'Heat flowing steadily into a boiling propellant removes mass at a rate $P/L_v$.',
          explain: t`$Q = (${P}\times10^{3}\ \text{W})(${tm * 60}\ \text{s}) = ${fmt(P * 1000 * tm * 60, 3)}$ J, so $m = Q/L_v = ${fmt(m, 3)}$ kg — which is why a fuelled launcher vents a steady plume of oxygen and is topped up until the final minutes.`,
          visual: vesselPic({ kind: 'tank', liquid: 'LOX, 90 K', leak: true, leakLabel: 'sunlight and warm air', vent: 'O₂ vented', level: 0.75, caption: 'A propellant tank on the pad. Cross-section, not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-dewar-heater', difficulty: 2,
      prompt: 'A test engineer logs the temperature of the liquid nitrogen in an open dewar while a heater at the bottom adds a steady 200 W. Liquid remains in the dewar for the whole next hour. During that hour, the logged temperature:',
      choices: [
        'Stays at 77.4 K while the level falls',
        'Rises steadily at a rate set by the heater power',
        'Falls slowly, because evaporation cools the liquid',
        'Rises a little, then levels off at a temperature set by the power',
      ],
      answer: 0,
      why: {
        1: 'A steady rise is what happens to a liquid that is *not* boiling. Here each joule boils nitrogen instead.',
        2: 'Evaporation cools a liquid only if its pressure falls. An open dewar stays at one atmosphere, so its boiling point stays at 77.4 K.',
        3: 'There is no power-dependent level: at one atmosphere the boiling temperature is fixed, whatever the heating rate.',
      },
      teach: 'At fixed pressure a boiling liquid’s temperature is pinned at its boiling point; the heat sets only the boil-off rate.',
      hints: ['Is the liquid boiling, and is the pressure changing?'],
      explain: t`The liquid is at its boiling point and the pressure is fixed, so the temperature stays at 77.4 K. The heater only sets how fast it boils: $200/199\,000 \approx 1.0$ g/s, about 3.6 kg in the hour.`,
      visual: vesselPic({ heater: 'heater, 200 W', caption: 'An open dewar of liquid nitrogen with a heater at the bottom. Cross-section, not to scale.' }),
    }),
    num({
      id: 'cp-detector', difficulty: 2,
      gen(r) {
        const P = r.pick([5, 8, 12, 20]), h = r.pick([8, 12, 24]);
        const kg = (P * 3600 * h) / LN2.Lv, L = (kg / LN2.rho) * 1000;
        return {
          prompt: t`An infrared detector is cooled by a reservoir of liquid nitrogen. The detector and the reservoir’s leaks together deliver ${P} W into the liquid. How many litres of LN₂ boil away in ${h} hours? ($L_v = 199$ kJ/kg; density 806 kg/m³.)`,
          answer: L, units: 'L', tol: { rel: 0.01 },
          errors: apart([
            { value: kg, feedback: 'That is the mass in kilograms. Divide by the density to get the volume: a litre of LN₂ is only 0.806 kg.' },
            { value: (P * h) / LN2.Lv / LN2.rho * 1000, feedback: 'Convert hours to seconds before multiplying by the power.' },
          ], L),
          hints: [t`Mass boiled: $m = Pt/L_v$ with $t$ in seconds.`, 'Then V = m/ρ; 1 m³ = 1000 L.'],
          teach: 'Boil-off mass is heat over latent heat; divide by the liquid’s density for the volume.',
          explain: t`$m = (${P})(${h}\times3600)/199\,000 = ${fmt(kg, 3)}$ kg, so $V = ${fmt(kg, 3)}/806\ \text{m}^3 = ${fmt(L, 3)}$ L.`,
          visual: vesselPic({ leak: true, liquid: 'LN₂, 77 K', caption: 'A liquid-nitrogen reservoir: every watt that reaches the liquid boils some of it. Cross-section, not to scale.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §1.5 Phase Changes', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-5-phase-changes' },
    { label: 'NIST Chemistry WebBook: thermophysical properties of fluids (nitrogen, oxygen)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
    { label: 'NIST Cryogenic Material Properties: 304 stainless steel (specific heat fit)', url: 'https://trc.nist.gov/cryogenics/materials/304Stainless/304Stainless_rev.htm' },
  ],
});
