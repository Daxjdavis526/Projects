// Real engine cycles as their ideal air-standard versions: the Otto cycle
// (petrol engine, heat at constant volume) and the Brayton cycle (gas turbine,
// jet engine, rocket turbopump, heat at constant pressure) — efficiencies set by
// the compression alone, and honest reasons real engines fall short.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { TD, molesOf, pvPic, one } from './_pv.js';

const t = String.raw;
const G = 1.4, KG = (G - 1) / G;
const ottoE = (r) => 1 - r ** (1 - G);
const braytonE = (rp, g = G) => 1 - rp ** (-(g - 1) / g);

/** An ideal Otto cycle of the air in a half-litre cylinder (intake 100 kPa, T1), as a PV picture. */
function ottoPic(r, T3, { T1 = 300, caption, isotherms = false, stateT = false } = {}) {
  const c = TD.otto({ T1, P1: 100e3, V1: 0.5e-3, r, T3, g: G });
  const st = Object.fromEntries(c.names.map((k, i) => [k, { P: c.states[i].P / 1000, V: c.states[i].V * 1000 }]));
  return pvPic({ gas: 'air', n: c.n, heat: true, legend: true, isotherms, isoLabels: true, stateT, states: st, paths: one('1', ['adiabatic', '2'], ['isochoric', '3'], ['adiabatic', '4'], ['isochoric', '1']), vrange: [0, 0.6],
    caption: caption ?? `An ideal Otto cycle for the air in a half-litre cylinder, compression ratio ${r}: compress (1 → 2), burn at constant volume (2 → 3), expand (3 → 4), exhaust (4 → 1).` });
}
/** An ideal Brayton cycle for one kilogram of air (inlet 101 kPa, T1), as a PV picture. */
function braytonPic(rp, T3, { T1 = 288, caption, isotherms = false, stateT = false } = {}) {
  const n = 1000 / 28.965, c = TD.brayton({ T1, P1: 101325, rp, T3, n, g: G });
  const st = Object.fromEntries(c.names.map((k, i) => [k, { P: c.states[i].P / 1000, V: c.states[i].V }]));
  return pvPic({ gas: 'air', n, vunit: 'm3', heat: true, legend: true, isotherms, isoLabels: true, stateT, states: st, paths: one('1', ['adiabatic', '2'], ['isobaric', '3'], ['adiabatic', '4'], ['isobaric', '1']),
    caption: caption ?? `An ideal Brayton cycle for one kilogram of air, pressure ratio ${rp}: compressor (1 → 2), combustor (2 → 3), turbine (3 → 4), exhaust cooling back to the inlet state (4 → 1).` });
}

// the worked example: a petrol engine, r = 10, intake 300 K and 100 kPa, peak 2400 K, half-litre cylinder
const EX = { r: 10, T1: 300, T3: 2400 };
EX.c = TD.otto({ T1: EX.T1, P1: 100e3, V1: 0.5e-3, r: EX.r, T3: EX.T3, g: G });
EX.T2 = EX.c.states[1].T;                                // 754 K
EX.e = ottoE(EX.r);                                      // 0.602
EX.A = TD.analyse(TD.cycleLegs(EX.c, EX.c.n, G), EX.c.n, G);
EX.carnot = 1 - EX.T1 / EX.T3;                           // 0.875

// the Explore: the same half-litre parcel of air through either cycle
const N0 = molesOf(100, 0.5, 300);

