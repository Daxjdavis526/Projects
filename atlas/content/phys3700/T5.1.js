// Helmholtz and Gibbs free energies: F = U − TS and G = U − TS + PV = H − TS as
// the work needed to create a system (or available from destroying one) at
// fixed T (and P); ΔG as the most non-expansion work — the hydrogen fuel cell
// and electrolysis from CODATA values; dF and dG with their natural variables;
// the Legendre transform; MOXIE on Mars from NASA polynomials.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart, thouTeX } from './_count.js';
import { R, STD, FARADAY, rxn, SPLIT_CO2 } from './_phase.js';

const t = String.raw;
const F = FARADAY;
// H₂ + ½O₂ → H₂O (liquid or gas) at 298.15 K, 1 bar
const LIQ = { dH: STD.H2Ol.H, dS: STD.H2Ol.S - STD.H2.S - 0.5 * STD.O2.S };
const GAS = { dH: STD.H2Og.H, dS: STD.H2Og.S - STD.H2.S - 0.5 * STD.O2.S };
const dG = (X, T) => X.dH - T * X.dS;
const M_H2O = 0.0180153, M_H2 = 2.01588e-3;

// the fuel cell's energy split as bars (kJ/mol), with ΔH and ΔS held at their 298 K values
function splitPic(T, caption, { ask = null } = {}) {
  const h = -LIQ.dH / 1000, g = -dG(LIQ, T) / 1000, q = h - g;
  const bar = (x, y, color) => ({ fn: String(r4(y)), from: x - 0.35, to: x + 0.35, color, alpha: 0.6 });
  const lab = (x, y, text, color) => ({ x, y: r4(y), r: 0.01, color, label: text, labelDx: -3.3 * text.length, labelDy: -10 });
  return {
    type: 'graph',
    params: { x: [0.3, 3.7], y: [0, 330], aspect: 'wide', xlabel: '', xticks: 0, ylabel: 'kJ per mol of water', axesAt: 'edge',
      shade: [bar(1, h, 'ink3'), bar(2, g, 'good'), bar(3, q, 'warn')],
      points: [lab(1, h, '−ΔH: heat if burned', 'ink2'), lab(2, g, ask === 'G' ? '−ΔG: ?' : '−ΔG: electrical work', 'good'), lab(3, q, ask === 'Q' ? 'heat: ?' : '−TΔS: heat released', 'warn')] },
    caption,
  };
}

const EX = { T: 298.15 };
EX.G = dG(LIQ, EX.T); EX.E = -EX.G / (2 * F); EX.eff = EX.G / LIQ.dH; EX.Q = -EX.T * LIQ.dS; EX.Etn = -LIQ.dH / (2 * F);

