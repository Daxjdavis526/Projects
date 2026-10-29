// Heat capacities and equipartition: ½k_BT per quadratic degree of freedom,
// C_V = (f/2)R, γ = (f + 2)/f, Dulong–Petit for solids — and freeze-out,
// the classical theory's failure that pointed to quantum mechanics.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { R, MOLAR, dofBars, dumbbellPic, molarBars, h2Graph, cpGraph, apart } from './_thermal.js';

const t = String.raw;
// measured molar heat capacities at constant pressure, 298 K (NIST Chemistry WebBook), and C_V = C_P − R
const CP = { He: 20.786, Ar: 20.786, N2: 29.124, O2: 29.376, CO2: 37.135, H2: 28.836 };
const CV = Object.fromEntries(Object.entries(CP).map(([k, v]) => [k, v - R]));
const NAME = { He: ['helium', 'He', 3], Ar: ['argon', 'Ar', 3], N2: ['nitrogen', 'N₂', 5], O2: ['oxygen', 'O₂', 5], CO2: ['carbon dioxide', 'CO₂', null], H2: ['hydrogen', 'H₂', 5] };

// the worked example: 5.00 mol of helium and of nitrogen, warmed by 40 K at constant volume
const EX = { n: 5, dT: 40 };
EX.QHe = EX.n * 1.5 * R * EX.dT;       // 2494 J
EX.QN2 = EX.n * 2.5 * R * EX.dT;       // 4157 J

