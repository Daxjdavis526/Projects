// Mixtures and chemical equilibrium: the chemical potential of a gas in a
// mixture, μ = μ° + kT ln(P_i/P°); the entropy of mixing and the least work to
// separate air; Σνμ = 0 ⇒ K = e^{−ΔG°/RT}; the dissociation of steam at
// rocket-chamber temperatures, computed from NASA thermochemical polynomials,
// with pressure and temperature dependence (Le Chatelier, van 't Hoff) — and an
// honest comparison with a full multi-species equilibrium.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart } from './_count.js';
import { R, rxn, SPLIT, alphaSplit, alphaSplitExpr, lnKsplitExpr } from './_phase.js';

const t = String.raw;
const M_O2 = 0.0319988;
// Fraction of the hydrogen in steam not left as H₂O at full equilibrium (species H₂O, H₂, O₂, OH, H, O, HO₂, H₂O₂),
// computed with Cantera 3.2 from the same NASA polynomials (McBride, Gordon & Reno 1993). Pressure in bar.
const FULL = { 1: { 2500: 0.059, 3000: 0.246, 3500: 0.623, 4000: 0.931 }, 20: { 2500: 0.0216, 3000: 0.0905, 3500: 0.249, 4000: 0.502 }, 200: { 2500: 0.010, 3000: 0.042, 3500: 0.117, 4000: 0.248 } };
const TS = [2500, 3000, 3500, 4000];
const sMixExpr = '-(x*ln(x) + (1-x)*ln(1-x))';

/** α(T) for steam at given pressures (single reaction), optionally with full-equilibrium points. */
function alphaPic(Ps, { full = null, mark = null, caption } = {}) {
  const cols = ['accent', 'warn', 'violet'];
  return {
    type: 'graph',
    params: { x: [2000, 4000], y: [0, 1], aspect: 'wide', xlabel: 'temperature (K)', ylabel: 'fraction of steam dissociated', axesAt: 'edge',
      curves: Ps.map((P, i) => ({ fn: alphaSplitExpr('x', String(P)), domain: [2000, 4000], color: cols[i], label: `${P} bar`, labelAt: 3900, labelDx: -50, labelDy: -10 })),
      points: [...(full ? TS.map((T) => ({ x: T, y: FULL[full][T], r: 4.5, color: 'gold', hollow: true })) : []), ...(mark ? [{ x: mark[0], y: r4(mark[1]), r: 5, color: 'gold' }] : [])] },
    caption,
  };
}
// ln K against 1/T (van 't Hoff), from the NASA polynomials
const vantHoffPic = (caption, mark = null) => ({
  type: 'graph',
  params: { x: [0.00025, 0.0005], y: [-12, 0], aspect: 'wide', xlabel: '1/T (1/K)', ylabel: 'ln K', axesAt: 'edge', xticks: 4,
    curves: [{ fn: lnKsplitExpr('1/x'), domain: [0.00025, 0.0005], color: 'accent' }],
    ...(mark ? { vlines: [{ x: r4(1 / mark * 1e6) / 1e6, color: 'gold' }] } : {}) },
  caption: caption ?? 'ln K for H₂O ⇌ H₂ + ½O₂ against 1/T (NASA polynomials): nearly a straight line of slope −ΔH°/R, since ΔH° barely changes.',
});

const EX = { T: 3000, P: 20 };
EX.r = rxn(SPLIT, EX.T); EX.a = alphaSplit(EX.T, EX.P); EX.approx = (Math.SQRT2 * EX.r.K) ** (2 / 3) * EX.P ** (-1 / 3);

