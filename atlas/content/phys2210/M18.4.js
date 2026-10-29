// Adiabatic processes: Q = 0, so ΔE_int = −W; PV^γ = constant, TV^(γ−1) =
// constant. Diesel ignition, helium blowdown, the oxygen-line hazard and the
// rocket nozzle.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, molesOf, pvPic, one, lab } from './_pv.js';

const t = String.raw;
const G = { air: 1.4, He: 5 / 3, exhaust: 1.2 };
const NAME = { air: 'air', He: 'helium' };

// the worked example: a diesel engine compresses air 18:1 from 300 K and 100 kPa
const EX = { r: 18, T1: 300, P1: 100 };
EX.T2 = EX.T1 * EX.r ** 0.4;          // 953 K
EX.P2 = EX.P1 * EX.r ** 1.4;          // 5720 kPa
const EXV1 = 0.5;                     // L: a half-litre cylinder for the picture

// the Explore: air (or helium) at 100 kPa, 4 L, 300 K
const N0 = molesOf(100, 4, 300);

export default lesson({
  id: 'phys2210.M18.4',
  title: 'Adiabatic processes',
  minutes: 12, difficulty: 3,
  intro: t`When no heat crosses the boundary — because the gas is insulated, or because the process is over before heat has time to flow — the process is **adiabatic**: $Q = 0$, so the first law says $\Delta E_\text{int} = -W$. **Work done on the gas heats it; work done by the gas cools it**, with no heat involved at all. An ideal gas then follows

$$PV^{\gamma} = \text{constant}$$

with $\gamma = C_P/C_V$. Because the temperature changes along the way, an adiabat is steeper than an isotherm. Squeeze air to an eighteenth of its volume and it passes 900 K: that is how a diesel engine lights its fuel. Let hot combustion gas expand through a rocket nozzle and it cools by more than half — the energy it loses is the exhaust's speed.`,
  symbols: [
    { tex: '\\gamma', text: 'the adiabatic index $\\gamma = C_P/C_V$, a pure number: $\\tfrac53 = 1.67$ for helium and argon, $\\tfrac75 = 1.40$ for air, nitrogen and oxygen near room temperature, about 1.2 for hot rocket exhaust (whose molecules also vibrate)' },
    { tex: 'P,\\ V', text: 'the pressure (Pa) and volume (m³) of the gas as it goes; with $PV = nRT$ the same law reads $TV^{\\gamma-1} = $ constant, or $T \\propto P^{(\\gamma-1)/\\gamma}$ — always with $T$ in kelvin' },
    { tex: 'Q = 0', text: '“adiabatic” means no heat flows. It does **not** mean constant temperature: that is “isothermal”, and the two are opposites' },
  ],
  why: 'Every compressor, turbine, piston stroke and nozzle in an engine is close to adiabatic, so these relations set the temperatures, and in the next module the efficiencies, of real machines.',
  visual: {
    type: 'therm-pv',
    title: 'Squeeze a gas with no heat allowed',
    lead: t`The gas starts at state 1: 100 kPa, 4 L, 300 K. Drag the end point along the adiabat to compress or expand it. No heat flows, so every joule of work goes into or comes out of internal energy. The dashed curves are isotherms, labelled with their temperatures.`,
    tasks: [
      t`Compress the air from 4 L to 1 L: the temperature climbs from 300 K to 522 K with no heat added — the readouts show $Q = 0$ and $\Delta E_\text{int} = -W$.`,
      'Switch to helium at 1 L: its adiabat is steeper and it ends hotter, 756 K. With no tumbling to share the energy, each joule of work raises its temperature more.',
      'Switch the process to Isothermal: the curve through state 1 is less steep, and heat must leave (blue) to hold the temperature down.',
    ],
    params: {
      mode: 'process', gas: 'air', gases: ['air', 'He'], n: N0, start: { P: 100, V: 4 }, process: 'adiabatic', processes: ['adiabatic', 'isothermal'], end: { V: 1 },
      controls: ['process', 'gas', 'end'], readouts: ['T2', 'P2', 'W', 'Q', 'dU'], vrange: [0, 6], prange: [0, 1200], ranges: { V2: [0.5, 6, 0.05] },
    },
    caption: 'An ideal gas with constant γ, compressed or expanded quasi-statically with no heat exchanged. Real compressions leak some heat to the walls, so they end a little cooler than this; and real air’s γ falls slowly at high temperature (about 1.34 at 1000 K).',
  },
  example: {
    prompt: t`Show that a reversible adiabatic process of an ideal gas obeys $TV^{\gamma-1} = \text{constant}$. Then: a diesel engine compresses air from ${EX.T1} K and ${EX.P1} kPa to one eighteenth of its volume. Find the final temperature and pressure.`,
    visual: pvPic({ gas: 'air', n: molesOf(EX.P1, EXV1, EX.T1), heat: true, legend: true, isotherms: [EX.T1], isoLabels: true, states: { A: { P: EX.P1, V: EXV1, label: '1: 300 K' }, B: { P: EX.P2, V: EXV1 / EX.r, label: '2' } }, paths: one('A', ['adiabatic', 'B']), vrange: [0, 0.6], prange: [0, 7000], caption: 'The compression stroke of a half-litre diesel cylinder, 18:1, on a PV diagram. Violet: no heat flows. Orange: the work done on the air. Dashed: the 300 K isotherm the air started on.' }),
    steps: [
      { label: 'First law with Q = 0', text: t`For a small step, $dE_\text{int} = -P\,dV$, and $dE_\text{int} = nC_V\,dT$ for an ideal gas. So $nC_V\,dT = -P\,dV$.` },
      { label: 'Use the gas law', text: t`Put $P = nRT/V$ and divide by $nT$: $\;C_V\dfrac{dT}{T} = -R\dfrac{dV}{V}$.` },
      { label: 'Integrate', text: t`$C_V\ln\dfrac{T_2}{T_1} = -R\ln\dfrac{V_2}{V_1}$, so $T_2V_2^{R/C_V} = T_1V_1^{R/C_V}$. And $\dfrac{R}{C_V} = \dfrac{C_P - C_V}{C_V} = \gamma - 1$: $\;TV^{\gamma-1} = \text{constant}$. With $T = PV/nR$ it becomes $PV^\gamma = \text{constant}$.` },
      { label: 'The diesel numbers', text: t`$T_2 = T_1\left(\dfrac{V_1}{V_2}\right)^{\gamma-1} = (${EX.T1}\ \text{K})(${EX.r})^{0.4} = ${fmt(EX.T2, 3)}$ K, and $P_2 = P_1\left(\dfrac{V_1}{V_2}\right)^{\gamma} = (${EX.P1}\ \text{kPa})(${EX.r})^{1.4} = ${fmt(EX.P2 / 1000, 3)}$ MPa.` },
      { label: 'Sense check', text: t`About ${fmt(EX.T2 - 273.15, 2)} °C — far above the 250 °C or so at which diesel fuel ignites by itself, so fuel sprayed in at the top of the stroke lights with no spark. Real engines lose some heat to the cylinder walls and reach somewhat lower temperatures, still comfortably hot enough.` },
    ],
    answer: t`$TV^{\gamma-1}$ is constant; the air reaches about ${fmt(EX.T2, 3)} K and ${fmt(EX.P2 / 1000, 3)} MPa.`,
  },
  practice: [
    mcq({
      id: 'pump', difficulty: 1,
      prompt: 'You push a bicycle pump’s handle down hard and fast, so quickly that no heat has time to flow. The temperature of the air inside:',
      visual: pvPic({ gas: 'air', n: molesOf(100, 1, 293), heat: true, legend: true, states: { A: { P: 100, V: 1 }, B: { P: 100 * 3 ** 1.4, V: 1 / 3 } }, paths: one('A', ['adiabatic', 'B']), vrange: [0, 1.4], prange: [0, 600], caption: 'A fast compression. Violet: no heat flows. Orange: the work done on the air.' }),
      choices: ['Rises', 'Stays the same, because no heat flows', 'Falls, because the air is squeezed', 'Cannot change unless heat flows in'],
      answer: 0,
      why: {
        1: t`No heat means $Q = 0$, not $\Delta T = 0$. The work you do on the air, $-W > 0$, goes straight into its internal energy.`,
        2: 'Squeezing a gas by doing work on it adds energy to it.',
        3: 'Heat is one way to add energy; work is the other. Here work does it — which is why the pump barrel gets warm.',
      },
      hints: [t`First law: $\Delta E_\text{int} = Q - W$. What are $Q$ and $W$ here?`],
      teach: 'In an adiabatic compression the work done on the gas raises its internal energy, so its temperature rises with no heat at all.',
      explain: t`$Q = 0$ and $W < 0$ (work done on the air), so $\Delta E_\text{int} = -W > 0$: the air warms. Compressing it to a third of its volume takes it from 293 K to about $293\times3^{0.4} = 455$ K, which is why the pump's barrel gets hot.`,
    }),
    num({
      id: 'T-compress', difficulty: 2,
      gen(r) {
        const gas = r.pick(['air', 'He']), g = G[gas], k = r.pick([3, 5, 8, 10]), T1 = r.pick([280, 300]);
        const T2 = T1 * k ** (g - 1);
        return {
          prompt: t`${gas === 'air' ? 'Air' : 'Helium'} at ${T1} K is compressed adiabatically to one ${['', '', '', 'third', '', 'fifth', '', '', 'eighth', '', 'tenth'][k]} of its volume. What is its final temperature? ($\gamma = ${gas === 'air' ? '1.40' : t`5/3`}$.)`,
          answer: T2, units: 'K', tol: { rel: 0.01 },
          errors: [
            { value: T1 * k ** g, feedback: t`The temperature form uses $\gamma - 1$, not $\gamma$: $TV^{\gamma-1} = $ constant.` },
            { value: T1 * k ** -(g - 1), feedback: t`That is an *expansion* by the same ratio. Compression means $V_1/V_2 = ${k}$, so the temperature rises.` },
          ],
          hints: [t`$T_1V_1^{\gamma-1} = T_2V_2^{\gamma-1}$.`, t`$T_2 = T_1\,(V_1/V_2)^{\gamma-1} = ${T1}\times${k}^{${gas === 'air' ? '0.4' : t`2/3`}}$.`],
          teach: t`An adiabatic compression by a volume ratio r multiplies the absolute temperature by $r^{\gamma - 1}$.`,
          explain: t`$T_2 = ${T1}\times${k}^{${gas === 'air' ? '0.4' : t`2/3`}} = ${fmt(T2, 3)}$ K — with no heat added. ${gas === 'He' ? 'Helium, with γ = 5/3, heats more than air would for the same squeeze.' : ''}`,
          visual: pvPic({ gas, n: molesOf(100, 1, T1), states: { A: { P: 100, V: 1 }, B: { P: 100 * k ** g, V: 1 / k } }, paths: one('A', ['adiabatic', 'B']), shade: false, vrange: [0, 1.4], prange: [0, Math.ceil((100 * k ** g) / 500) * 500 + 200], caption: `An adiabatic compression of ${NAME[gas]} by ${k}:1 (sketch starting at 100 kPa and 1 L).` }),
        };
      },
    }),
    num({
      id: 'P-compress', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 5]), P1 = r.pick([100, 150, 200]);
        const P2 = P1 * k ** G.He;
        return {
          prompt: t`Helium at ${P1} kPa is compressed adiabatically to 1/${k} of its volume. What is its final pressure? ($\gamma = 5/3$.)`,
          answer: P2, units: 'kPa', tol: { rel: 0.01 },
          errors: [{ value: P1 * k, feedback: t`That is the isothermal answer, $P_1V_1 = P_2V_2$. With no heat flowing out the gas also heats up, so the pressure climbs faster: $PV^\gamma$ is constant.` }, { value: P1 * k ** (G.He - 1), feedback: t`For pressure and volume the exponent is $\gamma$ itself; $\gamma - 1$ goes with temperature.` }],
          hints: [t`$P_1V_1^\gamma = P_2V_2^\gamma$, so $P_2 = P_1(V_1/V_2)^\gamma$.`],
          teach: t`Along an adiabat $PV^\gamma$ is constant, so the pressure rises faster than on an isotherm.`,
          explain: t`$P_2 = ${P1}\times${k}^{5/3} = ${fmt(P2, 3)}$ kPa, against ${P1 * k} kPa for a slow isothermal squeeze — the extra comes from the temperature rise.`,
          visual: pvPic({ gas: 'He', n: molesOf(P1, 1, 300), states: { A: { P: P1, V: 1 }, B: { P: P2, V: 1 / k } }, paths: one('A', ['adiabatic', 'B']), shade: false, vrange: [0, 1.4], prange: [0, Math.ceil((P2 * 1.25) / 100) * 100], caption: 'The adiabatic compression; the final pressure is what is asked.' }),
        };
      },
    }),
    mcq({
      id: 'steeper', difficulty: 2,
      prompt: 'Curves 1 and 2 both pass through state A. One is an isotherm and the other an adiabat of the same gas. Which is the adiabat, and why?',
      visual: pvPic({ gas: 'air', n: molesOf(400, 1, 300), states: { A: { P: 400, V: 1 }, X: { P: 400 / 4, V: 4, label: '1' }, Y: { P: 400 / 4 ** 1.4, V: 4, label: '2' } }, paths: [{ from: 'A', legs: [['isothermal', 'X']] }, { from: 'A', legs: [['adiabatic', 'Y']] }], show: 'all', shade: false, arrows: false, vrange: [0, 5], prange: [0, 500], caption: 'Two curves through state A.' }),
      choices: [
        'Curve 2, the steeper one: as the gas expands with no heat in, it also cools, so its pressure falls faster',
        'Curve 1, the less steep one: with no heat flowing, the pressure changes less',
        'Curve 2, because heat flows out of the gas as it expands',
        'Neither can be told apart: an adiabat is an isotherm with no heat',
      ],
      answer: 0,
      why: {
        1: 'On the isotherm heat flows in and keeps the temperature up. Without it the gas cools, so its pressure drops faster.',
        2: t`No heat flows along an adiabat at all. It is the work the gas does, $\Delta E_\text{int} = -W$, that cools it.`,
        3: t`They are different curves: $PV = $ constant against $PV^{1.4} = $ constant. The temperature changes along an adiabat.`,
      },
      hints: ['Along an isotherm PV is constant. Along an adiabat, what else changes as the gas expands?', t`$P \propto V^{-1}$ against $P \propto V^{-\gamma}$ with $\gamma > 1$.`],
      teach: 'An adiabat is steeper than an isotherm because the temperature falls as the gas expands without heat.',
      explain: t`Expanding from 1 L to 4 L, the isotherm ends at $400/4 = 100$ kPa but the adiabat at $400/4^{1.4} = ${fmt(400 / 4 ** 1.4, 3)}$ kPa: the gas has also cooled, to $300/4^{0.4} = ${fmt(300 / 4 ** 0.4, 3)}$ K.`,
    }),
    num({
      id: 'adiabatic-work', difficulty: 3,
      gen(r) {
        const P1 = r.pick([400, 500, 600]), V1 = r.pick([1, 2]), k = r.pick([2, 3, 4]);
        const V2 = V1 * k, P2 = P1 / k ** G.air, W = (P1 * V1 - P2 * V2) / (G.air - 1);
        return {
          prompt: t`Air at ${P1} kPa and ${V1}.0 L expands adiabatically to ${V2}.0 L. How much work does it do? ($\gamma = 1.40$.)`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: P1 * V1 * Math.log(k), feedback: t`That is the isothermal work, $nRT\ln(V_2/V_1)$. On an adiabat the pressure falls faster, so the area is smaller.` },
            { value: P1 * V1 - P2 * V2, feedback: t`Divide by $\gamma - 1 = 0.4$: $W = \dfrac{P_1V_1 - P_2V_2}{\gamma - 1}$.` },
          ],
          hints: [t`First find $P_2 = P_1(V_1/V_2)^\gamma$.`, t`Then $W = -\Delta E_\text{int} = \dfrac{P_1V_1 - P_2V_2}{\gamma - 1}$ (which is $\int P\,dV$ along the adiabat).`],
          teach: 'In an adiabatic expansion the work is paid entirely from internal energy: W = (P₁V₁ − P₂V₂)/(γ − 1).',
          explain: t`$P_2 = ${P1}/${k}^{1.4} = ${fmt(P2, 4)}$ kPa, so $W = \dfrac{(${P1})(${V1}) - (${fmt(P2, 4)})(${V2})}{0.4} = ${fmt(W, 3)}$ J. Equivalently $W = nC_V(T_1 - T_2)$: the gas cools by exactly the energy it hands to the piston.`,
          visual: pvPic({ gas: 'air', n: molesOf(P1, V1, 300), heat: true, states: { A: { P: P1, V: V1 }, B: { P: P2, V: V2 } }, paths: one('A', ['adiabatic', 'B']), areaLabel: 'W = ?', vrange: [0, V2 + 1], prange: [0, P1 * 1.3], caption: 'An adiabatic expansion (violet: no heat). The shaded area is the work it does.' }),
        };
      },
    }),
    num({
      id: 'blowdown', difficulty: 2,
      gen(r) {
        const P2 = r.pick([20, 15, 10, 5]), P1 = 30, T1 = 290;
        const T2 = T1 * (P2 / P1) ** ((G.He - 1) / G.He);
        return {
          prompt: t`A helium pressurant bottle at ${T1} K and ${P1} MPa is emptied quickly. The gas that is still inside has pushed the rest out, expanding nearly adiabatically. What is its temperature when the bottle pressure has fallen to ${P2} MPa? ($\gamma = 5/3$.)`,
          answer: T2, units: 'K', tol: { rel: 0.01 },
          errors: [
            { value: T1 * (P2 / P1) ** (G.He - 1), feedback: t`With pressures the exponent is $(\gamma-1)/\gamma = 0.4$, not $\gamma - 1$.` },
            { value: T1 * (P2 / P1), feedback: t`That would hold if the volume stayed fixed. The gas inside expands as the rest leaves: use $T \propto P^{(\gamma-1)/\gamma}$.` },
          ],
          hints: [t`Combine $PV^\gamma = $ constant with $PV = nRT$: $T \propto P^{(\gamma-1)/\gamma}$.`, t`$T_2 = ${T1}\times(${P2}/${P1})^{0.4}$.`],
          teach: t`For an adiabatic change of pressure, $T_2/T_1 = (P_2/P_1)^{(\gamma - 1)/\gamma}$.`,
          explain: t`$T_2 = ${T1}\times(${P2}/${P1})^{0.4} = ${fmt(T2, 3)}$ K. Real bottles cool less, because their walls feed heat back into the gas, but the ideal figure is the one designers check seals and wrap materials against. (At 30 MPa helium is also about 15 % off ideal; the estimate is rough.)`,
          visual: pvPic({ gas: 'He', n: molesOf(P1 * 1000, 10, T1), punit: 'MPa', heat: true, states: { A: { P: P1, V: 10 }, B: { P: P2, V: 10 * (P1 / P2) ** (1 / G.He) } }, paths: one('A', ['adiabatic', 'B']), shade: false, vrange: [0, Math.ceil(10 * (P1 / P2) ** (1 / G.He) * 1.25)], prange: [0, 35], caption: 'The gas that stays in the bottle expands adiabatically as the rest leaves. Here 10 L of it at the start grows to fill more of the bottle.' }),
        };
      },
    }),
    num({
      id: 'not-isothermal', difficulty: 2,
      gen(r) {
        const gas = r.pick(['air', 'He']), g = G[gas], k = r.pick([2, 3, 4]), T1 = 300;
        const T2 = T1 / k ** (g - 1);
        return {
          prompt: t`${gas === 'air' ? 'Air' : 'Helium'} at ${T1} K expands adiabatically to ${k} times its volume. What is its final temperature?`,
          answer: T2, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: T1 * k ** (g - 1), feedback: 'An expansion cools the gas: the volume ratio V₁/V₂ is 1/' + k + ', so the temperature falls.' }],
          hints: [t`$T_2 = T_1(V_1/V_2)^{\gamma-1}$ with $V_1/V_2 = 1/${k}$.`, t`$\gamma - 1 = ${gas === 'air' ? '0.4' : t`2/3`}$.`],
          teach: 'An adiabatic expansion cools a gas: the work it does comes out of its internal energy.',
          explain: t`$T_2 = ${T1}\times(1/${k})^{${gas === 'air' ? '0.4' : t`2/3`}} = ${fmt(T2, 3)}$ K. ${gas === 'He' ? 'Expansion cooling of helium is used in cryocoolers to reach very low temperatures.' : 'This is why air rising in the atmosphere cools — about 10 K per kilometre — and forms clouds.'}`,
          visual: pvPic({ gas, n: molesOf(300, 1, T1), heat: true, states: { A: { P: 300, V: 1 }, B: { P: 300 / k ** g, V: k } }, paths: one('A', ['adiabatic', 'B']), vrange: [0, k + 1], prange: [0, 400], caption: 'An adiabatic expansion: violet means no heat flows; the shaded area is the work the gas does.' }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the temperature of air at 20 °C compressed adiabatically to a tenth of its volume:

$$T_2 = T_1\left(\frac{V_1}{V_2}\right)^{\gamma - 1} = (20\ ^\circ\text{C})(10)^{0.4} = 50\ ^\circ\text{C}.$$

What is wrong?`,
      visual: pvPic({ gas: 'air', n: molesOf(100, 1, 293), states: { A: { P: 100, V: 1 }, B: { P: 100 * 10 ** 1.4, V: 0.1 } }, paths: one('A', ['adiabatic', 'B']), shade: false, vrange: [0, 1.2], prange: [0, 3000], caption: 'The compression, 10:1, from 100 kPa.' }),
      choices: [
        'The temperatures must be absolute: 293 K × 10^0.4 = 736 K, about 463 °C',
        'The exponent should be γ = 1.4, not γ − 1',
        'The temperature does not change in an adiabatic process',
        'The volume ratio should be V₂/V₁ = 0.1',
      ],
      answer: 0,
      why: {
        1: t`$\gamma$ goes with pressure, $PV^\gamma$; temperature goes with $\gamma - 1$, $TV^{\gamma-1}$. The exponent was right.`,
        2: 'Adiabatic means no heat flows; the work done on the air still heats it.',
        3: 'That would give an expansion. For a compression the ratio V₁/V₂ = 10 is right.',
      },
      hints: ['Would the result change if the student had used °F? What does that tell you?', t`$TV^{\gamma-1} = $ constant comes from $PV = nRT$, which needs absolute temperature.`],
      teach: 'Gas laws that multiply or divide temperatures need absolute temperatures, in kelvin.',
      explain: t`$T_2 = (293\ \text{K})(10)^{0.4} = 736$ K $= 463$ °C. Multiplying a Celsius temperature is meaningless — at 0 °C it would predict no warming at all.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const Tc = r.pick([3300, 3500, 3600]), pc = r.pick([7, 10, 20]), pe = r.pick([70, 100]);
        const ratio = (pc * 1000) / pe, Te = Tc * ratio ** (-(G.exhaust - 1) / G.exhaust);
        return {
          prompt: t`A kerosene–oxygen rocket engine's combustion gas leaves the chamber at ${Tc} K and ${pc} MPa and expands through the nozzle to ${pe} kPa at the exit. Treating each parcel of gas as expanding adiabatically with $\gamma = 1.2$, what is the exhaust temperature at the exit?`,
          answer: Te, units: 'K', tol: { rel: 0.01 },
          errors: [
            { value: Tc * ratio ** (-0.4 / 1.4), feedback: t`$\gamma = 1.4$ is for cool air. Hot combustion products (CO₂, H₂O, CO) store energy in vibration too: $\gamma \approx 1.2$.` },
            { value: Tc * ratio ** -(G.exhaust - 1), feedback: t`With pressures the exponent is $(\gamma - 1)/\gamma = 0.2/1.2$, not $\gamma - 1$.` },
          ],
          hints: [t`$T_e = T_c\,(p_e/p_c)^{(\gamma-1)/\gamma}$.`, t`Pressure ratio $p_c/p_e = ${fmt(ratio, 3)}$; exponent $0.2/1.2 = 1/6$.`],
          teach: 'A nozzle expands its gas almost adiabatically, so the temperature falls as the pressure ratio to the power (γ − 1)/γ.',
          explain: t`$T_e = ${Tc}\times(1/${fmt(ratio, 3)})^{1/6} = ${fmt(Te, 3)}$ K. Its temperature falls by about ${Math.round((1 - Te / Tc) * 100)} % — and the energy it gives up is the jet: in steady flow each kilogram gains $c_P(T_c - T_e)$ of kinetic energy, about ${fmt((1.2 * 8.314) / (0.2 * 0.022) * (Tc - Te) / 1e6, 2)} MJ/kg for exhaust of molar mass 22 g/mol, an exhaust speed near ${fmt(Math.sqrt(2 * (1.2 * 8.314) / (0.2 * 0.022) * (Tc - Te)) / 1000, 2)} km/s. (Real nozzles do slightly worse: γ drifts as the gas cools, and friction and heat loss to the wall take their share.)`,
          visual: pvPic({ gas: 'exhaust', n: 1000 / 22, punit: 'MPa', vunit: 'm3', heat: true, states: { A: { P: pc, T: Tc, label: 'chamber' }, B: { P: pe / 1000, T: Te, label: 'exit' } }, paths: one('A', ['adiabatic', 'B']), shade: false, prange: [0, pc * 1.2], caption: `One kilogram of exhaust (molar mass 22 g/mol) expanding through the nozzle, as an ideal gas with γ = 1.2. Its volume grows ${Math.round(ratio ** (1 / G.exhaust))}-fold.` }),
        };
      },
    }),
    num({
      id: 'cp-oxygen', difficulty: 3, transfer: true,
      gen(r) {
        const P2 = r.pick([10, 15, 20]), T1 = 293, P1 = 0.1;
        const T2 = T1 * (P2 / P1) ** (0.4 / 1.4);
        return {
          prompt: t`A valve is opened suddenly between an oxygen supply at ${P2} MPa and a dead-ended line holding oxygen at ${P1} MPa and ${T1} K. The gas already in the line is slammed into the closed end and compressed nearly adiabatically to ${P2} MPa. Estimate its peak temperature. (Oxygen: $\gamma = 1.40$.)`,
          answer: T2, units: 'K', tol: { rel: 0.02 },
          errors: [{ value: T1 * (P2 / P1), feedback: t`That treats the gas as staying at fixed volume. It is compressed: $T \propto P^{(\gamma-1)/\gamma}$.` }, { value: T1 * (P2 / P1) ** 0.4, feedback: t`With pressures the exponent is $(\gamma-1)/\gamma = 0.286$.` }],
          hints: [t`$T_2 = T_1(P_2/P_1)^{(\gamma-1)/\gamma}$ with $(\gamma-1)/\gamma = 0.4/1.4$.`, t`$P_2/P_1 = ${P2 / P1}$.`],
          teach: t`Rapid compression of a gas into a dead end heats it adiabatically, by the factor $(P_2/P_1)^{(\gamma - 1)/\gamma}$.`,
          explain: t`$T_2 = ${T1}\times${P2 / P1}^{0.286} = ${fmt(T2, 3)}$ K. Real peaks are lower, because heat flows into the metal, but still hot enough to ignite polymer valve seats and lubricants in pure oxygen. That is why oxygen systems use slow-opening valves and avoid dead-ended lines, and why their parts are tested by exactly this kind of pressure surge.`,
          visual: pvPic({ gas: 'O2', n: 1, punit: 'MPa', vunit: 'L', heat: true, states: { A: { P: P1, T: T1, label: 'line, before' }, B: { P: P2, T: T2, label: 'after the surge' } }, paths: one('A', ['adiabatic', 'B']), shade: false, prange: [0, P2 * 1.2], caption: 'One mole of the oxygen in the line, compressed adiabatically (sketch: an ideal gas with γ = 1.4).' }),
        };
      },
    }),
    mcq({
      id: 'cp-why-cool', difficulty: 2,
      prompt: 'Gas expanding adiabatically against a piston cools down. Why?',
      visual: pvPic({ gas: 'air', n: molesOf(400, 1, 300), heat: true, legend: true, states: { A: { P: 400, V: 1 }, B: { P: 400 / 3 ** 1.4, V: 3 } }, paths: one('A', ['adiabatic', 'B']), vrange: [0, 4], prange: [0, 500], caption: 'An adiabatic expansion: no heat flows (violet), and the gas does the work shaded.' }),
      choices: [
        'It does work on the piston, and with no heat flowing in, that energy comes out of its internal energy',
        'It loses heat to its surroundings',
        'Its pressure falls, and PV = nRT then makes T fall',
        'Its molecules spread out, and spread-out molecules are colder',
      ],
      answer: 0,
      why: {
        1: t`Adiabatic means $Q = 0$: no heat leaves. The energy leaves as work.`,
        2: t`$PV = nRT$ alone cannot decide it: $V$ rises while $P$ falls. The first law does: $\Delta E_\text{int} = -W < 0$.`,
        3: 'In a free expansion into vacuum the molecules spread out just as much, yet an ideal gas does not cool. Doing work is what cools it.',
      },
      hints: [t`Apply the first law with $Q = 0$.`],
      teach: 'An adiabatic expansion cools a gas because the work it does is paid out of its internal energy.',
      explain: t`$Q = 0$ and $W > 0$, so $\Delta E_\text{int} = -W < 0$ and the temperature falls. The same gas expanding into a vacuum does no work and does not cool.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §3.6 Adiabatic Processes for an Ideal Gas', url: 'https://openstax.org/books/university-physics-volume-2/pages/3-6-adiabatic-processes-for-an-ideal-gas' },
    { label: 'NASA Glenn Research Center: Isentropic flow equations', url: 'https://www.grc.nasa.gov/www/k-12/airplane/isentrop.html' },
  ],
});