export default lesson({
  id: 'phys2210.M19.5',
  title: 'Real engine cycles: Otto and Brayton',
  minutes: 13, difficulty: 3,
  intro: t`Real engines do not add their heat at one temperature. A petrol engine burns its fuel almost instantly at the top of the stroke — heat added at **constant volume**, the idealized **Otto cycle**. A gas turbine — a jet engine, a power-station turbine, the turbine that drives a rocket's turbopump — burns fuel continuously as gas flows through its combustor — heat added at **constant pressure**, the **Brayton cycle**. Treating the working gas as air with $\gamma = 1.4$,

$$e_{\text{Otto}} = 1 - \frac{1}{r^{\gamma - 1}}, \qquad e_{\text{Brayton}} = 1 - \frac{1}{r_p^{(\gamma-1)/\gamma}}$$

Both depend only on how hard the air is squeezed, and both equal $1 - T_1/T_2$: the Carnot efficiency between the air's temperatures before and after compression. Real engines fall well short — about 30–40 % for a petrol engine, about 50 % for an airliner's engine core — and the reasons are worth knowing.`,
  symbols: [
    { tex: 'r', text: 'the compression ratio of a piston engine, $V_1/V_2$: cylinder volume at the bottom of the stroke over the volume at the top. About 10 to 13 for petrol engines, 15 to 22 for diesels' },
    { tex: 'r_p', text: 'the pressure ratio of a gas turbine, $P_2/P_1$: compressor outlet over inlet pressure. About 15 to 20 for power-station turbines, 40 to 60 for modern airliner engines' },
    { tex: '\\gamma', text: 'the ratio of heat capacities, 1.40 for cold air. Hot combustion gas has a lower $\\gamma$ (about 1.3), one of the reasons real engines do worse' },
    { tex: 'T_1,\\ T_2', text: 'the absolute temperatures of the air before and after the compression, in kelvin; $T_2/T_1 = r^{\\gamma-1} = r_p^{(\\gamma-1)/\\gamma}$' },
  ],
  why: 'These two cycles are how the world turns fuel into motion — cars, power stations, aircraft and, through their turbopumps, liquid-fuel rockets.',
  visual: {
    type: 'therm-pv',
    title: 'Squeeze harder, run more efficiently',
    lead: t`The same half-litre parcel of air, taken round an ideal Otto cycle or an ideal Brayton cycle. Set the compression and the peak temperature, and compare the efficiency with the Carnot limit between the coldest and hottest points.`,
    tasks: [
      t`Otto: raise $r$ from 6 to 12 and watch the efficiency climb from 51 % to 63 %. Now move $T_3$: the area and $W$ change, the efficiency does not.`,
      t`Compare $e$ with the Carnot limit: always lower, because heat goes in all the way from $T_2$ up to $T_3$ — not all at the top temperature — and leaves from $T_4$ down to $T_1$.`,
      t`Brayton at $r_p = 40$, like a modern turbofan: 65 % ideal. Read the back-work ratio — the compressor eats a large share of the turbine's work, which is why gas turbines need very good compressors.`,
    ],
    params: {
      mode: 'cycle', cycle: 'otto', cycles: ['otto', 'brayton'], gas: 'air', n: N0, T1: 300, P1: 100, V1: 0.5, r: 9, rp: 20, T3: 2000,
      controls: ['cycle', 'r', 'rp', 'T3'], ranges: { r: [4, 14, 0.5], rp: [4, 50, 1], T3: [1200, 2800, 20] },
      sliderText: { T3: { label: 'Peak temperature $T_3$', explain: 'After the fuel burns. Set by the fuel and by what pistons or turbine blades can survive.' } },
      readouts: ['Qh', 'Qc', 'Wnet', 'e', 'carnot', 'T2', 'bwr'], isotherms: 'auto',
    },
    caption: 'Air-standard cycles: air as an ideal gas with constant γ = 1.40 goes round reversibly, and burning fuel is modelled as heat added. Real engines draw in fresh air and throw out exhaust instead of recycling one parcel of gas, burn their fuel in finite time, leak heat through the walls and lose work to friction — so they reach well under these efficiencies. Dashed: the isotherms of the coldest and hottest points, which set the Carnot limit.',
  },
  example: {
    prompt: t`A petrol engine has compression ratio ${EX.r}. Model it as an ideal Otto cycle: air enters at ${EX.T1} K and 100 kPa, and burning raises it to ${EX.T3} K. Find (a) the temperature after compression, (b) the efficiency, (c) the work per cycle of a half-litre cylinder, and (d) compare with the Carnot limit between ${EX.T1} K and ${EX.T3} K.`,
    visual: ottoPic(EX.r, EX.T3, { isotherms: [EX.T1, EX.T3], caption: 'The ideal Otto cycle of a half-litre cylinder, compression ratio 10, peaking at 2400 K. Red: heat in at constant volume; blue: heat out at constant volume. Dashed: the 300 K and 2400 K isotherms.' }),
    steps: [
      { label: 'Compression', text: t`Adiabatic, so $T_2 = T_1r^{\gamma-1} = (${EX.T1})(${EX.r})^{0.4} = ${fmt(EX.T2, 3)}$ K.` },
      { label: 'Efficiency', text: t`Heat in at constant volume: $Q_h = nC_V(T_3 - T_2)$. Heat out: $Q_c = nC_V(T_4 - T_1)$. The adiabats give $T_3/T_4 = T_2/T_1 = r^{\gamma-1}$, so $\dfrac{Q_c}{Q_h} = \dfrac{T_4 - T_1}{T_3 - T_2} = \dfrac{T_1}{T_2}$ and $e = 1 - \dfrac{T_1}{T_2} = 1 - \dfrac{1}{r^{\gamma-1}} = ${fmt(EX.e, 3)}$.` },
      { label: 'Work per cycle', text: t`The cylinder holds $n = PV/RT = ${fmt(EX.c.n, 3)}$ mol, so $Q_h = nC_V(T_3 - T_2) = ${fmt(EX.A.Qin, 3)}$ J and $W = eQ_h = ${fmt(EX.A.W, 3)}$ J per cycle — about ${fmt(EX.A.W * 25 * 4 / 1000, 2)} kW from four such cylinders at 3000 rpm.` },
      { label: 'Against Carnot', text: t`$1 - ${EX.T1}/${EX.T3} = ${fmt(EX.carnot, 3)}$. The Otto cycle gets ${fmt(EX.e, 3)} because its heat goes in between ${fmt(EX.T2, 3)} K and ${EX.T3} K, not all at ${EX.T3} K: in effect it is a Carnot engine running only between $T_1$ and $T_2$.` },
      { label: 'Sense check', text: t`Real petrol engines of this compression ratio reach about 30–35 % at best: the hot gas has $\gamma$ nearer 1.3, combustion takes time, heat leaks into the cooled cylinder walls, and pumping and friction take their cut. The ideal cycle is the ceiling those losses are measured against.` },
    ],
    answer: t`(a) ${fmt(EX.T2, 3)} K; (b) $e = ${fmt(EX.e, 3)}$; (c) about ${fmt(EX.A.W, 3)} J per cycle; (d) Carnot would allow ${fmt(EX.carnot, 3)}.`,
  },
  practice: [
    num({
      id: 'otto-e', difficulty: 1,
      gen(r) {
        const k = r.pick([6, 8, 9, 10, 11, 12]), e = ottoE(k);
        return {
          prompt: t`What is the efficiency of an ideal Otto cycle with compression ratio ${k}? ($\gamma = 1.40$; give a percentage.)`,
          answer: e * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: (1 - k ** -G) * 100, feedback: t`The exponent is $\gamma - 1 = 0.4$, not $\gamma$.` }, { value: (1 - 1 / k) * 100, feedback: t`Raise $r$ to the power $\gamma - 1$: $e = 1 - r^{-(\gamma-1)}$.` }],
          hints: [t`$e = 1 - r^{-(\gamma-1)} = 1 - ${k}^{-0.4}$.`],
          teach: t`The ideal Otto efficiency depends only on the compression ratio and $\gamma$.`,
          explain: t`$e = 1 - ${k}^{-0.4} = 1 - ${fmt(k ** -0.4, 4)} = ${fmt(e * 100, 3)}$ %.`,
          visual: ottoPic(k, 2200),
        };
      },
    }),
    num({
      id: 'brayton-e', difficulty: 1,
      gen(r) {
        const rp = r.pick([8, 12, 16, 20, 30, 40]), e = braytonE(rp);
        return {
          prompt: t`What is the efficiency of an ideal Brayton cycle with pressure ratio ${rp}? ($\gamma = 1.40$; give a percentage.)`,
          answer: e * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: (1 - rp ** -(G - 1)) * 100, feedback: t`For a pressure ratio the exponent is $(\gamma - 1)/\gamma = 0.286$: temperature goes as $P^{(\gamma-1)/\gamma}$.` }, { value: (1 - 1 / rp) * 100, feedback: t`Raise $r_p$ to the power $(\gamma-1)/\gamma$ first.` }],
          hints: [t`$e = 1 - r_p^{-(\gamma-1)/\gamma} = 1 - ${rp}^{-0.2857}$.`],
          teach: t`The ideal Brayton efficiency depends only on the pressure ratio and $\gamma$.`,
          explain: t`$e = 1 - ${rp}^{-0.2857} = 1 - ${fmt(rp ** -KG, 4)} = ${fmt(e * 100, 3)}$ %.`,
          visual: braytonPic(rp, 1600),
        };
      },
    }),
    num({
      id: 'from-temps', difficulty: 2,
      gen(r) {
        const T1 = r.pick([290, 300, 310]), T2 = r.pick([650, 700, 750, 800]);
        const e = 1 - T1 / T2;
        return {
          prompt: t`In an ideal Otto cycle the air is at ${T1} K before compression and ${T2} K after it. What is the cycle's efficiency, whatever the peak temperature? (Give a percentage.)`,
          answer: e * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: (T1 / T2) * 100, feedback: t`That is $T_1/T_2$, the share of heat rejected. The efficiency is $1 - T_1/T_2$.` }],
          hints: [t`For the Otto (and Brayton) cycle, $e = 1 - T_1/T_2$.`],
          teach: 'An Otto or Brayton cycle is exactly as efficient as a Carnot engine working between the air’s temperatures before and after compression.',
          explain: t`$e = 1 - ${T1}/${T2} = ${fmt(e * 100, 3)}$ %. The peak temperature sets how much work each cycle does, not what fraction of the heat becomes work.`,
          visual: ottoPic(Math.round(10 * (T2 / T1) ** (1 / (G - 1))) / 10, 2200, { T1, caption: 'An ideal Otto cycle: the compression 1 → 2 sets the efficiency.' }),
        };
      },
    }),
    mcq({
      id: 'knock', difficulty: 2,
      prompt: 'Raising the compression ratio always raises the ideal Otto efficiency. Why, then, do petrol engines stop at compression ratios of about 10 to 13?',
      visual: ottoPic(12, 2400, { caption: 'An Otto cycle with compression ratio 12: the compression 1 → 2 heats the fuel–air mixture before the spark.' }),
      choices: [
        'Compression heats the fuel–air mixture; squeeze it harder and it ignites by itself before the spark (knock), which can wreck the engine',
        'Above r ≈ 10 the efficiency stops rising',
        'The second law forbids compression ratios above about 13',
        'Air stops behaving as an ideal gas above r ≈ 13',
      ],
      answer: 0,
      why: {
        1: t`The formula keeps rising: $r = 20$ would give 70 %. The limit is the fuel, not the formula.`,
        2: 'The second law limits efficiency through temperatures, not compression ratios as such.',
        3: 'Air is still close to ideal at the few megapascals and several hundred kelvin reached at the end of compression.',
      },
      hints: ['What does adiabatic compression do to the temperature of the mixture?', 'Diesel engines, which squeeze pure air and inject the fuel only at the top of the stroke, use r = 15–22.'],
      teach: 'Petrol engines are limited by knock: compression heating that ignites the mixture before the spark.',
      explain: t`At $r = 12$ the mixture reaches about $300\times12^{0.4} = 810$ K before the spark — near where petrol–air mixtures begin to ignite on their own. Knock-resistant (high-octane) fuel allows a little more. Diesels sidestep the problem by compressing air alone and spraying fuel in only when it should burn — which is why they run at higher compression ratios and higher efficiency.`,
    }),
    mcq({
      id: 'below-carnot', difficulty: 2,
      prompt: 'An ideal Otto cycle with T₁ = 300 K and a peak of T₃ = 2400 K has an efficiency of 60 %, though the Carnot limit between 300 K and 2400 K is 87.5 %. Why is the ideal cycle so far below Carnot?',
      visual: ottoPic(10, 2400, { isotherms: [300, 2400], caption: 'The Otto cycle and the isotherms of its coldest and hottest points (dashed). A Carnot engine would take in all its heat on the upper isotherm.' }),
      choices: [
        'Its heat goes in over a range of temperatures, from T₂ up to T₃, and comes out from T₄ down to T₁ — not at the extremes',
        'Friction in the ideal cycle wastes the difference',
        'A real fuel cannot be burned reversibly',
        'The Carnot limit does not apply to internal-combustion engines',
      ],
      answer: 0,
      why: {
        1: 'The ideal cycle has no friction at all; the gap is built into its shape.',
        2: 'The ideal cycle replaces burning with reversible heating, and still falls short of Carnot.',
        3: 'The Carnot limit applies to every engine: it is the ceiling for any heat taken in below T₃ and given out above T₁.',
      },
      hints: ['At what temperatures does the gas take in heat along 2 → 3?'],
      teach: 'An engine that takes in heat over a range of temperatures cannot match a Carnot engine working between the extremes.',
      explain: t`On 2 → 3 the gas warms from 754 K to 2400 K as heat goes in; most of the heat enters well below 2400 K. On 4 → 1 heat leaves from about 950 K down to 300 K. Effectively the cycle works between narrower temperatures — and indeed $e = 1 - T_1/T_2 = 1 - 300/754 = 60\ \%$.`,
    }),
    num({
      id: 'back-work', difficulty: 3,
      gen(r) {
        const rp = r.pick([10, 15, 20, 30]), T1 = 288, T3 = r.pick([1400, 1600, 1800]);
        const T2 = T1 * rp ** KG, T4 = T3 / rp ** KG, bwr = (T2 - T1) / (T3 - T4);
        return {
          prompt: t`An ideal Brayton cycle takes in air at ${T1} K, compresses it with pressure ratio ${rp}, and heats it to ${T3} K before the turbine. What fraction of the turbine's work does the compressor use (the back-work ratio)? (Give a percentage.)`,
          answer: bwr * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (1 - bwr) * 100, feedback: 'That is the share left over as net work. The back-work ratio is the compressor’s share.' }, { value: ((T2 - T1) / T3) * 100, feedback: t`Divide by the turbine's temperature *drop*, $T_3 - T_4$, not by $T_3$.` }],
          hints: [t`$T_2 = T_1r_p^{0.2857}$ and $T_4 = T_3/r_p^{0.2857}$.`, t`Compressor and turbine work are proportional to their temperature changes: ratio $= (T_2 - T_1)/(T_3 - T_4)$.`],
          teach: 'In a gas turbine the compressor consumes a large share of the turbine’s work — the back-work ratio — so component quality matters enormously.',
          explain: t`$T_2 = ${fmt(T2, 4)}$ K and $T_4 = ${fmt(T4, 4)}$ K, so the ratio is $\dfrac{${fmt(T2 - T1, 3)}}{${fmt(T3 - T4, 3)}} = ${fmt(bwr * 100, 3)}$ %. Gas turbines typically spend 40–60 % of their turbine work on the compressor; a few per cent of compressor or turbine inefficiency therefore eats a large part of the net output.`,
          visual: braytonPic(rp, T3, { T1 }),
        };
      },
    }),
    num({
      id: 'pump-work', difficulty: 3,
      gen(r) {
        const [name, rho, short] = r.pick([['liquid oxygen', 1141, 'LOX'], ['RP-1 kerosene', 810, 'RP-1']]), p1 = 0.3, p2 = r.pick([10, 15, 20]);
        const w = ((p2 - p1) * 1e6) / rho / 1000;          // kJ/kg
        const wIso = (TD.R / 0.028965) * 300 * Math.log(p2 / p1) / 1000;   // kJ/kg: air between the same pressures, isothermal at 300 K (the least it could take)
        return {
          prompt: t`A rocket engine's turbopump raises the pressure of ${name} (density ${rho} kg/m³) from ${p1} MPa to ${p2} MPa. What is the least work it must do per kilogram pumped? (A liquid barely changes volume: $W = V\,\Delta P$ for each kilogram's volume $V = 1/\rho$.)`,
          answer: w, units: 'kJ/kg', tol: { rel: 0.01 },
          errors: [{ value: (p2 * 1e6) / rho / 1000, feedback: t`Use the pressure *rise*, ${p2} − ${p1} MPa.` }, { value: ((p2 - p1) * 1e6 * rho) / 1000 / 1000, feedback: t`The volume of a kilogram is $1/\rho$, so divide by the density.` }],
          hints: [t`$V = 1/\rho$ per kilogram.`, t`$W = \Delta P/\rho = (${p2 - p1}\times10^6\ \text{Pa})/(${rho}\ \text{kg/m}^3)$.`],
          teach: 'Pumping a liquid costs very little work, because a kilogram of liquid has a tiny volume.',
          explain: t`$W = \Delta P/\rho = (${tex((p2 - p1) * 1e6, 3)}\ \text{Pa})/(${rho}\ \text{kg/m}^3) = ${fmt(w, 3)}$ kJ/kg. Compressing a kilogram of *air* between the same pressures would take at least ${fmt(wIso, 2)} kJ, even kept at 300 K throughout — ${fmt(wIso / w, 2)} times as much. That is the thermodynamic secret of the liquid rocket: its “compressor” works on liquid, so a small turbine can drive it, and nearly all the combustion energy is left for the nozzle.`,
          visual: { type: 'graph', params: { x: [0, 2], y: [0, p2 * 1.2], aspect: 'wide', xlabel: 'volume of 1 kg (L)', ylabel: 'P (MPa)', alt: 'A liquid being pumped to high pressure at almost constant volume', curves: [{ param: [`${(1000 / rho).toFixed(4)}`, `${p1} + ${p2 - p1}*t`], t: [0, 1], color: 'accent', width: 3, label: `${short}: ${fmt(1000 / rho, 2)} L/kg`, labelAt: 0.5, labelDx: 10, labelDy: 0 }], shade: [{ fn: String(p2), lower: String(p1), from: 0, to: +(1000 / rho).toFixed(4), color: 'gold', alpha: 0.3 }] }, caption: t`Pumping a liquid: the pressure rises at almost constant volume. The work per kilogram is the gold area $V\,\Delta P$ — thin, because a kilogram of liquid occupies only about a litre. (Not shown: a kilogram of air at room conditions occupies more than 800 litres.)` },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student says: “A higher peak temperature $T_3$ makes the ideal Brayton cycle more efficient, because the Carnot limit $1 - T_1/T_3$ rises.” What is wrong?`,
      visual: braytonPic(20, 1600, { caption: 'An ideal Brayton cycle. Raising T₃ moves state 3 to the right along the top isobar.' }),
      choices: [
        t`The ideal Brayton efficiency is $1 - r_p^{-(\gamma-1)/\gamma}$, set by the pressure ratio alone; a higher $T_3$ raises the work per kilogram, not the efficiency`,
        'A higher T₃ lowers the efficiency, because more heat must be rejected',
        t`The Carnot limit is $1 - T_3/T_1$`,
        'The Carnot limit does not apply to gas turbines',
      ],
      answer: 0,
      why: {
        1: t`The rejected heat grows in proportion: $Q_c/Q_h = T_1/T_2$ stays fixed.`,
        2: 'That would be negative. The Carnot limit is 1 − T_cold/T_hot.',
        3: 'It does apply — it is just not reached. The ideal Brayton cycle sits below it.',
      },
      hints: [t`What does the formula $e_{\text{Brayton}} = 1 - r_p^{-(\gamma-1)/\gamma}$ depend on?`, t`Raise $T_3$: the heat in, $nC_P(T_3 - T_2)$, and the heat out, $nC_P(T_4 - T_1)$, grow in the same proportion, because $T_4/T_3 = T_1/T_2$.`],
      teach: 'In the ideal Brayton cycle the pressure ratio sets the efficiency, while the turbine inlet temperature sets the work per kilogram of air.',
      explain: t`In the ideal cycle $e = 1 - T_1/T_2$ for any $T_3$. Real engines do gain efficiency from hotter turbines — because a hotter turbine allows a higher useful pressure ratio and swamps the fixed component losses — which is why so much effort goes into turbine blade cooling and ceramic coatings.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turbofan', difficulty: 2, transfer: true,
      gen(r) {
        const rp = r.pick([30, 40, 50]), e = braytonE(rp);
        return {
          prompt: t`A modern airliner engine compresses air through an overall pressure ratio of about ${rp}. What is the efficiency of the ideal Brayton cycle with that pressure ratio? ($\gamma = 1.40$; give a percentage.)`,
          answer: e * 100, units: '%', tol: { rel: 0.005 },
          errors: [{ value: (1 - rp ** -(G - 1)) * 100, feedback: t`The exponent is $(\gamma-1)/\gamma = 0.286$.` }],
          hints: [t`$e = 1 - r_p^{-0.2857}$.`],
          teach: 'A gas turbine’s ideal efficiency is fixed by its overall pressure ratio.',
          explain: t`$e = 1 - ${rp}^{-0.2857} = ${fmt(e * 100, 3)}$ %. Real engine cores reach about 50–55 %: component losses, cooling air bled to protect the turbine, and γ falling in the hot gas take the rest.`,
          visual: braytonPic(rp, 1700),
        };
      },
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const pc = r.pick([7, 10, 20]), pe = r.pick([0.07, 0.1]), g = 1.2;
        const e = braytonE(pc / pe, g);
        return {
          prompt: t`Thermodynamically, a liquid rocket engine is an open Brayton-like cycle: pumps raise the pressure of the liquid propellants, the chamber adds heat at roughly constant pressure, and the nozzle expands the gas adiabatically, making jet kinetic energy instead of shaft work. In an ideal nozzle each kilogram of gas turns $c_P(T_c - T_e)$ of its enthalpy into kinetic energy. For a chamber at ${pc} MPa exhausting at ${pe} MPa, with $\gamma = 1.2$ for the hot gas, what fraction of the gas's chamber enthalpy, $c_PT_c$, becomes jet kinetic energy? (Give a percentage.)`,
          answer: e * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: braytonE(pc / pe, 1.4) * 100, feedback: t`Use $\gamma = 1.2$ for hot combustion products, not 1.4.` }, { value: (1 - (pc / pe) ** -(g - 1)) * 100, feedback: t`The exponent is $(\gamma - 1)/\gamma = 1/6$ for a pressure ratio.` }],
          hints: [t`The fraction is $(T_c - T_e)/T_c = 1 - T_e/T_c$, and an adiabatic expansion gives $T_e/T_c = (p_e/p_c)^{(\gamma-1)/\gamma}$ (lesson M18.4).`, t`Pressure ratio ${fmt(pc / pe, 3)}; exponent $0.2/1.2 = 1/6$.`],
          teach: 'In an ideal nozzle the share of the gas’s enthalpy turned into jet kinetic energy is set by the ratio of chamber to exit pressure, exactly as a gas turbine’s efficiency is set by its pressure ratio.',
          explain: t`$1 - (${pe}/${pc})^{1/6} = ${fmt(e * 100, 3)}$ % — the same expression as the ideal Brayton efficiency, with $r_p = p_c/p_e$. The rest leaves in the hot exhaust, $c_PT_e$ per kilogram. (Measured against the heat the combustion actually releases, which starts from propellants near room temperature or colder rather than from 0 K, the fraction comes out a few points higher; dissociation and a drifting $\gamma$ in the real gas blur both figures.) Vacuum engines with very large nozzles push the pressure ratio into the thousands and convert more.`,
          visual: braytonPic(Math.round(pc / pe), 3500, { caption: 'A Brayton-like loop with the rocket’s pressure ratio, drawn for air-like gas as a sketch: in a real rocket, the “compression” is pumping liquid (almost no volume), and the gas is thrown away after the nozzle rather than cooled and reused.' }),
        };
      },
    }),
    mcq({
      id: 'cp-gas-generator', difficulty: 2,
      prompt: 'In a gas-generator-cycle rocket engine, a small share of the propellant is burned fuel-rich in a separate gas generator, at roughly 900–1100 K, to drive the turbopump’s turbine, and the turbine exhaust is then dumped. Why not drive the turbine with gas at the main chamber’s 3500 K, for a more efficient turbine?',
      visual: braytonPic(20, 1000, { caption: 'The turbine side of a turbopump is a Brayton-like expansion from the gas generator’s temperature (sketch for air-like gas).' }),
      choices: [
        'The turbine blades, rotating at tens of thousands of rpm, would lose their strength or melt: the turbine inlet temperature is limited by materials',
        'A hotter gas would make the turbine less efficient',
        'The second law forbids a turbine from using gas hotter than about 1100 K',
        'Fuel-rich combustion cannot be made hotter than 1100 K',
      ],
      answer: 0,
      why: {
        1: 'Hotter gas would let the turbine extract more work per kilogram, not less.',
        2: 'The second law limits efficiency through temperatures; it sets no ceiling on the gas temperature itself.',
        3: 'The mixture is made fuel-rich *on purpose*, to keep it cool enough for the blades. Burned near the right ratio it would be far hotter.',
      },
      hints: ['What has to sit in the hot gas stream and spin?'],
      teach: 'Turbine inlet temperature is limited by what the blades can survive — in rocket turbopumps as in jet engines.',
      explain: 'The blades carry enormous centrifugal loads and, unlike a jet engine’s, are usually uncooled; at main-chamber temperatures they would fail in moments. So the gas generator runs fuel-rich and cool, accepting some lost performance — and the dumped turbine exhaust, too, costs a little specific impulse. Staged-combustion engines recover that exhaust by sending it on into the main chamber.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §4.2 Heat Engines and §4.5 The Carnot Cycle', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-5-the-carnot-cycle' },
    { label: 'NASA Glenn Research Center: Brayton cycle', url: 'https://www.grc.nasa.gov/www/k-12/airplane/brayton.html' },
  ],
});
