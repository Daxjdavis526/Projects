// Molecular speeds and the Maxwell–Boltzmann distribution: not one speed but
// a spread, its three characteristic speeds, its fast tail — with boil-off gas,
// atmospheric escape and cold-gas thrusters.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, MOLAR, LN2, LOX, vpOf, mbGraph, apart } from './_thermal.js';

const t = String.raw;
const vbar = (T, M) => Math.sqrt((8 * R * T) / (Math.PI * (M / 1000)));
const vrms = (T, M) => Math.sqrt((3 * R * T) / (M / 1000));
const NAME = { H2: ['hydrogen', 'H₂'], He: ['helium', 'He'], N2: ['nitrogen', 'N₂'], O2: ['oxygen', 'O₂'], Ar: ['argon', 'Ar'], CO2: ['carbon dioxide', 'CO₂'], Xe: ['xenon', 'Xe'] };

// the worked example: nitrogen boil-off gas at 77.36 K, against room temperature
const EX = { T: LN2.Tb, M: MOLAR.N2 };
EX.vp = vpOf(EX.T, EX.M); EX.vb = vbar(EX.T, EX.M); EX.vr = vrms(EX.T, EX.M);
EX.k = Math.sqrt(300 / EX.T);

// the share of nitrogen molecules faster than 1000 m/s at 300 K, by Simpson's rule on the MB density
const VP300 = vpOf(300, MOLAR.N2);
const TAIL = (() => {
  const f = (v) => ((4 / Math.sqrt(Math.PI)) * v * v * Math.exp(-(v * v) / (VP300 * VP300))) / VP300 ** 3;
  const a = 1000, b = 9000, n = 20000, h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
})();

