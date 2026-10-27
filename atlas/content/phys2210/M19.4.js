// Entropy: ΔS = ∫dQ_rev/T, a property of the state; the second law as
// "the entropy of an isolated system never decreases"; S = k_B ln Ω, and why
// "disorder" is only a loose description.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { R, C0, molesOf, pvPic, one, flowPic, freeBoxPic } from './_pv.js';
import { bodiesPic } from './_thermal.js';

const t = String.raw;
const C_WATER = 4184;             // J/(kg K), liquid water near room temperature
const LF_ICE = 334e3;             // J/kg, ice melting at 0 °C (OpenStax Vol. 2, Table 1.4)
const LN2 = { Tb: 77.36, Lv: 199e3 };   // liquid nitrogen at 1 atm (NIST Chemistry WebBook)

// the worked example: 1 kg of water at 90 °C mixed with 1 kg at 10 °C in an insulated jug
const EX = { th: 90, tc: 10, m: 1 };
EX.Th = EX.th + C0; EX.Tc = EX.tc + C0; EX.Tf = (EX.Th + EX.Tc) / 2;
EX.dSh = EX.m * C_WATER * Math.log(EX.Tf / EX.Th);      // −488 J/K
EX.dSc = EX.m * C_WATER * Math.log(EX.Tf / EX.Tc);      // +553 J/K
EX.Q = EX.m * C_WATER * (EX.Th - EX.Tf);                // 167 kJ

// the Explore: helium at 200 kPa, 2 L, 300 K
const N0 = molesOf(200, 2, 300);

