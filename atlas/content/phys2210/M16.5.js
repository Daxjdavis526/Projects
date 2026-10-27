// Conduction, convection and radiation: P = kAΔT/L through solids, P = hAΔT
// at a surface, εσAT⁴ across empty space — and why a cryogenic tank is wrapped
// in foam, vacuum and shiny multilayer blankets.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { SIGMA, LN2, LOX, wallPic, radiationGraph, shieldsPic, apart, sci } from './_thermal.js';

const t = String.raw;
const TH = 293.15, TC = LOX.Tb;                    // a warm jacket and liquid oxygen
const dT4 = TH ** 4 - TC ** 4;

// the worked example: radiation across a vacuum jacket, bare and with ideal multilayer insulation
const EX = { eps: 0.05, N: 20 };
EX.black = SIGMA * dT4;                             // 415 W/m²
EX.q0 = EX.black / (2 / EX.eps - 1);                // 10.6 W/m²
EX.qN = EX.q0 / (EX.N + 1);                         // 0.51 W/m²
EX.foam = (TH - TC) / (1 / 10 + 0.025 / 0.03 + 0.0002);   // 217 W/m² through 25 mm of foam in still air

// the Explore wall: still air, foam, a 3 mm steel wall, LOX
const q = '(202.96/(1/h + Lf/(1000*kf) + 0.0002))';
const T1 = `(293.15 - ${q}/h)`;
const T2 = `(${T1} - ${q}*Lf/(1000*kf))`;

