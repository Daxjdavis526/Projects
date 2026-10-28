// Heat capacities and latent heat: C_V = (∂U/∂T)_V, C_P = (∂H/∂T)_P with the
// enthalpy H = U + PV, C_P = C_V + Nk for an ideal gas, and latent heat as
// ΔH — applied to the boil-off of cryogenic propellants.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { heatingCurve, vesselPic } from '../phys2210/_thermal.js';
import { R, MOLAR, LN2, LOX, LH2, ATM, r4, apart } from './_count.js';

const t = String.raw;
// propellants at their normal boiling points: name, TeX, K, J/kg, kg/m³, kg/mol
const PROP = {
  LH2: ['liquid hydrogen', t`\text{LH}_2`, LH2.Tb, LH2.Lv, LH2.rho, MOLAR.H2 / 1000, 'H₂'],
  LOX: ['liquid oxygen', t`\text{LOX}`, LOX.Tb, LOX.Lv, LOX.rho, MOLAR.O2 / 1000, 'O₂'],
  LN2: ['liquid nitrogen', t`\text{LN}_2`, LN2.Tb, LN2.Lv, LN2.rho, MOLAR.N2 / 1000, 'N₂'],
};
const DAY = 86400;
const perW = (k) => (DAY / (PROP[k][3] * PROP[k][4])) * 1000;      // litres of liquid boiled per day per watt
const pdvShare = (k) => { const [, , Tb, L, rho, M] = PROP[k]; return ((R * Tb) / M - ATM / rho) / L; };

// boil-off (litres of liquid per day) against heat leak, one line per propellant
function boilGraph({ mark = null, sliders, readouts, caption }) {
  const lines = ['LH2', 'LOX', 'LN2'].map((k, i) => ({ fn: `${r4(perW(k))}*x`, color: ['accent', 'warn', 'teal'][i], label: PROP[k][0], labelAt: [150, 120, 120][i], labelDx: [-110, -20, -20][i], labelDy: [-12, 16, -14][i] }));
  return {
    type: 'graph',
    params: { x: [0, 200], y: [0, 600], aspect: 'wide', xlabel: 'heat leak into the tank (W)', ylabel: 'liquid boiled off (L/day)', axesAt: 'edge', curves: lines, ...(mark !== null ? { vlines: [{ x: mark, label: typeof mark === 'number' ? `${mark} W` : '', color: 'gold' }] } : {}), ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}) },
    caption: caption ?? 'Litres of liquid boiled off per day for a steady heat leak, at 1 atm: Q = mL with L and the liquid densities at the normal boiling points (NIST, rounded). Hydrogen’s line is steepest: low latent heat and very low density.',
  };
}

// the worked example: one kilogram of nitrogen boiled at 1 atm
const EXN = { M: MOLAR.N2 / 1000 };
EXN.pdv = (R * LN2.Tb) / EXN.M - ATM / LN2.rho; EXN.dU = LN2.Lv - EXN.pdv; EXN.cp = (3.5 * R) / EXN.M; EXN.warm = EXN.cp * (300 - LN2.Tb);
const ln2Segs = [
  { T0: 70, T1: LN2.Tb, dQ: (LN2.c * (LN2.Tb - 70)) / 1000, label: 'liquid' },
  { T0: LN2.Tb, T1: LN2.Tb, dQ: LN2.Lv / 1000, label: 'boiling at 77 K' },
  { T0: LN2.Tb, T1: 150, dQ: (EXN.cp * (150 - LN2.Tb)) / 1000, label: 'vapour', dx: -30, dy: 16 },
];

