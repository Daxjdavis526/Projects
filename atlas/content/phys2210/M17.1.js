// The ideal gas law: PV = nRT = Nk_BT, kelvin only, absolute pressure only —
// with liquid nitrogen's 700-fold expansion, helium pressurant and a
// stratospheric balloon.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, KB, ATM, MOLAR, LN2, bodiesPic, apart, sci } from './_thermal.js';
import { logLadder } from './_measure.js';

const t = String.raw;

// the worked example: one litre of liquid nitrogen, boiled and warmed to 20 °C at one atmosphere
const EX = { V: 1, T: 293.15 };
EX.m = LN2.rho * 1e-3 * EX.V;                       // 0.806 kg
EX.n = (EX.m * 1000) / MOLAR.N2;                    // 28.77 mol
EX.Vg = (EX.n * R * EX.T) / ATM;                    // 0.692 m³

// U.S. Standard Atmosphere 1976 (geometric altitude): pressure (kPa) and temperature (K)
const STD = { 0: [101.325, 288.15], 20: [5.5293, 216.65], 25: [2.5492, 221.55], 30: [1.197, 226.51] };
const ATM_PTS = [[0, 101.325], [5, 54.048], [10, 26.5], [15, 12.111], [20, 5.5293], [25, 2.5492], [30, 1.197]];   // [km, kPa]

/** Pressure against absolute temperature at fixed n and V: a straight line through absolute zero. */
function ptGraph(marks, caption) {
  return {
    type: 'graph',
    params: {
      x: [-20, 420], y: [-0.06, 1.15], aspect: 'wide', xlabel: 'T (K)', ylabel: 'P', yticks: 0.001,
      alt: 'Pressure of a sealed gas against absolute temperature: a straight line through absolute zero',
      curves: [{ fn: 'x/400', domain: [0, 400], color: 'accent', width: 2.8 }],
      vlines: marks.map(([T]) => ({ x: T, color: 'ink3' })),
      points: [{ x: 0, y: 0, r: 5, color: 'violet', label: 'absolute zero', labelDx: 8, labelDy: -12 }, ...marks.map(([T, label], i) => ({ x: T, y: T / 400, r: 5, color: 'gold', label, labelDx: i ? 10 : -52, labelDy: i ? 12 : -12 }))],
    },
    caption: caption ?? 'A sealed, rigid tank: pressure is proportional to the absolute temperature, so the line runs back to zero at 0 K (pressure axis without numbers).',
  };
}