export default lesson({
  id: 'phys2210.M17.4',
  title: 'Heat capacities and equipartition',
  minutes: 11, difficulty: 3,
  intro: t`Warm a gas in a rigid tank and every joule goes into its molecules’ random motion. But which motion? The **equipartition theorem** answers: in thermal equilibrium, every quadratic degree of freedom — every way a molecule can hold energy as $\tfrac12(\text{something})^2$ — holds on average $\tfrac12k_BT$. A helium atom has 3 (motion along $x$, $y$, $z$); a nitrogen molecule adds 2 rotations. So the molar heat capacity at constant volume is

$$C_V = \frac{f}{2}R$$

— 12.5 J/(mol·K) for helium, 20.8 for nitrogen and oxygen, just as measured. Vibrations, which would add more, are **frozen out** at room temperature: they need energy in lumps bigger than $k_BT$. Classical physics could not explain that; it was one of the first clues to quantum mechanics.`,
  symbols: [
    { tex: 'C_V', text: 'the molar heat capacity at constant volume, in J/(mol·K): the heat that warms one mole by 1 K in a rigid container' },
    { tex: 'f', text: 'the number of active quadratic degrees of freedom per molecule: 3 for a monatomic gas, 5 for a diatomic one at room temperature, 6 for the atoms of a solid' },
    { tex: 'R', text: 'the gas constant, 8.314 J/(mol·K): $N_Ak_B$, so “$\\tfrac12k_BT$ per molecule” becomes “$\\tfrac12RT$ per mole”' },
    { tex: '\\tfrac12k_BT', text: 'the average energy held by each active degree of freedom, per molecule' },
    { tex: 'E_\\text{int} = \\tfrac f2 nRT', text: 'the internal (thermal) energy of $n$ moles of ideal gas, so $C_V = \\tfrac{1}{n}\\tfrac{dE_\\text{int}}{dT} = \\tfrac f2R$' },
    { tex: '\\gamma = C_P/C_V = (f + 2)/f', text: 'the heat-capacity ratio: with $C_P = C_V + R$ (lesson M18), 5/3 for monatomic and 7/5 for diatomic gases. It sets the speed of sound and how a gas behaves in a nozzle' },
  ],
  why: 'Heat capacities decide how hot a gas gets when compressed, how fast sound travels in it and how well it works in a nozzle — and their failure at low temperature launched quantum physics.',
  visual: {
    type: 'therm-gas',
    title: 'Two gases share their energy fairly',
    lead: t`Helium and xenon, mixed half and half. They start with every atom at the **same speed** — so each xenon atom, 33 times heavier, carries 33 times the kinetic energy of a helium atom. Watch the readouts as collisions trade energy.`,
    tasks: [
      'Watch the two mean kinetic energies: they drift together until both hover near $\\tfrac32k_BT$ — equipartition between species. (It takes a while: a light atom bouncing off a heavy one exchanges energy slowly.)',
      'Press Equilibrium speeds, then All one speed again: however the energy starts out, it ends shared equally per atom.',
      'Compare the two histograms: helium’s spreads to far higher speeds — the same energy carried by lighter atoms.',
    ],
    params: { gas: 'He+Xe', T: 300, start: 'equal', controls: ['T', 'start'], Tmin: 100, Tmax: 600, hist: true, gauge: false, readouts: ['KEsp', 'KEth'] },
    caption: 'A model: 100 helium and 100 xenon atoms as hard spheres, enormously enlarged and slowed, all in proportion; collisions perfectly elastic. With so few atoms the two averages keep jittering by several per cent; in a real gas the sharing is exact.',
  },
  example: {
    prompt: t`A rigid tank holds ${EX.n.toFixed(2)} mol of gas. How much heat raises its temperature by ${EX.dT} K if the gas is helium? If it is nitrogen? Why do they differ?`,
    visual: dofBars({ trans: 3, rot: 2, frozen: { vib: 2 }, title: 'one N₂ molecule at room temperature', caption: 'Where a nitrogen molecule keeps its thermal energy: three translations and two rotations, $\\tfrac12k_BT$ each on average. Its two vibrational terms (kinetic and potential) are frozen out at room temperature.' }),
    steps: [
      { label: 'Constant volume', text: t`The tank is rigid, so the gas does no work: every joule of heat becomes internal energy, $Q = \Delta E_\text{int} = nC_V\Delta T$.` },
      { label: 'Helium', text: t`Three translational degrees of freedom: $C_V = \tfrac32R = 12.47$ J/(mol·K), so $Q = (${EX.n})(12.47)(${EX.dT}) = ${fmt(EX.QHe, 4)}$ J.` },
      { label: 'Nitrogen', text: t`Three translations plus two rotations — about the two axes at right angles to the bond. (Spinning about the bond itself, like vibration, is frozen out.) $C_V = \tfrac52R = 20.79$ J/(mol·K): $Q = ${fmt(EX.QN2, 4)}$ J.` },
      { label: 'Why', text: t`Equipartition shares the heat equally among *all* active degrees of freedom. Nitrogen hides two-fifths of it in rotation, which does not raise the temperature; it needs $5/3$ times the heat for the same warming.` },
      { label: 'Sense check', text: t`Measured at 298 K: helium 12.47 and nitrogen ${fmt(CV.N2, 4)} J/(mol·K) (NIST). Equipartition nails both.` },
    ],
    answer: t`Helium: about ${fmt(EX.QHe / 1000, 3)} kJ; nitrogen: about ${fmt(EX.QN2 / 1000, 3)} kJ — 5/3 as much, because rotation takes a share.`,
  },
  practice: [
    mcq({
      id: 'count-dof', difficulty: 1,
      prompt: 'How many quadratic degrees of freedom does a nitrogen molecule, N₂, have at room temperature?',
      choices: ['5', '3', '6', '7'],
      answer: 0,
      why: {
        1: 'Three is right for a single atom. A dumbbell-shaped molecule can also rotate end over end — in two independent ways.',
        2: 'There are three rotation axes, but spinning about the bond itself is frozen out: an atom-thin dumbbell has almost no moment of inertia about that axis, so the quantum steps are far too large.',
        3: 'Seven would include vibration (its kinetic and potential energy). For N₂ the vibration needs thousands of kelvin to switch on.',
      },
      hints: ['Count translations first. Then ask: about which axes can a dumbbell rotate with real energy?'],
      teach: 'A diatomic molecule at room temperature has 3 translational and 2 rotational degrees of freedom: f = 5.',
      explain: 'Three translations (x, y, z) plus two rotations about axes at right angles to the bond: f = 5, so $C_V = \\tfrac52R$. Spin about the bond and the vibration are frozen out at room temperature.',
      visual: dumbbellPic(),
    }),
    num({
      id: 'cv-heat', difficulty: 2,
      gen(r) {
        const key = r.pick(['He', 'Ar', 'N2', 'O2']), n = r.pick([2, 3.5, 5]), dT = r.pick([20, 50, 80]);
        const f = NAME[key][2], Q = n * (f / 2) * R * dT;
        return {
          prompt: t`How much heat warms ${n} mol of ${NAME[key][0]} (${NAME[key][1]}) by ${dT} K in a rigid container, near room temperature?`,
          answer: Q, units: 'J', tol: { rel: 0.01 },
          errors: apart([
            { value: n * ((8 - f) / 2) * R * dT, feedback: f === 3 ? 'A single atom has no rotational degrees of freedom: f = 3, not 5.' : 'A diatomic molecule also rotates: f = 5, not 3.' },
            { value: n * ((f + 2) / 2) * R * dT, feedback: t`That is $C_P = C_V + R$, for constant *pressure*. In a rigid container use $C_V = \tfrac f2R$.` },
          ], Q),
          hints: [t`$Q = nC_V\Delta T$ with $C_V = \tfrac f2R$.`, `${NAME[key][0][0].toUpperCase() + NAME[key][0].slice(1)} is ${f === 3 ? 'monatomic: f = 3' : 'diatomic: f = 5'}.`],
          teach: 'At constant volume, Q = n(f/2)RΔT: count the active degrees of freedom.',
          explain: t`$C_V = \tfrac{${f}}{2}R = ${fmt((f / 2) * R, 4)}$ J/(mol·K), so $Q = (${n})(${fmt((f / 2) * R, 4)})(${dT}) = ${fmt(Q, 4)}$ J. (Measured $C_V$: ${fmt(CV[key], 4)} J/(mol·K).)`,
          visual: dofBars(f === 3 ? { trans: 3, title: `one ${NAME[key][1]} atom` } : { trans: 3, rot: 2, title: `one ${NAME[key][1]} molecule` }),
        };
      },
    }),
    mcq({
      id: 'no-rotation', difficulty: 3,
      prompt: 'Why does rotation add nothing to the heat capacity of helium, though a helium atom is not a mathematical point?',
      choices: [
        'Rotational energy comes in quantum steps, and for a single atom the first step is far larger than $k_BT$, so it never gets going',
        'A sphere cannot rotate',
        'Helium atoms do rotate, but rotation carries no energy',
        'Helium atoms collide too rarely to set each other spinning',
      ],
      answer: 0,
      why: {
        1: 'A spinning ball is perfectly possible in classical physics. Classically, equipartition would give it three more $\\tfrac12k_BT$ terms — which are not observed.',
        2: 'Rotation does carry energy, ½Iω². The point is that it cannot take on energy in amounts as small as $k_BT$.',
        3: 'Each atom in room-temperature helium collides billions of times a second. Opportunity is not the problem; the size of the energy step is.',
      },
      hints: ['What would classical physics predict for a spinning ball — and does the measured $C_V$ of helium agree?', 'Quantum rotational levels are spaced by about ħ²/I. What happens to that spacing when the moment of inertia I is tiny?'],
      teach: 'A degree of freedom joins equipartition only if $k_BT$ is large next to its quantum energy step; otherwise it is frozen out.',
      explain: t`Quantum mechanics allows rotational energies only in steps of order $\hbar^2/I$. A lone atom’s mass sits almost entirely in its tiny nucleus, so $I$ is minute and the steps are enormous compared with $k_BT$: the rotation is frozen. Measured $C_V = 12.47$ J/(mol·K) $= \tfrac32R$ exactly — translation only.`,
      visual: dofBars({ trans: 3, frozen: { rot: 3 }, title: 'one helium atom at room temperature', caption: 'A helium atom: three translations hold $\\tfrac12k_BT$ each; the three rotations a classical ball would have (dashed) stay frozen.' }),
    }),
    num({
      id: 'dulong-petit', difficulty: 2,
      gen(r) {
        const [name, M, cm] = r.pick([['titanium', 47.867, 523], ['nickel', 58.693, 444], ['zinc', 65.38, 388], ['tin', 118.71, 228], ['tungsten', 183.84, 132], ['magnesium', 24.305, 1023]]);
        const c = (3 * R) / (M / 1000);
        return {
          prompt: t`Equipartition gives each atom in a solid six quadratic terms (three kinetic, three potential), so a mole of a solid element should need $C = 3R$ per kelvin — the law of Dulong and Petit. Estimate the specific heat of ${name} (molar mass ${M} g/mol), in J/(kg·K).`,
          answer: c, units: 'J/(kg K)', tol: { rel: 0.01 },
          errors: apart([
            { value: (3 * R) / M, feedback: 'Convert the molar mass to kg/mol first, so the answer comes out per kilogram.' },
            { value: (1.5 * R) / (M / 1000), feedback: t`That counts only the kinetic terms, $\tfrac32R$. The bonds act as springs with potential energy too: $3R$ in all.` },
          ], c),
          hints: [t`Per mole: $3R = 24.94$ J/(mol·K).`, t`Per kilogram: divide by the molar mass in kg/mol, $${+(M / 1000).toPrecision(6)}$.`],
          teach: 'Near room temperature most solid elements have molar heat capacity close to 3R.',
          explain: t`$c = 3R/M = 24.94/${+(M / 1000).toPrecision(6)} = ${fmt(c, 3)}$ J/(kg·K). The measured value at 25 °C is about ${cm} — within a few per cent.`,
          visual: molarBars(),
        };
      },
    }),
    mcq({
      id: 'cold-steel', difficulty: 3,
      prompt: 'Chilling stainless steel from 293 K to 77 K takes about 18 % less heat than its room-temperature specific heat predicts. What does equipartition — with freeze-out — say is happening?',
      choices: [
        'As the steel cools, its atomic vibrations need energy in quantum steps larger than $k_BT$, so they hold less than equipartition’s share and the specific heat falls',
        'The steel contracts as it cools, so there is less of it to chill',
        'Some of the heat is carried off by the liquid nitrogen’s latent heat instead',
        'Heat flows faster at low temperature, so less of it is needed',
      ],
      answer: 0,
      why: {
        1: 'Contraction changes the size, not the mass: the same atoms must still be chilled, and the change is only 0.3 % anyway.',
        2: 'The latent heat is where the steel’s heat *goes*; it does not change how much heat the steel gives up.',
        3: 'How fast heat flows sets how long cooling takes, not how much heat must be removed.',
      },
      hints: ['Look at the graph: what happens to the specific heat as T falls?', 'Equipartition assumes every vibration can take on energy in amounts as small as you like. Is that true when $k_BT$ is small?'],
      teach: 'Below a few hundred kelvin the vibrations of a solid start to freeze out, so its heat capacity falls below 3R.',
      explain: t`At room temperature steel’s atoms hold about $3k_BT$ each, as Dulong–Petit says. As it cools, $k_BT$ shrinks below the quantum steps of the lattice vibrations, which freeze out one by one — the specific heat falls toward zero. Averaged over 77–293 K it is about 386 J/(kg·K) against 470 at room temperature (lesson M16.3).`,
      visual: cpGraph({ T1: 77, T2: 293 }),
    }),
    num({
      id: 'gamma', difficulty: 2,
      gen(r) {
        const key = r.pick(['He', 'N2', 'CO2', 'H2']);
        const cv = CV[key], g = (cv + R) / cv;
        return {
          prompt: t`The measured molar heat capacity of ${NAME[key][0]} at constant volume, near room temperature, is ${fmt(cv, 4)} J/(mol·K). Using $C_P = C_V + R$, what is its heat-capacity ratio $\gamma = C_P/C_V$?`,
          answer: g, tol: { rel: 0.005 },
          errors: apart([
            { value: cv / (cv + R), feedback: 'Upside down: $\\gamma = C_P/C_V$ is always larger than 1.' },
            { value: R / cv, feedback: t`That is $(C_P - C_V)/C_V = \gamma - 1$. Add 1.` },
          ], g),
          hints: [t`$C_P = ${fmt(cv, 4)} + 8.314$.`],
          teach: '$\\gamma = C_P/C_V = 1 + R/C_V$: 5/3 for monatomic gases, 7/5 for diatomic ones, lower for molecules with more active degrees of freedom.',
          explain: t`$\gamma = \dfrac{${fmt(cv, 4)} + 8.314}{${fmt(cv, 4)}} = ${fmt(g, 4)}$.${key === 'He' ? ' Exactly 5/3: f = 3.' : key === 'CO2' ? ' Below 7/5: carbon dioxide’s bending vibrations are partly active even at room temperature.' : ' Close to 7/5: f = 5.'}`,
          visual: dofBars(key === 'He' ? { trans: 3, title: 'one He atom' } : key === 'CO2' ? { trans: 3, rot: 2, vib: 1, title: 'one CO₂ molecule (roughly)', caption: 'Carbon dioxide at room temperature: three translations, two rotations, and its bending vibrations partly active — drawn as one extra share. Roughly: the vibrations are only partly switched on.' } : { trans: 3, rot: 2, title: `one ${NAME[key][1]} molecule` }),
        };
      },
    }),
    num({
      id: 'room-air', difficulty: 3,
      gen(r) {
        const V = r.pick([40, 60, 90]), dT = r.pick([3, 5, 8]);
        const n = (100e3 * V) / (R * 288.15), Q = n * 2.5 * R * dT;
        return {
          prompt: t`A sealed ${V} m³ room holds air (nearly all N₂ and O₂) at 100 kPa and 15 °C. How much heat warms the air by ${dT} K? (Treat the air as an ideal diatomic gas and ignore the walls and furniture.)`,
          answer: Q / 1000, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([
            { value: (n * 1.5 * R * dT) / 1000, feedback: 'N₂ and O₂ are diatomic: their rotations take a share too, so $C_V = \\tfrac52R$.' },
            { value: (n * 3.5 * R * dT) / 1000, feedback: 'That is $C_P$. A sealed room keeps its volume: use $C_V$.' },
          ], Q / 1000),
          hints: [t`Moles first: $n = PV/(RT)$ with $T = 288.15$ K.`, t`Then $Q = n\cdot\tfrac52R\cdot\Delta T$.`],
          teach: 'Count the moles with the ideal gas law, then use $C_V = \\tfrac52R$ for air.',
          explain: t`$n = \dfrac{(10^5)(${V})}{(8.314)(288.15)} = ${fmt(n, 4)}$ mol, so $Q = (${fmt(n, 4)})(20.79)(${dT}) = ${fmt(Q / 1000, 3)}$ kJ — about what a 1 kW heater supplies in ${fmt(Q / 1000 / 60, 2)} minutes. (In real rooms most of the heat goes into walls and furniture.)`,
          visual: dofBars({ trans: 3, rot: 2, frozen: { vib: 2 }, title: 'one N₂ or O₂ molecule at room temperature' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-copv', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([0.5, 1.2, 2.0]), dT = r.pick([20, 30, 40]);
        const n = m / (MOLAR.He / 1000), Q = (n * 1.5 * R * dT) / 1000;
        return {
          prompt: t`A spacecraft’s composite pressurant tank holds ${m} kg of helium. Sunlight warms the tank, a rigid container, by ${dT} K. How much heat does the helium absorb?`,
          answer: Q, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([
            { value: (n * 2.5 * R * dT) / 1000, feedback: 'Helium is monatomic: three translational degrees of freedom only, $C_V = \\tfrac32R$.' },
            { value: (m * 1000 * 1.5 * R * dT) / 1000, feedback: 'Turn the mass into moles first: n = m/M, with M = 4.003 g/mol.' },
          ], Q),
          hints: [t`$n = m/M$ with $M = 4.003\times10^{-3}$ kg/mol.`, t`Rigid tank: $Q = nC_V\Delta T$ with $C_V = \tfrac32R$.`],
          teach: 'In a rigid tank all the heat raises the internal energy: Q = n(3/2)RΔT for a monatomic gas.',
          explain: t`$n = ${m}/0.004003 = ${fmt(n, 4)}$ mol, so $Q = (${fmt(n, 4)})(12.47)(${dT}) = ${fmt(Q, 3)}$ kJ. Per kilogram, helium’s $c_V = 3.12$ kJ/(kg·K) is among the highest of any gas — few atoms per kilogram, each taking its $\tfrac32k_BT$.`,
          visual: dofBars({ trans: 3, title: 'one helium atom' }),
        };
      },
    }),
    mcq({
      id: 'cp-hydrogen', difficulty: 3,
      prompt: t`The graph is a sketch of the molar heat capacity of hydrogen gas. At 50 K it is close to $\tfrac32R$, the value for a monatomic gas, though H₂ is a two-atom molecule. Why?`,
      choices: [
        'At 50 K, $k_BT$ is too small to excite even the first rotational level, so the rotations are frozen out',
        'At 50 K the hydrogen molecules have split into single atoms',
        'At 50 K hydrogen is a liquid, and liquids have no rotations',
        'Equipartition holds at every temperature, so the graph must be wrong',
      ],
      answer: 0,
      why: {
        1: 'Splitting H₂ apart takes about 4.5 eV per molecule — temperatures of thousands of kelvin. At 50 K the molecules are intact.',
        2: 'At atmospheric pressure hydrogen boils at 20 K, so at 50 K it is a gas; the graph is for the gas.',
        3: 'Equipartition is a classical result. It fails whenever $k_BT$ is small next to a motion’s quantum energy steps — that failure is what the graph shows.',
      },
      hints: [t`Hydrogen’s first rotational energy step is about $k_B\times170$ K. Compare it with $k_BT$ at 50 K.`, 'A degree of freedom holds its $\\tfrac12k_BT$ only when $k_BT$ is large next to its energy step.'],
      teach: 'Each kind of motion switches on only when $k_BT$ becomes comparable to its quantum energy step; below that, it is frozen out.',
      explain: t`H₂ is light and small, so its rotational steps are unusually large: the first is about $k_B\times170$ K. At 50 K few molecules can afford it, so the rotations hold far less than $\tfrac12k_BT$ each: $C_V \to \tfrac32R$. They switch on around 100–300 K; vibration waits for thousands of kelvin. Classical physics predicts a flat line at all temperatures — the steps were an early sign that energy is quantized.`,
      visual: h2Graph(),
    }),
    num({
      id: 'cp-internal', difficulty: 2,
      gen(r) {
        const V = r.pick([0.5, 2, 10]), P = r.pick([101, 300, 1000]);
        const E = 2.5 * P * V;
        return {
          prompt: t`A ${V} m³ tank holds nitrogen at ${P} kPa near room temperature. Using equipartition, how much thermal energy do its molecules hold, counting translation and rotation?`,
          answer: E, units: 'kJ', tol: { rel: 0.01 },
          errors: apart([
            { value: 1.5 * P * V, feedback: 'That is the translational part only. Nitrogen’s two rotations hold $\\tfrac12k_BT$ each as well.' },
            { value: P * V, feedback: t`$PV = nRT$; the internal energy is $\tfrac f2nRT$ with $f = 5$.` },
          ], E),
          hints: [t`$E = \tfrac f2nRT$ and $nRT = PV$.`, t`For nitrogen, $f = 5$.`],
          teach: 'The internal energy of an ideal gas is (f/2)nRT = (f/2)PV.',
          explain: t`$E = \tfrac52PV = 2.5\times(${P}\times10^{3}\ \text{Pa})(${V}\ \text{m}^3) = ${fmt(E, 3)}$ kJ — and you never needed the temperature or the number of moles.`,
          visual: dofBars({ trans: 3, rot: 2, title: 'one N₂ molecule' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §2.3 Heat Capacity and Equipartition of Energy', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-3-heat-capacity-and-equipartition-of-energy' },
    { label: 'NIST Chemistry WebBook: gas-phase heat capacities at 298 K', url: 'https://webbook.nist.gov/chemistry/' },
    { label: 'NIST Cryogenic Material Properties: 304 stainless steel (specific heat fit)', url: 'https://trc.nist.gov/cryogenics/materials/304Stainless/304Stainless_rev.htm' },
  ],
});
