// The thermodynamic identity dU = T dS − P dV + μ dN: the three entropy slopes
// in one line; a relation between state functions that holds for any change
// between equilibrium states; T dS = đQ only when the change is quasistatic;
// entropy changes of ideal gases (free expansion, throttling, heating) computed
// along any convenient reversible path.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, r4, texNum, apart } from './_count.js';

const t = String.raw;
const MHE = 4.002602e-3, MN2 = 28.0134e-3;     // kg/mol

// a free expansion and two reversible routes between the same states of 1 mol of argon
const routes = {
  gas: 'Ar', n: 1, vrange: [0, 24], prange: [0, 300],
  states: { A: { T: 300, V: 10 }, B: { T: 300, V: 20 }, C: { T: 600, V: 20, label: 'C' } },
  paths: [
    { from: 'A', legs: [['free', 'B']], label: 'free expansion (irreversible)' },
    { from: 'A', legs: [['isothermal', 'B']], label: 'reversible isotherm' },
    { from: 'A', legs: [['isobaric', 'C'], ['isochoric', 'B']], label: 'heat, then cool' },
  ],
};
const twoState = (A, B, gas, caption, extra = {}) => ({
  type: 'therm-pv',
  params: { mode: 'paths', gas, n: 1, states: { A, B }, paths: [{ from: 'A', legs: [['line', 'B']], label: 'some process' }], readouts: [], isoLabels: false, heat: false, shade: false, ...extra },
  caption,
});

const EX = { T1: 300, V1: 10, T2: 450, V2: 25 };
EX.sT = 1.5 * R * Math.log(EX.T2 / EX.T1); EX.sV = R * Math.log(EX.V2 / EX.V1); EX.dS = EX.sT + EX.sV;

