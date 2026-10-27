// Isochoric, isobaric and isothermal processes of an ideal gas: the first law
// with one variable held fixed, ΔE_int = nC_V ΔT for any process, and why
// C_P = C_V + R.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, molesOf, pvPic, one, lab } from './_pv.js';

const t = String.raw;
const CV = { He: 1.5 * R, air: 2.5 * R }, CP = { He: 2.5 * R, air: 3.5 * R };

// the worked example: 2.00 mol of helium from 300 K to 400 K, at constant volume and at constant pressure
const EX = { n: 2, T1: 300, T2: 400, V: 40 };
EX.QV = EX.n * CV.He * (EX.T2 - EX.T1);          // 2494 J
EX.W = EX.n * R * (EX.T2 - EX.T1);               // 1663 J
EX.QP = EX.n * CP.He * (EX.T2 - EX.T1);          // 4157 J
EX.PA = (EX.n * R * EX.T1) / EX.V;               // kPa (J/L)

// the Explore: air at 100 kPa, 2 L, 300 K
const N0 = molesOf(100, 2, 300);

export default lesson({
  id: 'phys2210.M18.3',
  title: 'Isothermal, isobaric and isochoric processes',
  minutes: 11, difficulty: 2,
  intro: t`Three simple processes each hold one variable fixed, and that makes the first law easy. The key fact is that an ideal gas's internal energy depends only on its temperature, so for **any** process

$$\Delta E_\text{int} = nC_V\,\Delta T$$

Then:

- **isochoric** (constant volume): no work, so all the heat warms the gas: $Q = nC_V\Delta T$;
- **isobaric** (constant pressure): the gas expands as it warms and does work $W = P\Delta V = nR\Delta T$, so it needs more heat for the same warming: $Q = nC_P\Delta T$ with $C_P = C_V + R$;
- **isothermal** (constant temperature): $\Delta E_\text{int} = 0$, so every joule of heat that flows in leaves as work: $Q = W = nRT\ln(V_2/V_1)$.

A sealed propellant tank warming in the sun is isochoric; a regulated ullage is isobaric; a slow expansion in good thermal contact is close to isothermal.`,
  symbols: [
    { tex: 'n', text: 'the amount of gas, in moles (mol)' },
    { tex: 'C_V', text: 'the molar heat capacity at constant volume, in J/(mol K): the heat to warm one mole by one kelvin at fixed volume. $\\tfrac32R = 12.5$ for helium and argon; $\\tfrac52R = 20.8$ for nitrogen, oxygen and air near room temperature (equipartition, lesson M17.4)' },
    { tex: 'C_P', text: 'the molar heat capacity at constant pressure, in J/(mol K): $C_P = C_V + R$, larger because some of the heat goes into work. $\\tfrac52R = 20.8$ for helium, $\\tfrac72R = 29.1$ for air' },
    { tex: 'R', text: 'the gas constant, $8.314$ J/(mol K)' },
    { tex: '\\Delta T', text: 'the change in temperature, in kelvin (K)' },
  ],
  why: 'Engine cycles are built from these legs (and the adiabatic one, next): the Otto cycle adds heat at constant volume, the Brayton cycle at constant pressure, the Carnot cycle at constant temperature.',
  visual: {
    type: 'therm-pv',
    title: 'Hold one variable fixed',
    lead: t`Air starts at state 1: 100 kPa, 2 L, 300 K. Pick a process, then drag its end point (or use the slider). Red legs take heat in, blue legs give it out. Watch how $Q$ splits between $W$ and $\Delta E_\text{int}$.`,
    tasks: [
      t`Isochoric up to 450 K: no area under a vertical line, so $W = 0$ and all of $Q$ goes into $\Delta E_\text{int}$.`,
      t`Switch to Isobaric: it starts at the same 450 K. $\Delta E_\text{int}$ is unchanged, but now $W > 0$ and $Q$ is 7/5 as large — the ratio $C_P/C_V$ for air.`,
      t`Isothermal: $\Delta E_\text{int}$ stays 0 however far you drag, and $Q = W$. Drag to the left of state 1: both turn negative — heat flows out as the gas is compressed.`,
    ],
    params: {
      mode: 'process', gas: 'air', gases: ['air', 'He'], n: N0, start: { P: 100, V: 2 }, process: 'isochoric', processes: ['isochoric', 'isobaric', 'isothermal'], end: { T: 450 },
      controls: ['process', 'gas', 'end'], readouts: ['Q', 'W', 'dU', 'T2'], vrange: [0, 6], prange: [0, 250], ranges: { V2: [0.5, 6, 0.05], T2: [100, 900, 5] },
    },
    caption: 'An ideal gas with constant heat capacities, every process quasi-static. Shaded: the work done by the gas (the area under the path). Dashed: the isotherms through the two states, labelled with their temperatures. Real gases at room temperature and modest pressures follow these rules to within a few per cent.',
  },
  example: {
    prompt: t`${EX.n.toFixed(2)} mol of helium at ${EX.T1} K is to be warmed to ${EX.T2} K. How much heat does that take (a) in a rigid tank, and (b) in a cylinder whose piston keeps the pressure constant? Where does the difference go?`,
    visual: pvPic({ gas: 'He', n: EX.n, heat: true, legend: true, isotherms: [EX.T1, EX.T2], isoLabels: true, show: 'all',
      states: { A: { P: EX.PA, V: EX.V }, B: { P: (EX.n * R * EX.T2) / EX.V, V: EX.V, label: 'B (rigid tank)' }, C: { P: EX.PA, V: (EX.n * R * EX.T2) / EX.PA, label: 'C (constant pressure)' } },
      paths: [{ from: 'A', legs: [['isochoric', 'B']] }, { from: 'A', legs: [['isobaric', 'C']] }], vrange: [0, 70], prange: [0, 220],
      caption: 'Both paths start at A on the 300 K isotherm and end on the 400 K isotherm. Only the constant-pressure path has area under it: that is the work it does.' }),
    steps: [
      { label: 'The internal energy', text: t`Either way the gas ends at ${EX.T2} K, so $\Delta E_\text{int} = nC_V\Delta T = (${EX.n})(\tfrac32\times8.314)(${EX.T2 - EX.T1}) = ${fmt(EX.QV, 4)}$ J for both.` },
      { label: '(a) Rigid tank', text: t`No change of volume, no work: $Q = \Delta E_\text{int} = ${fmt(EX.QV, 4)}$ J.` },
      { label: '(b) Constant pressure', text: t`Now the gas expands and pushes the piston: $W = P\Delta V = nR\Delta T = (${EX.n})(8.314)(${EX.T2 - EX.T1}) = ${fmt(EX.W, 4)}$ J, using $PV = nRT$ at both ends. So $Q = \Delta E_\text{int} + W = ${fmt(EX.QV + EX.W, 4)}$ J.` },
      { label: 'Where the extra comes from', text: t`Per mole and per kelvin, the constant-pressure heat is $C_V + R$: $C_V$ to warm the gas, plus $R$ for the work of pushing the piston out. For helium $C_P = \tfrac52R = 20.8$ J/(mol K), and indeed $nC_P\Delta T = ${fmt(EX.QP, 4)}$ J.` },
      { label: 'Sense check', text: t`The ratio $Q_P/Q_V = ${fmt(EX.QP / EX.QV, 3)} = 5/3$ is helium's $\gamma = C_P/C_V$, the number that will run the next lesson. Two-fifths of the constant-pressure heat leaves as work.` },
    ],
    answer: t`(a) ${fmt(EX.QV, 4)} J; (b) ${fmt(EX.QP, 4)} J. The extra ${fmt(EX.W, 4)} J is the work the gas does pushing the piston back.`,
  },
  practice: [
    match({
      id: 'read-paths', difficulty: 1,
      prompt: 'An ideal gas starts at state 1 and can follow path a, b or c. Match each path to the process it is, and to what the first law says about it.',
      visual: pvPic({ gas: 'air', n: molesOf(200, 2, 300), states: { S: { P: 200, V: 2, label: '1' }, a: { P: 350, V: 2, label: 'a' }, b: { P: 200, V: 5, label: 'b' }, c: { P: 80, V: 5, label: 'c' } }, paths: [{ from: 'S', legs: [['isochoric', 'a']] }, { from: 'S', legs: [['isobaric', 'b']] }, { from: 'S', legs: [['isothermal', 'c']] }], show: 'all', shade: false, vrange: [0, 6], prange: [0, 400], caption: 'Three paths from state 1. Path c follows a curve of constant PV.' }),
      left: ['path a', 'path b', 'path c'],
      right: ['isochoric: no work is done, so Q = ΔE_int', 'isobaric: the work is W = PΔV', 'isothermal: ΔE_int = 0, so Q = W', 'adiabatic: no heat flows, Q = 0'],
      answer: [0, 1, 2],
      hints: ['Vertical: which variable stays fixed? Horizontal? A curve with PV constant?'],
      teach: 'Read the process off the PV diagram: vertical is constant volume, horizontal constant pressure, and a PV = constant curve constant temperature.',
      explain: 'Path a is vertical (constant V, no work), b horizontal (constant P, W = PΔV), c lies on PV = constant, an isotherm (ΔE_int = 0, so Q = W). An adiabat would fall more steeply than c — the subject of the next lesson.',
    }),
    num({
      id: 'isochoric', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 4, 5]), T1 = r.pick([280, 290]), dT = r.pick([20, 30, 40]), V = 10;
        const Q = n * CV.air * dT;
        return {
          prompt: t`A rigid 10 L steel cylinder holds ${n}.0 mol of nitrogen at ${T1} K. Sunlight warms it by ${dT} K. How much heat did the nitrogen absorb? (Nitrogen: $C_V = \tfrac52R$.)`,
          answer: Q, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: n * CP.air * dT, feedback: t`That is $nC_P\Delta T$. The cylinder is rigid, so the volume is constant: use $C_V$.` }, { value: n * CV.He * dT, feedback: t`$\tfrac32R$ is for a monatomic gas. Nitrogen molecules can also rotate: $C_V = \tfrac52R$.` }],
          hints: ['A rigid container: what is W?', t`$Q = \Delta E_\text{int} = nC_V\Delta T$.`],
          teach: 'At constant volume no work is done, so all the heat goes into internal energy: Q = nC_VΔT.',
          explain: t`$W = 0$, so $Q = nC_V\Delta T = (${n})(\tfrac52\times8.314)(${dT}) = ${fmt(Q, 4)}$ J. The pressure rises in proportion to $T$, from ${lab((n * R * T1) / V)} kPa to ${lab((n * R * (T1 + dT)) / V)} kPa.`,
          visual: pvPic({ gas: 'N2', n, heat: true, isotherms: [T1, T1 + dT], isoLabels: true, states: { A: { P: (n * R * T1) / V, V }, B: { P: (n * R * (T1 + dT)) / V, V } }, paths: one('A', ['isochoric', 'B']), vrange: [0, 20], prange: [0, Math.ceil((n * R * (T1 + dT)) / V / 100) * 100 + 300], caption: 'Heating at constant volume: a short vertical path between the two isotherms, with no area under it.' }),
        };
      },
    }),
    num({
      id: 'isobaric', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 1.5, 2]), dT = r.pick([40, 60, 80, 120]), P = 150;
        const Q = n * CP.air * dT, V1 = (n * R * 300) / P, V2 = (n * R * (300 + dT)) / P;
        return {
          prompt: t`${n} mol of air in a cylinder is heated at a constant ${P} kPa from 300 K to ${300 + dT} K. How much heat is added? (Air: $C_V = \tfrac52R$.)`,
          answer: Q, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: n * CV.air * dT, feedback: t`That is only $\Delta E_\text{int}$. At constant pressure the gas also does work, so $Q = nC_P\Delta T$ with $C_P = C_V + R$.` }, { value: n * R * dT, feedback: t`That is the work $W = nR\Delta T$. The heat also has to raise the internal energy.` }],
          hints: [t`At constant pressure $Q = nC_P\Delta T$.`, t`$C_P = C_V + R = \tfrac72R$ for air.`],
          teach: 'At constant pressure the heat must both warm the gas and pay for the work it does: Q = nC_PΔT with C_P = C_V + R.',
          explain: t`$Q = nC_P\Delta T = (${n})(\tfrac72\times8.314)(${dT}) = ${fmt(Q, 4)}$ J: $\Delta E_\text{int} = ${fmt(n * CV.air * dT, 4)}$ J plus $W = nR\Delta T = ${fmt(n * R * dT, 4)}$ J.`,
          visual: pvPic({ gas: 'air', n, heat: true, states: { A: { P, V: V1 }, B: { P, V: V2 } }, paths: one('A', ['isobaric', 'B']), vrange: [0, Math.ceil(V2 * 1.3)], prange: [0, 250], caption: 'Heating at constant pressure: the gas expands and does work, the area under the path.' }),
        };
      },
    }),
    num({
      id: 'isothermal', difficulty: 2,
      gen(r) {
        const n = r.pick([0.25, 0.5, 1]), T = r.pick([290, 300, 350]), V1 = r.pick([2, 3, 4]), k = r.pick([1.5, 2, 3]);
        const Q = n * R * T * Math.log(k);
        return {
          prompt: t`${n} mol of helium expands isothermally at ${T} K from ${V1}.0 L to ${fmt(V1 * k, 3)} L, kept warm by contact with a large block of copper. How much heat flows into the gas?`,
          answer: Q, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: 1.5 * n * R * T * Math.log(k), feedback: t`On an isotherm $\Delta E_\text{int} = 0$, so the heat in equals the work out, $nRT\ln(V_2/V_1)$ — no factor of $C_V/R$.` }, { value: n * R * T * Math.log10(k), feedback: t`Use the natural logarithm: $\int dV/V = \ln(V_2/V_1)$.` }],
          hints: ['The temperature is fixed. What is ΔE_int?', t`So $Q = W = nRT\ln(V_2/V_1)$.`],
          teach: 'On an isotherm the internal energy does not change, so the heat in equals the work out.',
          explain: t`$\Delta E_\text{int} = 0$, so $Q = W = nRT\ln\dfrac{V_2}{V_1} = (${n})(8.314)(${T})\ln ${k} = ${fmt(Q, 4)}$ J. The heat does not warm the gas at all: it passes straight through it into the piston.`,
          visual: pvPic({ gas: 'He', n, heat: true, states: { A: { P: (n * R * T) / V1, V: V1 }, B: { P: (n * R * T) / (V1 * k), V: V1 * k } }, paths: one('A', ['isothermal', 'B']), vrange: [0, Math.ceil(V1 * k * 1.3)], prange: [0, Math.ceil(((n * R * T) / V1) * 1.35)], caption: 'An isothermal expansion: heat flows in (red) and the gas does the work shaded under the path.' }),
        };
      },
    }),
    mcq({
      id: 'isothermal-heat', difficulty: 2,
      prompt: 'An ideal gas expands slowly at constant temperature. During the expansion, heat:',
      visual: pvPic({ gas: 'air', n: molesOf(300, 1, 300), states: { A: { P: 300, V: 1 }, B: { P: 100, V: 3 } }, paths: one('A', ['isothermal', 'B']), isotherms: [300], isoLabels: true, vrange: [0, 4], prange: [0, 400], caption: 'A slow expansion along the 300 K isotherm.' }),
      choices: ['Flows in, equal to the work the gas does', 'Does not flow at all, because the temperature does not change', 'Flows out, because expanding gas cools', 'Flows in and raises the internal energy'],
      answer: 0,
      why: {
        1: t`Constant temperature means $\Delta E_\text{int} = 0$, not $Q = 0$. The gas does work, and that energy has to come from somewhere.`,
        2: 'Gas cools when it expands without heat flowing in (an adiabatic expansion). Here the temperature is held fixed, which needs heat in.',
        3: t`$\Delta E_\text{int}$ depends only on temperature, which does not change.`,
      },
      hints: [t`What is $\Delta E_\text{int}$ at constant temperature?`, t`First law: $Q = \Delta E_\text{int} + W$, and the gas does positive work as it expands.`],
      teach: '“Isothermal” means constant temperature, not “no heat”: the heat flowing in exactly pays for the work done.',
      explain: t`$\Delta E_\text{int} = 0$, so $Q = W > 0$: heat flows in from the surroundings at exactly the rate the gas does work. Without that heat the gas would cool — which is what happens in an adiabatic expansion.`,
    }),
    num({
      id: 'work-fraction', difficulty: 3,
      gen(r) {
        const [gas, name, fW] = r.pick([['He', 'helium (monatomic)', 2 / 5], ['air', 'nitrogen (diatomic)', 2 / 7]]);
        return {
          prompt: t`Heat is added to ${name} at constant pressure. What fraction of that heat leaves again as work done by the gas? (Give a decimal.)`,
          answer: fW, tol: { rel: 0.01 },
          errors: [{ value: 1 - fW, feedback: 'That is the share that stays as internal energy. The work is the other part.' }, { value: gas === 'He' ? 1 / 1.5 : 1 / 2.5, feedback: t`Divide $W = nR\Delta T$ by the heat $Q = nC_P\Delta T$, not by $\Delta E_\text{int}$.` }],
          hints: [t`$W = nR\Delta T$ and $Q = nC_P\Delta T$.`, t`So $W/Q = R/C_P$, with $C_P = ${gas === 'He' ? t`\tfrac52R` : t`\tfrac72R`}$.`],
          teach: 'At constant pressure the work is nRΔT and the heat nC_PΔT, so the work fraction R/C_P depends only on the kind of gas.',
          explain: t`$\dfrac{W}{Q} = \dfrac{nR\Delta T}{nC_P\Delta T} = \dfrac{R}{C_P} = ${gas === 'He' ? t`\dfrac{2}{5} = 0.40` : t`\dfrac{2}{7} = 0.286`}$. The rest, ${gas === 'He' ? '3/5' : '5/7'}, raises the internal energy.`,
          visual: pvPic({ gas, n: 0.1, heat: true, states: { A: { P: 150, V: 1 }, B: { P: 150, V: 3 } }, paths: one('A', ['isobaric', 'B']), vrange: [0, 4], prange: [0, 250], caption: 'Heat in at constant pressure (red); the shaded area is the work done.' }),
        };
      },
    }),
    {
      type: 'slider', id: 'set-isothermal', difficulty: 3, param: 'V2',
      instruction: 'Set the final volume with the slider (or drag the end point), then check.',
      prompt: t`Air at 300 kPa and 2.0 L (300 K) expands isothermally. Set the final volume at which exactly 500 J of heat has flowed into it.`,
      visual: { type: 'therm-pv', params: { mode: 'process', gas: 'air', n: molesOf(300, 2, 300), start: { P: 300, V: 2 }, process: 'isothermal', end: { V: 2.5 }, controls: ['end'], readouts: [], vrange: [0, 8], prange: [0, 400], ranges: { V2: [1, 8, 0.05] } }, caption: 'An isothermal expansion of air at 300 K. The shaded area is the work done — and, on an isotherm, also the heat taken in.' },
      answer: [4.55, 4.65],
      hints: [t`On an isotherm $Q = W = nRT\ln(V_2/V_1)$, and $nRT = P_1V_1 = 600$ J.`, t`$\ln(V_2/2.0) = 500/600$, so $V_2 = 2.0\,e^{0.833}$ L.`],
      teach: 'On an isotherm the heat in equals the work, nRT ln(V₂/V₁), so a target heat fixes the volume ratio.',
      explain: t`$nRT = P_1V_1 = (300\ \text{kPa})(2.0\ \text{L}) = 600$ J, so $\ln(V_2/V_1) = 500/600 = 0.833$ and $V_2 = 2.0\times e^{0.833} = 4.60$ L.`,
    },
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the heat needed to warm 2.0 mol of air by 50 K **at constant pressure**:

$$Q = nC_V\Delta T = (2.0)(20.8\ \text{J/(mol K)})(50\ \text{K}) = 2080\ \text{J}.$$

What is wrong?`,
      visual: pvPic({ gas: 'air', n: 2, heat: true, states: { A: { P: 150, V: 33.26 }, B: { P: 150, V: 38.80 } }, paths: one('A', ['isobaric', 'B']), vrange: [0, 50], prange: [0, 250], caption: 'Heating at constant pressure: the gas expands, and the shaded area is work it does.' }),
      choices: [
        t`At constant pressure the gas also does work, so $Q = nC_P\Delta T$ with $C_P = C_V + R$: about 2910 J`,
        t`$C_V$ for air is $\tfrac32R$, not $\tfrac52R$`,
        t`$\Delta T$ must be in degrees Celsius`,
        t`The heat is just the work, $P\Delta V = nR\Delta T = 831$ J`,
      ],
      answer: 0,
      why: {
        1: t`$\tfrac32R$ is for monatomic gases. Air is mostly N₂ and O₂, whose molecules also rotate: $C_V = \tfrac52R$.`,
        2: 'A temperature *change* is the same number in kelvin and in Celsius degrees; that is not the slip.',
        3: 'The heat must both do that work and raise the internal energy.',
      },
      hints: ['Does the gas do any work at constant pressure?', t`$Q = \Delta E_\text{int} + W$, with $\Delta E_\text{int} = nC_V\Delta T$ and $W = nR\Delta T$.`],
      teach: 'Use C_V only when the volume is fixed; at constant pressure the heat is nC_PΔT.',
      explain: t`$nC_V\Delta T = 2080$ J is only $\Delta E_\text{int}$. The gas also does $W = nR\Delta T = 831$ J, so $Q = nC_P\Delta T = (2.0)(29.1)(50) = 2910$ J.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bottle', difficulty: 2, transfer: true,
      gen(r) {
        const n = r.pick([600, 800, 1000, 1200]), dT = r.pick([10, 15, 20]);
        const Q = n * CV.He * dT;
        return {
          prompt: t`A launch vehicle's helium pressurant bottle — a rigid composite-wrapped tank — holds ${n} mol of helium. On a hot pad, sunlight warms the gas by ${dT} K before launch. How much heat has it absorbed? (Helium: $C_V = \tfrac32R$.)`,
          answer: Q / 1000, units: 'kJ', tol: { rel: 0.005 },
          errors: [{ value: (n * CP.He * dT) / 1000, feedback: 'The bottle is rigid: constant volume, so C_V, not C_P.' }, { value: (n * CV.air * dT) / 1000, feedback: 'Helium is monatomic: C_V = (3/2)R.' }],
          hints: ['Rigid tank: no work.'],
          teach: 'A sealed rigid tank is an isochoric process: all the heat raises the internal energy.',
          explain: t`$Q = nC_V\Delta T = (${n})(\tfrac32\times8.314)(${dT}) = ${fmt(Q / 1000, 3)}$ kJ. The pressure climbs in proportion to the absolute temperature — by about ${fmt((dT / 290) * 100, 2)} % from 290 K — which is why pressurant bottles have relief valves and why pad crews watch bottle temperatures. (At hundreds of bar real helium is about 10 % less compressible than an ideal gas, but its $C_V$ stays very close to $\tfrac32R$.)`,
          visual: pvPic({ gas: 'He', n, punit: 'MPa', heat: true, isotherms: [290, 290 + dT], isoLabels: true, states: { A: { P: 20, T: 290 }, B: { P: (20 * (290 + dT)) / 290, T: 290 + dT } }, paths: one('A', ['isochoric', 'B']), prange: [0, 26], caption: 'Heating at constant volume, if the bottle starts at 20 MPa. The volume is the ideal-gas estimate; at that pressure real helium needs about 10 % more room.' }),
        };
      },
    }),
    num({
      id: 'cp-isobaric-work', difficulty: 2,
      gen(r) {
        const Q = r.pick([700, 1400, 2100, 2800]);
        return {
          prompt: t`${Q} J of heat is added to nitrogen at constant pressure. How much work does the gas do? (Nitrogen: $C_P = \tfrac72R$.)`,
          answer: (Q * 2) / 7, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: (Q * 5) / 7, feedback: t`That is the share that becomes internal energy, $C_V/C_P$. The work share is $R/C_P$.` }, { value: Q, feedback: 'That would be an isothermal process. At constant pressure the gas warms, so some heat stays as internal energy.' }],
          hints: [t`$W/Q = R/C_P$.`],
          teach: 'At constant pressure a fixed fraction R/C_P of the heat becomes work — 2/7 for a diatomic gas.',
          explain: t`$W = Q\,R/C_P = ${Q}\times\tfrac27 = ${fmt((Q * 2) / 7, 4)}$ J; the other ${fmt((Q * 5) / 7, 4)} J raises the internal energy.`,
          visual: pvPic({ gas: 'N2', n: 0.1, heat: true, states: { A: { P: 150, V: 1 }, B: { P: 150, V: 3 } }, paths: one('A', ['isobaric', 'B']), vrange: [0, 4], prange: [0, 250], caption: 'Heating at constant pressure (sketch, not to scale).' }),
        };
      },
    }),
    mcq({
      id: 'cp-all-work', difficulty: 2,
      prompt: 'In which process does **all** the heat added to an ideal gas leave again as work done by the gas?',
      visual: pvPic({ gas: 'air', n: molesOf(200, 2, 300), states: { S: { P: 200, V: 2, label: '1' }, a: { P: 350, V: 2, label: 'a' }, b: { P: 200, V: 5, label: 'b' }, c: { P: 80, V: 5, label: 'c' } }, paths: [{ from: 'S', legs: [['isochoric', 'a']] }, { from: 'S', legs: [['isobaric', 'b']] }, { from: 'S', legs: [['isothermal', 'c']] }], show: 'all', shade: false, vrange: [0, 6], prange: [0, 400], caption: 'Three processes from state 1: constant volume (a), constant pressure (b) and constant temperature (c).' }),
      choices: ['Isothermal', 'Isobaric', 'Isochoric', 'None: some heat always stays as internal energy'],
      answer: 0,
      why: {
        1: 'At constant pressure the gas warms as it expands: part of the heat stays as internal energy (3/5 for helium, 5/7 for air).',
        2: 'At constant volume no work is done at all: every joule stays as internal energy.',
        3: t`On an isotherm $\Delta E_\text{int} = 0$, so nothing stays: $Q = W$.`,
      },
      hints: [t`All the heat becomes work when $\Delta E_\text{int} = 0$. When is that?`],
      teach: 'Only at constant temperature does an ideal gas turn all the heat it takes in into work.',
      explain: t`At constant temperature $\Delta E_\text{int} = 0$, so $Q = W$. (That is one leg of a process; turning heat into work *continuously*, cycle after cycle, is a different matter — the second law, in module M19.)`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §3.4 Thermodynamic Processes', url: 'https://openstax.org/books/university-physics-volume-2/pages/3-4-thermodynamic-processes' },
    { label: 'OpenStax University Physics Vol. 2, §3.5 Heat Capacities of an Ideal Gas', url: 'https://openstax.org/books/university-physics-volume-2/pages/3-5-heat-capacities-of-an-ideal-gas' },
  ],
});
