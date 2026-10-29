// Superconductivity and the critical temperature — the lab view: a YBCO
// pellet's four-probe resistance through its transition, swept warming and
// cooling past liquid-nitrogen temperature. T_c at the midpoint of the
// transition (half the extrapolated normal-state resistance), its 10–90 %
// width, and two systematics: thermal lag between the sensor and the pellet
// (the warming and cooling curves straddle T_c; their mean removes it), and
// thermal EMFs in the voltage leads, which leave a false resistance floor
// below T_c that current reversal removes. Liquid nitrogen's boiling point
// at altitude as a sensor check, and a thermocouple on a chilling propellant
// line as the transfer. Theory: phys2710.MP12.4. Every number is computed
// here from the seeded model the labg-rig simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table } from './_labf.js';

const t = String.raw;
const TC = G.TC;
const LAG = (TC.rate / 60) * TC.lag;                      // K

// ── the worked example: seed 2, thermal EMFs present, no reversal ──
const EX = G.run('tc', { seed: 2 });
const EXr = G.run('tc', { seed: 2, flags: { rev: true } });
const W = EX.warm, C = EX.cool;
const Tmean = (W.mid + C.mid) / 2, half = (W.mid - C.mid) / 2;

// ── the code exercise: seed 9, the warming sweep (every other reading), no EMF ──
const CR = G.run('tc', { seed: 9, flags: { emf: false } });
const IDX = CR.warm.T.map((_, i) => i).filter((i) => i % 2 === 0);
const CT = IDX.map((i) => CR.warm.T[i]), CRm = IDX.map((i) => +(CR.warm.R[i] * 1e6).toFixed(2));
const CN = CT.map((T, i) => i).filter((i) => CT[i] >= 97 && CT[i] <= 110);
const CNF = G.fitLine(CN.map((i) => CT[i]), CN.map((i) => CRm[i]));
const Cr = CRm.map((R, i) => R / (CNF.a + CNF.b * CT[i]));
const CMID = (() => { for (let i = 1; i < CT.length; i++) if (Cr[i - 1] < 0.5 && Cr[i] >= 0.5) return CT[i - 1] + ((0.5 - Cr[i - 1]) * (CT[i] - CT[i - 1])) / (Cr[i] - Cr[i - 1]); return NaN; })();

// liquid nitrogen's boiling point at a pressure p (Clausius–Clapeyron with ΔH_vap = 5.57 kJ/mol)
const TB0 = 77.355, HV = 5570, RG = 8.314462618;
const nBoil = (pkPa) => 1 / (1 / TB0 - (RG / HV) * Math.log(pkPa / 101.325));

// mids = [warming, cooling] midpoints to draw at (default: the true Tc ± the lag)
const sweepPic = (caption, extra = {}, [up, dn] = [TC.Tc + LAG, TC.Tc - LAG]) => ({ type: 'graph', params: { aspect: 'wide', x: [86, 98], y: [-0.08, 1.12], xlabel: 'T read by the sensor (K)', ylabel: 'R / R(normal)', axesAt: 'edge', curves: [{ fn: `1/(1 + exp(-(x - ${r6(up)})/${TC.w}))`, color: 'warn', label: 'warming', labelAt: r6(up + 1.6), labelDy: 14 }, { fn: `1/(1 + exp(-(x - ${r6(dn)})/${TC.w}))`, color: 'accent', label: 'cooling', labelAt: r6(dn - 1.7), labelDy: -14 }], hlines: [{ y: 0.5, color: 'ink3' }], ...extra }, caption });

