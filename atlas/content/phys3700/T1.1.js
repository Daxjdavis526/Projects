// Temperature and the ideal gas: temperature as what systems in equilibrium
// share; PV = NkT; the kinetic derivation of P giving ⟨K⟩ = (3/2)kT and
// v_rms; and the limits of "temperature is average kinetic energy".
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, AMU, EV, MOLAR, bars, r4, texNum, apart } from './_count.js';

const t = String.raw;
const mass = (g) => MOLAR[g] * AMU;
const vrms = (g, T) => Math.sqrt((3 * KB * T) / mass(g));
const NAMES = { H2: 'hydrogen (H₂)', He: 'helium', N2: 'nitrogen (N₂)', O2: 'oxygen (O₂)', Ar: 'argon', Xe: 'xenon', CO2: 'carbon dioxide' };
const TEXN = { H2: t`\text{H}_2`, He: t`\text{He}`, N2: t`\text{N}_2`, O2: t`\text{O}_2`, Ar: t`\text{Ar}`, Xe: t`\text{Xe}`, CO2: t`\text{CO}_2` };

// the Maxwell speed density for gas g at T, as a graph (nothing marked unless asked)
function maxwellPic(g, T, { marks = [], vmax = null, caption } = {}) {
  const vp = Math.sqrt((2 * KB * T) / mass(g)), top = (4 / Math.sqrt(Math.PI)) * Math.exp(-1) / vp;
  const xm = vmax || Math.ceil((3.2 * vp) / 100) * 100;
  return {
    type: 'graph',
    params: { x: [0, xm], y: [0, r4(top * 1.25 * 1000)], aspect: 'wide', xlabel: 'speed v (m/s)', ylabel: 'p(v), per km/s', axesAt: 'edge',
      curves: [{ fn: `1000*4/sqrt(pi)*x^2/${r4(vp)}^3*e^(-(x/${r4(vp)})^2)`, color: 'accent' }], vlines: marks },
    caption: caption ?? `The Maxwell speed distribution of ${NAMES[g]} at ${T} K (ideal gas).`,
  };
}

// a molecule bouncing in a cylinder, the setting of the kinetic derivation
const cylinderPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.4, 6.4], y: [-1.6, 1.8], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['t', '1.2'], t: [0, 5.4], color: 'ink2', width: 2 }, { param: ['t', '-1.2'], t: [0, 5.4], color: 'ink2', width: 2 }, { param: ['0', 't'], t: [-1.2, 1.2], color: 'ink2', width: 2 }],
    shade: [{ fn: '1.2', lower: '-1.2', from: 5.4, to: 5.75, color: 'ink3', alpha: 0.6 }],
    points: [{ x: 3.4, y: 0.25, r: 7, color: 'accent', label: 'mass m', labelDx: -22, labelDy: -16 }, { x: 5.6, y: 1.5, r: 0.01, color: 'ink2', label: 'piston, area A', labelDx: -60 }, { x: 2.7, y: -1.45, r: 0.01, color: 'ink2', label: 'length L', labelDx: -20 }],
    arrows: [{ from: [3.55, 0.25], to: [4.7, 0.25], color: 'gold', label: 'vₓ', labelDx: 6, labelDy: 0 }, { from: [5.3, -0.4], to: [4.6, -0.4], color: 'bad', label: 'after: −vₓ', labelDx: -76, labelDy: 0 }],
  },
  caption: caption ?? 'One molecule in a cylinder (not to scale). Each bounce off the piston reverses vₓ; the other velocity components do not matter for the pressure on the piston.',
});

// the worked example: N2 at 300 K
const EX = { T: 300 };
EX.m = mass('N2'); EX.v = vrms('N2', EX.T); EX.K = 1.5 * KB * EX.T;

// places and their air (pressure Pa, temperature K): NASA fact sheets and the US Standard Atmosphere, rounded
const PLACES = [
  ['sea level', 101325, 288], ['Everest summit', 31400, 231], ['Mars surface', 610, 210], ['Titan surface', 146700, 94],
];
// ISM phases: typical density (per cm³) and temperature (K); after Ferrière, Rev. Mod. Phys. 73, 1031 (2001)
const ISM = [['hot ionized medium', 0.004, 1e6], ['warm neutral medium', 0.5, 8000], ['cold neutral medium', 40, 100], ['molecular cloud core', 1e4, 15]];

