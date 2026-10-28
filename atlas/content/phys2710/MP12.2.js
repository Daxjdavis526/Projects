// Metals and the free-electron model — conduction electrons as a Fermi gas
// in a box: E_F = (ħ²/2m)(3π²n)^(2/3), 7.0 eV for copper (T_F = 82 000 K,
// v_F = 1.6 × 10⁶ m/s). Only electrons within about kT of E_F can take up
// heat (why the electronic heat capacity is ~1% of the classical value);
// Drude’s collision time τ = m/ne²ρ and the mean free path v_Fτ ≈ 40 nm;
// the drift speed is ~10⁻¹⁰ of v_F. Transfer: the Fermi energy of a white
// dwarf’s electrons. Every number is computed here or in model/mp-solids.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { N_A, U_KG } from './_quanta.js';
import { S, r6, seg, label } from './_solids.js';

const t = String.raw;
const CU = S.METALS.cu;
const N_CU = (8960 * N_A) / 0.063546;                  // m⁻³, from copper’s density and molar mass
const EF_CU = S.fermiEnergy(N_CU);
const KB = 1.380649e-23;
const VTH = Math.sqrt((3 * KB * 300) / S.ME);          // m/s, the classical thermal speed at 300 K
const C_EF = S.fermiEnergy(1);                         // eV, E_F for n = 1 m⁻³ (E_F = C n^(2/3))
const KEV = 8.617333262e-5;

/** Electrons per unit energy, g(E)f(E), against the states available g(E) ∝ √E (normalized to one electron in all). EF and T are numbers or keys. */
function dos({ EF, T, xmax = 13, ymax = 0.55, ticks = true, efLabel = 'Fermi energy', extra = {}, caption }) {
  const g = `1.5*sqrt(x)/(${EF})^1.5`, f = `1/(exp((x - (${EF}))/(${KEV}*(${T}))) + 1)`;
  return {
    type: 'graph',
    params: {
      x: [0, xmax], y: [0, ymax], aspect: 'wide', axesAt: 'edge', xlabel: 'electron energy E (eV)', ylabel: 'electrons per eV (share)', yticks: 0,
      ...(ticks ? {} : { xticks: 0 }),
      shade: [
        { fn: `${g}*${f}`, from: 0, to: EF, color: 'accent', alpha: 0.4 },
        { fn: g, lower: `${g}*${f}`, from: 0, to: EF, color: 'warn', alpha: 0.18 },
        { fn: `${g}*${f}`, from: EF, to: xmax, color: 'warn', alpha: 0.6 },
      ],
      curves: [{ fn: g, color: 'ink3', width: 1.4, dash: true }, { fn: `${g}*${f}`, color: 'accent', width: 2.4 }],
      vlines: [{ x: EF, label: efLabel, color: 'gold' }],
      ...extra,
    },
    caption: caption ?? t`The free-electron gas: states available per unit energy, rising as $\sqrt E$ (dashed), and the share of them filled (blue). Orange: electrons thermally lifted above the Fermi energy, and the states they left. The chemical potential is held at $E_F$, accurate below a few thousand kelvin.`,
  };
}