export default lesson({
  id: 'phys3700.T5.4',
  title: 'Mixtures and chemical equilibrium',
  minutes: 18, difficulty: 4,
  intro: t`In a mixture of ideal gases each species behaves as if it were alone at its own **partial pressure** $P_i$, so its chemical potential is $\mu_i = \mu_i^\circ + kT\ln(P_i/P^\circ)$, where $\mu_i^\circ$ is its value pure at the standard pressure $P^\circ = 1$ bar. A reaction such as $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$ stops shifting when trading molecules no longer lowers $G$: $\sum_i \nu_i\mu_i = 0$, with $\nu_i$ the stoichiometric numbers (products positive). Collecting the logarithms gives the **law of mass action**,

$$K = \prod_i\left(\frac{P_i}{P^\circ}\right)^{\nu_i} = e^{-\Delta G^\circ/RT}.$$

All the chemistry is in $\Delta G^\circ(T)$, which tables provide. A rocket designer needs exactly this: at chamber temperatures near 3500 K, water is no longer a stable end product — part of it falls apart, carrying away energy that would otherwise have heated the exhaust.`,
  symbols: [
    { tex: 'K', text: 'the equilibrium constant: a pure number, fixed by temperature alone (for ideal gases)' },
    { tex: 'P_i', text: 'the partial pressure of species $i$: its mole fraction times the total pressure' },
    { tex: 'P^\\circ', text: 'the standard pressure, 1 bar' },
    { tex: '\\nu_i', text: 'stoichiometric numbers: $+1$ for H₂, $+\\tfrac12$ for O₂, $-1$ for H₂O in the reaction above' },
    { tex: '\\Delta G^\\circ', text: 'the standard Gibbs energy of reaction, $\\sum\\nu_i\\mu_i^\\circ$ per mole, in J/mol, at temperature $T$' },
    { tex: 'R', text: 'the gas constant, $8.314$ J/(mol·K)' },
  ],
  why: 'Combustion equilibrium sets the temperature and composition of every rocket chamber and jet combustor; the same law governs ionization in stars (the Saha equation), and the chemical potentials here return as the Fermi and Bose gases of T7.',
  visual: {
    type: 'graph',
    title: 'Steam falling apart',
    lead: t`The fraction of pure steam that dissociates by $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$, against temperature, from $\Delta G^\circ(T)$ in NASA’s tables. Change the total pressure, and move the temperature marker to read $K$.`,
    tasks: [
      'At 2000 K under 1 bar, well under 1 % dissociates; by 3500 K, about a third.',
      'Raise the pressure to 200 bar: dissociation drops (a factor of about 2 for every factor of 8), because splitting makes more molecules (1 → 1.5) and pressure opposes that — Le Chatelier.',
      'Watch K: it climbs nearly eightfold between 2500 K and 3000 K, because ΔG° shrinks as T rises (the products have more entropy).',
    ],
    params: {
      x: [2000, 4000], y: [0, 1], aspect: 'wide', xlabel: 'temperature (K)', ylabel: 'fraction of steam dissociated', axesAt: 'edge',
      sliders: [
        { key: 'P', label: 'Total pressure $P$', min: 1, max: 300, step: 1, value: 1, logScale: true, unit: '\\text{bar}', explain: 'The pressure of the steam (a rocket chamber runs at tens to hundreds of bar).' },
        { key: 'T', label: 'Temperature marker $T$', min: 2000, max: 4000, step: 10, value: 3000, unit: '\\text{K}', explain: 'Where to read the equilibrium constant.' },
      ],
      curves: [{ fn: alphaSplitExpr('x', 'P'), domain: [2000, 4000], color: 'accent' }],
      vlines: [{ x: 'T', color: 'gold' }],
      points: [{ x: 'T', y: alphaSplitExpr('T', 'P'), r: 5, color: 'gold' }],
      readouts: [
        { label: '$K$ at $T$', expr: `e^(${lnKsplitExpr('T')})`, digits: 3 },
        { label: '$\\Delta G^\\circ$ (kJ/mol)', expr: `-8.314462618*T*(${lnKsplitExpr('T')})/1000`, digits: 4 },
        { label: 'fraction dissociated', expr: alphaSplitExpr('T', 'P'), digits: 3 },
      ],
    },
    caption: 'One reaction only, ideal gases, NASA polynomials (McBride et al. 1993). Real hot steam also forms OH, H and O, so a full equilibrium dissociates it more — see the worked example.',
  },
  example: {
    prompt: t`Steam (or a stoichiometric hydrogen–oxygen mixture, which is the same atoms) sits at $${EX.T}$ K and $${EX.P}$ bar. NASA’s data give $\Delta G^\circ = ${fmt(EX.r.dG / 1000, 4)}$ kJ/mol for $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$ at $${EX.T}$ K. What fraction of the water is dissociated, counting this reaction alone?`,
    visual: alphaPic([1, 20, 200], { full: 20, mark: [EX.T, EX.a], caption: 'Single-reaction dissociation against temperature at 1, 20 and 200 bar. Hollow gold circles: full equilibrium at 20 bar, including OH, H and O (Cantera, same NASA data).' }),
    steps: [
      { label: 'Equilibrium constant', text: t`$K = e^{-\Delta G^\circ/RT} = \exp\left(-\dfrac{${fmt(EX.r.dG, 5)}}{(8.314)(${EX.T})}\right) = ${fmt(EX.r.K, 3)}$.` },
      { label: 'Bookkeeping', text: t`Start with 1 mol of H₂O; let $\alpha$ dissociate. Then H₂O: $1 - \alpha$, H₂: $\alpha$, O₂: $\alpha/2$, total $1 + \alpha/2$ mol. Partial pressures are mole fractions times $P$.` },
      { label: 'Mass action', text: t`$K = \dfrac{(P_{\text{H}_2}/P^\circ)(P_{\text{O}_2}/P^\circ)^{1/2}}{P_{\text{H}_2\text{O}}/P^\circ} = \dfrac{\alpha\,(\alpha/2)^{1/2}}{(1-\alpha)(1+\alpha/2)^{1/2}}\left(\dfrac{P}{P^\circ}\right)^{1/2}$.` },
      { label: 'Solve', text: t`For small $\alpha$, $K \approx \alpha^{3/2}(P/P^\circ)^{1/2}/\sqrt2$, so $\alpha \approx (\sqrt2K)^{2/3}(P/P^\circ)^{-1/3} = ${fmt(EX.approx, 3)}$. Solving exactly (a cubic) gives $\alpha = ${fmt(EX.a, 3)}$: about $${fmt(100 * EX.a, 2)}\,\%$.` },
      { label: 'Honest check', text: t`A full equilibrium with the same data, including OH, H and O, leaves $${fmt(100 * FULL[20][3000], 2)}\,\%$ of the hydrogen out of water at these conditions — more, because $\text{H}_2\text{O} \rightleftharpoons \text{OH} + \tfrac12\text{H}_2$ competes. One reaction shows the physics; rocket designers run the full calculation (NASA’s CEA code does exactly this).` },
    ],
    answer: t`$K = ${fmt(EX.r.K, 3)}$; about $${fmt(100 * EX.a, 2)}\,\%$ dissociated by this reaction alone (about $${fmt(100 * FULL[20][3000], 2)}\,\%$ of the hydrogen in all forms at full equilibrium).`,
  },
  practice: [
    num({
      id: 'mixing', difficulty: 2,
      gen(r) {
        const x = r.pick([0.1, 0.21, 0.3, 0.5]), n = r.pick([1, 2]), S = -n * R * (x * Math.log(x) + (1 - x) * Math.log(1 - x));
        return {
          prompt: t`A partition separates $${fmt(n * x, 3)}$ mol of oxygen from $${fmt(n * (1 - x), 3)}$ mol of nitrogen, at the same temperature and pressure. The partition is removed and they mix. What is the entropy of mixing, $\Delta S = -nR\sum x_i\ln x_i$?`,
          answer: S, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: -S, feedback: 'Mixing raises the entropy: x ln x is negative, and the formula has a minus sign in front.' }, { value: -n * R * (x * Math.log10(x) + (1 - x) * Math.log10(1 - x)), feedback: 'Use the natural log.' }, { value: -R * (x * Math.log(x) + (1 - x) * Math.log(1 - x)), feedback: `Multiply by the total amount, ${n} mol.` }], S),
          hints: [t`Each gas expands from its own volume into the whole: $\Delta S_i = n_iR\ln(1/x_i)$.`, t`$x_{\text{O}_2} = ${x}$, $x_{\text{N}_2} = ${fmt(1 - x, 3)}$.`],
          teach: 'Mixing different ideal gases raises the entropy by −nR Σ x ln x: each gas spreads into the whole volume.',
          explain: t`$\Delta S = -(${n})(8.314)\left[${x}\ln ${x} + ${fmt(1 - x, 3)}\ln ${fmt(1 - x, 3)}\right] = ${fmt(S, 3)}$ J/K. Mixing identical gases would give zero — the Gibbs paradox, resolved by the $1/N!$ of T2.5.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 0.8], aspect: 'wide', xlabel: 'mole fraction of oxygen', ylabel: 'ΔS (mixing) / nR', axesAt: 'edge', curves: [{ fn: sMixExpr, domain: [0.0005, 0.9995], color: 'accent' }], vlines: [{ x, color: 'gold' }] }, caption: 'Entropy of mixing two ideal gases per mole, against the mole fraction: largest for an even mixture, ln 2 ≈ 0.693.' },
        };
      },
    }),
    num({
      id: 'separate-O2', difficulty: 2,
      gen(r) {
        const T = r.pick([288, 298, 310]), x = 0.2095, w = -R * T * Math.log(x) / 1000;
        return {
          prompt: t`Air is $20.95\,\%$ oxygen by mole. At $${T}$ K, how much lower is the chemical potential of oxygen in air at 1 bar than in pure oxygen at 1 bar? This is the least work, per mole, to extract oxygen from air. Give it in kJ/mol.`,
          answer: w, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: -w, feedback: 'The question asks how much lower it is: give the positive difference.' }, { value: -R * T * Math.log10(x) / 1000, feedback: 'Use the natural log.' }, { value: -8.314 * Math.log(x) / 1000, feedback: 'Multiply by T.' }], w),
          hints: [t`$\mu = \mu^\circ + RT\ln(P_i/P^\circ)$ per mole.`, t`$\Delta\mu = RT\ln(0.2095)$.`],
          teach: t`A gas at partial pressure $P_i$ has $\mu$ lower by $RT\ln(P^\circ/P_i)$: un-mixing it costs at least that much work.`,
          explain: t`$\Delta\mu = RT\ln 0.2095 = -${fmt(w, 3)}$ kJ/mol: separating a mole of oxygen from air needs at least $${fmt(w, 3)}$ kJ, about $${fmt(w / M_O2, 3)}$ kJ per kilogram.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-8, 0.5], aspect: 'wide', xlabel: 'mole fraction (partial pressure in bar, at 1 bar total)', ylabel: 'μ − μ° (kJ/mol)', axesAt: 'edge', curves: [{ fn: `${r4((R * T) / 1000)}*ln(x)`, domain: [0.02, 1], color: 'accent' }], vlines: [{ x: 0.2095, label: 'O₂ in air', color: 'gold' }] }, caption: 'The chemical potential of a gas against its mole fraction in a mixture at 1 bar: RT ln x below its pure value.' },
        };
      },
    }),
    num({
      id: 'K-from-dG', difficulty: 2,
      gen(r) {
        const T = r.pick([2500, 3000, 3500]), q = rxn(SPLIT, T);
        return {
          prompt: t`At $${T}$ K, NASA’s data give $\Delta G^\circ = ${fmt(q.dG / 1000, 4)}$ kJ/mol for $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$. What is the equilibrium constant $K$?`,
          answer: q.K, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / q.K, feedback: t`$K = e^{-\Delta G^\circ/RT}$: with $\Delta G^\circ > 0$, $K < 1$.` }, { value: Math.exp(-q.dG / (R * 1000 * T)), feedback: 'Convert kJ to J before dividing by RT.' }], q.K),
          hints: [t`$K = \exp(-\Delta G^\circ/RT)$ with $\Delta G^\circ$ in J/mol.`],
          teach: t`$K = e^{-\Delta G^\circ/RT}$: every 5.7 kJ/mol of $\Delta G^\circ$ at room temperature is a factor of ten in $K$ (at ${T} K it is ${fmt((R * T * Math.LN10) / 1000, 3)} kJ/mol).`,
          explain: t`$-\Delta G^\circ/RT = -${texNum(q.dG, 5)}/(8.314\times${T}) = ${fmt(-q.dG / (R * T), 4)}$, so $K = ${fmt(q.K, 3)}$. Positive $\Delta G^\circ$ means $K < 1$: water is favoured, but not absolutely.`,
          visual: vantHoffPic(undefined, T),
        };
      },
    }),
    num({
      id: 'alpha', difficulty: 3,
      gen(r) {
        const T = r.pick([2500, 3000]), P = r.pick([1, 10, 50, 200]), a = alphaSplit(T, P), K = rxn(SPLIT, T).K;
        return {
          prompt: t`Steam at $${T}$ K and $${P}$ bar has $K = ${fmt(K, 3)}$ for $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$. Using the small-dissociation approximation $\alpha \approx (\sqrt2K)^{2/3}(P/P^\circ)^{-1/3}$, estimate the fraction dissociated.`,
          answer: (Math.SQRT2 * K) ** (2 / 3) * P ** (-1 / 3), tol: { rel: 0.01 },
          errors: apart([{ value: (Math.SQRT2 * K) ** (2 / 3), feedback: t`Include the pressure factor $(P/P^\circ)^{-1/3}$.` }, { value: (Math.SQRT2 * K) ** (2 / 3) * P ** (1 / 3), feedback: t`Pressure suppresses dissociation: the exponent is $-1/3$.` }, { value: (K) ** (2 / 3) * P ** (-1 / 3), feedback: t`Keep the $\sqrt2$ from O₂’s partial pressure, $\alpha/2$.` }], (Math.SQRT2 * K) ** (2 / 3) * P ** (-1 / 3)),
          hints: [t`$\sqrt2K = ${fmt(Math.SQRT2 * K, 4)}$.`, t`Raise it to the $2/3$ power, then divide by $${P}^{1/3}$.`],
          teach: t`Dissociation that increases the number of molecules is suppressed by pressure: $\alpha \propto P^{-1/3}$ here.`,
          explain: t`$\alpha \approx (${fmt(Math.SQRT2 * K, 4)})^{2/3}/${P}^{1/3} = ${fmt((Math.SQRT2 * K) ** (2 / 3) * P ** (-1 / 3), 3)}$; the exact solution is $${fmt(a, 3)}$.`,
          visual: alphaPic([1, 20, 200], { caption: 'Single-reaction dissociation of steam against temperature at 1, 20 and 200 bar.' }),
        };
      },
    }),
    mcq({
      id: 'chatelier', difficulty: 2,
      prompt: t`A rocket designer raises the chamber pressure from 20 bar to 200 bar at the same temperature. What happens to the dissociation of the water in the chamber, and why?`,
      choices: [
        'It falls: dissociation turns one molecule into one and a half, and higher pressure favours fewer molecules',
        'It rises: higher pressure means more collisions to break molecules apart',
        'It is unchanged, because K depends only on temperature',
        'It falls, because higher pressure raises ΔG°',
      ],
      answer: 0,
      why: { 1: 'Collisions set the rate, not the equilibrium; and pressure pushes the other way here.', 2: 'K is unchanged, but the partial pressures enter K with the power (P/P°)^½, so the composition shifts.', 3: 'ΔG° is defined at the standard pressure: it does not depend on P.' },
      hints: ['How does the total number of molecules change when water dissociates?'],
      teach: 'Le Chatelier: an equilibrium shifts to undo an imposed change — here toward fewer molecules.',
      explain: t`With $K$ fixed, $\alpha^{3/2}(P/P^\circ)^{1/2}$ must stay constant, so $\alpha \propto P^{-1/3}$: ten times the pressure cuts dissociation by about $10^{1/3} = 2.15$. High-pressure engines lose less energy to dissociation — one reason they chase chamber pressure.`,
      visual: alphaPic([20, 200], { caption: 'Single-reaction dissociation at 20 and 200 bar.' }),
    }),
    num({
      id: 'vant-hoff', difficulty: 3,
      gen(r) {
        const T1 = 2500, T2 = r.pick([2800, 3000, 3200]), K1 = rxn(SPLIT, T1).K, dH = rxn(SPLIT, 2750).dH;
        const K2 = K1 * Math.exp((-dH / R) * (1 / T2 - 1 / T1));
        return {
          prompt: t`At $${T1}$ K, $K = ${fmt(K1, 3)}$ for steam’s dissociation. Its standard enthalpy is nearly constant, $\Delta H^\circ \approx ${fmt(dH / 1000, 3)}$ kJ/mol. Use the van ’t Hoff relation $\dfrac{d\ln K}{dT} = \dfrac{\Delta H^\circ}{RT^2}$ to estimate $K$ at $${T2}$ K.`,
          answer: K2, tol: { rel: 0.01 },
          errors: apart([{ value: K1 * Math.exp((dH / R) * (1 / T2 - 1 / T1)), feedback: 'An endothermic reaction (ΔH° > 0) is favoured by heat: K must grow.' }, { value: K1 * (T2 / T1), feedback: 'K depends exponentially on 1/T, not in proportion to T.' }], K2),
          hints: [t`Integrated: $\ln\dfrac{K_2}{K_1} = -\dfrac{\Delta H^\circ}{R}\left(\dfrac1{T_2} - \dfrac1{T_1}\right)$.`, t`$\Delta H^\circ/R = ${fmt(dH / R, 4)}$ K.`],
          teach: 'For an endothermic reaction K rises steeply with temperature: ln K falls linearly with 1/T.',
          explain: t`$\ln(K_2/K_1) = -${fmt(dH / R, 4)}\left(\tfrac1{${T2}} - \tfrac1{${T1}}\right) = ${fmt(Math.log(K2 / K1), 4)}$, so $K_2 = ${fmt(K2, 3)}$. The NASA tables give $${fmt(rxn(SPLIT, T2).K, 3)}$: the constant-$\Delta H^\circ$ estimate is good.`,
          visual: vantHoffPic(undefined, T2),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-chamber', difficulty: 4, transfer: true,
      gen(r) {
        const T = r.pick([3500, 3600]), P = r.pick([100, 200]), q = rxn(SPLIT, T), a = alphaSplit(T, P), ap = (Math.SQRT2 * q.K) ** (2 / 3) * P ** (-1 / 3);
        return {
          prompt: t`A high-pressure hydrogen–oxygen engine burns a stoichiometric mixture; its products sit near $${T}$ K and $${P}$ bar in the chamber. NASA’s data give $\Delta G^\circ = ${fmt(q.dG / 1000, 4)}$ kJ/mol for $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$ at $${T}$ K. Counting this reaction alone, what fraction of the water is dissociated? (Use the small-α formula, then check it is small.)`,
          answer: ap, tol: { rel: 0.01 },
          errors: apart([{ value: (Math.SQRT2 * q.K) ** (2 / 3), feedback: t`Include the pressure: $\alpha \approx (\sqrt2K)^{2/3}(P/P^\circ)^{-1/3}$.` }, { value: (Math.SQRT2 * q.K) ** (2 / 3) * P ** (1 / 3), feedback: t`Pressure suppresses dissociation: the exponent is $-1/3$.` }], ap),
          hints: [t`$K = e^{-\Delta G^\circ/RT}$.`, t`$\alpha \approx (\sqrt2K)^{2/3}(P/P^\circ)^{-1/3}$; the exact cubic gives a slightly smaller value.`],
          teach: 'Even at hundreds of bar, a few per cent of the water in a hot hydrogen–oxygen chamber is dissociated — energy not released as heat.',
          explain: t`$K = ${fmt(q.K, 3)}$, so $\alpha \approx ${fmt(ap, 3)}$ — small enough for the approximation (the exact cubic gives $${fmt(a, 3)}$). A full equilibrium, with OH formed too, roughly doubles the loss. The energy tied up in broken molecules is partly returned as they recombine while the gas expands and cools in the nozzle — the reason engineers distinguish “frozen” from “shifting” equilibrium nozzle flow.`,
          visual: alphaPic([P], { full: P === 200 ? 200 : null, caption: `Single-reaction dissociation against temperature at ${P} bar${P === 200 ? '; hollow circles: full equilibrium including OH, H and O (Cantera, same data)' : ''}.` }),
        };
      },
    }),
    num({
      id: 'cp-air-separation', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([290, 300]), w = (-R * T * Math.log(0.2095)) / M_O2 / 1000;
        return {
          prompt: t`A launch site makes liquid oxygen from air. Before liquefying it must separate the oxygen, which is $20.95\,\%$ of air by mole. At $${T}$ K, what is the least work to extract 1 kg of oxygen at 1 bar from air at 1 bar? (Molar mass 32.00 g/mol.)`,
          answer: w, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: (-R * T * Math.log(0.2095)) / 1000, feedback: 'That is per mole; 1 kg of oxygen is 31.25 mol.' }, { value: (-R * T * Math.log(0.7905)) / M_O2 / 1000, feedback: 'Use oxygen’s own mole fraction, 0.2095.' }], w),
          hints: [t`Least work per mole $= -RT\ln x_{\text{O}_2}$.`, t`Divide by $0.032$ kg/mol.`],
          teach: 'Un-mixing has a thermodynamic price, RT ln(1/x) per mole — small beside liquefaction’s.',
          explain: t`$W = \dfrac{(8.314)(${T})\ln(1/0.2095)}{0.032} = ${fmt(w, 3)}$ kJ/kg — about a fifth of the least work to liquefy oxygen (T4.2). Real air-separation plants use several times the minimum.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 400], aspect: 'wide', xlabel: 'mole fraction of oxygen in the feed', ylabel: 'least work (kJ per kg O₂)', axesAt: 'edge', curves: [{ fn: `-${r4((R * T) / M_O2 / 1000)}*ln(x)`, domain: [0.03, 1], color: 'accent' }], vlines: [{ x: 0.2095, label: 'air', color: 'gold' }] }, caption: 'The least work to extract a kilogram of pure oxygen from a mixture, against the oxygen mole fraction (ideal gases, constant temperature).' },
        };
      },
    }),
    mcq({
      id: 'cp-sign', difficulty: 3,
      prompt: t`At 3000 K, $\Delta G^\circ$ for $\text{H}_2\text{O} \rightleftharpoons \text{H}_2 + \tfrac12\text{O}_2$ is positive (about $+77$ kJ/mol). A student concludes: “So no water dissociates at 3000 K.” What is wrong?`,
      choices: [
        t`A positive $\Delta G^\circ$ only makes $K < 1$; at equilibrium a small but real fraction dissociates, because mixing in a little product lowers $G$`,
        'Nothing: a reaction with positive ΔG° cannot happen',
        'ΔG° is negative at 3000 K, so most of the water dissociates',
        'Dissociation happens only in a flame front, not at equilibrium',
      ],
      answer: 0,
      why: { 1: 'ΔG° compares pure products with pure reactants at 1 bar. A mixture has lower G than either, thanks to the entropy of mixing.', 2: 'At 3000 K ΔG° is still positive (+77 kJ/mol), so the products are a minority.', 3: 'The fraction computed here is an equilibrium property, present wherever the gas sits at 3000 K long enough.' },
      hints: ['Compare ΔG° (pure substances at 1 bar) with ΔG for a mixture.', t`What does $K = e^{-\Delta G^\circ/RT}$ give for $\Delta G^\circ = 77$ kJ/mol at 3000 K?`],
      teach: 'ΔG° sets K, not an all-or-nothing verdict: equilibrium always holds some of everything.',
      explain: t`$K = e^{-77\,000/(8.314\times3000)} \approx 0.045$: small, not zero. The entropy of mixing guarantees that a little product lowers $G$ below that of pure water, so equilibrium sits at a few per cent dissociated — more at low pressure.`,
      visual: alphaPic([1, 20], { caption: 'Single-reaction dissociation of steam at 1 and 20 bar: small but not zero at 3000 K.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §5.5–5.6', url: 'https://physics.weber.edu/thermal/' },
    { label: 'McBride, Gordon & Reno, NASA TM-4513 (1993): thermodynamic polynomials', url: 'https://ntrs.nasa.gov/citations/19940013151' },
    { label: 'Gordon & McBride, NASA RP-1311 (1994): the CEA chemical equilibrium program', url: 'https://ntrs.nasa.gov/citations/19950013764' },
    { label: 'NIST-JANAF Thermochemical Tables (Chase 1998)', url: 'https://janaf.nist.gov/' },
    { label: 'Cantera: an open-source suite for chemical kinetics and thermodynamics', url: 'https://cantera.org/' },
  ],
});