export default lesson({
  id: 'phys2210.M19.4',
  title: 'Entropy',
  minutes: 13, difficulty: 3,
  intro: t`The Carnot cycle hides a new quantity: in a reversible cycle $Q_h/T_h = Q_c/T_c$, so heat divided by the temperature at which it flows comes out even. Clausius called the quantity that $Q/T$ measures **entropy**, $S$. For a reversible change

$$\Delta S = \int \frac{dQ_{\text{rev}}}{T}$$

Entropy is a property of the state, like internal energy, so for an *irreversible* change you find $\Delta S$ along any reversible path between the same two states. The second law in its general form: **the entropy of an isolated system never decreases** — it stays constant only if everything is reversible, and heat flowing from hot to cold, friction, mixing and free expansion all raise it. Boltzmann found its meaning: $S = k_B\ln\Omega$, where $\Omega$ counts the microscopic arrangements that look the same from outside.`,
  symbols: [
    { tex: '\\Delta S', text: 'the change in entropy, in joules per kelvin (J/K). Only changes matter here; the zero of $S$ is a convention' },
    { tex: 'dQ_{\\text{rev}}', text: 'a small amount of heat added along a **reversible** path between the two states — which need not be the path the system actually took' },
    { tex: 'T', text: 'the absolute temperature (K) at which that heat is added' },
    { tex: 'S = k_B\\ln\\Omega', text: 'Boltzmann’s entropy: $k_B = 1.381\\times10^{-23}$ J/K and $\\Omega$ the number of microscopic states (positions and speeds of every molecule) consistent with the observed state. More ways to be the same on the outside means more entropy' },
  ],
  why: 'Entropy turns the second law from a statement about engines into a law for everything: why heat flows downhill, why engines must reject heat, and — in general relativity — why black holes have a temperature.',
  visual: {
    type: 'therm-pv',
    title: 'Heat as an area on a temperature–entropy diagram',
    lead: t`The same process of 0.16 mol of helium, drawn twice: on the PV diagram (left), where the area under the path is the work, and on a temperature–entropy (TS) diagram (right), where the area under the path is the **heat**, $\int T\,dS$. Pick a process and drag its end.`,
    tasks: [
      t`Isothermal expansion: on the TS diagram the path is a horizontal line, and the red area under it, $T\Delta S$, equals the heat $Q$ in the readout.`,
      t`Adiabatic: no heat flows, so $\Delta S = 0$ — a vertical line on the TS diagram. A reversible adiabat is an *isentrope*.`,
      t`Isochoric heating: the TS path climbs steeply, $\Delta S = nC_V\ln(T_2/T_1)$; compress isothermally instead and $\Delta S$ turns negative (blue) — the gas's entropy falls while its surroundings' rises.`,
    ],
    params: {
      mode: 'process', gas: 'He', n: N0, start: { P: 200, V: 2 }, process: 'isothermal', processes: ['isothermal', 'adiabatic', 'isochoric', 'isobaric'], end: { V: 5 },
      controls: ['process', 'end'], readouts: ['Q', 'dS', 'T2'], ts: true, vrange: [0, 8], prange: [0, 600], ranges: { V2: [0.8, 8, 0.05], T2: [100, 900, 5] },
    },
    caption: 'Helium as an ideal gas, every path reversible. Left: PV, shaded area = work. Right: TS, shaded area = heat (red in, blue out). Entropy’s zero is arbitrary; only differences count. Dashed lines: isotherms; on the TS diagram they are horizontal.',
  },
  example: {
    prompt: t`In an insulated jug, ${EX.m.toFixed(2)} kg of water at ${EX.th} °C is mixed with ${EX.m.toFixed(2)} kg at ${EX.tc} °C. Find the entropy change of each portion and of the whole. ($c = ${C_WATER}$ J/(kg K).)`,
    visual: bodiesPic({ bodies: [{ name: 'hot water', temp: `${EX.th} °C`, color: 'bad' }, { name: 'cold water', temp: `${EX.tc} °C`, color: 'accent' }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: 'Equal masses of hot and cold water exchange heat inside an insulated jug until they share one temperature. Not to scale.' }),
    steps: [
      { label: 'Final temperature', text: t`Equal masses, so they meet halfway: $T_f = ${EX.th + EX.tc}/2 = ${(EX.th + EX.tc) / 2}$ °C $= ${fmt(EX.Tf, 5)}$ K. The heat passed is $Q = mc\Delta T = ${fmt(EX.Q / 1000, 3)}$ kJ.` },
      { label: 'A reversible path', text: t`The real mixing is irreversible, but $S$ is a property of the state, so imagine warming or cooling each portion slowly through a series of reservoirs. Each step adds $dQ = mc\,dT$ at temperature $T$, so $\Delta S = \displaystyle\int mc\,\frac{dT}{T} = mc\ln\dfrac{T_f}{T_i}$.` },
      { label: 'Hot portion', text: t`$\Delta S_\text{hot} = (${EX.m})(${C_WATER})\ln\dfrac{${fmt(EX.Tf, 5)}}{${fmt(EX.Th, 5)}} = ${fmt(EX.dSh, 4)}$ J/K: its entropy falls.` },
      { label: 'Cold portion', text: t`$\Delta S_\text{cold} = (${EX.m})(${C_WATER})\ln\dfrac{${fmt(EX.Tf, 5)}}{${fmt(EX.Tc, 5)}} = +${fmt(EX.dSc, 4)}$ J/K: it rises — by more.` },
      { label: 'The whole', text: t`$\Delta S = ${fmt(EX.dSh, 4)} + ${fmt(EX.dSc, 4)} = +${fmt(EX.dSh + EX.dSc, 3)}$ J/K. The same heat left the hot water at high temperature and entered the cold water at low temperature, and $Q/T$ is bigger at low $T$. An isolated system, a spontaneous process, and entropy rose — the second law at work.` },
    ],
    answer: t`$\Delta S_\text{hot} \approx ${fmt(EX.dSh, 3)}$ J/K, $\Delta S_\text{cold} \approx +${fmt(EX.dSc, 3)}$ J/K, total $\approx +${fmt(EX.dSh + EX.dSc, 2)}$ J/K.`,
  },
  practice: [
    num({
      id: 'melt', difficulty: 1,
      gen(r) {
        const m = r.pick([0.5, 1, 1.5, 2]);
        const dS = (m * LF_ICE) / C0;
        return {
          prompt: t`${m} kg of ice melts at 0 °C. By how much does its entropy change? (Latent heat of fusion: 334 kJ/kg.)`,
          answer: dS, units: 'J/K', tol: { rel: 0.005 },
                    hints: [t`The temperature stays at 0 °C = 273.15 K while it melts, so $\Delta S = Q/T$.`, t`$Q = mL_f$.`],
          teach: 'At constant temperature the entropy change is simply the heat divided by the absolute temperature.',
          explain: t`$\Delta S = \dfrac{mL_f}{T} = \dfrac{(${m})(334\,000\ \text{J/kg})}{273.15\ \text{K}} = ${fmt(dS, 4)}$ J/K. Melting is a reversible change at 0 °C, so this is exact.`,
          visual: { type: 'graph', params: { x: [0, Math.ceil(m * 334 * 1.25 / 100) * 100], y: [250, 300], aspect: 'wide', xlabel: 'heat added Q (kJ)', ylabel: 'T (K)', alt: 'Temperature staying at 273.15 K while ice melts', curves: [{ fn: '273.15', domain: [0, m * 334], color: 'accent', width: 3, label: 'ice melting at 273.15 K', labelAt: m * 167, labelDx: -60, labelDy: -14 }], points: [{ x: 0, y: 273.15, r: 5, color: 'accent' }, { x: m * 334, y: 273.15, r: 5, color: 'accent' }] }, caption: 'While the ice melts, all the heat goes into breaking the crystal: the temperature stays at 273.15 K.' },
        };
      },
    }),
    num({
      id: 'hot-to-cold', difficulty: 2,
      gen(r) {
        const Q = r.pick([600, 1000, 1500, 2000]), Th = r.pick([500, 600]), Tc = r.pick([250, 300]);
        const dS = Q / Tc - Q / Th;
        return {
          prompt: t`${Q} J of heat flows by conduction from a large body at ${Th} K to another at ${Tc} K. Both stay at their temperatures. What is the total entropy change?`,
          answer: dS, units: 'J/K', tol: { rel: 0.005 },
          errors: [{ value: Q / Tc + Q / Th, feedback: t`The hot body *loses* the heat: its entropy change is $-Q/T_h$.` }, { value: Q / (Th - Tc), feedback: t`Each body's entropy changes by its own $\pm Q/T$; you cannot divide by the temperature difference.` }],
          hints: [t`Hot body: $\Delta S = -Q/T_h$. Cold body: $\Delta S = +Q/T_c$.`, 'Add them.'],
          teach: 'Heat flowing from hot to cold raises the total entropy, because Q/T is larger at the lower temperature.',
          explain: t`$\Delta S = -\dfrac{${Q}}{${Th}} + \dfrac{${Q}}{${Tc}} = ${fmt(-Q / Th, 3)} + ${fmt(Q / Tc, 3)} = +${fmt(dS, 3)}$ J/K. Positive, as it must be for heat flowing by itself. Run it the other way and the sign flips: that is why heat never flows from cold to hot on its own.`,
          visual: bodiesPic({ bodies: [{ name: 'hot body', temp: `${Th} K`, color: 'bad' }, { name: 'cold body', temp: `${Tc} K`, color: 'accent' }], flows: [{ from: 0, to: 1, label: `${Q} J` }], caption: 'Heat flows from the hot body to the cold one. Both are large enough that their temperatures do not change.' }),
        };
      },
    }),
    mcq({
      id: 'system-falls', difficulty: 2,
      prompt: 'Water in a freezer turns to ice, and its entropy decreases. Does this break the second law?',
      visual: flowPic({ device: 'fridge', Qh: 400, Qc: 300, W: 100, labels: { Qh: 'Q_h into the kitchen', Qc: 'Q_c out of the water', W: 'W', hot: 'kitchen, 295 K', cold: 'water freezing, 273 K', device: 'freezer' }, caption: 'The freezer takes heat out of the water and dumps it, with the work, into the kitchen.' }),
      choices: [
        'No: the kitchen’s entropy rises by more than the water’s falls, so the total still increases',
        'Yes: the second law says entropy can never decrease',
        'No, because entropy only applies to gases',
        'No, because the entropy the water loses is destroyed in the compressor',
      ],
      answer: 0,
      why: {
        1: t`The second law is about an **isolated** system (or the universe) as a whole. A part of it — the water — can lose entropy if the rest gains more.`,
        2: 'Entropy is defined for any substance: ice, water, steel, light.',
        3: 'Entropy is never destroyed. It is moved, with the heat, into the kitchen — and more is created in the process.',
      },
      hints: ['Which system does the second law say cannot lose entropy?', t`The kitchen receives $Q_h = Q_c + W$ at 295 K.`],
      teach: 'A system’s entropy can fall when it gives heat away; the second law only forbids the total entropy of an isolated system from falling.',
      explain: t`Freezing 1 kg of water removes 334 kJ at 273 K: $\Delta S_\text{water} = -1223$ J/K. The kitchen receives that heat plus the freezer's work at 295 K, which is at least $+1132$ J/K from the heat alone, and more from the work — and the work is what makes the total come out positive. Living things lower their own entropy all the time, the same way.`,
    }),
    num({
      id: 'isothermal-dS', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2, 3]), k = r.pick([2, 3, 5]);
        const dS = n * R * Math.log(k);
        return {
          prompt: t`${n} mol of an ideal gas expands reversibly and isothermally to ${k} times its volume. What is its change in entropy?`,
          answer: dS, units: 'J/K', tol: { rel: 0.005 },
          errors: [{ value: n * R * Math.log10(k), feedback: t`Use the natural logarithm, $\ln$.` }, { value: n * R * (k - 1), feedback: t`$\Delta S = Q/T$ with $Q = nRT\ln(V_2/V_1)$: a logarithm, not the ratio minus one.` }],
          hints: [t`On an isotherm $Q = W = nRT\ln(V_2/V_1)$ and $T$ is constant.`, t`$\Delta S = Q/T = nR\ln(V_2/V_1)$.`],
          teach: 'An isothermal expansion of an ideal gas raises its entropy by nR ln(V₂/V₁) — more room for the molecules.',
          explain: t`$\Delta S = Q/T = nR\ln\dfrac{V_2}{V_1} = (${n})(8.314)\ln ${k} = ${fmt(dS, 3)}$ J/K. The temperature drops out: what matters is how much more room the gas has.`,
          visual: pvPic({ gas: 'air', n, heat: true, states: { A: { P: 200, V: (n * R * 300) / 200 }, B: { P: 200 / k, V: (k * n * R * 300) / 200 } }, paths: one('A', ['isothermal', 'B']), caption: 'A reversible isothermal expansion: heat in (red), work out (shaded).' }),
        };
      },
    }),
    num({
      id: 'free-dS', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2]), k = r.pick([2, 3, 4]);
        const dS = n * R * Math.log(k);
        return {
          prompt: t`${n} mol of an ideal gas is let into a vacuum through a broken partition, in an insulated box, and ends up filling ${k} times its original volume. No heat flows. What is the gas's change in entropy?`,
          answer: dS, units: 'J/K', tol: { rel: 0.005 },
          errors: [{ value: n * R * Math.log10(k), feedback: t`Use $\ln$, the natural logarithm.` }],
          hints: [t`$Q = 0$ here, but $\int dQ/T$ only gives $\Delta S$ along a *reversible* path. This expansion is not reversible.`, t`Find a reversible path between the same two states: the temperature is unchanged (lesson M18.2), so use an isothermal expansion — $\Delta S = nR\ln(V_2/V_1)$.`],
          teach: t`Entropy is a property of the state: for an irreversible change, compute $\Delta S$ along any reversible path between the same end states.`,
          explain: t`The end states are the same as for a reversible isothermal expansion, so $\Delta S = nR\ln${k} = ${fmt(dS, 3)}$ J/K — though no heat flowed at all. The gas could never gather itself back into the first part of the box on its own: that would lower the entropy of an isolated system.`,
          visual: freeBoxPic({ caption: `Not to scale. The gas rushes into the empty part and ends up filling ${k} times its first volume.` }),
        };
      },
    }),
    num({
      id: 'heating', difficulty: 3,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), t1 = r.pick([10, 20]), t2 = r.pick([60, 80, 90]);
        const T1 = t1 + C0, T2 = t2 + C0, dS = m * C_WATER * Math.log(T2 / T1), Q = m * C_WATER * (t2 - t1);
        return {
          prompt: t`${m} kg of water is heated slowly from ${t1} °C to ${t2} °C. What is its change in entropy? ($c = 4184$ J/(kg K).)`,
          answer: dS, units: 'J/K', tol: { rel: 0.005 },
          errors: [{ value: Q / T1, feedback: t`The temperature rises as the heat goes in: integrate $mc\,dT/T$ instead of dividing by the starting temperature.` }, { value: Q / T2, feedback: t`Dividing by the final temperature undercounts the heat that went in while the water was cooler. Integrate $mc\,dT/T$.` }, { value: m * C_WATER * Math.log(t2 / t1), feedback: 'The logarithm needs absolute temperatures, in kelvin.' }],
          hints: [t`$dS = dQ/T = mc\,dT/T$.`, t`Integrate: $\Delta S = mc\ln(T_2/T_1)$, temperatures in kelvin.`],
          teach: t`When the temperature changes, add up $dQ/T$ step by step: $\Delta S = mc\ln(T_2/T_1)$.`,
          explain: t`$\Delta S = mc\ln\dfrac{T_2}{T_1} = (${m})(4184)\ln\dfrac{${fmt(T2, 5)}}{${fmt(T1, 5)}} = ${fmt(dS, 3)}$ J/K, between $Q/T_2 = ${fmt(Q / T2, 3)}$ and $Q/T_1 = ${fmt(Q / T1, 3)}$ J/K, as it must be.`,
          visual: { type: 'graph', params: { x: [0, Math.ceil((Q / 1000) * 1.2 / 50) * 50], y: [270, 380], aspect: 'wide', xlabel: 'heat added Q (kJ)', ylabel: 'T (K)', alt: 'Temperature of water rising steadily as heat is added', curves: [{ fn: `${T1} + x*1000/${m * C_WATER}`, domain: [0, Q / 1000], color: 'warn', width: 3 }], points: [{ x: 0, y: T1, r: 5, color: 'accent', label: `${t1} °C`, labelDx: 8, labelDy: 12 }, { x: Q / 1000, y: T2, r: 5, color: 'bad', label: `${t2} °C`, labelDx: 8, labelDy: 0 }] }, caption: 'The water’s temperature climbs as heat goes in, so each kilojoule adds a little less entropy than the one before (ΔS = Q/T with a rising T).' },
        };
      },
    }),
    mcq({
      id: 'disorder', difficulty: 2,
      prompt: 'Entropy is often described as “disorder”. Which of these shows that description can mislead?',
      choices: [
        'Supercooled water in an insulated flask suddenly freezes in part into an orderly crystal — and the total entropy still rises',
        'A drop of ink spreads through a glass of water',
        'Air rushes into an evacuated bottle when it is opened',
        'An ice cube melts in a warm drink',
      ],
      answer: 0,
      why: {
        1: 'Here “more disorder” and “more entropy” agree: the ink molecules have vastly more arrangements spread out.',
        2: 'Again they agree: the air has more room, and more arrangements.',
        3: 'Again they agree: the liquid has more arrangements than the crystal, and the heat flowed from hot to cold.',
      },
      hints: ['Look for a spontaneous change in an isolated system that produces something *more* ordered.'],
      teach: t`Entropy counts microscopic arrangements, $S = k_B\ln\Omega$; “disorder” is only a loose picture of that, and it can point the wrong way.`,
      explain: t`When supercooled water freezes in part, the crystal is more ordered — but the latent heat it releases warms the whole flask to 0 °C, and the molecules' extra jiggling gives more arrangements than the crystal took away: the total entropy rises. Entropy counts microstates, $S = k_B\ln\Omega$; “disorder” is a picture of that which works often but not always.`,
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student analyses the free expansion of an ideal gas into a vacuum: “No heat flows, so $\Delta S = \int dQ/T = 0$. The entropy does not change.” What is wrong?`,
      visual: pvPic({ gas: 'air', n: molesOf(200, 2, 300), states: { A: { P: 200, V: 2 }, B: { P: 100, V: 4 } }, paths: [{ from: 'A', legs: [['free', 'B']], label: 'free expansion' }, { from: 'A', legs: [['isothermal', 'B']], label: 'reversible isotherm' }], show: 'all', shade: false, isotherms: false, vrange: [0, 5], prange: [0, 250], caption: 'The free expansion has no path through equilibrium states (dashed). A reversible isotherm joins the same two states (solid).' }),
      choices: [
        t`$\int dQ/T$ gives $\Delta S$ only along a reversible path; along the isotherm joining the same states, $\Delta S = nR\ln(V_2/V_1) > 0$`,
        'Heat does flow in a free expansion, because the gas expands',
        t`$\Delta S$ is negative, because the gas cools`,
        'Entropy cannot be defined for an expanding gas',
      ],
      answer: 0,
      why: {
        1: t`The box is insulated and the gas pushes on nothing: $Q = 0$ and $W = 0$ really are zero.`,
        2: 'An ideal gas does not cool in a free expansion (lesson M18.2), and its entropy rises.',
        3: 'Entropy is a property of the end states, which are perfectly ordinary equilibrium states.',
      },
      hints: [t`Is a free expansion reversible? When is $\Delta S = \int dQ/T$ true?`, 'Find a reversible path between the same two states.'],
      teach: 'Q/T measures entropy only along reversible paths; an irreversible process can create entropy with no heat at all.',
      explain: t`The free expansion is irreversible, so $\int dQ/T$ along it means nothing. Entropy depends only on the end states, and the reversible isotherm between them gives $\Delta S = nR\ln(V_2/V_1) = nR\ln 2 > 0$. Entropy was *created*: that is what irreversible means.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ln2', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([1, 2, 5]), Troom = r.pick([290, 295, 300]);
        const Q = m * LN2.Lv, dSn = Q / LN2.Tb, dSr = -Q / Troom;
        return {
          prompt: t`${m} kg of liquid nitrogen boils away at 77.36 K in an open dewar, absorbing its heat of vaporization (199 kJ/kg) from a lab at ${Troom} K. What is the total entropy change of the nitrogen and the lab?`,
          answer: dSn + dSr, units: 'J/K', tol: { rel: 0.005 },
          errors: [{ value: dSn, feedback: t`That is the nitrogen’s share. The lab loses that heat at its own temperature: add $-Q/T_\text{room}$.` }, { value: dSn - dSr, feedback: t`The lab *loses* heat: its change is $-Q/T_\text{room}$, so add a negative number.` }],
          hints: [t`Nitrogen: $+Q/T_b$. Lab: $-Q/T_\text{room}$.`, t`$Q = mL_v$.`],
          teach: t`Heat flowing into a very cold body creates a great deal of entropy, because $Q/T$ is large when $T$ is small.`,
          explain: t`$Q = ${m}\times199$ kJ $= ${fmt(Q / 1000, 3)}$ kJ. Nitrogen: $+${tex(Q, 3)}\ \text{J}/77.36\ \text{K} = +${fmt(dSn, 4)}$ J/K; lab: $-${tex(Q, 3)}\ \text{J}/${Troom}\ \text{K} = ${fmt(dSr, 4)}$ J/K; total $+${fmt(dSn + dSr, 4)}$ J/K. Each joule that leaks in creates $1/77.36 - 1/${Troom} = ${fmt(1 / 77.36 - 1 / Troom, 3)}$ J/K of entropy, and that is the price of the leak: even a perfect refrigerator needs $T_\text{room}\,\Delta S = ${fmt(Troom / 77.36 - 1, 3)}$ J of work to pump that joule back out to the room, and a real cryocooler several times that.`,
          visual: bodiesPic({ bodies: [{ name: 'the lab', temp: `${Troom} K`, color: 'bad' }, { name: 'liquid nitrogen', temp: '77.36 K', color: 'accent' }], flows: [{ from: 0, to: 1, label: 'Q' }], caption: 'Heat leaks from the room into the boiling nitrogen. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-super-carnot', difficulty: 3,
      gen(r) {
        const Qh = 1000, Th = r.pick([500, 600]), Tc = 300, W = r.pick([450, 520]), Qc = Qh - W;
        const dS = -Qh / Th + Qc / Tc;
        return {
          prompt: t`An inventor's engine is claimed to take ${Qh} J per cycle from a reservoir at ${Th} K, do ${W} J of work, and reject ${Qc} J to a reservoir at ${Tc} K. What is the total entropy change of the two reservoirs per cycle? (The engine itself returns to its state.)`,
          answer: dS, units: 'J/K', tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: Qh / Th + Qc / Tc, feedback: t`The hot reservoir *gives* heat: its change is $-Q_h/T_h$.` }],
          hints: [t`Hot reservoir: $-Q_h/T_h$. Cold reservoir: $+Q_c/T_c$. Engine: 0 over a cycle.`, 'If the total comes out negative, what does the second law say about the claim?'],
          teach: 'Entropy bookkeeping tests any claimed engine: if the reservoirs’ total entropy would fall, the claim is impossible.',
          explain: t`$\Delta S = -\dfrac{${Qh}}{${Th}} + \dfrac{${Qc}}{${Tc}} = ${fmt(-Qh / Th, 3)} + ${fmt(Qc / Tc, 3)} = ${fmt(dS, 3)}$ J/K. ${dS < 0 ? `Negative: the universe's entropy would fall, so the engine cannot exist. Its claimed efficiency, ${Math.round(W / 10)} %, beats the Carnot limit of ${Math.round((1 - Tc / Th) * 100)} %.` : `Positive, so the second law allows it: ${Math.round(W / 10)} % is within the Carnot limit of ${Math.round((1 - Tc / Th) * 100)} %.`}`,
          visual: flowPic({ Qh, Qc, W, labels: { Qh: `Q_h = ${Qh} J`, Qc: `Q_c = ${Qc} J`, W: `W = ${W} J (claimed)`, hot: `hot reservoir, ${Th} K`, cold: `cold reservoir, ${Tc} K` } }),
        };
      },
    }),
    mcq({
      id: 'cp-black-hole', difficulty: 2, transfer: true,
      prompt: 'A box of hot gas falls into a black hole and vanishes behind the event horizon, taking its entropy out of the visible universe. According to Bekenstein’s generalized second law, what happens to the total entropy?',
      choices: [
        'It does not decrease: the black hole’s own entropy, proportional to its horizon area, grows by at least as much',
        'It decreases: black holes are an exception to the second law',
        'It is unchanged, because entropy inside the horizon still counts as part of the universe',
        'It decreases briefly, until Hawking radiation carries the gas’s entropy back out',
      ],
      answer: 0,
      why: {
        1: 'That puzzle is exactly what led Bekenstein (1972) to give black holes an entropy. With it, the second law survives.',
        2: 'Nothing behind the horizon can ever be measured from outside, so that bookkeeping cannot be checked; Bekenstein’s answer gives the horizon itself the entropy.',
        3: 'The generalized second law says the total never decreases, not even for a moment. And Hawking radiation from a stellar black hole would take some 10⁶⁷ years to matter — it has never been observed.',
      },
      hints: ['What did Bekenstein propose a black hole carries, so that the second law keeps holding?'],
      teach: 'In general relativity black holes carry entropy proportional to their horizon area, and the generalized second law says that total plus ordinary entropy never decreases.',
      explain: t`Bekenstein and Hawking found $S_\text{BH} = \dfrac{k_Bc^3A}{4G\hbar}$ — for a black hole of one solar mass, about $10^{54}$ J/K, vastly more than the star that made it. The **generalized second law** says this plus all ordinary entropy never decreases. Status: a theoretical result (Hawking radiation has never been observed), though the related rule that horizon area never decreases has been checked against gravitational-wave signals from merging black holes.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §4.6 Entropy, §4.7 Entropy on a Microscopic Scale', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy' },
    { label: 'Wald, “The Thermodynamics of Black Holes”, Living Rev. Relativ. 4, 6 (2001)', url: 'https://arxiv.org/abs/gr-qc/9912119' },
  ],
});
