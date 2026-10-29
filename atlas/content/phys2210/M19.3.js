// The Carnot cycle: two isotherms and two adiabats, reversible; Q_c/Q_h = T_c/T_h,
// so e_C = 1 − T_c/T_h — the ceiling for every engine between two reservoirs,
// and the matching limits on refrigerators and heat pumps.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, C0, TD, pvPic, one, flowPic } from './_pv.js';

const t = String.raw;
const HE = 5 / 3;
/** Only the slips whose value differs from the key (at Th = 2Tc, “the heat rejected” equals the work). */
const keep = (key, errs) => errs.filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key));

/** A Carnot cycle of n mol of gas (0.1 by default) between Th and Tc (K), as a PV picture. */
function carnotPic(Th, Tc, { gas = 'He', ratio = 2, n = 0.1, isoLabels = false, caption } = {}) {
  const g = gas === 'He' ? HE : 1.4;
  const c = TD.carnot({ Th, Tc, VA: n * 1e-2, ratio, n, g });          // A at 10 L per mole
  const st = Object.fromEntries(c.names.map((k, i) => [k, { P: c.states[i].P / 1000, V: c.states[i].V * 1000 }]));
  return pvPic({ gas, n, heat: true, legend: true, isotherms: [Th, Tc], isoLabels, states: st, paths: one('A', ['isothermal', 'B'], ['adiabatic', 'C'], ['isothermal', 'D'], ['adiabatic', 'A']),
    caption: caption ?? 'A Carnot cycle: heat in along the hot isotherm (red), out along the cold one (blue), none on the adiabats (violet). The gold area is the net work.' });
}

// the worked example: an ultra-supercritical coal plant, steam at 600 °C, condenser at 30 °C
const EX = { th: 600, tc: 30, eReal: 0.45, P: 1000 };
EX.Th = EX.th + C0; EX.Tc = EX.tc + C0;
EX.eC = 1 - EX.Tc / EX.Th;                         // 0.653
EX.frac = EX.eReal / EX.eC;                        // 0.69
EX.Qc = EX.P * (1 / EX.eReal - 1);                 // 1222 MW
EX.QcC = EX.P * (1 / EX.eC - 1);                   // 531 MW

