// Real cycles: steady-flow bookkeeping with enthalpy (turbine work = h_in − h_out);
// the Diesel cycle; the Rankine steam cycle from IAPWS-95 steam states; the
// Brayton cycle with real compressor and turbine efficiencies, whose efficiency
// peaks at a finite pressure ratio; back-work ratios — and why rockets pump
// liquids; the RL10's expander cycle.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart, LOX, LH2 } from './_count.js';
import { STEAM, rankinePic } from './_phase.js';

const t = String.raw;
const G0 = 9.80665, GAM = 1.4, K = (GAM - 1) / GAM;
const S = STEAM;
const R1 = { wp: S.h2 - S.h1, x4: (S.s3 - S.sf) / (S.sg - S.sf) };
R1.h4 = S.hf + R1.x4 * (S.hg - S.hf); R1.wt = S.h3 - R1.h4; R1.qin = S.h3 - S.h2; R1.e = (R1.wt - R1.wp) / R1.qin; R1.carnot = 1 - (S.Tc + 273.15) / (S.Tin + 273.15);

const diesel = (r, rc) => 1 - (1 / r ** (GAM - 1)) * ((rc ** GAM - 1) / (GAM * (rc - 1)));
const otto = (r) => 1 - 1 / r ** (GAM - 1);
/** Air-standard Brayton cycle with component efficiencies: returns efficiency, back-work ratio, net work per kg (kJ). */
function brayton(rp, T1, T3, ec, et, cp = 1.005) {
  const tau = rp ** K, wc = (cp * T1 * (tau - 1)) / ec, T2 = T1 + wc / cp, wt = et * cp * T3 * (1 - 1 / tau), q = cp * (T3 - T2);
  return { e: (wt - wc) / q, bwr: wc / wt, w: wt - wc, wc, wt, q, T2 };
}
const brayExpr = (T1 = 288) => `(et*(T3/${T1})*(1 - x^(-${r4(K)})) - (x^(${r4(K)}) - 1)/ec)/(T3/${T1} - 1 - (x^(${r4(K)}) - 1)/ec)`;
function brayPic(T3, ec, et, rp, caption) {
  return {
    type: 'graph',
    params: { x: [1, 50], y: [0, 0.75], aspect: 'wide', xlabel: 'pressure ratio', ylabel: 'efficiency', axesAt: 'edge',
      constants: { T3, ec, et },
      curves: [{ fn: `1 - x^(-${r4(K)})`, domain: [1, 50], color: 'ink3', dash: true, label: 'ideal', labelAt: 42, labelDy: -12 },
        { fn: brayExpr(), domain: [1.05, 50], color: 'accent', label: 'with losses', labelAt: 40, labelDy: 18 }],
      vlines: rp ? [{ x: rp, color: 'gold' }] : [] },
    caption,
  };
}
const dieselPic = (r, rc, caption, extra = {}) => ({
  type: 'therm-pv',
  params: { mode: 'paths', gas: 'air', n: 0.02, vunit: 'L', punit: 'MPa', states: { A: { T: 300, V: 0.5, label: '1' } },
    paths: [{ from: 'A', legs: [['adiabatic', { V: r4(0.5 / r) }], ['isobaric', { V: r4((0.5 * rc) / r) }], ['adiabatic', { V: 0.5 }], ['isochoric', 'A']], label: 'Diesel' }],
    readouts: [], isotherms: false, ...extra },
  caption,
});
// RL10B-2 (Aerojet Rocketdyne data, rounded): vacuum thrust, specific impulse, oxidizer-to-fuel mass ratio, chamber pressure
const RL10 = { F: 110e3, Isp: 465, MR: 5.9, Pc: 4.4 };