export default lesson({
  id: 'phys2210.M17.1',
  title: 'The ideal gas law',
  minutes: 11, difficulty: 2,
  intro: t`A gas is mostly empty space with molecules flying through it. For any dilute gas — whatever it is made of — pressure, volume, temperature and the amount of gas are tied together by one equation, the **ideal gas law**:

$$PV = nRT = Nk_BT$$

It holds to within a percent or so for air, nitrogen or helium at everyday conditions, and fails only when a gas is squeezed hard or cooled close to liquefying. Two rules make it work: **$T$ must be absolute (kelvin)** — in Celsius the law would predict zero pressure at 0 °C — and **$P$ must be absolute pressure**, not the gauge reading above the atmosphere.`,
  symbols: [
    { tex: 'P', text: 'the **absolute** pressure of the gas, in pascals (Pa). A gauge reads the excess over the atmosphere: absolute = gauge + 101.3 kPa at sea level' },
    { tex: 'V', text: 'the volume the gas fills, in m³ (1 litre = 10⁻³ m³)' },
    { tex: 'n', text: 'the amount of gas, in moles (mol): mass ÷ molar mass, e.g. 28.0 g/mol for N₂, 4.00 g/mol for He' },
    { tex: 'R', text: 'the gas constant, 8.314 J/(mol·K) — exactly $N_Ak_B$' },
    { tex: 'T', text: 'the **absolute** temperature, in kelvin (K)' },
    { tex: 'N', text: 'the number of molecules, $N = nN_A$, with $N_A = 6.022\\times10^{23}$ per mole' },
    { tex: 'k_B', text: 'Boltzmann’s constant, $1.381\\times10^{-23}$ J/K: the gas constant per molecule' },
  ],
  why: 'Pressurant budgets, tank blowdown, the gas a litre of liquid nitrogen makes when it boils, and the thrust of a cold-gas thruster all start from PV = nRT.',
  visual: {
    type: 'therm-gas',
    title: 'A litre of gas: squeeze it, heat it, swap the molecules',
    lead: t`Each dot stands for $2\times10^{-4}$ mol of molecules flying about a box of up to one litre. The gold bar is the pressure measured from their impacts on the walls; the white tick is $nRT/V$. Change the volume, the temperature, the number of molecules or the kind of gas, and watch the two agree.`,
    tasks: [
      'Halve the volume (1 L → 0.5 L): impacts come twice as often and the pressure doubles — Boyle’s law.',
      'Double the absolute temperature (150 K → 300 K): the pressure doubles. Then go from 283 K to 293 K (10 °C to 20 °C): it rises only 3.5 %.',
      'Switch from helium to xenon at the same n, T and V: the pressure stays the same, though a xenon atom is 33 times heavier.',
    ],
    params: { gas: 'N2', gases: ['He', 'N2', 'Xe'], controls: ['T', 'V', 'N', 'gas', 'play'], Tmin: 100, Tmax: 600, hist: false, readouts: ['n', 'V', 'T', 'P', 'Pideal'] },
    caption: 'Each dot stands for about 1.2 × 10²⁰ molecules, enormously enlarged and slowed — all in proportion. Collisions are perfectly elastic. The dots’ own size pushes the measured pressure 1–4 % above nRT/V (the van der Waals b effect); real gases near room conditions miss it by under 0.1 %. Moving the wall here leaves the molecules’ speeds alone, as a slow move in contact with a bath at T would.',
  },
  example: {
    prompt: t`One litre of liquid nitrogen (density ${LN2.rho} kg/m³) spills in a lab, boils and warms to ${EX.T - 273.15} °C at one atmosphere (101.3 kPa). What volume of gas does it make?`,
    visual: {
      type: 'graph',
      params: {
        x: [-0.5, 12.5], y: [-1.6, 10], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
        alt: 'Two cubes drawn to scale: one litre of liquid and the gas it becomes',
        shade: [{ fn: '1', lower: '0', from: 0, to: 1, color: 'accent', alpha: 0.7 }, { fn: String(+Math.cbrt(EX.Vg * 1000).toFixed(3)), lower: '0', from: 2.5, to: +(2.5 + Math.cbrt(EX.Vg * 1000)).toFixed(3), color: 'teal', alpha: 0.25 }],
        points: [{ x: 0.5, y: -0.6, r: 0.01, color: 'accent', label: '1 L of liquid', labelDx: -36, labelDy: 0 }, { x: +(2.5 + Math.cbrt(EX.Vg * 1000) / 2).toFixed(3), y: -0.6, r: 0.01, color: 'teal', label: 'the gas it becomes, as a cube', labelDx: -92, labelDy: 0 }],
      },
      caption: 'The two volumes as cubes, drawn to scale: a 10 cm cube of liquid nitrogen becomes a cube of gas nearly 90 cm on a side.',
    },
    steps: [
      { label: 'Moles', text: t`Mass: $m = \rho V = (${LN2.rho}\ \text{kg/m}^3)(10^{-3}\ \text{m}^3) = ${EX.m}$ kg. With $M = 28.0$ g/mol: $n = ${EX.m * 1000}\ \text{g} / 28.01\ \text{g/mol} = ${fmt(EX.n, 4)}$ mol.` },
      { label: 'Absolute units', text: t`$T = ${EX.T - 273.15} + 273.15 = ${EX.T}$ K; $P = 101\,325$ Pa (absolute).` },
      { label: 'Ideal gas law', text: t`$V = \dfrac{nRT}{P} = \dfrac{(${fmt(EX.n, 4)})(8.314)(${EX.T})}{101\,325} = ${fmt(EX.Vg, 3)}\ \text{m}^3$ — about **${Math.round(EX.Vg * 1000)} litres**.` },
      { label: 'Sense check', text: t`A mole of any gas at room conditions fills about 24 L, and 28.8 mol × 24 L ≈ 690 L. ✓ That ~700-fold expansion is why liquid nitrogen must never be sealed in a closed container, and why a spill in a small room can push out the air you breathe.` },
    ],
    answer: t`About $${fmt(EX.Vg, 3)}\ \text{m}^3$: ${Math.round(EX.Vg * 1000)} litres of gas from one litre of liquid.`,
  },
  practice: [
    num({
      id: 'moles-bottle', difficulty: 1,
      gen(r) {
        const V = r.pick([10, 20, 40]), P = r.pick([1, 2, 3, 5]), Tc = r.pick([15, 20, 25]);
        const n = (P * 1e6 * V * 1e-3) / (R * (Tc + 273.15));
        return {
          prompt: t`A ${V} L helium bottle holds gas at ${P} MPa (absolute) and ${Tc} °C. How many moles of helium are in it? (Treat helium as ideal: at these pressures that is good to about 2 %.)`,
          answer: n, units: 'mol', tol: { rel: 0.01 },
          errors: apart([{ value: (P * 1e6 * V * 1e-3) / (R * Tc), feedback: 'The gas law needs the absolute temperature: add 273.15 to the Celsius value.' }], n),
          hints: [t`$n = PV/(RT)$ in SI units: $P$ in Pa, $V$ in m³, $T$ in K.`, t`$${P}$ MPa $= ${P}\times10^{6}$ Pa; ${V} L $= ${V / 1000}$ m³; $T = ${(Tc + 273.15).toFixed(2)}$ K.`],
          teach: 'Use PV = nRT in SI units, with absolute pressure and absolute temperature.',
          explain: t`$n = \dfrac{(${P}\times10^{6})(${V / 1000})}{(8.314)(${(Tc + 273.15).toFixed(2)})} = ${fmt(n, 3)}$ mol — about ${fmt(n * MOLAR.He / 1000, 2)} kg of helium.`,
          visual: { type: 'therm-gas', params: { gas: 'He', T: Tc + 273.15, tag: 'helium', gauge: false, hist: false, flashes: false }, caption: 'Helium atoms in a box (a model, not the bottle itself): dots enormously enlarged and slowed.' },
        };
      },
    }),
    mcq({
      id: 'celsius-trap', difficulty: 2,
      prompt: 'A sealed, rigid tank of nitrogen at 20 °C warms in the sun to 40 °C. Its pressure:',
      choices: ['Rises by about 7 %', 'Doubles', 'Rises by 20 kPa, one kilopascal per degree', 'Stays the same, because the tank is sealed'],
      answer: 0,
      why: {
        1: 'The Celsius number doubled, but pressure is proportional to the *absolute* temperature, which rose from 293 K to 313 K.',
        2: 'There is no fixed kilopascal-per-degree rule: the rise is proportional to the starting pressure.',
        3: 'Sealed means n and V are fixed — but with T rising, P = nRT/V must rise too.',
      },
      hints: ['With n and V fixed, P is proportional to T. Which T?'],
      teach: 'At fixed n and V, pressure is proportional to the absolute temperature — never to the Celsius number.',
      explain: t`$P_2/P_1 = T_2/T_1 = 313.15/293.15 = 1.068$: a 6.8 % rise. A propellant tank’s pressure-relief valve must allow for it.`,
      visual: ptGraph([[293.15, '20 °C'], [313.15, '40 °C']]),
    }),
    num({
      id: 'warm-ullage', difficulty: 2,
      gen(r) {
        const P1 = r.pick([250, 300, 350]), T1 = r.pick([10, 15, 20]), T2 = r.pick([40, 45, 50]);
        const P2 = (P1 * (T2 + 273.15)) / (T1 + 273.15);
        return {
          prompt: t`The helium in a sealed tank’s ullage is at ${P1} kPa (absolute) and ${T1} °C. Sunlight warms it to ${T2} °C. What is its pressure now?`,
          answer: P2, units: 'kPa', tol: { rel: 0.005 },
          errors: apart([{ value: (P1 * T2) / T1, feedback: 'Celsius temperatures can’t go in a ratio: convert both to kelvin.' }], P2),
          hints: [t`$P_2 = P_1\,T_2/T_1$ with both temperatures in kelvin.`],
          teach: 'For a sealed rigid container, P₂/P₁ = T₂/T₁ with absolute temperatures.',
          explain: t`$P_2 = ${P1}\times\dfrac{${(T2 + 273.15).toFixed(2)}}{${(T1 + 273.15).toFixed(2)}} = ${fmt(P2, 4)}$ kPa — a ${fmt((P2 / P1 - 1) * 100, 2)} % rise for a ${T2 - T1}-kelvin warm-up.`,
          visual: ptGraph([[T1 + 273.15, `${T1} °C`], [T2 + 273.15, `${T2} °C`]]),
        };
      },
    }),
    num({
      id: 'boyle', difficulty: 2,
      gen(r) {
        const V1 = r.pick([2, 3, 4]), V2 = r.pick([0.25, 0.4, 0.5]), P1 = 101;
        const P2 = (P1 * V1) / V2;
        return {
          prompt: t`A ${V1}.0 L sample of nitrogen at ${P1} kPa is compressed slowly, so that it stays at 20 °C, to ${V2} L. What is its pressure now?`,
          answer: P2, units: 'kPa', tol: { rel: 0.005 },
          errors: [{ value: (P1 * V2) / V1, feedback: 'Squeezing a gas raises its pressure: at fixed n and T, PV is constant, so P₂ = P₁V₁/V₂.' }],
          hints: ['At fixed n and T, PV stays constant (Boyle’s law).'],
          teach: 'At constant temperature, pressure and volume are inversely proportional: P₁V₁ = P₂V₂.',
          explain: t`$P_2 = P_1V_1/V_2 = (${P1})(${V1})/${V2} = ${fmt(P2, 4)}$ kPa: ${fmt(V1 / V2, 2)} times smaller, ${fmt(V1 / V2, 2)} times the pressure.`,
          visual: bodiesPic({ bodies: [{ name: `${V1}.0 L at ${P1} kPa`, color: 'accent', w: Math.cbrt(V1), h: Math.cbrt(V1) }, { name: `${V2} L, same T`, temp: 'P = ?', color: 'teal', w: Math.cbrt(V2), h: Math.cbrt(V2) }], flows: [{ from: 0, to: 1, label: 'squeeze' }], caption: 'The same gas before and after, volumes drawn as cubes to scale.' }),
        };
      },
    }),
    num({
      id: 'cold-vapour', difficulty: 3,
      gen(r) {
        const Tc = r.pick([15, 20, 25]);
        const ratio = (Tc + 273.15) / LN2.Tb;
        return {
          prompt: t`Nitrogen gas boiling off a dewar leaves at 77.4 K. At the same pressure, how many times denser is it than nitrogen at the room’s ${Tc} °C?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: 1 / ratio, feedback: 'Upside down: colder gas at the same pressure is *denser*, because the same molecules are packed into less volume.' }],
          hints: [t`Density $\rho = m/V = PM/(RT)$: at fixed $P$ and $M$, $\rho \propto 1/T$.`, 'Use absolute temperatures for both.'],
          teach: 'At fixed pressure, a gas’s density is inversely proportional to its absolute temperature.',
          explain: t`$\rho_\text{cold}/\rho_\text{room} = T_\text{room}/T_\text{cold} = ${(Tc + 273.15).toFixed(2)}/77.36 = ${fmt(ratio, 3)}$. Cold boil-off gas is heavy: it pours along the floor and pools in low places, a real asphyxiation hazard. (So close to its boiling point the real gas is about 4 % denser still; the ideal-gas law starts to strain.)`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 320], y: [0, 6], aspect: 'wide', xlabel: 'T (K)', ylabel: 'ρ (kg/m³)',
              alt: 'Density of nitrogen gas at one atmosphere against temperature',
              curves: [{ fn: '101325*0.0280134/(8.314*x)', domain: [50, 320], color: 'accent', width: 2.6, label: 'N₂ at 1 atm (ideal gas)', labelAt: 150, labelDx: 8, labelDy: -12 }],
              vlines: [{ x: 77.36, label: '77.4 K', color: 'ink3' }, { x: Tc + 273.15, label: `${Tc} °C`, color: 'ink3' }],
            },
            caption: 'At fixed pressure, density falls as 1/T. The two dashed lines mark the boil-off gas and the room.',
          },
        };
      },
    }),
    mcq({
      id: 'gauge-absolute', difficulty: 2,
      prompt: t`A nitrogen tank’s gauge reads 200 kPa at sea level, where the atmosphere is 101 kPa. Which pressure belongs in $PV = nRT$?`,
      choices: ['301 kPa', '200 kPa', '99 kPa', '101 kPa'],
      answer: 0,
      why: {
        1: 'A gauge reads the pressure *above* the atmosphere (gauge pressure). The gas law needs the total, absolute pressure.',
        2: 'Subtracting goes the wrong way: the gas pushes with the gauge reading *plus* the atmosphere’s pressure.',
        3: 'That is only the atmosphere’s share; the gauge says the tank is 200 kPa above that.',
      },
      hints: ['A gauge open to the air reads zero, not 101 kPa. What does that tell you about what it measures?'],
      teach: 'The gas laws use absolute pressure: absolute = gauge + atmospheric.',
      explain: t`$P_\text{abs} = P_\text{gauge} + P_\text{atm} = 200 + 101 = 301$ kPa. Rocket engineers write the difference into their units: “psig” for gauge, “psia” for absolute.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [-20, 340], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          alt: 'A pressure scale from vacuum, through the atmosphere, to the tank',
          curves: [{ param: ['3', 't'], t: [0, 320], color: 'ink3', width: 2 }, { param: ['6.5', 't'], t: [0, 320], color: 'ink3', width: 2 }, { fn: '101', domain: [2.6, 7], color: 'ink4', width: 1, dash: true }, { fn: '301', domain: [2.6, 7], color: 'ink4', width: 1, dash: true }, { fn: '0', domain: [2.6, 7], color: 'ink4', width: 1, dash: true }],
          points: [
            { x: 3, y: 330, r: 0.01, color: 'ink2', label: 'absolute', labelDx: -24, labelDy: 0 }, { x: 6.5, y: 330, r: 0.01, color: 'ink2', label: 'gauge', labelDx: -16, labelDy: 0 },
            { x: 3, y: 0, r: 4.5, color: 'violet', label: '0 kPa', labelDx: 8, labelDy: 0 }, { x: 6.5, y: 0, r: 4.5, color: 'violet', label: '−101 kPa', labelDx: 8, labelDy: 0 }, { x: 0.1, y: 0, r: 0.01, color: 'violet', label: 'vacuum', labelDx: 0, labelDy: 0 },
            { x: 3, y: 101, r: 4.5, color: 'teal', label: '101 kPa', labelDx: 8, labelDy: 0 }, { x: 6.5, y: 101, r: 4.5, color: 'teal', label: '0 kPa', labelDx: 8, labelDy: 0 }, { x: 0.1, y: 101, r: 0.01, color: 'teal', label: 'the air outside', labelDx: 0, labelDy: 0 },
            { x: 3, y: 301, r: 4.5, color: 'warn', label: '?', labelDx: 8, labelDy: 0 }, { x: 6.5, y: 301, r: 4.5, color: 'warn', label: '200 kPa', labelDx: 8, labelDy: 0 }, { x: 0.1, y: 301, r: 0.01, color: 'warn', label: 'the tank', labelDx: 0, labelDy: 0 },
          ],
        },
        caption: 'The same pressures on two scales. A gauge measures from the atmosphere; absolute pressure is measured from vacuum. Heights to scale.',
      },
    }),
    num({
      id: 'vacuum-density', difficulty: 2,
      gen(r) {
        const e = r.pick([-3, -5, -7]), P = 10 ** e;
        const ncm3 = (P / (KB * 293.15)) * 1e-6;
        return {
          prompt: t`A space-simulation vacuum chamber is pumped down to $10^{${e}}$ Pa at 20 °C. How many gas molecules are still in each cubic centimetre?`,
          answer: ncm3, units: 'cm^-3', tol: { rel: 0.01 },
          hints: [t`Divide $PV = Nk_BT$ by $V$: the number per volume is $N/V = P/(k_BT)$.`, t`That gives molecules per m³; a cubic centimetre is $10^{-6}$ m³.`],
          teach: 'The number density of an ideal gas is N/V = P/(k_BT), whatever the gas.',
          explain: t`$N/V = \dfrac{10^{${e}}}{(1.381\times10^{-23})(293.15)} = ${sci(ncm3 * 1e6, 3)}\ \text{m}^{-3} = ${sci(ncm3, 3)}$ per cm³. Even “high vacuum” is crowded by everyday standards; the solar wind near Earth carries only about five particles per cm³.`,
          visual: logLadder([
            { label: 'air at sea level, 2.5 × 10²⁵ m⁻³', value: 2.5e25 },
            { label: 'solar wind near Earth, about 5 × 10⁶ m⁻³', value: 5e6, color: 'gold' },
          ], { from: 4, to: 27, rungs: false, caption: 'Number densities on a logarithmic scale, molecules per cubic metre. Your chamber lies somewhere between. Labels sit just above their dots.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-balloon', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([20, 25, 30]);
        const [P2, T2] = STD[h], [P1, T1] = STD[0];
        const ratio = (P1 / P2) * (T2 / T1);
        return {
          prompt: t`A stratospheric research balloon is partly filled with helium at sea level (101.3 kPa, 15 °C). It rises to ${h} km, where the standard atmosphere has ${P2} kPa and ${T2} K, and its helium settles to the surrounding pressure and temperature. By what factor has the helium’s volume grown?`,
          answer: ratio, tol: { rel: 0.01 },
          errors: apart([
            { value: P1 / P2, feedback: 'That is Boyle’s law alone. The gas has also cooled, which shrinks it: multiply by T₂/T₁.' },
            { value: (P1 / P2) * (T1 / T2), feedback: 'The temperature ratio is upside down: colder gas takes up *less* room.' },
          ], ratio),
          hints: ['The amount of helium is fixed, so PV/T is constant.', t`$\dfrac{V_2}{V_1} = \dfrac{P_1}{P_2}\cdot\dfrac{T_2}{T_1}$, with $T_1 = 288.15$ K.`],
          teach: 'For a fixed amount of gas, PV/T is constant: V₂/V₁ = (P₁/P₂)(T₂/T₁).',
          explain: t`$\dfrac{V_2}{V_1} = \dfrac{101.325}{${P2}}\times\dfrac{${T2}}{288.15} = ${fmt(P1 / P2, 4)}\times${fmt(T2 / T1, 4)} = ${fmt(ratio, 3)}$. That is why a high-altitude balloon looks limp and nearly empty at launch: it must have room to swell ${Math.round(ratio)}-fold.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 110], y: [0, 33], aspect: 'wide', xlabel: 'pressure (kPa)', ylabel: 'altitude (km)',
              alt: 'Atmospheric pressure falling with altitude, from the standard atmosphere',
              curves: ATM_PTS.slice(1).map(([z, p], i) => ({ param: [`${ATM_PTS[i][1]} + t*(${p - ATM_PTS[i][1]})`, `${ATM_PTS[i][0]} + t*${z - ATM_PTS[i][0]}`], t: [0, 1], color: 'accent', width: 2.2 })),
              points: [...ATM_PTS.map(([z, p]) => ({ x: p, y: z, r: 3, color: 'accent' })), { x: 101.325, y: 0, r: 5.5, color: 'warn', label: 'launch', labelDx: -50, labelDy: -12 }, { x: P2, y: h, r: 5.5, color: 'gold', label: `${h} km`, labelDx: 10, labelDy: 0 }],
            },
            caption: 'Pressure against altitude in the U.S. Standard Atmosphere (1976), every 5 km, joined by straight lines. Half the air lies below about 5.5 km.',
          },
        };
      },
    }),
    num({
      id: 'cp-pressurant', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([2, 5, 8]), P = r.pick([250, 300, 350]), T = r.pick([150, 200, 250]);
        const m = (P * 1000 * V * MOLAR.He) / (R * T) / 1000;
        return {
          prompt: t`A rocket stage keeps its ${V} m³ propellant-tank ullage at ${P} kPa (absolute) with helium pressurant, which has cooled to ${T} K against the cold propellant. What mass of helium is in the ullage?`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: apart([{ value: (P * 1000 * V * MOLAR.He) / (R * 293.15) / 1000, feedback: `Use the helium’s actual temperature, ${T} K, not room temperature: cold gas is denser.` }], m),
          hints: [t`Moles first: $n = PV/(RT)$.`, t`Then mass: $m = nM$ with $M = 4.00$ g/mol $= 4.00\times10^{-3}$ kg/mol.`],
          teach: 'Mass of a gas = PVM/(RT): cold pressurant is denser, so a cold ullage holds more of it.',
          explain: t`$n = \dfrac{(${P}\times10^{3})(${V})}{(8.314)(${T})} = ${fmt((P * 1000 * V) / (R * T), 4)}$ mol, so $m = n\times0.004 = ${fmt(m, 3)}$ kg. Cold helium stores more mass per litre — one reason launchers keep their helium bottles immersed in the cryogenic propellant.`,
          visual: { type: 'therm-gas', params: { gas: 'He', T, tag: 'helium pressurant', gauge: false, hist: false }, caption: 'Helium atoms in a box (a model): enlarged and slowed, all in proportion.' },
        };
      },
    }),
    mcq({
      id: 'cp-same-pressure', difficulty: 2,
      prompt: 'Two identical rigid tanks at the same temperature hold the same number of moles: one of helium (4 g/mol), one of xenon (131 g/mol). Which has the higher pressure?',
      choices: ['Neither: their pressures are equal', 'The xenon: its heavier atoms hit the walls harder', 'The helium: its atoms move faster', 'The xenon, by a factor of 33, the ratio of the molar masses'],
      answer: 0,
      why: {
        1: 'Each xenon atom does hit harder — but, being slower, hits less often. The two effects cancel exactly.',
        2: 'Helium atoms are faster and hit more often, but each hit delivers less momentum. Again, they cancel.',
        3: 'Mass does not appear in PV = nRT at all: only the number of molecules counts.',
      },
      hints: ['Look at PV = nRT. Which quantities differ between the tanks?'],
      teach: 'At the same n, V and T every ideal gas has the same pressure, whatever its molecules weigh.',
      explain: t`$P = nRT/V$ with the same $n$, $T$ and $V$: equal. Lesson M17.2 shows why — heavier molecules strike harder but proportionally less often — and the Explore box shows it directly.`,
      visual: { type: 'therm-gas', params: { gas: 'Xe', T: 300, tag: 'xenon', gauge: false, hist: false }, caption: 'Xenon atoms in a box (a model): enlarged and slowed, all in proportion.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §2.1 Molecular Model of an Ideal Gas', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-1-molecular-model-of-an-ideal-gas' },
    { label: 'NIST: CODATA values of R, k_B and N_A (exact since 2019)', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'NIST Chemistry WebBook: nitrogen (liquid density at the boiling point)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
    { label: 'U.S. Standard Atmosphere, 1976 (NOAA/NASA/USAF)', url: 'https://ntrs.nasa.gov/citations/19770009539' },
  ],
});
