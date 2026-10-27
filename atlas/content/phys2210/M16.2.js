// Thermal expansion: ΔL = αL₀ΔT near room temperature, ΔV ≈ 3αV₀ΔT, thermal
// stress when expansion is blocked — and NIST's measured contraction of
// stainless steel on its way down to cryogenic temperatures, where α itself fades.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C0, toK, ssContraction, alContraction, ssDLExpr, alDLExpr, ALPHA_SS, ALPHA_AL, contractionGraph, expansionPic, plateHolePic, cubePic, ringShaftPic, s3 } from './_thermal.js';

const t = String.raw;
const E_SS = 193e9;                // Pa, Young's modulus of 304 stainless at room temperature
const ALPHA_STEEL = 1.2e-5;        // 1/K, carbon steel and iron (OpenStax Table 1.2)
const ALPHA_ALU = 2.3e-5;          // 1/K, aluminium near 20 °C (CRC: 23.1e-6)
const BETA_FUEL = 9.5e-4;          // 1/K, gasoline (OpenStax Table 1.2)

// the worked example: a 12.0 m stainless LOX line cooled from 20 °C to LOX temperature
const EX = { L: 12.0, T0: toK(20), T1: 90.19 };
EX.dT = EX.T1 - EX.T0;                                   // −202.96 K
EX.lin = ALPHA_SS * EX.L * EX.dT;                        // −0.0375 m
EX.frac = ssContraction(EX.T1);                          // −0.270 %
EX.real = EX.frac * EX.L;                                // −0.0324 m
EX.sigma = E_SS * -EX.frac;                              // ≈ 521 MPa

