// Equipartition of energy: ½kT per quadratic degree of freedom, U = Nf·½kT —
// and its failure: degrees of freedom freeze out when their quantum level
// spacing exceeds kT, computed here for hydrogen from its real levels.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { dofBars, dumbbellPic } from '../phys2210/_thermal.js';
import { KB, R, AMU, HBAR, HCK, MOLAR, DIATOMIC, thetaRot, thetaVib, diatomicCv, diatomicCvExpr, r4, texNum, apart } from './_count.js';

const t = String.raw;
const L10 = Math.log10;

// C_V/R against log₁₀ T for hydrogen (and nitrogen), computed from their quantum levels
function cvGraph({ T = null, n2 = true, marks = true, sliders, readouts, caption, alt } = {}) {
  const curves = [{ fn: diatomicCvExpr('H2'), color: 'accent', width: 2.6, domain: [1, 4], label: 'H₂', labelAt: 2.35, labelDx: 8, labelDy: 10 }];
  if (n2) curves.push({ fn: diatomicCvExpr('N2'), color: 'warn', width: 2, dash: true, domain: [r4(L10(77)), 4], label: 'N₂', labelAt: 3.05, labelDx: -26, labelDy: -12 });
  const vlines = [];
  if (marks) vlines.push({ x: r4(L10(thetaRot('H2'))), label: 'θ rot (H₂)', color: 'ink3' }, { x: r4(L10(thetaVib('H2'))), label: 'θ vib (H₂)', color: 'ink3' });
  if (T !== null) vlines.push({ x: typeof T === 'number' ? r4(L10(T)) : T, label: typeof T === 'number' ? `${T} K` : '', color: 'gold' });
  return {
    type: 'graph',
    params: {
      x: [1, 4], y: [1, 4], aspect: 'wide', xlabel: 'temperature T (K, log scale)', ylabel: 'molar Cᵥ / R', xlog: true, axesAt: 'edge',
      hlines: [{ y: 1.5, label: '3/2: translation', color: 'ink3' }, { y: 2.5, label: '5/2: + rotation', color: 'ink3' }, { y: 3.5, label: '7/2: + vibration', color: 'ink3' }],
      curves, vlines, ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
      alt: alt || 'The molar heat capacity of hydrogen rising in steps as rotation and vibration switch on',
    },
    caption: caption ?? 'Cᵥ/R computed from the real rotational and vibrational levels: normal hydrogen (ortho and para in their 3 : 1 room-temperature ratio) and nitrogen (drawn only where it is a gas at 1 atm). Ignored: hydrogen condensing near 20 K at 1 atm and dissociating above about 3000 K; vibrations treated as harmonic.',
  };
}

// a bent triatomic molecule (water) as a picture
const waterPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.3, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['-0.8*t', '-0.6*t'], t: [0.2, 1], color: 'ink2', width: 4 }, { param: ['0.8*t', '-0.6*t'], t: [0.2, 1], color: 'ink2', width: 4 }],
    points: [{ x: 0, y: 0, r: 15, color: 'bad', label: 'O', labelDx: -4, labelDy: -22 }, { x: -0.8, y: -0.6, r: 9, color: 'accent', label: 'H', labelDx: -22, labelDy: 0 }, { x: 0.8, y: -0.6, r: 9, color: 'accent', label: 'H', labelDx: 14, labelDy: 0 }],
  },
  caption: caption ?? 'A water molecule: three atoms, not in a line (104.5° bond angle). Not to scale.',
});

// the worked example: normal hydrogen at three temperatures
const EX = [50, 300, 3000].map((T) => ({ T, cv: diatomicCv('H2', T) }));
// bond lengths (Å) and atomic masses (u) for θ_rot = ħ²/(2Ik) (NIST)
const BOND = { H2: [0.7414, 1.00783, 'hydrogen, H₂'], D2: [0.7415, 2.01410, 'deuterium, D₂'], N2: [1.0977, 14.00307, 'nitrogen, N₂'] };
const thetaFromBond = (g) => { const [rA, m] = BOND[g], I = (m * AMU / 2) * (rA * 1e-10) ** 2; return (HBAR * HBAR) / (2 * I * KB); };