export default lesson({
  id: 'lab.E.17',
  title: 'Superconductivity and the critical temperature',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`Below its critical temperature a superconductor carries current with no resistance at all ([the physics](#/lesson/phys2710.MP12.4)). YBa₂Cu₃O₇ (YBCO) does it at about 92 K — above the 77 K of liquid nitrogen, which is what made it famous in 1987. The measurement: a pellet with four contacts (current through the outer two, voltage across the inner two, so contact resistance drops out), cooled in nitrogen vapour and swept slowly through the transition. Two things stand between the sensor’s reading and the truth. The pellet **lags** the sensor by a time $\tau$, so while warming at rate $\dot T$ the sensor reads high by $\tau\dot T$, and while cooling, low:

$$T_{\text{mid}}^{\uparrow,\downarrow} = T_c \pm \tau\,|\dot T| \qquad\Rightarrow\qquad T_c = \tfrac12\bigl(T_{\text{mid}}^{\uparrow} + T_{\text{mid}}^{\downarrow}\bigr)$$

And **thermal EMFs** of a few microvolts in the leads make zero resistance look like something.`,
  symbols: [
    { tex: 'T_c', text: 'the critical temperature, in K, taken here at the midpoint: where $R$ falls to half the normal-state resistance extrapolated into the transition' },
    { tex: 'T_{\\text{mid}}^{\\uparrow},\\ T_{\\text{mid}}^{\\downarrow}', text: 'the midpoints read by the sensor on a warming and on a cooling sweep, in K' },
    { tex: '\\tau', text: 'the thermal lag: the time the pellet takes to follow the sensor’s copper block, in s' },
    { tex: '\\dot T', text: 'the sweep rate, in K/min (1 K/min here); convert $\\tau$ to minutes, or $\\dot T$ to K/s' },
  ],
  why: t`Superconducting magnets run MRI scanners, particle accelerators and fusion experiments, and high-temperature superconducting cables are being designed for hydrogen-cooled electric aircraft — and every one of them is specified by a $T_c$ measured like this.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: a YBCO pellet through its transition',
    lead: t`The top panel shows both sweeps, resistance against the sensor’s temperature: cooling in blue, warming in orange. Below, the transition close up, normalized to the normal state, with each sweep’s midpoint marked. The readout gives $T_c$ by the analysis you choose, half the gap between the sweeps, and the resistance the leads report below $T_c$.`,
    tasks: [
      'Compare the warming and cooling sweeps: their midpoints are about 1.7 K apart. Neither is $T_c$; their mean is, to within a few hundredths of a kelvin.',
      'Read “R below $T_c$”: about 60 μΩ with thermal EMFs present — the sample looks not quite superconducting. Turn on current reversal: the floor drops to zero within its noise.',
      'Turn the EMFs off with reversal off: the floor is also zero. Reversal costs a second reading per point and makes the zero trustworthy.',
    ],
    params: { exp: 'tc', seed: 2 },
    caption: t`Simulated four-probe readings at 100 mA: a logistic transition with midpoint 92.0 K and 10–90 % width 1.5 K over a linear normal state, a sensor read to 0.03 K (0.3 K calibration, Type B), a pellet lagging the sensor by 50 s at 1 K/min, 0.3 μV voltmeter noise, and 6 μV of thermal EMF when switched on. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A run swept at 1.0 K/min gives transition midpoints $T_{\text{mid}}^{\downarrow} = ${C.mid.toFixed(2)}$ K (cooling) and $T_{\text{mid}}^{\uparrow} = ${W.mid.toFixed(2)}$ K (warming), with a 10–90 % width of about $${W.width.toFixed(1)}$ K. Below 88 K the leads report $R = ${pmT(W.floor * 1e6, W.sFloor * 1e6)}\ \mu\Omega$ with the current in one direction only. Find $T_c$ and the thermal lag, and decide whether the pellet is really superconducting.`,
    visual: rig('tc', { seed: 2 }, t`Both sweeps (top) and the transition normalized, with each sweep’s midpoint marked. ${SIMNOTE}`),
    steps: [
      { label: 'Average the sweeps', text: t`$T_c = \tfrac12(${W.mid.toFixed(2)} + ${C.mid.toFixed(2)}) = ${Tmean.toFixed(2)}$ K: the lag shifts the two sweeps equally and oppositely, so it cancels in the mean.` },
      { label: 'The lag', text: t`Half the gap is $\tau\dot T = ${half.toFixed(2)}$ K. At $\dot T = 1.0$ K/min $= ${(1 / 60).toFixed(4)}$ K/s, $\tau = ${half.toFixed(2)}/${(1 / 60).toFixed(4)} = ${(half * 60).toFixed(0)}$ s. Sweeping ten times slower would shrink the gap tenfold.` },
      { label: 'Uncertainty', text: t`The midpoints themselves are read to a few hundredths of a kelvin; the sensor’s 0.3 K calibration dominates: $T_c = ${Tmean.toFixed(1)} \pm 0.3$ K. Typical for well-oxygenated YBCO: about 92 K. Samples with less oxygen are lower — the value is a property of this pellet.` },
      { label: 'The floor', text: t`$${(W.floor * 1e6).toFixed(0)}\ \mu\Omega$ at 100 mA is $${(W.floor * 0.1 * 1e6).toFixed(1)}\ \mu\text{V}$ — the size of a thermal EMF where copper meets solder at different temperatures. It does not depend on the current, so reversing the current flips the real voltage and not the EMF.` },
      { label: 'Reverse', text: t`With $V = [V(+I) - V(-I)]/2$ the floor becomes $${pmT(EXr.warm.floor * 1e6, EXr.warm.sFloor * 1e6)}\ \mu\Omega$: zero within the noise. “Zero resistance” is a claim with an upper limit: here, below about $${(2 * EXr.warm.sFloor * 1e6).toFixed(1)}\ \mu\Omega$, under ${(100 * 2 * EXr.warm.sFloor / (TC.Ra + TC.Rb * TC.Tc)).toFixed(2)} % of the normal state just above $T_c$. Better limits need more current, longer averaging, or a persistent-current ring.` },
    ],
    answer: t`$T_c = ${Tmean.toFixed(1)} \pm 0.3$ K (mean of the sweeps), thermal lag $\approx ${(half * 60).toFixed(0)}$ s; with current reversal the resistance below $T_c$ is zero within $${(2 * EXr.warm.sFloor * 1e6).toFixed(1)}\ \mu\Omega$.`,
  },
  practice: [
    mcq({
      id: 'four-probe', difficulty: 1,
      prompt: t`Why measure the pellet with four contacts instead of two?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 6.5], y: [-1.2, 1.4], equal: true, axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['0.5 + 5*t', '0'], t: [0, 1], color: 'ink2', width: 10 }], points: [{ x: 0.7, y: 0, r: 6, color: 'gold', label: 'I in', labelDy: -18 }, { x: 5.3, y: 0, r: 6, color: 'gold', label: 'I out', labelDy: -18 }, { x: 2.2, y: 0, r: 6, color: 'violet', label: 'V', labelDy: 18 }, { x: 3.8, y: 0, r: 6, color: 'violet', label: 'V', labelDy: 18 }] }, caption: 'The pellet (grey) with its two current contacts (gold) and two voltage contacts (violet). Schematic.' },
      choices: ['The voltage contacts carry almost no current, so their contact resistance drops no voltage and is not measured', 'Four contacts halve the noise', 'It lets the current be reversed', 'Two contacts would short-circuit the superconductor'],
      answer: 0,
      why: {
        1: 'Noise depends on the voltmeter and the current, not on the number of contacts.',
        2: 'Reversal works with two contacts too; it removes EMFs, not contact resistance.',
        3: 'Nothing is short-circuited; with two contacts you would measure the contacts’ resistance in series with the sample’s.',
      },
      hints: ['With two contacts, the meter sees the sample plus whatever resistance the joints have. Which joints carry current in the four-probe layout?'],
      teach: 'Four-probe: current through one pair, voltage across another that carries no current — contact resistance falls out.',
      explain: t`Silver-paint contacts on a ceramic pellet can have ohms of resistance — a million times the sample’s superconducting “zero”. Only a four-probe measurement can show the drop to zero.`,
    }),
    num({
      id: 'lag', difficulty: 2,
      gen(r) {
        const rate = r.pick([0.5, 1, 2, 3]), tau = r.pick([20, 30, 45, 60, 90]);
        const ans = (rate / 60) * tau;
        return {
          prompt: t`The sensor’s block is warmed at ${rate} K/min, and the pellet lags it with a time constant of ${tau} s. By how much does the sensor read above the pellet’s temperature?`,
          visual: sweepPic('A warming and a cooling sweep straddling the true transition (illustrative, for a 0.8 K lag).'),
          answer: ans, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: rate * tau, feedback: 'Convert: the rate is per minute and τ is in seconds.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`For a steady ramp, the follower lags by $\tau\dot T$.`],
          teach: 'A first-order lag behind a steady ramp is the time constant times the rate.',
          explain: t`$\tau\dot T = ${tau}\ \text{s} \times ${(rate / 60).toFixed(4)}\ \text{K/s} = ${ans.toFixed(2)}$ K. The pellet always trails: below the sensor when warming, above it when cooling.`,
        };
      },
    }),
    num({
      id: 'mean-sweeps', difficulty: 2,
      gen(r) {
        const Tc = r.float(88, 93, 0.01), off = r.float(0.3, 1.5, 0.01);
        const up = +(Tc + off).toFixed(2), dn = +(Tc - off).toFixed(2);
        const ans = (up + dn) / 2;
        return {
          prompt: t`The warming sweep’s midpoint reads ${up} K and the cooling sweep’s ${dn} K, at the same rate. What is $T_c$?`,
          visual: sweepPic('The two sweeps drawn at the midpoints in the question; the dashed line is half the normal resistance.', {}, [up, dn]),
          answer: ans, units: 'K', tol: { rel: 0, abs: 0.006 },
          errors: [{ value: up, feedback: 'The warming sweep reads high by the lag; the cooling sweep low. Average them.' }, { value: dn, feedback: 'The cooling sweep reads low by the lag. Average the two sweeps.' }].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: ['The lag shifts the two sweeps by the same amount in opposite directions.'],
          teach: 'Opposite sweeps at the same rate cancel a lag in their mean.',
          explain: t`$T_c = (${up} + ${dn})/2 = ${ans.toFixed(2)}$ K, and the lag is $(${up} - ${dn})/2 = ${((up - dn) / 2).toFixed(2)}$ K.`,
        };
      },
    }),
    num({
      id: 'floor', difficulty: 2,
      gen(r) {
        const emf = r.float(2, 12, 0.1), I = r.pick([10, 50, 100, 200]);
        const ans = emf / (I * 1e-3);
        return {
          prompt: t`Below $T_c$, a thermal EMF of $${emf}\ \mu\text{V}$ sits in the voltage leads, and the current is ${I} mA in one direction only. What resistance does the measurement report, in μΩ?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [80, 100], y: [-0.05, 1.15], xlabel: 'T (K)', ylabel: 'R (scaled)', axesAt: 'edge', curves: [{ fn: '0.06 + 0.94/(1 + exp(-(x - 92)/0.35))', color: 'warn' }, { fn: '1/(1 + exp(-(x - 92)/0.35))', color: 'accent', dash: [5, 4] }] }, caption: 'Solid: what the leads report with the EMF; dashed: the true resistance (schematic).' },
          answer: ans, units: 'uohm', tol: { rel: 0.005 },
          errors: [{ value: emf * I * 1e-3, feedback: 'R = V/I: divide the voltage by the current.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The meter divides whatever voltage it sees by the current: $R = V/I$.`],
          teach: 'A current-independent EMF shows up as a false resistance V/I — larger the smaller the current.',
          explain: t`$R = ${emf}\ \mu\text{V}/${I / 1000}\ \text{A} = ${ans.toFixed(1)}\ \mu\Omega$ — not zero, though the pellet is. Reversing the current and taking half the difference removes it.`,
        };
      },
    }),
    num({
      id: 'midpoint', difficulty: 3,
      gen(r) {
        const a = r.float(0.08, 0.15, 0.001), b = r.float(0.009, 0.011, 0.0001);   // mΩ, mΩ/K
        const T1 = r.float(91.5, 92.3, 0.01), T2 = +(T1 + 0.25).toFixed(2);
        const Rn = (T) => a + b * T;
        const r1 = r.float(0.30, 0.45, 0.01), r2 = r.float(0.55, 0.72, 0.01);
        const R1 = +(r1 * Rn(T1)).toFixed(4), R2 = +(r2 * Rn(T2)).toFixed(4);
        const q1 = R1 / Rn(T1), q2 = R2 / Rn(T2);
        const ans = T1 + ((0.5 - q1) * (T2 - T1)) / (q2 - q1);
        return {
          prompt: t`The normal state above the transition fits $R_n(T) = ${a} + ${b}\,T$ mΩ (with $T$ in K). Two readings straddle the half-way point: $R = ${R1}$ mΩ at ${T1} K and $R = ${R2}$ mΩ at ${T2} K. Interpolating linearly in $R/R_n$, where is the midpoint?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [r6(T1 - 0.3), r6(T2 + 0.3)], y: [0, 1], xlabel: 'T (K)', ylabel: 'R / Rn', axesAt: 'edge', points: [{ x: T1, y: r6(q1), r: 5, color: 'accent' }, { x: T2, y: r6(q2), r: 5, color: 'accent' }], hlines: [{ y: 0.5, color: 'gold', label: 'half' }] }, caption: 'The two readings, normalized to the extrapolated normal state.' },
          answer: ans, units: 'K', tol: { rel: 0, abs: 0.006 },
          errors: [{ value: T1 + ((Rn(92) / 2 - R1) * (T2 - T1)) / (R2 - R1), feedback: 'Close: you used one normal-state value for both points. Normalize each reading by Rn at its own temperature.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Normalize: $q_1 = R_1/R_n(T_1)$, $q_2 = R_2/R_n(T_2)$.`, t`Then $T_{\text{mid}} = T_1 + (0.5 - q_1)(T_2 - T_1)/(q_2 - q_1)$.`],
          teach: 'The midpoint is where R reaches half the normal-state resistance extrapolated to the same temperature.',
          explain: t`$R_n(T_1) = ${Rn(T1).toFixed(4)}$, $R_n(T_2) = ${Rn(T2).toFixed(4)}$ mΩ, so $q_1 = ${q1.toFixed(4)}$, $q_2 = ${q2.toFixed(4)}$ and $T_{\text{mid}} = ${ans.toFixed(3)}$ K.`,
        };
      },
    }),
    num({
      id: 'ln2-altitude', difficulty: 3,
      gen(r) {
        const [place, p] = r.pick([['Logan, Utah (about 1400 m)', 86.0], ['Denver (about 1600 m)', 83.5], ['a sea-level lab', 101.3], ['Mexico City (about 2240 m)', 77.5]]);
        const ans = nBoil(p);
        return {
          prompt: t`You check the temperature sensor by dipping it in liquid nitrogen, which boils at 77.36 K at 101.325 kPa. In ${place}, the air pressure is ${p} kPa. What should the sensor read? (Use $\ln(p/p_0) = -\dfrac{\Delta H}{R}\Bigl(\dfrac1T - \dfrac1{T_0}\Bigr)$ with $\Delta H = 5.57$ kJ/mol.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [70, 105], y: [74.5, 78], xlabel: 'pressure (kPa)', ylabel: 'N₂ boiling point (K)', axesAt: 'edge', curves: [{ fn: `1/(1/${TB0} - (${RG}/${HV})*ln(x/101.325))`, color: 'accent' }], vlines: [{ x: p, color: 'gold' }] }, caption: 'Liquid nitrogen’s boiling point against pressure (Clausius–Clapeyron with a constant heat of vaporization, an approximation good to a few hundredths of a kelvin here).' },
          answer: ans, units: 'K', tol: { rel: 0, abs: 0.03 },
          errors: [{ value: TB0, feedback: 'At lower pressure liquids boil at a lower temperature: correct for the local pressure.' }].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`Solve for $T$: $1/T = 1/T_0 - (R/\Delta H)\ln(p/p_0)$.`, t`$R/\Delta H = 8.314/5570 = ${tex(RG / HV, 5)}$ per K.`],
          teach: 'A fixed point is only fixed at its stated pressure: nitrogen boils over a kelvin lower in a mountain town.',
          explain: t`$1/T = 1/77.355 - ${tex(RG / HV, 5)} \times \ln(${p}/101.325)$, so $T = ${ans.toFixed(2)}$ K. Using 77.36 K uncorrected would put a ${(TB0 - ans).toFixed(1)} K error into every temperature — four times the sensor’s calibration uncertainty${p > 100 ? ' (none here, at sea level)' : ''}.`,
        };
      },
    }),
    code({
      id: 'tc-mid', difficulty: 3,
      prompt: t`A warming sweep: sensor temperature \`T\` (K) and resistance \`R\` (μΩ). Fit the normal state between 97 and 110 K with a straight line (\`np.polyfit\`), normalize \`r = R / Rn(T)\`, and find \`T_mid\`, the first crossing of $r = 0.5$ going up, by linear interpolation between the two readings that straddle it.`,
      starter: t`import numpy as np

T = np.array(${JSON.stringify(CT)})
R = np.array(${JSON.stringify(CRm)})

# your code: the normal-state line, r, and the crossing
T_mid = 0.0
print(f"midpoint = {T_mid:.3f} K")`,
      answer: t`import numpy as np

T = np.array(${JSON.stringify(CT)})
R = np.array(${JSON.stringify(CRm)})

normal = (T >= 97) & (T <= 110)
b, a = np.polyfit(T[normal], R[normal], 1)
r = R / (a + b * T)
i = np.argmax((r[:-1] < 0.5) & (r[1:] >= 0.5))      # first upward crossing between i and i+1
T_mid = T[i] + (0.5 - r[i]) * (T[i + 1] - T[i]) / (r[i + 1] - r[i])
print(f"midpoint = {T_mid:.3f} K")`,
      tests: [
        { name: t`the midpoint matches the reference analysis, $${CMID.toFixed(3)}$ K`, code: `abs(T_mid - ${CMID}) < 1e-6` },
        { name: 'it lies between two readings that straddle r = 0.5', code: `91 < T_mid < 94` },
      ],
      hints: [t`\`normal = (T >= 97) & (T <= 110)\`; \`b, a = np.polyfit(T[normal], R[normal], 1)\`; \`r = R / (a + b*T)\`.`, t`\`i = np.argmax((r[:-1] < 0.5) & (r[1:] >= 0.5))\` finds the first crossing; then interpolate between \`i\` and \`i + 1\`.`],
      teach: 'A transition temperature is an analysis choice — midpoint, onset, zero — so write it as code and say which.',
      explain: t`$T_{\text{mid}} = ${CMID.toFixed(3)}$ K on this warming sweep — about ${(CMID - TC.Tc).toFixed(1)} K above the true $T_c$ because of the lag. Onset (90 %) and zero-resistance (10 %) definitions differ by the width, about 1.5 K: always state which one you quote.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-chilldown', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([0.3, 0.5, 0.8, 1.2]), rate = r.pick([5, 10, 15, 20]);
        const ans = tau * rate;
        return {
          prompt: t`During chill-down of a rocket engine’s liquid-oxygen feed line on a test stand, the wall cools at ${rate} K/s. A thermocouple on the wall responds with a time constant of ${tau} s. By how much does it read above the wall’s true temperature during the steady part of the ramp?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 20], y: [80, 300], xlabel: 't (s)', ylabel: 'T (K)', axesAt: 'edge', curves: [{ fn: `max(90, 295 - ${rate}*x)`, color: 'accent', label: 'wall', labelAt: 4, labelDy: 14 }, { fn: `max(90, 295 - ${rate}*(x - ${tau}) - ${rate * tau}*exp(-x/${tau}))`, color: 'warn', dash: [6, 4], label: 'thermocouple', labelAt: 9, labelDy: -14 }] }, caption: 'A chill-down ramp and a lagging sensor (illustrative).' },
          answer: ans, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: rate / tau, feedback: 'The lag is τ × rate, not rate/τ.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The same first-order lag as the pellet: offset $= \tau\dot T$.`, 'Cooling: the sensor trails above the true temperature.'],
          teach: 'A sensor’s time constant times the ramp rate is its reading error during a ramp — in a cryostat or on a test stand.',
          explain: t`$${tau} \times ${rate} = ${ans.toFixed(1)}$ K too warm while the ramp lasts. Test engineers correct with the sensor’s measured time constant, or read the moment the ramp ends and the reading settles.`,
        };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 2,
      prompt: t`Below 88 K your pellet reads a steady $61\ \mu\Omega$ with 100 mA in one direction. A labmate concludes it is “not fully superconducting”. What test settles it?`,
      visual: rig('tc', { seed: 2, data: false }, t`Both sweeps: a floor where the resistance should be zero. ${SIMNOTE}`),
      choices: ['Reverse the current and take half the difference of V(+I) and V(−I): a thermal EMF cancels, a real resistance does not', 'Switch to a two-probe ohmmeter, which reads resistance directly', 'Cool further below 88 K and see if it drops', 'Average a thousand readings to reduce the noise'],
      answer: 0,
      why: {
        1: 'A two-probe reading adds the contacts’ resistance — ohms — and could never show a microohm, let alone zero.',
        2: 'An EMF does not depend on temperature in this way; the floor would stay.',
        3: 'The floor is not noise: it is a steady offset that averaging keeps.',
      },
      hints: ['How does each candidate depend on the current’s direction?', 'A thermal EMF exists with no current at all.'],
      teach: 'An offset that does not follow the current is not a resistance: reversal shows it.',
      explain: t`$61\ \mu\Omega \times 0.1$ A $= 6.1\ \mu\text{V}$, typical of thermocouple junctions in the leads. With reversal the floor in this run is $${pmT(EXr.warm.floor * 1e6, EXr.warm.sFloor * 1e6)}\ \mu\Omega$ — zero.`,
    }),
    num({
      id: 'cp-lagtime', difficulty: 2,
      gen(r) {
        const rate = r.pick([0.5, 1, 2]), up = r.float(92.4, 93.6, 0.01), gap = r.float(0.4, 1.8, 0.01);
        const dn = +(up - gap).toFixed(2);
        const ans = ((up - dn) / 2) / (rate / 60);
        return {
          prompt: t`Sweeping at ${rate} K/min, the warming midpoint is ${up} K and the cooling one ${dn} K. What is the pellet’s thermal lag, in seconds?`,
          visual: sweepPic('The two sweeps drawn at the midpoints in the question; the dashed line is half the normal resistance.', {}, [up, dn]),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (up - dn) / (rate / 60), feedback: 'Each sweep is off by τṪ; the gap between them is twice that.' }, { value: ((up - dn) / 2) / rate, feedback: 'That is in minutes.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Half the gap is $\tau\dot T$.`],
          teach: 'Half the warming–cooling gap, divided by the rate, measures the thermal lag.',
          explain: t`$\tau = ${((up - dn) / 2).toFixed(3)}\ \text{K}/${(rate / 60).toFixed(4)}\ \text{K/s} = ${ans.toFixed(0)}$ s; and $T_c = ${((up + dn) / 2).toFixed(2)}$ K.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'M. K. Wu et al., Superconductivity at 93 K in a new mixed-phase Y–Ba–Cu–O compound system at ambient pressure, Phys. Rev. Lett. 58, 908 (1987)', url: 'https://doi.org/10.1103/PhysRevLett.58.908' },
    { label: 'NIST Chemistry WebBook: nitrogen — phase-change data (normal boiling point, enthalpy of vaporization)', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=4' },
    SRC.melissinos,
    SRC.gum,
  ],
});