export default lesson({
  id: 'phys2210.M16.5',
  title: 'Conduction, convection and radiation',
  minutes: 12, difficulty: 2,
  intro: t`Heat travels three ways. In **conduction**, energy is passed atom to atom through a material, at a rate set by its thermal conductivity:

$$P = \frac{kA\,\Delta T}{L}$$

In **convection**, a moving fluid carries energy with it; at a surface the rate is roughly $P = hA\,\Delta T$. In **radiation**, every surface emits electromagnetic waves at a rate $P = \varepsilon\sigma AT^4$ — no material needed, so it is the only way heat crosses the vacuum of space, or the vacuum jacket of a cryogenic tank. Insulating a LOX tank means fighting all three: **foam against conduction, vacuum against convection, shiny multilayer blankets against radiation.**`,
  symbols: [
    { tex: 'P', text: 'the rate of heat flow (the heat current), in watts (W)' },
    { tex: 'k', text: 'thermal conductivity, in W/(m·K): copper 401, stainless steel about 15, glass 0.84, foam insulation about 0.03, still air 0.026' },
    { tex: 'A', text: 'the area the heat flows through, in m²' },
    { tex: '\\Delta T', text: 'the temperature difference across the layer (or between a surface and the fluid), in K' },
    { tex: 'L', text: 'the thickness of the layer, in metres (m) — thicker means less heat' },
    { tex: 'h', text: 'the convection coefficient, in W/(m²·K): about 5–10 for still air, tens for a breeze or a fan' },
    { tex: '\\varepsilon\\sigma AT^4', text: 'radiated power: $\\varepsilon$ is the emissivity, 0 to 1 (1 for a perfect black surface, about 0.03 for polished aluminium), $\\sigma = 5.67\\times10^{-8}$ W/(m²·K⁴) the Stefan–Boltzmann constant, and $T$ the **absolute** temperature in kelvin' },
  ],
  why: 'Thermal control decides whether a spacecraft’s electronics freeze or cook, and whether a cryogenic upper stage can coast for hours in orbit or boils its propellant away.',
  visual: {
    type: 'graph',
    title: 'Where does the temperature drop in an insulated tank wall?',
    lead: t`The wall of a LOX tank, seen in cross-section: outside air (293 K), a thin film of still air at the surface (convection), a layer of foam, a 3 mm steel wall and the LOX (90 K). In steady state the same heat flux crosses every layer, so **the temperature falls most where the resistance $L/k$ — or $1/h$ — is largest.**`,
    tasks: [
      'Set the foam to zero: nearly the whole drop sits in the air film, and the bare steel is close to 90 K — water vapour would freeze onto it as thick ice (not modelled).',
      'Double the foam thickness: the heat flux roughly halves, because the foam’s resistance dominates.',
      'With 25 mm of foam, change h: it hardly matters. Without foam, h controls everything.',
    ],
    params: {
      x: [0, 210], y: [50, 330], aspect: 'wide', xticks: 0.001, xlabel: 'position through the wall (layers not to scale)', ylabel: 'T (K)',
      alt: 'The temperature profile through an insulated tank wall, from outside air to liquid oxygen',
      sliders: [
        { key: 'Lf', label: 'Foam thickness $L$', min: 0, max: 100, step: 1, value: 25, unit: '\\mathrm{mm}', explain: 'Spray-on foam of the kind used on cryogenic tanks.' },
        { key: 'kf', label: 'Foam conductivity $k$', min: 0.015, max: 0.05, step: 0.001, value: 0.03, unit: '\\mathrm{W/(m\\,K)}', explain: 'Rigid polyurethane foam is about 0.02–0.03 W/(m·K).' },
        { key: 'h', label: 'Air-film coefficient $h$', min: 4, max: 50, step: 1, value: 10, unit: '\\mathrm{W/(m^2\\,K)}', explain: 'About 5–10 in still air; a breeze raises it.' },
      ],
      shade: [
        { fn: '330', lower: '50', from: 30, to: 60, color: 'teal', alpha: 0.07 },
        { fn: '330', lower: '50', from: 60, to: '60 + Lf', color: 'warn', alpha: 0.15 },
        { fn: '330', lower: '50', from: '60 + Lf', to: '66 + Lf', color: 'ink3', alpha: 0.4 },
        { fn: '330', lower: '50', from: '66 + Lf', to: '105 + Lf', color: 'accent', alpha: 0.22 },
      ],
      curves: [
        { fn: '293.15', domain: [0, 30], color: 'gold', width: 3 },
        { fn: `293.15 + (${T1} - 293.15)*(x - 30)/30`, domain: [30, 60], color: 'gold', width: 3 },
        { fn: `${T1} + (${T2} - ${T1})*(x - 60)/max(Lf, 0.001)`, domain: [60, '60 + Lf'], color: 'gold', width: 3 },
        { fn: `${T2} + (90.19 - ${T2})*(x - 60 - Lf)/6`, domain: ['60 + Lf', '66 + Lf'], color: 'gold', width: 3 },
        { fn: '90.19', domain: ['66 + Lf', '105 + Lf'], color: 'gold', width: 3 },
      ],
      points: [
        { x: 2, y: 312, r: 0.01, color: 'warn', label: 'outside air' },
        { x: 33, y: 64, r: 0.01, color: 'teal', label: 'air film' },
        { x: '60 + Lf/2 - 8', y: 64, r: 0.01, color: 'warn', label: 'foam', when: 'step(Lf - 18)' },
        { x: '61 + Lf', y: 316, r: 0.01, color: 'ink2', label: 'steel' },
        { x: '72 + Lf', y: 112, r: 0.01, color: 'accent', label: 'LOX, 90 K' },
        { x: 60, y: T1, r: 5, color: 'gold' },
      ],
      readouts: [
        { label: 'heat flux $P/A$', expr: q, unit: '\\mathrm{W/m^2}', digits: 3 },
        { label: 'outer surface', expr: T1, unit: '\\mathrm{K}', digits: 4 },
        { label: 'LOX boiled per m² each hour', expr: `${q}*3600/213000`, unit: '\\mathrm{kg}', digits: 3 },
      ],
    },
    caption: 'Steady state, a flat wall (a big tank seen up close). The air film stands for convection, P = hAΔT, drawn with a nominal thickness; the steel (3 mm, k = 15 W/(m·K)) is drawn wider than it is. Not modelled: radiation from the surroundings, and frost or condensation on a cold surface.',
  },
  example: {
    prompt: t`A LOX tank at ${TC} K sits inside a vacuum jacket at ${TH} K, so no conduction or convection crosses the gap. The facing surfaces are polished, with emissivity ${EX.eps}. (a) What heat flux does radiation carry across the gap? (b) What if ${EX.N} thin shiny shields of the same emissivity — multilayer insulation — are hung in the vacuum? (c) Compare with 25 mm of foam in still air (the Explore wall).`,
    visual: shieldsPic({ N: 0, Th: '293 K', Tc: '90 K', caption: 'The vacuum gap between a warm jacket and a cold tank: only radiation crosses it. Not to scale.' }),
    steps: [
      { label: 'Black surfaces', text: t`Two black surfaces would exchange $\sigma(T_h^4 - T_c^4) = (5.67\times10^{-8})(${TH}^4 - ${TC}^4) = ${fmt(EX.black, 3)}$ W/m². The $T^4$ is why the kelvin scale is compulsory here: the hot side emits ${Math.round(TH ** 4 / TC ** 4)} times as much as the cold side.` },
      { label: 'Shiny surfaces', text: t`Two parallel surfaces of emissivity $\varepsilon$ exchange $\dfrac{\sigma(T_h^4 - T_c^4)}{2/\varepsilon - 1}$. With $\varepsilon = ${EX.eps}$: $${fmt(EX.black, 3)}/${2 / EX.eps - 1} = ${fmt(EX.q0, 3)}$ W/m². A shiny surface emits little and reflects most of what arrives.` },
      { label: 'Add shields', text: t`Each shield splits the gap in two, and in steady state every gap carries the same flux. For identical surfaces the gaps’ resistances simply add, so $N$ shields cut the flux to $q_0/(N + 1)$: $${fmt(EX.q0, 3)}/${EX.N + 1} = ${fmt(EX.qN, 2)}$ W/m².` },
      { label: 'Compare', text: t`Foam in air passed about ${fmt(EX.foam, 3)} W/m² — some ${Math.round(EX.foam / EX.qN / 10) * 10} times more. Real blankets do worse than ideal shields, typically about 1 W/m², because layers touch and seams leak; still a hundred times better than foam.` },
    ],
    answer: t`(a) about $${fmt(EX.q0, 3)}$ W/m²; (b) about $${fmt(EX.qN, 2)}$ W/m²; (c) foam passes roughly ${Math.round(EX.foam / EX.qN / 10) * 10} times as much.`,
  },
  practice: [
    num({
      id: 'window', difficulty: 1,
      gen(r) {
        const A = r.pick([1.2, 1.5, 2]), L = r.pick([3, 4, 6]), Ti = r.pick([12, 15, 18]), To = r.pick([-5, 0, 5]);
        const P = (0.84 * A * (Ti - To)) / (L / 1000);
        return {
          prompt: t`A single pane of glass, with $k = 0.84$ W/(m·K), has an area of ${A} m² and is ${L} mm thick. Its inner surface is at ${Ti} °C and its outer surface at $${To}$ °C. How much heat flows through it?`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: apart([{ value: (0.84 * A * (Ti - To) * L) / 1000, feedback: 'The thickness goes in the denominator: a thicker pane lets *less* heat through.' }], P),
          hints: [t`$P = kA\Delta T/L$, with $L$ in metres: ${L} mm = ${L / 1000} m.`],
          teach: 'Conduction through a slab is proportional to area and temperature difference, and inversely proportional to thickness.',
          explain: t`$P = \dfrac{(0.84)(${A})(${Ti - To})}{${L / 1000}} = ${fmt(P, 3)}$ W. (Real windows lose less, because still-air films on both faces add resistance — the Explore idea.)`,
          visual: wallPic({ layers: [{ name: 'glass', w: 1, color: 'teal' }], temps: [Ti + 273.15, To + 273.15], hot: 'inside', cold: 'outside', ask: 'P = ?', caption: 'The temperature falls in a straight line through the glass. Thickness not to scale.' }),
        };
      },
    }),
    match({
      id: 'mechanisms', difficulty: 1,
      prompt: 'Match each situation to the way heat mainly travels.',
      left: ['Heat crossing the vacuum jacket of a dewar', 'Heat leaking through the foam on a propellant tank', 'A fan blowing air across a hot circuit board', 'Warm air rising off a room heater'],
      right: ['radiation', 'conduction', 'forced convection', 'natural convection', 'evaporation', 'condensation'],
      answer: [0, 1, 2, 3],
      hints: ['Which mechanism needs no material at all?', 'Convection needs a fluid that moves; it is “forced” when a fan or pump moves it, “natural” when warm fluid rises by itself.'],
      teach: 'Conduction needs matter in contact, convection needs a moving fluid, and radiation needs nothing at all.',
      explain: 'A vacuum stops conduction and convection, leaving radiation. Foam is a solid full of trapped gas, so heat crosses it by conduction. A fan forces the air to move: forced convection. A heater warms the air, which rises on its own: natural convection.',
    }),
    num({
      id: 'radiator-celsius', difficulty: 2,
      gen(r) {
        const A = r.pick([0.5, 1, 2]), eps = r.pick([0.8, 0.85, 0.9]), Tc = r.pick([0, 10, 20, 30]);
        const P = eps * SIGMA * A * (Tc + 273.15) ** 4;
        return {
          prompt: t`A spacecraft radiator panel of area ${A} m² and emissivity ${eps} sits at ${Tc} °C, facing deep space. How much power does it radiate? (Ignore the little it absorbs from space.)`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: apart([
            { value: eps * SIGMA * A * Tc ** 4, feedback: 'The Stefan–Boltzmann law needs the absolute temperature: add 273.15 first. In Celsius the law gives nonsense.' },
            { value: SIGMA * A * (Tc + 273.15) ** 4, feedback: t`That is a perfect black body. Multiply by the emissivity, $\varepsilon = ${eps}$.` },
          ], P),
          hints: [t`$P = \varepsilon\sigma AT^4$ with $T$ in kelvin: $${Tc} + 273.15 = ${(Tc + 273.15).toFixed(2)}$ K.`],
          teach: 'Radiated power goes as the fourth power of the absolute temperature, so T must be in kelvin.',
          explain: t`$P = (${eps})(5.67\times10^{-8})(${A})(${(Tc + 273.15).toFixed(2)})^4 = ${fmt(P, 3)}$ W. A radiator is how a spacecraft dumps its waste heat: there is nothing to conduct or convect into.`,
          visual: radiationGraph({ eps, Tmax: 400, marks: [{ T: Tc + 273.15, label: `${Tc} °C` }], caption: 'Emitted power per square metre against absolute temperature (power axis without numbers). The dashed line marks the panel’s temperature.' }),
        };
      },
    }),
    mcq({
      id: 'double-T', difficulty: 2,
      prompt: 'If a radiator’s absolute temperature doubles, the power it radiates is multiplied by:',
      choices: ['16', '2', '4', '8'],
      answer: 0,
      why: {
        1: 'Radiated power is not proportional to T — it goes as the fourth power.',
        2: 'That would be T², not T⁴.',
        3: 'That would be T³. The Stefan–Boltzmann law has T to the fourth.',
      },
      hints: [t`$P = \varepsilon\sigma AT^4$. Replace $T$ with $2T$.`],
      teach: 'Radiated power scales as T⁴: small temperature changes make big differences.',
      explain: t`$(2T)^4 = 16\,T^4$. That steep law is why hot things radiate so strongly — a re-entry heat shield at 1600 K radiates 16 times as much per square metre as at 800 K.`,
      visual: radiationGraph({ eps: 1, Tmax: 700, marks: [{ T: 300, label: 'T' }, { T: 600, label: '2T' }], caption: 'Radiated power per area against absolute temperature (power axis without numbers): the curve is far steeper at 2T than at T.' }),
    }),
    num({
      id: 'two-layer', difficulty: 3,
      gen(r) {
        const L1 = r.pick([20, 30, 40, 50]);
        const R = L1 / 1000 / 0.03 + 0.004 / 167, qf = (293 - 90) / R;
        return {
          prompt: t`A LOX tank wall is 4 mm of aluminium, with $k = 167$ W/(m·K), covered by ${L1} mm of foam with $k = 0.030$ W/(m·K). The foam’s outer surface is at 293 K and the aluminium’s inner surface at 90 K. What is the heat flux through the wall?`,
          answer: qf, units: 'W/m^2', tol: { rel: 0.01 },
          errors: apart([
            { value: (167 * 203) / 0.004, feedback: 'That is the aluminium alone. The layers are in series: their resistances L/k add.' },
            { value: ((0.03 + 167) * 203) / ((L1 + 4) / 1000), feedback: 'Conductivities of layers in series do not add. Add the resistances L/k instead.' },
          ], qf),
          hints: ['In series the same heat flux crosses both layers, and the resistances add: R = L₁/k₁ + L₂/k₂.', t`$q = \dfrac{\Delta T}{L_1/k_1 + L_2/k_2}$.`],
          teach: 'Layers in series add their thermal resistances L/k, and the largest resistance controls the flow.',
          explain: t`$R = \dfrac{${L1 / 1000}}{0.030} + \dfrac{0.004}{167} = ${fmt(L1 / 1000 / 0.03, 3)} + ${fmt(0.004 / 167, 2)}$ m²K/W, so $q = 203/${fmt(R, 3)} = ${fmt(qf, 3)}$ W/m². The aluminium’s share of the resistance is about one part in ${fmt(Math.round(L1 / 1000 / 0.03 / (0.004 / 167) / 1000) * 1000, 2)}: almost the whole temperature drop sits in the foam.`,
          visual: wallPic({ layers: [{ name: 'foam', w: 1, color: 'warn' }, { name: 'aluminium', w: 0.25, color: 'ink3' }], temps: [293, 90 + 203 * (0.004 / 167) / R, 90], show: [0, 2], hot: 'outside', cold: 'LOX', ask: 'q = ?', caption: 'Temperature through the two layers. Widths not to scale: the aluminium is drawn far thicker than it is.' }),
        };
      },
    }),
    num({
      id: 'mli', difficulty: 3,
      gen(r) {
        const N = r.pick([5, 10, 20, 30, 40]), q0 = +EX.q0.toFixed(1);
        return {
          prompt: t`Between a 293 K jacket and a 90 K tank, polished surfaces in vacuum pass ${q0} W/m² by radiation. Multilayer insulation adds ${N} thin shields of the same emissivity in the gap. Treating them as ideal radiation shields, what is the new heat flux?`,
          answer: q0 / (N + 1), units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: q0 / N, feedback: `${N} shields divide the gap into ${N + 1} gaps, not ${N}.` }],
          hints: ['Each shield splits a gap in two. With identical surfaces, how many equal gaps are there?', t`$q_N = q_0/(N + 1)$.`],
          teach: 'With identical surfaces, N radiation shields divide the radiative heat flux by N + 1.',
          explain: t`$q = ${q0}/${N + 1} = ${fmt(q0 / (N + 1), 3)}$ W/m². Real blankets fall short of this ideal, because layers touch and seams leak.`,
          visual: shieldsPic({ N, caption: `${N} shields hung in the vacuum gap (${Math.min(N, 12)} drawn). Not to scale.` }),
        };
      },
    }),
    mcq({
      id: 'shiny', difficulty: 2,
      prompt: 'Why are the layers of multilayer insulation made of shiny, aluminized film rather than black film?',
      choices: [
        'A shiny surface has low emissivity: it emits little thermal radiation and reflects most of what reaches it',
        'Shiny film conducts heat better, so it spreads the heat out evenly',
        'Black film would absorb the heat so that the tank does not have to',
        'Shiny surfaces are always colder than black ones',
      ],
      answer: 0,
      why: {
        1: 'Conduction is what the vacuum is there to stop. A shield works by not radiating, not by conducting.',
        2: 'An absorbed watt warms the black layer, which then radiates it on toward the tank. Black layers would pass heat along almost freely.',
        3: 'Emissivity, not temperature, is the property that matters. A shiny and a black surface can sit at the same temperature yet radiate very differently.',
      },
      hints: [t`In $P = \varepsilon\sigma AT^4$, which factor does a coating change?`],
      teach: 'Radiation shields work by having low emissivity: good reflectors are poor emitters.',
      explain: t`Polished aluminium has $\varepsilon \approx 0.03$, a black surface about 0.9 — thirty times more. Every shiny layer both emits feebly toward the next and reflects back most of what arrives from the last.`,
      visual: shieldsPic({ N: 5, eps: 'ε ≈ 0.03', caption: 'Shiny shields in a vacuum gap. Not to scale.' }),
    }),
    num({
      id: 'fan', difficulty: 2,
      gen(r) {
        const h = r.pick([15, 25, 40]), A = r.pick([0.2, 0.5, 0.8]), Ts = r.pick([45, 55, 65]), Ta = r.pick([20, 25]);
        const P = h * A * (Ts - Ta);
        return {
          prompt: t`A fan blows ${Ta} °C air across an electronics box whose surface, of area ${A} m², is at ${Ts} °C. The convection coefficient is ${h} W/(m²·K). How much heat does the air carry away?`,
          answer: P, units: 'W', tol: { rel: 0.01 },
          errors: apart([{ value: h * A * Ts, feedback: `Use the temperature *difference* between the surface and the air, ${Ts} − ${Ta} K.` }], P),
          hints: [t`$P = hA\Delta T$.`],
          teach: 'Convection from a surface is P = hAΔT, with h set by how the fluid moves.',
          explain: t`$P = (${h})(${A})(${Ts - Ta}) = ${fmt(P, 3)}$ W. Turn the fan off and $h$ drops to about 5–10 W/(m²·K): the box runs much hotter. In orbit there is no air at all, so spacecraft rely on conduction to radiators.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.5, 6.5], y: [-0.8, 2.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
              alt: 'Air blowing across a warm box',
              shade: [{ fn: '0.6', lower: '0', from: 1, to: 5, color: 'warn', alpha: 0.5 }],
              arrows: [{ from: [0, 1.0], to: [1.6, 1.0], color: 'accent' }, { from: [0, 1.5], to: [1.6, 1.5], color: 'accent' }, { from: [4.4, 1.0], to: [6, 1.25], color: 'warn' }, { from: [4.4, 1.5], to: [6, 1.75], color: 'warn' }],
              points: [{ x: 0, y: 1.9, r: 0.01, color: 'accent', label: `air in, ${Ta} °C` }, { x: 3, y: 0.3, r: 0.01, color: 'ink', label: `surface ${Ts} °C, ${A} m²`, labelDx: -60, labelDy: 0 }, { x: 4.6, y: 2.05, r: 0.01, color: 'warn', label: 'warmed air out' }],
            },
            caption: 'Air blown across a warm surface carries heat away. Not to scale.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radiator-area', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([500, 800, 1200, 2000]), Tc = r.pick([7, 17, 27]), eps = 0.9;
        const T = Tc + 273.15, A = P / (eps * SIGMA * T ** 4);
        return {
          prompt: t`A satellite’s electronics produce ${P} W of waste heat, which must leave through a radiator facing deep space. The radiator runs at ${Tc} °C and has emissivity ${eps}. What area does it need? (Ignore heat it absorbs from the Sun and Earth.)`,
          answer: A, units: 'm^2', tol: { rel: 0.01 },
          errors: apart([
            { value: P / (eps * SIGMA * Tc ** 4), feedback: 'Use the absolute temperature in the Stefan–Boltzmann law: add 273.15.' },
            { value: P / (SIGMA * T ** 4), feedback: 'Include the emissivity: a real panel radiates only ε times a black body.' },
          ], A),
          hints: [t`Set $P = \varepsilon\sigma AT^4$ and solve for $A$.`, t`Use $T = ${Tc} + 273.15$ K.`],
          teach: 'A spacecraft radiator must be big enough that εσAT⁴ matches the heat it must reject.',
          explain: t`$A = \dfrac{P}{\varepsilon\sigma T^4} = \dfrac{${P}}{(${eps})(5.67\times10^{-8})(${T.toFixed(2)})^4} = ${fmt(A, 3)}$ m². Sunlight landing on it would demand more area still — which is why radiators are painted white and turned away from the Sun.`,
          visual: radiationGraph({ eps, Tmax: 400, marks: [{ T, label: `${Tc} °C` }], caption: 'Emitted power per square metre against absolute temperature (power axis without numbers), for ε = 0.9.' }),
        };
      },
    }),
    num({
      id: 'cp-foam-box', difficulty: 3,
      gen(r) {
        const A = r.pick([1.5, 2, 3]), L = r.pick([50, 75, 100]);
        const P = (0.03 * A * (293.15 - LN2.Tb)) / (L / 1000), m = (P * 86400) / LN2.Lv;
        return {
          prompt: t`A foam box (walls ${L} mm thick, $k = 0.030$ W/(m·K), total wall area ${A} m²) holds liquid nitrogen at 77.4 K in a 20 °C lab. Treating the walls as flat and ignoring the air films, how many kilograms of LN₂ boil away per day? (Use $L_v = 199$ kJ/kg.)`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: apart([
            { value: (P * 3600) / LN2.Lv, feedback: 'That is one hour. A day is 86 400 s.' },
            { value: (P * 86400) / LOX.Lv, feedback: 'That is oxygen’s latent heat; nitrogen’s is 199 kJ/kg.' },
          ], m),
          hints: [t`First the heat leak: $P = kA\Delta T/L$, with $\Delta T = 293.15 - 77.4$ K.`, t`Then the boil-off: $m = Pt/L_v$ with $t = 86\,400$ s.`],
          teach: 'Conduction sets the heat leak; latent heat turns it into a boil-off rate.',
          explain: t`$P = \dfrac{(0.030)(${A})(215.8)}{${L / 1000}} = ${fmt(P, 3)}$ W, so a day delivers $${fmt(P * 86400, 3)}$ J and boils $${fmt(m, 3)}$ kg — why serious dewars use a vacuum jacket instead.`,
          visual: wallPic({ layers: [{ name: 'foam', w: 1, color: 'warn' }], temps: [293.15, LN2.Tb], hot: 'lab, 20 °C', cold: 'LN₂', ask: 'P = ?', caption: 'The temperature falls straight across the foam. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-vacuum', difficulty: 2,
      prompt: 'A cryogenic tank sits inside a jacket with a near-perfect vacuum between them. Why does heat still reach the tank?',
      choices: [
        'Thermal radiation crosses the vacuum, from the warm jacket to the cold tank',
        'Heat is conducted through the vacuum, just more slowly than through air',
        'Convection currents still circulate in the vacuum',
        'A vacuum conducts heat better than air, because there are no molecules in the way',
      ],
      answer: 0,
      why: {
        1: 'Conduction needs matter to pass energy along; a vacuum has none.',
        2: 'Convection needs a fluid to move; there is nothing in a vacuum to flow.',
        3: 'With no molecules there is nothing to carry energy by conduction at all. What does cross is radiation.',
      },
      teach: 'A vacuum stops conduction and convection, but radiation crosses it freely — hence shiny shields.',
      hints: ['Which kind of heat transfer brings sunlight to Earth across 150 million kilometres of vacuum?'],
      explain: t`Only radiation crosses a vacuum — the same way sunlight reaches Earth. That is why dewars are silvered and why vacuum jackets are packed with multilayer insulation. (The tank’s supports and pipes also conduct some heat in.)`,
      visual: shieldsPic({ N: 0, Th: '293 K', Tc: '77 K', eps: 'silvered', caption: 'A warm jacket, a vacuum gap and a cold tank wall. Not to scale.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §1.6 Mechanisms of Heat Transfer', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer' },
    { label: 'NIST: the Stefan–Boltzmann constant (CODATA, exact)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?sigma' },
  ],
});