export default lesson({
  id: 'phys3700.T1.2',
  title: 'Equipartition of energy',
  minutes: 12, difficulty: 3,
  intro: t`In thermal equilibrium, every **quadratic degree of freedom** — every term in the energy of the form $c\,q^2$, like $\tfrac12mv_x^2$ or $\tfrac12\kappa x^2$ — holds on average $\tfrac12kT$. For $N$ molecules with $f$ such terms each, the thermal energy is

$$U_\text{thermal} = N f\cdot\tfrac12kT.$$

A monatomic gas has $f = 3$; a diatomic one adds 2 rotations; a vibration adds 2 (kinetic and potential); an atom in a solid has 6. But measured heat capacities show $f$ **changing with temperature**. Quantum mechanics gives each motion a ladder of energy levels, and a motion whose first step is much larger than $kT$ is never excited: it is **frozen out**. Hydrogen, the lightest molecule, shows it best — its rotation freezes below about 85 K.`,
  symbols: [
    { tex: 'U_\\text{thermal}', text: 'the energy stored in the random motion of the molecules, in joules' },
    { tex: 'N', text: 'the number of molecules' },
    { tex: 'f', text: 'the number of *active* quadratic degrees of freedom per molecule: 3 translations, plus rotations, plus 2 per vibration — those not frozen out' },
    { tex: '\\tfrac12kT', text: 'the average energy per degree of freedom, $2.07\\times10^{-21}$ J at 300 K' },
    { tex: '\\theta = \\Delta E/k', text: 'a motion’s characteristic temperature, its first level spacing in kelvin: active well above $\\theta$, frozen well below' },
  ],
  why: 'Equipartition predicts heat capacities, the ratio γ that sets sound speeds and nozzle performance, and — where it fails — the quantum steps that started modern physics.',
  visual: {
    ...cvGraph({
    T: 'log10(T)',
    sliders: [{ key: 'T', label: 'Temperature $T$', min: 10, max: 10000, value: 300, logScale: true, unit: '\\text{K}', explain: 'The gas temperature, on a logarithmic slider from 10 K to 10 000 K.' }],
    readouts: [
      { label: 'H₂: $C_V/R$', expr: diatomicCvExpr('H2', 'T'), digits: 3 },
      { label: 'H₂: active $f = 2C_V/R$', expr: `2*(${diatomicCvExpr('H2', 'T')})`, digits: 3 },
      { label: 'N₂: $C_V/R$', expr: diatomicCvExpr('N2', 'T'), digits: 3 },
    ],
    }),
    title: 'Hydrogen’s heat capacity climbs in quantum steps',
    lead: t`The molar heat capacity $C_V$ of hydrogen and nitrogen, divided by $R$, against temperature on a log scale. Equipartition says $C_V/R = f/2$: read off how many degrees of freedom are active. Slide the temperature and watch the readouts.`,
    tasks: [
      'Start at 10 K: hydrogen has $C_V/R = 1.5$ — only its three translations hold energy.',
      'Slide through 50–300 K: rotation switches on around $\\theta_\\text{rot} \\approx 85$ K and the curve climbs to 5/2.',
      'Go to 3000 K and beyond: vibration switches on — nitrogen’s first, because its vibrational quantum is smaller.',
    ],
  },
  example: {
    prompt: t`Predict $C_V/R$ for hydrogen gas at 50 K, 300 K and 3000 K by counting active degrees of freedom, and compare with the quantum calculation in the picture.`,
    visual: cvGraph({ n2: false, caption: 'Hydrogen’s Cᵥ/R from its quantum levels (normal hydrogen; dissociation and condensation ignored). The dotted lines mark the characteristic temperatures of rotation and vibration.' }),
    steps: [
      { label: 'The scales', text: t`Hydrogen’s rotational levels are $E_J = J(J+1)\,k\theta_\text{rot}$ with $\theta_\text{rot} = ${fmt(thetaRot('H2'), 3)}$ K; its vibrational quantum is $\theta_\text{vib} = ${Math.round(thetaVib('H2'))}$ K (from the measured 4161 cm⁻¹ band).` },
      { label: '50 K', text: t`$T < \theta_\text{rot}$: only translation is active, $f = 3$, $C_V/R = 1.5$. The calculation gives $${fmt(EX[0].cv, 3)}$.` },
      { label: '300 K', text: t`$\theta_\text{rot} \ll T \ll \theta_\text{vib}$: translation and two rotations, $f = 5$, $C_V/R = 2.5$. Calculation: $${fmt(EX[1].cv, 3)}$; measured (NIST, 298 K): 2.47.` },
      { label: '3000 K', text: t`$T$ is half of $\theta_\text{vib}$: the vibration is only partly active, so $C_V/R$ lies between 2.5 and 3.5. Calculation: $${fmt(EX[2].cv, 3)}$ — equipartition’s 3.5 is reached only well above 6000 K.` },
      { label: 'Why hydrogen', text: t`$\theta_\text{rot} = \hbar^2/(2Ik)$, and H₂ has the smallest moment of inertia of any molecule. Nitrogen’s is 30 times larger, so its $\theta_\text{rot}$ is only ${fmt(thetaRot('N2'), 2)} K — far below its boiling point.` },
    ],
    answer: t`Counting gives 1.5, 2.5 and (fully active) 3.5; the quantum calculation gives $${fmt(EX[0].cv, 3)}$, $${fmt(EX[1].cv, 3)}$ and $${fmt(EX[2].cv, 3)}$ — equipartition holds only where the motion’s level spacing is well below $kT$.`,
  },
  practice: [
    num({
      id: 'thermal-energy', difficulty: 1,
      gen(r) {
        const [g, f] = r.pick([['helium', 3], ['argon', 3], ['nitrogen', 5], ['oxygen', 5]]), n = r.pick([0.5, 1, 2, 4]), T = r.pick([250, 300, 400]);
        const U = (f / 2) * n * R * T;
        return {
          prompt: t`What is the thermal energy of ${n} mol of ${g} at ${T} K, by equipartition? (Room-temperature degrees of freedom; vibrations frozen.)`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: 1.5 * n * R * T, feedback: 'A diatomic molecule also rotates about two axes: f = 5.' }, { value: 2.5 * n * R * T, feedback: 'A single atom has no rotational energy that can be excited: f = 3.' }, { value: f * n * R * T, feedback: 'Each degree of freedom holds ½kT, not kT.' }], U),
          hints: [t`$U = Nf\cdot\tfrac12kT = \tfrac f2 nRT$.`, f === 3 ? 'A monatomic gas: f = 3.' : 'A diatomic gas at room temperature: f = 5.'],
          teach: t`$U_\text{thermal} = \tfrac f2 nRT$.`,
          explain: t`$U = \tfrac{${f}}{2}(${n})(8.314)(${T}) = ${fmt(U, 4)}$ J.`,
          visual: dofBars(f === 3 ? { trans: 3, title: `one ${g} atom` } : { trans: 3, rot: 2, frozen: { vib: 2 }, title: `one ${g} molecule at ${T} K` }),
        };
      },
    }),
    mcq({
      id: 'count-water', difficulty: 2,
      prompt: 'How many quadratic degrees of freedom does a water-vapour molecule have active at 400 K, where its vibrations are frozen?',
      choices: ['6', '5', '3', '9'],
      answer: 0,
      why: { 1: 'Five is for a *linear* molecule, which cannot store energy spinning about its own axis. Water is bent.', 2: 'Three counts translation only; the molecule also rotates.', 3: 'Nine would include the vibrations, which need around 2000–5000 K.' },
      hints: ['Three translations — and how many independent rotation axes does a bent molecule have?', 'A nonlinear molecule can rotate about all three axes.'],
      teach: 'Linear molecules have 2 rotational degrees of freedom; nonlinear ones have 3.',
      explain: t`3 translations + 3 rotations = 6, so $C_V = 3R$ for the vapour (measured: about $3.1R$ near 400 K — the small excess is the vibrations just beginning to stir).`,
      visual: waterPic(),
    }),
    num({
      id: 'theta-rot', difficulty: 3,
      gen(r) {
        const g = r.pick(['H2', 'D2', 'N2']), [rA, m, name] = BOND[g], I = (m * AMU / 2) * (rA * 1e-10) ** 2, th = thetaFromBond(g);
        return {
          prompt: t`The rotational levels of a diatomic molecule are $E_J = J(J+1)\dfrac{\hbar^2}{2I}$, with $I = \mu r^2$ and reduced mass $\mu = m/2$ for two identical atoms of mass $m$. For ${name} (bond length $${rA}$ Å, atomic mass $${m}$ u), find $\theta_\text{rot} = \hbar^2/(2Ik)$.`,
          answer: th, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: (HBAR * HBAR) / (2 * m * AMU * (rA * 1e-10) ** 2 * KB), feedback: t`Use the reduced mass $\mu = m/2$, not $m$.` }, { value: (HBAR * HBAR) / (I * KB), feedback: t`$\theta_\text{rot}$ has a 2 in the denominator: $\hbar^2/(2Ik)$.` }], th),
          hints: [t`$\mu = ${m}/2$ u $= ${texNum((m * AMU) / 2, 4)}$ kg; $I = \mu r^2$.`, t`$\theta = \hbar^2/(2Ik)$ with $\hbar = 1.0546\times10^{-34}$ J s.`],
          teach: t`A small moment of inertia means widely spaced rotational levels and a high $\theta_\text{rot}$.`,
          explain: t`$I = ${texNum((m * AMU) / 2, 4)}\times(${rA}\times10^{-10})^2 = ${texNum(I, 3)}$ kg m², so $\theta_\text{rot} = \dfrac{(1.0546\times10^{-34})^2}{2(${texNum(I, 3)})(1.381\times10^{-23})} = ${fmt(th, 3)}$ K. ${g === 'N2' ? 'Far below 77 K: nitrogen rotates freely whenever it is a gas.' : 'Comparable to the temperatures at which this gas can exist: its rotation visibly freezes.'}`,
          visual: dumbbellPic({ caption: `A diatomic molecule (not to scale). The ${name} bond is ${rA} Å long.` }),
        };
      },
    }),
    mcq({
      id: 'read-curve', difficulty: 2,
      prompt: t`Low-density hydrogen gas is held at 40 K. According to the curve, what is its molar $C_V$?`,
      choices: [t`$\tfrac32R$, because rotation is frozen`, t`$\tfrac52R$, as for any diatomic gas`, t`$\tfrac72R$, counting vibration`, t`$\tfrac12R$, one degree of freedom`],
      answer: 0,
      why: { 1: t`$\tfrac52R$ is the room-temperature value; at 40 K, $T$ is under half of $\theta_\text{rot}$, and the first rotational step is $2k\theta_\text{rot}$.`, 2: 'Vibration needs thousands of kelvin.', 3: 'The three translations are never frozen in a gas.' },
      hints: [t`Compare 40 K with $\theta_\text{rot} \approx 85$ K.`, 'Read the height of the blue curve at 40 K.'],
      teach: 'Below its characteristic temperature a motion holds almost no energy.',
      explain: t`At 40 K only translation is active: $C_V = \tfrac32R = 12.5$ J/(mol·K) (calculation: $${fmt(diatomicCv('H2', 40), 4)}R$). Hydrogen behaves like a monatomic gas.`,
      visual: cvGraph({ T: 40, n2: false, marks: false, caption: 'Hydrogen’s Cᵥ/R from its quantum levels; 40 K marked.' }),
    }),
    mcq({
      id: 'why-frozen', difficulty: 2,
      prompt: 'At 60 K, hydrogen’s rotation is largely frozen, while any gas of heavier diatomic molecules rotates freely. Why?',
      choices: [
        t`H₂’s moment of inertia is tiny, so its rotational levels ($\propto\hbar^2/I$) are spaced more widely than $kT$`,
        'Hydrogen molecules move too fast to rotate',
        'The bond in H₂ is stiffer, so it cannot bend',
        'Only light molecules follow quantum mechanics',
      ],
      answer: 0,
      why: { 1: 'Speed does not prevent rotation; the issue is the size of the energy steps.', 2: 'Bond stiffness sets the vibrational spacing, not the rotational one.', 3: 'All molecules are quantum; for heavy ones the steps are simply far below kT.' },
      hints: [t`Rotational energies are $J(J+1)\hbar^2/(2I)$. What is small about H₂?`],
      teach: 'Freeze-out happens when the first quantum step exceeds kT; for rotation the step is ħ²/I.',
      explain: t`$\theta_\text{rot} = \hbar^2/(2Ik)$ is ${fmt(thetaRot('H2'), 2)} K for H₂ and ${fmt(thetaRot('N2'), 2)} K for N₂: hydrogen’s atoms are light and close together.`,
      visual: dumbbellPic({ caption: 'A diatomic molecule: its rotation about a perpendicular axis carries energy in steps of order ħ²/I. Not to scale.' }),
    }),
    num({
      id: 'theta-vib', difficulty: 2,
      gen(r) {
        const [name, nu] = r.pick([['nitrogen (N₂)', 2329.9], ['oxygen (O₂)', 1556.4], ['carbon monoxide (CO)', 2143.3], ['hydrogen (H₂)', 4161.2]]);
        const th = nu * HCK;
        return {
          prompt: t`The vibrational quantum of ${name} is measured in its infrared or Raman spectrum as $${nu}\ \text{cm}^{-1}$, meaning $\Delta E = hc\tilde\nu$ with $\tilde\nu$ in cm⁻¹. What is $\theta_\text{vib} = \Delta E/k$?`,
          answer: th, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: nu * HCK / 100, feedback: 'Keep the wavenumber in cm⁻¹ with c in cm/s (or convert both to metres).' }], th),
          hints: [t`$\theta = hc\tilde\nu/k$, and $hc/k = 1.4388$ cm·K.`],
          teach: t`$hc/k = 1.4388$ cm·K turns a spectroscopic wavenumber straight into a temperature.`,
          explain: t`$\theta_\text{vib} = 1.4388 \times ${nu} = ${Math.round(th)}$ K — so at room temperature this vibration is frozen.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 3.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0.9*(x - 2)^2', color: 'accent', domain: [0.2, 3.8] }, ...[0, 1, 2].map((v) => ({ param: [`2 - ${r4(Math.sqrt((v + 0.5) * 0.8 / 0.9))} + 2*${r4(Math.sqrt((v + 0.5) * 0.8 / 0.9))}*t`, String(r4((v + 0.5) * 0.8))], t: [0, 1], color: 'gold', width: 2 }))], points: [{ x: 3.15, y: 0.4, r: 0.01, color: 'gold', label: 'v = 0', labelDx: 4 }, { x: 3.3, y: 1.2, r: 0.01, color: 'gold', label: 'v = 1', labelDx: 4 }, { x: 3.45, y: 2.0, r: 0.01, color: 'gold', label: 'v = 2', labelDx: 4 }], arrows: [{ from: [2, 0.4], to: [2, 1.2], color: 'bad', label: 'ΔE = hcν̃', labelDx: 8, labelDy: 22 }] }, caption: 'A vibration’s levels in its potential well, evenly spaced by ΔE (harmonic approximation; schematic).' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cold-hydrogen', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([30, 40, 50]), m = MOLAR.H2 * AMU, c = Math.sqrt(((5 / 3) * KB * T) / m);
        return {
          prompt: t`Hydrogen boil-off gas leaves a liquid-hydrogen tank and flows through a vent line at $${T}$ K. Estimate the speed of sound in it, $c = \sqrt{\gamma kT/m}$, choosing $\gamma = C_P/C_V$ from the degrees of freedom active at this temperature.`,
          answer: c, units: 'm/s', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt((1.4 * KB * T) / m), feedback: t`$\gamma = 7/5$ assumes rotation is active. At ${T} K hydrogen’s rotation is frozen: $f = 3$, $\gamma = 5/3$.` }], c),
          hints: [t`At ${T} K, compare with $\theta_\text{rot} \approx 85$ K: which motions are active?`, t`$f = 3$ gives $C_V = \tfrac32R$, $C_P = \tfrac52R$, $\gamma = 5/3$.`],
          teach: 'γ = (f + 2)/f uses only the active degrees of freedom — and for cold hydrogen that is 3.',
          explain: t`Rotation frozen, so $\gamma = 5/3$: $c = \sqrt{(5/3)(1.381\times10^{-23})(${T})/(3.347\times10^{-27})} = ${Math.round(c)}$ m/s. Assuming room-temperature $\gamma = 7/5$ would give $${Math.round(Math.sqrt((1.4 * KB * T) / m))}$ m/s, 8% low — a real error for a cryogenic flow designer. (Liquid hydrogen’s boil-off is para-hydrogen, whose rotation freezes even more completely.)`,
          visual: cvGraph({ T, n2: false, marks: false, caption: `Hydrogen’s Cᵥ/R from its quantum levels, with ${T} K marked (normal hydrogen; condensation ignored).` }),
        };
      },
    }),
    num({
      id: 'cp-rotation-share', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 5]), T = r.pick([250, 300, 350]), Urot = n * R * T;
        return {
          prompt: t`How much of the thermal energy of ${n} mol of nitrogen at ${T} K is stored in rotation?`,
          answer: Urot, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: 2.5 * n * R * T, feedback: 'That is the whole thermal energy. Rotation is 2 of the 5 active degrees of freedom.' }, { value: 0.5 * n * R * T, feedback: 'A diatomic molecule rotates about two axes: 2 × ½RT per mole.' }], Urot),
          hints: ['Two rotational degrees of freedom, each ½kT per molecule.', t`$U_\text{rot} = 2\times\tfrac12 nRT$.`],
          teach: 'Equipartition gives each active degree of freedom the same share.',
          explain: t`$U_\text{rot} = nRT = (${n})(8.314)(${T}) = ${fmt(Urot, 4)}$ J — two-fifths of the thermal energy.`,
          visual: dofBars({ trans: 3, rot: 2, frozen: { vib: 2 }, title: `one N₂ molecule at ${T} K` }),
        };
      },
    }),
    mcq({
      id: 'cp-classical', difficulty: 3,
      prompt: 'Which observation could classical physics, with equipartition applied to every motion, never explain?',
      choices: [
        t`Hydrogen’s $C_V$ dropping from $\tfrac52R$ to $\tfrac32R$ as it is cooled below about 100 K`,
        t`Helium having $C_V = \tfrac32R$ at room temperature`,
        'Two gases in contact reaching the same temperature',
        t`Nitrogen having a larger $C_V$ than argon at 300 K`,
      ],
      answer: 0,
      why: { 1: 'Three translations, ½kT each: equipartition gets it right.', 2: 'That is the zeroth law, no problem for classical physics.', 3: 'Nitrogen rotates, argon cannot: classical counting explains this.' },
      hints: ['Classically, a degree of freedom holds ½kT at every temperature.', 'Which answer has a heat capacity that changes with temperature?'],
      teach: 'A heat capacity that changes in steps with temperature is a quantum signature.',
      explain: 'Classically a rotation holds ½kT at every temperature, so Cᵥ could not depend on T. The drop needs quantized rotational levels whose spacing exceeds kT at low temperature.',
      visual: cvGraph({ n2: false, marks: false, caption: 'Hydrogen’s heat capacity from its quantum levels. Classical equipartition would draw a horizontal line.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §1.3 and §6.2–6.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Chemistry WebBook: constants of diatomic molecules (Huber & Herzberg)', url: 'https://webbook.nist.gov/chemistry/' },
  ],
});