export default lesson({
  id: 'phys2210.M16.2',
  title: 'Thermal expansion',
  minutes: 10, difficulty: 2,
  intro: t`Warm a solid and its atoms jiggle harder in their lopsided bonds, so on average they sit a little further apart: **the solid grows**. Over a modest temperature range, the change in length is proportional both to the length and to the temperature change:

$$\Delta L = \alpha L_0\,\Delta T$$

Every length grows by the same fraction — so areas grow by about $2\alpha\Delta T$ and volumes by $\beta\Delta T$ with $\beta \approx 3\alpha$. The fractions are tiny, about a hundred-thousandth per kelvin for steel, but a stainless propellant line chilled from room temperature to liquid-nitrogen temperature shrinks by nearly **3 mm per metre**. Stop it from shrinking and it pulls on its anchors with a stress $\sigma = E\,\alpha\,\Delta T$, easily enough to tear them loose.`,
  symbols: [
    { tex: '\\Delta L', text: 'the change in length, in metres (m): positive when the object grows, negative when it shrinks' },
    { tex: '\\alpha', text: 'the coefficient of linear expansion, in K⁻¹: the fractional change in length per kelvin. Near room temperature: steel about $1.2\\times10^{-5}$, 304 stainless $1.5\\times10^{-5}$, aluminium $2.3\\times10^{-5}$. **It is not truly constant**: it falls toward zero at cryogenic temperatures' },
    { tex: 'L_0', text: 'the original length, in metres (m)' },
    { tex: '\\Delta T', text: 'the change in temperature, in kelvin (K) — the same number as in Celsius degrees' },
    { tex: '\\beta', text: 'the coefficient of volume expansion, in K⁻¹: $\\Delta V = \\beta V_0\\Delta T$, with $\\beta \\approx 3\\alpha$ for a solid. Liquids have their own, larger, $\\beta$' },
    { tex: '\\sigma = E\\alpha\\Delta T', text: 'the thermal stress in a bar that is prevented from changing length, in pascals (Pa); $E$ is Young’s modulus (193 GPa for stainless steel), from lesson M12.3' },
  ],
  why: 'Bridges, rails and rocket plumbing all change length with temperature; cryogenic lines need bellows and expansion loops because a chilled steel line pulls hard enough to break what holds it.',
  visual: {
    type: 'graph',
    title: 'Cool a metal line toward cryogenic temperatures',
    lead: t`The solid curves are **measured** contraction (NIST) of 304 stainless steel and 6061 aluminium, per metre of length, as they cool from 293 K. The dashed lines are the straight-line rule $\Delta L = \alpha L_0\Delta T$ with each metal’s room-temperature $\alpha$. Slide the final temperature and the length of the line.`,
    tasks: [
      'Cool to 77 K, liquid nitrogen’s temperature: a metre of stainless shrinks 2.8 mm and a metre of aluminium 3.9 mm.',
      'Compare each curve with its dashed line: below about 150 K the real metal contracts less and less — α itself is falling toward zero.',
      'Set the temperature near 290 K and move it a few kelvin: there the line and the curve agree. ΔL = αL₀ΔT is an excellent rule over a modest range.',
    ],
    params: {
      x: [0, 310], y: [-4.6, 0.5], aspect: 'wide', xlabel: 'T (K)', ylabel: 'ΔL/L₀ (mm per m)',
      alt: 'Measured contraction of stainless steel and aluminium as they cool, with straight-line approximations',
      sliders: [
        { key: 'T', label: 'Final temperature $T$', min: 30, max: 300, step: 1, value: 77, unit: '\\mathrm{K}', explain: 'The line starts at 293 K (20 °C) and cools to this temperature.' },
        { key: 'L', label: 'Length of the line $L_0$', min: 1, max: 30, step: 0.5, value: 10, unit: '\\mathrm{m}', explain: 'Only the readouts use it: every metre shrinks by the same amount.' },
      ],
      curves: [
        { fn: ssDLExpr(), domain: [23, 300], color: 'accent', width: 2.6, label: '304 stainless', labelAt: 150, labelDx: 8, labelDy: -12 },
        { fn: '-3.0004', domain: [0, 23], color: 'accent', width: 2.6 },
        { fn: `${ALPHA_SS * 1000}*(x - 293)`, domain: [0, 300], color: 'accent', width: 1.4, dash: true },
        { fn: alDLExpr(), domain: [18, 300], color: 'warn', width: 2.6, label: '6061 aluminium', labelAt: 120, labelDx: 8, labelDy: 16 },
        { fn: '-4.1545', domain: [0, 18], color: 'warn', width: 2.6 },
        { fn: `${ALPHA_AL * 1000}*(x - 293)`, domain: [0, 300], color: 'warn', width: 1.4, dash: true },
      ],
      vlines: [{ x: 'T', color: 'ink3' }],
      points: [{ x: 'T', y: ssDLExpr('T'), color: 'accent', r: 5 }, { x: 'T', y: alDLExpr('T'), color: 'warn', r: 5 }],
      readouts: [
        { label: 'stainless shrinks (measured)', expr: `-L*${ssDLExpr('T')}`, unit: '\\mathrm{mm}', digits: 3 },
        { label: 'straight-line rule says', expr: `-L*${ALPHA_SS * 1000}*(T - 293)`, unit: '\\mathrm{mm}', digits: 3 },
        { label: 'aluminium shrinks (measured)', expr: `-L*${alDLExpr('T')}`, unit: '\\mathrm{mm}', digits: 3 },
      ],
    },
    caption: 'Measured curves: NIST’s fits to data for 304 stainless steel and 6061-T6 aluminium (±5 %), relative to the length at 293 K. Dashed: the straight-line rule with α taken at 293 K (1.54 and 2.26 × 10⁻⁵ K⁻¹). Below about 20 K the metals hardly change at all.',
  },
  example: {
    prompt: t`A 304 stainless steel LOX feed line runs ${EX.L.toFixed(1)} m between two anchors. It is installed at 20 °C and then chilled to the temperature of boiling liquid oxygen, 90.19 K. (a) Predict its contraction with the room-temperature $\alpha = 1.54\times10^{-5}\ \text{K}^{-1}$. (b) NIST’s measurements give a total contraction of ${s3(-EX.frac * 100)} % between 293 K and 90.19 K. What does that give? (c) If the anchors held the line rigidly, what tensile stress would build up? ($E = 193$ GPa.)`,
    visual: contractionGraph({ mats: ['ss'], linear: true, vline: { T: EX.T1, label: '90.19 K' }, caption: 'NIST’s measured contraction of 304 stainless (solid) and the straight-line rule with the room-temperature α (dashed). At 90 K the line overshoots the measurement.' }),
    steps: [
      { label: 'The straight-line rule', text: t`$\Delta T = 90.19 - 293.15 = ${fmt(EX.dT, 5)}$ K, so $\Delta L = \alpha L_0\Delta T = (1.54\times10^{-5}\ \text{K}^{-1})(${EX.L.toFixed(1)}\ \text{m})(${fmt(EX.dT, 5)}\ \text{K}) = ${fmt(EX.lin * 1000, 3)}$ mm.` },
      { label: 'The measurement', text: t`$\Delta L = (${fmt(EX.frac * 100, 3)}\ \%)\times${EX.L.toFixed(1)}\ \text{m} = ${fmt(EX.real * 1000, 3)}$ mm. The straight line overestimates by ${Math.round((EX.lin / EX.real - 1) * 100)} %: **α falls as the steel gets colder**, so using its room-temperature value over a 200-kelvin drop is too crude. Over a large range, $\Delta L = L_0\int\alpha(T)\,dT$ — which is exactly what the measured curve records.` },
      { label: 'Blocked contraction', text: t`If the anchors stop the line from shrinking, it is stretched by the whole strain it was denied, $\varepsilon = ${fmt(-EX.frac, 3)}$. Hooke’s law for the material (M12.3) gives $\sigma = E\varepsilon = (193\times10^{9}\ \text{Pa})(${fmt(-EX.frac, 3)}) = ${fmt(EX.sigma / 1e6, 3)}$ MPa.` },
      { label: 'Sense check', text: t`About 3 mm of shrinkage per metre is the figure cryogenic engineers carry in their heads. And ${fmt(EX.sigma / 1e6, 2)} MPa is more than twice the stress at which annealed 304 starts to yield at room temperature — which is why real cryogenic lines get bellows or expansion loops, never rigid anchors at both ends.` },
    ],
    answer: t`(a) $${fmt(EX.lin * 1000, 3)}$ mm; (b) $${fmt(EX.real * 1000, 3)}$ mm, the realistic figure; (c) about $${fmt(EX.sigma / 1e6, 2)}$ MPa of tension.`,
  },
  practice: [
    num({
      id: 'rail', difficulty: 1,
      gen(r) {
        const L = r.pick([18, 20, 25, 30, 36, 40]), T1 = r.pick([-10, -5, 0, 5]), T2 = r.pick([35, 40, 45]);
        const dL = ALPHA_STEEL * L * (T2 - T1) * 1000;
        return {
          prompt: t`A steel rail is ${L}.0 m long on a winter morning at $${T1}$ °C. How much longer is it on a summer afternoon at ${T2} °C? ($\alpha = 1.2\times10^{-5}\ \text{K}^{-1}$.)`,
          answer: dL, units: 'mm', tol: { rel: 0.01 },
          errors: T1 === 0 ? [] : [{ value: ALPHA_STEEL * L * T2 * 1000, feedback: t`$\Delta T$ is the *change* in temperature: ${T2} − (${T1}).` }],
          hints: [t`$\Delta L = \alpha L_0\Delta T$, with $\Delta T = ${T2} - (${T1}) = ${T2 - T1}$ K.`],
          teach: 'The change in length is the coefficient times the original length times the change in temperature.',
          explain: t`$\Delta L = (1.2\times10^{-5})(${L}\ \text{m})(${T2 - T1}\ \text{K}) = ${fmt(dL / 1000, 3)}$ m $= ${fmt(dL, 3)}$ mm — which is why rails need expansion gaps or are laid pre-stretched.`,
          visual: expansionPic({ before: `${L}.0 m at ${String(T1).replace('-', '−')} °C`, after: `at ${T2} °C`, dL: 'ΔL = ?' }),
        };
      },
    }),
    mcq({
      id: 'hole', difficulty: 2,
      prompt: 'A steel plate has a round hole cut in it. When the plate is heated evenly, what happens to the hole?',
      choices: ['It gets larger, exactly as a steel disc of that size would', 'It gets smaller, because the steel expands into it', 'It stays the same size', 'It stretches into an oval'],
      answer: 0,
      why: {
        1: 'Every length in the plate grows by the same fraction — including the distance across the hole and its circumference. The steel does not bulge inward.',
        2: 'Only if nothing grew. But every line drawn on the plate lengthens, and the hole’s edge is such a line.',
        3: 'Expansion is the same in every direction of an evenly heated plate, so a circle stays a circle.',
      },
      hints: ['Imagine the plate photographed and the photograph enlarged by 0.1 %. What happens to the picture of the hole?'],
      teach: 'Thermal expansion scales every length by the same factor, so holes grow just as the material around them does.',
      explain: t`Heating an evenly heated solid scales the whole thing up like a photographic enlargement: every distance, the hole’s diameter included, grows by $\alpha\Delta T$. That is why heating a ring helps it slide onto a shaft.`,
      visual: plateHolePic(),
    }),
    num({
      id: 'ln2-shrink', difficulty: 2,
      gen(r) {
        const L = r.pick([6, 8, 10, 12, 15, 20]), pct = 0.28;
        const dL = (pct / 100) * L * 1000;
        return {
          prompt: t`NIST’s measurements show that 304 stainless steel contracts by ${pct.toFixed(3)} % between 293 K and 77 K. A transfer line’s ${L} m inner pipe, installed at 293 K, is filled with liquid nitrogen at 77 K. By how much does it shorten?`,
          answer: dL, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: dL * 100, feedback: 'A percentage is a fraction times 100: 0.280 % is 0.00280, not 0.280.' }],
          hints: ['0.280 % means 0.00280 of the length.', t`$\Delta L = 0.00280\times${L}\ \text{m}$.`],
          teach: 'Over large temperature ranges, use the measured total contraction rather than a single α.',
          explain: t`$\Delta L = 0.00280\times${L}\ \text{m} = ${fmt(dL / 1000, 3)}$ m $= ${fmt(dL, 3)}$ mm: 2.8 mm for every metre. The line’s bellows must take up that much travel.`,
          visual: contractionGraph({ mats: ['ss'], vline: { T: 77.36, label: '77 K' }, caption: 'NIST’s measured contraction of 304 stainless steel, per metre, on cooling from 293 K.' }),
        };
      },
    }),
    num({
      id: 'avg-alpha', difficulty: 3,
      gen(r) {
        const [what, T] = r.pick([['liquid nitrogen', 77.36], ['liquid oxygen', 90.19], ['liquid methane', 111.67]]);
        const pct = +(-ssContraction(T) * 100).toFixed(3), dT = 293 - T;
        const a = pct / 100 / dT;
        return {
          prompt: t`Between 293 K and ${T} K (the boiling point of ${what}), 304 stainless steel contracts by ${pct.toFixed(3)} % (NIST). What *average* coefficient of linear expansion does that imply over the range? Compare it with the room-temperature value, $1.54\times10^{-5}\ \text{K}^{-1}$.`,
          answer: a, units: 'K^-1', tol: { rel: 0.01 },
          errors: [{ value: pct / 100 / T, feedback: `Divide by the temperature *change*, 293 − ${T} K, not by the final temperature.` }, { value: pct / dT, feedback: 'Turn the percentage into a fraction first: divide it by 100.' }],
          hints: [t`Rearrange $\Delta L = \alpha L_0\Delta T$: $\alpha = \dfrac{\Delta L/L_0}{\Delta T}$.`, t`$\Delta L/L_0 = ${pct}\ \% = ${(pct / 100).toFixed(5)}$ and $\Delta T = ${fmt(dT, 5)}$ K.`],
          teach: 'An average coefficient is the total fractional change divided by the total temperature change — the slope of the chord, not of the tangent.',
          explain: t`$\bar\alpha = ${(pct / 100).toFixed(5)}/${fmt(dT, 5)}\ \text{K} = ${fmt(a * 1e5, 3)}\times10^{-5}\ \text{K}^{-1}$ — about ${Math.round((1 - a / ALPHA_SS) * 100)} % below the room-temperature value, because α shrinks as the steel cools. On the graph it is the slope of the gold chord; the room-temperature α is the slope of the curve at 293 K.`,
          visual: contractionGraph({ mats: ['ss'], chord: T, caption: 'NIST’s measured contraction of 304 stainless steel, and the chord from 293 K to the boiling point. The average α is the chord’s slope.' }),
        };
      },
    }),
    num({
      id: 'stress', difficulty: 3,
      gen(r) {
        const dT = r.pick([20, 30, 40, 50, 60]);
        const sigma = E_SS * 1.5e-5 * dT / 1e6;
        return {
          prompt: t`A 304 stainless steel tie rod is clamped, unstressed, between two rigid supports at 20 °C. The whole assembly then cools by ${dT} K. What tensile stress develops in the rod? ($E = 193$ GPa; $\alpha = 1.5\times10^{-5}\ \text{K}^{-1}$ over this range.)`,
          answer: sigma, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: 1.5e-5 * dT, feedback: 'That is the strain the rod is denied. Stress is Young’s modulus times that strain.' }],
          hints: ['If it were free, the rod would shrink by the fraction αΔT. The supports stop it, so it is stretched by exactly that strain.', t`$\sigma = E\varepsilon = E\alpha\Delta T$.`],
          teach: 'A bar prevented from contracting carries the stress that would stretch it by the strain it was denied: σ = EαΔT.',
          explain: t`$\varepsilon = \alpha\Delta T = (1.5\times10^{-5})(${dT}) = ${fmt(1.5e-5 * dT, 3)}$, so $\sigma = (193\times10^{9}\ \text{Pa})(${fmt(1.5e-5 * dT, 3)}) = ${fmt(sigma, 3)}$ MPa. The rod’s length never mattered: a long rod and a short one carry the same stress.`,
          visual: expansionPic({ clamped: true, before: 'stainless rod', after: `held fixed while it cools by ${dT} K` }),
        };
      },
    }),
    mcq({
      id: 'beta', difficulty: 2,
      prompt: t`A solid aluminium cube warms by $\Delta T$, and each side grows by the fraction $\alpha\Delta T$. By what fraction does its volume grow?`,
      choices: [t`$3\alpha\Delta T$`, t`$\alpha\Delta T$`, t`$(\alpha\Delta T)^3$`, t`$\tfrac43\pi\,\alpha\Delta T$`],
      answer: 0,
      why: {
        1: 'All three dimensions grow, not just one, so the volume grows faster than any single length.',
        2: t`$(1 + \alpha\Delta T)^3$ is not $1 + (\alpha\Delta T)^3$: expand it, and the leading term is $3\alpha\Delta T$; the cube of a tiny number is negligible.`,
        3: t`The $\tfrac43\pi$ belongs to a sphere’s volume formula; it cancels out of any *fractional* change. Any solid, cube or sphere, has $\beta \approx 3\alpha$.`,
      },
      hints: [t`New volume: $L^3(1 + \alpha\Delta T)^3$.`, t`Expand $(1 + x)^3 = 1 + 3x + 3x^2 + x^3$, and drop the powers of a tiny $x$.`],
      teach: 'Volume grows by three times the fractional change in length: β ≈ 3α for a solid.',
      explain: t`$V = L^3(1 + \alpha\Delta T)^3 \approx L^3(1 + 3\alpha\Delta T)$, because $3(\alpha\Delta T)^2$ and $(\alpha\Delta T)^3$ are millions of times smaller. So $\Delta V/V = 3\alpha\Delta T$, i.e. $\beta = 3\alpha$.`,
      visual: cubePic(),
    }),
    num({
      id: 'fuel-spill', difficulty: 3,
      gen(r) {
        const V0 = r.pick([60, 80, 100, 120]), T1 = r.pick([5, 10, 15]), T2 = r.pick([30, 35, 40]);
        const dT = T2 - T1, spill = (BETA_FUEL - 3 * ALPHA_ALU) * V0 * dT;
        return {
          prompt: t`A light aircraft’s aluminium wing tank is filled to the brim with ${V0} L of fuel at ${T1} °C, then the aircraft sits on a sunny apron until tank and fuel reach ${T2} °C. How much fuel overflows from the vent? (Fuel: $\beta = 9.5\times10^{-4}\ \text{K}^{-1}$; aluminium: $\alpha = 2.3\times10^{-5}\ \text{K}^{-1}$.)`,
          answer: spill, units: 'L', tol: { rel: 0.01 },
          errors: [
            { value: BETA_FUEL * V0 * dT, feedback: 'The tank expands too: its volume grows by 3αV₀ΔT, which makes room for part of the extra fuel.' },
            { value: (BETA_FUEL - ALPHA_ALU) * V0 * dT, feedback: 'The tank’s *volume* grows by β = 3α, not α.' },
          ],
          hints: ['Both the fuel and the tank grow. What spills is the difference.', t`$V_\text{spill} = (\beta_\text{fuel} - 3\alpha_\text{Al})\,V_0\,\Delta T$.`],
          teach: 'A full container of liquid overflows on warming because liquids expand far more than the solids that hold them.',
          explain: t`The fuel grows by $\beta V_0\Delta T = ${fmt(BETA_FUEL * V0 * dT, 3)}$ L and the tank’s volume by $3\alpha V_0\Delta T = ${fmt(3 * ALPHA_ALU * V0 * dT, 3)}$ L, so $${fmt(spill, 3)}$ L spills. Liquid expands roughly fourteen times as much as the aluminium holding it.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 35], y: [0, 0.036], aspect: 'wide', xlabel: 'ΔT (K)', ylabel: 'ΔV/V₀',
              alt: 'Fractional volume growth of fuel and of an aluminium tank against temperature rise',
              curves: [
                { fn: `${BETA_FUEL}*x`, color: 'warn', width: 2.6, label: 'fuel: β = 9.5 × 10⁻⁴ K⁻¹', labelAt: 16, labelDx: -150, labelDy: -14 },
                { fn: `${3 * ALPHA_ALU}*x`, color: 'ink2', width: 2.6, label: 'tank: 3α = 6.9 × 10⁻⁵ K⁻¹', labelAt: 22, labelDx: -40, labelDy: -14 },
              ],
            },
            caption: 'How much each volume grows, as a fraction of its starting volume, for each kelvin of warming. The gap between the lines is the share that overflows.',
          },
        };
      },
    }),
    mcq({
      id: 'alpha-falls', difficulty: 2,
      prompt: t`A designer predicts how much a stainless steel line shortens when cooled from 293 K to 77 K using $\Delta L = \alpha L_0\Delta T$ with the room-temperature $\alpha = 1.54\times10^{-5}\ \text{K}^{-1}$. Compared with what NIST’s measurements give, her prediction is:`,
      choices: [
        'Too large: α falls as the steel cools, so the real contraction is smaller',
        'Too small: steel contracts faster and faster as it gets colder',
        'Exactly right: α is a fixed property of the material',
        'Right only if she converts both temperatures to °C first',
      ],
      answer: 0,
      why: {
        1: 'It is the reverse: at low temperature the atoms’ jiggling dies away and so does the expansion. α drops toward zero near absolute zero.',
        2: 'α is a property of the material *at a given temperature*. Over a 200-kelvin range it changes a lot.',
        3: 'A temperature *difference* is the same in K and in °C, so the scale makes no difference here.',
      },
      hints: ['Look again at the Explore graph: how does the slope of the measured curve change as T falls?'],
      teach: 'The linear rule assumes a constant α, but α itself shrinks at cryogenic temperatures.',
      explain: t`The prediction is $1.54\times10^{-5}\times216 = 0.333\ \%$; NIST measures $0.280\ \%$. The rule overestimates by about 19 %, because the slope of the contraction curve — α — dwindles as the steel cools.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-airliner', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([58, 60, 62]), Tg = r.pick([10, 15, 20]), Tc = r.pick([90, 100, 110]);
        const dL = ALPHA_ALU * L * (Tc - Tg) * 100;
        return {
          prompt: t`At Mach 2, air friction heats a supersonic airliner’s aluminium skin from about ${Tg} °C on the ground to about ${Tc} °C. If the whole ${L} m fuselage followed its skin temperature, how much longer would it get? ($\alpha = 2.3\times10^{-5}\ \text{K}^{-1}$.)`,
          answer: dL, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ALPHA_ALU * L * Tc * 100, feedback: t`Use the *change* in temperature, ${Tc} − ${Tg} = ${Tc - Tg} K.` }],
          hints: [t`$\Delta L = \alpha L_0\Delta T$.`],
          teach: 'ΔL = αL₀ΔT applies to an airframe as it does to a rail.',
          explain: t`$\Delta L = (2.3\times10^{-5})(${L}\ \text{m})(${Tc - Tg}\ \text{K}) = ${fmt(dL / 100, 3)}$ m, about ${fmt(dL, 2)} cm. Supersonic airliners such as Concorde had to be designed to let their structure grow by about this much in every flight.`,
          visual: expansionPic({ before: `${L} m fuselage at ${Tg} °C`, after: `at ${Tc} °C`, dL: 'ΔL = ?' }),
        };
      },
    }),
    mcq({
      id: 'cp-shrink-fit', difficulty: 2,
      prompt: 'A steel shaft is a fraction of a millimetre too wide to slide into the bore of a steel bearing ring. A mechanic dips the shaft in liquid nitrogen for a few minutes, then slides it in easily; once it warms up, it is locked tight. Why does this work?',
      choices: [
        'Cooling shrinks every dimension of the shaft, its diameter included; warming back up expands it against the ring',
        'Liquid nitrogen makes steel soft, so the shaft squeezes in',
        'The cold flows from the shaft into the ring and enlarges the bore',
        'The shaft gets shorter, but its diameter does not change',
      ],
      answer: 0,
      why: {
        1: 'Steel gets stiffer and stronger when cold, not softer.',
        2: 'No “cold” flows anywhere. And if the ring did cool, its bore would *shrink*, like everything else about it.',
        3: 'Contraction happens in every direction at once: the diameter shrinks by the same fraction as the length.',
      },
      hints: ['Which dimensions of a solid change when it cools?'],
      teach: 'Thermal contraction is the same fraction in every direction, so a chilled shaft is thinner as well as shorter.',
      explain: t`At 77 K the shaft’s diameter is about 0.28 % smaller (NIST’s figure for stainless; carbon steel is similar), enough to clear a tight bore. As it warms it tries to return to full size and grips the ring with great force — a **shrink fit**, used for bearings and gears.`,
      visual: ringShaftPic(),
    }),
    num({
      id: 'cp-eiffel', difficulty: 2,
      gen(r) {
        const T1 = r.pick([-10, -5, 0]), T2 = r.pick([30, 35, 40]);
        const dL = ALPHA_STEEL * 300 * (T2 - T1) * 100;
        return {
          prompt: t`The Eiffel Tower’s wrought-iron structure is 300 m tall. Assuming the iron follows the air temperature, how much taller is it on a ${T2} °C summer afternoon than on a $${T1}$ °C winter night? ($\alpha = 1.2\times10^{-5}\ \text{K}^{-1}$.)`,
          answer: dL, units: 'cm', tol: { rel: 0.01 },
          errors: T1 === 0 ? [] : [{ value: ALPHA_STEEL * 300 * T2 * 100, feedback: t`$\Delta T$ is the change: ${T2} − (${T1}).` }],
          hints: [t`$\Delta T = ${T2} - (${T1}) = ${T2 - T1}$ K.`],
          teach: 'The change in length is αL₀ΔT, whatever the direction of the length.',
          explain: t`$\Delta L = (1.2\times10^{-5})(300\ \text{m})(${T2 - T1}\ \text{K}) = ${fmt(dL / 100, 3)}$ m, about ${fmt(dL, 2)} cm — the “15 centimetres taller in summer” often quoted for the tower. (Sunlit iron gets warmer than the air, so the real figure varies.)`,
          visual: expansionPic({ before: '300 m of iron, winter night', after: 'summer afternoon', dL: 'ΔL = ?' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §1.3 Thermal Expansion', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-3-thermal-expansion' },
    { label: 'NIST Cryogenic Material Properties: 304 stainless steel (thermal expansion fit)', url: 'https://trc.nist.gov/cryogenics/materials/304Stainless/304Stainless_rev.htm' },
    { label: 'NIST Cryogenic Material Properties database (6061-T6 aluminium and other metals)', url: 'https://trc.nist.gov/cryogenics/materials/materialproperties.htm' },
  ],
});
