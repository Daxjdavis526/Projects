// Stars and white dwarfs: a star as self-gravitating gas — the virial
// theorem, a star's mean temperature, and its negative heat capacity; then a
// dead star held up by degenerate electrons (T7.3). Pressure balance by
// scaling: non-relativistic electrons give R ∝ M^(−1/3); relativistic ones
// give a pressure that scales with radius exactly as gravity does, so there
// is one mass they can hold, M_Ch ∝ (ħc/G)^(3/2)/(μ_e m_p)², with the
// Lane–Emden coefficient giving 1.44 M☉ for μ_e = 2. Landau's energy argument
// as the Explore picture; Sirius B; accreting white dwarfs.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, G, HBAR, CL, MPROTON, MSUN, R_SUN, MPL3, OMEGA3, chandra, r4, texNum, apart } from './_th4.js';

const t = String.raw;
const COEF = (Math.sqrt(3 * Math.PI) / 2) * OMEGA3;           // 3.098
const BASE = MPL3 / MPROTON ** 2;                              // (ħc/G)^(3/2)/m_p², kg
const MCH2 = chandra(2) / MSUN;                                // 1.435
const NSTAR = ((HBAR * CL) / (G * MPROTON ** 2)) ** 1.5;       // nucleons in (ħc/G)^(3/2)/m_p²
const SIRIUS_B = { M: 1.018, R: 0.008098 };                    // M☉ (Bond et al. 2017, dynamical), R☉ (spectroscopic, as quoted with it)
const ENERGY = 'sqrt(1 + m^(2/3)/x^2) - 1 - m/x';              // Landau's model: kinetic (relativistic) + gravitational energy per electron
const REQ = 'sqrt(max(0.0001, 1 - m^(4/3)))/m^(1/3)';

