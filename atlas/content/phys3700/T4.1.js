// Heat engines and efficiency limits by entropy bookkeeping: an engine's
// entropy is unchanged per cycle, so the entropy Q_h/T_h it takes in must be
// dumped as Q_c/T_c ≥ Q_h/T_h, giving e ≤ 1 − T_c/T_h; entropy generation and
// lost work (Gouy–Stodola); several sources and finite hot bodies; the
// Curzon–Ahlborn teaching model; the radiator-limited space power plant.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { r4, texNum, apart } from './_count.js';

const t = String.raw;
const flow = (Qh, Qc, W, labels, caption) => ({ type: 'therm-pv', params: { mode: 'flow', device: 'engine', Qh, Qc, W, labels }, caption });
// S_gen per joule of heat input (mJ/K per J) against efficiency, with the forbidden region
function genPic(Th, Tc, e, caption, { mark = true } = {}) {
  const eC = 1 - Tc / Th, f = `1000*((1-x)/${Tc} - 1/${Th})`;
  return {
    type: 'graph',
    params: { x: [0, 1], y: [r4(-1000 / Th - 0.4), r4(1000 / Tc - 1000 / Th + 0.6)], aspect: 'wide', xlabel: 'efficiency e = W/Qₕ', ylabel: 'S generated (mJ/K per J of Qₕ)', axesAt: 'edge',
      curves: [{ fn: f, domain: [0, 1], color: 'accent' }],
      shade: [{ fn: f, from: r4(eC), to: 1, color: 'bad', alpha: 0.3 }],
      hlines: [{ y: 0, color: 'ink3' }],
      points: mark ? [{ x: r4(e), y: r4(1000 * ((1 - e) / Tc - 1 / Th)), r: 5, color: 'gold' }] : [] },
    caption,
  };
}

const EX = { Th: 838, Tc: 305, P: 1000, e: 0.40 };
EX.eC = 1 - EX.Tc / EX.Th; EX.Qh = EX.P / EX.e; EX.Qc = EX.Qh - EX.P; EX.Sgen = (EX.Qc / EX.Tc - EX.Qh / EX.Th) * 1e6; EX.lost = EX.Tc * EX.Sgen / 1e6;