export default lesson({
  id: 'phys3700.T1.5',
  title: 'Heat capacities and latent heat',
  minutes: 12, difficulty: 3,
  intro: t`A heat capacity is the heat per degree, $C = Q/\Delta T$ — but the heat depends on the process, so “the” heat capacity needs a condition. At constant volume no work is done and $C_V = (\partial U/\partial T)_V$. At constant pressure the system also pushes its surroundings back, and the natural bookkeeping quantity is the **enthalpy** $H = U + PV$:

$$C_P = \left(\frac{\partial H}{\partial T}\right)_P.$$

For an ideal gas $C_P = C_V + Nk$. When a substance boils at fixed pressure, heat goes in with no rise in temperature: the **latent heat** $L$ per kilogram is the enthalpy change $\Delta H$, which includes the work of pushing the atmosphere back. For cryogenic propellants, $L$ decides how fast a tank boils away.`,
  symbols: [
    { tex: 'C_V,\\ C_P', text: 'heat capacities at constant volume and constant pressure, J/K (per mole: J/(mol·K); per kilogram: J/(kg·K))' },
    { tex: 'H = U + PV', text: 'the enthalpy, in J: energy plus the work $PV$ it took to make room for the system; at constant $P$, $Q = \\Delta H$' },
    { tex: '\\left(\\frac{\\partial H}{\\partial T}\\right)_P', text: 'how $H$ changes with $T$ while $P$ is held fixed — the subscript names what is held constant' },
    { tex: 'Nk', text: 'for an ideal gas, $C_P - C_V = Nk$ (or $R$ per mole): the extra heat that becomes expansion work' },
    { tex: 'L', text: 'latent heat of vaporization, in J/kg: $\\Delta H$ per kilogram turned from liquid to vapour at fixed $P$ and $T$' },
  ],
  why: 'Enthalpy is the quantity engineers tabulate for propellants, turbines and nozzles, because almost everything there happens at (locally) constant pressure.',
  visual: {
    ...boilGraph({
      mark: 'Q',
      sliders: [{ key: 'Q', label: 'Heat leak $\\dot Q$', min: 0, max: 200, step: 1, value: 50, unit: '\\text{W}', explain: 'The steady heat flow into the liquid through the tank’s insulation, supports and plumbing.' }],
      readouts: ['LH2', 'LOX', 'LN2'].map((k) => ({ label: `$${PROP[k][1]}$ (L/day)`, expr: `${r4(perW(k))}*Q`, digits: 3 })),
    }),
    title: 'How fast does a cryogenic tank boil away?',
    lead: t`Every watt that leaks into a cryogenic tank boils liquid at constant pressure: $\dot m = \dot Q/L$. The lines show the *volume* of liquid lost per day for three propellants.`,
    tasks: [
      'Set 50 W: a hydrogen tank loses about 137 litres a day, an oxygen tank only 18.',
      'Compare per kilogram as well: hydrogen’s latent heat (446 kJ/kg) is actually twice oxygen’s — it loses on volume because the liquid is 16 times less dense.',
      'Find the heat leak that boils 100 L of hydrogen a day: about 37 W, the power of a dim light bulb.',
    ],
  },
  example: {
    prompt: t`One kilogram of liquid nitrogen boils at 1 atm and 77.4 K, taking in $L = ${LN2.Lv / 1000}$ kJ. How much of that is work pushing back the atmosphere, and how much is the change in internal energy? Then compare $L$ with the heat needed to warm the vapour to 300 K.`,
    visual: heatingCurve({ segs: ln2Segs, unit: 'K', caption: 'One kilogram of nitrogen heated at 1 atm, from 70 K liquid to 150 K vapour. During the flat step heat goes in at constant temperature. Specific heats taken as constant within each phase.' }),
    steps: [
      { label: 'Enthalpy', text: t`At constant pressure $Q = \Delta H = \Delta U + P\Delta V$, so $L = \Delta U + P\Delta V$ per kilogram.` },
      { label: 'The push', text: t`The vapour, as an ideal gas, has $PV = (m/M)RT = (1/0.02801)(8.314)(77.4) = ${fmt((R * LN2.Tb) / EXN.M / 1000, 3)}$ kJ; the liquid’s $PV$ is only $P/\rho = ${fmt(ATM / LN2.rho / 1000, 2)}$ kJ. So $P\Delta V \approx ${fmt(EXN.pdv / 1000, 3)}$ kJ.` },
      { label: 'Internal energy', text: t`$\Delta U = L - P\Delta V = ${LN2.Lv / 1000} - ${fmt(EXN.pdv / 1000, 3)} = ${fmt(EXN.dU / 1000, 3)}$ kJ: ${Math.round((100 * EXN.dU) / LN2.Lv)}% of the latent heat pulls molecules apart, ${Math.round((100 * EXN.pdv) / LN2.Lv)}% pushes the atmosphere back.` },
      { label: 'Warming the vapour', text: t`$c_P = \tfrac72R/M = ${Math.round(EXN.cp)}$ J/(kg·K), so heating the vapour from 77 K to 300 K at constant pressure takes $${Math.round(EXN.cp)}\times${fmt(300 - LN2.Tb, 3)} = ${Math.round(EXN.warm / 1000)}$ kJ — **more than the latent heat itself**.` },
      { label: 'Sense check', text: t`That is why cryogenic systems route the cold boil-off gas through heat exchangers: its sensible heat is worth more than the boiling.` },
    ],
    answer: t`$P\Delta V \approx ${fmt(EXN.pdv / 1000, 3)}$ kJ and $\Delta U \approx ${fmt(EXN.dU / 1000, 3)}$ kJ; warming the vapour to room temperature takes another $${Math.round(EXN.warm / 1000)}$ kJ.`,
  },
  practice: [
    num({
      id: 'q-constant-p', difficulty: 2,
      gen(r) {
        const [name, f] = r.pick([['helium', 3], ['nitrogen', 5], ['argon', 3], ['oxygen', 5]]), n = r.pick([0.5, 1, 2, 3]), dT = r.pick([20, 40, 50, 80]);
        const Q = n * (f / 2 + 1) * R * dT;
        return {
          prompt: t`How much heat warms ${n} mol of ${name} by $${dT}$ K at constant pressure? (Room temperature: vibrations frozen.)`,
          answer: Q, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: n * (f / 2) * R * dT, feedback: t`That is $nC_V\Delta T$, the constant-volume value. At constant pressure the gas also expands: $C_P = C_V + R$.` }, { value: n * (f / 2 + 1) * R * dT * (f === 3 ? 7 / 5 : 5 / 7), feedback: `Check the degrees of freedom for ${name}.` }], Q),
          hints: [t`$C_P = C_V + R = (\tfrac f2 + 1)R$ per mole.`, f === 3 ? t`Monatomic: $C_P = \tfrac52R$.` : t`Diatomic: $C_P = \tfrac72R$.`],
          teach: t`At constant pressure, $Q = nC_P\Delta T$ with $C_P = C_V + R$.`,
          explain: t`$Q = n C_P\Delta T = (${n})(${f / 2 + 1})(8.314)(${dT}) = ${fmt(Q, 4)}$ J.`,
          visual: { type: 'therm-pv', params: { mode: 'process', gas: f === 3 ? 'He' : 'air', n, start: { P: 100, T: 300 }, process: 'isobaric', end: { T: 300 + dT }, drag: false, readouts: [], isoLabels: false, areaLabel: 'W by gas' }, caption: 'Warming at constant pressure: the gas expands, and the shaded area is the work it does on its surroundings — energy that the heat must also supply.' },
        };
      },
    }),
    mcq({
      id: 'why-cp', difficulty: 2,
      prompt: t`Why is $C_P$ larger than $C_V$ for a gas?`,
      choices: [
        'At constant pressure the gas expands as it warms, so some of the heat leaves again as work',
        'Pressure makes the molecules harder to speed up',
        'At constant pressure more degrees of freedom are active',
        'It is not always: for a monatomic gas they are equal',
      ],
      answer: 0,
      why: { 1: 'The molecules do not care about the container’s pressure; the difference is work done on the surroundings.', 2: 'The same degrees of freedom hold energy in both cases.', 3: t`For helium $C_V = \tfrac32R$ and $C_P = \tfrac52R$: they differ by $R$ for every ideal gas.` },
      hints: ['What does a gas do when it warms at constant pressure?', t`$Q = \Delta U + P\Delta V$ at constant $P$.`],
      teach: t`$C_P - C_V$ pays for the expansion work, $P\,\Delta V = Nk\,\Delta T$ for an ideal gas.`,
      explain: t`At constant volume all the heat raises $U$. At constant pressure the gas also expands, doing work $P\Delta V = Nk\Delta T$ on its surroundings, so it needs $Nk$ more heat per kelvin.`,
      visual: { type: 'therm-pv', params: { mode: 'paths', gas: 'air', n: 0.04, states: { A: { P: 100, V: 1 }, B: { P: 150, V: 1 }, C: { P: 100, V: 1.5 } }, paths: [{ from: 'A', legs: [['isochoric', 'B']], label: 'constant V' }, { from: 'A', legs: [['isobaric', 'C']], label: 'constant P' }], show: 'all', readouts: [], isotherms: [300, 450], isoLabels: false, vrange: [0, 2], prange: [0, 200] }, caption: 'Two ways to warm the same gas from one isotherm to the next (dashed): at constant volume, and at constant pressure, where it does work (shaded) as it expands.' },
    }),
    num({
      id: 'boiloff-mass', difficulty: 2,
      gen(r) {
        const k = r.pick(['LH2', 'LOX', 'LN2']), Qw = r.pick([10, 25, 40, 80, 120]);
        const m = (Qw * DAY) / PROP[k][3];
        return {
          prompt: t`A tank of ${PROP[k][0]} at 1 atm has a steady heat leak of $${Qw}$ W. How many kilograms boil off per day? ($L = ${PROP[k][3] / 1000}$ kJ/kg.)`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: apart([{ value: Qw / PROP[k][3], feedback: 'That is kilograms per second. Multiply by 86 400 s in a day.' }, { value: (Qw * 3600) / PROP[k][3], feedback: 'That is per hour; a day is 24 hours.' }], m),
          hints: [t`Energy per day $= \dot Q \times 86\,400$ s.`, t`$m = Q/L$.`],
          teach: t`Boil-off rate: $\dot m = \dot Q/L$.`,
          explain: t`$m = \dfrac{(${Qw}\ \text{W})(86\,400\ \text{s})}{${PROP[k][3] / 1000}\times10^{3}\ \text{J/kg}} = ${fmt(m, 3)}$ kg per day.`,
          visual: boilGraph({ mark: Qw, caption: `Boil-off by volume against heat leak, with ${Qw} W marked. The question asks for the mass: use Q = mL.` }),
        };
      },
    }),
    num({
      id: 'pdv-share', difficulty: 3,
      gen(r) {
        const k = r.pick(['LH2', 'LOX', 'LN2']), [name, , Tb, L, rho, M, f] = PROP[k], s = pdvShare(k);
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} boils at 1 atm and $${Tb}$ K with $L = ${L / 1000}$ kJ/kg; the liquid’s density is $${rho}$ kg/m³. Treating the vapour as an ideal gas, what percentage of $L$ is the work $P\Delta V$ done pushing back the atmosphere?`,
          answer: 100 * s, units: '%', tol: { rel: 0.02 },
          errors: apart([{ value: (100 * (R * Tb)) / M / L, feedback: 'Close — but subtract the liquid’s own PV, P/ρ, to get the change.' }, { value: (100 * R * Tb) / L, feedback: `Per kilogram, PV of the vapour is (1/M)RT with M = ${fmt(M * 1000, 4)} g/mol in kg/mol.` }], 100 * s),
          hints: [t`Per kilogram: $P\Delta V = P(V_\text{vap} - V_\text{liq}) = RT/M - P/\rho$.`, t`$M = ${fmt(M, 4)}$ kg/mol; then divide by $L$.`],
          teach: t`Latent heat is an enthalpy change, $\Delta U + P\Delta V$; the $P\Delta V$ part is roughly $RT_b/M$.`,
          explain: t`$P\Delta V = \dfrac{(8.314)(${Tb})}{${fmt(M, 4)}} - \dfrac{101\,325}{${rho}} = ${fmt(s * L / 1000, 3)}$ kJ/kg, which is $${fmt(100 * s, 3)}\%$ of $L$. (Real vapour at the boiling point is slightly non-ideal, so this is an estimate.)`,
          visual: vesselPic({ kind: 'tank', liquid: `${k === 'LH2' ? 'LH₂' : k === 'LOX' ? 'LOX' : 'LN₂'}, ${Tb} K`, leak: true, vent: `${f} gas out`, level: 0.6, caption: 'A vented tank at 1 atm: each kilogram that boils becomes vapour that must push its way out against the atmosphere. Cross-section, not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'flat-step', difficulty: 2,
      prompt: 'Liquid nitrogen in an open dewar is boiling at 77 K. Heat keeps flowing in, but the temperature does not rise. Where does the energy go?',
      choices: [
        'Into separating molecules (ΔU) and pushing back the atmosphere (PΔV) as liquid turns to vapour',
        'It is lost: energy is not conserved during a phase change',
        'Into speeding up the molecules, which does not count as temperature',
        'Nowhere: no heat can enter a liquid at its boiling point',
      ],
      answer: 0,
      why: { 1: 'Energy is conserved: the enthalpy of the vapour exceeds that of the liquid by exactly L.', 2: 'Faster molecules would be a higher temperature; the temperature is steady.', 3: 'Heat does flow in — that is what boils the liquid.' },
      hints: ['Compare the liquid and the vapour at the same temperature.', t`At constant pressure, $Q = \Delta H = \Delta U + P\Delta V$.`],
      teach: 'At a phase change, heat goes into potential energy between molecules and into expansion work, not into temperature.',
      explain: t`The vapour has higher $U$ (molecules pulled apart against their attraction) and far more volume. $L = \Delta U + P\Delta V$: about 89% and 11% for nitrogen.`,
      visual: heatingCurve({ segs: ln2Segs, unit: 'K', caption: 'One kilogram of nitrogen heated at 1 atm: the flat step is the boiling.' }),
    }),
    num({
      id: 'expansion-share', difficulty: 3,
      gen(r) {
        const [name, f] = r.pick([['helium', 3], ['nitrogen', 5]]), Q = r.int(4, 12) * 100;
        const g = (f + 2) / f, Wby = Q * (1 - 1 / g);
        return {
          prompt: t`$${Q}$ J of heat is added to ${name} at constant pressure. How much work does the gas do on its surroundings as it expands?`,
          answer: Wby, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: Q / g, feedback: t`That is $\Delta U$, the part that stays in the gas. The work is the rest.` }, { value: Q * (f === 3 ? 2 / 7 : 2 / 5), feedback: `Check f for ${name}.` }], Wby),
          hints: [t`$Q = nC_P\Delta T$ and $W_\text{by} = nR\Delta T$.`, t`So $W_\text{by}/Q = R/C_P = 2/(f+2)$.`],
          teach: t`At constant pressure a fraction $R/C_P$ of the heat leaves again as work.`,
          explain: t`$W_\text{by} = Q\cdot\dfrac{R}{C_P} = ${Q}\times\dfrac{2}{${f + 2}} = ${fmt(Wby, 4)}$ J; the other $${fmt(Q - Wby, 4)}$ J raises $U$.`,
          visual: { type: 'therm-pv', params: { mode: 'process', gas: f === 3 ? 'He' : 'air', n: 0.1, start: { P: 100, T: 300 }, process: 'isobaric', end: { T: 600 }, drag: false, readouts: [], isoLabels: false, areaLabel: 'W by gas = ?' }, caption: 'Heating at constant pressure: the shaded rectangle is the work done by the gas.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-upper-stage', difficulty: 3, transfer: true,
      gen(r) {
        const Qw = r.pick([150, 250, 400]), hours = r.pick([5, 8, 12]);
        const m = (Qw * hours * 3600) / LH2.Lv, V = (m / LH2.rho) * 1000;
        return {
          prompt: t`An upper stage coasts for ${hours} hours between burns. Sunlight and conduction leak $${Qw}$ W into its liquid-hydrogen tank, which is vented to hold the pressure. How many litres of liquid hydrogen boil away? ($L = ${LH2.Lv / 1000}$ kJ/kg, $\rho = ${LH2.rho}$ kg/m³.)`,
          answer: V, units: 'L', tol: { rel: 0.01 },
          errors: apart([{ value: m, feedback: 'That is the mass in kilograms. Divide by the density to get the volume.' }, { value: (Qw * hours * 60) / LH2.Lv / LH2.rho * 1000, feedback: 'An hour is 3600 s.' }], V),
          hints: [t`Energy: $\dot Q t$; mass: $Q/L$; volume: $m/\rho$.`, t`$t = ${hours}\times3600$ s.`],
          teach: 'Boil-off sizing: energy leaked, divided by latent heat, divided by density.',
          explain: t`$m = \dfrac{${Qw}\times${hours * 3600}}{${LH2.Lv}} = ${fmt(m, 3)}$ kg, so $V = m/\rho = ${fmt(V, 3)}$ L. Long coasts are why cryogenic upper stages use multilayer insulation and why some missions vent boil-off through thrusters to settle the propellant.`,
          visual: vesselPic({ kind: 'tank', liquid: 'LH₂, 20 K', leak: true, leakLabel: 'sunlight and conduction', vent: 'H₂ vented', level: 0.65, caption: 'A vented liquid-hydrogen tank: every watt of heat leak boils liquid at constant pressure. Cross-section, not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-vapour', difficulty: 2,
      gen(r) {
        const [gname, M, Tb] = r.pick([['nitrogen', MOLAR.N2 / 1000, LN2.Tb], ['oxygen', MOLAR.O2 / 1000, LOX.Tb]]), T2 = r.pick([250, 300]);
        const q = ((3.5 * R) / M) * (T2 - Tb);
        return {
          prompt: t`Cold ${gname} vapour leaves a boiling tank at $${Tb}$ K and is warmed at constant pressure to $${T2}$ K. How much heat does each kilogram take? (Diatomic ideal gas.)`,
          answer: q / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: ((2.5 * R) / M) * (T2 - Tb) / 1000, feedback: t`At constant pressure use $c_P = \tfrac72R/M$, not $\tfrac52R/M$.` }, { value: 3.5 * R * (T2 - Tb) / 1000, feedback: 'That is per mole; divide by the molar mass in kg/mol for per kilogram.' }], q / 1000),
          hints: [t`$c_P = \tfrac72R/M$ per kilogram.`, t`$q = c_P\,(${T2} - ${Tb})$.`],
          teach: 'The sensible heat of cold boil-off vapour is comparable to the latent heat itself.',
          explain: t`$c_P = 3.5(8.314)/${fmt(M, 4)} = ${Math.round((3.5 * R) / M)}$ J/(kg·K); $q = ${Math.round((3.5 * R) / M)}\times${fmt(T2 - Tb, 4)} = ${fmt(q / 1000, 3)}$ kJ/kg — about as much as boiling it took.`,
          visual: heatingCurve({ segs: ln2Segs, unit: 'K', caption: 'For comparison: nitrogen’s heating curve near its boiling point. The vapour segment continues far beyond the picture’s right edge.' }),
        };
      },
    }),
    mcq({
      id: 'cp-partial', difficulty: 3,
      prompt: t`For an ideal gas, which is $\left(\dfrac{\partial U}{\partial T}\right)_P$?`,
      choices: [t`$C_V$, because $U$ of an ideal gas depends on $T$ alone`, t`$C_P$, because pressure is held constant`, t`$C_P - Nk$, which is a different quantity from $C_V$`, t`Zero, because $U$ cannot change at constant pressure`],
      answer: 0,
      why: { 1: t`$C_P$ is $(\partial H/\partial T)_P$, the derivative of the enthalpy — not of $U$.`, 2: t`$C_P - Nk$ *is* $C_V$ for an ideal gas; the choice claims otherwise.`, 3: 'U changes whenever T does, at any pressure.' },
      hints: ['Which variables does U of an ideal gas depend on?', t`$C_P$ is defined from $H$, not $U$.`],
      teach: t`Read the subscript and the function: $(\partial U/\partial T)_V = C_V$ and $(\partial H/\partial T)_P = C_P$ are the definitions; anything else must be worked out.`,
      explain: t`$U = \tfrac f2NkT$ depends on $T$ only, so $(\partial U/\partial T)_P = (\partial U/\partial T)_V = C_V$. $C_P$ is the derivative of $H = U + PV$, which also counts the expansion work.`,
      visual: { type: 'graph', params: { x: [0, 600], y: [0, 16], aspect: 'wide', xlabel: 'T (K)', ylabel: 'U and H per mole (kJ)', axesAt: 'edge', curves: [{ fn: `2.5*${r4(R / 1000)}*x`, color: 'accent', label: 'U = (5/2)RT', labelAt: 520, labelDy: 14, labelDx: -30 }, { fn: `3.5*${r4(R / 1000)}*x`, color: 'gold', label: 'H = U + PV = (7/2)RT', labelAt: 300, labelDx: -150, labelDy: -6 }] }, caption: 'U and H of one mole of a diatomic ideal gas against temperature (room-temperature degrees of freedom). Neither depends on the pressure.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §1.6', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook: thermophysical properties of fluid systems (H₂, O₂, N₂)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
  ],
});