/** Landau's energy curve for a fixed mass (units of M_Ch), with the equilibrium radius marked when there is one. */
function landauPic(m, { caption, mark = true } = {}) {
  const curves = [{ fn: ENERGY.replaceAll('m', String(m)), domain: [0.03, 3], color: m < 1 ? 'accent' : 'warn', width: 2.4 }];
  const points = [];
  if (mark && m < 1) {
    const R = Math.sqrt(1 - m ** (4 / 3)) / m ** (1 / 3), E = Math.sqrt(1 + m ** (2 / 3) / R ** 2) - 1 - m / R;
    points.push({ x: r4(R), y: r4(E), r: 5, color: 'gold' });
  }
  return { type: 'graph', params: { x: [0, 3], y: [-1, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 'radius (model units)', ylabel: 'energy per electron (mₑc²)', curves, points, hlines: [{ y: 0, color: 'ink4' }] }, caption };
}

/** M_Ch against μ_e. */
function muePic({ mark = null, caption } = {}) {
  return {
    type: 'graph',
    params: { x: [1.8, 2.3], y: [1.0, 1.9], aspect: 'wide', axesAt: 'edge', xlabel: 'nucleons per electron μₑ', ylabel: 'M(Ch) (M☉)', curves: [{ fn: `${r4(MCH2)}*(2/x)^2`, domain: [1.8, 2.3], color: 'accent', width: 2.4 }], vlines: [{ x: 2, color: 'ink3', label: 'He, C, O' }, { x: r4(56 / 26), color: 'ink3', label: '⁵⁶Fe' }, ...(mark === null ? [] : [{ x: r4(mark), color: 'gold' }])] },
    caption: caption || 'The Chandrasekhar mass against the number of nucleons per electron, M(Ch) ∝ 1/μₑ² (ideal, cold, non-rotating; the proton mass as the mass per nucleon).',
  };
}

export default lesson({
  id: 'phys3700.T11.1',
  title: 'Stars and white dwarfs',
  minutes: 20, difficulty: 3,
  intro: t`A star is a ball of gas holding itself up against its own gravity. While it burns, ordinary gas pressure does the holding, and the **virial theorem** ties its temperature to its size: a star that loses energy contracts and gets *hotter* — a negative heat capacity. When the fuel runs out, the core shrinks until its electrons are **degenerate** (T7.3), and their pressure, which needs no heat, holds it up as a white dwarf the size of the Earth. But only up to a point. Squeeze harder and the electrons become relativistic; then their pressure grows with density just as gravity does, and there is a largest mass they can support:

$$M_\text{Ch} = 3.10\left(\frac{\hbar c}{G}\right)^{3/2}\frac{1}{(\mu_e m_p)^2} \approx ${fmt(MCH2, 3)}\,M_\odot \quad(\mu_e = 2).$$

Subrahmanyan Chandrasekhar found it in 1931, aged 20; it is quantum mechanics, special relativity and gravity in one number.`,
  symbols: [
    { tex: 'M_\\text{Ch}', text: 'the Chandrasekhar mass: the largest mass an ideal cold white dwarf can have, in kg or solar masses ($M_\\odot = 1.988\\times10^{30}$ kg)' },
    { tex: '\\hbar', text: 'the reduced Planck constant, $1.055\\times10^{-34}$ J s — the quantum in degeneracy pressure' },
    { tex: 'c', text: 'the speed of light — the relativistic electrons’ speed limit' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}$ m³ kg⁻¹ s⁻²' },
    { tex: '\\mu_e', text: 'nucleons per electron: 2 for helium, carbon and oxygen; $56/26 = 2.15$ for iron-56' },
    { tex: 'm_p', text: 'the proton mass, $1.673\\times10^{-27}$ kg, standing for the mass per nucleon' },
    { tex: '3.10', text: 'the honest coefficient: $\\tfrac{\\sqrt{3\\pi}}{2}\\,\\omega_3$, where $\\omega_3 = 2.018$ comes from solving hydrostatic balance exactly for $P \\propto \\rho^{4/3}$ (the Lane–Emden equation)' },
  ],
  why: 'The Chandrasekhar mass decides which stars end as white dwarfs and which collapse to neutron stars or black holes, and accreting white dwarfs that approach it explode as the type Ia supernovae used to discover the accelerating universe.',
  visual: {
    type: 'graph',
    title: 'Landau’s argument: is there a radius that balances?',
    lead: t`A teaching model of a white dwarf (Landau, 1932): the energy per electron against the star’s radius, for a fixed mass. Squeezing raises each electron’s kinetic energy (degeneracy) and lowers its gravitational energy. Where the curve has a minimum (gold), the star can rest. Change the mass, in units of the Chandrasekhar mass.`,
    tasks: [
      'At M = 0.5 M(Ch) there is a clear minimum: a stable white dwarf.',
      'Raise the mass towards 1: the minimum slides towards zero radius and narrows — heavier white dwarfs are smaller, and at the limit the balance radius reaches zero.',
      'Go past 1: the curve falls forever as the radius shrinks. No balance exists; the star collapses.',
    ],
    params: {
      x: [0, 3], y: [-1, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 'radius (model units)', ylabel: 'energy per electron (mₑc²)',
      sliders: [{ key: 'm', label: 'Mass $M/M_\\text{Ch}$', min: 0.1, max: 1.3, step: 0.01, value: 0.5, explain: 'The star’s mass in units of the Chandrasekhar mass.' }],
      curves: [{ fn: ENERGY, domain: [0.03, 3], color: 'accent', width: 2.4 }],
      points: [{ x: REQ, y: `sqrt(1 + m^(2/3)/(${REQ})^2) - 1 - m/(${REQ})`, r: 6, color: 'gold', when: 'step(0.999 - m)' }],
      hlines: [{ y: 0, color: 'ink4' }],
      readouts: [{ label: 'equilibrium radius (model units)', expr: REQ, digits: 3, when: 'step(0.999 - m)' }, { label: 'equilibrium', expr: '0', digits: 1, when: 'step(m - 0.999)', unit: '\\text{none: collapse}' }],
    },
    caption: 'Landau’s one-zone teaching model: E = √(1 + (p/mₑc)²) − 1 − (gravity), with p ∝ M^(1/3)/R, scaled so the critical mass is 1. It captures R ∝ M^(−1/3) for light white dwarfs and the collapse above the limit; the real coefficient needs the full structure equations.',
  },
  example: {
    prompt: t`Show by balancing pressures that relativistic electrons can support only one mass, $M \sim (\hbar c/G)^{3/2}/(\mu_em_p)^2$, and evaluate it.`,
    visual: landauPic(1.1, { caption: 'Above the limit (here 1.1 M(Ch), teaching model): the energy keeps falling as the star shrinks, so nothing stops the collapse.' }),
    steps: [
      { label: 'Gravity', text: t`Hydrostatic balance, $dP/dr = -Gm(r)\rho/r^2$, says the central pressure must be about $P \sim \dfrac{GM}{R}\cdot\dfrac{M}{R^3} = \dfrac{GM^2}{R^4}$.` },
      { label: 'Gentle squeeze', text: t`Non-relativistic degenerate electrons push with $P \sim \dfrac{\hbar^2}{m_e}n_e^{5/3}$, where $n_e \sim \dfrac{M}{\mu_em_pR^3}$. That is $\propto M^{5/3}/R^5$; setting it equal to $GM^2/R^4$ gives $R \propto M^{-1/3}$: **more massive white dwarfs are smaller**.` },
      { label: 'Hard squeeze', text: t`Shrinking pushes the Fermi momentum $p_F \sim \hbar n_e^{1/3}$ past $m_ec$. Then each electron’s energy is $\approx p_Fc$, and $P \sim \hbar c\,n_e^{4/3} \sim \dfrac{\hbar c}{(\mu_em_p)^{4/3}}\dfrac{M^{4/3}}{R^4}$.` },
      { label: 'One mass', text: t`Both sides now go as $1/R^4$: the radius cancels. Balance happens only if $\dfrac{\hbar c\,M^{4/3}}{(\mu_em_p)^{4/3}} \sim GM^2$, so $M \sim \left(\dfrac{\hbar c}{G}\right)^{3/2}\dfrac{1}{(\mu_em_p)^2}$. Lighter, and the electrons win and the star expands until they are non-relativistic; heavier, and gravity wins at every radius.` },
      { label: 'The number', text: t`$(\hbar c/G)^{3/2}/m_p^2 = ${texNum(BASE, 3)}$ kg $= ${fmt(BASE / MSUN, 3)}\,M_\odot$. Divide by $\mu_e^2 = 4$ and multiply by the coefficient $${fmt(COEF, 4)}$ from the exact solution: $M_\text{Ch} = ${fmt(MCH2, 4)}\,M_\odot$.` },
      { label: 'Honest small print', text: t`Writing the mass per electron as $2\times1$ u, exact for carbon-12, gives $${fmt(chandra(2, 1.66053906892e-27) / MSUN, 3)}\,M_\odot$; quoted values of 1.44–1.46 differ only in that choice. Real carbon–oxygen white dwarfs go unstable slightly below the ideal limit (electron captures and general relativity), and observed ones are mostly near $0.6\,M_\odot$ — none above about 1.4.` },
    ],
    answer: t`$M_\text{Ch} = ${fmt(COEF, 4)}\,(\hbar c/G)^{3/2}/(\mu_em_p)^2 = ${fmt(MCH2, 4)}\,M_\odot$ for $\mu_e = 2$: the often-quoted $1.44\,M_\odot$.`,
  },
  practice: [
    num({
      id: 'virial-T', difficulty: 2,
      gen(r) {
        const [name, M, R] = r.pick([['the Sun', 1, 1], ['Sirius A', 2.063, 1.711], ['a red dwarf of 0.2 solar masses and 0.21 solar radii', 0.2, 0.21]]);
        const mu = 0.6, v = ((1 / 5) * G * M * MSUN * mu * MPROTON) / (KB * R * R_SUN);
        return {
          prompt: t`Treat ${name} ($M = ${M}\,M_\odot$, $R = ${R}\,R_\odot$) as a uniform ball of ideal gas with mean particle mass $0.6\,m_p$. The virial theorem, $2K + U = 0$ with $U = -\tfrac35GM^2/R$ and $K = \tfrac32NkT$, gives its mean temperature $kT = \tfrac15\,GM\mu m_p/R$. What is $T$, in kelvin?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: v * 5 / 3, feedback: 'With 2K = −U, (3/2)NkT·2 = (3/5)GM²/R gives kT = (1/5)GMμm(p)/R.' }, { value: v / 0.6, feedback: 'Use the mean particle mass 0.6 m(p): ionized gas has electrons as well as nuclei.' }], v),
          hints: [t`$kT = \dfrac{GM\mu m_p}{5R}$ with $\mu m_p = 0.6\times1.673\times10^{-27}$ kg.`, t`$M = ${texNum(M * MSUN, 3)}$ kg, $R = ${texNum(R * R_SUN, 3)}$ m.`],
          teach: 'The virial theorem sets a star’s mean temperature: kT ~ GMm/R — millions of kelvin for the Sun.',
          explain: t`$T = ${texNum(v, 3)}$ K. For the Sun the standard solar model gives a central temperature of about $1.57\times10^{7}$ K; a uniform-ball average is naturally lower, but the order of magnitude — millions of kelvin, hot enough for fusion — comes from gravity alone.`,
          visual: { type: 'graph', params: { x: [0, 2.5], y: [0, 8], aspect: 'wide', axesAt: 'edge', xlabel: '(M/M☉) / (R/R☉)', ylabel: 'mean T (million K)', curves: [{ fn: `${r4(((1 / 5) * G * MSUN * 0.6 * MPROTON) / (KB * R_SUN) / 1e6)}*x`, domain: [0, 2.5], color: 'accent', label: 'kT = GMμm(p)/5R', labelAt: 1.6, labelDy: -12 }], vlines: [{ x: r4(M / R), color: 'gold' }] }, caption: 'Virial mean temperature of a uniform ball of ionized gas (μ = 0.6) against M/R. A crude average: real stars are centrally concentrated and hotter in the core.' },
        };
      },
    }),
    mcq({
      id: 'negative-C', difficulty: 2,
      prompt: 'A star radiates energy into space. With no fusion to replace it, what happens to its temperature?',
      choices: [
        'It rises: total energy E = −K, so losing energy increases the thermal kinetic energy K as the star contracts',
        'It falls, as for any hot body that loses heat',
        'It stays the same: gravity exactly replaces the energy lost',
        'It falls at first, then rises once fusion restarts',
      ],
      answer: 0,
      why: { 1: 'That is true for bodies with positive heat capacity. A self-gravitating gas has E = K + U = −K by the virial theorem.', 2: 'Contraction releases twice the energy lost: half is radiated, half heats the gas.', 3: 'The question assumes no fusion; the heating happens anyway, through contraction.' },
      hints: [t`Virial theorem: $2K + U = 0$, so $E = K + U = -K$.`, t`If $E$ decreases, what does $K = -E$ do?`],
      teach: 'Self-gravitating gas has a negative heat capacity: it heats as it loses energy.',
      explain: 'Losing energy makes E more negative, so K = −E grows: the star contracts, gravity releases energy, half of it is radiated and half heats the gas. This is how a protostar heats up to ignite fusion — and the same negative heat capacity reappears in black holes (T11.2).',
      visual: { type: 'graph', params: { x: [0.3, 3], y: [-3.5, 3.5], aspect: 'wide', axesAt: 'edge', xlabel: 'radius R (arbitrary units)', ylabel: 'energy (arbitrary units)', curves: [{ fn: '1/x', domain: [0.3, 3], color: 'warn', label: 'thermal K', labelAt: 0.6, labelDx: 8 }, { fn: '-2/x', domain: [0.3, 3], color: 'accent', label: 'gravitational U', labelAt: 1.2, labelDy: 14 }, { fn: '-1/x', domain: [0.3, 3], color: 'gold', label: 'total E = −K', labelAt: 2.2, labelDy: -12 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'Virial balance of a star in equilibrium at each radius: as it shrinks, U falls twice as fast as K rises, so E falls while K — the temperature — climbs.' },
    }),
    num({
      id: 'mass-radius', difficulty: 2,
      gen(r) {
        const M2 = r.pick([0.5, 0.6, 0.7, 0.8]), v = SIRIUS_B.R * 695.7 * (SIRIUS_B.M / M2) ** (1 / 3);
        return {
          prompt: t`Sirius B has $M = ${SIRIUS_B.M}\,M_\odot$ and radius $${fmt(SIRIUS_B.R * 695.7e3, 4)}$ km. Using the non-relativistic white-dwarf scaling $R \propto M^{-1/3}$, estimate the radius of a $${M2}\,M_\odot$ white dwarf, in thousands of km.`,
          answer: v, units: '', tol: { rel: 0.01 },
          errors: apart([{ value: SIRIUS_B.R * 695.7 * (M2 / SIRIUS_B.M) ** (1 / 3), feedback: 'Heavier white dwarfs are smaller: R ∝ M to the −1/3.' }, { value: SIRIUS_B.R * 695.7 * (SIRIUS_B.M / M2), feedback: 'Use the one-third power.' }], v),
          hints: [t`$R_2 = R_1\,(M_1/M_2)^{1/3}$.`, t`$(${SIRIUS_B.M}/${M2})^{1/3} = ${fmt((SIRIUS_B.M / M2) ** (1 / 3), 4)}$.`],
          teach: 'White dwarfs shrink as they gain mass: R ∝ M^(−1/3) while the electrons are non-relativistic.',
          explain: t`$R \approx ${fmt(v, 3)}$ thousand km — Earth-sized (Earth: 6.37 thousand km). Real ${M2} $M_\odot$ white dwarfs are somewhat larger than this: Sirius B’s electrons are already partly relativistic, which makes it smaller than the pure $M^{-1/3}$ law, so scaling from it undershoots.`,
          visual: { type: 'graph', params: { x: [0, 1.6], y: [0, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'mass (M/M(Ch))', ylabel: 'radius (model units)', curves: [{ fn: 'x^(-1/3)', domain: [0.15, 1.6], color: 'ink3', dash: true, label: 'R ∝ M^(−1/3)', labelAt: 1.25, labelDy: -10 }, { fn: 'sqrt(max(0, 1 - x^(4/3)))/x^(1/3)', domain: [0.15, 0.9999], color: 'accent', label: 'with relativity', labelAt: 0.35, labelDy: 14 }], vlines: [{ x: 1, color: 'warn', label: 'limit' }] }, caption: 'Mass–radius relation in Landau’s teaching model: the non-relativistic law (dashed) and the relativistic one (blue), which falls to zero radius at the limit.' },
        };
      },
    }),
    expr({
      id: 'scaling', difficulty: 3,
      prompt: t`Setting the relativistic degeneracy pressure $\dfrac{\hbar c\,M^{4/3}}{(\mu m)^{4/3}R^4}$ equal to the gravitational pressure $\dfrac{GM^2}{R^4}$ (all order-one factors dropped), solve for $M$.`,
      answer: '(hbar*c/G)^(3/2)/(mu*m)^2',
      answerTeX: t`\left(\frac{\hbar c}{G}\right)^{3/2}\frac{1}{(\mu m)^2}`,
      vars: { hbar: [0.5, 2], c: [0.5, 2], G: [0.5, 2], mu: [1, 3], m: [0.5, 2] },
      keys: [['ħ', 'hbar'], ['μ', 'mu']],
      lhs: 'M',
      errors: [{ answer: '(hbar*c/G)^(2/3)/(mu*m)^2', feedback: 'M^(2/3) = ħc/(G(μm)^(4/3)): raise both sides to the power 3/2.' }, { answer: '(G/(hbar*c))^(3/2)/(mu*m)^2', feedback: 'Stronger gravity should lower the limit: G belongs in the denominator.' }],
      hints: [t`The $R^4$ cancels. Divide both sides by $M^{4/3}$: $\hbar c/(\mu m)^{4/3} = GM^{2/3}$.`, t`$M^{2/3} = \dfrac{\hbar c}{G(\mu m)^{4/3}}$; raise to the $\tfrac32$.`],
      teach: 'When pressure and gravity scale the same way with radius, the balance fixes a mass instead of a radius.',
      visual: { type: 'graph', params: { x: [-0.5, 1], y: [-1, 4], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'radius (arbitrary units)', ylabel: 'pressure (arbitrary units)', curves: [{ fn: '1 - 4*x', domain: [-0.5, 1], color: 'ink2', label: 'needed by gravity ∝ R⁻⁴', labelAt: 0.55, labelDy: -12 }, { fn: '1.6 - 4*x', domain: [-0.5, 1], color: 'accent', dash: true, label: 'relativistic electrons ∝ R⁻⁴', labelAt: 0.1, labelDx: 10 }, { fn: '1.2 - 5*x', domain: [-0.5, 1], color: 'warn', label: 'non-relativistic ∝ R⁻⁵', labelAt: -0.35, labelDx: 10 }] }, caption: 'Pressures against radius on log axes (vertical offsets arbitrary). Non-relativistic degeneracy pressure is steeper than gravity’s demand, so the lines cross: a balance radius exists. Relativistic pressure runs parallel: it is above or below everywhere, depending on the mass.' },
      explain: t`$M = (\hbar c/G)^{3/2}/(\mu m)^2$. The combination $(\hbar c/G)^{1/2}$ is the Planck mass, $2.18\times10^{-8}$ kg, so the limit is (Planck mass)³/(nucleon mass)² — astronomically large because gravity is so weak.`,
    }),
    num({
      id: 'nucleons', difficulty: 2,
      prompt: t`The number of nucleons in a Chandrasekhar-type star is set by $N \sim \left(\dfrac{\hbar c}{Gm_p^2}\right)^{3/2}$, the ratio of $\hbar c$ (the scale of quantum, relativistic physics) to gravity’s $Gm_p^2$ for two protons, raised to the $\tfrac32$. Evaluate $N$.`,
      answer: NSTAR, tol: { rel: 0.01 },
      errors: [{ value: (HBAR * CL) / (G * MPROTON ** 2), feedback: 'Raise the ratio to the power 3/2.' }, { value: ((HBAR * CL) / (G * MPROTON ** 2)) ** (2 / 3), feedback: 'The power is 3/2, not 2/3.' }],
      hints: [t`$\hbar c = 3.162\times10^{-26}$ J m; $Gm_p^2 = 1.867\times10^{-64}$ J m.`, t`Their ratio is about $1.7\times10^{38}$; raise it to $\tfrac32$.`],
      teach: 'Gravity is about 10³⁸ times weaker than ħc between two protons, so it takes about 10⁵⁷ nucleons to make a star.',
      explain: t`$\hbar c/(Gm_p^2) = ${texNum((HBAR * CL) / (G * MPROTON ** 2), 3)}$, so $N \approx ${texNum(NSTAR, 3)}$ — and $Nm_p = ${fmt((NSTAR * MPROTON) / MSUN, 3)}\,M_\odot$. Every star’s mass is set, to within a factor of a hundred, by this one number.`,
      visual: { type: 'graph', params: { x: [-2, 3], y: [0, 4], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'stellar mass (M☉)', ylabel: '', yticks: 0, points: [{ x: r4(Math.log10(0.08)), y: 1, r: 5, color: 'warn', label: 'lightest stars', labelDy: -12, labelDx: -30 }, { x: r4(Math.log10(MCH2)), y: 2, r: 5, color: 'accent', label: 'Chandrasekhar', labelDx: -36, labelDy: -12 }, { x: 2.2, y: 3, r: 5, color: 'violet', label: 'heaviest stars', labelDx: -40, labelDy: -12 }] }, caption: 'Masses of stars on a log scale: all within about a factor of a hundred of the 1.85 M☉ set by ħ, c, G and the proton mass. Positions approximate.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-iron', difficulty: 2,
      gen(r) {
        const [mue, what] = r.pick([[56 / 26, 'iron-56, with 26 electrons per 56 nucleons'], [52 / 24, 'chromium-52, with 24 electrons per 52 nucleons'], [62 / 28, 'nickel-62, with 28 electrons per 62 nucleons']]);
        const v = chandra(mue) / MSUN;
        return {
          prompt: t`Before a massive star explodes, its core is made of ${what}. What is the ideal Chandrasekhar mass for this composition, $M_\text{Ch} = ${fmt(MCH2, 4)}\,(2/\mu_e)^2\,M_\odot$, in solar masses?`,
          answer: v, units: 'Msun', tol: { rel: 0.005 },
          errors: apart([{ value: MCH2 * (2 / mue), feedback: 'M(Ch) ∝ 1/μₑ²: square the ratio.' }, { value: MCH2 * (mue / 2) ** 2, feedback: 'More nucleons per electron means fewer electrons to hold the same mass: the limit goes down.' }], v),
          hints: [t`$\mu_e = ${fmt(mue, 4)}$.`, t`$(2/\mu_e)^2 = ${fmt((2 / mue) ** 2, 4)}$.`],
          teach: 'The limit depends on composition through 1/μₑ²: neutron-rich matter supports less mass.',
          explain: t`$M_\text{Ch} = ${fmt(MCH2, 4)}\times${fmt((2 / mue) ** 2, 4)} = ${fmt(v, 3)}\,M_\odot$. When the growing iron core of a massive star passes roughly this mass (hot cores, and electron captures, shift the real value), degeneracy pressure fails and it collapses in under a second to a neutron star: a core-collapse supernova.`,
          visual: muePic({ mark: mue }),
        };
      },
    }),
    num({
      id: 'cp-accrete', difficulty: 3, transfer: true,
      gen(r) {
        const M0 = r.pick([0.9, 1.0, 1.1, 1.2]), rate = r.pick([1e-7, 3e-7, 5e-7]), v = (MCH2 - M0) / rate / 1e6;
        return {
          prompt: t`A carbon–oxygen white dwarf of $${M0}\,M_\odot$ pulls gas from a companion star and burns it steadily onto itself, gaining $${texNum(rate, 1)}\,M_\odot$ per year. At this rate, how long until it reaches the ideal Chandrasekhar mass for $\mu_e = 2$, $${fmt(MCH2, 3)}\,M_\odot$? Give millions of years.`,
          answer: v, units: '', tol: { rel: 0.01 },
          errors: apart([{ value: (1.44 - M0) / rate / 1e6, feedback: 'Close — use the computed value given, 1.435 M☉.' }, { value: MCH2 / rate / 1e6, feedback: 'Only the difference has to be added: M(Ch) − M₀.' }, { value: (MCH2 - M0) / rate, feedback: 'That is in years; give millions of years.' }].filter((e) => Math.abs(e.value - v) > 0.02 * v), v),
          hints: [t`The white dwarf must gain $M_\text{Ch} - M_0$.`, t`$t = (M_\text{Ch} - M_0)/\dot M$, with $\dot M$ in solar masses per year.`],
          teach: 'Accreting white dwarfs creep towards the Chandrasekhar mass; near it, carbon ignites and the star explodes as a type Ia supernova.',
          explain: t`$t = (${fmt(MCH2, 3)} - ${M0})/(${texNum(rate, 1)}) = ${texNum(v * 1e6, 3)}$ yr, or $${fmt(v, 3)}$ million years. In reality carbon ignites in the core a little before the ideal limit, near $1.38\,M_\odot$, and the white dwarf is destroyed: a type Ia supernova, bright and similar enough from one to the next that they serve as standard candles — the evidence in 1998 that the universe’s expansion is accelerating.`,
          visual: muePic({ mark: 2, caption: 'The ideal Chandrasekhar mass against composition; carbon–oxygen white dwarfs have μₑ = 2.' }),
        };
      },
    }),
    mcq({
      id: 'cp-why-limit', difficulty: 3,
      prompt: 'Why is there a maximum mass for a white dwarf, but no maximum mass for a ball of ordinary hot gas?',
      choices: [
        'Relativistic degeneracy pressure grows as density^(4/3), which rises with compression only as fast as gravity’s pull: above one mass, shrinking never helps',
        'Above 1.44 solar masses the star runs out of electrons',
        'White dwarfs are cold, and cold matter cannot resist gravity',
        'General relativity makes gravity infinitely strong above 1.44 solar masses',
      ],
      answer: 0,
      why: { 1: 'Every nucleus brings its electrons; the number of electrons grows with the mass.', 2: 'Degeneracy pressure does not need heat; cold white dwarfs hold up fine below the limit.', 3: 'The ideal limit comes from special relativity and quantum statistics; general relativity only shifts the real value slightly.' },
      hints: ['Compare how the pressure and the gravitational squeeze change as R shrinks, for each kind of pressure.', t`Gravity needs $P \propto M^2/R^4$. Relativistic electrons give $P \propto M^{4/3}/R^4$.`],
      teach: 'Relativity softens degeneracy pressure to scale like gravity, so only one mass can balance.',
      explain: t`Non-relativistic degeneracy pressure $\propto R^{-5}$ beats gravity’s $R^{-4}$ on compression, so a star can always shrink to a balance. Relativistic electrons give $R^{-4}$, the same as gravity: the radius drops out, and whether pressure wins depends only on the mass. Hot gas avoids the trap by heating up as it contracts — until it can no longer do so.`,
      visual: landauPic(0.9, { caption: 'Teaching model just below the limit (0.9 M(Ch)): a minimum still exists, at a small radius.' }),
    }),
  ],
  sources: [
    { label: 'Chandrasekhar, The Maximum Mass of Ideal White Dwarfs, ApJ 74, 81 (1931)', url: 'https://doi.org/10.1086/143324' },
    { label: 'Chandrasekhar, An Introduction to the Study of Stellar Structure (1939; Dover 1957), ch. XI (ω₃ = 2.018)', url: 'https://store.doverpublications.com/products/9780486604138' },
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.3 problems on white dwarfs', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Bond et al., The Sirius System and Its Astrophysical Puzzles, ApJ 840, 70 (2017)', url: 'https://doi.org/10.3847/1538-4357/aa6af8' },
    { label: 'Shapiro & Teukolsky, Black Holes, White Dwarfs, and Neutron Stars (Wiley, 1983), ch. 3', url: 'https://onlinelibrary.wiley.com/doi/book/10.1002/9783527617661' },
  ],
});