export default lesson({
  id: 'phys3700.T3.4',
  title: 'The thermodynamic identity',
  minutes: 13, difficulty: 3,
  intro: t`Entropy depends on $U$, $V$ and $N$, and you now know all three of its slopes: $1/T$, $P/T$ and $-\mu/T$. A small change is the sum of the three, $dS = dU/T + P\,dV/T - \mu\,dN/T$. Solved for $dU$, that is the **thermodynamic identity**:

$$dU = T\,dS - P\,dV + \mu\,dN.$$

It relates **state functions only**, so it holds for any change between two nearby equilibrium states, however the change happens. When the change is also *quasistatic* (slow, with $N$ fixed), the two terms are the heat and work of the first law: $T\,dS = đQ$ and $-P\,dV = đW$, the work done **on** the system. When it is not — a gas rushing into a vacuum — $T\,dS$ is bigger than the heat. That gives a working rule: **to find $\Delta S$ for any process, invent a reversible path between the same end states and integrate $dS = (dU + P\,dV)/T$ along it.** ([PHYS 2210 M19.4](#/lesson/phys2210.M19.4) used $\int dQ_\text{rev}/T$; this is the reason it works.)`,
  symbols: [
    { tex: 'U', text: 'internal energy, J' },
    { tex: 'T\\,dS', text: 'temperature times the change in entropy: the heat, when the change is quasistatic' },
    { tex: '-P\\,dV', text: 'pressure times the change in volume, with a minus sign: the work done **on** the system when quasistatic (Schroeder’s sign convention, $\\Delta U = Q + W$)' },
    { tex: '\\mu\\,dN', text: 'chemical potential times the number of particles added: the energy that comes in with them' },
  ],
  why: 'The identity is the master equation of thermodynamics: free energies (T5), Maxwell relations, the Clausius–Clapeyron equation and every engine calculation are rearrangements of it.',
  visual: {
    type: 'therm-pv',
    title: 'Three routes, one ΔS',
    lead: t`One mole of argon doubles its volume at 300 K by three routes: a free expansion into a vacuum (dashed: no equilibrium states along the way), a reversible isotherm, and a reversible heat-then-cool. The right panel is the temperature–entropy diagram. Compare the readouts.`,
    tasks: [
      t`Choose the free expansion: $Q = 0$ and $W = 0$, yet $\Delta S = R\ln 2 = 5.76$ J/K.`,
      t`Choose the isotherm: the same $\Delta S$, now carried in by $Q = T\Delta S$ — the area under its line on the T–S diagram.`,
      'Choose heat-then-cool: different heat and work, the same ΔS again. Entropy belongs to the states, not the route.',
    ],
    params: { mode: 'paths', ...routes, controls: ['path'], readouts: ['Q', 'W', 'dU', 'dS'], ts: true, isotherms: [300], isoLabels: true },
    caption: 'Argon as an ideal monatomic gas, 1 mol. W is the work done by the gas. The free expansion has no path through equilibrium states: its dashed line only joins the end points.',
  },
  example: {
    prompt: t`One mole of argon goes from $${EX.T1}$ K and $${EX.V1}$ L to $${EX.T2}$ K and $${EX.V2}$ L — by some fast, messy process. Find $\Delta S$.`,
    visual: twoState({ T: EX.T1, V: EX.V1 }, { T: EX.T2, V: EX.V2 }, 'Ar', 'The two end states on a PV diagram (the straight line only stands for an unknown, messy process).', { vrange: [0, 30], prange: [0, 300], paths: [{ from: 'A', legs: [['line', 'B']], label: 'messy process' }] }),
    steps: [
      { label: 'Use the identity', text: t`With $N$ fixed, $dS = \dfrac{dU}{T} + \dfrac{P}{T}dV$. For an ideal gas $dU = C_V\,dT$ and $P/T = nR/V$, so $dS = C_V\dfrac{dT}{T} + nR\dfrac{dV}{V}$ — between *any* two nearby equilibrium states.` },
      { label: 'Integrate', text: t`$\Delta S = C_V\ln\dfrac{T_2}{T_1} + nR\ln\dfrac{V_2}{V_1}$, with $C_V = \tfrac32 R$ for argon.` },
      { label: 'Numbers', text: t`$\Delta S = \tfrac32(8.314)\ln(${fmt(EX.T2 / EX.T1, 3)}) + 8.314\ln(${fmt(EX.V2 / EX.V1, 3)}) = ${fmt(EX.sT, 4)} + ${fmt(EX.sV, 4)} = ${fmt(EX.dS, 4)}$ J/K.` },
      { label: 'Why it is allowed', text: t`The real process passed through non-equilibrium states, but $S$ is a state function: any reversible route between the same ends — heat at constant volume, then expand isothermally — gives the same $\Delta S$. The heat the messy process actually absorbed does not follow this rule: for an irreversible change, $\int đQ/T$ falls short of $\Delta S$.` },
      { label: 'Sense check', text: t`Both factors grew, so both terms are positive. Each doubling of $V$ adds $R\ln 2 = 5.76$ J/K; each doubling of $T$ adds $\tfrac32 R\ln 2 = 8.64$ J/K.` },
    ],
    answer: t`$\Delta S = C_V\ln(T_2/T_1) + nR\ln(V_2/V_1) = ${fmt(EX.dS, 4)}$ J/K, whatever the process.`,
  },
  practice: [
    match({
      id: 'derivatives', difficulty: 2,
      prompt: t`Read the slopes off the identity $dU = T\,dS - P\,dV + \mu\,dN$. Match each partial derivative to what it equals.`,
      left: [t`$\left(\dfrac{\partial U}{\partial S}\right)_{V,N}$`, t`$-\left(\dfrac{\partial U}{\partial V}\right)_{S,N}$`, t`$\left(\dfrac{\partial U}{\partial N}\right)_{S,V}$`, t`$\left(\dfrac{\partial S}{\partial U}\right)_{V,N}$`],
      right: ['T, the temperature', 'P, the pressure', 'μ, the chemical potential', '1/T', '−P', 'S/T'],
      answer: [0, 1, 2, 3],
      hints: ['Hold two of S, V, N fixed and see which term of the identity survives.', 'The last one comes from the identity rearranged for dS.'],
      teach: 'Each term of the identity is a slope times a change: hold the others fixed and read it off.',
      explain: t`At fixed $V$ and $N$, $dU = T\,dS$; at fixed $S$ and $N$, $dU = -P\,dV$; at fixed $S$ and $V$, $dU = \mu\,dN$. Rearranged, $dS = dU/T + \dots$, so $(\partial S/\partial U)_{V,N} = 1/T$ — where this module began.`,
    }),
    num({
      id: 'dS-ideal', difficulty: 2,
      gen(r) {
        const [gas, cv, name] = r.pick([['He', 1.5, 'helium'], ['air', 2.5, 'nitrogen']]), n = r.pick([0.5, 1, 2]);
        const T1 = r.pick([250, 300]), T2 = r.pick([400, 600]), k = r.pick([0.5, 2, 3]);
        const dS = n * R * (cv * Math.log(T2 / T1) + Math.log(k));
        return {
          prompt: t`$${n}$ mol of ${name} (an ideal gas with $C_V = ${cv}R$ per mole) goes from $${T1}$ K to $${T2}$ K while its volume ${k > 1 ? `grows by a factor of ${k}` : 'halves'}. What is its change in entropy?`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: n * R * cv * Math.log(T2 / T1), feedback: t`Add the volume term $nR\ln(V_2/V_1)$.` }, { value: n * R * (cv * Math.log(T2 / T1) - Math.log(k)), feedback: t`Sign of the volume term: it is $nR\ln(V_2/V_1)$, final over initial.` }, { value: n * R * ((cv + 1) * Math.log(T2 / T1) + Math.log(k)), feedback: t`At constant volume the heat capacity is $C_V$, not $C_P$.` }], dS),
          hints: [t`$\Delta S = nC_V\ln(T_2/T_1) + nR\ln(V_2/V_1)$.`, t`$C_V = ${cv}R$ per mole and $V_2/V_1 = ${k}$.`],
          teach: t`For an ideal gas, $\Delta S = nC_V\ln(T_2/T_1) + nR\ln(V_2/V_1)$ — from the identity, whatever the process.`,
          explain: t`$\Delta S = (${n})(8.314)\left[${cv}\ln\tfrac{${T2}}{${T1}} + \ln ${k}\right] = ${fmt(dS, 3)}$ J/K.`,
          visual: twoState({ T: T1, V: 10 }, { T: T2, V: 10 * k }, gas, 'The two end states (volumes drawn for 10 L at the start; the line between them is only a stand-in for the actual process).'),
        };
      },
    }),
    mcq({
      id: 'TdS-heat', difficulty: 2,
      prompt: t`When does $T\,dS$ equal the heat $đQ$ that flows into a system of fixed $N$?`,
      choices: ['When the change is quasistatic, so the system passes through equilibrium states', 'Always: that is what the thermodynamic identity says', 'Only when the temperature is constant', 'Only when no work is done'],
      answer: 0,
      why: { 1: t`The identity relates $dU$, $dS$ and $dV$ for any change, but it splits $dU$ into heat and work only when the process is quasistatic. In a free expansion $đQ = 0$ while $T\,dS > 0$.`, 2: t`$đQ = T\,dS$ holds along any quasistatic path, isothermal or not; then $\Delta S = \int đQ/T$.`, 3: 'Quasistatic work is fine: −P dV accounts for it. The issue is irreversibility, not work.' },
      hints: ['Think of a gas expanding into a vacuum: what are Q and ΔS?'],
      teach: t`$T\,dS = đQ$ and $-P\,dV = đW$ only for quasistatic changes; otherwise $T\,dS > đQ$.`,
      explain: t`For a quasistatic change $đW = -P\,dV$, and comparing $dU = đQ + đW$ with the identity gives $đQ = T\,dS$. For a fast change, entropy is created inside the system, so $dS > đQ/T$.`,
      visual: { type: 'therm-pv', params: { mode: 'paths', ...routes, paths: routes.paths.slice(0, 2), show: 'all', readouts: [], isotherms: [300], isoLabels: false, shade: false }, caption: 'A free expansion (dashed) and a reversible isotherm between the same states of 1 mol of argon.' },
    }),
    num({
      id: 'P-from-U', difficulty: 3,
      gen(r) {
        const U = r.pick([1.5, 3, 4.5, 6]), V = r.pick([5, 10, 20]), P = (2 / 3) * (U * 1000) / (V * 1e-3);
        return {
          prompt: t`Inverting the Sackur–Tetrode entropy gives a monatomic ideal gas’s energy as a function of $S$ and $V$: $U(S, V) = c\,V^{-2/3}e^{2S/3Nk}$ (with $c$ depending on $N$). Use $P = -(\partial U/\partial V)_{S,N}$ to find the pressure when $U = ${U}$ kJ and $V = ${V}$ L.`,
          answer: P / 1000, units: 'kPa', tol: { rel: 0.01 },
          errors: apart([{ value: (U * 1000) / (V * 1e-3) / 1000, feedback: t`Differentiate: $\partial(V^{-2/3})/\partial V = -\tfrac23V^{-5/3}$, which brings a factor $\tfrac23$.` }, { value: (1 / 3) * (U * 1000) / (V * 1e-3) / 1000, feedback: t`That is the photon gas’s $U/3V$. For a monatomic gas the factor is $\tfrac23$.` }], P / 1000),
          hints: [t`$\left(\dfrac{\partial U}{\partial V}\right)_S = -\dfrac23\dfrac{U}{V}$.`, t`So $P = \dfrac{2U}{3V}$.`],
          teach: t`At fixed entropy, $-\partial U/\partial V$ is the pressure: for a monatomic ideal gas, $P = 2U/3V$.`,
          explain: t`$P = \dfrac{2U}{3V} = \dfrac{2(${U}\times10^3)}{3(${V}\times10^{-3})} = ${fmt(P / 1000, 3)}$ kPa. With $U = \tfrac32 NkT$ this is just $PV = NkT$ again.`,
          visual: { type: 'graph', params: { x: [0, 40], y: [0, r4(1.6 * U)], aspect: 'wide', xlabel: 'volume (L)', ylabel: 'U at fixed S (kJ)', axesAt: 'edge', curves: [{ fn: `${U}*(x/${V})^(-2/3)`, domain: [2, 40], color: 'accent' }, { fn: `${U} - ${r4((2 / 3) * (U / V))}*(x - ${V})`, domain: [Math.max(0, V - 8), V + 8], color: 'gold', width: 2 }], points: [{ x: V, y: U, r: 5, color: 'gold' }] }, caption: 'The energy of the gas against its volume along an adiabat (S fixed). Expanding lowers U: the gas does work. The gold tangent’s slope is −P.' },
        };
      },
    }),
    num({
      id: 'throttle-dS', difficulty: 3,
      gen(r) {
        const P1 = r.pick([5, 10, 20]), P2 = r.pick([1, 2]), n = r.pick([1, 2, 5]), dS = n * R * Math.log(P1 / P2);
        return {
          prompt: t`$${n}$ mol of nitrogen, treated as an ideal gas, is throttled through a valve from $${P1}$ bar to $${P2}$ bar. No heat flows, no net work is done, and for an ideal gas the temperature ends where it started. What is its change in entropy?`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: 0, feedback: 'No heat flowed, but the throttle is irreversible. Find ΔS along a reversible path between the same states.' }, { value: n * R * Math.log(P2 / P1), feedback: 'The gas expands: its entropy rises.' }], dS),
          hints: [t`The end states have the same $T$, so replace the throttle by a reversible isothermal expansion.`, t`$\Delta S = nR\ln(V_2/V_1) = nR\ln(P_1/P_2)$.`],
          teach: 'An irreversible process with Q = 0 can still create entropy; compute it along a reversible path between the same states.',
          explain: t`$\Delta S = nR\ln(P_1/P_2) = (${n})(8.314)\ln(${P1}/${P2}) = ${fmt(dS, 3)}$ J/K, all of it created by the irreversible flow through the valve.`,
          visual: { type: 'therm-pv', params: { mode: 'paths', gas: 'N2', n, punit: 'bar', states: { A: { P: P1, T: 300 }, B: { P: P2, T: 300 } }, paths: [{ from: 'A', legs: [['free', 'B']], label: 'throttle' }, { from: 'A', legs: [['isothermal', 'B']], label: 'reversible stand-in' }], show: 'all', readouts: [], isotherms: false, shade: false }, caption: 'Throttling (dashed: no equilibrium path) and the reversible isotherm used to compute ΔS between the same states. Drawn at 300 K.' },
        };
      },
    }),
    num({
      id: 'mu-einstein', difficulty: 3,
      gen(r) {
        const x = r.pick([5, 10, 20, 50]), v = -Math.log(x);
        return {
          prompt: t`An Einstein solid with $q \gg N$ has $S = Nk[\ln(q/N) + 1]$. Holding $U$ (that is, $q$) and $V$ fixed, use $\mu = -T(\partial S/\partial N)_{U,V}$ to find $\mu/kT$ when there are $${x}$ quanta per oscillator.`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'Watch the sign: adding an oscillator at fixed energy raises S, so μ is negative.' }, { value: -(Math.log(x) + 1), feedback: t`Differentiate the product: $\partial/\partial N\{N[\ln q - \ln N + 1]\} = \ln(q/N) + 1 - 1$.` }], v),
          hints: [t`$\partial S/\partial N = k[\ln(q/N) + 1] + Nk\cdot(-1/N)$.`, t`So $\partial S/\partial N = k\ln(q/N)$, and $\mu = -kT\ln(q/N)$.`],
          teach: t`μ is the energy cost of adding a particle at fixed $S$ — or, equivalently, $-T$ times the entropy it adds at fixed $U$.`,
          explain: t`$\mu = -kT\ln(q/N) = -kT\ln ${x} = ${fmt(v, 3)}\,kT$. An extra oscillator, sharing the same energy, opens up many new microstates, so the system “wants” particles: $\mu < 0$.`,
          visual: { type: 'graph', params: { x: [0, 60], y: [-4.5, 0], aspect: 'wide', xlabel: 'quanta per oscillator, q/N', ylabel: 'μ / kT', axesAt: 'edge', curves: [{ fn: '-ln(x)', domain: [1, 60], color: 'accent' }], vlines: [{ x, color: 'gold' }] }, caption: 'The chemical potential of a high-temperature Einstein solid, in units of kT, against the quanta per oscillator.' },
        };
      },
    }),
    mcq({
      id: 'err-fast-compression', difficulty: 3, kind: 'error',
      prompt: t`A student analyses a gas compressed **suddenly** by a heavy piston in an insulated cylinder: “The cylinder is insulated, so $Q = 0$. Then $\Delta S = \int đQ/T = 0$, and the final state is the same as for a slow adiabatic compression to the same volume.” What is wrong?`,
      choices: [
        t`$\int đQ/T$ gives $\Delta S$ only along a quasistatic path; the sudden compression creates entropy, so the gas ends hotter than after a slow compression`,
        'Nothing: an insulated process always has ΔS = 0',
        'The entropy falls, because the gas is compressed into a smaller volume',
        'Q is not zero: a sudden compression lets heat in',
      ],
      answer: 0,
      why: { 1: 'Only a quasistatic (reversible) adiabatic process keeps S constant. Irreversible ones raise it.', 2: 'Compression alone lowers S, but the irreversible heating raises it more; the total change is positive.', 3: 'The insulation still blocks heat; the entropy is created inside the gas.' },
      hints: [t`Is a sudden compression quasistatic?`, t`At the same final volume, a higher $S$ means a higher $T$ — check with $\Delta S = C_V\ln(T_2/T_1) + nR\ln(V_2/V_1)$.`],
      teach: 'Q = 0 means ΔS = 0 only for a reversible process; irreversible adiabatic processes create entropy.',
      explain: t`The piston does more work than the slow minimum (it overshoots and sloshes the gas), and that extra energy ends as internal energy. At the same final volume the gas is hotter, so by $\Delta S = C_V\ln(T_2/T_1) + nR\ln(V_2/V_1)$ its entropy is higher than at the start. The identity still holds between the end states; $đQ = T\,dS$ does not hold along the way.`,
      visual: { type: 'therm-pv', params: { mode: 'paths', gas: 'air', n: 1, states: { A: { T: 300, V: 20 }, B: { V: 10, T: r4(300 * 2 ** 0.4) }, C: { V: 10, T: 460 } }, paths: [{ from: 'A', legs: [['adiabatic', 'B']], label: 'slow (reversible) adiabat' }, { from: 'A', legs: [['line', 'C']], label: 'sudden (end points only)', color: 'warn' }], show: 'all', readouts: [], isotherms: false, shade: false, heat: false }, caption: 'A slow adiabatic compression of 1 mol of air to half its volume, and a sudden one that ends hotter (its straight line only joins the end points: the gas passes through no equilibrium states). The sudden end state is illustrative.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-regulator', difficulty: 3, transfer: true,
      gen(r) {
        const P1 = r.pick([3, 4, 6]), P2 = r.pick([0.3, 0.5]), s = (R / MHE) * Math.log(P1 / P2);
        return {
          prompt: t`A rocket stage’s helium pressurant passes through a regulator that drops it from $${P1}$ MPa to $${P2}$ MPa before it enters the propellant tank. Treat helium as an ideal gas whose temperature is the same on both sides. How much entropy does the regulator create per kilogram of helium?`,
          answer: s, units: 'J/(kg K)', tol: { rel: 0.01 },
          errors: apart([{ value: R * Math.log(P1 / P2), feedback: 'That is per mole. Divide by helium’s molar mass, 4.003 g/mol.' }, { value: (R / MN2) * Math.log(P1 / P2), feedback: 'Use helium’s molar mass, not nitrogen’s.' }, { value: 0, feedback: 'No heat flows, but throttling is irreversible: it creates entropy.' }], s),
          hints: [t`Replace the regulator by a reversible isothermal expansion: $\Delta S = nR\ln(P_1/P_2)$.`, t`Per kilogram, $n = 1/M$ with $M = 4.003\times10^{-3}$ kg/mol.`],
          teach: 'Throttling creates entropy nR ln(P₁/P₂) for an ideal gas — lost ability to do work.',
          explain: t`$\Delta s = \dfrac{R}{M}\ln\dfrac{P_1}{P_2} = \dfrac{8.314}{0.004003}\ln\dfrac{${P1}}{${P2}} = ${fmt(s, 4)}$ J/(kg·K). Multiplied by the surroundings’ temperature (about 300 K) that is roughly $${fmt((s * 300) / 1e6, 2)}$ MJ per kilogram of work that the expanding gas could have done in a turbine instead (T4.1). Real helium at a few MPa is within about a per cent of ideal.`,
          visual: { type: 'therm-pv', params: { mode: 'paths', gas: 'He', n: 1, punit: 'MPa', vunit: 'L', states: { A: { P: P1, T: 300 }, B: { P: P2, T: 300 } }, paths: [{ from: 'A', legs: [['free', 'B']], label: 'regulator' }], show: 'all', readouts: [], isotherms: false, shade: false }, caption: 'One mole of helium before and after the regulator, drawn at 300 K. The dashed line is not a path: the gas passes through non-equilibrium states in the valve.' },
        };
      },
    }),
    num({
      id: 'cp-two-step', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2]), T1 = 300, T2 = r.pick([200, 400, 500]), P1 = 100, P2 = r.pick([50, 200, 300]);
        const dS = n * R * (2.5 * Math.log(T2 / T1) - Math.log(P2 / P1));
        return {
          prompt: t`$${n}$ mol of helium ($C_P = \tfrac52 R$ per mole) goes from $${T1}$ K and $${P1}$ kPa to $${T2}$ K and $${P2}$ kPa. Find $\Delta S$ using a path of your choice.`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: n * R * (1.5 * Math.log(T2 / T1) - Math.log(P2 / P1)), feedback: t`At constant pressure use $C_P = \tfrac52R$, or else use $C_V$ with the volume ratio, not the pressure ratio.` }, { value: n * R * (2.5 * Math.log(T2 / T1) + Math.log(P2 / P1)), feedback: 'Raising the pressure at constant T lowers the entropy: −nR ln(P₂/P₁).' }], dS),
          hints: [t`Heat at constant pressure, then change the pressure isothermally.`, t`$\Delta S = nC_P\ln(T_2/T_1) - nR\ln(P_2/P_1)$.`],
          teach: t`In terms of $T$ and $P$: $\Delta S = nC_P\ln(T_2/T_1) - nR\ln(P_2/P_1)$.`,
          explain: t`$\Delta S = (${n})(8.314)\left[2.5\ln\tfrac{${T2}}{${T1}} - \ln\tfrac{${P2}}{${P1}}\right] = ${fmt(dS, 3)}$ J/K.`,
          visual: { type: 'therm-pv', params: { mode: 'paths', gas: 'He', n, states: { A: { T: T1, P: P1 }, B: { T: T2, P: P2 }, M: { T: T2, P: P1, label: '' } }, paths: [{ from: 'A', legs: [['isobaric', 'M'], ['isothermal', 'B']], label: 'isobar, then isotherm' }], show: 'all', readouts: [], isoLabels: false, heat: false }, caption: 'One convenient reversible route between the two states: constant pressure, then constant temperature.' },
        };
      },
    }),
    mcq({
      id: 'cp-adiabat', difficulty: 2,
      prompt: 'A gas expands slowly in an insulated cylinder, pushing a piston. Which statement follows from the thermodynamic identity?',
      choices: [t`$dS = 0$, so $dU = -P\,dV$: the gas cools as it does work`, t`$dU = 0$, because no heat enters`, t`$dS > 0$, because the volume grows`, t`$dU = T\,dS$, because no particles enter`],
      answer: 0,
      why: { 1: 'No heat enters, but the gas does work, so its energy falls.', 2: 'Volume growth raises S, but the cooling lowers it by exactly as much in a reversible adiabat.', 3: t`With $dV \ne 0$ the $-P\,dV$ term is not zero.` },
      hints: ['Slow and insulated: what is đQ, and so what is T dS?'],
      teach: t`Quasistatic and insulated means $dS = 0$, and the identity reduces to $dU = -P\,dV$.`,
      explain: t`Slow means quasistatic, so $T\,dS = đQ = 0$. The identity gives $dU = -P\,dV < 0$ for an expansion: the gas’s energy pays for the work, and its temperature drops.`,
      visual: { type: 'therm-pv', params: { mode: 'process', gas: 'air', n: 1, start: { T: 400, V: 10 }, process: 'adiabatic', end: { V: 25 }, drag: false, readouts: [], isoLabels: false }, caption: 'A reversible adiabatic expansion of 1 mol of air; the shaded area is the work done by the gas, paid for by its internal energy.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §3.4', url: 'https://physics.weber.edu/thermal/' },
  ],
});