/** A conduction electron’s zigzag between collisions, with its tiny net drift. Schematic. */
const zigzag = (() => {
  let s = 41;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const raw = [[0, 0]];
  for (let i = 0; i < 13; i++) { const a = 2 * Math.PI * rnd(), [x, y] = raw.at(-1); raw.push([x + Math.cos(a) + 0.15, y + Math.sin(a)]); }
  // fit the walk into the frame (a schematic, so the two axes may stretch differently)
  const xs = raw.map((p) => p[0]), ys = raw.map((p) => p[1]), [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pts = raw.map(([x, y]) => [0.5 + (7 * (x - x0)) / (x1 - x0), 0.4 + (2.1 * (y - y0)) / (y1 - y0)]);
  const curves = pts.slice(1).map((p, i) => seg(pts[i][0], pts[i][1], p[0], p[1], 'accent', 2));
  const ions = [];
  for (let x = 0.5; x < 8; x += 0.75) for (let y = 0.4; y < 3; y += 0.6) ions.push({ x: r6(x), y: r6(y), r: 2.2, color: 'ink4' });
  const [a, b] = [pts[4], pts[5]];
  return {
    type: 'graph',
    params: {
      x: [0, 8], y: [0, 3.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves, points: [...ions, ...pts.map(([x, y]) => ({ x: r6(x), y: r6(y), r: 3, color: 'warn' })), label((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 'ℓ: one free path', 'accent', 6, -10)],
      arrows: [{ from: [0.4, 2.95], to: [1.6, 2.95], color: 'gold', label: 'net drift (exaggerated)', labelDx: 8, labelDy: 0 }],
    },
    caption: 'Schematic: one conduction electron’s path through the lattice (grey ions), changing direction at each collision (orange). Between collisions it moves at about the Fermi speed; an electric field adds a drift far smaller than drawn — about 10⁻¹⁰ of that speed.',
  };
})();

/** E_F against electron density on log scales, with the metals marked. */
function efChart({ x = [27.9, 29.6], y = [0.3, 1.25], mark = true, only = null, extra = {}, caption } = {}) {
  const lc = Math.log10(C_EF);
  const metals = (only || ['na', 'ag', 'cu', 'al']).map((k) => { const m = S.METALS[k], lx = Math.log10(m.n); return { x: r6(lx), y: r6(lc + (2 / 3) * lx), r: 5, color: 'gold', label: m.label, labelDx: k === 'al' ? -10 : 10, labelDy: k === 'al' ? -12 : 12, labelAlign: k === 'al' ? 'right' : 'left' }; });
  return {
    type: 'graph',
    params: {
      x, y, xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'conduction electrons per m³', ylabel: 'Fermi energy (eV)',
      curves: [{ fn: `${r6(lc)} + (2/3)*x`, domain: [x[0], Math.min(x[1], 29.6)], color: 'accent', width: 2.4 }],
      points: mark ? metals : [],
      ...extra,
    },
    caption: caption ?? 'The Fermi energy grows as n^(2/3): the more electrons are packed in, the higher the exclusion principle stacks them. Log scales; dots are free-electron values for real metals.',
  };
}

export default lesson({
  id: 'phys2710.MP12.2',
  title: 'Metals and the free-electron model',
  minutes: 12, difficulty: 3,
  badges: ['model', 'est-obs'],
  intro: t`In a metal the outermost electron of each atom leaves home and roams the whole crystal. Treat these **conduction electrons** as a gas of free particles in a box — but a gas that obeys the exclusion principle, so no two share a state. Even at absolute zero they cannot all sit at the bottom: they fill every state up to the **Fermi energy**

$$E_F = \frac{\hbar^2}{2m}\left(3\pi^2 n\right)^{2/3}$$

For copper that is 7.0 eV, some 270 times the thermal energy $kT$ at room temperature. So the electrons race about at $1.6\times10^{6}$ m/s even when the metal is cold, and heat can stir only the few within about $kT$ of the top. That one fact explains why a metal’s electrons add almost nothing to its heat capacity — a puzzle classical physics could not solve — while their collisions with the vibrating lattice set its resistance.

> This uses the particle in a box ([MP7.2](#/lesson/phys2710.MP7.2)) and Fermi–Dirac statistics ([MP10.2](#/lesson/phys2710.MP10.2)).`,
  symbols: [
    { tex: 'E_F', text: 'the Fermi energy: the energy of the highest filled state at absolute zero, measured from the bottom of the band, in eV' },
    { tex: '\\hbar', text: t`the reduced Planck constant, $h/2\pi = 1.055\times10^{-34}$ J s` },
    { tex: 'm', text: t`the electron’s mass, $9.109\times10^{-31}$ kg (the free-electron model ignores the lattice’s effect on it)` },
    { tex: 'n', text: t`the number of conduction electrons per cubic metre — one per atom in copper, silver, gold and sodium, three in aluminium: $${tex(CU.n, 3)}$ m⁻³ for copper` },
  ],
  why: 'The Fermi energy sets how metals conduct electricity and heat — and the same exclusion-principle pressure holds white dwarfs and neutron stars up against their own gravity.',
  visual: {
    ...dos({
      EF: 'EF', T: 'T',
      extra: {
        sliders: [{ key: 'T', label: 'Temperature $T$', min: 10, max: 10000, step: 10, value: 300, unit: '\\mathrm{K}', explain: 'Room temperature is 300 K; copper melts at 1358 K. Above that the metal is liquid, but the electron gas behaves much the same.' }],
        choices: [{ key: 'EF', label: 'Metal', options: [[3.24, 'sodium'], [7.03, 'copper'], [11.67, 'aluminium']], value: 7.03, explain: 'Their free-electron Fermi energies: 3.24, 7.03 and 11.7 eV.' }],
        readouts: [
          { label: '$kT$', expr: `${KEV}*T`, unit: '\\mathrm{eV}', digits: 3 },
          { label: '$E_F/kT$', expr: `EF/(${KEV}*T)`, digits: 3 },
          { label: 'share near the top, about $3kT/2E_F$', expr: `150*${KEV}*T/EF`, unit: '\\%', digits: 2 },
        ],
      },
    }),
    title: 'A cold gas of fast electrons',
    lead: t`Blue: how many electrons sit at each energy. The dashed curve is how many states are available there, rising as $\sqrt E$. At low temperature every state is filled up to the Fermi energy and none above. Heat lifts a few electrons (orange, right of the line) out of the states just below (orange, left of the line).`,
    tasks: [
      'At 300 K the edge is razor sharp: kT = 0.026 eV is a sliver of copper’s 7 eV.',
      'Heat copper to its melting point, 1358 K: only about 2.5% of the electrons can take up any heat at all.',
      'Switch metals: more electrons per cubic metre stack higher. Aluminium, with three per atom, reaches 11.7 eV.',
    ],
  },
  example: {
    prompt: t`Copper has a density of $8960$ kg/m³ and a molar mass of $63.546$ g/mol, and gives one conduction electron per atom. Find its electron density, Fermi energy, Fermi temperature $T_F = E_F/k$ and Fermi speed $v_F = \sqrt{2E_F/m}$, and compare the speed with the classical thermal speed $\sqrt{3kT/m}$ at 300 K.`,
    visual: dos({ EF: 7.04, T: 300, caption: 'Copper’s conduction electrons at 300 K: every state filled up to 7.04 eV, the edge blurred by only about kT = 0.026 eV — too thin to see. Free-electron model.' }),
    steps: [
      { label: 'Count the electrons', text: t`$n = \dfrac{\rho N_A}{M} = \dfrac{(8960\ \text{kg/m}^3)(6.022\times10^{23}\ \text{mol}^{-1})}{0.063546\ \text{kg/mol}} = ${tex(N_CU, 4)}$ m⁻³ — one per atom.` },
      { label: 'Fermi energy', text: t`$3\pi^2n = ${tex(3 * Math.PI ** 2 * N_CU, 4)}$ m⁻³, and its $2/3$ power is $${tex(Math.cbrt(3 * Math.PI ** 2 * N_CU) ** 2, 4)}$ m⁻². Times $\hbar^2/2m = ${tex(S.HBAR ** 2 / (2 * S.ME), 4)}$ J m², that is $${tex(EF_CU * S.QE, 4)}$ J $= ${fmt(EF_CU, 3)}$ eV.` },
      { label: 'Fermi temperature', text: t`$T_F = E_F/k = ${fmt(EF_CU, 4)}\ \text{eV} / (8.617\times10^{-5}\ \text{eV/K}) = ${tex(S.fermiTemp(EF_CU), 3)}$ K. A classical gas would need that temperature for its particles to have such energies; copper boils at 2835 K.` },
      { label: 'Fermi speed', text: t`$v_F = \sqrt{2E_F/m} = ${tex(S.fermiSpeed(EF_CU), 3)}$ m/s, against a classical thermal speed $\sqrt{3kT/m} = ${tex(VTH, 3)}$ m/s at 300 K — ${fmt(S.fermiSpeed(EF_CU) / VTH, 2)} times slower.` },
      { label: 'Sense check', text: t`$E_F/kT = ${fmt(EF_CU / S.kT(300), 3)}$ at room temperature: the electron gas is “cold” — almost completely filled up to $E_F$ — however hot the metal feels. The measured value from copper’s electronic properties is close: about 7.0 eV.` },
    ],
    answer: t`$n = ${tex(N_CU, 3)}$ m⁻³, $E_F = ${fmt(EF_CU, 3)}$ eV, $T_F = ${tex(S.fermiTemp(EF_CU), 3)}$ K, $v_F = ${tex(S.fermiSpeed(EF_CU), 3)}$ m/s — ${fmt(S.fermiSpeed(EF_CU) / VTH, 2)} times the classical thermal speed.`,
  },
  practice: [
    num({
      id: 'ef-metal', difficulty: 2,
      gen(r) {
        const key = r.pick(['na', 'ag', 'au', 'al']), m = S.METALS[key], EF = S.fermiEnergy(m.n);
        return {
          prompt: t`${m.label[0].toUpperCase() + m.label.slice(1)} has $${tex(m.n, 3)}$ conduction electrons per cubic metre. What is its Fermi energy, in eV?`,
          answer: EF, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: EF * Math.cbrt(3 * Math.PI ** 2) ** -2 * Math.cbrt(Math.PI ** 2) ** 2, feedback: t`Inside the bracket it is $3\pi^2 n$ — keep the 3.` }].filter((e) => Math.abs(e.value / EF - 1) > 0.02),
          hints: [t`$E_F = \dfrac{\hbar^2}{2m}(3\pi^2n)^{2/3}$, with $\hbar^2/2m = 6.104\times10^{-39}$ J m².`, t`Find $(3\pi^2 n)^{2/3}$ in m⁻², multiply by $6.104\times10^{-39}$ J m², and divide by $1.602\times10^{-19}$ J/eV.`],
          teach: t`The Fermi energy depends only on the electron density: $E_F = (\hbar^2/2m)(3\pi^2n)^{2/3}$.`,
          explain: t`$(3\pi^2 n)^{2/3} = ${tex(Math.cbrt(3 * Math.PI ** 2 * m.n) ** 2, 4)}$ m⁻², so $E_F = ${tex(EF * S.QE, 4)}$ J $= ${fmt(EF, 3)}$ eV.`,
          visual: dos({ EF: r6(EF), T: 300, ticks: false, efLabel: 'Fermi energy = ?', caption: `The conduction electrons of ${m.label} at 300 K (energy numbers hidden). Free-electron model.` }),
        };
      },
    }),
    mcq({
      id: 'not-heat', difficulty: 2,
      prompt: 'Cool a piece of copper toward absolute zero. What happens to its conduction electrons?',
      choices: [
        'They still fill every state up to 7 eV and move at up to 1.6 × 10⁶ m/s: the exclusion principle, not heat, gives them their energy',
        'They all settle into the lowest-energy state and stop moving',
        'Their Fermi energy falls in proportion to the temperature, reaching zero at 0 K',
        'Their speeds fall to the classical thermal value √(3kT/m), which goes to zero',
      ],
      answer: 0,
      why: {
        1: 'Only one electron of each spin fits in each state. With 10²⁹ electrons per cubic metre, the states fill up to 7 eV.',
        2: t`$E_F$ comes from packing electrons into states, not from heat: it hardly changes with temperature.`,
        3: t`That classical picture is exactly what fails for metals: the electrons’ typical speed is set by $E_F$, far above $\sqrt{3kT/m}$.`,
      },
      hints: ['How many electrons can share one state?', 'If the lowest states fill up, where must the rest go — even at absolute zero?'],
      teach: 'The Fermi energy comes from the exclusion principle, not from heat: it is there even at absolute zero.',
      explain: t`At 0 K the electrons fill the lowest states available, two per state, all the way up to $E_F = 7.0$ eV; the fastest move at the Fermi speed, $1.6\times10^{6}$ m/s. Temperature only blurs the top edge by about $kT$.`,
      visual: dos({ EF: 7.03, T: 10, caption: 'Copper’s conduction electrons near absolute zero (10 K): every state filled up to 7.03 eV, none above. Free-electron model.' }),
    }),
    num({
      id: 'excitable', difficulty: 2,
      gen(r) {
        const key = r.pick(['na', 'cu', 'al']), m = S.METALS[key], EF = S.fermiEnergy(m.n), T = r.pick([77, 300, 600, 1000]);
        const share = (1.5 * S.kT(T)) / EF;
        return {
          prompt: t`Only electrons within about $kT$ of the Fermi energy can take up heat. Estimating their share as $3kT/2E_F$, what percentage of the conduction electrons in ${m.label} ($E_F = ${fmt(EF, 3)}$ eV) can be thermally excited at ${T} K?`,
          answer: 100 * share, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * share) / 1.5, feedback: t`You used $kT/E_F$; the estimate asked for is $3kT/2E_F$.` }, { value: (100 * share * 300) / T, feedback: t`Use $kT$ at ${T} K: $k = 8.617\times10^{-5}$ eV/K.` }].filter((e) => Math.abs(e.value / (100 * share) - 1) > 0.02),
          hints: [t`$kT = (8.617\times10^{-5}\ \text{eV/K})\times${T}$ K.`, t`Share $= \dfrac{3}{2}\dfrac{kT}{E_F}$, then times 100 for a percentage.`],
          teach: t`Only a fraction of order $kT/E_F$ of a metal’s electrons — about 1% at room temperature — can absorb heat.`,
          explain: t`$kT = ${fmt(S.kT(T), 3)}$ eV, so $\tfrac32\,kT/E_F = ${fmt(100 * share, 3)}$%. The rest are buried too deep: to move up they would need an empty state within reach, and all those are taken. That is why the electrons’ heat capacity is about 1% of the classical $\tfrac32 k$ per electron.`,
          visual: dos({ EF: r6(EF), T, caption: `${m.label[0].toUpperCase() + m.label.slice(1)} at ${T} K: orange marks the electrons lifted above the Fermi energy and the states they left. Free-electron model.` }),
        };
      },
    }),
    num({
      id: 'drift', difficulty: 2,
      gen(r) {
        const I = r.pick([5, 10, 15, 20]), A = r.pick([1.5, 2.5, 4]), vd = I / (CU.n * S.QE * A * 1e-6);
        return {
          prompt: t`A copper wire of cross-section ${A} mm² carries ${I} A. With $n = ${tex(CU.n, 3)}$ m⁻³ conduction electrons, how fast do they drift along the wire, in mm/s?`,
          answer: vd * 1000, units: 'mm/s', tol: { rel: 0.005 },
          errors: [{ value: vd, feedback: 'That is in m/s; the question asks for mm/s.' }],
          hints: [t`The current is the charge crossing per second: $I = neAv_d$.`, t`$v_d = I/(neA)$ with $A = ${A}\times10^{-6}$ m².`],
          teach: t`Current needs only a tiny drift, $v_d = I/neA$, on top of electrons already racing at the Fermi speed.`,
          explain: t`$v_d = \dfrac{${I}}{(${tex(CU.n, 3)})(1.602\times10^{-19})(${A}\times10^{-6})} = ${fmt(vd * 1000, 3)}$ mm/s — about $${tex(vd / S.fermiSpeed(EF_CU), 2)}$ of the Fermi speed. The signal travels at nearly light speed; the electrons themselves creep.`,
          visual: zigzag,
        };
      },
    }),
    num({
      id: 'mean-free-path', difficulty: 3,
      gen(r) {
        const key = r.pick(['cu', 'ag', 'au', 'al']), m = S.METALS[key], EF = S.fermiEnergy(m.n), tau = S.collisionTime(m.n, m.rho), l = S.fermiSpeed(EF) * tau;
        return {
          prompt: t`At 20 °C ${m.label} has resistivity $\rho = ${tex(m.rho, 3)}$ Ω m and $n = ${tex(m.n, 3)}$ m⁻³ conduction electrons, with a Fermi speed of $${tex(S.fermiSpeed(EF), 3)}$ m/s. Using Drude’s result $\tau = m/(ne^2\rho)$ for the time between collisions, how far does an electron travel between collisions, in nm?`,
          answer: l * 1e9, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt((3 * KB * 293) / S.ME) * tau * 1e9, feedback: 'The electrons that carry current move at the Fermi speed, not the classical thermal speed.' }],
          hints: [t`First $\tau = \dfrac{m}{ne^2\rho}$ with $m = 9.109\times10^{-31}$ kg and $e = 1.602\times10^{-19}$ C.`, t`Then $\ell = v_F\tau$; convert metres to nanometres.`],
          teach: t`Resistance measures how often electrons collide: $\tau = m/ne^2\rho$, and the mean free path is $\ell = v_F\tau$.`,
          explain: t`$\tau = ${tex(tau, 3)}$ s, so $\ell = v_F\tau = ${fmt(l * 1e9, 3)}$ nm — over a hundred atomic spacings. Electrons are not scattered by the ions themselves (a perfect lattice lets Bloch waves through) but by the lattice’s vibrations and by impurities, which is why cooling a pure metal makes $\ell$ grow enormously.`,
          visual: zigzag,
        };
      },
    }),
    num({
      id: 'density-scaling', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 8, 0.5]);
        return {
          prompt: t`If a metal had ${k === 0.5 ? 'half' : `${k} times`} as many conduction electrons per cubic metre as copper, by what factor would its Fermi energy differ from copper’s?`,
          answer: k ** (2 / 3), tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`$E_F$ grows as $n^{2/3}$, not in proportion to $n$.` }, { value: k ** 1.5, feedback: 'The power is 2/3, not 3/2.' }].filter((e) => Math.abs(e.value - k ** (2 / 3)) > 0.01),
          hints: [t`$E_F \propto n^{2/3}$: everything else in the formula is a constant.`, t`The factor is $${k}^{2/3}$.`],
          teach: t`$E_F \propto n^{2/3}$: pack in more electrons and they stack higher, but less than proportionally.`,
          explain: t`$E_F \propto n^{2/3}$, so the factor is $${k}^{2/3} = ${fmt(k ** (2 / 3), 4)}$. ${k === 3 ? t`Aluminium, with about 2.1 times copper’s density of electrons, has $E_F = 11.7$ eV.` : ''}`,
          visual: efChart(),
        };
      },
    }),
    mcq({
      id: 'heat-capacity', difficulty: 3,
      prompt: 'Classical physics gives every free particle a heat capacity of 3k/2. If each copper atom’s conduction electron behaved like that, copper’s heat capacity would be 50% above what is measured at room temperature. Why does the electron gas add only about 1%?',
      choices: [
        'Only electrons within about kT of the Fermi energy have empty states within reach, so only that small fraction can take up heat',
        'The conduction electrons are bound to their atoms and cannot move',
        'The electrons are so light that their kinetic energy is negligible',
        'Collisions with the lattice remove any heat the electrons take up',
      ],
      answer: 0,
      why: {
        1: 'They are free to roam the whole crystal — that is what makes copper conduct.',
        2: 'Light or not, each would carry 3kT/2 classically; their mass does not enter the classical heat capacity.',
        3: 'Collisions share heat between electrons and lattice; they do not make it vanish.',
      },
      hints: ['To absorb a little heat, an electron must move up into an empty state a little higher.', 'Where are the empty states? How many electrons are close enough to reach them?'],
      teach: t`The exclusion principle freezes all but the top sliver of the electron gas: a heat capacity smaller by about $kT/E_F$.`,
      explain: t`An electron deep in the gas would have to jump to an empty state — but every state within $kT$ of it is taken. Only the electrons within about $kT$ of $E_F$, a share near $kT/E_F \approx 1/270$, can respond. The quantum result, $\tfrac{\pi^2}{2}(kT/E_F)\,k$ per electron, is ${fmt(100 * (Math.PI ** 2 / 2) * (S.kT(300) / EF_CU) / 1.5, 2)}% of the classical $\tfrac32 k$ at 300 K. Explaining this was one of the first triumphs of Fermi–Dirac statistics (Sommerfeld, 1927).`,
      visual: dos({ EF: 7.03, T: 300, xmax: 9, caption: 'Copper at 300 K. Only the electrons in the thin orange slice at the Fermi energy can take up heat — too thin to see at this scale. Free-electron model.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-white-dwarf', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([1e8, 3e8, 1e9, 3e9]), ne = rho / (2 * U_KG), EF = S.fermiEnergy(ne) / 1e3;
        return {
          prompt: t`A white dwarf is a dead star’s carbon–oxygen core, crushed until its electrons form a Fermi gas. Its density is about $${tex(rho, 1)}$ kg/m³ (Sirius B’s average is about $2\times10^{9}$), with one electron for every two nucleons. Treating the electrons as non-relativistic, what is their Fermi energy, in keV?`,
          answer: EF, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: S.fermiEnergy(rho / U_KG) / 1e3, feedback: t`There is one electron per two nucleons: $n = \rho/(2\times1.661\times10^{-27}\ \text{kg})$.` }],
          hints: [t`$n = \rho/(2m_u)$ with $m_u = 1.661\times10^{-27}$ kg.`, t`$E_F = \dfrac{\hbar^2}{2m}(3\pi^2n)^{2/3}$ with $\hbar^2/2m = 6.104\times10^{-39}$ J m²; divide by $1.602\times10^{-16}$ J/keV.`],
          teach: t`The same Fermi-gas formula reaches the stars: squeezed electrons resist with an energy that grows as $n^{2/3}$.`,
          explain: t`$n = ${tex(ne, 3)}$ m⁻³ — some $10^{7}$ times copper’s — so $E_F = ${fmt(EF, 3)}$ keV, ${fmt((EF / 511) * 100, 2)}% of the electron’s rest energy, 511 keV. The pressure of this gas holds the star up. At still higher densities $E_F$ approaches $m_ec^2$, the electrons become relativistic, their pressure stiffens less, and above 1.4 solar masses (the Chandrasekhar limit) gravity wins.`,
          visual: efChart({ x: [27.9, 37.2], y: [0.3, 6.2], only: ['cu'], extra: { hlines: [{ y: r6(Math.log10(511e3)), label: 'electron rest energy, 511 keV', color: 'bad' }] }, caption: 'The Fermi energy against electron density (log scales), drawn across the metals; a white dwarf lies far off to the right. The red line is the electron’s rest energy, where the non-relativistic formula fails.' }),
        };
      },
    }),
    num({
      id: 'cp-speed', difficulty: 2,
      gen(r) {
        const key = r.pick(['na', 'ag', 'au', 'al']), m = S.METALS[key], EF = +fmt(S.fermiEnergy(m.n), 3);
        return {
          prompt: t`The Fermi energy of ${m.label} is ${EF} eV. How fast do its fastest conduction electrons move at absolute zero, in m/s?`,
          answer: S.fermiSpeed(EF), units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt((EF * S.QE) / S.ME), feedback: t`Kinetic energy is $\tfrac12mv^2$, so $v = \sqrt{2E_F/m}$ — keep the 2.` }],
          hints: [t`At the Fermi energy, $E_F = \tfrac12 mv_F^2$.`, t`$v_F = \sqrt{2E_F/m}$ with $E_F$ in joules: multiply eV by $1.602\times10^{-19}$.`],
          teach: t`The Fermi speed $v_F = \sqrt{2E_F/m}$ is about $10^{6}$ m/s in every metal — even at absolute zero.`,
          explain: t`$v_F = \sqrt{2(${EF})(1.602\times10^{-19})/(9.109\times10^{-31})} = ${tex(S.fermiSpeed(EF), 3)}$ m/s — about 0.5% of the speed of light, so non-relativistic physics is fine here.`,
          visual: dos({ EF, T: 10, caption: `${m.label[0].toUpperCase() + m.label.slice(1)} near absolute zero: states filled up to the Fermi energy. Free-electron model.` }),
        };
      },
    }),
    mcq({
      id: 'cp-hot-wire', difficulty: 2,
      prompt: 'The resistance of a copper wire rises by about 0.4% for every degree it warms. In the free-electron picture, why?',
      choices: [
        'The lattice vibrates more strongly, so the electrons collide more often and the time between collisions τ shrinks',
        'Heat frees more conduction electrons, and the extra electrons get in each other’s way',
        'The Fermi energy falls as the metal warms, slowing the electrons',
        'Thermal expansion makes the wire longer, which accounts for the whole rise',
      ],
      answer: 0,
      why: {
        1: 'Copper’s number of conduction electrons is fixed at one per atom. (Adding carriers with heat is what happens in a semiconductor, whose resistance falls.)',
        2: t`$E_F$ barely changes with temperature, and the current-carrying electrons still move at about the Fermi speed.`,
        3: 'Copper expands by only about 0.002% per degree — far too little.',
      },
      hints: [t`Resistivity is $\rho = m/(ne^2\tau)$. Which factor changes with temperature?`, 'What do the electrons collide with? A perfect, still lattice would let them through unhindered.'],
      teach: t`Metal resistance comes from collisions with lattice vibrations, which grow with temperature: $\rho = m/ne^2\tau$ rises as $\tau$ shrinks.`,
      explain: t`In $\rho = m/(ne^2\tau)$ only $\tau$ changes much: the hotter the lattice, the larger its vibrations and the more often they scatter electrons. Near room temperature $\rho \propto T$ roughly, which is why a platinum wire makes a good thermometer.`,
      visual: zigzag,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §9.5 (free-electron model of metals)', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-5-free-electron-model-of-metals' },
    { label: 'Ashcroft & Mermin, Solid State Physics, ch. 1–2 (free-electron densities and Fermi energies, Table 2.1)', url: 'https://archive.org/details/solidstatephysic00ashc' },
    { label: 'Sommerfeld (1928), Zur Elektronentheorie der Metalle auf Grund der Fermischen Statistik, Z. Phys. 47, 1', url: 'https://doi.org/10.1007/BF01391052' },
  ],
});
