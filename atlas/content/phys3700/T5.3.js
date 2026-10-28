// Phase transformations: coexistence where the chemical potentials (G per
// molecule) of two phases are equal; μ(T) lines with slope −s; phase diagrams of
// water, CO₂, oxygen and para-hydrogen from the reference equations of state;
// the Clausius–Clapeyron relation, boiling at altitude and in propellant tanks,
// ice's backward melting line, triple and critical points.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart } from './_count.js';
import { R, SUBST, TSAT, ICE, subP, subExpr, vapExpr, meltExpr, phasePic, ccT, ccP } from './_phase.js';

const t = String.raw;
const KEYS = ['water', 'co2', 'o2', 'h2'];
const COL = { water: 'accent', co2: 'warn', o2: 'teal', h2: 'violet' };
const NAME = { water: 'water', co2: 'CO₂', o2: 'oxygen', h2: 'hydrogen' };
const L10 = Math.log10;
/** Temperature (K) at which the sublimation pressure falls to P (Pa). */
function subT(k, P) { let lo = 1, hi = SUBST[k].Tt; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (subP(k, m) < P) lo = m; else hi = m; } return lo; }
const cl = (v, lo, hi) => `max(${lo}, min(${hi}, ${v}))`;

// ─── the four-substance log–log phase diagram with a draggable state ───────
function bigDiagram() {
  const curves = [], points = [];
  KEYS.forEach((k, i) => {
    const s = SUBST[k], c = COL[k], rough = k === 'o2' || k === 'h2';
    curves.push({ fn: subExpr(k, '10^x'), domain: [r4(L10(subT(k, 10))), r4(L10(s.Tt))], color: c, width: 2, dash: rough ? true : undefined });
    curves.push({ fn: vapExpr(k, '10^x'), domain: [r4(L10(s.Tt)), r4(L10(s.Tc))], color: c, width: 2.4 });
    curves.push({ param: [`log10(${meltExpr(k, '10^t/1000000')})`, 't'], t: [r4(L10(s.Pt)), r4(L10(s.meltTop))], color: c, width: 2 });
    const cdx = { water: -44, co2: 6, o2: -20, h2: 6 }[k], cdy = { water: -8, co2: 14, o2: -10, h2: -10 }[k];
    points.push({ x: r4(L10(s.Tc)), y: r4(L10(s.Pc)), r: 4, color: c, label: NAME[k], labelDx: cdx, labelDy: cdy });
    points.push({ x: r4(L10(s.Tt)), y: r4(L10(s.Pt)), r: 3.5, color: c });
    // the phase at the dragged state, for the chosen substance
    const T = '(10^px)', lc = r4(L10(s.Pc));
    const subL = subExpr(k, cl(T, 1, s.Tt)), vapL = vapExpr(k, cl(T, s.Tt, s.Tc));
    const Tm = `(${meltExpr(k, cl('10^py/1000000', s.Pt / 1e6, s.meltTop / 1e6))})`;
    const gas = `(step(${s.Tt} - ${T})*step(${subL} - py) + step(${T} - ${s.Tt})*step(${s.Tc} - ${T})*step(${vapL} - py) + step(${T} - ${s.Tc})*step(${lc} - py))`;
    const sup = `(step(${T} - ${s.Tc})*step(py - ${lc}))`;
    const solid = `(1 - ${gas})*step(${Tm} - ${T})`;
    const liquid = `(1 - ${gas})*(1 - step(${Tm} - ${T}))*(1 - ${sup})`;
    const sel = `step(0.5 - abs(sub - ${i}))`;
    for (const [ph, cond] of [['solid', solid], ['liquid', liquid], ['gas', gas], ['supercritical fluid', sup]]) {
      const text = `${NAME[k]}: ${ph}`;
      points.push({ x: 'px', y: 'py', r: 0.01, color: 'gold', label: text, labelDx: 12, labelDy: 16, when: `${sel}*${cond}*step(2.2 - px)` });
      points.push({ x: 'px', y: 'py', r: 0.01, color: 'gold', label: text, labelDx: -12 - 6.4 * text.length, labelDy: 16, when: `${sel}*${cond}*step(px - 2.2)` });
    }
  });
  return { curves, points };
}
const BIG = bigDiagram();