export default lesson({
  id: 'phys3700.T1.1',
  title: 'Temperature and the ideal gas',
  minutes: 11, difficulty: 2,
  intro: t`**Temperature is what two objects share once they stop exchanging energy** — the zeroth law makes that a consistent label, and a thermometer is anything that reads it. For a dilute gas, experiment gives the ideal gas law

$$PV = NkT,$$

and a short argument about molecules bouncing off a wall turns it into a statement about motion: the average translational kinetic energy of a molecule is $\tfrac32kT$, whatever the gas. That is a *consequence* for the ideal gas, not the definition of temperature: lesson T3.1 defines $T$ from entropy, and there are systems — electrons in a metal, spins in a magnet — where “average kinetic energy” misses badly.`,
  symbols: [
    { tex: 'P', text: 'pressure, the force per area on the walls, in pascals (Pa = N/m²)' },
    { tex: 'V', text: 'volume, in m³' },
    { tex: 'N', text: 'the number of molecules (not moles: $N = nN_A$)' },
    { tex: 'k', text: 'Boltzmann’s constant, $1.380649\\times10^{-23}$ J/K exactly: it converts kelvin to joules per molecule' },
    { tex: 'T', text: 'the absolute temperature, in kelvin (K)' },
    { tex: '\\overline{K}_\\text{trans} = \\tfrac32kT', text: 'the average translational kinetic energy per molecule, $\\tfrac12m\\overline{v^2}$' },
    { tex: 'v_\\text{rms} = \\sqrt{3kT/m}', text: 'the root-mean-square speed $\\sqrt{\\overline{v^2}}$, for molecular mass $m$ in kg' },
  ],
  why: 'PV = NkT and ⟨K⟩ = (3/2)kT connect a thermometer reading to molecular motion — from rocket pressurant to the interstellar medium — and set the scale kT that every later lesson compares energies with.',
  visual: {
    type: 'therm-gas',
    title: 'A gas pressing on its walls',
    lead: t`Molecules fly about and bounce. The bar beside the box is the pressure their impacts produce, against $NkT/V$. The histogram shows their speeds.`,
    tasks: [
      'Double T: the pressure doubles, and the speeds spread out to higher values — by √2, not 2.',
      'Swap nitrogen for helium at the same T: the pressure is the same, but the atoms move much faster.',
      'Halve the volume: the pressure doubles, because each molecule hits the walls twice as often.',
    ],
    params: { gas: 'N2', T: 300, controls: ['T', 'V', 'gas'], gases: ['He', 'N2', 'Xe'], Tmin: 100, Tmax: 600, readouts: ['T', 'P', 'Pideal', 'vrms', 'KE'] },
    caption: 'A model: about 200 hard spheres, enormously enlarged and slowed, all in proportion. Pressure is averaged over recent impacts, so it jitters; with 10²² molecules the jitter would be invisible.',
  },
  example: {
    prompt: t`Derive the average translational kinetic energy of an ideal-gas molecule from $PV = NkT$, and find $v_\text{rms}$ for nitrogen at ${EX.T} K.`,
    visual: cylinderPic(),
    steps: [
      { label: 'One bounce', text: t`A molecule hitting the piston reverses $v_x$: its momentum changes by $-2mv_x$, so it gives the piston $+2mv_x$.` },
      { label: 'How often', text: t`It returns after a round trip $2L$, a time $\Delta t = 2L/v_x$. The average force is $\dfrac{2mv_x}{2L/v_x} = \dfrac{mv_x^2}{L}$.` },
      { label: 'All molecules', text: t`Summing over $N$ molecules and dividing by $A$: $P = \dfrac{Nm\overline{v_x^2}}{AL} = \dfrac{Nm\overline{v_x^2}}{V}$. Collisions between molecules do not change the total momentum delivered.` },
      { label: 'Compare with experiment', text: t`$PV = Nm\overline{v_x^2}$ and $PV = NkT$, so $m\overline{v_x^2} = kT$. No direction is special, so $\overline{v^2} = 3\overline{v_x^2}$ and $\tfrac12m\overline{v^2} = \tfrac32kT$.` },
      { label: 'Nitrogen', text: t`$m = 28.01\,\text{u} = ${texNum(EX.m, 4)}$ kg, so $v_\text{rms} = \sqrt{3kT/m} = \sqrt{\dfrac{3(1.381\times10^{-23})(${EX.T})}{${texNum(EX.m, 4)}}} = ${Math.round(EX.v)}$ m/s.` },
      { label: 'Sense check', text: t`About 1.5 times the speed of sound in air (347 m/s at 300 K) — as it should be, since sound is carried by these molecules: $c_\text{s} = v_\text{rms}\sqrt{\gamma/3}$.` },
    ],
    answer: t`$\overline{K}_\text{trans} = \tfrac32kT = ${texNum(EX.K, 3)}$ J at ${EX.T} K, for any gas; for nitrogen $v_\text{rms} \approx ${Math.round(EX.v)}$ m/s.`,
  },
  practice: [
    num({
      id: 'number-density', difficulty: 1,
      gen(r) {
        const i = r.int(0, PLACES.length - 1), [name, P, T] = PLACES[i], n = P / (KB * T);
        const data = PLACES.map(([, p, tt], j) => ({ x: j, y: j === i ? 0 : Math.log10(p / (KB * tt)), label: j === i ? undefined : PLACES[j][0] }));
        return {
          prompt: t`Air at the ${name} is at about $${texNum(P, 3)}$ Pa and $${T}$ K. How many molecules are there per cubic metre?`,
          answer: n, units: 'm^-3', tol: { rel: 0.01 },
          errors: apart([{ value: P / (KB * (T - 273.15)), feedback: 'Use the absolute temperature in kelvin.' }, { value: P / (8.314 * T), feedback: t`That is moles per m³ ($P/RT$). Use $k$, not $R$, to count molecules.` }], n),
          hints: [t`Rearrange $PV = NkT$ for $N/V$.`, t`$N/V = P/(kT)$.`],
          teach: t`Number density: $N/V = P/kT$.`,
          explain: t`$N/V = \dfrac{${texNum(P, 3)}}{(1.381\times10^{-23})(${T})} = ${texNum(n, 3)}\ \text{m}^{-3}$.`,
          visual: bars(data, { x: [-0.6, 3.6], y: [21, 27], base: 21, ylog: true, xticks: 0, xlabel: '', ylabel: 'molecules per m³', points: [{ x: i, y: 21.6, r: 0.01, color: 'gold', label: `${name}: ?`, labelDx: -30 }], caption: 'Number densities of four atmospheres on a log scale; the one asked for is hidden. Pressures and temperatures rounded from NASA fact sheets.' }),
        };
      },
    }),
    num({
      id: 'vrms', difficulty: 2,
      gen(r) {
        const g = r.pick(['H2', 'He', 'O2', 'Ar', 'CO2']), T = r.pick([20, 77, 90, 300, 500]);
        const v = vrms(g, T);
        return {
          prompt: t`What is the rms speed of ${NAMES[g]} molecules at ${T} K? (Molar mass $${MOLAR[g]}$ g/mol.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt((3 * KB * T) / (MOLAR[g] / 1000)), feedback: t`Use the mass of one molecule, $M/N_A$, not the molar mass.` }, { value: Math.sqrt((3 * 8.314 * T) / MOLAR[g]), feedback: 'The molar mass must be in kg/mol (divide by 1000).' }, { value: Math.sqrt((2 * KB * T) / mass(g)), feedback: t`$\sqrt{2kT/m}$ is the most probable speed. The rms speed has a 3.` }], v),
          hints: [t`$v_\text{rms} = \sqrt{3kT/m}$, with $m = M/N_A$ in kg.`, t`Equivalently $\sqrt{3RT/M}$ with $M$ in kg/mol.`],
          teach: t`$\tfrac12mv_\text{rms}^2 = \tfrac32kT$, so $v_\text{rms} = \sqrt{3kT/m}$.`,
          explain: t`$m = ${MOLAR[g]}\times1.6605\times10^{-27} = ${texNum(mass(g), 4)}$ kg; $v_\text{rms} = \sqrt{3(1.381\times10^{-23})(${T})/${texNum(mass(g), 4)}} = ${fmt(v, 3)}$ m/s.`,
          visual: maxwellPic(g, T),
        };
      },
    }),
    mcq({
      id: 'ke-equal', difficulty: 2,
      prompt: 'A tank holds a mixture of helium and xenon in equilibrium at 300 K. Which statement is right?',
      choices: [
        'The average kinetic energies are equal; helium atoms move about 5.7 times faster on average (rms)',
        'Xenon atoms carry 33 times more kinetic energy, being 33 times heavier',
        'Both move at the same average speed, since they are at the same temperature',
        'Helium has the higher average kinetic energy because it moves faster',
      ],
      answer: 0,
      why: { 1: 'Equilibrium shares energy equally per molecule, not in proportion to mass.', 2: 'Equal temperature means equal average kinetic energy, so the lighter atoms must be faster.', 3: 'Faster, yes — but lighter by exactly enough that ½mv² comes out the same.' },
      hints: [t`$\tfrac12m\overline{v^2} = \tfrac32kT$ for every species at the same $T$.`, t`$v_\text{rms} \propto 1/\sqrt m$: $\sqrt{131.3/4.003} = 5.73$.`],
      teach: 'At one temperature every species has the same average translational kinetic energy.',
      explain: t`$\overline K = \tfrac32kT$ for both; with $m_\text{Xe}/m_\text{He} = 32.8$, the rms speeds differ by $\sqrt{32.8} = 5.73$.`,
      visual: { type: 'graph', params: { x: [0, 2500], y: [0, 2.3], aspect: 'wide', xlabel: 'speed v (m/s)', ylabel: 'p(v), per km/s', axesAt: 'edge', curves: [{ fn: `1000*4/sqrt(pi)*x^2/${r4(Math.sqrt((2 * KB * 300) / mass('He')))}^3*e^(-(x/${r4(Math.sqrt((2 * KB * 300) / mass('He')))})^2)`, color: 'accent', label: 'He', labelAt: 1500, labelDy: -12 }, { fn: `1000*4/sqrt(pi)*x^2/${r4(Math.sqrt((2 * KB * 300) / mass('Xe')))}^3*e^(-(x/${r4(Math.sqrt((2 * KB * 300) / mass('Xe')))})^2)`, color: 'warn', label: 'Xe', labelAt: 300, labelDy: -14 }] }, caption: 'Speed distributions of helium and xenon at 300 K (ideal gases).' },
    }),
    mcq({
      id: 'double-T', difficulty: 1,
      prompt: 'An ideal gas is heated from 300 K to 600 K. Its rms molecular speed:',
      choices: ['increases by a factor √2 ≈ 1.41', 'doubles', 'quadruples', 'is unchanged unless the volume changes'],
      answer: 0,
      why: { 1: 'Doubling T doubles the kinetic energy, ½mv²; v grows by √2.', 2: 'That would be four times the kinetic energy.', 3: 'Speeds depend on T alone; the volume sets how often they hit the walls.' },
      hints: [t`$v_\text{rms} \propto \sqrt T$.`],
      teach: t`Kinetic energy is proportional to $T$, so speeds scale as $\sqrt T$.`,
      explain: t`$v_\text{rms} = \sqrt{3kT/m}$, so $v_{600}/v_{300} = \sqrt2$.`,
      visual: maxwellPic('N2', 300, { vmax: 1600, caption: 'Nitrogen’s speed distribution at 300 K. Where would it move at 600 K?' }),
    }),
    num({
      id: 'T-from-v', difficulty: 2,
      gen(r) {
        const g = r.pick(['H2', 'He']), v = r.pick([1000, 1500, 2000, 2500]);
        const T = (mass(g) * v * v) / (3 * KB);
        return {
          prompt: t`At what temperature is the rms speed of ${NAMES[g]} equal to $${v}$ m/s?`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: (mass(g) * v * v) / (2 * KB), feedback: t`That uses $\tfrac12mv^2 = kT$; the factor is $\tfrac32$.` }], T),
          hints: [t`Solve $\tfrac12mv_\text{rms}^2 = \tfrac32kT$ for $T$.`, t`$T = mv^2/(3k)$.`],
          teach: t`$T = m v_\text{rms}^2/3k$.`,
          explain: t`$T = \dfrac{(${texNum(mass(g), 4)})(${v})^2}{3(1.381\times10^{-23})} = ${fmt(T, 3)}$ K.`,
          visual: maxwellPic(g, Math.round(T), { vmax: 6000, caption: `${NAMES[g]} at the temperature you are looking for (the curve is drawn, the temperature is not given).` }),
        };
      },
    }),
    order({
      id: 'order-derivation', difficulty: 2,
      prompt: t`Put the steps of the kinetic derivation of $\overline K = \tfrac32kT$ in order.`,
      items: [
        t`Each bounce gives the piston momentum $2mv_x$`,
        t`Bounces come every $2L/v_x$, so the average force is $mv_x^2/L$`,
        t`Sum over molecules: $PV = Nm\overline{v_x^2}$`,
        t`Compare with $PV = NkT$: $m\overline{v_x^2} = kT$`,
        t`Isotropy, $\overline{v^2} = 3\overline{v_x^2}$, gives $\tfrac12m\overline{v^2} = \tfrac32kT$`,
      ],
      hints: ['Start from one molecule and one bounce; finish with all three directions.', 'The experimental law PV = NkT enters only after the microscopic pressure is known.'],
      teach: 'Pressure is momentum delivered per area per time; comparing with PV = NkT ties T to motion.',
      explain: 'One bounce, then the rate of bounces, then all molecules, then the comparison with experiment, then the step from one direction to three.',
      visual: cylinderPic('The setting: one molecule bouncing between the end wall and the piston (not to scale).'),
    }),
    mcq({
      id: 'not-ke', difficulty: 3,
      prompt: t`Conduction electrons in copper at 300 K have an average kinetic energy of about 4 eV, while $\tfrac32kT$ at 300 K is only 0.039 eV. What does this show?`,
      choices: [
        t`$\tfrac32kT$ is a result for classical ideal gases, not the definition of temperature; the electrons obey quantum (Fermi) statistics`,
        'The electrons must be at about 30 000 K, hotter than the copper atoms',
        'Copper is not in thermal equilibrium at room temperature',
        'The 4 eV figure must be the electrons’ potential energy',
      ],
      answer: 0,
      why: { 1: 'Electrons and lattice are in equilibrium: one temperature, 300 K. The kinetic energy is high for a quantum reason (lesson T7.3).', 2: 'Nothing is flowing: the metal sits at one temperature indefinitely.', 3: 'It is kinetic: the Pauli principle forces most electrons into fast states.' },
      hints: ['Is the electron gas in a metal classical?', 'Two systems in equilibrium share a temperature, whatever their average energies.'],
      teach: 'Temperature is what equalizes in equilibrium; ⟨K⟩ = (3/2)kT holds only for classical translational motion.',
      explain: t`Temperature is defined by equilibrium (and, in T3.1, by $1/T = \partial S/\partial U$). The $\tfrac32kT$ rule is derived for a classical gas; in a metal the Pauli principle stacks electrons up to the Fermi energy (7 eV in copper), giving them about $\tfrac35 \times 7 = 4$ eV even at absolute zero.`,
      visual: bars([{ x: 0, y: 0.0388, color: 'accent', label: '0.039 eV' }, { x: 1, y: 4.2, color: 'warn', label: '≈ 4 eV' }], { x: [-0.7, 1.7], y: [0, 5], xticks: 0, xlabel: '', ylabel: 'energy (eV)', points: [{ x: 0, y: -0.35, r: 0.01, color: 'accent', label: '(3/2)kT at 300 K', labelDx: -46 }, { x: 1, y: -0.35, r: 0.01, color: 'warn', label: 'electron ⟨K⟩ in copper', labelDx: -62 }], caption: 'Average kinetic energies at 300 K: the classical (3/2)kT, and that of copper’s conduction electrons (free-electron model).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ism', difficulty: 2, transfer: true,
      gen(r) {
        const i = r.int(0, 2), [name, ncm, T] = ISM[i], n = ncm * 1e6, P = n * KB * T;
        return {
          prompt: t`The ${name} of our galaxy has about $${texNum(ncm, 2)}$ particles per cm³ at a temperature of about $${texNum(T, 2)}$ K. Treating it as an ideal gas, what is its pressure?`,
          answer: P, units: 'Pa', tol: { rel: 0.01 },
          errors: apart([{ value: ncm * KB * T, feedback: 'Convert per cm³ to per m³ first: multiply by 10⁶.' }], P),
          hints: [t`$P = (N/V)kT$.`, t`$1\ \text{cm}^{-3} = 10^{6}\ \text{m}^{-3}$.`],
          teach: t`The ideal gas law as $P = nkT$, with $n$ the number density, works from tanks to galaxies.`,
          explain: t`$P = (${texNum(n, 2)}\ \text{m}^{-3})(1.381\times10^{-23})(${texNum(T, 2)}) = ${texNum(P, 3)}$ Pa — about $10^{-19}$ of an atmosphere. The hot, warm and cold phases come out at similar pressures: they sit in rough pressure balance.`,
          visual: { type: 'graph', params: { x: [-3, 6.6], y: [0.5, 6.5], aspect: 'wide', xlabel: 'log₁₀ density (per cm³)', ylabel: 'log₁₀ T (K)', axesAt: 'edge', points: ISM.map(([nm, nn, TT], j) => ({ x: r4(Math.log10(nn)), y: r4(Math.log10(TT)), r: 6, color: j === i ? 'gold' : 'accent', label: nm, labelDx: 10, labelDy: -10 })) }, caption: 'Typical densities and temperatures of the phases of the interstellar medium (after Ferrière 2001); each phase spans a range around its point. The gold one is asked about.' },
        };
      },
    }),
    num({
      id: 'cp-kT', difficulty: 1,
      gen(r) {
        const [name, T] = r.pick([['boiling liquid hydrogen', 20.3], ['boiling liquid nitrogen', 77.4], ['room temperature', 300], ['the surface of Venus', 737]]);
        const v = (KB * T) / EV * 1000;
        return {
          prompt: t`What is $kT$, in meV, at the temperature of ${name} (${T} K)?`,
          answer: v, units: 'meV', tol: { rel: 0.01 },
          errors: apart([{ value: v * 1.5, feedback: t`That is $\tfrac32kT$. The question asks for $kT$.` }], v),
          hints: [t`$k = 8.617\times10^{-5}$ eV/K.`],
          teach: t`$kT \approx 25.9$ meV at 300 K: the yardstick for thermal energies.`,
          explain: t`$kT = (8.617\times10^{-5}\ \text{eV/K})(${T}\ \text{K}) = ${fmt(v, 3)}$ meV.`,
          visual: { type: 'graph', params: { x: [0, 800], y: [0, 75], aspect: 'wide', xlabel: 'T (K)', ylabel: 'kT (meV)', axesAt: 'edge', curves: [{ fn: `${r4((KB / EV) * 1000)}*x`, color: 'accent' }], vlines: [{ x: T, label: `${T} K`, color: 'gold' }] }, caption: 'kT grows in proportion to T. Read roughly from the line, then compute.' },
        };
      },
    }),
    mcq({
      id: 'cp-zeroth', difficulty: 2,
      prompt: 'A mercury thermometer reads the same in two separate flasks of gas. What can you conclude?',
      choices: [
        'Put in contact, the flasks would exchange no net energy: they are at the same temperature',
        'The two gases have the same pressure',
        'The two gases have the same internal energy',
        'The molecules in both have the same rms speed',
      ],
      answer: 0,
      why: { 1: 'Pressure also depends on the density, N/V.', 2: 'Internal energy depends on the amount and kind of gas too.', 3: 'Same T means same average kinetic energy; lighter molecules are faster.' },
      hints: ['This is the zeroth law.', 'A thermometer is a third system each flask comes into equilibrium with.'],
      teach: 'The zeroth law: systems each in equilibrium with a third are in equilibrium with each other.',
      explain: 'Each flask is in equilibrium with the thermometer, so they are in equilibrium with each other: same temperature — and nothing else follows.',
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 4.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '3', lower: '0.5', from: 0.8, to: 3.6, color: 'accent', alpha: 0.25 }, { fn: '3.4', lower: '0.5', from: 6.2, to: 9.4, color: 'warn', alpha: 0.25 }], curves: [{ param: ['5', 't'], t: [0.6, 3.6], color: 'bad', width: 4 }], points: [{ x: 2.2, y: 3.4, r: 0.01, color: 'accent', label: 'flask 1', labelDx: -20 }, { x: 7.8, y: 3.8, r: 0.01, color: 'warn', label: 'flask 2', labelDx: -20 }, { x: 5, y: 3.95, r: 0.01, color: 'bad', label: 'thermometer', labelDx: -36 }, { x: 5, y: 0.6, r: 7, color: 'bad' }] }, caption: 'The thermometer is dipped in each flask in turn and reads the same (schematic).' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §1.1–1.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Ferrière, The interstellar environment of our galaxy, Rev. Mod. Phys. 73, 1031 (2001)', url: 'https://arxiv.org/abs/astro-ph/0106359' },
    { label: 'NIST CODATA: the Boltzmann constant (exact)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?k' },
  ],
});