export default lesson({
  id: 'phys2210.M17.3',
  title: 'Molecular speeds and the Maxwell–Boltzmann distribution',
  minutes: 12, difficulty: 3,
  intro: t`At one temperature, the molecules of a gas do **not** all move at one speed. Collisions constantly trade energy among them, and the speeds settle into a spread found by Maxwell and Boltzmann:

$$f(v) = 4\pi\left(\frac{m}{2\pi k_BT}\right)^{3/2} v^2\, e^{-mv^2/2k_BT}$$

$f(v)\,dv$ is the fraction of molecules with speeds between $v$ and $v + dv$. The curve rises from zero, peaks at the **most probable speed** $v_p = \sqrt{2k_BT/m}$, and has a long tail of fast molecules; the mean speed and the rms speed sit a little beyond the peak, in the fixed ratio $v_p : \bar v : v_\text{rms} = 1 : 1.128 : 1.225$. Hotter or lighter gases spread to higher speeds.`,
  symbols: [
    { tex: 'f(v)', text: 'the speed distribution, in s/m: the fraction of molecules per unit of speed. The area under the whole curve is 1' },
    { tex: 'v', text: 'molecular speed, in m/s' },
    { tex: 'm', text: 'the mass of one molecule, in kg (molar mass ÷ $N_A$)' },
    { tex: 'k_BT', text: 'Boltzmann’s constant times the absolute temperature: the energy scale of the random motion' },
    { tex: 'e^{-mv^2/2k_BT}', text: 'the Boltzmann factor: states with kinetic energy much larger than $k_BT$ are exponentially rare — the tail' },
    { tex: '4\\pi v^2', text: 'how many ways there are to have speed $v$: velocities with that speed fill a spherical shell of area $4\\pi v^2$, so very slow molecules are rare too' },
    { tex: 'v_p,\\ \\bar v,\\ v_\\text{rms}', text: 'the most probable, mean and root-mean-square speeds: $\\sqrt{2k_BT/m}$, $\\sqrt{8k_BT/\\pi m}$ and $\\sqrt{3k_BT/m}$' },
  ],
  why: 'The fast tail decides which gases a planet keeps, how fast reactions and evaporation run, and — through the molecular speeds — how fast sound travels and how hard a cold-gas thruster can push.',
  visual: {
    type: 'therm-gas',
    title: 'Start every molecule at one speed — and watch',
    lead: t`The bars are a live histogram of the molecules’ speeds; the curve is Maxwell–Boltzmann at the box’s temperature. Press **All one speed**: every molecule gets the *same* speed, with the total energy — and so the temperature — unchanged. Then watch the collisions.`,
    tasks: [
      'Press All one speed: the histogram becomes a single spike. Within a few seconds collisions spread it back into the Maxwell–Boltzmann shape — at the same temperature.',
      'Switch to helium and read the speed axis: the same shape, at about 2.6 times the speeds of nitrogen. Xenon’s sits at less than half of nitrogen’s.',
      'Raise T: the peak moves right as √T and gets lower; the fast tail grows fastest of all.',
    ],
    params: { gas: 'N2', gases: ['He', 'N2', 'Xe'], controls: ['T', 'gas', 'start'], T: 300, Tmin: 50, Tmax: 600, hist: true, marks: true, gauge: false, readouts: ['T', 'vrms'] },
    caption: 'A model: 200 hard-sphere molecules, enormously enlarged and slowed, all in proportion; collisions perfectly elastic. With only 200 molecules the histogram jitters about the curve — the running average helps. Real gases have some 10²² molecules per litre and fit the curve exactly.',
  },
  example: {
    prompt: t`Nitrogen boil-off gas leaves a dewar at ${EX.T} K. Find its most probable, mean and rms molecular speeds, and compare them with nitrogen at 300 K.`,
    visual: mbGraph({ curves: [{ T: EX.T, M: EX.M, label: '77.4 K', color: 'accent' }, { T: 300, M: EX.M, label: '300 K', color: 'warn' }], marks: [{ v: EX.vp, label: 'vₚ' }], caption: 'Nitrogen at 77.4 K and at 300 K. The cold gas is bunched at lower speeds with a taller peak; both curves enclose the same area.' }),
    steps: [
      { label: 'Molar mass in SI', text: t`$M = 28.01$ g/mol $= 0.02801$ kg/mol, and $k_BT/m = RT/M$.` },
      { label: 'Most probable', text: t`$v_p = \sqrt{2RT/M} = \sqrt{2(8.314)(${EX.T})/0.02801} = ${fmt(EX.vp, 3)}$ m/s — the peak of the curve.` },
      { label: 'Mean and rms', text: t`$\bar v = \sqrt{8RT/\pi M} = ${fmt(EX.vb, 3)}$ m/s and $v_\text{rms} = \sqrt{3RT/M} = ${fmt(EX.vr, 3)}$ m/s: always in the ratio $1 : 1.128 : 1.225$, because the fast tail pulls the averages above the peak — and pulls the rms, which squares speeds, furthest.` },
      { label: 'Compare with 300 K', text: t`Speeds scale as $\sqrt T$: $\sqrt{300/77.36} = ${fmt(EX.k, 3)}$, so at room temperature every speed is about twice as large: $v_p = ${fmt(EX.vp * EX.k, 3)}$ m/s.` },
      { label: 'Sense check', text: t`A quarter of a kilometre per second, even at 77 K — the cold gas is far from still. The distribution’s *shape* never changes; temperature and mass only stretch it along the speed axis.` },
    ],
    answer: t`At 77.4 K: $v_p \approx ${Math.round(EX.vp)}$ m/s, $\bar v \approx ${Math.round(EX.vb)}$ m/s, $v_\text{rms} \approx ${Math.round(EX.vr)}$ m/s — about half the 300 K values.`,
  },
  practice: [
    mcq({
      id: 'one-speed', difficulty: 1,
      prompt: 'A balloon of nitrogen sits in equilibrium at 300 K. What can you say about the speeds of its molecules?',
      choices: [
        'They are spread out, from nearly zero to several times the most probable speed',
        'They all move at the rms speed, 517 m/s',
        'They all move at the speed of sound in nitrogen',
        'They are all nearly at rest, since the balloon is not moving',
      ],
      answer: 0,
      why: {
        1: 'The rms speed is a kind of average over a wide spread. Collisions keep reshuffling energy, so the speeds never stay equal — Explore shows a single spike falling apart within seconds.',
        2: 'Sound is carried by the molecules, but it travels slower than most of them; and the molecules have no single speed to begin with.',
        3: 'The balloon as a whole is at rest because the molecules’ *velocities* point every which way and average to zero. Their *speeds* average hundreds of metres per second.',
      },
      hints: ['Temperature fixes the *average* kinetic energy. Does it fix every molecule’s speed?'],
      teach: 'At a given temperature the molecular speeds follow the Maxwell–Boltzmann distribution: a broad spread, not one speed.',
      explain: t`The speeds follow the Maxwell–Boltzmann distribution: few very slow, most a few hundred m/s, and a tail of fast ones. At 300 K about 1 % of nitrogen molecules exceed 1000 m/s.`,
    }),
    num({
      id: 'vp-scale', difficulty: 2,
      gen(r) {
        const key = r.pick(['H2', 'He', 'Ar', 'CO2', 'Xe']), M = MOLAR[key];
        const v = vpOf(300, MOLAR.N2) * Math.sqrt(MOLAR.N2 / M);
        return {
          prompt: t`At 300 K the Maxwell–Boltzmann curve for nitrogen (28.01 g/mol) peaks at 422 m/s. Where does the curve for ${NAME[key][0]} (${NAME[key][1]}, ${fmt(M, 4)} g/mol) peak at the same temperature?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([
            { value: 422 * (MOLAR.N2 / M), feedback: 'Speeds go as 1/√m, not 1/m: take the square root of the mass ratio.' },
            { value: 422 * Math.sqrt(M / MOLAR.N2), feedback: 'Upside down: lighter molecules are *faster*. Multiply by √(28.01/M).' },
          ], v),
          hints: [t`$v_p = \sqrt{2k_BT/m} \propto 1/\sqrt{m}$ at fixed $T$.`, t`$v_p = 422\ \text{m/s}\times\sqrt{28.01/${fmt(M, 4)}}$.`],
          teach: 'At a fixed temperature every molecular speed scales as 1/√m.',
          explain: t`$422\times\sqrt{28.01/${fmt(M, 4)}} = ${fmt(v, 3)}$ m/s. (Directly: $\sqrt{2RT/M} = ${fmt(vpOf(300, M), 3)}$ m/s.)`,
          visual: mbGraph({ curves: [{ T: 300, M: MOLAR.N2, label: 'N₂ at 300 K', color: 'accent' }], vmax: Math.max(1500, Math.ceil((3.2 * v) / 100) * 100), marks: [{ v: 422, label: '422 m/s' }], caption: 'The Maxwell–Boltzmann curve for nitrogen at 300 K, peaking at 422 m/s. Your gas’s curve has the same shape, stretched or squeezed along the speed axis.' }),
        };
      },
    }),
    mcq({
      id: 'heavier-curve', difficulty: 2,
      prompt: 'The graph shows the speed distributions of two different gases at the same temperature. Which gas has the heavier molecules?',
      choices: ['P: its curve is narrower and peaks at a lower speed', 'Q: its curve reaches higher speeds, so its molecules carry more momentum', 'Q: its peak is lower', 'Neither can be told apart: the curves could just be different temperatures'],
      answer: 0,
      why: {
        1: 'Reaching higher speeds is the mark of *lighter* molecules: at the same temperature they need more speed to carry the same kinetic energy.',
        2: 'Q’s peak is lower because its curve is spread over more speeds — the area is always 1. That spreading comes from light molecules.',
        3: 'Different temperatures could also stretch the curves — but the question fixes the temperature, so only the mass is left to differ.',
      },
      hints: [t`At fixed $T$, $v_p = \sqrt{2k_BT/m}$. Which curve has the smaller $v_p$?`],
      teach: 'At one temperature heavier molecules have a narrower distribution peaked at lower speed.',
      explain: t`P peaks near 350 m/s and Q near 1100 m/s. Since $v_p \propto 1/\sqrt m$, P’s molecules are about $(1100/350)^2 \approx 10$ times heavier: argon (40 g/mol) against helium (4 g/mol).`,
      visual: mbGraph({ curves: [{ T: 300, M: MOLAR.Ar, label: 'P', color: 'warn' }, { T: 300, M: MOLAR.He, label: 'Q', color: 'accent', labelAt: 1500 }], vmax: 3500, caption: 'Speed distributions of two gases at the same temperature.' }),
    }),
    num({
      id: 'same-vrms', difficulty: 2,
      gen(r) {
        const T0 = r.pick([77.36, 90.19, 300]);
        const T = (T0 * MOLAR.He) / MOLAR.N2;
        return {
          prompt: t`At what temperature do helium atoms have the same rms speed as nitrogen molecules at ${T0} K?`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: apart([
            { value: (T0 * MOLAR.N2) / MOLAR.He, feedback: 'Upside down: helium atoms are lighter, so they reach the same speed at a *lower* temperature.' },
            { value: T0 * Math.sqrt(MOLAR.He / MOLAR.N2), feedback: t`$v_\text{rms}^2 \propto T/M$: equal speeds need $T/M$ equal, without a square root.` },
          ], T),
          hints: [t`$v_\text{rms} = \sqrt{3RT/M}$: equal speeds need equal $T/M$.`, t`$T_\text{He} = ${T0}\ \text{K}\times\dfrac{4.003}{28.01}$.`],
          teach: 'Equal rms speeds need equal T/M: a light gas reaches a given speed at a lower temperature.',
          explain: t`$T_\text{He} = T_{\text{N}_2}\,\dfrac{M_\text{He}}{M_{\text{N}_2}} = ${T0}\times\dfrac{4.003}{28.01} = ${fmt(T, 3)}$ K.`,
          visual: mbGraph({ curves: [{ T: T0, M: MOLAR.N2, label: `N₂ at ${T0} K`, color: 'accent' }, { T: T0, M: MOLAR.He, label: `He at ${T0} K`, color: 'warn', labelAt: 1.4 * vpOf(T0, MOLAR.He) }], caption: 'Nitrogen and helium at the same temperature: the helium curve stretches much further. To match nitrogen, helium must be colder.' }),
        };
      },
    }),
    num({
      id: 'tail', difficulty: 3,
      prompt: t`What fraction of nitrogen molecules at 300 K move faster than 1000 m/s? Integrate the Maxwell–Boltzmann distribution, or use its closed form: the fraction faster than $v$ is $\operatorname{erfc}(x) + \tfrac{2}{\sqrt\pi}\,x\,e^{-x^2}$ with $x = v/v_p$ and $v_p = 422.0$ m/s. (Python has \`math.erfc\`.) Give a decimal.`,
      answer: TAIL, tol: { rel: 0.02 },
      vars: { v: [0, 5000] }, integrand: `4/sqrt(pi)*v^2/${VP300.toFixed(6)}^3*exp(-v^2/${VP300.toFixed(6)}^2)`, limits: [1000, 'inf'],
      errors: [{ value: 1 - TAIL, feedback: 'That is the share *slower* than 1000 m/s. The question asks for the tail above it.' }],
      hints: [t`$x = 1000/422.0 = 2.370$.`, t`$\operatorname{erfc}(2.370) \approx 8.0\times10^{-4}$, and $\tfrac{2}{\sqrt\pi}(2.370)e^{-2.370^2} \approx 0.0097$. Add them.`],
      teach: 'The fraction of molecules faster than a given speed is the area under the distribution beyond it.',
      explain: t`The shaded area is $${TAIL.toFixed(4)}$: about ${fmt(TAIL * 100, 2)} %, one molecule in ${Math.round(1 / TAIL)}. Small — but among the $10^{22}$ molecules in a litre of air that is still $10^{20}$ of them, and it is these fast ones that drive evaporation and many reactions.`,
      visual: mbGraph({ curves: [{ T: 300, M: MOLAR.N2, label: 'N₂ at 300 K', color: 'accent' }], vmax: 1600, shadeFrom: 1000, marks: [{ v: 1000, label: '1000 m/s' }], caption: 'Nitrogen at 300 K: the shaded tail is the share of molecules faster than 1000 m/s.' }),
    }),
    mcq({
      id: 'rms-mean', difficulty: 2,
      prompt: t`For any gas, $v_p < \bar v < v_\text{rms}$. Why is the rms speed larger than the mean speed?`,
      choices: [
        'Squaring before averaging gives the fast molecules extra weight',
        'The rms speed counts only the faster half of the molecules',
        'The mean speed includes molecules moving backwards, which cancel',
        'The rms speed includes the speed of sound, which the mean does not',
      ],
      answer: 0,
      why: {
        1: 'Every molecule counts in both averages. The difference is what is averaged: speeds, or squares of speeds.',
        2: 'The mean *speed* has no signs to cancel — speed is the size of the velocity. (The mean *velocity* is zero.)',
        3: 'The speed of sound is a property of the gas as a whole, not a part of any average over molecules.',
      },
      hints: ['Try two molecules, at 1 and 3 m/s: compare (1 + 3)/2 with √((1² + 3²)/2).'],
      teach: 'Squaring weights large values more, so a root-mean-square always exceeds the plain mean unless all values are equal.',
      explain: t`With speeds 1 and 3: the mean is 2, the rms is $\sqrt5 = 2.24$. Squares magnify the fast molecules, and the Maxwell–Boltzmann tail is full of them: $v_\text{rms} = 1.085\,\bar v$ always.`,
      visual: mbGraph({ curves: [{ T: 300, M: MOLAR.N2, label: 'N₂ at 300 K', color: 'accent' }], vmax: 1400, marks: [{ v: vpOf(300, MOLAR.N2), label: 'vₚ' }, { v: vbar(300, MOLAR.N2), label: 'v̄' }, { v: vrms(300, MOLAR.N2), label: 'vᵣₘₛ' }], caption: 'The three characteristic speeds of nitrogen at 300 K: 422, 476 and 517 m/s.' }),
    }),
    num({
      id: 'mean-speed', difficulty: 2,
      gen(r) {
        const [key, T, what] = r.pick([['O2', LOX.Tb, 'oxygen boiling off liquid oxygen'], ['N2', LN2.Tb, 'nitrogen boiling off liquid nitrogen'], ['He', 4.22, 'helium boiling off liquid helium'], ['He', 300, 'room-temperature helium pressurant']]);
        const M = MOLAR[key], v = vbar(T, M);
        return {
          prompt: t`What is the mean speed $\bar v = \sqrt{8RT/\pi M}$ of ${what}, at ${T} K? (${NAME[key][1]}: ${fmt(M, 4)} g/mol.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([
            { value: Math.sqrt((8 * R * T) / (Math.PI * M)), feedback: 'Use the molar mass in kg/mol.' },
            { value: vrms(T, M), feedback: t`That is $v_\text{rms} = \sqrt{3RT/M}$. The mean speed has $8/\pi$ in place of 3.` },
          ], v),
          hints: [t`$M = ${fmt(M / 1000, 4)}$ kg/mol.`],
          teach: 'The mean molecular speed is √(8RT/πM), about 92 % of the rms speed.',
          explain: t`$\bar v = \sqrt{\dfrac{8(8.314)(${T})}{\pi(${fmt(M / 1000, 4)})}} = ${fmt(v, 3)}$ m/s.`,
          visual: mbGraph({ curves: [{ T, M, label: `${NAME[key][1]} at ${T} K`, color: 'accent' }], caption: 'The speed distribution of the gas in question. The mean speed lies a little to the right of the peak.' }),
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-escape', difficulty: 3, transfer: true,
      prompt: t`At the top of Earth’s atmosphere, about 500 km up, the gas is near 1000 K and the escape speed is 10.8 km/s. A rule of thumb from planetary science: a gas leaks away over the age of the solar system if the escape speed is less than about **six times** its molecules’ rms speed. Which of these gases has Earth been losing?`,
      choices: ['Helium', 'Nitrogen', 'Oxygen', 'Argon'],
      answer: 0,
      why: {
        1: t`At 1000 K nitrogen’s $v_\text{rms}$ is 944 m/s; the escape speed is 11 times that. Hardly any molecules in the tail are fast enough.`,
        2: t`Oxygen, with $v_\text{rms} = 883$ m/s, is even heavier and slower than nitrogen: the escape speed is 12 times its rms speed.`,
        3: t`Argon is the heaviest of the four, with $v_\text{rms} = 791$ m/s: 14 times below escape speed.`,
      },
      hints: [t`$v_\text{rms} = \sqrt{3RT/M}$ at 1000 K.`, t`Find the ratio 10.8 km/s ÷ $v_\text{rms}$ for each gas, and compare it with 6.`],
      teach: 'Light gases escape because a planet’s escape speed sits in the fast tail of their speed distribution.',
      explain: t`Helium: $v_\text{rms} = \sqrt{3(8.314)(1000)/0.004} = 2.50$ km/s, only 4.3 times smaller than the escape speed, so its Maxwell–Boltzmann tail keeps leaking into space. That is why Earth’s air holds almost no helium — the helium we use comes from radioactive decay underground, trapped in natural gas.`,
      visual: mbGraph({ curves: [{ T: 1000, M: MOLAR.N2, label: 'N₂', color: 'accent' }, { T: 1000, M: MOLAR.He, label: 'He', color: 'warn', labelAt: 3200 }], vmax: 13000, kms: true, marks: [{ v: 10800, label: 'escape' }], caption: 'Nitrogen and helium at 1000 K, with Earth’s escape speed at 500 km. Even helium’s tail is invisible at this scale — but over billions of years it is enough.' }),
    }),
    num({
      id: 'cp-warm-gas', difficulty: 2, transfer: true,
      gen(r) {
        const T1 = r.pick([280, 300]), T2 = r.pick([450, 600, 900]);
        const k = Math.sqrt(T2 / T1);
        return {
          prompt: t`A cold-gas thruster’s exhaust speed is proportional to the molecular speeds of its propellant, so it scales as $\sqrt{T/M}$ for a given gas. A “warm-gas” design heats its nitrogen from ${T1} K to ${T2} K before the nozzle. By what factor does the exhaust speed grow?`,
          answer: k, tol: { rel: 0.01 },
          errors: [{ value: T2 / T1, feedback: t`Speeds grow as the *square root* of the absolute temperature.` }],
          hints: [t`The ratio of exhaust speeds is $\sqrt{T_2/T_1}$.`],
          teach: 'Molecular speeds — and the exhaust speeds of gas thrusters — grow as √T.',
          explain: t`$\sqrt{${T2}/${T1}} = ${fmt(k, 3)}$. Swapping nitrogen for hydrogen (also diatomic) at the same temperature would do better still: $\sqrt{28.01/2.016} = 3.7$ — which is why light propellants win, as long as the tank can hold them.`,
          visual: mbGraph({ curves: [{ T: T1, M: MOLAR.N2, label: `N₂ at ${T1} K`, color: 'accent' }, { T: T2, M: MOLAR.N2, label: `N₂ at ${T2} K`, color: 'warn', labelAt: 1.5 * vpOf(T2, MOLAR.N2) }], caption: 'The nitrogen’s molecular speeds before and after heating: the whole distribution stretches by the same factor.' }),
        };
      },
    }),
    mcq({
      id: 'cp-hotter', difficulty: 2,
      prompt: 'When a gas is heated, its Maxwell–Boltzmann speed distribution:',
      choices: [
        'Shifts its peak to higher speed and gets lower and wider, enclosing the same area',
        'Shifts to higher speed and grows taller, because there is more energy',
        'Slides to higher speed without changing shape',
        'Keeps its peak in place and grows a longer tail',
      ],
      answer: 0,
      why: {
        1: 'The area under the curve is the total share of molecules, always 1. Spreading the speeds out must lower the peak.',
        2: 'Every speed is multiplied by √(T₂/T₁), which stretches the curve; a slide would add the same amount to every speed.',
        3: t`The peak, $v_p = \sqrt{2k_BT/m}$, moves with temperature like every other speed.`,
      },
      hints: ['Every speed scales by the same factor √(T₂/T₁). What does stretching do to a curve whose area must stay 1?'],
      teach: 'Heating stretches the speed distribution along the speed axis; its area stays 1, so it also flattens.',
      explain: t`Every characteristic speed grows as $\sqrt T$, so the curve stretches to the right; since the area is fixed at 1, the peak height falls as $1/\sqrt T$.`,
      visual: mbGraph({ curves: [{ T: 300, M: MOLAR.N2, label: 'N₂ at 300 K', color: 'accent' }], vmax: 1800, caption: 'The speed distribution of nitrogen at 300 K, before heating.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §2.4 Distribution of Molecular Speeds', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds' },
    { label: 'NIST: CODATA values of k_B and N_A (exact since 2019)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