// μ(T) at 1 atm for water's three phases (schematic straight lines, kJ/mol)
const muPic = (caption, mark = null) => ({
  type: 'graph',
  params: { x: [200, 450], y: [-8, 6], aspect: 'wide', xlabel: 'temperature (K)', ylabel: 'μ (kJ/mol, schematic)', axesAt: 'edge', yticks: 0,
    curves: [{ fn: '-0.041*(x - 273.15)', domain: [200, 450], color: 'teal', label: 'ice', labelAt: 215, labelDy: -10 },
      { fn: '-0.070*(x - 273.15)', domain: [200, 450], color: 'accent', label: 'liquid', labelAt: 300, labelDy: -12 },
      { fn: '-0.070*(373.12 - 273.15) - 0.189*(x - 373.12)', domain: [330, 450], color: 'warn', label: 'vapour', labelAt: 345, labelDy: -12 }],
    vlines: [{ x: 273.15, color: 'ink4' }, { x: 373.12, color: 'ink4' }, ...(mark ? [{ x: mark, color: 'gold' }] : [])] },
  caption: caption ?? 'Chemical potential of water’s three phases at 1 atm, schematically: straight lines with slopes −S (about 41, 70 and 189 J/(mol·K)). The lowest line wins; real lines curve slightly.',
});

const EX = { P: 33.7e3, L: SUBST.water.Lb, Tb: SUBST.water.Tb };
EX.T = ccT(EX.Tb, 101325, EX.L, EX.P); EX.Tnist = TSAT.water[EX.P];
const iceSlope = ICE.Lf / (ICE.Tm * (1 / ICE.rhoWater - 1 / ICE.rhoIce));    // Pa/K
// ice's melting line on linear axes (pressure in MPa)
const icePic = (caption, points = []) => ({
  type: 'graph',
  params: { x: [258, 276], y: [0, 100], aspect: 'wide', xlabel: 'temperature (K)', ylabel: 'pressure (MPa)', axesAt: 'edge',
    curves: [{ param: [meltExpr('water', 't'), 't'], t: [0.000612, 100], color: 'teal', width: 2.6 }],
    points: [{ x: 261, y: 55, r: 0.01, color: 'ink2', label: 'ice', labelDx: -6 }, { x: 272.5, y: 55, r: 0.01, color: 'ink2', label: 'liquid water', labelDx: -30 }, ...points] },
  caption,
});

