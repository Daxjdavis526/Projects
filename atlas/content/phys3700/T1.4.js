// Compression work and adiabatic processes: W = −∫P dV, isothermal work
// NkT ln(Vi/Vf), and the adiabat VT^{f/2} = const, PV^γ = const, derived from
// the first law — applied to diesel ignition, jet compressors and nozzles.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, r4, apart } from './_count.js';

const t = String.raw;
const GAS = { He: ['helium', 5 / 3, 3], air: ['air', 1.4, 5], exhaust: ['hot exhaust gas', 1.2, 10] };

// a single quasi-static process on a PV diagram, with nothing read out
const procPic = ({ gas = 'air', process = 'adiabatic', P = 100, V = 2, V2 = 0.5, area = 'W = ?', vr = null, pr = null, caption, iso = false }) => ({
  type: 'therm-pv',
  params: { mode: 'process', gas, n: r4((P * V) / (8.314462618 * 300)), start: { P, V }, process, end: { V: V2 }, drag: false, readouts: [], isotherms: iso ? 'auto' : false, isoLabels: false, areaLabel: area, vrange: vr || [0, r4(Math.max(V, V2) * 1.2)], ...(pr ? { prange: pr } : {}) },
  caption,
});

// an isotherm and an adiabat through the same point, as a graph (P and V in units of the start)
const steepPic = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 3.2], y: [0, 3.2], aspect: 'wide', xlabel: 'V / V₀', ylabel: 'P / P₀', axesAt: 'edge',
    curves: [{ fn: '1/x', domain: [0.3, 3.2], color: 'accent', label: 'isotherm, PV = const', labelAt: 2.4, labelDy: -14 }, { fn: 'x^(-1.4)', domain: [0.45, 3.2], color: 'warn', label: 'adiabat, PV¹·⁴ = const', labelAt: 0.62, labelDx: 10, labelDy: -6 }],
    points: [{ x: 1, y: 1, r: 5, color: 'gold', label: 'start', labelDx: 8, labelDy: -10 }],
  },
  caption: caption ?? 'An isotherm and an adiabat (air, γ = 1.4) through the same starting state.',
});

// the worked example: diesel compression, air at 300 K and 1 atm, ratio 18
const EX = { T1: 300, r: 18, g: 1.4 };
EX.T2 = EX.T1 * EX.r ** (EX.g - 1); EX.P2 = EX.r ** EX.g; EX.W = 2.5 * R * (EX.T2 - EX.T1);