export default lesson({
  id: 'phys3700.T4.3',
  title: 'Real cycles',
  minutes: 18, difficulty: 3,
  intro: t`Real power plants and jet engines are **steady-flow** machines: fluid streams through a pump or compressor, a heater, a turbine and a cooler, each running continuously. For a stream, the energy a device exchanges per kilogram is the change in **enthalpy** $h = u + Pv$ (the $Pv$ part is the work of pushing fluid in and out). So an insulated turbine delivers $w = h_\text{in} - h_\text{out}$, a heater adds $q = h_\text{out} - h_\text{in}$, and a cycle’s efficiency is

$$e = \frac{(h_3 - h_4) - (h_2 - h_1)}{h_3 - h_2},$$

turbine work minus pump work, over the heat added. [PHYS 2210 M19.5](#/lesson/phys2210.M19.5) took the ideal Otto and Brayton cycles; here are the **Diesel** cycle, the **Rankine** cycle that makes most of the world’s electricity, the **Brayton** cycle with real compressors and turbines, and the **expander cycle** of the RL10 rocket engine. Each falls short of Carnot for a reason you can point to on a diagram.`,
  symbols: [
    { tex: 'h_1 \\ldots h_4', text: 'specific enthalpy of the working fluid at the four stations (pump inlet, boiler inlet, turbine inlet, turbine exit), in kJ/kg' },
    { tex: 'h_3 - h_4', text: 'the turbine’s work output per kilogram' },
    { tex: 'h_2 - h_1', text: 'the work fed to the pump or compressor per kilogram' },
    { tex: 'h_3 - h_2', text: 'the heat added in the boiler or combustor per kilogram' },
    { tex: 'e', text: 'the cycle’s thermal efficiency' },
  ],
  why: 'These are the machines the second law actually governs — power stations, airliners and rocket turbopumps — and the same enthalpy bookkeeping sizes every nozzle and turbine you will meet in propulsion.',
  visual: {
    type: 'graph',
    title: 'A gas turbine with real components',
    lead: t`The ideal Brayton cycle (dashed) gets ever more efficient as the pressure ratio rises. Give the compressor and turbine realistic efficiencies and the picture changes: the efficiency peaks, then falls. Move the sliders.`,
    tasks: [
      'Set both component efficiencies to 1: the solid curve lies on the ideal one.',
      'Drop the compressor to 0.85 and the turbine to 0.9: the curve now has a peak, at a pressure ratio that depends on the turbine inlet temperature.',
      'Raise the turbine inlet temperature: the peak moves to higher pressure ratios and rises — which is why turbine blades are cooled and coated to run ever hotter.',
    ],
    params: {
      x: [1, 60], y: [0, 0.75], aspect: 'wide', xlabel: 'pressure ratio', ylabel: 'efficiency', axesAt: 'edge',
      sliders: [
        { key: 'ec', label: 'Compressor efficiency $\\eta_c$', min: 0.7, max: 1, step: 0.01, value: 0.85, explain: 'Ideal compressor work divided by the actual work: friction and shocks waste the rest as heat in the air.' },
        { key: 'et', label: 'Turbine efficiency $\\eta_t$', min: 0.7, max: 1, step: 0.01, value: 0.9, explain: 'Actual turbine work divided by the ideal (isentropic) work.' },
        { key: 'T3', label: 'Turbine inlet $T_3$', min: 1000, max: 1900, step: 10, value: 1400, unit: '\\text{K}', explain: 'The hottest gas the turbine blades can survive.' },
        { key: 'rp', label: 'Pressure ratio $r_p$', min: 2, max: 60, step: 1, value: 20, explain: 'Compressor outlet pressure over inlet pressure.' },
      ],
      curves: [{ fn: `1 - x^(-${r4(K)})`, domain: [1, 60], color: 'ink3', dash: true },
        { fn: brayExpr(), domain: [1.05, 60], color: 'accent' }],
      vlines: [{ x: 'rp', color: 'gold' }],
      readouts: [
        { label: 'efficiency', expr: brayExpr().replace(/x/g, 'rp'), digits: 3 },
        { label: 'ideal', expr: `1 - rp^(-${r4(K)})`, digits: 3 },
        { label: 'back-work ratio', expr: `((rp^(${r4(K)}) - 1)/ec)/(et*(T3/288)*(1 - rp^(-${r4(K)})))`, digits: 3 },
        { label: 'net work (kJ/kg)', expr: `1.005*288*(et*(T3/288)*(1 - rp^(-${r4(K)})) - (rp^(${r4(K)}) - 1)/ec)`, digits: 3 },
      ],
    },
    caption: 'Air-standard model: air with constant cp = 1.005 kJ/(kg·K) and γ = 1.4, intake at 288 K, no pressure losses, no cooling air, no recuperator. Real engines are more complicated; the peak is real.',
  },
  example: {
    prompt: t`A Rankine steam cycle: the pump raises condensate from $10$ kPa ($45.8$ °C) to $10$ MPa, the boiler heats it to $500$ °C, the turbine expands it isentropically back to $10$ kPa, and the condenser closes the loop. From steam tables: $h_1 = ${S.h1}$, $h_2 = ${S.h2}$, $h_3 = ${S.h3}$ kJ/kg; $s_3 = ${S.s3}$ kJ/(kg·K); at $10$ kPa, $h_f = ${S.hf}$, $h_g = ${S.hg}$ kJ/kg and $s_f = ${S.sf}$, $s_g = ${S.sg}$ kJ/(kg·K). Find the efficiency.`,
    visual: rankinePic(),
    steps: [
      { label: 'Pump', text: t`$w_p = h_2 - h_1 = ${fmt(R1.wp, 3)}$ kJ/kg — equal to $v\Delta P = (0.00101)(9990) = 10.1$ kJ/kg, because water is nearly incompressible.` },
      { label: 'Turbine exit', text: t`The expansion keeps $s = ${S.s3}$. At $10$ kPa that lies inside the dome: quality $x_4 = \dfrac{s_3 - s_f}{s_g - s_f} = ${fmt(R1.x4, 4)}$, so $h_4 = h_f + x_4(h_g - h_f) = ${fmt(R1.h4, 5)}$ kJ/kg.` },
      { label: 'Work and heat', text: t`$w_t = h_3 - h_4 = ${fmt(R1.wt, 5)}$ kJ/kg; $q_\text{in} = h_3 - h_2 = ${fmt(R1.qin, 5)}$ kJ/kg.` },
      { label: 'Efficiency', text: t`$e = \dfrac{${fmt(R1.wt, 5)} - ${fmt(R1.wp, 3)}}{${fmt(R1.qin, 5)}} = ${fmt(R1.e, 3)}$.` },
      { label: 'Against Carnot', text: t`Between $500$ °C and $45.8$ °C Carnot allows $${fmt(R1.carnot, 3)}$. The shortfall is visible on the T–s diagram: much of the heat goes in while the water is still far below $500$ °C (warming the liquid, then boiling at $311$ °C). Real plants close part of the gap by bleeding steam to preheat the feedwater, and lose some to turbine friction and wet steam (here $${fmt(100 * (1 - R1.x4), 2)}\,\%$ liquid by mass at the exit).` },
    ],
    answer: t`$e = ${fmt(R1.e, 3)}$, against a Carnot limit of $${fmt(R1.carnot, 3)}$; the pump takes only $${fmt((100 * R1.wp) / R1.wt, 2)}\,\%$ of the turbine’s work.`,
  },
  practice: [
    num({
      id: 'diesel', difficulty: 2,
      gen(r) {
        const rr = r.pick([16, 18, 20, 22]), rc = r.pick([1.5, 2, 2.5]), v = diesel(rr, rc);
        return {
          prompt: t`An ideal air-standard Diesel cycle (compression ratio $r = ${rr}$, cutoff ratio $r_c = ${rc}$: the volume grows by that factor while fuel burns at constant pressure) has efficiency $e = 1 - \dfrac{1}{r^{\gamma-1}}\,\dfrac{r_c^{\gamma} - 1}{\gamma(r_c - 1)}$. Find $e$ with $\gamma = 1.4$.`,
          answer: v, tol: { rel: 0.005 },
          errors: apart([{ value: otto(rr), feedback: 'That is the Otto value at the same compression ratio: the cutoff factor (greater than 1) lowers it.' }, { value: 1 - (1 / rr ** (GAM - 1)) * ((rc ** GAM - 1) / (rc - 1)), feedback: 'Divide the cutoff factor by γ as well.' }], v),
          hints: [t`$r^{\gamma - 1} = ${rr}^{0.4} = ${fmt(rr ** 0.4, 4)}$.`, t`$\dfrac{r_c^{1.4} - 1}{1.4(r_c - 1)} = ${fmt((rc ** GAM - 1) / (GAM * (rc - 1)), 4)}$.`],
          teach: 'A diesel adds its heat at constant pressure as the piston moves; at equal compression it is less efficient than Otto, but it can use far higher compression.',
          explain: t`$e = 1 - \dfrac{${fmt((rc ** GAM - 1) / (GAM * (rc - 1)), 4)}}{${fmt(rr ** 0.4, 4)}} = ${fmt(v, 3)}$. An Otto cycle at the same $r$ would give $${fmt(otto(rr), 3)}$, but a petrol engine cannot run at $r = ${rr}$ without knocking.`,
          visual: dieselPic(rr, rc, 'The ideal Diesel cycle for air: adiabatic compression, heat added at constant pressure, adiabatic expansion, heat rejected at constant volume. Shaded: the net work.'),
        };
      },
    }),
    mcq({
      id: 'otto-diesel', difficulty: 2,
      prompt: 'Diesel engines are usually more efficient than petrol (Otto) engines. Why, given that at the same compression ratio the ideal Otto cycle is more efficient?',
      choices: [
        'Diesels compress air alone, so they can use much higher compression ratios without the fuel igniting early',
        'Diesel fuel releases more energy per kilogram, which raises the efficiency',
        'Adding heat at constant pressure is always more efficient than at constant volume',
        'Diesels run cooler, so their Carnot limit is higher',
      ],
      answer: 0,
      why: { 1: 'Energy per kilogram changes how much fuel you burn, not the fraction turned into work.', 2: 'At equal compression ratio constant-volume heating is the more efficient — the opposite.', 3: 'A lower peak temperature lowers the Carnot limit; that is not the reason.' },
      hints: ['What limits a petrol engine’s compression ratio?'],
      teach: 'Efficiency is set by the compression ratio; diesels win by being allowed to compress harder.',
      explain: 'A petrol–air mixture self-ignites (knocks) above a compression ratio of about 10–13. A diesel squeezes pure air, often to 16–22, and injects fuel only when it should burn. The higher r more than makes up for the less favourable constant-pressure heat addition.',
      visual: { type: 'graph', params: { x: [4, 24], y: [0.4, 0.75], aspect: 'wide', xlabel: 'compression ratio', ylabel: 'ideal efficiency', axesAt: 'edge', curves: [{ fn: '1 - x^(-0.4)', domain: [4, 24], color: 'accent', label: 'Otto', labelAt: 6, labelDy: -12 }, { fn: '1 - x^(-0.4)*(2^1.4 - 1)/(1.4*(2 - 1))', domain: [4, 24], color: 'warn', label: 'Diesel, cutoff 2', labelAt: 18, labelDy: 18 }], shade: [{ fn: '0.75', lower: '0.4', from: 9, to: 13, color: 'accent', alpha: 0.12 }, { fn: '0.75', lower: '0.4', from: 16, to: 22, color: 'warn', alpha: 0.12 }] }, caption: 'Ideal air-standard efficiencies against compression ratio. Shaded: typical ranges for petrol (blue) and diesel (orange) engines.' },
    }),
    num({
      id: 'quality', difficulty: 2,
      gen(r) {
        const [pb, Tin, s3] = r.pick([[10, 500, 6.5995], [15, 600, 6.6796], [8, 400, 6.3658]]), x = (s3 - S.sf) / (S.sg - S.sf);
        return {
          prompt: t`Steam enters a turbine at $${pb}$ MPa and $${Tin}$ °C, where $s = ${s3}$ kJ/(kg·K), and expands isentropically to a condenser at $10$ kPa ($s_f = ${S.sf}$, $s_g = ${S.sg}$ kJ/(kg·K)). What fraction of the exhaust is vapour (the quality $x$)?`,
          answer: x, tol: { rel: 0.005 },
          errors: apart([{ value: 1 - x, feedback: 'That is the liquid fraction. Quality is the vapour fraction.' }, { value: s3 / S.sg, feedback: t`Measure from the liquid line: $x = (s - s_f)/(s_g - s_f)$.` }], x),
          hints: [t`Inside the dome, $s = s_f + x(s_g - s_f)$.`],
          teach: 'Inside the vapour dome a property is a mass-weighted mix of the saturated liquid and vapour values.',
          explain: t`$x = \dfrac{${s3} - ${S.sf}}{${S.sg} - ${S.sf}} = ${fmt(x, 3)}$: about $${fmt(100 * (1 - x), 2)}\,\%$ of the steam leaving the last turbine stage is water droplets, which erode the blades — one reason real plants reheat the steam partway through.`,
          visual: rankinePic({ caption: 'The steam turbine expands vertically (constant entropy) from state 3 down into the dome. Steam states from IAPWS-95; dome and heating line are fits.' }),
        };
      },
    }),
    num({
      id: 'pump-vs-turbine', difficulty: 2,
      gen(r) {
        const P = r.pick([5, 10, 15, 20]), wp = S.v1 * (P * 1e3 - 10);
        return {
          prompt: t`The feed pump of a steam plant raises liquid water ($v = 0.00101$ m³/kg) from $10$ kPa to $${P}$ MPa. How much work does an ideal pump need per kilogram? (A turbine in the same plant delivers about 1300 kJ/kg.)`,
          answer: wp, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: wp * 1000, feedback: 'Check the units: v ΔP in m³/kg × kPa gives kJ/kg.' }], wp),
          hints: [t`For a liquid, $w = \int v\,dP \approx v\,\Delta P$.`, t`$\Delta P = ${P * 1000 - 10}$ kPa.`],
          teach: 'Pumping a liquid costs little because its volume is small: w = v ΔP.',
          explain: t`$w = v\Delta P = (0.00101)(${P * 1000 - 10}) = ${fmt(wp, 3)}$ kJ/kg — about $${fmt((100 * wp) / 1300, 2)}\,\%$ of the turbine’s output. Compressing the same mass of *steam* through that pressure ratio would cost hundreds of times more.`,
          visual: rankinePic({ caption: 'The Rankine cycle on the T–s diagram: the pump (1 → 2) is a dot, because pumping liquid barely changes its temperature or entropy.' }),
        };
      },
    }),
    num({
      id: 'brayton-real', difficulty: 3,
      gen(r) {
        const rp = r.pick([10, 15, 20, 30]), T3 = r.pick([1300, 1500]), ec = 0.85, et = 0.9, T1 = 288;
        const b = brayton(rp, T1, T3, ec, et);
        return {
          prompt: t`A gas turbine takes in air at $${T1}$ K, compresses it with pressure ratio $${rp}$ (compressor efficiency $0.85$), heats it to $${T3}$ K, and expands it in a turbine of efficiency $0.90$. Treat the gas as air with $c_P = 1.005$ kJ/(kg·K) and $\gamma = 1.4$. What is the cycle’s efficiency?`,
          answer: b.e, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - rp ** -K, feedback: 'That is the ideal Brayton value. Include the component losses: actual compressor work = ideal/0.85, actual turbine work = 0.90 × ideal.' }, { value: brayton(rp, T1, T3, 1, 1).e * 0.85 * 0.9, feedback: 'The losses do not simply multiply the ideal efficiency: work them through the enthalpy changes.' }], b.e),
          hints: [t`$\tau = r_p^{0.2857} = ${fmt(rp ** K, 4)}$; compressor work $w_c = c_PT_1(\tau - 1)/0.85$, so $T_2 = T_1 + w_c/c_P$.`, t`Turbine work $w_t = 0.90\,c_PT_3(1 - 1/\tau)$; heat $q = c_P(T_3 - T_2)$; $e = (w_t - w_c)/q$.`],
          teach: 'Component losses hit a gas turbine hard, because its compressor eats a large share of the turbine’s work.',
          explain: t`$w_c = ${fmt(b.wc, 4)}$ kJ/kg ($T_2 = ${fmt(b.T2, 4)}$ K), $w_t = ${fmt(b.wt, 4)}$ kJ/kg, $q = ${fmt(b.q, 4)}$ kJ/kg: $e = ${fmt(b.w, 4)}/${fmt(b.q, 4)} = ${fmt(b.e, 3)}$, against the ideal $${fmt(1 - rp ** -K, 3)}$. The back-work ratio is $${fmt(b.bwr, 2)}$.`,
          visual: brayPic(T3, ec, et, rp, `Efficiency against pressure ratio for this turbine inlet temperature: ideal (dashed) and with these component efficiencies. Gold: this engine.`),
        };
      },
    }),
    num({
      id: 'bwr-ideal', difficulty: 3,
      gen(r) {
        const rp = r.pick([10, 20, 30, 40]), T1 = 288, T3 = r.pick([1200, 1400, 1600]), v = (T1 * rp ** K) / T3;
        return {
          prompt: t`In an **ideal** Brayton cycle (intake $${T1}$ K, pressure ratio $${rp}$, turbine inlet $${T3}$ K), what fraction of the turbine’s work does the compressor consume (the back-work ratio)?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: T1 / T3, feedback: t`The compressor’s temperature rise is $T_1(\tau - 1)$ and the turbine’s drop is $T_3(1 - 1/\tau)$: their ratio is $T_1\tau/T_3$.` }, { value: rp ** -K, feedback: 'That ratio does not depend on the temperatures; the back-work ratio does.' }], v),
          hints: [t`$w_c = c_PT_1(\tau - 1)$ and $w_t = c_PT_3(1 - 1/\tau) = c_PT_3(\tau - 1)/\tau$, with $\tau = r_p^{(\gamma-1)/\gamma}$.`, t`$w_c/w_t = T_1\tau/T_3$.`],
          teach: 'A gas turbine’s compressor eats a large fraction of its turbine’s work; a steam plant’s pump eats about 1 %.',
          explain: t`$\tau = ${rp}^{0.2857} = ${fmt(rp ** K, 4)}$, so $w_c/w_t = (${T1})(${fmt(rp ** K, 4)})/${T3} = ${fmt(v, 3)}$. Compare the Rankine cycle’s $${fmt(R1.wp / R1.wt, 2)}$: compressing a gas costs far more than pumping a liquid.`,
          visual: { type: 'therm-pv', params: { mode: 'cycle', cycle: 'brayton', gas: 'air', rp, T1, P1: 100, T3, n: 1, readouts: [], ts: true, isoLabels: false }, caption: 'The ideal Brayton cycle for 1 mol of air, with its T–S diagram. The compressor (bottom-left leg) and turbine (right leg) are the two adiabats.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rl10', difficulty: 4, transfer: true,
      gen(r) {
        const dP = r.pick([6, 7, 8]), mdot = RL10.F / (RL10.Isp * G0), mH = mdot / (1 + RL10.MR), mO = mdot - mH;
        const PH = (mH * dP * 1e6) / LH2.rho / 1e3, PO = (mO * dP * 1e6) / LOX.rho / 1e3;
        return {
          prompt: t`The RL10B-2 upper-stage engine (about $110$ kN of thrust, specific impulse $465$ s, oxidizer-to-fuel mass ratio $5.9$) is an **expander cycle**: liquid hydrogen cools the chamber and nozzle walls, boils into warm gas, drives the turbine that spins both pumps, then burns. Suppose each pump raises its propellant’s pressure by $${dP}$ MPa (an illustrative figure). Find the ideal power of the **hydrogen** pump, $\dot m\,\Delta P/\rho$, with liquid hydrogen’s density $${LH2.rho}$ kg/m³. ($\dot m_\text{total} = F/(I_{sp}g_0)$, $g_0 = 9.807$ m/s².)`,
          answer: PH, units: 'kW', tol: { rel: 0.015 },
          errors: apart([{ value: (mdot * dP * 1e6) / LH2.rho / 1e3, feedback: 'Use only the hydrogen’s share of the flow: $\\dot m_{\\mathrm{H_2}} = \\dot m/(1 + 5.9)$.' }, { value: (mH * dP * 1e6) / LOX.rho / 1e3, feedback: 'Use hydrogen’s density, 70.8 kg/m³, not oxygen’s.' }, { value: PO, feedback: 'That is the oxygen pump. The question asks for the hydrogen pump.' }], PH),
          hints: [t`$\dot m = ${texNum(RL10.F, 3)}/(${RL10.Isp}\times9.807) = ${fmt(mdot, 3)}$ kg/s, of which hydrogen is $1/6.9$: $${fmt(mH, 3)}$ kg/s.`, t`Power $= \dot m\,\Delta P/\rho = (${fmt(mH, 3)})(${dP}\times10^6)/${LH2.rho}$.`],
          teach: 'Pump power is ṁΔP/ρ: hydrogen’s tiny density makes its pump the hungry one, even though it is a sixth of the flow.',
          explain: t`$\dot m_{\text{H}_2} = ${fmt(mH, 3)}$ kg/s, so $P = ${fmt(PH, 3)}$ kW — against $${fmt(PO, 3)}$ kW for the oxygen pump, which moves ${fmt(mO / mH, 2)} times the mass but $${fmt(LOX.rho / LH2.rho, 3)}$ times denser liquid. The turbine must supply both (more, after pump losses) from heat the hydrogen picked up in the cooling jacket. That heat grows more slowly than the engine’s size, which is why expander cycles stay at modest chamber pressures (about ${RL10.Pc} MPa for the RL10B-2) and thrusts.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 1], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
            shade: [{ fn: '0.9', lower: '0.55', from: 0.2, to: 1.2, color: 'accent', alpha: 0.4 }, { fn: '0.45', lower: '0.1', from: 0.2, to: 1.2, color: 'teal', alpha: 0.4 }, { fn: '0.75', lower: '0.25', from: 1.7, to: 2.3, color: 'gold', alpha: 0.45 }, { fn: '0.85', lower: '0.15', from: 3.2, to: 3.85, color: 'warn', alpha: 0.45 }],
            arrows: [{ from: [1.2, 0.72], to: [1.7, 0.6], color: 'accent' }, { from: [1.2, 0.28], to: [1.7, 0.4], color: 'teal' }, { from: [2.3, 0.65], to: [3.2, 0.75], color: 'accent' }, { from: [3.2, 0.3], to: [2.3, 0.35], color: 'warn' }],
            points: [{ x: 0.7, y: 0.72, r: 0.01, color: 'ink', label: 'LH₂ tank', labelDx: -24 }, { x: 0.7, y: 0.28, r: 0.01, color: 'ink', label: 'LOX tank', labelDx: -24 }, { x: 2, y: 0.5, r: 0.01, color: 'ink', label: 'pumps', labelDx: -18 }, { x: 3.52, y: 0.5, r: 0.01, color: 'ink', label: 'chamber', labelDx: -24 }, { x: 2.75, y: 0.84, r: 0.01, color: 'accent', label: 'cold H₂ to jacket', labelDx: -50 }, { x: 2.75, y: 0.2, r: 0.01, color: 'warn', label: 'warm H₂ to turbine', labelDx: -55 }] },
            caption: 'An expander cycle, schematically: hydrogen is pumped through the chamber’s cooling jacket, the heat it gains drives the turbine that turns the pumps, and then it is burned. Not to scale.' },
        };
      },
    }),
    num({
      id: 'cp-brayton-peak', difficulty: 3,
      gen(r) {
        const T3 = r.pick([1200, 1400, 1600]), T1 = 288, ec = 0.85, et = 0.9;
        let best = 2, be = 0;
        for (let rp = 2; rp <= 80; rp += 0.25) { const e = brayton(rp, T1, T3, ec, et).e; if (e > be) { be = e; best = rp; } }
        return {
          prompt: t`For the gas turbine model in this lesson (intake $${T1}$ K, compressor efficiency $0.85$, turbine efficiency $0.90$, constant $c_P$, $\gamma = 1.4$) with turbine inlet temperature $${T3}$ K, what is the **highest** efficiency it can reach by choosing the pressure ratio? (Read the Explore graph or compute: the efficiency peaks at a pressure ratio near $${Math.round(best)}$.)`,
          answer: be, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - best ** -K, feedback: 'That is the ideal value at that pressure ratio; include the component efficiencies.' }, { value: 1 - T1 / T3, feedback: 'That is the Carnot limit between the intake and turbine inlet.' }], be),
          hints: [t`Evaluate $e = (w_t - w_c)/q$ at $r_p \approx ${Math.round(best)}$.`, t`$w_c = c_PT_1(\tau - 1)/0.85$, $w_t = 0.90\,c_PT_3(1 - 1/\tau)$, $q = c_P(T_3 - T_2)$.`],
          teach: 'With real components there is a best pressure ratio, and a hotter turbine moves it up.',
          explain: t`At $r_p \approx ${Math.round(best)}$, $e \approx ${fmt(be, 3)}$. Beyond that the extra compressor work (inflated by its losses) outruns the gain. Jet engines push turbine temperatures up for exactly this reason.`,
          visual: brayPic(T3, ec, et, null, 'Efficiency against pressure ratio for this turbine inlet temperature: ideal (dashed) and with component losses.'),
        };
      },
    }),
    mcq({
      id: 'cp-liquids', difficulty: 2, transfer: true,
      prompt: 'A liquid-propellant rocket raises its propellants to chamber pressure with pumps, and a pressure-fed design uses heavy tanks instead. Why is neither designed to store the propellants as gas and compress them?',
      choices: [
        'Raising the pressure of a liquid costs v ΔP, tiny because v is small; compressing the same mass of gas would need a turbine and compressor far larger than the engine',
        'Gases cannot be burned in a rocket chamber',
        'Liquids are incompressible, so pumping them needs no work at all',
        'Compressing a gas would cool it, freezing the injectors',
      ],
      answer: 0,
      why: { 1: 'Gaseous propellants burn perfectly well; small thrusters use them. The problem is storing and pressurizing them.', 2: 'Pumping a liquid needs v ΔP — small, not zero (hundreds of kilowatts in the RL10).', 3: 'Compressing a gas heats it.' },
      hints: ['Compare the work per kilogram: v ΔP for a liquid, versus compressing a gas through the same pressure ratio.'],
      teach: 'The Rankine trick — pump a liquid, then heat it — is also the rocket trick: liquids are cheap to pressurize.',
      explain: 'A liquid’s specific volume is hundreds of times smaller than a gas’s, so the work to raise its pressure is hundreds of times smaller. That is why steam plants pump water before boiling it, and why rockets carry dense liquid propellants and pump them (or pressurize their tanks) rather than compress gas.',
      visual: rankinePic({ caption: 'The Rankine cycle: the pump work (1 → 2) is a dot beside the turbine’s long drop. Liquid pressurization is cheap.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §4.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook, steam properties (IAPWS-95)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
    { label: 'Sutton & Biblarz, Rocket Propulsion Elements, ch. 10 (engine cycles)', url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements%2C+9th+Edition-p-9781118753910' },
    { label: 'RL10 engine data (Aerojet Rocketdyne, summarized)', url: 'https://en.wikipedia.org/wiki/RL10' },
  ],
});