export default lesson({
  id: 'phys3700.T5.3',
  title: 'Phase transformations',
  minutes: 18, difficulty: 3,
  intro: t`A pure substance at given $T$ and $P$ takes the phase with the **lowest Gibbs energy per molecule** — the lowest chemical potential $\mu$. Two phases coexist only where their $\mu$ are equal, and that condition traces lines across the pressure–temperature plane: the **phase diagram**. Lines meet at the **triple point**; the liquid–gas line stops at the **critical point**, beyond which liquid and gas are one fluid. Moving along a coexistence line keeps $d\mu$ equal in both phases. With $d\mu = -s\,dT + v\,dP$ per molecule, that gives the slope of every line, the **Clausius–Clapeyron relation**:

$$\frac{dP}{dT} = \frac{L}{T\,\Delta V}.$$

Here $L$ is the latent heat and $\Delta V$ the volume change of the transition (for the same amount of substance). It predicts why water boils at 72 °C on Everest, why a pressurized propellant tank holds its liquid warmer, and why ice — less dense than water — melts *lower* under pressure. ([PHYS 2210 M16.4](#/lesson/phys2210.M16.4) met latent heat; [T1.5](#/lesson/phys3700.T1.5) cast it as $\Delta H$.)`,
  symbols: [
    { tex: 'dP/dT', text: 'the slope of a coexistence line on the phase diagram, in Pa/K' },
    { tex: 'L', text: 'the latent heat of the transition, $T\\Delta S$ — in J/mol or J/kg' },
    { tex: 'T', text: 'the temperature on the line, in K' },
    { tex: '\\Delta V', text: 'the change in volume on crossing the line (same amount as $L$): large for boiling, small and sometimes negative for melting' },
  ],
  why: 'Boil-off, tank pressurization, cavitation in turbopumps and the storage of cryogenic propellants are all Clausius–Clapeyron problems; and the same μ-equality condition becomes chemical equilibrium in T5.4.',
  visual: {
    type: 'graph',
    title: 'Four phase diagrams on one chart',
    lead: t`The phase diagrams of water, carbon dioxide, oxygen and (para-)hydrogen on log–log axes, from the reference equations of state behind NIST’s tables. Each colour has a sublimation, a boiling and a melting line; dots mark triple points, labelled dots critical points. Choose a substance and drag the gold point: its label names the phase of lowest $\mu$ there.`,
    tasks: [
      'Put the point on the 1 atm line at room temperature: water is liquid, the other three are gas. Slide down to 20 K: hydrogen becomes liquid, oxygen solid.',
      'Choose CO₂ and stay at 1 atm: you can find solid and gas but never liquid — its triple point is above 5 bar. That is why dry ice sublimes.',
      'Go above and to the right of a critical point: the substance is a supercritical fluid, with no boiling at all.',
    ],
    params: {
      x: [0.8, 2.9], y: [1, 8], aspect: 'wide', xlog: true, ylog: true, xlabel: 'temperature (K)', ylabel: 'pressure (Pa)', axesAt: 'edge',
      choices: [{ key: 'sub', label: 'Substance', options: [[0, 'water'], [1, 'carbon dioxide'], [2, 'oxygen'], [3, 'hydrogen']], value: 0, explain: 'Whose phase the gold point reports.' }],
      curves: BIG.curves,
      hlines: [{ y: r4(L10(101325)), label: '1 atm', color: 'ink3' }],
      points: BIG.points,
      drag: [{ key: 'p', x: r4(L10(300)), y: r4(L10(101325)) }],
      readouts: [{ label: 'temperature (K)', expr: '10^px', digits: 3 }, { label: 'pressure (bar)', expr: '10^py/100000', digits: 3 }],
    },
    caption: 'Liquid–gas lines are fits to the reference equations (within 1 %); melting lines likewise (to 100 MPa; ice Ih only). Sublimation: IAPWS for ice, Span–Wagner for dry ice; dashed lines for oxygen and hydrogen are Clausius–Clapeyron estimates. Hydrogen is para-hydrogen.',
  },
  example: {
    prompt: t`On the summit of Everest the air pressure is about $33.7$ kPa. At what temperature does water boil there? Use Clausius–Clapeyron with water’s latent heat at its normal boiling point, $L = ${fmt(EX.L / 1000, 4)}$ kJ/mol at $${EX.Tb}$ K.`,
    visual: phasePic('water', { T: [250, 450], P: [3, 6], marks: { triple: 'triple point', critical: '' }, hlines: [{ y: r4(L10(101325)), label: 'sea level', color: 'ink3' }, { y: r4(L10(33.7e3)), label: 'Everest summit', color: 'gold' }], caption: 'Part of water’s phase diagram (pressure on a log scale): where the summit’s pressure meets the boiling line is the answer.' }),
    steps: [
      { label: 'Simplify', text: t`For boiling, $\Delta V \approx V_\text{gas} = RT/P$ (the liquid’s volume is a thousand times smaller). Then $\dfrac{dP}{dT} = \dfrac{LP}{RT^2}$, or $\dfrac{d\ln P}{dT} = \dfrac{L}{RT^2}$.` },
      { label: 'Integrate', text: t`With $L$ constant, $\ln\dfrac{P}{P_0} = -\dfrac{L}{R}\left(\dfrac1T - \dfrac1{T_0}\right)$, so $\dfrac1T = \dfrac1{T_0} - \dfrac{R}{L}\ln\dfrac{P}{P_0}$.` },
      { label: 'Numbers', text: t`$\dfrac1T = \dfrac{1}{373.12} - \dfrac{8.314}{${fmt(EX.L, 5)}}\ln\dfrac{33.7}{101.3} = ${texNum(1 / EX.T, 5)}$ K⁻¹, so $T = ${fmt(EX.T, 4)}$ K $= ${fmt(EX.T - 273.15, 3)}$ °C.` },
      { label: 'Check against data', text: t`The full equation of state gives $${fmt(EX.Tnist, 4)}$ K ($${fmt(EX.Tnist - 273.15, 3)}$ °C). The small gap comes from $L$ growing as the temperature falls, which the constant-$L$ integration ignores.` },
      { label: 'Consequence', text: t`Pasta cooks slowly up there: chemistry runs at the water’s temperature, not the stove’s. A pressure cooker does the reverse, raising the boiling point to about 120 °C at 2 bar.` },
    ],
    answer: t`About $${fmt(EX.T, 4)}$ K, or $${fmt(EX.T - 273.15, 3)}$ °C (data: $${fmt(EX.Tnist - 273.15, 3)}$ °C).`,
  },
  practice: [
    mcq({
      id: 'mu-slopes', difficulty: 2,
      prompt: t`At fixed pressure, each phase’s chemical potential falls as temperature rises, with slope $(\partial\mu/\partial T)_P = -s$, the entropy per molecule. Why does heating ice at 1 atm turn it to water and then to vapour, rather than the other way round?`,
      choices: ['Each successive phase has more entropy, so its μ line falls more steeply and overtakes the previous one at a higher temperature', 'The gas has the lowest energy, so it wins at high temperature', 'Heat breaks the bonds, which raises μ', 'The liquid has the largest entropy, so it wins at the highest temperatures'],
      answer: 0,
      why: { 1: 'The gas has the highest energy; it wins at high temperature because of its entropy (−TS dominates G).', 2: 'μ falls with temperature; bond-breaking costs enthalpy, which is why the gas loses at low temperature.', 3: 'The vapour has far more entropy than the liquid (L/T ≈ 109 J/(mol·K) more at 100 °C).' },
      hints: ['Compare the slopes of the three lines.'],
      teach: 'Higher-entropy phases win at higher temperature: G = H − TS.',
      explain: t`Steeper lines (more entropy) eventually dip below shallower ones. Ice → water at 273 K, water → vapour at 373 K: each crossing is a point of equal $\mu$, where the latent heat $L = T\Delta s$ is absorbed.`,
      visual: muPic(),
    }),
    num({
      id: 'ice-slope', difficulty: 2,
      gen(r) {
        const unit = r.pick(['MPa', 'atm']), v = unit === 'MPa' ? iceSlope / 1e6 : iceSlope / 101325;
        return {
          prompt: t`Ice ($\rho = ${ICE.rhoIce}$ kg/m³) melts into water ($\rho = ${ICE.rhoWater}$ kg/m³) at 273.15 K, absorbing $L = 334$ kJ/kg. What is the slope $dP/dT$ of the melting line, in ${unit === 'MPa' ? 'MPa' : 'atmospheres'} per kelvin?`,
          answer: v, units: unit === 'MPa' ? 'MPa' : 'atm', tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: t`$\Delta V = V_\text{water} - V_\text{ice}$ is negative (ice is less dense), so the slope is negative.` }, { value: (ICE.Lf / (1 / ICE.rhoWater - 1 / ICE.rhoIce)) / (unit === 'MPa' ? 1e6 : 101325), feedback: 'Divide by T as well: dP/dT = L/(TΔV).' }], v),
          hints: [t`Per kilogram, $\Delta V = 1/\rho_\text{water} - 1/\rho_\text{ice}$.`, t`$\Delta V = ${texNum(1 / ICE.rhoWater - 1 / ICE.rhoIce, 3)}$ m³/kg; $dP/dT = L/(T\Delta V)$.`],
          teach: 'Ice’s melting line slopes backward because water is denser than ice.',
          explain: t`$\dfrac{dP}{dT} = \dfrac{334\,000}{(273.15)(${texNum(1 / ICE.rhoWater - 1 / ICE.rhoIce, 3)})} = ${texNum(iceSlope, 3)}$ Pa/K, i.e. $${fmt(v, 3)}$ ${unit === 'MPa' ? 'MPa' : 'atm'}/K. Squeezing ice by ${fmt(-iceSlope / 1e6, 3)} MPa lowers its melting point by only 1 K.`,
          visual: icePic('Ice’s melting line on linear axes, from the IAPWS melting equation: it leans to the left — more pressure, lower melting point.'),
        };
      },
    }),
    num({
      id: 'tank-Tsat', difficulty: 2, transfer: true,
      gen(r) {
        const Pbar = r.pick([2, 3, 3.5, 5]), s = SUBST.o2, T = ccT(s.Tb, 101325, s.Lb, Pbar * 1e5);
        return {
          prompt: t`A rocket’s liquid-oxygen tank is pressurized to $${Pbar}$ bar. Up to what temperature can the oxygen warm before it boils? Use Clausius–Clapeyron from the normal boiling point ($${s.Tb}$ K at 1.013 bar) with $L = ${fmt(s.Lb / 1000, 4)}$ kJ/mol.`,
          answer: T, units: 'K', tol: { rel: 0.004 },
          errors: apart([{ value: ccT(s.Tb, 101325, -s.Lb, Pbar * 1e5), feedback: 'Higher pressure raises the boiling point: check the sign in 1/T = 1/T₀ − (R/L) ln(P/P₀).' }, { value: ccT(s.Tb, 101325, s.Lb * 1000, Pbar * 1e5), feedback: 'L is 6818 J/mol: keep R and L in the same units.' }], T),
          hints: [t`$\dfrac1T = \dfrac1{T_0} - \dfrac{R}{L}\ln\dfrac{P}{P_0}$.`, t`$\ln(${Pbar}/1.013) = ${fmt(Math.log((Pbar * 1e5) / 101325), 4)}$.`],
          teach: 'Pressurizing a cryogen raises its boiling point, letting the liquid warm without boiling.',
          explain: t`$T = ${fmt(T, 4)}$ K, against $${fmt(TSAT.o2[Pbar * 1e5], 5)}$ K from the full equation of state. Propellant loaded colder than this is “subcooled”: the margin keeps the turbopump inlet from cavitating.`,
          visual: phasePic('o2', { T: [50, 160], P: [2, 7.2], marks: { triple: 'triple point', critical: 'critical point' }, hlines: [{ y: r4(L10(Pbar * 1e5)), label: `${Pbar} bar`, color: 'gold' }], caption: 'Oxygen’s phase diagram (pressure on a log scale). Where the tank pressure meets the boiling line is the answer. Dashed: the solid–gas line estimated by Clausius–Clapeyron.' }),
        };
      },
    }),
    num({
      id: 'L-from-data', difficulty: 3,
      gen(r) {
        const [k, P1, P2, T1, T2] = r.pick([['water', 70e3, 101325, TSAT.water[70e3], SUBST.water.Tb], ['o2', 101325, 2e5, SUBST.o2.Tb, TSAT.o2[2e5]], ['h2', 101325, 2e5, SUBST.h2.Tb, TSAT.h2[2e5]]]);
        const L = (-R * Math.log(P2 / P1)) / (1 / T2 - 1 / T1) / 1000;
        return {
          prompt: t`${k === 'water' ? 'Water' : k === 'o2' ? 'Oxygen' : 'Para-hydrogen'} boils at $${fmt(T1, 5)}$ K under $${fmt(P1 / 1000, 4)}$ kPa and at $${fmt(T2, 5)}$ K under $${fmt(P2 / 1000, 4)}$ kPa (NIST). Estimate its molar latent heat of vaporization from these two points.`,
          answer: L, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([{ value: -L, feedback: 'L is positive: boiling absorbs heat. Check the signs of ln(P₂/P₁) and 1/T₂ − 1/T₁.' }, { value: (-R * Math.log10(P2 / P1)) / (1 / T2 - 1 / T1) / 1000, feedback: 'Use the natural log.' }], L),
          hints: [t`$\ln\dfrac{P_2}{P_1} = -\dfrac{L}{R}\left(\dfrac1{T_2} - \dfrac1{T_1}\right)$.`, t`$L = -R\ln(P_2/P_1)\Big/\left(\dfrac1{T_2} - \dfrac1{T_1}\right)$.`],
          teach: 'Two points on a vapour-pressure curve give the latent heat: the slope of ln P against 1/T is −L/R.',
          explain: t`$L = \dfrac{-(8.314)\ln(${fmt(P2 / P1, 4)})}{${texNum(1 / T2 - 1 / T1, 3)}} = ${fmt(L, 3)}$ kJ/mol — the average over this range (the tabulated value at the normal boiling point is $${fmt(SUBST[k].Lb / 1000, 4)}$ kJ/mol).`,
          visual: { type: 'graph', params: { x: [r4(1 / T2 - 0.08 * (1 / T1 - 1 / T2)), r4(1 / T1 + 0.08 * (1 / T1 - 1 / T2))], y: [r4(Math.log(P1) - 0.1), r4(Math.log(P2) + 0.1)], aspect: 'wide', xlabel: '1/T (1/K)', ylabel: 'ln(P / Pa)', axesAt: 'edge', xticks: 4, points: [{ x: r4(1 / T1), y: r4(Math.log(P1)), r: 5, color: 'gold' }, { x: r4(1 / T2), y: r4(Math.log(P2)), r: 5, color: 'gold' }], curves: [{ fn: `${r4(Math.log(P1))} + (${(Math.log(P2 / P1) / (1 / T2 - 1 / T1)).toPrecision(6)})*(x - ${(1 / T1).toPrecision(8)})`, domain: [r4(1 / T2), r4(1 / T1)], color: 'accent' }] }, caption: 'The two points on a plot of ln P against 1/T. Their slope is −L/R.' },
        };
      },
    }),
    mcq({
      id: 'dry-ice', difficulty: 2,
      prompt: 'Why does dry ice (solid CO₂) turn straight into gas at atmospheric pressure, without melting?',
      choices: ['CO₂’s triple point is at 5.2 bar: below that pressure no liquid phase is stable at any temperature', 'Dry ice is too cold to melt', 'CO₂ molecules are too light to form a liquid', 'It does melt, but the liquid boils instantly'],
      answer: 0,
      why: { 1: 'Temperature alone does not decide; at 6 bar warming dry ice would melt.', 2: 'CO₂ forms a perfectly good liquid — under pressure, as in a fire extinguisher.', 3: 'At 1 atm the liquid is never the lowest-μ phase, so it does not form at all.' },
      hints: ['Find 1 atm on CO₂’s phase diagram and move along it to higher temperature.'],
      teach: 'Below the triple-point pressure a substance can only sublimate.',
      explain: 'On CO₂’s diagram the 1 atm line passes below the triple point (216.6 K, 5.18 bar), crossing straight from solid to gas at 194.7 K. Water’s triple point is at 0.006 bar, so at 1 atm we see it melt.',
      visual: phasePic('co2', { T: [150, 330], P: [3.5, 8], marks: true, hlines: [{ y: r4(L10(101325)), label: '1 atm', color: 'gold' }], caption: 'The phase diagram of carbon dioxide (pressure on a log scale), with 1 atm marked.' }),
    }),
    num({
      id: 'h2-vapor', difficulty: 3,
      gen(r) {
        const T = r.pick([16, 17, 18, 19]), s = SUBST.h2, P = ccP(s.Tb, 101325, s.Lb, T) / 1000;
        return {
          prompt: t`Liquid para-hydrogen boils at $${s.Tb}$ K under 1 atm, with $L = ${s.Lb}$ J/mol. If a tank of it is cooled to $${T}$ K (“densified”), what is its vapour pressure, by Clausius–Clapeyron? Give it in kPa.`,
          answer: P, units: 'kPa', tol: { rel: 0.01 },
          errors: apart([{ value: ccP(s.Tb, 101325, -s.Lb, T) / 1000, feedback: 'Colder liquid has lower vapour pressure: check the sign.' }, { value: (101325 * Math.exp((-s.Lb / R) * (1 / s.Tb - 1 / T))) / 1000, feedback: t`It is $(1/T - 1/T_0)$ in the exponent, with the minus sign in front.` }], P),
          hints: [t`$P = P_0\exp\left[-\dfrac{L}{R}\left(\dfrac1T - \dfrac1{T_0}\right)\right]$.`, t`$L/R = ${fmt(s.Lb / R, 4)}$ K.`],
          teach: 'Vapour pressure falls exponentially as the liquid cools — the basis of densified, subcooled propellants.',
          explain: t`$P = 101.3\exp\left[-${fmt(s.Lb / R, 4)}\left(\tfrac1{${T}} - \tfrac1{${s.Tb}}\right)\right] = ${fmt(P, 3)}$ kPa. The liquid is also denser cold, so a tank holds more; but below 101 kPa the tank must be kept from drawing in air.`,
          visual: phasePic('h2', { T: [10, 36], P: [3, 6.5], marks: true, hlines: [{ y: r4(L10(101325)), label: '1 atm', color: 'ink3' }], vlines: [{ x: T, color: 'gold' }], caption: 'Para-hydrogen’s phase diagram (pressure on a log scale; dashed: estimated solid–gas line). Gold: the cooled liquid’s temperature.' }),
        };
      },
    }),
    mcq({
      id: 'critical', difficulty: 2,
      prompt: 'Liquid CO₂ and its vapour are sealed in a strong glass tube and slowly heated past 304 K (31 °C). What do you see?',
      choices: ['The meniscus fades and vanishes: above the critical point liquid and gas are no longer distinct', 'The liquid boils violently until it is all gas', 'The liquid freezes, because the pressure rises', 'Nothing: the liquid and vapour stay separate at any temperature'],
      answer: 0,
      why: { 1: 'In a sealed tube the pressure rises with the temperature, following the boiling line up to its end — there is no sudden boiling.', 2: 'Freezing needs lower temperature; CO₂’s melting line lies far to the left.', 3: 'Above 304 K and 7.38 MPa no surface between two phases can exist.' },
      hints: ['In a sealed tube the state rides up the liquid–gas line. Where does that line end?'],
      teach: 'The liquid–gas line ends at the critical point; beyond it there is one fluid.',
      explain: 'As the tube warms, the liquid expands and the vapour gets denser until their densities meet at the critical point (304.1 K, 7.38 MPa). The meniscus blurs (critical opalescence) and disappears: supercritical CO₂, used as a solvent and studied for power cycles.',
      visual: phasePic('co2', { T: [200, 330], P: [5, 8], marks: true, caption: 'Part of CO₂’s phase diagram (pressure on a log scale) near its critical point.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lh2-tank', difficulty: 3, transfer: true,
      gen(r) {
        const Pbar = r.pick([2, 3]), s = SUBST.h2, T = ccT(s.Tb, 101325, s.Lb, Pbar * 1e5);
        return {
          prompt: t`An upper stage’s liquid-hydrogen tank is pressurized from 1 atm to $${Pbar}$ bar before engine start. Using Clausius–Clapeyron from the normal boiling point ($${s.Tb}$ K, $L = ${s.Lb}$ J/mol), find the new boiling temperature.`,
          answer: T, units: 'K', tol: { rel: 0.004 },
          errors: apart([{ value: ccT(s.Tb, 101325, -s.Lb, Pbar * 1e5), feedback: 'Raising the pressure raises the boiling point.' }, { value: TSAT.h2[Pbar * 1e5], feedback: 'That is the tabulated value; the question asks for the Clausius–Clapeyron estimate.' }], T),
          hints: [t`$\dfrac1T = \dfrac1{T_0} - \dfrac{R}{L}\ln\dfrac{P}{P_0}$.`, t`$R/L = ${texNum(R / s.Lb, 4)}$ K⁻¹.`],
          teach: 'Clausius–Clapeyron with a constant latent heat; it drifts as the critical point nears.',
          explain: t`$T = ${fmt(T, 4)}$ K. NIST’s equation of state gives $${fmt(TSAT.h2[Pbar * 1e5], 5)}$ K: the estimate is ${fmt(T - TSAT.h2[Pbar * 1e5], 2)} K high, because hydrogen’s latent heat shrinks quickly on the way to its critical point at 33 K, which a constant $L$ ignores.`,
          visual: phasePic('h2', { T: [10, 36], P: [3, 6.5], marks: true, hlines: [{ y: r4(L10(101325)), label: '1 atm', color: 'ink3' }, { y: r4(L10(Pbar * 1e5)), label: `${Pbar} bar`, color: 'gold' }], caption: 'Para-hydrogen’s phase diagram (pressure on a log scale; dashed: estimated solid–gas line).' }),
        };
      },
    }),
    mcq({
      id: 'cp-skating', difficulty: 3,
      prompt: t`A skater’s blade presses on ice at $-10$ °C with a pressure of about 10 MPa. Is pressure melting what lets the blade glide?`,
      choices: [
        t`No: 10 MPa lowers the melting point by only about $${fmt(-10e6 / iceSlope, 2)}$ K, nowhere near 10 K; ice’s slipperiness comes from its surface layer and frictional heating`,
        'Yes: pressure always melts ice',
        'Yes: the blade’s pressure lowers the melting point by about 10 K',
        'No, because pressure raises the melting point of ice',
      ],
      answer: 0,
      why: { 1: 'Pressure lowers ice’s melting point, but only by about 0.07 K per MPa.', 2: 'That would need about 135 MPa — more than a blade delivers.', 3: 'Ice is the unusual case where pressure lowers the melting point (it is less dense than water) — but by too little.' },
      hints: [t`Use the melting-line slope, about $${fmt(iceSlope / 1e6, 3)}$ MPa/K.`, 'How far does 10 MPa move the melting temperature?'],
      teach: 'Clausius–Clapeyron gives the size of an effect, not just its sign.',
      explain: t`$\Delta T = \Delta P/(dP/dT) = 10/${fmt(-iceSlope / 1e6, 3)} \approx ${fmt(-10e6 / iceSlope, 2)}$ K. The textbook story is quantitatively wrong at $-10$ °C; the surface of ice carries a thin, mobile layer, and sliding friction melts a little more.`,
      visual: icePic('Ice’s melting line on linear axes (IAPWS). Gold: the ice under the blade, at −10 °C and 10 MPa.', [{ x: 263.15, y: 10, r: 5, color: 'gold', label: 'blade', labelDx: 8 }]),
    }),
    mcq({
      id: 'cp-mars', difficulty: 3, transfer: true,
      prompt: 'Mars’s average surface pressure is about 0.6 kPa, close to water’s triple-point pressure (0.61 kPa). What happens to ice warmed slowly at that pressure?',
      choices: [
        'It sublimes straight to vapour, or at most melts over a vanishingly narrow range: liquid water is barely stable, if at all',
        'It melts at 0 °C and boils at 100 °C, as on Earth',
        'It melts and stays liquid up to about 40 °C',
        'It cannot change phase at such low pressure',
      ],
      answer: 0,
      why: { 1: 'Those temperatures belong to 1 atm, 170 times Mars’s pressure.', 2: 'At 0.6 kPa water boils near its freezing point: the liquid range collapses to almost nothing.', 3: 'It sublimes readily — that is how Martian polar ice behaves.' },
      hints: ['Find 0.6 kPa on water’s phase diagram: is it above or below the triple point?', 'At the triple-point pressure, melting and boiling happen at the same temperature.'],
      teach: 'Near or below the triple-point pressure, a liquid phase barely exists.',
      explain: 'At the triple-point pressure the melting and boiling temperatures coincide (273.16 K); below it there is no liquid at all. Where Mars’s pressure is below 0.61 kPa (over much of the surface), ice sublimes; in the deepest basins, where it is a little higher, brief liquid is just possible. Salts dissolved in water widen the range — one reason brines matter on Mars.',
      visual: phasePic('water', { T: [230, 400], P: [1.5, 6], marks: { triple: 'triple point', critical: '' }, hlines: [{ y: r4(L10(600)), label: 'Mars, 0.6 kPa', color: 'gold' }], caption: 'Water’s phase diagram (pressure on a log scale) with Mars’s mean surface pressure marked.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §5.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook, Thermophysical Properties of Fluid Systems', url: 'https://webbook.nist.gov/chemistry/fluid/' },
    { label: 'Wagner et al., New Equations for the Sublimation Pressure and Melting Pressure of H₂O Ice Ih, J. Phys. Chem. Ref. Data 40, 043103 (2011)', url: 'https://doi.org/10.1063/1.3657937' },
    { label: 'Span & Wagner, A New Equation of State for Carbon Dioxide, J. Phys. Chem. Ref. Data 25, 1509 (1996)', url: 'https://doi.org/10.1063/1.555991' },
    { label: 'Leachman et al., Fundamental Equations of State for Parahydrogen, Normal Hydrogen and Orthohydrogen, J. Phys. Chem. Ref. Data 38, 721 (2009)', url: 'https://doi.org/10.1063/1.3160306' },
    { label: 'Schmidt & Wagner, A new form of the equation of state for pure substances and its application to oxygen, Fluid Phase Equilib. 19, 175 (1985)', url: 'https://doi.org/10.1016/0378-3812(85)85038-1' },
  ],
});