export default lesson({
  id: 'phys3700.T1.4',
  title: 'Compression work and adiabatic processes',
  minutes: 13, difficulty: 3,
  intro: t`Pushing a piston in does work on a gas: $W = -\int_{V_i}^{V_f} P\,dV$, positive when the volume shrinks. If the gas stays in contact with a reservoir, heat leaks out and the temperature holds: $W = NkT\ln(V_i/V_f)$. If no heat can flow — the compression is fast, or the walls insulate — the process is **adiabatic**, all the work becomes internal energy, and the gas heats up. The first law with $U = \tfrac f2 NkT$ then fixes the path:

$$VT^{f/2} = \text{constant}, \qquad PV^\gamma = \text{constant}, \qquad \gamma = \frac{f+2}{f}.$$

That one curve sets the ignition of a diesel, the temperature behind a jet engine’s compressor, and how cold a rocket’s exhaust gets as it expands through the nozzle.`,
  symbols: [
    { tex: 'W = -\\int P\\,dV', text: 'work done **on** the gas by a slow (quasi-static) piston, in J: the area under the path on a PV diagram, positive for compression' },
    { tex: 'V,\\ T,\\ P', text: 'volume (m³), absolute temperature (K) and pressure (Pa) of the gas' },
    { tex: 'f', text: 'the active quadratic degrees of freedom per molecule (lesson T1.2): 3 for helium, 5 for air near room temperature' },
    { tex: '\\gamma', text: 'the adiabatic exponent $(f + 2)/f$: 5/3 for monatomic gases, 7/5 for air, about 1.2 for hot rocket exhaust' },
  ],
  why: 'Compression and expansion without heat flow are the strokes of every real engine — diesel, jet and rocket — and the curve PVᵞ = constant is what their designers integrate.',
  visual: {
    type: 'therm-pv',
    title: 'Compress a gas, with and without heat flow',
    lead: t`The gas starts at 100 kPa, 1.8 L and 300 K. Drag the end state to compress it. On the right, the same process on a temperature–entropy diagram. **The readout $W$ is the work done *by* the gas**: compression makes it negative, and the work done *on* the gas is $-W$.`,
    tasks: [
      'Compress air adiabatically to 0.1 L (a ratio of 18, like a diesel): it ends near 950 K — hot enough to ignite fuel without a spark.',
      'Switch to hot exhaust gas (γ = 1.2): the same squeeze heats it far less, because more of the work goes into rotation and vibration.',
      'Switch to isothermal: heat flows out as you compress (blue), and on the temperature–entropy panel the path is horizontal; the adiabat is vertical — no heat, no entropy change.',
    ],
    params: {
      mode: 'process', gas: 'air', gases: ['He', 'air', 'exhaust'], n: r4((100 * 1.8) / (8.314462618 * 300)), start: { P: 100, V: 1.8 }, process: 'adiabatic', processes: ['adiabatic', 'isothermal'], end: { V: 0.4 },
      controls: ['process', 'gas', 'end'], readouts: ['T2', 'P2', 'W', 'Q', 'dU'], vrange: [0, 2], prange: [0, 6500], ranges: { V2: [0.1, 1.8, 0.01] }, ts: true,
    },
    caption: 'An ideal gas with constant γ, compressed quasi-statically. Real fast compressions leak some heat to the walls and end a little cooler; real air’s γ falls to about 1.34 by 1000 K.',
  },
  example: {
    prompt: t`A diesel engine compresses air from $${EX.T1}$ K and 1 atm to $1/${EX.r}$ of its volume, quickly enough that no heat escapes. Find the final temperature and pressure, and the work done on one mole. Will diesel fuel (autoignition about 500 K) light?`,
    visual: procPic({ P: 101.3, V: 1.8, V2: 0.1, area: 'W on gas', vr: [0, 2], pr: [0, 6500], caption: 'Adiabatic compression of air by a factor of 18 on a PV diagram. Shaded: the work, which here is done on the gas.' }),
    steps: [
      { label: 'Derive the adiabat', text: t`$Q = 0$, so $dU = -P\,dV$. With $U = \tfrac f2NkT$ and $P = NkT/V$: $\tfrac f2 Nk\,dT = -\dfrac{NkT}{V}dV$, so $\tfrac f2\dfrac{dT}{T} = -\dfrac{dV}{V}$ and $VT^{f/2}$ is constant.` },
      { label: 'Temperature', text: t`$T_f = T_i\,(V_i/V_f)^{2/f} = ${EX.T1}\times${EX.r}^{0.4} = ${Math.round(EX.T2)}$ K, since $2/f = \gamma - 1 = 0.4$ for air.` },
      { label: 'Pressure', text: t`$PV^\gamma$ constant: $P_f = P_i\,${EX.r}^{1.4} = ${fmt(EX.P2, 3)}$ atm — not 18 atm, because the gas also got hotter.` },
      { label: 'Work', text: t`All of it becomes internal energy: $W = \Delta U = \tfrac52R\,\Delta T = 2.5(8.314)(${Math.round(EX.T2 - EX.T1)}) = ${fmt(EX.W / 1000, 3)}$ kJ per mole.` },
      { label: 'Sense check', text: t`${Math.round(EX.T2)} K is far above the fuel’s roughly 500 K autoignition point: diesels need no spark plug. Real engines lose some heat to the cylinder walls, so the true peak is a little lower.` },
    ],
    answer: t`$T_f \approx ${Math.round(EX.T2)}$ K, $P_f \approx ${fmt(EX.P2, 3)}$ atm, $W \approx ${fmt(EX.W / 1000, 3)}$ kJ/mol; yes, the fuel ignites.`,
  },
  practice: [
    num({
      id: 'isothermal-work', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2]), T = r.pick([280, 300, 350]), Vi = r.pick([4, 6, 8]), ratio = r.pick([2, 3, 4]), Vf = Vi / ratio;
        const W = n * R * T * Math.log(ratio);
        return {
          prompt: t`${n} mol of ideal gas is compressed slowly from ${Vi} L to ${fmt(Vf, 3)} L while held at ${T} K by a water bath. How much work is done on the gas?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: -W, feedback: 'Compression means work is done on the gas: positive in our convention.' }, { value: n * R * T * Math.log10(ratio), feedback: 'Use the natural logarithm, ln.' }, { value: n * R * T * (ratio - 1), feedback: t`The pressure rises as the volume shrinks: integrate $P = nRT/V$, giving a logarithm.` }], W),
          hints: [t`$W = -\int P\,dV$ with $P = nRT/V$ at constant $T$.`, t`$W = nRT\ln(V_i/V_f)$.`],
          teach: t`Isothermal compression work: $W = nRT\ln(V_i/V_f)$ — and the same amount leaves as heat.`,
          explain: t`$W = (${n})(8.314)(${T})\ln ${ratio} = ${fmt(W, 4)}$ J. Since $T$, and so $U$, is constant, $Q = -W$: all of it flows out into the bath.`,
          visual: procPic({ process: 'isothermal', P: 100, V: Vi, V2: Vf, caption: 'Isothermal compression: the shaded area under the curve is the work.' }),
        };
      },
    }),
    num({
      id: 'adiabatic-T', difficulty: 2,
      gen(r) {
        const key = r.pick(['He', 'air']), [name, g, f] = GAS[key], ratio = r.pick([3, 5, 8, 10]), Ti = r.pick([250, 290, 300]);
        const Tf = Ti * ratio ** (g - 1);
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} at ${Ti} K is compressed adiabatically and quasi-statically to $1/${ratio}$ of its volume. What is its final temperature? ($f = ${f}$.)`,
          answer: Tf, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: Ti * ratio, feedback: t`Temperature does not scale with the volume ratio itself: use $VT^{f/2}$ = constant.` }, { value: Ti * ratio ** g, feedback: t`That is the pressure ratio, $r^\gamma$. Temperature goes as $r^{\gamma - 1} = r^{2/f}$.` }, { value: Ti * ratio ** (f === 5 ? 2 / 3 : 0.4), feedback: `Check f: ${name} has f = ${f}.` }], Tf),
          hints: [t`$VT^{f/2}$ is constant, so $T_f = T_i(V_i/V_f)^{2/f}$.`, t`$2/f = ${fmt(2 / f, 3)}$.`],
          teach: t`Adiabatic compression by a factor $r$ multiplies $T$ by $r^{2/f} = r^{\gamma - 1}$.`,
          explain: t`$T_f = ${Ti}\times${ratio}^{${fmt(2 / f, 3)}} = ${Math.round(Tf)}$ K.`,
          visual: procPic({ gas: key, V: 2, V2: r4(2 / ratio), iso: true, area: '', caption: `Adiabatic compression of ${name} by ${ratio}:1. Dashed: isotherms through the end states (their temperatures are not labelled).` }),
        };
      },
    }),
    num({
      id: 'adiabatic-P', difficulty: 2,
      gen(r) {
        const key = r.pick(['He', 'air']), [name, g] = GAS[key], ratio = r.pick([2, 4, 6, 10]), Pi = r.pick([100, 150, 200]);
        const Pf = Pi * ratio ** g;
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} at ${Pi} kPa is compressed adiabatically to $1/${ratio}$ of its volume. What is the final pressure? ($\gamma = ${fmt(g, 3)}$.)`,
          answer: Pf, units: 'kPa', tol: { rel: 0.01 },
          errors: apart([{ value: Pi * ratio, feedback: 'That is the isothermal result (Boyle). Adiabatic compression also heats the gas, so the pressure rises more.' }, { value: Pi * ratio ** (g - 1), feedback: t`That is the temperature ratio. Pressure goes as $r^\gamma$.` }], Pf),
          hints: [t`$PV^\gamma$ is constant.`],
          teach: t`Adiabatic: $P_f = P_i(V_i/V_f)^\gamma$, steeper than Boyle’s law.`,
          explain: t`$P_f = ${Pi}\times${ratio}^{${fmt(g, 3)}} = ${fmt(Pf, 3)}$ kPa, against $${Pi * ratio}$ kPa if the temperature had held.`,
          visual: steepPic('An isotherm and an adiabat through the same start (air). For the same squeeze, the adiabat ends at higher pressure.'),
        };
      },
    }),
    mcq({
      id: 'why-warm', difficulty: 2,
      prompt: 'A bicycle pump’s barrel gets warm when you pump quickly. Which explanation is right?',
      choices: [
        'You do work on the air; with no time for heat to escape, that work becomes internal energy, so T rises',
        'PV = nRT: P goes up and V goes down, so T must go up',
        'The molecules collide more often in the smaller volume, which heats them',
        'Friction between the piston and barrel is the only source of the warming',
      ],
      answer: 0,
      why: { 1: 'PV = nRT alone cannot say whether PV rises or falls — an isothermal squeeze also raises P and lowers V with T fixed. The first law is needed.', 2: 'More frequent collisions do not by themselves add energy; the moving piston does.', 3: 'Friction adds a little, but a well-lubricated pump still heats the air by compression.' },
      hints: ['Which law says where the energy comes from?', 'Compare with an isothermal squeeze, where P rises and V falls but T does not change.'],
      teach: 'Adiabatic heating is the first law: work in, no heat out, so U and T rise.',
      explain: t`$\Delta U = Q + W$ with $Q \approx 0$ and $W > 0$: the work you do raises $U$, and for an ideal gas that means a higher $T$. The ideal gas law then gives the pressure, but it cannot by itself explain the warming — the classic misreading found by Loverude, Kautz and Heron.`,
      visual: steepPic('Squeezing quickly follows the steeper adiabat; slowly, with heat leaking out, the isotherm.'),
    }),
    num({
      id: 'adiabatic-work', difficulty: 3,
      gen(r) {
        const n = r.pick([0.5, 1, 2]), Ti = 300, ratio = r.pick([4, 8, 10]), key = r.pick(['He', 'air']), [name, g, f] = GAS[key];
        const Tf = Ti * ratio ** (g - 1), W = (f / 2) * n * R * (Tf - Ti);
        return {
          prompt: t`${n} mol of ${name} at 300 K is compressed adiabatically to $1/${ratio}$ of its volume. How much work is done on it?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: n * R * Ti * Math.log(ratio), feedback: 'That is the isothermal work. Adiabatically, all the work becomes internal energy: W = ΔU.' }, { value: (f / 2) * n * R * Tf, feedback: 'Use the change in temperature, not the final temperature.' }], W),
          hints: ['Q = 0, so W = ΔU.', t`Find $T_f = 300\times${ratio}^{2/f}$, then $W = \tfrac f2 nR(T_f - T_i)$.`],
          teach: t`Adiabatic work equals the change in internal energy, $\tfrac f2 nR\Delta T$.`,
          explain: t`$T_f = 300\times${ratio}^{${fmt(2 / f, 3)}} = ${Math.round(Tf)}$ K, so $W = \tfrac{${f}}{2}(${n})(8.314)(${Math.round(Tf - Ti)}) = ${fmt(W, 4)}$ J — more than the isothermal $${fmt(n * R * Ti * Math.log(ratio), 4)}$ J, because the hotter gas pushes back harder.`,
          visual: procPic({ gas: key, V: 2, V2: r4(2 / ratio), caption: `Adiabatic compression of ${name}: the shaded area is the work done on it.` }),
        };
      },
    }),
    mcq({
      id: 'more-work', difficulty: 2,
      prompt: 'A gas is compressed from the same start to the same final volume, once isothermally and once adiabatically. Which takes more work?',
      choices: ['Adiabatic: the gas heats up, so its pressure — and the area under the path — is larger', 'Isothermal: heat must also be removed', 'They are equal: the volumes are the same', 'Isothermal: the pressure rises more slowly, so the piston moves further'],
      answer: 0,
      why: { 1: 'Removing heat is not work done by the piston; the piston only fights the pressure.', 2: 'Work is the area under the path, and the paths differ.', 3: 'Both pistons move the same distance; it is the force along the way that differs.' },
      hints: ['Work is the area under the path on the PV diagram.', 'Which curve lies higher during a compression?'],
      teach: 'For a compression the adiabat lies above the isotherm, so it encloses more area.',
      explain: 'Without heat flow, the gas warms as it is squeezed and pushes back harder; the adiabat runs above the isotherm and the work, the area under it, is larger.',
      visual: steepPic(),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-jet-compressor', difficulty: 3, transfer: true,
      gen(r) {
        const rp = r.pick([20, 30, 40, 50]), T1 = 288.15, T2 = T1 * rp ** (0.4 / 1.4);
        return {
          prompt: t`The compressor of a turbofan raises air from sea-level conditions (288 K) through a pressure ratio of $${rp}$. Treating the compression as adiabatic and quasi-static with $\gamma = 1.4$, what temperature does the air reach?`,
          answer: T2, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: T1 * rp ** 0.4, feedback: t`That treats ${rp} as a *volume* ratio. For a pressure ratio, $T \propto P^{(\gamma-1)/\gamma}$.` }, { value: T1 * rp, feedback: 'Temperature does not scale with pressure alone: the volume shrinks too.' }], T2),
          hints: [t`Combine $PV^\gamma$ = const with $PV \propto T$ to eliminate $V$.`, t`$T_2 = T_1\,(P_2/P_1)^{(\gamma-1)/\gamma}$ with $(\gamma - 1)/\gamma = 0.2857$.`],
          teach: t`For a pressure ratio, the adiabatic temperature ratio is $(P_2/P_1)^{(\gamma-1)/\gamma}$.`,
          explain: t`$T_2 = 288\times${rp}^{0.2857} = ${Math.round(T2)}$ K. Real compressors are about 90% efficient and end some tens of kelvin hotter — which is why high-pressure-ratio engines need nickel-alloy rear compressor stages.`,
          visual: { type: 'graph', params: { x: [0, 55], y: [0, 1.2], aspect: 'wide', xlabel: 'compressor pressure ratio', ylabel: 'exit temperature (relative)', yticks: 0, axesAt: 'edge', curves: [{ fn: 'x^(0.2857)/55^(0.2857)', domain: [1, 55], color: 'accent' }], vlines: [{ x: rp, label: `ratio ${rp}`, color: 'gold' }] }, caption: 'The shape of the ideal compressor’s exit temperature against pressure ratio (no numbers on the vertical axis): it grows slowly, as the 0.29 power.' },
        };
      },
    }),
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const Tc = r.pick([3200, 3400, 3600]), Pc = r.pick([7, 10, 20]), Pe = 0.1, g = r.pick([1.2, 1.22, 1.25]);
        const Te = Tc * (Pe / Pc) ** ((g - 1) / g);
        return {
          prompt: t`Combustion gas leaves a rocket chamber at $${Tc}$ K and $${Pc}$ MPa and expands through the nozzle to $0.1$ MPa. Treat the expansion as adiabatic and quasi-static with $\gamma = ${g}$. What is the exhaust temperature at the exit?`,
          answer: Te, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: Tc * (Pe / Pc) ** (g - 1), feedback: t`That treats the pressure ratio as a volume ratio. Use $(P_e/P_c)^{(\gamma - 1)/\gamma}$.` }, { value: Tc * (Pe / Pc) ** (0.4 / 1.4), feedback: t`Hot exhaust has many active degrees of freedom: use $\gamma = ${g}$, not 1.4.` }], Te),
          hints: [t`$T \propto P^{(\gamma-1)/\gamma}$ along an adiabat.`, t`$(\gamma - 1)/\gamma = ${fmt((g - 1) / g, 3)}$ and $P_e/P_c = ${fmt(Pe / Pc, 3)}$.`],
          teach: 'A nozzle turns the gas’s internal energy into directed kinetic energy, and the adiabat says how much the gas cools.',
          explain: t`$T_e = ${Tc}\times(${fmt(Pe / Pc, 3)})^{${fmt((g - 1) / g, 3)}} = ${Math.round(Te)}$ K. The energy lost as the gas cools is what accelerates it. Real exhaust also recombines chemically as it cools, so its composition and $\gamma$ shift along the nozzle; constant $\gamma$ is a first estimate.`,
          visual: { type: 'therm-pv', params: { mode: 'process', gas: 'exhaust', n: 1, start: { P: Pc * 1000, T: Tc }, process: 'adiabatic', end: { P: 100 }, drag: false, readouts: [], isotherms: false, areaLabel: '', punit: 'kPa', vunit: 'L' }, caption: 'The nozzle expansion as an adiabat on a PV diagram, drawn for 1 mol of gas with γ = 1.2 (close to the value in the question). The shaded area is the work the expanding gas does.' },
        };
      },
    }),
    mcq({
      id: 'cp-isotherm-vs-adiabat', difficulty: 2,
      prompt: t`Along an adiabat, $PV^\gamma$ is constant. Through a given state, how does the adiabat’s slope compare with the isotherm’s?`,
      choices: [t`Steeper, by a factor $\gamma$: $dP/dV = -\gamma P/V$ against $-P/V$`, 'The same, since both are curves of an ideal gas', t`Shallower, by a factor $1/\gamma$`, 'Steeper by a factor f'],
      answer: 0,
      why: { 1: 'The isotherm keeps T fixed; along the adiabat T changes as well, which changes the slope.', 2: t`$\gamma > 1$, so the adiabat falls faster with volume.`, 3: t`Differentiate $PV^\gamma = C$: the factor is $\gamma$, not $f$.` },
      hints: [t`Differentiate $PV^\gamma = C$: $V^\gamma dP + \gamma PV^{\gamma-1}dV = 0$.`, t`Do the same for $PV = C$.`],
      teach: t`Adiabats are steeper than isotherms by the factor $\gamma$.`,
      explain: t`From $PV^\gamma = C$: $dP/dV = -\gamma P/V$; from $PV = C$: $-P/V$. With $\gamma > 1$ the adiabat is steeper.`,
      visual: steepPic(),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §1.5', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NASA Glenn Research Center: isentropic compression and the compressor', url: 'https://www.grc.nasa.gov/www/k-12/airplane/compth.html' },
  ],
});
