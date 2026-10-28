// Free energy as a force toward equilibrium: for a system held at fixed T (and
// P) by its surroundings, ΔS_total = −ΔF/T (or −ΔG/T), so F (or G) falls to a
// minimum; energy against entropy; G = Nμ; Maxwell relations; graphite and
// diamond — direction from G, rate from kinetics.
import { lesson, mcq, num, multi } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart } from './_count.js';
import { CARBON, WATER20 } from './_phase.js';

const t = String.raw;
const C = CARBON, dV = C.Vd - C.Vg, dS = C.Sd - C.Sg;          // m³/mol, J/(mol K)
/** G(diamond) − G(graphite) at T (K) and P (Pa), volumes and entropies held at room values (J/mol). */
const dGcarb = (T, P) => C.dG - dS * (T - 298.15) + dV * (P - 1e5);
const Pstar = (T) => 1e5 + (C.dG - dS * (T - 298.15)) / -dV;    // Pa
// G of each form relative to graphite at 298 K and 1 bar, in kJ/mol, with P in GPa (expression text)
const gG = `-${C.Sg / 1000}*(T - 298.15) + ${C.Vg * 1e6}*x`;
const gD = `${C.dG / 1000} - ${C.Sd / 1000}*(T - 298.15) + ${C.Vd * 1e6}*x`;
const carbPic = (T, caption, extra = {}) => ({
  type: 'graph',
  params: { x: [0, 3], y: [r4(-C.Sg * (T - 298.15) / 1000 - 1), r4(-C.Sg * (T - 298.15) / 1000 + 17)], aspect: 'wide', xlabel: 'pressure (GPa)', ylabel: 'G relative to graphite at 1 bar (kJ/mol)', axesAt: 'edge',
    constants: { T },
    curves: [{ fn: gG, domain: [0, 3], color: 'ink2', label: 'graphite', labelAt: 2.6, labelDy: 16 }, { fn: gD, domain: [0, 3], color: 'accent', label: 'diamond', labelAt: 0.3, labelDy: -12 }], ...extra },
  caption,
});
// the free energy of a two-state paramagnet against its aligned fraction, in units of NμB, at kT = τμB
const fPara = (tau) => `1 - 2*x + ${tau}*(x*ln(x) + (1-x)*ln(1-x))`;

const EX = { P: Pstar(298.15) };
EX.depth = EX.P / (3300 * 9.8) / 1000;

