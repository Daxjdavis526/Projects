// Work done by a gas: W = ∫P dV, the area under a quasi-static path on a PV
// diagram — signed, and different for different paths between the same states.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, molesOf, pvPic, one, lab } from './_pv.js';

const t = String.raw;

// the worked example: 0.50 mol of nitrogen expanding isothermally at 300 K from 10 L to 30 L
const EX = { n: 0.5, T: 300, V1: 10, V2: 30 };
EX.nRT = EX.n * R * EX.T;                         // J
EX.W = EX.nRT * Math.log(EX.V2 / EX.V1);          // 1370 J
EX.P1 = EX.nRT / EX.V1;                           // kPa (J per L)
EX.P2 = EX.nRT / EX.V2;
EX.lo = EX.P2 * (EX.V2 - EX.V1);                  // J: the rectangle under the final pressure
EX.hi = EX.P1 * (EX.V2 - EX.V1);                  // J: the rectangle under the initial pressure

// the Explore: 300 kPa and 1 L of gas at 300 K
const N0 = molesOf(300, 1, 300);

// three routes from A to B (the path-dependence question)
const ROUTES = {
  states: { A: { P: 300, V: 1 }, B: { P: 100, V: 3 }, C: { P: 300, V: 3 }, D: { P: 100, V: 1 } },
  paths: [{ from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']] }, { from: 'A', legs: [['isochoric', 'D'], ['isobaric', 'B']] }, { from: 'A', legs: [['line', 'B']] }],
};

export default lesson({
  id: 'phys2210.M18.1',
  title: 'Work in thermodynamic processes',
  minutes: 10, difficulty: 2,
  intro: t`A gas pushes on everything that holds it in. When it pushes a piston outward it does **work** on it: a force $PA$ acting through a distance $dx$ is $dW = PA\,dx = P\,dV$. Add up those slivers over a whole process:

$$W = \int_{V_1}^{V_2} P\,dV$$

On a pressure–volume (PV) diagram that integral is **the area under the path**. It is positive when the gas expands and negative when it is compressed, and — because different paths between the same two states sweep out different areas — **work depends on the path, not just on where the gas starts and ends**. It is the work done in every piston engine, every compressor and turbine stage, and every tank whose pressurant gas pushes propellant into a rocket engine.`,
  symbols: [
    { tex: 'W', text: 'the work done **by** the gas on its surroundings, in joules (J). Positive when the gas expands; negative when the surroundings compress it' },
    { tex: 'P', text: 'the pressure of the gas, in pascals (Pa); 1 kPa = 1000 Pa. The integral needs one pressure for the whole gas, so the process must be **quasi-static** — slow enough that the gas stays in equilibrium as it goes' },
    { tex: 'V', text: 'the volume of the gas, in cubic metres (m³); 1 L = 10⁻³ m³. Handy: 1 kPa × 1 L = 1 J' },
    { tex: 'dV', text: 'a small change in volume; the work over it is the thin strip $P\\,dV$ under the path' },
    { tex: 'V_1,\\ V_2', text: 'the volumes at the start and at the end of the process' },
  ],
  why: 'The first law, next, balances heat against exactly this work — and every engine cycle in this module is judged by the area it encloses on a PV diagram.',
  visual: {
    type: 'therm-pv',
    title: 'Drag the end of a process and watch the area',
    lead: t`The gas starts at state 1: 300 kPa, 1 L, 300 K. Choose a process and drag its end point along the curve (or use the slider). The shaded area under the path is the work $W$ done by the gas.`,
    tasks: [
      'Isobaric, from 1 L to 3 L: the rectangle is 300 kPa × 2 L = 600 J.',
      'Drag the end to the left of state 1: the gas is compressed, the area turns orange and W is negative.',
      'Isothermal to 3 L ends at 100 kPa with W = 330 J. Switch to Straight line: it starts at that same end state, yet W = 400 J. Same states, different work.',
    ],
    params: {
      mode: 'process', n: N0, start: { P: 300, V: 1 }, process: 'isobaric', processes: ['isobaric', 'isothermal', 'adiabatic', 'line', 'isochoric'], end: { V: 3 },
      controls: ['process', 'end'], readouts: ['W', 'P2'], heat: false, vrange: [0, 5], prange: [0, 450], isoLabels: true,
      ranges: { V2: [0.2, 5, 0.05] },
    },
    caption: 'An ideal gas (air) with every process quasi-static, so each point of a path is an equilibrium state. The dashed lines are isotherms — curves of constant temperature, PV = constant — through the two states. Areas are to scale; the work is the area between the path and the V axis.',
  },
  example: {
    prompt: t`${EX.n.toFixed(2)} mol of nitrogen in a cylinder expands slowly from ${EX.V1} L to ${EX.V2} L while kept at ${EX.T} K by contact with a large block of metal. How much work does the gas do?`,
    visual: pvPic({ n: EX.n, states: { A: { P: EX.P1, V: EX.V1, label: `1: ${lab(EX.P1)} kPa` }, B: { P: EX.P2, V: EX.V2, label: `2: ${lab(EX.P2)} kPa` } }, paths: one('A', ['isothermal', 'B']), vrange: [0, 40], prange: [0, 160], areaLabel: 'W', caption: 'The isothermal path from 10 L to 30 L at 300 K. The shaded area is the work done by the gas.' }),
    steps: [
      { label: 'Pressure along the path', text: t`The temperature is fixed, so the ideal-gas law gives the pressure at every volume on the way: $P = \dfrac{nRT}{V}$. It falls as the gas expands — the path is a curve, not a rectangle.` },
      { label: 'Integrate', text: t`$W = \displaystyle\int_{V_1}^{V_2}\frac{nRT}{V}\,dV = nRT\int_{V_1}^{V_2}\frac{dV}{V} = nRT\ln\frac{V_2}{V_1}$, because $n$, $R$ and $T$ are all constant on an isotherm.` },
      { label: 'Numbers', text: t`$nRT = (${EX.n})(8.314\ \text{J/(mol K)})(${EX.T}\ \text{K}) = ${fmt(EX.nRT, 4)}$ J, and $\ln(${EX.V2}/${EX.V1}) = \ln 3 = 1.0986$, so $W = ${fmt(EX.W, 4)}$ J.` },
      { label: 'Sense check', text: t`The pressure falls from ${fmt(EX.P1, 4)} kPa to ${fmt(EX.P2, 4)} kPa. The area must lie between the rectangles under those pressures across 20 L: $${fmt(EX.lo, 3)}\ \text{J} < W < ${fmt(EX.hi, 4)}\ \text{J}$. It does. Positive, too, as an expansion should be.` },
    ],
    answer: t`$W = nRT\ln(V_2/V_1) \approx ${fmt(EX.W, 3)}$ J, done by the gas on the piston.`,
  },
  practice: [
    mcq({
      id: 'sign', difficulty: 1,
      prompt: 'A gas in a cylinder is compressed slowly from 4.0 L to 1.5 L. The work done **by the gas** during the compression is:',
      visual: pvPic({ n: 0.16, states: { A: { P: 100, V: 4 }, B: { P: 400 / 1.5, V: 1.5 } }, paths: one('A', ['isothermal', 'B']), shade: false, vrange: [0, 5], prange: [0, 320], caption: 'The compression, traced on a PV diagram; the arrow shows the direction.' }),
      choices: ['Negative: the piston does work on the gas', 'Positive: work is being done, so it counts as positive', 'Zero: the gas does not move anything; the piston does', 'Positive, because the pressure rises'],
      answer: 0,
      why: {
        1: t`The sign says *who* does the work. $dV < 0$ throughout, so $W = \int P\,dV < 0$: work is done *on* the gas.`,
        2: t`The gas pushes on the piston the whole time; as the piston moves *into* that push, the gas's work is negative, not zero.`,
        3: t`A rising pressure makes the magnitude larger, but the sign comes from $dV$, which is negative here.`,
      },
      hints: [t`$W = \int P\,dV$ with $P > 0$. What is the sign of $dV$ when the volume shrinks?`],
      teach: 'The work done by a gas has the sign of its change in volume: positive when it expands, negative when it is compressed.',
      explain: t`$P$ is always positive and $dV$ is negative throughout a compression, so $W_\text{by gas} < 0$. The surroundings do positive work *on* the gas, $-W$.`,
    }),
    num({
      id: 'isobaric-w', difficulty: 1,
      gen(r) {
        const P = r.pick([150, 200, 250, 300, 400]), V1 = r.pick([0.5, 1, 1.5, 2]), dV = r.pick([1.5, 2, 2.5, 3]), V2 = V1 + dV;
        return {
          prompt: t`A gas expands at a constant pressure of ${P} kPa from ${V1.toFixed(1)} L to ${V2.toFixed(1)} L. How much work does it do?`,
          answer: P * dV, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: P * V2, feedback: 'That is the pressure times the final volume. Work is the pressure times the *change* in volume.' }],
          hints: [t`At constant pressure the area under the path is a rectangle: $W = P\,\Delta V$.`, t`$1\ \text{kPa}\times1\ \text{L} = 10^{3}\ \text{Pa}\times10^{-3}\ \text{m}^3 = 1$ J.`],
          teach: 'At constant pressure the work is the rectangle under the path: W = PΔV.',
          explain: t`$W = P\,\Delta V = (${P}\ \text{kPa})(${dV.toFixed(1)}\ \text{L}) = ${P * dV}$ J, since a kilopascal times a litre is exactly one joule.`,
          visual: pvPic({ states: { A: { P, V: V1 }, B: { P, V: V2 } }, paths: one('A', ['isobaric', 'B']), areaLabel: 'W = ?', vrange: [0, V2 + 1], prange: [0, P * 1.4] }),
        };
      },
    }),
    num({
      id: 'trapezoid', difficulty: 2,
      gen(r) {
        const V1 = r.pick([1, 2]), V2 = V1 + r.pick([2, 3, 4]), P1 = r.pick([400, 500, 600]), P2 = r.pick([100, 200]);
        const W = 0.5 * (P1 + P2) * (V2 - V1);
        return {
          prompt: t`A gas goes along the straight line on the PV diagram from A (${V1}.0 L, ${P1} kPa) to B (${V2}.0 L, ${P2} kPa). How much work does it do?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [
            { value: P1 * (V2 - V1), feedback: 'That is the rectangle under the starting pressure. The pressure falls along the way, so the area is a trapezoid.' },
            { value: P2 * (V2 - V1), feedback: 'That is only the rectangle under the final pressure; add the triangle above it.' },
            { value: 0.5 * (P1 - P2) * (V2 - V1), feedback: 'That is only the triangle. The area runs all the way down to P = 0.' },
          ],
          hints: ['The work is the whole area between the line and the V axis: a trapezoid.', t`Area of a trapezoid: the average of the two parallel sides times the width, $\tfrac12(P_A + P_B)(V_B - V_A)$.`],
          teach: 'The work is the whole area under the path, down to zero pressure — for a straight path, a trapezoid.',
          explain: t`$W = \tfrac12(${P1} + ${P2})\ \text{kPa}\times(${V2 - V1}\ \text{L}) = ${W}$ J.`,
          visual: pvPic({ states: { A: { P: P1, V: V1, label: `A (${V1} L, ${P1} kPa)` }, B: { P: P2, V: V2, label: `B (${V2} L, ${P2} kPa)` } }, paths: one('A', ['line', 'B']), areaLabel: 'W = ?', vrange: [0, V2 + 1.5], prange: [0, 700] }),
        };
      },
    }),
    mcq({
      id: 'most-work', difficulty: 2,
      prompt: 'A gas can be taken from state A to state B along three paths: A→C→B, A→D→B, or straight from A to B. Along which does it do the most work?',
      visual: pvPic({ ...ROUTES, show: 'all', shade: false, vrange: [0, 4], prange: [0, 400], caption: 'Three quasi-static paths from A to B. A→C is at constant pressure, C→B at constant volume; A→D at constant volume, D→B at constant pressure.' }),
      choices: ['A→C→B', 'All three do the same work, since they start and end at the same states', 'A→D→B', 'The straight path, the most direct route'],
      answer: 0,
      why: {
        1: t`That would be true of a property of the state, such as the temperature. Work is an area under a path, and these paths sweep different areas: 600 J, 200 J and 400 J.`,
        2: 'Along A→D→B the gas expands only after its pressure has dropped to 100 kPa: the smallest area of the three.',
        3: 'Shortness on the diagram means nothing; the area under it does. The straight path does 400 J, less than A→C→B.',
      },
      hints: ['Which path expands the gas while its pressure is high?', 'The constant-volume legs do no work at all: no area under a vertical line.'],
      teach: 'Work depends on the path: the higher the pressure while the gas expands, the larger the area and the work.',
      explain: t`A→C→B expands at 300 kPa: $W = 300\times2 = 600$ J (the drop C→B is at constant volume and adds nothing). The straight path gives $\tfrac12(300+100)\times2 = 400$ J; A→D→B only $100\times2 = 200$ J. Same end states, three different works.`,
    }),
    num({
      id: 'isothermal-w', difficulty: 2,
      gen(r) {
        const n = r.pick([0.2, 0.25, 0.5, 1, 2]), T = r.pick([280, 300, 350, 400]), V1 = r.pick([2, 4, 5]), k = r.pick([2, 2.5, 3, 4]);
        const V2 = V1 * k, nRT = n * R * T, W = nRT * Math.log(k);
        return {
          prompt: t`${n} mol of an ideal gas at ${T} K expands isothermally (at constant temperature) from ${V1}.0 L to ${fmt(V2, 3)} L. How much work does it do?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: nRT * Math.log10(k), feedback: t`That used $\log_{10}$. The integral of $dV/V$ is the *natural* logarithm, $\ln$.` },
            { value: nRT * (k - 1), feedback: t`That is the rectangle under the starting pressure, $P_1\Delta V$. The pressure falls as the gas expands.` },
            { value: nRT * (1 - 1 / k), feedback: t`That is the rectangle under the final pressure, $P_2\Delta V$ — too small. Integrate $P = nRT/V$.` },
          ],
          hints: [t`On an isotherm $P = nRT/V$, so $W = \int_{V_1}^{V_2}\frac{nRT}{V}\,dV$.`, t`$W = nRT\ln(V_2/V_1)$ with $R = 8.314$ J/(mol K).`],
          teach: 'For an isothermal ideal gas, P = nRT/V and the work integrates to nRT ln(V₂/V₁).',
          explain: t`$W = nRT\ln\dfrac{V_2}{V_1} = (${n})(8.314)(${T})\ln ${k} = (${fmt(nRT, 4)}\ \text{J})(${fmt(Math.log(k), 4)}) = ${fmt(W, 3)}$ J.`,
          visual: pvPic({ n, states: { A: { P: nRT / V1, V: V1 }, B: { P: nRT / V2, V: V2 } }, paths: one('A', ['isothermal', 'B']), areaLabel: 'W = ?', vrange: [0, V2 * 1.2], prange: [0, (nRT / V1) * 1.35] }),
        };
      },
    }),
    num({
      id: 'cycle-net', difficulty: 2,
      gen(r) {
        const V1 = r.pick([1, 2]), V2 = V1 + r.pick([1, 2, 3]), P1 = r.pick([100, 150]), P2 = P1 + r.pick([100, 150, 200, 250]);
        const cw = r.bool(0.5), W = (cw ? 1 : -1) * (P2 - P1) * (V2 - V1);
        const st = { A: { P: P1, V: V1 }, B: { P: P2, V: V1 }, C: { P: P2, V: V2 }, D: { P: P1, V: V2 } };
        const legs = cw ? [['isochoric', 'B'], ['isobaric', 'C'], ['isochoric', 'D'], ['isobaric', 'A']] : [['isobaric', 'D'], ['isochoric', 'C'], ['isobaric', 'B'], ['isochoric', 'A']];
        return {
          prompt: t`A gas goes once around the rectangle on the PV diagram, ${cw ? 'A → B → C → D → A (clockwise)' : 'A → D → C → B → A (anticlockwise)'}. The corners are at ${V1}.0 L and ${V2}.0 L, ${P1} kPa and ${P2} kPa. What is the net work done by the gas over the cycle? (Give its sign.)`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: -W, feedback: `Check the direction: going ${cw ? 'clockwise, the gas expands at the high pressure and is compressed at the low one' : 'anticlockwise, the gas expands at the low pressure and is compressed at the high one'}.` }, { value: (cw ? 1 : -1) * P2 * (V2 - V1), feedback: 'That is the work of the expansion leg alone. The compression leg gives some of it back.' }],
          hints: ['Only the two constant-pressure legs do work; the vertical legs do none.', 'Net work = work at the high pressure + work at the low pressure, with signs from the direction of each: the enclosed area, positive if the loop runs clockwise.'],
          teach: 'Around a closed cycle the net work is the area enclosed — positive when the loop runs clockwise on a PV diagram, negative anticlockwise.',
          explain: t`${cw ? `B→C expands at ${P2} kPa: $+${P2 * (V2 - V1)}$ J. D→A is compressed at ${P1} kPa: $-${P1 * (V2 - V1)}$ J.` : `A→D expands at ${P1} kPa: $+${P1 * (V2 - V1)}$ J. C→B is compressed at ${P2} kPa: $-${P2 * (V2 - V1)}$ J.`} Net: $W = ${W}$ J — the area of the rectangle, $(${P2 - P1}\ \text{kPa})(${V2 - V1}\ \text{L})$, with the sign of the direction.`,
          visual: pvPic({ states: st, paths: one('A', ...legs), areaLabel: 'W_{net} = ?', vrange: [0, V2 + 1], prange: [0, P2 * 1.3], caption: 'A rectangular cycle; the arrows show which way the gas goes round. The gold area is the area enclosed.' }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the work done by an ideal gas expanding isothermally from $V_1$ to $V_2$:

$$\text{“On an isotherm } PV = nRT \text{ is constant, so } W = P_2V_2 - P_1V_1 = 0.\text{”}$$

What is wrong?`,
      visual: pvPic({ n: 0.4, states: { A: { P: 400, V: 2.5 }, B: { P: 400 / 3, V: 7.5 } }, paths: one('A', ['isothermal', 'B']), vrange: [0, 9], prange: [0, 500], caption: 'An isothermal expansion. Whatever PV does, the area under the path is plainly not zero.' }),
      choices: [
        t`Work is not the change in a property of the state like $PV$; it is the area $\int P\,dV$ under the path, here $nRT\ln(V_2/V_1) > 0$`,
        t`$PV$ is not constant along an isotherm`,
        t`The sign: it should be $P_1V_1 - P_2V_2$`,
        'The ideal-gas law does not hold while the gas is expanding',
      ],
      answer: 0,
      why: {
        1: t`It is: $PV = nRT$ with $T$ fixed. The slip is treating work as the change in $PV$.`,
        2: 'Reversing the order still gives zero. The trouble is the idea, not the order of the terms.',
        3: t`In a quasi-static expansion it holds at every point — which is exactly what lets you put $P = nRT/V$ inside the integral.`,
      },
      hints: ['Look at the picture: is there any area under the path?', t`Work is $\int P\,dV$. Is that the same thing as $\Delta(PV)$?`],
      teach: 'Work is not the change in any property of the gas: it is the area under the path, and two different paths between the same states give different works.',
      explain: t`$\Delta(PV) = 0$ on an isotherm, but $\int P\,dV = nRT\ln(V_2/V_1)$, which is positive for an expansion. $\Delta(PV) = \int P\,dV + \int V\,dP$; the student kept both pieces, and they cancel.`,
    }),
    {
      type: 'slider', id: 'set-volume', difficulty: 2, param: 'V2',
      instruction: 'Set the final volume with the slider (or drag the end point), then check.',
      prompt: t`The gas in the picture starts at 1.0 L and 300 kPa. Set the final volume of a constant-pressure expansion at which the gas has done exactly 900 J of work.`,
      visual: { type: 'therm-pv', params: { mode: 'process', n: N0, start: { P: 300, V: 1 }, process: 'isobaric', end: { V: 1.5 }, controls: ['end'], readouts: [], heat: false, isotherms: false, vrange: [0, 6], prange: [0, 400], ranges: { V2: [0.5, 6, 0.1] } }, caption: 'An isobaric expansion at 300 kPa; the shaded rectangle is the work done so far. (1 kPa × 1 L = 1 J.)' },
      answer: [3.95, 4.05],
      hints: [t`$W = P\,\Delta V$, so $\Delta V = W/P$.`, t`$\Delta V = 900\ \text{J} / 300\ \text{kPa} = 3$ L — added to the starting 1.0 L.`],
      teach: 'At constant pressure the work grows in proportion to the change in volume: ΔV = W/P.',
      explain: t`$\Delta V = W/P = 900/300 = 3.0$ L, so $V_2 = 1.0 + 3.0 = 4.0$ L.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-pressurant', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([1.5, 1.8, 2.0, 2.4]), dV = r.pick([0.6, 0.8, 1.2, 1.5]);
        const W = P * dV;                                   // MPa × m³ = MJ
        return {
          prompt: t`In a pressure-fed rocket stage, a regulator feeds helium into a propellant tank so that the gas above the propellant (the *ullage*) stays at ${P} MPa while the engine drains ${dV} m³ of propellant. How much work does the ullage gas do pushing the propellant out?`,
          answer: W, units: 'MJ', tol: { rel: 0.005 },
          errors: [{ value: W / 1000, feedback: '1 MPa × 1 m³ = 10⁶ Pa·m³ = 1 MJ — check the conversion.' }],
          hints: ['The ullage pressure is held constant while the gas volume grows by the volume of propellant drained.', t`$W = P\,\Delta V$; $1\ \text{MPa}\times1\ \text{m}^3 = 10^6$ J.`],
          teach: 'A regulated pressurant expands at constant pressure, so the work it does on the propellant is PΔV.',
          explain: t`$W = P\,\Delta V = (${P}\times10^{6}\ \text{Pa})(${dV}\ \text{m}^3) = ${fmt(W, 3)}$ MJ. That energy comes from the high-pressure helium bottle feeding the regulator — one reason pressure-fed stages carry heavy bottles and run at modest tank pressures.`,
          visual: pvPic({ vunit: 'm3', punit: 'MPa', states: { A: { P, V: 0.3 }, B: { P, V: 0.3 + dV } }, paths: one('A', ['isobaric', 'B']), areaLabel: 'W = ?', vrange: [0, 0.3 + dV + 0.5], prange: [0, 3], caption: 'The ullage gas expands at constant pressure as the propellant drains; the gas volume starts at an assumed 0.3 m³. Real ullage gas also exchanges heat with the tank walls and the propellant.' }),
        };
      },
    }),
    num({
      id: 'cp-two-legs', difficulty: 2,
      gen(r) {
        const V1 = r.pick([1, 1.5, 2]), V2 = V1 + r.pick([2, 2.5, 3]), P1 = r.pick([250, 300, 400]), P2 = r.pick([100, 150]);
        return {
          prompt: t`A gas expands at a constant ${P1} kPa from ${V1.toFixed(1)} L to ${V2.toFixed(1)} L, and is then cooled at constant volume until its pressure is ${P2} kPa. How much work does it do in the two steps together?`,
          answer: P1 * (V2 - V1), units: 'J', tol: { rel: 0.005 },
          errors: [{ value: P1 * (V2 - V1) - V2 * (P1 - P2), feedback: t`A constant-volume step does no work: $dV = 0$, so there is no area under a vertical line. Do not subtract $V\Delta P$.` }, { value: 0.5 * (P1 + P2) * (V2 - V1), feedback: 'That would be the straight path from the first state to the last. The gas did not go that way.' }],
          hints: ['Work is the area under the path. What is the area under a vertical line?'],
          teach: 'A constant-volume step does no work, so only the constant-pressure step counts here.',
          explain: t`Expansion: $W_1 = ${P1}\times${fmt(V2 - V1, 2)} = ${P1 * (V2 - V1)}$ J. Constant-volume cooling: $W_2 = 0$. Total $${P1 * (V2 - V1)}$ J.`,
          visual: pvPic({ states: { A: { P: P1, V: V1 }, B: { P: P1, V: V2 }, C: { P: P2, V: V2 } }, paths: one('A', ['isobaric', 'B'], ['isochoric', 'C']), shade: false, vrange: [0, V2 + 1], prange: [0, 500] }),
        };
      },
    }),
    mcq({
      id: 'cp-anticlockwise', difficulty: 2,
      prompt: 'A gas goes round the cycle shown, in the direction of the arrows. Over one full cycle, the net work done by the gas is:',
      visual: pvPic({ n: 0.1, states: { A: { P: 100, V: 1 }, B: { P: 100, V: 3 }, C: { P: 300, V: 3 } }, paths: one('A', ['isobaric', 'B'], ['isochoric', 'C'], ['line', 'A']), shade: false, vrange: [0, 4], prange: [0, 400], caption: 'A triangular cycle; the arrows show which way the gas goes round.' }),
      choices: ['Negative, equal in size to the area enclosed', 'Positive, equal to the area enclosed', 'Zero, because the gas returns to its starting state', 'Positive, equal to the area under the expansion A→B'],
      answer: 0,
      why: {
        1: 'Going round anticlockwise, the gas expands at low pressure and is compressed at high pressure, so it gets back less work than it puts in.',
        2: t`Its *state* returns, but work is not a property of the state. The net work is the enclosed area: $\tfrac12(2\ \text{L})(200\ \text{kPa}) = 200$ J, here negative.`,
        3: 'The compression C→A happens at higher pressures and costs more work than A→B delivered.',
      },
      hints: ['Compare the work done during the expansion (A→B) with the work done on the gas during the compression (C→A).'],
      teach: 'Around an anticlockwise loop on a PV diagram the net work done by the gas is negative: the surroundings must put work in.',
      explain: t`A→B: $+100\times2 = 200$ J. B→C: 0. C→A: $-\tfrac12(300+100)\times2 = -400$ J. Net $-200$ J: the enclosed triangle, with a minus sign. A cycle run this way needs work put in — the way a refrigerator runs.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §3.2 Work, Heat, and Internal Energy', url: 'https://openstax.org/books/university-physics-volume-2/pages/3-2-work-heat-and-internal-energy' },
    { label: 'OpenStax University Physics Vol. 2, §3.1 Thermodynamic Systems', url: 'https://openstax.org/books/university-physics-volume-2/pages/3-1-thermodynamic-systems' },
  ],
});