export default lesson({
  id: 'phys3700.T5.1',
  title: 'Helmholtz and Gibbs free energies',
  minutes: 15, difficulty: 3,
  intro: t`Suppose you want to **create** a system out of nothing, in an environment at temperature $T$. You must supply its energy $U$ — but the environment will hand over heat $TS$ for free as the system takes on its entropy. So the work you must supply is the **Helmholtz free energy** $F = U - TS$. In an atmosphere at pressure $P$ you must also push it aside to make room, $PV$ more, giving the **Gibbs free energy**

$$G = U - TS + PV = H - TS.$$

Run it backwards: when a system is destroyed — fuel burned, a battery discharged — the most non-expansion work you can extract at fixed $T$ and $P$ is $-\Delta G = -(\Delta H - T\Delta S)$. The rest, $T\Delta S$, must go to (or come from) the surroundings as heat. A hydrogen fuel cell is the cleanest example: no flame, no heat engine, just $\Delta G$ delivered as electricity.`,
  symbols: [
    { tex: 'G', text: 'the Gibbs free energy, in J: the work needed to create the system at fixed $T$ and $P$, beyond what the environment supplies' },
    { tex: 'U', text: 'internal energy, J' },
    { tex: 'TS', text: 'temperature times entropy: the heat the environment supplies (reversibly) while the system is made' },
    { tex: 'PV', text: 'the work of pushing the atmosphere aside to make room for volume $V$' },
    { tex: 'H = U + PV', text: 'the enthalpy (T1.5); $G = H - TS$' },
    { tex: 'F = U - TS', text: 'the Helmholtz free energy, the same idea when the volume, not the pressure, is held fixed' },
  ],
  why: 'Free energies are how chemists, battery engineers and propulsion engineers ask “how much useful work?” — and in T5.2–T5.4 they become the quantity that equilibrium minimizes.',
  visual: {
    type: 'graph',
    title: 'Where a fuel cell’s energy goes',
    lead: t`For each mole of liquid water a hydrogen fuel cell makes, $-\Delta H$ (grey) would come out as heat in a flame. At most $-\Delta G$ (green) can come out as electrical work; the remainder $-T\Delta S$ (orange) must leave as heat. Change the cell temperature.`,
    tasks: [
      'At 298 K: about 237 kJ of electrical work and 49 kJ of heat per mole — a maximum efficiency of 83 %.',
      'Warm the cell: the heat share grows (it is T times the entropy lost), the electrical share and the cell voltage fall.',
      'Read the voltage: −ΔG/(2F) for two electrons per water molecule — about 1.23 V at room temperature.',
    ],
    params: {
      x: [0.3, 3.7], y: [0, 330], aspect: 'wide', xlabel: '', xticks: 0, ylabel: 'kJ per mol of water', axesAt: 'edge',
      sliders: [{ key: 'T', label: 'Cell temperature $T$', min: 273, max: 373, step: 1, value: 298, unit: '\\text{K}', explain: 'The temperature at which the cell (and its surroundings) run.' }],
      shade: [
        { fn: String(r4(-LIQ.dH / 1000)), from: 0.65, to: 1.35, color: 'ink3', alpha: 0.6 },
        { fn: `${r4(-LIQ.dH / 1000)} + T*${r4(LIQ.dS / 1000)}`, from: 1.65, to: 2.35, color: 'good', alpha: 0.6 },
        { fn: `-T*${r4(LIQ.dS / 1000)}`, from: 2.65, to: 3.35, color: 'warn', alpha: 0.6 },
      ],
      points: [{ x: 1, y: 305, r: 0.01, color: 'ink2', label: '−ΔH', labelDx: -12, labelDy: 0 }, { x: 2, y: 305, r: 0.01, color: 'good', label: '−ΔG (work)', labelDx: -30, labelDy: 0 }, { x: 3, y: 305, r: 0.01, color: 'warn', label: '−TΔS (heat)', labelDx: -30, labelDy: 0 }],
      readouts: [
        { label: '$-\\Delta G$ (kJ/mol)', expr: `${r4(-LIQ.dH / 1000)} + T*${r4(LIQ.dS / 1000)}`, digits: 4 },
        { label: 'cell voltage (V)', expr: `(${r4(-LIQ.dH)} + T*${r4(LIQ.dS)})/(2*${r4(F)})`, digits: 4 },
        { label: 'max efficiency $\\Delta G/\\Delta H$', expr: `1 + T*${(LIQ.dS / -LIQ.dH).toPrecision(6)}`, digits: 3 },
      ],
    },
    caption: 'H₂ + ½O₂ → H₂O(liquid) at 1 bar, from CODATA values at 298.15 K; ΔH and ΔS are held at those values (they change by under 1 % over this range).',
  },
  example: {
    prompt: t`A hydrogen fuel cell makes liquid water at $25$ °C and 1 bar. From CODATA: $\Delta H = ${fmt(LIQ.dH / 1000, 5)}$ kJ/mol, and the entropies are $S_{\text{H}_2} = ${STD.H2.S}$, $S_{\text{O}_2} = ${STD.O2.S}$, $S_{\text{H}_2\text{O}(l)} = ${STD.H2Ol.S}$ J/(mol·K). Find $\Delta G$, the most electrical work per mole, the ideal cell voltage, and the heat released.`,
    visual: splitPic(EX.T, 'The energy split for one mole of water at 298 K, bars to scale.'),
    steps: [
      { label: 'Entropy change', text: t`$\Delta S = ${STD.H2Ol.S} - ${STD.H2.S} - \tfrac12(${STD.O2.S}) = ${fmt(LIQ.dS, 4)}$ J/K: one and a half moles of gas become a mole of liquid.` },
      { label: 'Gibbs energy', text: t`$\Delta G = \Delta H - T\Delta S = ${fmt(LIQ.dH / 1000, 5)} - (298.15)(${fmt(LIQ.dS / 1000, 4)}) = ${fmt(EX.G / 1000, 5)}$ kJ/mol. At most $${fmt(-EX.G / 1000, 4)}$ kJ of electrical work per mole.` },
      { label: 'Voltage', text: t`Each water molecule moves two electrons through the circuit, so $\mathcal{E} = -\Delta G/(2F) = ${thouTeX(Math.round(-EX.G))}/(2\times96\,485) = ${fmt(EX.E, 4)}$ V, with $F = eN_A$ the Faraday constant.` },
      { label: 'Heat', text: t`The remaining $-T\Delta S = ${fmt(EX.Q / 1000, 3)}$ kJ/mol leaves as heat even in a perfect cell: the products have less entropy, and the surroundings must receive it.` },
      { label: 'Sense check', text: t`Efficiency limit $\Delta G/\Delta H = ${fmt(EX.eff, 3)}$. A heat engine burning the hydrogen would face Carnot’s limit; the fuel cell faces this one instead, because it never turns the energy into heat first. Real cells run at 0.6–0.9 V, losing more to internal resistance and electrode chemistry.` },
    ],
    answer: t`$\Delta G = ${fmt(EX.G / 1000, 5)}$ kJ/mol; ideal voltage $${fmt(EX.E, 4)}$ V; $${fmt(EX.Q / 1000, 3)}$ kJ/mol of heat released.`,
  },
  practice: [
    num({
      id: 'dG-gas', difficulty: 2,
      gen(r) {
        const T = r.pick([298.15, 400, 500, 600]), v = dG(GAS, T) / 1000;
        return {
          prompt: t`For $\text{H}_2 + \tfrac12\text{O}_2 \to \text{H}_2\text{O}$(gas), CODATA gives $\Delta H = ${fmt(GAS.dH / 1000, 5)}$ kJ/mol and $\Delta S = ${fmt(GAS.dS, 4)}$ J/K at 298 K. Treating both as constant, estimate $\Delta G$ at $${T}$ K.`,
          answer: v, units: 'kJ', tol: { rel: 0.005 },
          errors: apart([{ value: (GAS.dH + T * GAS.dS) / 1000, feedback: t`$\Delta G = \Delta H - T\Delta S$; with $\Delta S < 0$ the second term makes $\Delta G$ less negative.` }, { value: (GAS.dH - T * GAS.dS * 1000) / 1000, feedback: 'Convert ΔS to kJ/K before combining with ΔH in kJ.' }], v),
          hints: [t`$\Delta G = \Delta H - T\Delta S$; keep the units consistent (kJ).`],
          teach: t`$\Delta G = \Delta H - T\Delta S$: a reaction that lowers the entropy becomes less favourable as $T$ rises.`,
          explain: t`$\Delta G = ${fmt(GAS.dH / 1000, 5)} - (${T})(${fmt(GAS.dS / 1000, 4)}) = ${fmt(v, 4)}$ kJ/mol. (Over a few hundred kelvin the constant-ΔH, ΔS estimate is good to about a kJ.)`,
          visual: { type: 'graph', params: { x: [250, 700], y: [-245, -205], aspect: 'wide', xlabel: 'temperature (K)', ylabel: 'ΔG (kJ/mol)', axesAt: 'edge', curves: [{ fn: `${r4(GAS.dH / 1000)} - x*${r4(GAS.dS / 1000)}`, domain: [250, 700], color: 'accent' }], vlines: [{ x: T, color: 'gold' }] }, caption: 'ΔG = ΔH − TΔS for forming water vapour, with ΔH and ΔS held constant: a straight line of slope −ΔS. Gold: the temperature asked about.' },
        };
      },
    }),
    num({
      id: 'cell-voltage', difficulty: 2,
      gen(r) {
        const T = r.pick([298, 323, 343, 353]), v = -dG(LIQ, T) / (2 * F);
        return {
          prompt: t`A PEM fuel cell runs at $${T}$ K. Using $\Delta H = ${fmt(LIQ.dH / 1000, 5)}$ kJ/mol and $\Delta S = ${fmt(LIQ.dS, 4)}$ J/K for making liquid water (held constant), what is its ideal (reversible) voltage at 1 bar?`,
          answer: v, units: 'V', tol: { rel: 0.003 },
          errors: apart([{ value: -LIQ.dH / (2 * F), feedback: 'That uses ΔH: it is the thermoneutral voltage. The electrical work available is ΔG.' }, { value: -dG(LIQ, T) / F, feedback: 'Two electrons flow for every water molecule: divide by 2F.' }], v),
          hints: [t`$\Delta G = \Delta H - T\Delta S$.`, t`$\mathcal{E} = -\Delta G/(2F)$ with $F = 96\,485$ C/mol.`],
          teach: t`Ideal cell voltage $= -\Delta G/(nF)$, where $n$ is the electrons per reaction.`,
          explain: t`$\Delta G = ${fmt(dG(LIQ, T) / 1000, 5)}$ kJ/mol, so $\mathcal{E} = ${thouTeX(Math.round(-dG(LIQ, T)))}/(2\times96\,485) = ${fmt(v, 4)}$ V — slightly lower than at room temperature.`,
          visual: { type: 'graph', params: { x: [270, 380], y: [1.15, 1.26], aspect: 'wide', xlabel: 'cell temperature (K)', ylabel: 'ideal voltage (V)', axesAt: 'edge', curves: [{ fn: `(${r4(-LIQ.dH)} + x*${r4(LIQ.dS)})/(2*${r4(F)})`, domain: [270, 380], color: 'good' }], vlines: [{ x: T, color: 'gold' }] }, caption: 'The reversible voltage of a hydrogen fuel cell making liquid water, against temperature (ΔH and ΔS held constant). Gold: this cell.' },
        };
      },
    }),
    mcq({
      id: 'why-F', difficulty: 2,
      prompt: t`Why is the work needed to create a system in an environment at temperature $T$ (with nothing else exchanged) equal to $F = U - TS$ rather than $U$?`,
      choices: [
        t`The environment can supply heat $TS$ as the system takes on its entropy; only the rest must come as work`,
        t`Because $TS$ is the kinetic energy of the molecules, which is already there`,
        t`Because $F$ is always smaller than $U$ for any system`,
        t`Because the system must give its entropy $S$ to the environment`,
      ],
      answer: 0,
      why: { 1: 'TS is not a kinetic energy; it is the heat a reservoir at T delivers with entropy S.', 2: 'True when S > 0, but that is a consequence, not the reason.', 3: 'It is the other way round: the system acquires entropy, so heat flows in from the environment.' },
      hints: ['Heat Q delivered reversibly at temperature T brings entropy Q/T. How much heat brings entropy S?'],
      teach: 'F = U − TS: the environment pays the TS part as heat.',
      explain: t`A new system needs entropy $S$. A reservoir at $T$ can supply it reversibly as heat $Q = TS$, which also brings energy. The rest of $U$ — that is, $U - TS$ — must be supplied as work. Add the work $PV$ of pushing the atmosphere back and you have $G$.`,
      visual: splitPic(298.15, 'For the fuel cell run backwards (electrolysis): of the 286 kJ needed per mole, the surroundings can supply about 49 kJ as heat; the rest must come as electrical work.'),
    }),
    num({
      id: 'thermoneutral', difficulty: 2,
      gen(r) {
        const Vcell = r.pick([1.6, 1.8, 2.0]);
        const Etn = -LIQ.dH / (2 * F), heat = (Vcell - Etn) * 2 * F / 1000;
        return {
          prompt: t`An electrolyser splits liquid water at 25 °C. Its minimum voltage is $${fmt(EX.E, 4)}$ V (set by $\Delta G$); at the **thermoneutral voltage** $-\Delta H/(2F)$ it needs no heat from outside. If it runs at $${Vcell}$ V, how much heat does it release per mole of water split? ($\Delta H = ${fmt(LIQ.dH / 1000, 5)}$ kJ/mol.)`,
          answer: heat, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: (Vcell - EX.E) * 2 * F / 1000, feedback: 'Compare with the thermoneutral voltage (ΔH), not the minimum voltage (ΔG): between those two the cell absorbs heat.' }, { value: (Vcell - Etn) * F / 1000, feedback: 'Two electrons per water molecule: the electrical energy per mole is 2FV.' }], heat),
          hints: [t`Thermoneutral voltage $= ${thouTeX(Math.round(-LIQ.dH))}/(2\times96\,485) = ${fmt(Etn, 4)}$ V.`, t`Heat released per mole $= 2F(V - V_\text{tn})$.`],
          teach: 'Between 1.23 V and 1.48 V an electrolyser absorbs heat; above 1.48 V it gives heat off.',
          explain: t`Electrical energy in: $2F\times${Vcell} = ${fmt((2 * F * Vcell) / 1000, 4)}$ kJ/mol; the products need $-\Delta H = ${fmt(-LIQ.dH / 1000, 5)}$ kJ/mol. The excess, $${fmt(heat, 3)}$ kJ/mol, is released as heat.`,
          visual: { type: 'graph', params: { x: [1, 2.2], y: [0, 1], aspect: 'wide', xlabel: 'cell voltage (V)', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: r4(EX.E), label: '1.23 V: ΔG', color: 'good' }, { x: r4(Etn), label: '1.48 V: ΔH', color: 'warn' }, { x: Vcell, color: 'gold' }], shade: [{ fn: '1', from: r4(EX.E), to: r4(Etn), color: 'accent', alpha: 0.15 }, { fn: '1', from: r4(Etn), to: 2.2, color: 'warn', alpha: 0.12 }], points: [{ x: 1.3, y: 0.5, r: 0.01, color: 'accent', label: 'absorbs heat', labelDx: -10 }, { x: 1.8, y: 0.5, r: 0.01, color: 'warn', label: 'releases heat', labelDx: -10 }] }, caption: 'An electrolyser’s voltage scale at 25 °C. Gold: this cell.' },
        };
      },
    }),
    match({
      id: 'natural', difficulty: 2,
      prompt: t`Each energy has the variables in which its differential is simplest. From $dU = T\,dS - P\,dV + \mu\,dN$ you get $dH = T\,dS + V\,dP + \mu\,dN$, $dF = -S\,dT - P\,dV + \mu\,dN$ and $dG = -S\,dT + V\,dP + \mu\,dN$. Match each to its natural variables.`,
      left: ['$U$', '$H$', '$F$', '$G$'],
      right: ['S, V, N', 'S, P, N', 'T, V, N', 'T, P, N', 'T, S, N'],
      answer: [0, 1, 2, 3],
      hints: ['Read off which quantities appear as differentials (dS, dV, dT, dP, dN).'],
      teach: 'Subtracting TS swaps S for T; adding PV swaps V for P — a Legendre transform, like going from the Lagrangian to the Hamiltonian.',
      explain: t`$U(S,V,N)$, $H(S,P,N)$, $F(T,V,N)$, $G(T,P,N)$. Each of $H$, $F$, $G$ subtracts a product of conjugate variables ($-PV$ adds back as $+PV$ in $H$), trading a variable that is hard to control (entropy, volume) for one that is easy (temperature, pressure). Mechanics does the same when $H = p\dot q - L$ trades $\dot q$ for $p$.`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 3], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', points: [{ x: 1, y: 2.3, r: 6, color: 'accent', label: 'U (S, V)', labelDx: -60 }, { x: 3, y: 2.3, r: 6, color: 'teal', label: 'H (S, P)', labelDx: 10 }, { x: 1, y: 0.7, r: 6, color: 'warn', label: 'F (T, V)', labelDx: -60 }, { x: 3, y: 0.7, r: 6, color: 'good', label: 'G (T, P)', labelDx: 10 }], arrows: [{ from: [1.2, 2.3], to: [2.8, 2.3], color: 'ink3', label: '+PV', labelDx: -60, labelDy: -12 }, { from: [1, 2.1], to: [1, 0.9], color: 'ink3', label: '−TS', labelDx: 8, labelDy: -55 }, { from: [1.2, 0.7], to: [2.8, 0.7], color: 'ink3', label: '+PV', labelDx: -60, labelDy: 18 }, { from: [3, 2.1], to: [3, 0.9], color: 'ink3', label: '−TS', labelDx: 8, labelDy: -55 }] }, caption: 'The four energies, each a Legendre transform of U: adding PV trades V for P; subtracting TS trades S for T.' },
    }),
    num({
      id: 'compress-H2', difficulty: 3,
      gen(r) {
        const P2 = r.pick([350, 700]), T = r.pick([288, 300]), w = ((R * T) / M_H2) * Math.log(P2) / 1e6;
        return {
          prompt: t`At fixed temperature, $dG = V\,dP$. Find the least work (the change in $G$) to compress 1 kg of hydrogen isothermally at $${T}$ K from 1 bar to $${P2}$ bar for a fuel-cell vehicle’s tank, treating hydrogen as an ideal gas. Give it in MJ.`,
          answer: w, units: 'MJ', tol: { rel: 0.01 },
          errors: apart([{ value: (R * T * Math.log(P2)) / 1e6, feedback: 'That is per mole. One kilogram of hydrogen is 1/0.002016 = 496 mol.' }, { value: ((R * T) / M_H2) * Math.log10(P2) / 1e6, feedback: 'Use the natural log.' }], w),
          hints: [t`For an ideal gas $V = nRT/P$, so $\Delta G = \int V\,dP = nRT\ln(P_2/P_1)$.`, t`$n = 1/0.002016$ mol per kg.`],
          teach: t`Isothermal compression of an ideal gas costs at least $\Delta G = nRT\ln(P_2/P_1)$.`,
          explain: t`$\Delta G = \dfrac{(8.314)(${T})}{0.002016}\ln ${P2} = ${fmt(w, 3)}$ MJ/kg — about $${fmt((100 * w) / 120, 2)}\,\%$ of hydrogen’s 120 MJ/kg heating value. Real hydrogen at ${P2} bar is noticeably non-ideal (its volume is larger than $nRT/P$), so the true minimum is somewhat higher, and real compressors need more again.`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 10], aspect: 'wide', xlog: true, xlabel: 'final pressure (bar)', ylabel: 'least work (MJ/kg)', axesAt: 'edge', curves: [{ fn: `${r4((R * T) / M_H2 / 1e6)}*ln(10^x)`, domain: [0, 3], color: 'accent' }], vlines: [{ x: r4(Math.log10(P2)), color: 'gold' }] }, caption: 'The least isothermal compression work for hydrogen (ideal gas) against the final pressure, on a log scale: each factor of ten costs the same.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-moxie', difficulty: 3, transfer: true,
      gen(r) {
        const Tc = r.pick([800, 750, 850]), T = Tc + 273.15, g = rxn(SPLIT_CO2, T).dG, v = g / (2 * F);
        return {
          prompt: t`NASA’s MOXIE experiment on the Perseverance rover made oxygen on Mars by electrolysing carbon dioxide, $\text{CO}_2 \to \text{CO} + \tfrac12\text{O}_2$, in a solid-oxide cell at about $${Tc}$ °C. From NASA’s thermochemical data, $\Delta G = ${fmt(g / 1000, 4)}$ kJ/mol at that temperature (all gases at 1 bar). Each CO₂ takes two electrons. What is the minimum (reversible) cell voltage?`,
          answer: v, units: 'V', tol: { rel: 0.005 },
          errors: apart([{ value: g / F, feedback: 'Two electrons per CO₂: divide by 2F.' }, { value: rxn(SPLIT_CO2, 298.15).dG / (2 * F), feedback: 'Use ΔG at the cell temperature: it is much smaller than at 25 °C.' }], v),
          hints: [t`$\mathcal{E}_\text{min} = \Delta G/(2F)$.`, t`$F = 96\,485$ C/mol.`],
          teach: 'Electrolysis needs at least ΔG/(nF); running hot lowers ΔG because TΔS supplies more of the energy.',
          explain: t`$\mathcal{E} = ${thouTeX(Math.round(g))}/(2\times96\,485) = ${fmt(v, 3)}$ V. At 25 °C it would be $${fmt(rxn(SPLIT_CO2, 298.15).dG / (2 * F), 3)}$ V: running at about ${Tc} °C lets the heat $T\Delta S$ pay part of the bill. (Real partial pressures differ from 1 bar, which shifts this by a few tens of millivolts.)`,
          visual: { type: 'graph', params: { x: [250, 1300], y: [150, 270], aspect: 'wide', xlabel: 'cell temperature (K)', ylabel: 'ΔG to split CO₂ (kJ/mol)', axesAt: 'edge', curves: [{ fn: `${r4(rxn(SPLIT_CO2, 298.15).dH / 1000)} - x*${(rxn(SPLIT_CO2, 298.15).dS / 1000).toPrecision(6)}`, domain: [250, 1300], color: 'accent' }], vlines: [{ x: r4(T), color: 'gold' }] }, caption: 'The Gibbs energy needed to split CO₂ against temperature, estimated with ΔH and ΔS held at their 298 K values (the NASA-data value at MOXIE’s temperature differs by under 1 %). Gold: MOXIE’s temperature.' },
        };
      },
    }),
    num({
      id: 'cp-water', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([0.8, 0.85, 0.9]), m = (3.6e6 / (2 * F * V)) * M_H2O;
        return {
          prompt: t`Spacecraft fuel cells (on Apollo and the Space Shuttle) gave the crew drinking water as a by-product. A cell running at $${V}$ V delivers 1 kWh of electricity. How much water does it make? (Two electrons per water molecule; molar mass 18.02 g/mol.)`,
          answer: m, units: 'kg', tol: { rel: 0.01 },
          errors: apart([{ value: (3.6e6 / (2 * F * EX.E)) * M_H2O, feedback: `Use the actual cell voltage, ${V} V, not the ideal 1.23 V.` }, { value: (3.6e6 / (F * V)) * M_H2O, feedback: 'Each water molecule carries two electrons through the circuit: divide by 2F.' }], m),
          hints: [t`Charge delivered: $Q = (3.6\times10^6\ \text{J})/(${V}\ \text{V})$.`, t`Moles of water $= Q/(2F)$.`],
          teach: 'Energy = charge × voltage; charge counts the molecules made.',
          explain: t`$Q = 3.6\times10^6/${V} = ${texNum(3.6e6 / V, 3)}$ C, so $${fmt(3.6e6 / (2 * F * V), 3)}$ mol of water $= ${fmt(m, 3)}$ kg per kWh. A lower voltage (a less efficient cell) makes more water per kWh — the lost free energy leaves as heat.`,
          visual: splitPic(298.15, 'For each mole of water a perfect cell could deliver the green bar as electricity; a real cell at lower voltage delivers less and releases more heat.'),
        };
      },
    }),
    mcq({
      id: 'cp-carnot', difficulty: 3,
      prompt: t`A fuel cell at 80 °C can in principle turn about 80 % of the hydrogen’s heating value into work, while a heat engine with its hot side at 80 °C and cold side at 25 °C is limited to about 16 %. Is that a contradiction?`,
      choices: [
        'No: a fuel cell is not a heat engine — it never turns the chemical energy into heat first, so Carnot’s limit does not apply; ΔG/ΔH does',
        'Yes: the fuel cell figure must ignore some losses',
        'No, because fuel cells use electricity, which is exempt from the second law',
        'Yes, unless the fuel cell secretly runs at a much higher internal temperature',
      ],
      answer: 0,
      why: { 1: 'The 80 % already is a second-law limit (ΔG/ΔH); real cells fall below it because of other losses, not because it is wrong.', 2: 'Nothing is exempt from the second law: the cell must still reject TΔS as heat.', 3: 'The cell really runs near 80 °C; its limit comes from free energy, not temperature difference.' },
      hints: ['Where does a heat engine’s limit come from? Does a fuel cell take heat from a hot reservoir?', t`What does the second law demand of a fuel cell? Compare $-\Delta G$ and $-T\Delta S$.`],
      teach: 'Carnot limits heat-to-work conversion; free energy limits any conversion at fixed T and P.',
      explain: t`Carnot’s limit is about turning **heat** into work. A fuel cell converts chemical free energy directly; its second-law limit is $\Delta G/\Delta H$, with $-T\Delta S$ rejected as heat. Both are consequences of the same entropy bookkeeping.`,
      visual: splitPic(353, 'The fuel cell’s energy split at 353 K (80 °C), bars to scale.'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §5.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Cox, Wagman & Medvedev, CODATA Key Values for Thermodynamics (1989)', url: 'https://www.codata.info/resources/databases/key1.html' },
    { label: 'McBride, Gordon & Reno, Coefficients for Calculating Thermodynamic and Transport Properties of Individual Species, NASA TM-4513 (1993)', url: 'https://ntrs.nasa.gov/citations/19940013151' },
    { label: 'Hecht et al., Mars Oxygen ISRU Experiment (MOXIE), Space Sci. Rev. 217, 9 (2021)', url: 'https://doi.org/10.1007/s11214-020-00782-8' },
  ],
});