export default lesson({
  id: 'phys2210.M19.3',
  title: 'The Carnot cycle',
  minutes: 12, difficulty: 3,
  intro: t`What is the best possible engine working between a hot reservoir at $T_h$ and a cold one at $T_c$? Sadi Carnot's answer (1824): a **reversible** one — no friction, no heat leaking across a temperature difference, nothing that could not be run exactly backwards. His cycle takes in heat along an isotherm at $T_h$, rejects heat along an isotherm at $T_c$, and joins the two with adiabats. For an ideal gas that makes $Q_c/Q_h = T_c/T_h$, so

$$e_{\text{C}} = 1 - \frac{T_c}{T_h}$$

with both temperatures in kelvin. **Carnot's theorem**: no engine between the same two reservoirs can beat this, and every reversible engine matches it, whatever its working substance. Run backwards, the same cycle sets the best any refrigerator or heat pump can do.`,
  symbols: [
    { tex: 'e_{\\text{C}}', text: 'the Carnot efficiency: the largest fraction of the heat taken in that any engine between the two reservoirs can turn into work' },
    { tex: 'T_h', text: 'the absolute temperature of the hot reservoir, in kelvin (K) — never °C, because the formula divides temperatures' },
    { tex: 'T_c', text: 'the absolute temperature of the cold reservoir, in K. Only $T_c = 0$ would give 100 %, and absolute zero cannot be reached' },
    { tex: 'K_{R,\\text{C}} = \\dfrac{T_c}{T_h - T_c}', text: 'the best possible refrigerator COP between the same temperatures; the best heat pump has $K_{P,\\text{C}} = T_h/(T_h - T_c)$' },
  ],
  why: 'Carnot’s limit is the yardstick for every power station, jet engine, refrigerator and cryocooler — and the step from it to entropy, next, is one of the great ideas in physics.',
  visual: {
    type: 'therm-pv',
    title: 'The best engine there can be',
    lead: t`A Carnot cycle for 0.1 mol of gas: heat flows in only on the hot isotherm A → B and out only on the cold isotherm C → D; the adiabats B → C and D → A exchange none. Set the reservoir temperatures and the size of the cycle, and compare the efficiency with $1 - T_c/T_h$.`,
    tasks: [
      t`Lower $T_c$ or raise $T_h$: the efficiency rises, always exactly $1 - T_c/T_h$.`,
      t`Change the expansion ratio: $W$ and $Q_h$ grow or shrink together, and the efficiency does not move.`,
      'Switch between helium and air: the cycle changes shape, but not its efficiency. The working substance does not matter.',
    ],
    params: {
      mode: 'cycle', cycle: 'carnot', gas: 'He', gases: ['He', 'air'], n: 0.1, VA: 1, Th: 600, Tc: 300, ratio: 2,
      controls: ['gas', 'Th', 'Tc', 'ratio'], ranges: { Th: [400, 1200, 10], Tc: [250, 380, 5], ratio: [1.5, 4, 0.1] },
      readouts: ['Qh', 'Qc', 'Wnet', 'e', 'carnot'],
    },
    caption: 'An ideal gas going round quasi-statically, every step reversible: heat crosses only when the gas is at the reservoir’s own temperature, which would take forever. Note how thin the cycle is: a Carnot engine does little work per cycle for its size — one reason no real engine uses it.',
  },
  example: {
    prompt: t`(a) Show that for an ideal gas going round a Carnot cycle, $Q_c/Q_h = T_c/T_h$. (b) A modern coal-fired power station raises steam at ${EX.th} °C and condenses it at ${EX.tc} °C. What is its Carnot limit? (c) It actually achieves ${Math.round(EX.eReal * 100)} %. For ${EX.P} MW of electricity, how much heat does it reject, and how much would a Carnot engine reject?`,
    visual: carnotPic(600, 300, { isoLabels: true, caption: 'A Carnot cycle of helium between 600 K and 300 K. The hot isotherm A → B takes heat in; the cold isotherm C → D gives heat out; the adiabats join them.' }),
    steps: [
      { label: 'Heat on the isotherms', text: t`On an isotherm $\Delta E_\text{int} = 0$, so $Q = W$: $Q_h = nRT_h\ln\dfrac{V_B}{V_A}$ and $Q_c = nRT_c\ln\dfrac{V_C}{V_D}$ (as magnitudes).` },
      { label: 'The adiabats', text: t`Along B → C, $T_hV_B^{\gamma-1} = T_cV_C^{\gamma-1}$; along D → A, $T_hV_A^{\gamma-1} = T_cV_D^{\gamma-1}$. Divide one by the other: $V_B/V_A = V_C/V_D$.` },
      { label: 'The ratio', text: t`So the two logarithms are equal and cancel: $\dfrac{Q_c}{Q_h} = \dfrac{T_c}{T_h}$, and $e_{\text{C}} = 1 - \dfrac{Q_c}{Q_h} = 1 - \dfrac{T_c}{T_h}$. Nothing about $n$, $\gamma$ or the volumes survives.` },
      { label: 'The power station', text: t`In kelvin: $T_h = ${fmt(EX.Th, 4)}$ K, $T_c = ${fmt(EX.Tc, 4)}$ K, so $e_{\text{C}} = 1 - ${fmt(EX.Tc, 4)}/${fmt(EX.Th, 4)} = ${fmt(EX.eC, 3)}$, about ${Math.round(EX.eC * 100)} %. The real plant reaches ${Math.round(EX.frac * 100)} % of that.` },
      { label: 'Heat rejected', text: t`Actual: $P(1/e - 1) = ${EX.P}(1/${EX.eReal} - 1) = ${fmt(EX.Qc, 4)}$ MW into the cooling water. A Carnot engine: $${EX.P}(1/${fmt(EX.eC, 3)} - 1) = ${fmt(EX.QcC, 3)}$ MW. Even perfection must throw away about half a joule of heat for every joule of electricity.` },
      { label: 'Sense check', text: t`Real plants fall short because heat crosses large temperature differences (flame to steam), the cycle is not Carnot's (water is heated from cold, not all at the top temperature), and turbines and pumps are not reversible.` },
    ],
    answer: t`(a) $Q_c/Q_h = T_c/T_h$; (b) $e_{\text{C}} \approx ${fmt(EX.eC, 2)}$; (c) about ${fmt(EX.Qc, 3)} MW actual, against ${fmt(EX.QcC, 3)} MW for a Carnot engine.`,
  },
  practice: [
    num({
      id: 'carnot-e', difficulty: 1,
      gen(r) {
        const th = r.pick([227, 327, 427, 527]), tc = r.pick([7, 27, 47]);
        const Th = th + C0, Tc = tc + C0, e = 1 - Tc / Th;
        return {
          prompt: t`A Carnot engine works between reservoirs at ${th} °C and ${tc} °C. What is its efficiency? (Give a decimal.)`,
          answer: e, tol: { rel: 0.005 },
          errors: keep(e, [{ value: 1 - tc / th, feedback: 'The formula divides temperatures, so they must be absolute: add 273.15 to each.' }, { value: Tc / Th, feedback: t`That is $Q_c/Q_h$, the share rejected. The efficiency is $1 - T_c/T_h$.` }]),
          hints: [t`Convert to kelvin first.`, t`$e_{\text{C}} = 1 - T_c/T_h$ with $T_h = ${fmt(Th, 5)}$ K and $T_c = ${fmt(Tc, 5)}$ K.`],
          teach: t`The Carnot efficiency uses absolute temperatures: $e_{\text{C}} = 1 - T_c/T_h$ with both in kelvin.`,
          explain: t`$e_{\text{C}} = 1 - \dfrac{${fmt(Tc, 5)}}{${fmt(Th, 5)}} = ${fmt(e, 3)}$, or ${fmt(e * 100, 3)} %.`,
          visual: carnotPic(Th, Tc),
        };
      },
    }),
    mcq({
      id: 'celsius', difficulty: 2,
      prompt: 'An engine works between boiling water at 100 °C and melting ice at 0 °C. The most efficient it could possibly be is:',
      visual: carnotPic(373.15, 273.15, { caption: 'The best engine between the two temperatures: a Carnot cycle. (Shape for helium; the efficiency would be the same for any substance.)' }),
      choices: ['About 27 %', '100 %, since 1 − 0/100 = 1', 'About 73 %', 'About 50 %'],
      answer: 0,
      why: {
        1: t`That uses Celsius. In kelvin $T_c = 273$ K, not 0: the cold reservoir is far from absolute zero.`,
        2: t`That is $T_c/T_h$, the share of the heat that must be rejected.`,
        3: 'No such rule; the efficiency depends on the ratio of the absolute temperatures.',
      },
      hints: ['Convert both temperatures to kelvin.', t`$1 - 273/373$.`],
      teach: 'Celsius temperatures give nonsense in the Carnot formula: it needs kelvin.',
      explain: t`$e_{\text{C}} = 1 - 273.15/373.15 = 0.268$, about 27 %. A steam engine running on boiling water can never do better.`,
    }),
    num({
      id: 'max-work', difficulty: 2,
      gen(r) {
        const Qh = r.pick([1000, 2000, 5000]), Th = r.pick([500, 600, 800]), Tc = r.pick([300, 350]);
        const W = Qh * (1 - Tc / Th);
        return {
          prompt: t`An engine takes in ${Qh} J of heat per cycle from a reservoir at ${Th} K and rejects heat to one at ${Tc} K. What is the most work it could possibly do per cycle?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: keep(W, [{ value: Qh * (Tc / Th), feedback: t`That is the least heat it must reject, $Q_h T_c/T_h$. The work is the rest.` }, { value: Qh, feedback: 'No cyclic engine can turn all its heat into work (the second law).' }]),
          hints: [t`$W_\text{max} = e_{\text{C}}Q_h$.`],
          teach: 'The most work a cycle can extract is the Carnot efficiency times the heat taken in.',
          explain: t`$e_{\text{C}} = 1 - ${Tc}/${Th} = ${fmt(1 - Tc / Th, 3)}$, so $W_\text{max} = ${fmt(1 - Tc / Th, 3)}\times${Qh} = ${fmt(W, 4)}$ J; at least ${fmt(Qh - W, 4)} J must go to the cold reservoir.`,
          visual: flowPic({ Qh, Qc: Qh - W, W, labels: { Qh: `Q_h = ${Qh} J`, Qc: 'Q_c', W: 'W = ?', hot: `hot reservoir, ${Th} K`, cold: `cold reservoir, ${Tc} K` } }),
        };
      },
    }),
    mcq({
      id: 'claim', difficulty: 2,
      prompt: 'An inventor claims an engine that takes heat from a reservoir at 500 K, rejects heat to one at 300 K, and achieves 45 % efficiency. Is that possible?',
      visual: flowPic({ Qh: 1000, Qc: 550, W: 450, labels: { Qh: 'Q_h = 1000 J', Qc: 'Q_c = 550 J', W: 'W = 450 J (claimed)', hot: 'hot reservoir, 500 K', cold: 'cold reservoir, 300 K' }, caption: 'The claimed engine, per cycle.' }),
      choices: ['No: the Carnot limit between those temperatures is 40 %', 'Yes, provided it has no friction', 'Yes: 45 % is well under 100 %', 'No: no heat engine can exceed 33 %'],
      answer: 0,
      why: {
        1: 'A frictionless, perfectly reversible engine reaches exactly the Carnot limit, 40 % here — and no further.',
        2: 'The ceiling is not 100 %; it is set by the two temperatures.',
        3: 'There is no universal 33 % limit; power stations reach 45 % and combined-cycle plants 60 %. The limit depends on the temperatures.',
      },
      hints: [t`Find $1 - T_c/T_h$ for these reservoirs.`],
      teach: 'No engine between two reservoirs can beat the Carnot efficiency, however well it is built.',
      explain: t`$e_{\text{C}} = 1 - 300/500 = 0.40$. Claiming 45 % means claiming to beat a reversible engine, which Carnot's theorem forbids: coupled to a Carnot refrigerator, such an engine would move heat from cold to hot with no work.`,
    }),
    mcq({
      id: 'raise-or-lower', difficulty: 3,
      prompt: t`A Carnot engine runs between $T_h = 600$ K and $T_c = 300$ K. Which change raises its efficiency more?`,
      visual: carnotPic(600, 300, { isoLabels: true, caption: 'The engine’s cycle between 600 K and 300 K (helium).' }),
      choices: [t`Lowering $T_c$ by 10 K`, t`Raising $T_h$ by 10 K`, t`Either: only the difference $T_h - T_c$ matters`, 'Neither changes it noticeably'],
      answer: 0,
      why: {
        1: t`Raising $T_h$ to 610 K gives $1 - 300/610 = 50.8\ \%$; lowering $T_c$ to 290 K gives $1 - 290/600 = 51.7\ \%$.`,
        2: t`$e_{\text{C}} = (T_h - T_c)/T_h$: the difference matters, but so does $T_h$ in the denominator.`,
        3: 'Both raise it by about a percentage point.',
      },
      hints: ['Work out both new efficiencies.', t`Or compare $\partial e/\partial T_c = -1/T_h$ with $\partial e/\partial T_h = T_c/T_h^2$.`],
      teach: t`A kelvin off the cold side is worth more than a kelvin on the hot side, by the factor $T_h/T_c$.`,
      explain: t`$1 - 290/600 = 0.517$ against $1 - 300/610 = 0.508$. In general $|\partial e/\partial T_c| = 1/T_h$ is larger than $\partial e/\partial T_h = T_c/T_h^2$ by the factor $T_h/T_c$. Engineers still raise $T_h$, because $T_c$ is stuck near the temperature of the air or river around them.`,
    }),
    num({
      id: 'cop-max', difficulty: 2,
      gen(r) {
        const tf = r.pick([-18, -20, -25]), tk = r.pick([20, 22, 25]);
        const Tc = tf + C0, Th = tk + C0, K = Tc / (Th - Tc);
        return {
          prompt: t`A freezer keeps its inside at $${tf}$ °C in a kitchen at ${tk} °C. What is the highest coefficient of performance $K_R$ it could possibly have?`,
          answer: K, tol: { rel: 0.005 },
          errors: keep(K, [{ value: Th / (Th - Tc), feedback: t`That is the best heat-pump COP, $T_h/(T_h - T_c)$. A freezer is judged by the heat it removes: $T_c/(T_h - T_c)$.` }, { value: Math.abs(tf) / (tk - tf), feedback: `Use absolute temperatures: ${String(tf).replace('-', '−')} °C is ${fmt(Tc, 5)} K.` }]),
          hints: ['Convert to kelvin.', t`$K_{R,\text{C}} = \dfrac{T_c}{T_h - T_c}$.`],
          teach: t`The best possible refrigerator is a Carnot cycle run backwards, with $K_{R,\text{C}} = T_c/(T_h - T_c)$.`,
          explain: t`$K_{R,\text{C}} = \dfrac{${fmt(Tc, 5)}}{${fmt(Th, 5)} - ${fmt(Tc, 5)}} = ${fmt(K, 3)}$. Real freezers manage roughly a third of that.`,
          visual: flowPic({ device: 'fridge', Qh: K + 1, Qc: K, W: 1, labels: { Qh: 'Q_h', Qc: 'Q_c', W: 'W', hot: `kitchen, ${tk} °C`, cold: `inside the freezer, ${String(tf).replace('-', '−')} °C`, device: 'freezer' }, caption: 'An ideal (Carnot) freezer, widths to scale.' }),
        };
      },
    }),
    num({
      id: 'cycle-heat', difficulty: 3,
      gen(r) {
        const Th = r.pick([500, 600, 800]), Tc = 300, n = r.pick([0.5, 1, 2]), k = r.pick([2, 3]);
        const Qh = n * R * Th * Math.log(k), W = Qh * (1 - Tc / Th);
        return {
          prompt: t`${n} mol of helium goes round a Carnot cycle between ${Th} K and ${Tc} K, its volume growing by a factor of ${k} along the hot isotherm. How much net work does it do per cycle?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: keep(W, [{ value: Qh, feedback: t`That is the heat taken in along the hot isotherm. Only the fraction $e_{\text{C}}$ of it becomes work.` }, { value: (Qh * Tc) / Th, feedback: t`That is the heat rejected, $Q_c = Q_hT_c/T_h$. The work is $Q_h - Q_c$.` }]),
          hints: [t`On the hot isotherm $Q_h = nRT_h\ln(V_B/V_A)$.`, t`Then $W = e_{\text{C}}Q_h$ with $e_{\text{C}} = 1 - T_c/T_h$ — which equals $nR(T_h - T_c)\ln(V_B/V_A)$.`],
          teach: 'For a Carnot cycle the heat in comes from the hot isotherm alone, and the work is the Carnot fraction of it.',
          explain: t`$Q_h = (${n})(8.314)(${Th})\ln ${k} = ${fmt(Qh, 4)}$ J, and $W = (1 - ${Tc}/${Th})(${fmt(Qh, 4)}) = ${fmt(W, 4)}$ J $= nR(T_h - T_c)\ln${k}$.`,
          visual: carnotPic(Th, Tc, { ratio: k, n, isoLabels: true }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: '“A Carnot engine is reversible, so it wastes nothing. Its efficiency must be 100 %.” What is wrong with this reasoning?',
      visual: carnotPic(500, 300, { caption: 'A Carnot cycle between 500 K and 300 K. Follow the blue leg.' }),
      choices: [
        t`Reversible means no avoidable losses, but the engine must still reject $Q_c = Q_hT_c/T_h$ to the cold reservoir: its efficiency is $1 - T_c/T_h$`,
        'A Carnot engine is not reversible',
        t`Its efficiency is $1 - T_h/T_c$`,
        'It loses energy to friction on the adiabats',
      ],
      answer: 0,
      why: {
        1: 'It is the reversible engine, by construction: every step could be run backwards.',
        2: t`That would be negative. The efficiency is $1 - T_c/T_h$.`,
        3: 'An ideal Carnot engine has no friction anywhere. Its only “loss” is the heat it must reject.',
      },
      hints: ['Look at the blue leg: does heat leave the gas there?', t`Over a cycle $Q_c/Q_h = T_c/T_h$, which is zero only if $T_c = 0$ K.`],
      teach: 'Even a perfectly reversible engine must reject heat; reversibility gets it to the Carnot limit, not to 100 %.',
      explain: t`The Carnot engine rejects $Q_c = Q_hT_c/T_h$ along the cold isotherm — unavoidable, since the gas must be brought back to its start. Here $e_{\text{C}} = 1 - 300/500 = 40\ \%$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-jet', difficulty: 2, transfer: true,
      gen(r) {
        const Th = r.pick([1600, 1700, 1800]), Tc = r.pick([220, 288]);
        const e = 1 - Tc / Th;
        return {
          prompt: t`A jet engine's turbine inlet temperature is ${Th} K, and it rejects its exhaust heat to air at ${Tc} K${Tc === 220 ? ' (cruise altitude)' : ' (sea level)'}. What is the Carnot limit on its efficiency? (Give a percentage.)`,
          answer: e * 100, units: '%', tol: { rel: 0.005 },
          errors: keep(e * 100, [{ value: (Tc / Th) * 100, feedback: t`That is $T_c/T_h$. The efficiency is $1 - T_c/T_h$.` }]),
          hints: [t`$e_{\text{C}} = 1 - T_c/T_h$.`],
          teach: 'The Carnot limit for any engine follows from its hottest and coldest temperatures alone.',
          explain: t`$e_{\text{C}} = 1 - ${Tc}/${Th} = ${fmt(e * 100, 3)}$ %. Real engine cores reach about 50 %. Even an ideal gas turbine falls short of Carnot, because it takes in its heat over a range of temperatures, not all at ${Th} K — the subject of lesson M19.5.`,
          visual: carnotPic(Th, Tc, { isoLabels: true, caption: 'A Carnot cycle of helium between the two temperatures, to scale. At so large a temperature ratio it is a thin sliver: it would do very little work for its size.' }),
        };
      },
    }),
    num({
      id: 'cp-cryo', difficulty: 2, transfer: true,
      gen(r) {
        const Qc = r.pick([2, 5, 10]), Tc = r.pick([20, 77]), Th = 300;
        const W = Qc * (Th - Tc) / Tc;
        return {
          prompt: t`What is the least electrical power any refrigerator could use to remove ${Qc} W of heat from a tank at ${Tc} K${Tc === 20 ? ' (liquid hydrogen)' : ' (liquid nitrogen)'}, rejecting heat at ${Th} K?`,
          answer: W, units: 'W', tol: { rel: 0.005 },
          errors: keep(W, [{ value: Qc * Tc / (Th - Tc), feedback: t`Upside down: $W_\text{min} = Q_c/K_{R,\text{C}} = Q_c(T_h - T_c)/T_c$.` }, { value: Qc * Th / Tc, feedback: t`That is the heat rejected, $Q_h = Q_c T_h/T_c$. Subtract $Q_c$ to get the work.` }]),
          hints: [t`$K_{R,\text{C}} = T_c/(T_h - T_c)$.`, t`$W_\text{min} = Q_c/K_{R,\text{C}}$.`],
          teach: 'The colder the cold space, the more work each joule of cooling needs, even for a perfect refrigerator.',
          explain: t`$K_{R,\text{C}} = ${Tc}/${Th - Tc} = ${fmt(Tc / (Th - Tc), 3)}$, so $W_\text{min} = ${Qc}/${fmt(Tc / (Th - Tc), 3)} = ${fmt(W, 3)}$ W. Real cryocoolers need several times this — which is why keeping propellants cold in space is costly, and why tanks are so heavily insulated.`,
          visual: flowPic({ device: 'fridge', Qh: Qc + W, Qc, W, labels: { Qh: 'Q_h', Qc: `Q_c = ${Qc} W`, W: 'W_{min} = ?', hot: `surroundings, ${Th} K`, cold: `tank, ${Tc} K` }, caption: 'An ideal refrigerator, widths to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-heat-pump', difficulty: 2,
      prompt: 'A manufacturer claims its heat pump reaches a coefficient of performance of 25 heating a house to 20 °C from outdoor air at 0 °C. Is that possible?',
      visual: flowPic({ device: 'pump', Qh: 25, Qc: 24, W: 1, labels: { Qh: 'Q_h = 25 W (claimed)', Qc: 'Q_c = 24 W', W: 'W = 1 W', hot: 'the house, 20 °C', cold: 'outdoor air, 0 °C' }, caption: 'The claim, per watt of electricity.' }),
      choices: ['No: even a Carnot heat pump between those temperatures reaches only about 14.7', 'Yes: heat pumps move heat rather than make it, so any COP is possible', 'No: a COP above 1 would create energy', 'Yes, if the compressor is frictionless'],
      answer: 0,
      why: {
        1: 'Moving heat uphill takes work, and the second law sets the minimum: the COP cannot exceed the Carnot value.',
        2: 'COPs above 1 are normal (they move heat, not make it); the limit here is about 14.7, not 1.',
        3: 'A frictionless, reversible heat pump reaches exactly the Carnot COP — and no further.',
      },
      hints: [t`$K_{P,\text{C}} = T_h/(T_h - T_c)$ in kelvin.`],
      teach: 'No heat pump can beat the Carnot coefficient of performance between its two temperatures.',
      explain: t`$K_{P,\text{C}} = 293.15/20 = 14.7$. A claim of 25 would let you build a perpetual-motion machine of the second kind; real heat pumps in these conditions reach about 4 to 5.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §4.5 The Carnot Cycle', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-5-the-carnot-cycle' },
  ],
});
