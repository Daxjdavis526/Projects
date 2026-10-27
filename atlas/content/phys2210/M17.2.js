// Pressure from molecular collisions: P = ⅓(N/V)m v̄², and with PV = Nk_BT the
// key result — temperature measures the mean translational kinetic energy,
// ½m v̄² = (3/2)k_BT — with v_rms, the speed of sound and the thermosphere.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, KB, NA, MOLAR, apart, sci } from './_thermal.js';
import { logLadder } from './_measure.js';

const t = String.raw;
const mOf = (M) => M / 1000 / NA;                       // kg per molecule
const vrms = (T, M) => Math.sqrt((3 * R * T) / (M / 1000));
const GAS = { He: ['helium', 'He'], N2: ['nitrogen', 'N₂'], O2: ['oxygen', 'O₂'], Ar: ['argon', 'Ar'], CO2: ['carbon dioxide', 'CO₂'] };

// the worked example: nitrogen at 300 K
const EX = { T: 300, M: MOLAR.N2 };
EX.m = mOf(EX.M);                    // 4.652e-26 kg
EX.v = vrms(EX.T, EX.M);             // 516.8 m/s
EX.sound = Math.sqrt((1.4 * R * EX.T) / (EX.M / 1000));   // 353 m/s

/** A molecule meeting a wall: velocity before and after (a picture for the impulse item). */
const bouncePic = (v) => ({
  type: 'graph',
  params: {
    x: [-0.5, 5.6], y: [-1.3, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    alt: 'A molecule bouncing straight back off a wall',
    shade: [{ fn: '1.3', lower: '-1.1', from: 4.6, to: 4.95, color: 'ink3', alpha: 0.6 }],
    arrows: [{ from: [0.6, 0.55], to: [3.6, 0.55], color: 'accent', label: `before: ${v} m/s →`, labelDx: -150, labelDy: -14 }, { from: [3.6, -0.45], to: [0.6, -0.45], color: 'warn', label: `after: ${v} m/s ←`, labelDx: 4, labelDy: 16 }],
    points: [{ x: 4.3, y: 0.55, r: 7, color: 'accent' }, { x: 4.3, y: -0.45, r: 7, color: 'warn' }, { x: 4.75, y: 1.42, r: 0.01, color: 'ink2', label: 'wall', labelDx: -12, labelDy: 0 }],
  },
  caption: 'A head-on elastic bounce: the speed is unchanged, the direction reversed. Not to scale.',
});

export default lesson({
  id: 'phys2210.M17.2',
  title: 'Pressure from molecular collisions',
  minutes: 11, difficulty: 3,
  intro: t`Why does a gas push on its container? Each molecule that hits a wall bounces back, and the wall must supply the impulse that reverses its momentum — so, by Newton’s third law, the molecule pushes the wall. Add up some $10^{27}$ impacts per second on every square metre and you get a steady pressure:

$$P = \frac13\,\frac{N}{V}\,m\overline{v^2}$$

Set this beside $PV = Nk_BT$ and out falls one of the deepest results in physics: **temperature measures the average translational kinetic energy of the molecules**,

$$\tfrac12 m\overline{v^2} = \tfrac32 k_BT.$$`,
  symbols: [
    { tex: 'P', text: 'the pressure on the walls, in pascals (Pa)' },
    { tex: 'N/V', text: 'the number density: molecules per cubic metre (m⁻³) — about $2.5\\times10^{25}$ in air at sea level' },
    { tex: 'm', text: 'the mass of one molecule, in kg: the molar mass divided by $N_A$ — $4.65\\times10^{-26}$ kg for N₂' },
    { tex: '\\overline{v^2}', text: 'the mean of the squared speed over all the molecules, in m²/s². Its square root is the root-mean-square speed $v_\\text{rms}$' },
    { tex: '\\tfrac13', text: 'the share of the motion along any one direction: with no preferred direction, $\\overline{v_x^2} = \\overline{v_y^2} = \\overline{v_z^2} = \\tfrac13\\overline{v^2}$' },
    { tex: 'v_\\text{rms} = \\sqrt{3k_BT/m} = \\sqrt{3RT/M}', text: 'the root-mean-square speed, in m/s; $M$ is the molar mass in **kg**/mol' },
    { tex: 'k_B', text: 'Boltzmann’s constant, $1.381\\times10^{-23}$ J/K; $T$ is the absolute temperature' },
  ],
  why: 'It turns temperature from a thermometer reading into a statement about molecules — and gives the molecular speeds that set the speed of sound and the exhaust speed of a cold-gas thruster.',
  visual: {
    type: 'therm-gas',
    title: 'Watch the impacts make the pressure',
    lead: t`Every gold ring on the right-hand wall is one impact. The pressure (gold bar) is the impulse those impacts deliver per second per square metre, and the readouts show the dots’ mean kinetic energy and $v_\text{rms}$. Change one thing at a time and ask: **more impacts, harder impacts, or both?**`,
    tasks: [
      'Double the number of molecules: twice as many impacts, each just as hard — twice the pressure.',
      'Raise T from 150 K to 600 K: every molecule moves twice as fast, so each impact is twice as hard and they come twice as often — four times the pressure.',
      'Switch nitrogen for helium at the same T: faster, more frequent, softer impacts. The mean kinetic energy and the pressure do not change.',
    ],
    params: { gas: 'N2', gases: ['He', 'N2', 'Xe'], controls: ['T', 'V', 'N', 'gas', 'play'], T: 300, Tmin: 100, Tmax: 600, hist: false, readouts: ['T', 'KE', 'vrms', 'P', 'Pideal'] },
    caption: 'Each dot stands for about 1.2 × 10²⁰ molecules, enormously enlarged and slowed — all in proportion. Collisions are perfectly elastic. The dots’ own size pushes the measured pressure 1–4 % above nRT/V; real gases near room conditions miss it by under 0.1 %.',
  },
  example: {
    prompt: t`Show where $P = \tfrac13(N/V)m\overline{v^2}$ comes from, by following molecules bouncing in a cubic box of side $L$. Then find $v_\text{rms}$ for nitrogen at ${EX.T} K.`,
    visual: bouncePic(500),
    steps: [
      { label: 'One molecule, one wall', text: t`A molecule with $x$-velocity $v_x$ hits the wall at $x = L$ and bounces back: its momentum changes by $2mv_x$. It returns after a round trip of $2L$, taking $2L/v_x$. So on average it pushes that wall with a force $\dfrac{2mv_x}{2L/v_x} = \dfrac{mv_x^2}{L}$.` },
      { label: 'All the molecules', text: t`Adding up all $N$: $F = \dfrac{Nm\overline{v_x^2}}{L}$, and the pressure is $P = F/L^2 = \dfrac{N}{V}m\overline{v_x^2}$. Collisions between molecules only trade momentum among them, so they do not change the total.` },
      { label: 'No preferred direction', text: t`Since $v^2 = v_x^2 + v_y^2 + v_z^2$ and no direction is special, $\overline{v_x^2} = \tfrac13\overline{v^2}$: **$P = \tfrac13\dfrac{N}{V}m\overline{v^2}$**.` },
      { label: 'Meaning of temperature', text: t`Compare with $PV = Nk_BT$: $\tfrac13 m\overline{v^2} = k_BT$, so $\tfrac12 m\overline{v^2} = \tfrac32 k_BT$. Temperature *is* a measure of the mean translational kinetic energy per molecule.` },
      { label: 'Nitrogen at 300 K', text: t`$m = \dfrac{0.02801\ \text{kg/mol}}{6.022\times10^{23}\ \text{mol}^{-1}} = ${sci(EX.m, 4)}$ kg, so $v_\text{rms} = \sqrt{\dfrac{3k_BT}{m}} = \sqrt{\dfrac{3(1.381\times10^{-23})(300)}{${sci(EX.m, 4)}}} = ${fmt(EX.v, 4)}$ m/s.` },
      { label: 'Sense check', text: t`About 1900 km/h — faster than the speed of sound in nitrogen, ${Math.round(EX.sound)} m/s, as it must be: a sound wave is carried by the molecules themselves and cannot outrun them.` },
    ],
    answer: t`$P = \tfrac13(N/V)m\overline{v^2}$, which means $\tfrac12m\overline{v^2} = \tfrac32k_BT$; for N₂ at 300 K, $v_\text{rms} \approx ${Math.round(EX.v)}$ m/s.`,
  },
  practice: [
    mcq({
      id: 'why-pressure', difficulty: 1,
      prompt: 'What exerts the force that a gas puts on the walls of its container?',
      choices: [
        'Molecules bouncing off the walls, each reversing its momentum',
        'The molecules repelling one another, pushing outward on the walls',
        'The weight of the gas pressing down',
        'Heat, which pushes outward from the hot gas',
      ],
      answer: 0,
      why: {
        1: 'In an ideal gas the molecules do not push on one another at a distance at all; they interact only in brief collisions.',
        2: 'Gas pushes just as hard on the ceiling and the sides as on the floor. The weight of a litre of air (about 0.012 N) is nothing next to the 1000 N it pushes on a 10 cm × 10 cm face.',
        3: 'Heat is energy in transit, not a force. The push comes from momentum delivered by impacts.',
      },
      hints: ['When a ball bounces off a wall, what must the wall do to it — and what does the ball do to the wall?'],
      teach: 'Gas pressure is the average force per area of countless molecular impacts on the walls.',
      explain: 'Each impact reverses a molecule’s momentum; the wall supplies that impulse and, by Newton’s third law, receives an equal and opposite one. With some 10²⁷ impacts per second on each square metre, the impulses blur into a steady force: the pressure.',
      visual: { type: 'therm-gas', params: { gas: 'N2', T: 300, hist: false, gauge: false, tag: 'nitrogen' }, caption: 'Molecules (enlarged and slowed) and their impacts on the right-hand wall, marked by gold rings.' },
    }),
    num({
      id: 'impulse', difficulty: 2,
      gen(r) {
        const v = r.pick([300, 400, 500, 600]);
        const J = 2 * mOf(MOLAR.N2) * v;
        return {
          prompt: t`A nitrogen molecule ($m = 4.65\times10^{-26}$ kg) moving at ${v} m/s hits a wall head-on and bounces straight back at the same speed. What impulse does it deliver to the wall?`,
          answer: J, units: 'N s', tol: { rel: 0.01 },
          errors: [{ value: J / 2, feedback: 'The momentum doesn’t just drop to zero: it reverses, from +mv to −mv. The change is 2mv.' }],
          hints: ['Impulse = change of momentum.', t`Before: $+mv$; after: $-mv$. The change has size $2mv$.`],
          teach: 'A head-on elastic bounce reverses the momentum, so the impulse is 2mv.',
          explain: t`$J = 2mv = 2(4.65\times10^{-26})(${v}) = ${sci(J, 3)}$ N·s. Tiny — but air delivers about $10^{27}$ such impacts per square metre every second.`,
          visual: bouncePic(v),
        };
      },
    }),
    num({
      id: 'vrms', difficulty: 2,
      gen(r) {
        const key = r.pick(['He', 'N2', 'O2', 'Ar', 'CO2']), T = r.pick([77, 150, 300, 500]), M = MOLAR[key];
        const v = vrms(T, M);
        return {
          prompt: t`What is the root-mean-square speed of ${GAS[key][0]} molecules (${GAS[key][1]}, $M = ${fmt(M, 4)}$ g/mol) at ${T} K?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([
            { value: Math.sqrt((3 * R * T) / M), feedback: 'The molar mass must be in kg/mol: divide by 1000 first.' },
            { value: Math.sqrt((2 * R * T) / (M / 1000)), feedback: 'That is √(2RT/M), the most probable speed (lesson M17.3). The rms speed has a 3.' },
          ], v),
          hints: [t`$v_\text{rms} = \sqrt{3RT/M}$, with $M$ in kg/mol.`, t`$M = ${fmt(M / 1000, 4)}$ kg/mol.`],
          teach: '$v_\\text{rms} = \\sqrt{3RT/M}$: faster for hotter and for lighter molecules.',
          explain: t`$v_\text{rms} = \sqrt{\dfrac{3(8.314)(${T})}{${fmt(M / 1000, 4)}}} = ${fmt(v, 4)}$ m/s.`,
          visual: { type: 'therm-gas', params: { gas: key, T, hist: true, gauge: false, curve: false, tag: `${GAS[key][1]} at ${T} K` }, caption: 'The molecules in a box and a live histogram of their speeds (a model: enlarged and slowed, all in proportion).' },
        };
      },
    }),
    num({
      id: 'ke-molecule', difficulty: 1,
      gen(r) {
        const Tc = r.pick([-40, 0, 25, 100]);
        const KE = 1.5 * KB * (Tc + 273.15);
        return {
          prompt: t`What is the mean translational kinetic energy of a gas molecule at $${Tc}$ °C?`,
          answer: KE, units: 'J', tol: { rel: 0.01 },
          errors: apart([
            { value: KB * (Tc + 273.15), feedback: t`That is $k_BT$. The mean translational kinetic energy is $\tfrac32k_BT$.` },
            { value: Tc === 0 ? NaN : 1.5 * KB * Math.abs(Tc), feedback: 'Use the absolute temperature: add 273.15.' },
          ], KE),
          hints: [t`$\langle\tfrac12mv^2\rangle = \tfrac32k_BT$ with $T$ in kelvin.`],
          teach: 'The mean translational kinetic energy per molecule is (3/2)k_BT, for every gas.',
          explain: t`$\tfrac32(1.381\times10^{-23})(${(Tc + 273.15).toFixed(2)}) = ${sci(KE, 3)}$ J — the same for helium, nitrogen or xenon at this temperature.`,
          visual: { type: 'therm-gas', params: { gas: 'N2', T: Tc + 273.15, hist: false, gauge: false, tag: `a gas at ${String(Tc).replace('-', '−')} °C` }, caption: 'Gas molecules in a box (a model: enlarged and slowed, all in proportion).' },
        };
      },
    }),
    mcq({
      id: 'same-T', difficulty: 2,
      prompt: 'A mixture of helium and xenon is in equilibrium at 300 K. Compared with a xenon atom, a typical helium atom has:',
      choices: [
        'The same mean kinetic energy, but about 5.7 times the rms speed',
        'The same speed, since both are at the same temperature',
        'Less kinetic energy, because it is lighter',
        'About 33 times the kinetic energy, because it is so much faster',
      ],
      answer: 0,
      why: {
        1: 'Temperature fixes the mean *kinetic energy*, not the speed. With a mass 33 times smaller, helium must move faster to carry the same energy.',
        2: 'Lighter, yes — but faster in exact compensation: ½mv² comes out the same.',
        3: 'Its speed is about 5.7 times larger, so its v² is 33 times larger — exactly cancelling its 33-times-smaller mass.',
      },
      hints: [t`At equilibrium, $\tfrac12m\overline{v^2} = \tfrac32k_BT$ for every species.`, t`So $v_\text{rms} \propto 1/\sqrt{m}$, and $\sqrt{131.3/4.003} = 5.7$.`],
      teach: 'At one temperature every kind of molecule has the same mean translational kinetic energy, so lighter ones move faster.',
      explain: t`Equal $\tfrac12m\overline{v^2}$ means $v_\text{rms}\propto 1/\sqrt m$: $\sqrt{131.29/4.003} = 5.73$. Helium atoms at 300 K average 1370 m/s; xenon atoms, 239 m/s.`,
      visual: { type: 'therm-gas', params: { gas: 'He+Xe', T: 300, hist: true, gauge: false, tag: 'helium and xenon, mixed' }, caption: 'A helium–xenon mixture (a model: enlarged and slowed, all in proportion) with each gas’s speed histogram.' },
    }),
    num({
      id: 'thermosphere', difficulty: 3,
      gen(r) {
        const n = r.pick([2e14, 5e14, 1e15]), T = 1000, m = mOf(MOLAR.O);
        const v = vrms(T, MOLAR.O), P = (n * m * v * v) / 3;
        return {
          prompt: t`At the International Space Station’s altitude, about 400 km, the thin air is mostly oxygen atoms ($m = 2.66\times10^{-26}$ kg) at roughly 1000 K, with a number density of about $${sci(n, 1)}$ m⁻³, depending on solar activity. Their rms speed is ${Math.round(v)} m/s. What pressure do they exert?`,
          answer: P, units: 'Pa', tol: { rel: 0.01 },
          errors: apart([
            { value: n * m * v * v, feedback: t`Don’t forget the $\tfrac13$: only the motion along one direction pushes on a given wall.` },
            { value: (n * m * v) / 3, feedback: 'The speed is squared: faster molecules hit both harder and more often.' },
          ], P),
          hints: [t`$P = \tfrac13\dfrac{N}{V}m\overline{v^2}$, with $\overline{v^2} = v_\text{rms}^2$.`, t`Check with $P = (N/V)k_BT$: it must agree.`],
          teach: 'The kinetic formula P = ⅓(N/V)m v̄² and the ideal gas law P = (N/V)k_BT are the same statement.',
          explain: t`$P = \tfrac13(${sci(n, 1)})(2.66\times10^{-26})(${Math.round(v)})^2 = ${sci(P, 3)}$ Pa, and $(N/V)k_BT = ${sci(n * KB * T, 3)}$ Pa agrees. Roughly a ten-billionth of an atmosphere — yet at 7.7 km/s it is enough drag to make the ISS lose altitude steadily.`,
          visual: logLadder([
            { label: 'sea level, 101 kPa', value: 101325 },
            { label: 'summit of Everest, about 34 kPa', value: 34000 },
            { label: 'surface of Mars, about 600 Pa', value: 600 },
            { label: 'a good laboratory vacuum, 10⁻⁵ Pa', value: 1e-5, color: 'gold' },
          ], { from: -7, to: 6, rungs: false, caption: 'Pressures on a logarithmic scale, in pascals. Labels sit just above their dots.' }),
        };
      },
    }),
    mcq({
      id: 'quadruple-T', difficulty: 2,
      prompt: 'If the absolute temperature of a gas is quadrupled, the rms speed of its molecules:',
      choices: ['Doubles', 'Quadruples', 'Increases sixteenfold', 'Stays the same'],
      answer: 0,
      why: {
        1: t`Kinetic energy quadruples, but kinetic energy goes as $v^2$: the speed only doubles.`,
        2: 'That would need T to rise as v⁴. It is the other way round: v grows as √T.',
        3: 'Temperature is a measure of the molecules’ kinetic energy: a hotter gas has faster molecules.',
      },
      hints: [t`$v_\text{rms} = \sqrt{3k_BT/m}$. Replace $T$ with $4T$.`],
      teach: '$v_\\text{rms}$ grows as the square root of the absolute temperature.',
      explain: t`$\sqrt{4T} = 2\sqrt{T}$: the mean kinetic energy quadruples, the rms speed doubles. Nitrogen at 1200 K moves at about 1030 m/s, twice its 300 K value.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 1300], y: [0, 3], aspect: 'wide', xlabel: 'T (K)', ylabel: '⟨½mv²⟩ (10⁻²⁰ J)',
          alt: 'Mean molecular kinetic energy rising in proportion to absolute temperature',
          curves: [{ fn: `1.5*${KB}*x*1e20`, domain: [0, 1300], color: 'accent', width: 2.6, label: '⟨½mv²⟩ = (3/2)k_B T', labelAt: 450, labelDx: 8, labelDy: -12 }],
          vlines: [{ x: 300, label: 'T', color: 'ink3' }, { x: 1200, label: '4T', color: 'ink3' }],
        },
        caption: 'The mean translational kinetic energy per molecule is proportional to the absolute temperature — for every gas.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sound', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([150, 200, 300]), M = MOLAR.He;
        const vs = Math.sqrt(((5 / 3) * R * T) / (M / 1000));
        return {
          prompt: t`A pressure wave travels through the helium pressurant in a propellant feed system at ${T} K. The speed of sound in an ideal gas is $v_s = \sqrt{\gamma RT/M}$, with $\gamma = 5/3$ for helium. What is $v_s$?`,
          answer: vs, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([
            { value: Math.sqrt((R * T) / (M / 1000)), feedback: t`Include $\gamma = 5/3$ under the square root.` },
            { value: Math.sqrt(((5 / 3) * R * T) / M), feedback: 'Use the molar mass in kg/mol: 4.003 g/mol = 0.004003 kg/mol.' },
            { value: vrms(T, M), feedback: 'That is the rms speed of the atoms, √(3RT/M). Sound travels a little slower: √(γRT/M).' },
          ], vs),
          hints: [t`$M = 4.003\times10^{-3}$ kg/mol.`, t`$v_s = \sqrt{(5/3)(8.314)(${T})/0.004003}$.`],
          teach: 'Sound in a gas travels at √(γRT/M), a fixed fraction of the molecules’ rms speed.',
          explain: t`$v_s = ${fmt(vs, 4)}$ m/s, while the atoms’ rms speed is $${fmt(vrms(T, M), 4)}$ m/s: the ratio is $\sqrt{\gamma/3} = 0.745$ at any temperature. Pressure waves in helium lines run about three times faster than in nitrogen at the same temperature — which matters for the pressure surges when valves slam shut in feed lines.`,
          visual: { type: 'therm-gas', params: { gas: 'He', T, hist: true, gauge: false, tag: `helium at ${T} K` }, caption: 'Helium atoms (a model: enlarged and slowed) and the spread of their speeds. Sound is carried by these atoms, so it cannot outrun them.' },
        };
      },
    }),
    mcq({
      id: 'cp-one-third', difficulty: 2,
      prompt: t`In the derivation of $P = \tfrac13(N/V)m\overline{v^2}$, where does the factor $\tfrac13$ come from?`,
      choices: [
        'Only the x-part of the motion pushes on a wall facing x, and on average it is one third of v²',
        'At any moment only a third of the molecules are heading for a given wall',
        'Each molecule hits three walls in turn, sharing its momentum among them',
        t`It is the same $\tfrac32$ as in $\tfrac32k_BT$, turned upside down`,
      ],
      answer: 0,
      why: {
        1: 'Directions are not shared out in thirds of the molecules: every molecule has some x-motion. What is shared is v² among its three components.',
        2: 'A molecule does bounce off all the walls, but the force on each wall was computed from $v_x$ alone — the bookkeeping of the other walls is separate.',
        3: t`The $\tfrac32$ comes out *of* the $\tfrac13$ (together with the $\tfrac12$ of kinetic energy), not the other way round.`,
      },
      teach: 'With no preferred direction, the squared speed splits equally among x, y and z: v̄ₓ² = v̄²/3.',
      hints: [t`$v^2 = v_x^2 + v_y^2 + v_z^2$.`],
      explain: t`A wall facing $x$ feels only $v_x$, giving $P = (N/V)m\overline{v_x^2}$. Because $v^2 = v_x^2 + v_y^2 + v_z^2$ and no direction is special, each average is a third of $\overline{v^2}$.`,
      visual: bouncePic(500),
    }),
    num({
      id: 'cp-total-ke', difficulty: 2,
      gen(r) {
        const V = r.pick([0.05, 0.2, 1]), P = r.pick([101, 200, 500]);
        const K = 1.5 * P * V;
        return {
          prompt: t`A tank of ${V} m³ holds gas at ${P} kPa. What is the total translational kinetic energy of all its molecules?`,
          answer: K, units: 'kJ', tol: { rel: 0.01 },
          errors: [{ value: P * V, feedback: t`That is $PV$, which equals $Nk_BT$. The kinetic energy is $\tfrac32 Nk_BT$.` }],
          hints: [t`Total kinetic energy $= N\cdot\tfrac32k_BT$.`, t`And $Nk_BT = PV$.`],
          teach: 'The total translational kinetic energy of an ideal gas is (3/2)PV — whatever the gas or its temperature.',
          explain: t`$K = \tfrac32Nk_BT = \tfrac32PV = 1.5\times(${P}\times10^{3}\ \text{Pa})(${V}\ \text{m}^3) = ${fmt(K, 3)}$ kJ. You never needed $T$ or the kind of gas.`,
          visual: { type: 'therm-gas', params: { gas: 'N2', T: 300, hist: false, gauge: true, tag: 'a tank of gas' }, caption: 'Gas molecules in a box and the pressure their impacts make (a model: enlarged and slowed, all in proportion).' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §2.2 Pressure, Temperature, and RMS Speed', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-2-pressure-temperature-and-rms-speed' },
    { label: 'NIST: CODATA values of k_B and N_A (exact since 2019)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