export default lesson({
  id: 'phys3700.T5.2',
  title: 'Free energy as a force toward equilibrium',
  minutes: 14, difficulty: 3,
  intro: t`Hold a system at the temperature $T$ of big surroundings. When the system’s energy changes by $dU$, the surroundings’ changes by $-dU$ and their entropy by $-dU/T$. So the **total** entropy changes by $dS - dU/T = -dF/T$. The second law says the total cannot fall — so the system’s $F = U - TS$ can only fall, and equilibrium is its **minimum**. At fixed pressure as well, the same argument gives

$$\Delta S_\text{total} = -\frac{\Delta G}{T} \qquad (\text{fixed } T \text{ and } P).$$

That is why chemists ask about $G$: it is the system’s own bookkeeping of the entropy of the universe. It also shows the contest inside $G = H - TS$: at low temperature the lowest **enthalpy** wins (ice, crystals, bonds); at high temperature the highest **entropy** wins (water, gas, dissociation). Free energy is not a new force, but it behaves like a potential energy that systems roll down.`,
  symbols: [
    { tex: '\\Delta S_\\text{total}', text: 'the entropy change of system plus surroundings, J/K: never negative' },
    { tex: '\\Delta G', text: 'the change in the system’s Gibbs free energy $G = U - TS + PV$, J' },
    { tex: 'T,\\ P', text: 'the temperature and pressure imposed by the surroundings, held fixed' },
    { tex: 'F = U - TS', text: 'the Helmholtz free energy, which plays the same role when the volume is fixed instead of the pressure' },
  ],
  why: 'Every phase diagram (T5.3) and every chemical equilibrium (T5.4) is a statement that G is at its minimum — and G per particle is the chemical potential that drove diffusion in T3.3.',
  visual: {
    type: 'graph',
    title: 'Graphite or diamond?',
    lead: t`The free energy of a mole of carbon as graphite and as diamond, against pressure, at the temperature you choose. Whichever line is lower is the stable form there; nature pushes carbon toward it. Diamond is denser, so its line climbs more slowly with pressure.`,
    tasks: [
      'At 298 K find the crossing: about 1.5 GPa. Below it graphite is stable — every diamond you have seen is, strictly, on its way to becoming graphite.',
      'Raise the temperature: graphite’s larger entropy pulls its line down faster (slope −S in temperature), so the crossing moves to higher pressure.',
      'Read ΔG at 1 bar: +2.9 kJ/mol at room temperature. Small — yet diamonds do not change, as the checkpoint explains.',
    ],
    params: {
      x: [0, 6], y: [-8, 30], aspect: 'wide', xlabel: 'pressure (GPa)', ylabel: 'G relative to graphite at 298 K, 1 bar (kJ/mol)', axesAt: 'edge',
      sliders: [{ key: 'T', label: 'Temperature $T$', min: 298, max: 2000, step: 1, value: 298, unit: '\\text{K}', explain: 'The temperature at which the two forms are compared.' }],
      curves: [{ fn: gG, domain: [0, 6], color: 'ink2', label: 'graphite', labelAt: 5.3, labelDy: 16 }, { fn: gD, domain: [0, 6], color: 'accent', label: 'diamond', labelAt: 0.4, labelDy: -12 }],
      vlines: [{ x: `(${C.dG} - (${dS})*(T - 298.15))/${-dV}/1e9 + 0.0001`, label: 'crossing', color: 'gold' }],
      readouts: [
        { label: '$\\Delta G$ at 1 bar (kJ/mol)', expr: `${C.dG / 1000} - (${dS / 1000})*(T - 298.15)`, digits: 3 },
        { label: 'crossing pressure (GPa)', expr: `(${C.dG} - (${dS})*(T - 298.15))/${-dV}/1e9 + 0.0001`, digits: 3 },
      ],
    },
    caption: 'From NBS-table values at 298 K (ΔG = 2.900 kJ/mol; molar volumes 5.31 and 3.42 cm³; entropies 5.74 and 2.38 J/(mol·K)), held constant: a straight-line estimate, good near room temperature. Industrial diamond synthesis uses about 5–6 GPa and 1500–2000 K.',
  },
  example: {
    prompt: t`At 298 K and 1 bar, diamond’s Gibbs energy is $${C.dG / 1000}$ kJ/mol above graphite’s. Their molar volumes are $${C.Vg * 1e6}$ and $${C.Vd * 1e6}$ cm³. Above what pressure does diamond become the stable form at 298 K?`,
    visual: carbPic(298.15, 'G of graphite and diamond against pressure at 298 K (straight-line estimate). The crossing is the answer.'),
    steps: [
      { label: 'How G depends on P', text: t`From $dG = -S\,dT + V\,dP$, at fixed $T$: $\left(\dfrac{\partial G}{\partial P}\right)_T = V$. Each form’s line rises with slope equal to its molar volume.` },
      { label: 'The gap closes', text: t`$\Delta G(P) = \Delta G(1\ \text{bar}) + (V_d - V_g)(P - 1\ \text{bar})$, and $V_d - V_g = ${fmt(dV * 1e6, 3)}$ cm³ $= ${texNum(dV, 3)}$ m³: diamond’s line is less steep.` },
      { label: 'Solve', text: t`$\Delta G = 0$ when $P - 1\ \text{bar} = \dfrac{2900}{${texNum(-dV, 3)}} = ${texNum(EX.P - 1e5, 3)}$ Pa, so $P \approx ${fmt(EX.P / 1e9, 3)}$ GPa — about $${texNum(EX.P / 101325, 2)}$ atmospheres.` },
      { label: 'Sense check', text: t`Rock reaches $${fmt(EX.P / 1e9, 2)}$ GPa about $${fmt(EX.depth, 2)}$ km down. Natural diamonds form deeper, around 150 km, because the mantle is hot and higher temperature favours graphite, as the Explore shows.` },
    ],
    answer: t`Above about $${fmt(EX.P / 1e9, 3)}$ GPa at 298 K (treating the volumes as constant).`,
  },
  practice: [
    mcq({
      id: 'minimized', difficulty: 1,
      prompt: 'A beaker of reacting chemicals sits open on a lab bench at room temperature and pressure. Which quantity of the beaker’s contents falls to a minimum at equilibrium?',
      choices: ['The Gibbs free energy G', 'The internal energy U', 'The entropy S, which falls as products form', 'The Helmholtz free energy F'],
      answer: 0,
      why: { 1: 'Energy can rise in a spontaneous change if entropy rises more (ice melting on the bench absorbs heat).', 2: 'The system’s entropy can go either way; the total entropy rises, and at fixed T and P that is the same as G falling.', 3: 'F is minimized at fixed T and V; the open beaker has fixed P instead.' },
      hints: ['Which variables does the bench hold fixed?'],
      teach: 'Fixed T and P: G is minimized. Fixed T and V: F is.',
      explain: t`The room fixes $T$ and $P$, so $\Delta S_\text{total} = -\Delta G/T \ge 0$: $G$ falls until it can fall no further.`,
      visual: carbPic(298.15, 'An example of G deciding: carbon’s two forms at 298 K. At each pressure, the lower line is where carbon ends up — given time.'),
    }),
    {
      type: 'point', id: 'F-min', difficulty: 3,
      gen(r) {
        const tau = r.pick([1, 1.5, 2, 3]), p = 1 / (1 + Math.exp(-2 / tau));
        const Fm = 1 - 2 * p + tau * (p * Math.log(p) + (1 - p) * Math.log(1 - p));
        return {
          prompt: t`Two-state dipoles in a field are held at temperature $kT = ${tau}\,\mu B$. Their free energy, in units of $N\mu B$, is $F = (1 - 2p) - \tfrac{kT}{\mu B}\left[-p\ln p - (1-p)\ln(1-p)\right]$, where $p$ is the aligned fraction: energy favours $p = 1$, entropy $p = \tfrac12$. Drag the point to where the dipoles settle.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [r4(Fm - 0.5), 1.2], aspect: 'wide', xlabel: 'aligned fraction p', ylabel: 'F / NμB', axesAt: 'edge', curves: [{ fn: fPara(tau), domain: [0.001, 0.999], color: 'accent' }], drag: [{ key: 'p', x: 0.5, y: 0.8, snap: 0.01 }] }, caption: 'The free energy against the aligned fraction at this temperature (large N).' },
          answer: { x: r4(p), y: r4(Fm) }, tol: { x: 0.03, y: 0.12 },
          instruction: 'Drag the point to the minimum of F.',
          hints: ['Equilibrium at fixed temperature is the minimum of F.', t`Setting $dF/dp = 0$ gives $p/(1-p) = e^{2\mu B/kT}$ — the Boltzmann ratio.`],
          teach: 'At fixed temperature the minimum of F balances energy against entropy.',
          explain: t`$dF/dp = -2 + \tfrac{kT}{\mu B}\ln\tfrac{p}{1-p} = 0$ gives $p = 1/(1 + e^{-2\mu B/kT}) = ${fmt(p, 3)}$. Colder makes the minimum slide toward full alignment (energy wins); hotter toward $\tfrac12$ (entropy wins). It is the same answer as the paramagnet of T3.2, found the free-energy way.`,
        };
      },
    },
    num({
      id: 'boundary-slope', difficulty: 2,
      gen(r) {
        const which = r.pick(['MPa', 'GPa']), v = (dS / dV) / (which === 'MPa' ? 1e6 : 1e9) * (which === 'GPa' ? 1000 : 1);
        return {
          prompt: t`Along the graphite–diamond boundary $\Delta G = 0$, so $d(\Delta G) = -\Delta S\,dT + \Delta V\,dP = 0$. With $\Delta S = S_d - S_g = ${fmt(dS, 4)}$ J/(mol·K) and $\Delta V = ${texNum(dV, 3)}$ m³/mol, how steeply does the boundary pressure rise with temperature? Give it in ${which === 'MPa' ? 'MPa per kelvin' : 'GPa per 1000 K'}.`,
          answer: v, units: which === 'MPa' ? 'MPa' : 'GPa', tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'Both ΔS and ΔV are negative, so the slope is positive: higher temperature needs higher pressure.' }, { value: (dV / dS) * (which === 'MPa' ? 1e6 : 1e9), feedback: 'Upside down: dP/dT = ΔS/ΔV.' }], v),
          hints: [t`$dP/dT = \Delta S/\Delta V$.`],
          teach: t`A phase boundary’s slope is $\Delta S/\Delta V$ — the Clausius–Clapeyron relation, coming in T5.3.`,
          explain: t`$dP/dT = ${fmt(dS, 4)}/(${texNum(dV, 3)}) = ${texNum(dS / dV, 3)}$ Pa/K $= ${fmt(dS / dV / 1e6, 3)}$ MPa/K, or $${fmt(dS / dV / 1e6, 3)}$ GPa per 1000 K.`,
          visual: { type: 'graph', params: { x: [0, 2000], y: [0, 6], aspect: 'wide', xlabel: 'temperature (K)', ylabel: 'pressure (GPa)', axesAt: 'edge', curves: [{ fn: `(${C.dG} - (${dS})*(x - 298.15))/${-dV}/1e9`, domain: [0, 2000], color: 'gold' }], points: [{ x: 300, y: 0.6, r: 0.01, color: 'ink2', label: 'graphite stable', labelDx: 0 }, { x: 300, y: 4.6, r: 0.01, color: 'accent', label: 'diamond stable', labelDx: 0 }] }, caption: 'The graphite–diamond boundary in the straight-line estimate (volumes and entropies held at room values).' },
        };
      },
    }),
    num({
      id: 'maxwell', difficulty: 3,
      gen(r) {
        const dP = r.pick([10, 20, 50]), V = 1 / WATER20.rho, s = -V * WATER20.beta * dP * 1e6;
        return {
          prompt: t`Entropy is hard to measure under pressure, but the Maxwell relation $\left(\dfrac{\partial S}{\partial P}\right)_T = -\left(\dfrac{\partial V}{\partial T}\right)_P$ trades it for thermal expansion. Water at 20 °C has density $${WATER20.rho}$ kg/m³ and expansion coefficient $\beta = \tfrac1V\left(\tfrac{\partial V}{\partial T}\right)_P = ${texNum(WATER20.beta, 4)}$ K⁻¹. By how much does the entropy of 1 kg change when it is compressed at constant temperature by $${dP}$ MPa? (Treat $V\beta$ as constant.)`,
          answer: s, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: -s, feedback: 'Water expands when heated, so squeezing it at constant T lowers its entropy: the sign is negative.' }, { value: -WATER20.beta * dP * 1e6, feedback: 'Multiply by the volume of 1 kg, about 0.001 m³.' }], s),
          hints: [t`From $dG = -S\,dT + V\,dP$: equal mixed second derivatives give $(\partial S/\partial P)_T = -(\partial V/\partial T)_P = -V\beta$.`, t`$\Delta S = -V\beta\,\Delta P$ with $V = 1/${WATER20.rho}$ m³.`],
          teach: 'Maxwell relations turn unmeasurable derivatives (of S) into measurable ones (of V).',
          explain: t`$\Delta S = -(${texNum(V, 4)})(${texNum(WATER20.beta, 4)})(${dP}\times10^6) = ${fmt(s, 3)}$ J/K. Small: liquid water barely expands, so pressure barely changes its entropy. (Between 0 and 4 °C, where water contracts on heating, the sign would flip.)`,
          visual: { type: 'graph', params: { x: [0, 6], y: [0, 4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', points: [{ x: 1.4, y: 3, r: 0.01, color: 'ink', label: '∂²G/∂T∂P', labelDx: -30 }, { x: 4.6, y: 3, r: 0.01, color: 'ink', label: '∂²G/∂P∂T', labelDx: -30 }, { x: 1.4, y: 1, r: 0.01, color: 'violet', label: '−(∂S/∂P) at fixed T', labelDx: -55 }, { x: 4.6, y: 1, r: 0.01, color: 'teal', label: '(∂V/∂T) at fixed P', labelDx: -55 }, { x: 3, y: 3, r: 0.01, color: 'gold', label: '=', labelDx: -4 }, { x: 3, y: 1, r: 0.01, color: 'gold', label: '=', labelDx: -4 }], arrows: [{ from: [1.4, 2.6], to: [1.4, 1.4], color: 'ink3' }, { from: [4.6, 2.6], to: [4.6, 1.4], color: 'ink3' }] }, caption: 'The Maxwell relation from G: mixed second derivatives are equal, and each is a first derivative of S or of V.' },
        };
      },
    }),
    multi({
      id: 'intensive', difficulty: 2,
      prompt: 'Double a system by putting an identical copy beside it. Which quantities stay the same (intensive)? Choose all that apply.',
      choices: ['Temperature T', 'Chemical potential μ', 'Pressure P', 'Gibbs free energy G', 'Entropy S', 'Volume V'],
      answer: [0, 1, 2],
      why: { 3: 'G doubles: it is extensive, G = Nμ.', 4: 'Entropy doubles: multiplicities multiply, logarithms add.', 5: 'Volume doubles.' },
      hints: ['Which quantities would you add up for the pair, and which would you read the same on both halves?'],
      teach: t`Extensive quantities scale with size; intensive ones do not. For a pure substance $G = N\mu$: μ is G per particle.`,
      explain: t`$T$, $P$ and $\mu$ are intensive; $G$, $S$, $V$ (and $U$, $N$) are extensive. Since $G$ depends on $N$ and two intensive variables, it must be proportional to $N$: $G = N\mu(T, P)$.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '3.2', lower: '0.8', from: 1, to: 4.5, color: 'accent', alpha: 0.35 }, { fn: '3.2', lower: '0.8', from: 5.5, to: 9, color: 'accent', alpha: 0.35 }], points: [{ x: 2.75, y: 2, r: 0.01, color: 'ink', label: 'T, P, μ, G, S, V', labelDx: -45 }, { x: 7.25, y: 2, r: 0.01, color: 'ink', label: 'its identical copy', labelDx: -48 }] }, caption: 'A system and an identical copy side by side. Schematic.' },
    }),
    num({
      id: 'S-total', difficulty: 2,
      gen(r) {
        const [what, g] = r.pick([['hydrogen burns with oxygen to liquid water (ΔG = −237.1 kJ per mole of water)', -237.1], ['graphite turns into diamond (ΔG = +2.90 kJ/mol) — if it could', 2.9], ['methane burns in oxygen to CO₂ and liquid water (ΔG = −817.9 kJ/mol)', -817.9]]);
        const T = 298.15, v = (-g * 1000) / T;
        return {
          prompt: t`At 298 K and 1 bar, ${what}. If one mole reacts with no work extracted (so all of $-\Delta G$ ends up as entropy), what is the total entropy change of the universe?`,
          answer: v, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: t`$\Delta S_\text{total} = -\Delta G/T$: a negative $\Delta G$ means a positive total entropy change.` }, { value: -g / T, feedback: 'Convert kJ to J.' }], v),
          hints: [t`$\Delta S_\text{total} = -\Delta G/T$ at fixed $T$ and $P$.`],
          teach: t`$\Delta S_\text{total} = -\Delta G/T$: a reaction goes forward only if it raises the universe’s entropy.`,
          explain: t`$\Delta S_\text{total} = -(${g}\times10^3)/298.15 = ${fmt(v, 3)}$ J/K. ${g > 0 ? 'Negative: the second law forbids it at this temperature and pressure.' : 'Positive and large: the reaction runs.'}`,
          visual: { type: 'graph', params: { x: [-900, 100], y: [-500, 3100], aspect: 'wide', xlabel: 'ΔG (kJ/mol)', ylabel: 'ΔS total (J/K)', axesAt: 'edge', curves: [{ fn: '-x*1000/298.15', domain: [-900, 100], color: 'accent' }], hlines: [{ y: 0, color: 'ink3' }], shade: [{ fn: '-x*1000/298.15', from: 0, to: 100, color: 'bad', alpha: 0.3 }] }, caption: 'Total entropy change against ΔG at 298 K: only reactions with ΔG < 0 raise it (red: forbidden).' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-venus', difficulty: 3, transfer: true,
      gen(r) {
        const [where, T, P] = r.pick([['on the surface of Venus (about 737 K and 9.2 MPa)', 737, 9.2e6], ['as the window of a high-power infrared laser that runs hot (about 400 K and 1 bar)', 400, 1e5], ['in a deep borehole (about 450 K and 100 MPa)', 450, 100e6]]);
        const v = dGcarb(T, P) / 1000;
        return {
          prompt: t`A diamond window or coating is used ${where}. Estimate $G_\text{diamond} - G_\text{graphite}$ there, using $\Delta G = 2.900$ kJ/mol at 298 K and 1 bar, $\Delta S = S_d - S_g = ${fmt(dS, 4)}$ J/(mol·K) and $\Delta V = ${texNum(dV, 3)}$ m³/mol, held constant.`,
          answer: v, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: (C.dG + dS * (T - 298.15) + dV * (P - 1e5)) / 1000, feedback: t`$\partial\Delta G/\partial T = -\Delta S$, and $\Delta S < 0$: heating *raises* diamond’s disadvantage.` }, { value: (C.dG - dS * (T - 298.15)) / 1000, feedback: 'Include the pressure term ΔV(P − 1 bar).' }], v),
          hints: [t`$\Delta G(T,P) = \Delta G_0 - \Delta S(T - 298) + \Delta V(P - 10^5\ \text{Pa})$.`, t`Here $-\Delta S(T - 298) = +${fmt(-dS * (T - 298.15), 4)}$ J and $\Delta V(P - 10^5) = ${fmt(dV * (P - 1e5), 4)}$ J.`],
          teach: 'G’s dependence on T and P (slopes −S and V) tells you which form is favoured anywhere.',
          explain: t`$\Delta G = 2900 + ${fmt(-dS * (T - 298.15), 4)} + (${fmt(dV * (P - 1e5), 4)}) = ${fmt(dGcarb(T, P), 4)}$ J/mol $= ${fmt(v, 3)}$ kJ/mol. Positive: graphite is still the stable form. The diamond survives only because the conversion is extremely slow — see the next question.`,
          visual: carbPic(T, `G of graphite and diamond against pressure at ${T} K (straight-line estimate). The pressure here is far to the left, near zero on this scale.`),
        };
      },
    }),
    num({
      id: 'cp-crossing', difficulty: 3,
      gen(r) {
        const T = r.pick([500, 800, 1000]), v = Pstar(T) / 1e9;
        return {
          prompt: t`Using the straight-line estimate ($\Delta G_0 = 2.900$ kJ/mol at 298 K, $\Delta S = ${fmt(dS, 4)}$ J/(mol·K), $\Delta V = ${texNum(dV, 3)}$ m³/mol), above what pressure is diamond stable at $${T}$ K?`,
          answer: v, units: 'GPa', tol: { rel: 0.01 },
          errors: apart([{ value: Pstar(298.15) / 1e9, feedback: 'That is the 298 K value. At higher temperature graphite’s extra entropy raises the crossing.' }, { value: (1e5 + (C.dG + dS * (T - 298.15)) / -dV) / 1e9, feedback: t`Sign of the entropy term: $\Delta G_0 - \Delta S(T - 298)$ with $\Delta S < 0$ grows with $T$.` }], v),
          hints: [t`Set $\Delta G_0 - \Delta S(T - 298) + \Delta V(P - 10^5) = 0$.`, t`$P = 10^5 + \dfrac{\Delta G_0 - \Delta S(T - 298)}{-\Delta V}$.`],
          teach: 'Higher temperature favours the higher-entropy form, so the boundary pressure rises.',
          explain: t`$P = \dfrac{2900 + ${fmt(-dS * (T - 298.15), 4)}}{${texNum(-dV, 3)}} \approx ${fmt(v, 3)}$ GPa.`,
          visual: carbPic(T, `G of graphite and diamond against pressure at ${T} K (straight-line estimate).`, { x: [0, 4] }),
        };
      },
    }),
    mcq({
      id: 'cp-kinetics', difficulty: 2,
      prompt: 'If graphite has the lower Gibbs energy at room conditions, why do diamonds not turn into graphite?',
      choices: [
        'G says which way a change would go, not how fast: rearranging diamond’s bonds into graphite’s needs a huge activation energy, so at room temperature the rate is negligible',
        'Diamond is harder, so it resists the change',
        'The 2.9 kJ/mol difference is too small to matter',
        'Diamonds do turn into graphite in a few years, which is why old jewellery is cloudy',
      ],
      answer: 0,
      why: { 1: 'Hardness is not what controls a phase change; graphite would be favoured however hard diamond is.', 2: 'Any ΔG < 0 drives the change eventually; small ΔG only makes the drive weak.', 3: 'Diamonds older than the Earth’s surface rocks still exist: the conversion takes far longer than the age of the universe at room temperature.' },
      hints: ['Does thermodynamics say anything about time?'],
      teach: 'Thermodynamics gives direction; kinetics gives rate. Metastable states can last forever in practice.',
      explain: 'Diamond is metastable: lowering G would require breaking and re-forming strong carbon bonds, an energy barrier of hundreds of kJ/mol per atom-scale step, so the Boltzmann factor for crossing it at room temperature is vanishingly small. Heated to about 2000 K without air, diamond does turn to graphite.',
      visual: carbPic(298.15, 'G of graphite and diamond at 298 K: diamond’s line lies above graphite’s at everyday pressures (left edge).'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §5.2–5.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Wagman et al., The NBS tables of chemical thermodynamic properties, J. Phys. Chem. Ref. Data 11, Suppl. 2 (1982)', url: 'https://srd.nist.gov/JPCRD/jpcrdS2Vol11.pdf' },
    { label: 'NIST Chemistry WebBook, water properties (IAPWS-95)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
  ],
});