export default lesson({
  id: 'phys3700.T4.1',
  title: 'Heat engines and efficiency limits',
  minutes: 14, difficulty: 3,
  intro: t`An engine takes heat $Q_h$ from a hot reservoir at $T_h$, does work $W$, and rejects heat $Q_c$ to a cold one at $T_c$, returning to its starting state every cycle. [PHYS 2210 M19.3](#/lesson/phys2210.M19.3) found the Carnot limit by following an ideal gas round a cycle. Entropy bookkeeping gets it for **any** engine in two lines. The engine’s own entropy returns to its start, so the entropy $Q_h/T_h$ taken from the hot reservoir must leave again into the cold one, and the second law says the total cannot fall:

$$S_\text{gen} = \frac{Q_c}{T_c} - \frac{Q_h}{T_h} \ge 0 \quad\Longrightarrow\quad e = \frac{W}{Q_h} \le 1 - \frac{T_c}{T_h}.$$

Waste heat is not a design flaw: it is the only way to get rid of the entropy that came in with $Q_h$. Every joule-per-kelvin generated costs work: $W_\text{lost} = T_cS_\text{gen}$.`,
  symbols: [
    { tex: 'Q_h,\\ Q_c', text: 'heat taken from the hot reservoir and rejected to the cold one per cycle, in J (both counted positive)' },
    { tex: 'W', text: 'net work delivered per cycle, $W = Q_h - Q_c$, in J' },
    { tex: 'T_h,\\ T_c', text: 'the reservoir temperatures, in kelvin (never Celsius)' },
    { tex: 'S_\\text{gen}', text: 'entropy generated per cycle in the engine and reservoirs together, J/K; zero only for a reversible engine' },
    { tex: 'e', text: 'efficiency, the fraction of $Q_h$ turned into work' },
  ],
  why: 'The same bookkeeping limits refrigerators (T4.2), sets the targets for every real cycle (T4.3), and reappears as the free energies of T5 — “available work” is what survives entropy generation.',
  visual: {
    type: 'graph',
    title: 'Entropy generated against efficiency',
    lead: t`For an engine between $T_h$ and $T_c$, the line shows the entropy generated for every joule of heat taken in, as the efficiency varies. Where it dips below zero (red) the second law forbids it. Move the reservoirs and the claimed efficiency.`,
    tasks: [
      t`Find where the line crosses zero: that efficiency is $1 - T_c/T_h$, the Carnot limit.`,
      t`Raise $T_h$: the crossing moves right. Lower $T_c$: it moves right too, and the line gets steeper.`,
      t`Set the engine below the limit and read the lost-work readout: it equals $e_C - e$ per joule of heat.`,
    ],
    params: {
      x: [0, 1], y: [-2.6, 5.5], aspect: 'wide', xlabel: 'efficiency e = W/Qₕ', ylabel: 'S generated (mJ/K per J of Qₕ)', axesAt: 'edge',
      sliders: [
        { key: 'Th', label: 'Hot reservoir $T_h$', min: 400, max: 2000, step: 10, value: 800, unit: '\\text{K}', explain: 'Where the heat comes from: a flame, steam, a reactor.' },
        { key: 'Tc', label: 'Cold reservoir $T_c$', min: 200, max: 400, step: 5, value: 300, unit: '\\text{K}', explain: 'Where the waste heat goes: a river, the air, space.' },
        { key: 'e', label: 'Engine efficiency $e$', min: 0, max: 0.9, step: 0.01, value: 0.35, explain: 'The fraction of the heat the engine turns into work.' },
      ],
      curves: [{ fn: '1000*((1-x)/Tc - 1/Th)', domain: [0, 1], color: 'accent' }],
      shade: [{ fn: '1000*((1-x)/Tc - 1/Th)', from: '1 - Tc/Th', to: 1, color: 'bad', alpha: 0.3 }],
      hlines: [{ y: 0, color: 'ink3' }],
      vlines: [{ x: '1 - Tc/Th', label: 'Carnot', color: 'good' }],
      points: [{ x: 'e', y: '1000*((1-e)/Tc - 1/Th)', r: 6, color: 'gold' }],
      readouts: [
        { label: 'Carnot limit', expr: '1 - Tc/Th', digits: 3 },
        { label: '$S_\\text{gen}/Q_h$ (mJ/K per J)', expr: '1000*((1-e)/Tc - 1/Th)', digits: 3 },
        { label: 'lost work per J of $Q_h$', expr: 'Tc*((1-e)/Tc - 1/Th)', digits: 3 },
      ],
    },
    caption: 'Two fixed-temperature reservoirs and an engine that returns to its starting state each cycle. Real heat sources cool as they give up heat; that is treated in the practice.',
  },
  example: {
    prompt: t`A coal-fired station raises steam at $565$ °C ($${EX.Th}$ K) and condenses it at $32$ °C ($${EX.Tc}$ K). It delivers $${EX.P}$ MW at an overall efficiency of $${EX.e * 100}\,\%$. Find the Carnot limit, the entropy it generates each second, and the power lost to that entropy.`,
    visual: flow(EX.Qh, EX.Qc, EX.P, { Qh: `Q_h = ${EX.Qh} MW`, Qc: `Q_c = ${EX.Qc} MW`, W: `W = ${EX.P} MW`, hot: `steam, ${EX.Th} K`, cold: `river, ${EX.Tc} K`, device: 'power station' }, 'Energy flows each second, arrow widths to scale.'),
    steps: [
      { label: 'Carnot limit', text: t`$e_C = 1 - T_c/T_h = 1 - ${EX.Tc}/${EX.Th} = ${fmt(EX.eC, 3)}$.` },
      { label: 'Heat flows', text: t`$Q_h = W/e = ${EX.Qh}$ MW and $Q_c = Q_h - W = ${EX.Qc}$ MW (per second, so MW).` },
      { label: 'Entropy generated', text: t`$\dot S_\text{gen} = \dfrac{Q_c}{T_c} - \dfrac{Q_h}{T_h} = \dfrac{${EX.Qc}\times10^6}{${EX.Tc}} - \dfrac{${EX.Qh}\times10^6}{${EX.Th}} = ${texNum(EX.Sgen, 3)}$ W/K.` },
      { label: 'Lost work', text: t`$T_c\dot S_\text{gen} = ${fmt(EX.lost, 3)}$ MW — exactly $(e_C - e)Q_h = (${fmt(EX.eC, 3)} - ${EX.e})(${EX.Qh})$ MW. A reversible engine between the same reservoirs would deliver that much more.` },
      { label: 'Where it goes', text: t`The biggest single source is the boiler: heat leaves a flame near 2000 K and enters steam at well under 900 K. Crossing that temperature gap creates entropy before the turbine ever turns. The “hot reservoir” is set by how hot the steam pipes can run, not by the fire.` },
    ],
    answer: t`$e_C = ${fmt(EX.eC, 3)}$; $\dot S_\text{gen} = ${texNum(EX.Sgen, 3)}$ W/K; lost power $${fmt(EX.lost, 3)}$ MW.`,
  },
  practice: [
    num({
      id: 'S-gen', difficulty: 2,
      gen(r) {
        const Qh = r.pick([1000, 1500, 2000]), Th = r.pick([600, 800, 1000]), Tc = r.pick([300, 350]), e = r.pick([0.2, 0.25, 0.3]);
        const W = Qh * e, Qc = Qh - W, S = Qc / Tc - Qh / Th;
        return {
          prompt: t`Each cycle an engine takes $${Qh}$ J from a reservoir at $${Th}$ K, delivers $${W}$ J of work, and rejects the rest to a reservoir at $${Tc}$ K. How much entropy does each cycle generate?`,
          answer: S, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: Qc / Tc, feedback: t`Subtract the entropy the hot reservoir lost, $Q_h/T_h$.` }, { value: W / Tc - Qh / Th, feedback: t`The cold reservoir receives $Q_c = Q_h - W$, not $W$.` }, { value: Qh / Th - Qc / Tc, feedback: 'Sign: the hot reservoir loses entropy, the cold one gains it.' }], S),
          hints: [t`$Q_c = Q_h - W = ${Qc}$ J.`, t`$S_\text{gen} = Q_c/T_c - Q_h/T_h$; the engine’s own entropy is unchanged over a cycle.`],
          teach: t`Over a cycle only the reservoirs’ entropies change: $S_\text{gen} = Q_c/T_c - Q_h/T_h$.`,
          explain: t`$S_\text{gen} = ${Qc}/${Tc} - ${Qh}/${Th} = ${fmt(Qc / Tc, 4)} - ${fmt(Qh / Th, 4)} = ${fmt(S, 3)}$ J/K per cycle. Positive, so the engine is allowed — and less efficient than Carnot’s $${fmt(1 - Tc / Th, 3)}$.`,
          visual: flow(Qh, Qc, W, { Qh: `Q_h = ${Qh} J`, Qc: `Q_c = ${Qc} J`, W: `W = ${W} J`, hot: `${Th} K`, cold: `${Tc} K`, device: 'engine' }, 'One cycle’s energy flows, arrow widths to scale.'),
        };
      },
    }),
    num({
      id: 'two-sources', difficulty: 3,
      gen(r) {
        const T1 = r.pick([900, 1200]), T2 = r.pick([400, 500]), Tc = 300, Q1 = r.pick([200, 300]), Q2 = r.pick([400, 600]);
        const W = Q1 * (1 - Tc / T1) + Q2 * (1 - Tc / T2);
        return {
          prompt: t`A combined plant takes $${Q1}$ kW of heat at $${T1}$ K and another $${Q2}$ kW at $${T2}$ K (waste heat from another process), and rejects heat at $${Tc}$ K. What is the most power it could deliver?`,
          answer: W, units: 'kW', tol: { rel: 0.01 },
          errors: apart([{ value: (Q1 + Q2) * (1 - Tc / T1), feedback: 'The heat at the lower temperature can only be converted with its own, lower Carnot factor.' }, { value: (Q1 + Q2) * (1 - Tc / ((T1 + T2) / 2)), feedback: 'Do not average the temperatures: each stream’s entropy is Q/T at its own temperature.' }], W),
          hints: [t`Reversible: the rejected entropy equals the entropy taken in, $Q_c/T_c = Q_1/T_1 + Q_2/T_2$.`, t`So $W_\text{max} = Q_1(1 - T_c/T_1) + Q_2(1 - T_c/T_2)$.`],
          teach: t`Each joule of heat at temperature $T$ can yield at most $(1 - T_c/T)$ of a joule of work.`,
          explain: t`$W_\text{max} = ${Q1}(1 - ${Tc}/${T1}) + ${Q2}(1 - ${Tc}/${T2}) = ${fmt(Q1 * (1 - Tc / T1), 4)} + ${fmt(Q2 * (1 - Tc / T2), 4)} = ${fmt(W, 4)}$ kW. Heat at low temperature is worth little work: that is why “waste heat” is mostly wasted.`,
          visual: { type: 'graph', params: { x: [250, 1300], y: [0, 1], aspect: 'wide', xlabel: 'temperature of the heat (K)', ylabel: 'work per joule, 1 − T(cold)/T', axesAt: 'edge', curves: [{ fn: `1 - ${Tc}/x`, domain: [Tc, 1300], color: 'accent' }], points: [{ x: T1, y: r4(1 - Tc / T1), r: 5, color: 'warn', label: `${T1} K`, labelDx: 8, labelDy: 14 }, { x: T2, y: r4(1 - Tc / T2), r: 5, color: 'gold', label: `${T2} K`, labelDx: 8, labelDy: 14 }] }, caption: 'The Carnot factor: the most work a joule of heat at temperature T can yield, rejecting heat at 300 K.' },
        };
      },
    }),
    num({
      id: 'finite-body', difficulty: 3,
      gen(r) {
        const m = r.pick([1000, 2000, 5000]), T1 = r.pick([838, 773, 673]), T0 = 300, c = 1.5;
        const W = m * c * ((T1 - T0) - T0 * Math.log(T1 / T0)) / 1000;      // MJ
        return {
          prompt: t`A solar power tower stores heat in $${m}$ kg of molten salt at $${T1}$ K ($c = 1.5$ kJ/(kg·K)). The surroundings are at $${T0}$ K. What is the most work an engine could extract while the salt cools to $${T0}$ K? (Ignore freezing: real nitrate salt solidifies near 500 K.) Give it in MJ.`,
          answer: W, units: 'MJ', tol: { rel: 0.01 },
          errors: apart([{ value: m * c * (T1 - T0) * (1 - T0 / T1) / 1000, feedback: 'The salt cools as it gives heat, so the Carnot factor falls along the way: integrate (1 − T₀/T) c dT.' }, { value: m * c * (T1 - T0) / 1000, feedback: 'That is all the heat. Only part of it can become work.' }], W),
          hints: [t`Each bit of heat $dQ = mc\,dT$ comes out at the salt’s current temperature $T$: $dW = (1 - T_0/T)\,mc\,dT$.`, t`$W = mc\left[(T_1 - T_0) - T_0\ln(T_1/T_0)\right]$.`],
          teach: 'From a hot body that cools, the most work is ∫(1 − T₀/T) dQ — its exergy.',
          explain: t`$W = (${m})(1.5)\left[${T1 - T0} - 300\ln\tfrac{${T1}}{300}\right] = ${fmt(W, 3)}$ MJ, out of $${fmt((m * c * (T1 - T0)) / 1000, 3)}$ MJ of heat — about $${fmt((100 * W) / ((m * c * (T1 - T0)) / 1000), 2)}\,\%$.`,
          visual: { type: 'graph', params: { x: [250, 900], y: [0, 0.8], aspect: 'wide', xlabel: 'salt temperature (K)', ylabel: '1 − T₀/T', axesAt: 'edge', curves: [{ fn: `1 - ${T0}/x`, domain: [T0, 900], color: 'accent' }], shade: [{ fn: `1 - ${T0}/x`, from: T0, to: T1, color: 'gold', alpha: 0.35 }] }, caption: 'The Carnot factor as the salt cools. The shaded area, times mc, is the most work available. Constant specific heat assumed.' },
        };
      },
    }),
    num({
      id: 'curzon', difficulty: 2,
      gen(r) {
        const Th = r.pick([600, 800, 1000]), Tc = r.pick([290, 300]), v = 1 - Math.sqrt(Tc / Th);
        return {
          prompt: t`An engine that must deliver power quickly cannot run reversibly: heat must cross finite temperature differences. A teaching model (Curzon and Ahlborn, 1975) finds the efficiency at maximum power to be $1 - \sqrt{T_c/T_h}$. Evaluate it for $T_h = ${Th}$ K and $T_c = ${Tc}$ K.`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - Tc / Th, feedback: 'That is the Carnot limit, reached only at zero power.' }, { value: Math.sqrt(1 - Tc / Th), feedback: t`Take the square root of $T_c/T_h$, then subtract from 1.` }], v),
          hints: [t`$\sqrt{${Tc}/${Th}} = ${fmt(Math.sqrt(Tc / Th), 4)}$.`],
          teach: t`Going faster costs efficiency: at maximum power a simple model gives $1 - \sqrt{T_c/T_h}$, well below Carnot.`,
          explain: t`$e = 1 - \sqrt{${Tc}/${Th}} = ${fmt(v, 3)}$, against the Carnot limit $${fmt(1 - Tc / Th, 3)}$. It is a model, not a law (it assumes heat transfer in proportion to the temperature difference), but real plants often land near it.`,
          visual: { type: 'graph', params: { x: [300, 1500], y: [0, 0.85], aspect: 'wide', xlabel: 'Tₕ (K)', ylabel: 'efficiency', axesAt: 'edge', curves: [{ fn: `1 - ${Tc}/x`, domain: [Tc, 1500], color: 'good', label: 'Carnot', labelAt: 1300, labelDy: -14 }, { fn: `1 - sqrt(${Tc}/x)`, domain: [Tc, 1500], color: 'accent', label: 'max power (model)', labelAt: 1150, labelDy: 18 }], vlines: [{ x: Th, color: 'gold' }] }, caption: 'Carnot’s limit and the Curzon–Ahlborn efficiency at maximum power (a teaching model) against the hot temperature.' },
        };
      },
    }),
    mcq({
      id: 'why-reject', difficulty: 2,
      prompt: 'Why must every heat engine reject some heat to a cold reservoir, even a perfectly built one?',
      choices: [
        'The heat it takes in brings entropy, and the engine must dump that entropy somewhere to return to its starting state; heat at a lower temperature carries it away at the least cost in energy',
        'Friction always turns some work into heat',
        'Energy conservation forbids turning all the heat into work',
        'Real materials cannot survive the temperatures that 100% efficiency would need',
      ],
      answer: 0,
      why: { 1: 'Friction lowers real efficiencies further, but even a frictionless engine must reject heat.', 2: 'Turning all the heat into work would conserve energy perfectly well; it is the second law, not the first, that forbids it.', 3: t`Even at modest temperatures the limit $1 - T_c/T_h$ applies.` },
      hints: [t`Work carries no entropy. What happens to the entropy $Q_h/T_h$?`],
      teach: 'Work carries no entropy; heat does — so entropy taken in as heat must leave as heat.',
      explain: t`Over a cycle the engine’s entropy returns to its start. The $Q_h/T_h$ it took in must leave, and only heat can carry it: at least $Q_c = T_c\,Q_h/T_h$ must go out. Kelvin and Planck’s statement of the second law says exactly this.`,
      visual: flow(1000, 600, 400, { Qh: 'Q_h: brings entropy Qₕ/Tₕ', Qc: 'Q_c: must carry it away', W: 'W: carries no entropy', hot: 'hot', cold: 'cold', device: 'engine' }, 'An engine’s energy flows (widths to scale for one example). Only the heat arrows carry entropy.'),
    }),
    num({
      id: 'e-from-Sgen', difficulty: 3,
      gen(r) {
        const Th = r.pick([700, 900]), Tc = 300, Qh = r.pick([2000, 5000]), S = r.pick([0.5, 1, 1.5]);
        const e = 1 - Tc / Th - (Tc * S) / Qh;
        return {
          prompt: t`An engine between $${Th}$ K and $${Tc}$ K takes in $${Qh}$ J per cycle, and careful measurement shows it generates $${S}$ J/K of entropy per cycle. What is its efficiency?`,
          answer: e, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - Tc / Th, feedback: t`That is the Carnot limit; subtract the lost work $T_cS_\text{gen}/Q_h$.` }, { value: 1 - Tc / Th - (Th * S) / Qh, feedback: t`Lost work is the cold temperature times $S_\text{gen}$.` }], e),
          hints: [t`$W = W_\text{Carnot} - T_cS_\text{gen}$.`, t`$e = 1 - T_c/T_h - T_cS_\text{gen}/Q_h$.`],
          teach: t`Every unit of entropy generated costs $T_c$ of work: $e = e_C - T_cS_\text{gen}/Q_h$.`,
          explain: t`$e = 1 - ${Tc}/${Th} - (${Tc})(${S})/${Qh} = ${fmt(1 - Tc / Th, 4)} - ${fmt((Tc * S) / Qh, 4)} = ${fmt(e, 3)}$.`,
          visual: genPic(Th, Tc, e, 'Entropy generated per joule of heat against efficiency for these reservoirs; red is forbidden. The engine’s point is not marked.', { mark: false }),
        };
      },
    }),
    mcq({
      id: 'err-celsius', difficulty: 2, kind: 'error',
      prompt: t`A student estimates the Carnot limit for a steam turbine between 565 °C and 32 °C: “$e = 1 - 32/565 = 0.94$, so a 94 % efficient turbine is possible.” What is wrong?`,
      choices: ['The temperatures must be absolute: 1 − 305/838 = 0.64', 'Nothing: Carnot efficiency can be computed in any unit', 'The ratio is upside down: e = 1 − 565/32', 'Carnot’s formula applies only to ideal gases, not steam'],
      answer: 0,
      why: { 1: 'Ratios of temperatures mean something only from absolute zero. In Celsius 0 °C would give a “perfect” cold reservoir.', 2: 'That would be negative. The cold temperature goes on top.', 3: 'The entropy argument used nothing about the working fluid: it holds for steam, air or anything.' },
      hints: ['The derivation divided heat by temperature, Q/T. Which temperature scale makes that meaningful?'],
      teach: 'Carnot’s limit uses kelvin: entropy is Q/T with T measured from absolute zero.',
      explain: t`Convert: $565$ °C $= 838$ K and $32$ °C $= 305$ K, so $e_C = 1 - 305/838 = 0.636$. The entropy $Q/T$ only makes sense with absolute temperature.`,
      visual: { type: 'graph', params: { x: [0, 900], y: [0, 1], aspect: 'wide', xlabel: 'Tₕ (K)', ylabel: 'Carnot limit, T(cold) = 305 K', axesAt: 'edge', curves: [{ fn: '1 - 305/x', domain: [305, 900], color: 'accent' }], vlines: [{ x: 838, label: '565 °C', color: 'gold' }] }, caption: 'The Carnot limit against the hot temperature in kelvin, for a cold reservoir at 305 K.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radiator', difficulty: 4, transfer: true,
      gen(r) {
        const Th = r.pick([900, 1100, 1300]), v = 0.75 * Th;
        return {
          prompt: t`A spacecraft’s nuclear power system runs a heat engine from a reactor at $T_h = ${Th}$ K. In space it can reject heat only by radiation, so the radiator area is $A = Q_c/(\sigma T_c^4)$. Assume the engine reaches the Carnot limit. At what radiator temperature $T_c$ is the power delivered per square metre of radiator greatest?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: Th / 2, feedback: t`Write $W/A = \sigma T_c^4(T_h/T_c - 1) = \sigma T_c^3(T_h - T_c)$ and maximize that.` }, { value: 0.8 * Th, feedback: t`Differentiate $T_c^3(T_h - T_c)$: $3T_c^2T_h - 4T_c^3 = 0$.` }], v),
          hints: [t`$W = Q_c(T_h/T_c - 1)$ for a Carnot engine, and $Q_c = \sigma AT_c^4$.`, t`$W/A = \sigma T_c^3(T_h - T_c)$; set its derivative with respect to $T_c$ to zero.`],
          teach: 'In space a cold radiator is efficient but huge; the best compromise runs it at three quarters of the hot temperature.',
          explain: t`$\dfrac{d}{dT_c}\left[T_c^3(T_h - T_c)\right] = 3T_c^2T_h - 4T_c^3 = 0$ gives $T_c = \tfrac34T_h = ${fmt(v, 4)}$ K. The engine then runs at only $25\,\%$ Carnot efficiency — deliberately, because the radiator, not the fuel, is what is heavy.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 0.12], aspect: 'wide', xlabel: 'T(cold) / T(hot)', ylabel: 'power per radiator area (relative)', axesAt: 'edge', curves: [{ fn: 'x^3*(1 - x)', domain: [0, 1], color: 'accent' }] }, caption: 'Power per unit radiator area against the radiator temperature as a fraction of the hot temperature (Carnot engine, black radiator, no sunlight).' },
        };
      },
    }),
    num({
      id: 'cp-plant', difficulty: 3,
      gen(r) {
        const P = r.pick([500, 800, 1200]), e = r.pick([0.33, 0.38, 0.45]), Th = r.pick([800, 850]), Tc = 300;
        const Qh = P / e, Qc = Qh - P, S = Qc / Tc - Qh / Th;
        return {
          prompt: t`A power station delivers $${P}$ MW at $${Math.round(e * 100)}\,\%$ efficiency, taking heat at $${Th}$ K and rejecting it at $${Tc}$ K. How much entropy does it generate per second? Give it in MW/K.`,
          answer: S, units: 'MW/K', tol: { rel: 0.01 },
          errors: apart([{ value: Qc / Tc, feedback: t`Subtract the entropy drawn from the hot reservoir, $Q_h/T_h$.` }, { value: P / Tc, feedback: t`The cold reservoir receives $Q_c = Q_h - W$, not $W$.` }], S),
          hints: [t`$Q_h = P/e$ and $Q_c = Q_h - P$ (per second).`, t`$\dot S_\text{gen} = Q_c/T_c - Q_h/T_h$.`],
          teach: t`Entropy generation rate: heat out over $T_c$ minus heat in over $T_h$.`,
          explain: t`$Q_h = ${fmt(Qh, 4)}$ MW, $Q_c = ${fmt(Qc, 4)}$ MW: $\dot S_\text{gen} = ${fmt(Qc / Tc, 4)} - ${fmt(Qh / Th, 4)} = ${fmt(S, 3)}$ MW/K, costing $T_c\dot S_\text{gen} = ${fmt(Tc * S, 3)}$ MW of possible output.`,
          visual: flow(r4(Qh), r4(Qc), P, { Qh: 'Q_h = ?', Qc: 'Q_c = ?', W: `W = ${P} MW`, hot: `${Th} K`, cold: `${Tc} K`, device: 'power station' }, 'The station’s energy flows per second, widths to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-impossible', difficulty: 2,
      prompt: 'Four engines are advertised. Which one is impossible?',
      choices: ['Geothermal: 423 K brine, 293 K air, efficiency 35 %', 'Steam: 600 K and 300 K, efficiency 45 %', 'Gas turbine: 1500 K and 300 K, efficiency 60 %', 'Waste heat: 373 K and 273 K, efficiency 20 %'],
      answer: 0,
      why: { 1: 'Its Carnot limit is 1 − 300/600 = 50 %, above 45 %: allowed (though very good).', 2: 'Its limit is 1 − 300/1500 = 80 %: 60 % is allowed.', 3: 'Its limit is 1 − 273/373 = 26.8 %: 20 % is allowed.' },
      hints: [t`Compute $1 - T_c/T_h$ for each.`],
      teach: t`Check any claimed engine against $1 - T_c/T_h$ in kelvin.`,
      explain: t`The geothermal claim exceeds its Carnot limit $1 - 293/423 = 30.7\,\%$: it would generate negative entropy. The others are below their limits.`,
      visual: { type: 'graph', params: { x: [250, 1600], y: [0, 0.9], aspect: 'wide', xlabel: 'Tₕ (K)', ylabel: 'efficiency', axesAt: 'edge', curves: [{ fn: '1 - 293/x', domain: [293, 1600], color: 'accent', label: 'Carnot, T(cold) = 293 K', labelAt: 1250, labelDy: -14 }] }, caption: 'The Carnot limit against the hot temperature for a cold reservoir at 293 K (the engines’ own cold reservoirs differ slightly).' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §4.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Curzon & Ahlborn, Efficiency of a Carnot engine at maximum power output, Am. J. Phys. 43, 22 (1975)', url: 'https://doi.org/10.1119/1.10023' },
  ],
});
