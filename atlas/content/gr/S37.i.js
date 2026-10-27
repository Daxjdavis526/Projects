// Open questions in gravitation — Intuition Mode. General relativity passes
// every test so far; the frontier, each item with its status (October 2026):
// quantum gravity [open; no tested theory; Planck scale 1.6×10⁻³⁵ m,
// 1.22×10¹⁹ GeV]; singularities [formation est-der (Penrose 1965), resolution
// open; cosmic censorship unproven]; the information paradox [open: islands
// reproduce the Page curve in toy models]; the cosmological-constant problem
// [open: ~10¹²³ with a Planck cutoff, ~10⁵⁵ with others]; dark matter's nature
// and dark energy's [open; effects est-obs]; the Hubble tension [open].
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, C, M_SUN, HBAR, KB, GEV, sci, round, T_SUN, logDots } from './_frontier.js';
import { rhoCrit } from '../../src/viz/model/gr-cosmology.js';

const t = String.raw;

const L_P = Math.sqrt((HBAR * G) / C ** 3);                 // m
const T_P = L_P / C;                                         // s
const E_P = Math.sqrt((HBAR * C ** 5) / G) / GEV;            // GeV
const RHO_P = C ** 5 / (HBAR * G * G);                       // kg/m³, Planck density
const RHO_L = 0.685 * rhoCrit(67.4);                         // kg/m³, observed dark energy
const HBARC = (HBAR * C) / GEV;                              // GeV m
const vacuum = (E) => (E ** 4 / HBARC ** 3) * GEV / (C * C); // kg/m³ for a cutoff energy E (GeV): E⁴/((ħc)³c²)
const hawkingT = (M) => (HBAR * C ** 3) / (8 * Math.PI * G * M * KB);   // K
const entropy = (M) => (4 * Math.PI * G * M * M) / (HBAR * C);         // in units of k_B
const RING = (B) => E_P / (0.2998 * B);                      // m: bending radius for a Planck-energy proton

export default lesson({
  id: 'gr.S37.i',
  title: 'What nobody knows yet',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['open'],
  intro: t`General relativity has passed every test so far, from free-fall experiments precise to one part in $10^{15}$ to the shadows and ringing of black holes. Yet it cannot be the final word, and the frontier is full of honest unknowns. Each carries its status:

- **Quantum gravity** — *open*: no tested theory joins gravity to quantum physics.
- **Singularities** — that they form is *derived* (Penrose, 1965); what replaces them is *open*, and whether they always hide behind horizons is unproven.
- **The information paradox** — *open*: does a black hole that evaporates destroy information? Calculations in simplified models say no; the real mechanism is unknown.
- **Dark matter and dark energy** — their effects are *observed*; what they are is *open*.
- **The Hubble tension** — *open*: 67–68 against 73 km/s/Mpc.

Where gravity and quantum physics must meet, the constants of both point to one length, the **Planck length**:`,
  equation: t`\ell_P = \sqrt{\frac{\hbar G}{c^3}} = 1.6\times10^{-35}\ \text{m}`,
  symbols: [
    { tex: '\\ell_P', text: 'the Planck length: where quantum effects of gravity should become strong. About $10^{-20}$ of a proton’s size' },
    { tex: '\\hbar', text: 'the reduced Planck constant, $1.0546\\times10^{-34}$ J s: the scale of quantum physics' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\,\\text{s}^{-2}$: the strength of gravity' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s: the scale of relativity' },
    { tex: 'E_P', text: 'the matching Planck energy, $\\sqrt{\\hbar c^5/G} = 1.22\\times10^{19}$ GeV — about $10^{15}$ times what the Large Hadron Collider reaches' },
  ],
  why: 'The questions on this map are where the next century of gravitational physics will be made — by people who know exactly what is measured, what is derived, and what is still a guess.',
  visual: {
    type: 'graph',
    title: 'How big a collider for quantum gravity?',
    lead: t`A proton bent round a ring by a magnetic field $B$ reaches energy $E \approx 0.3\,BR$ (in GeV, with $B$ in tesla and the bending radius $R$ in metres). Slide the radius and the field and see how far the Planck energy is.`,
    tasks: ['At the LHC’s bending radius, 2.8 km, with its 8.3 T magnets, you get about 7 TeV — the real machine.', 'Slide the radius until the point reaches the Planck energy: with LHC magnets the ring must be about 500 light-years in radius.', 'Even with magnets twice as strong, it is hundreds of light-years. Quantum gravity will have to be tested indirectly — through the early universe, black holes, or exquisitely precise experiments.'],
    params: {
      x: [2, 21], y: [1, 21], xlabel: 'log₁₀(bending radius in m)', ylabel: 'log₁₀(proton energy in GeV)',
      sliders: [
        { key: 'R', label: 'Bending radius $R$', min: 100, max: 1e21, value: 2804, logScale: true, unit: '\\mathrm{m}', explain: 'The radius of the ring’s curved sections. The LHC’s is about 2.8 km.' },
        { key: 'B', label: 'Magnetic field $B$', min: 1, max: 20, step: 0.01, value: 8.33, unit: '\\mathrm{T}', explain: 'The LHC’s superconducting dipoles reach 8.3 T.' },
      ],
      curves: [{ fn: 'log(0.2998*B) + x', color: 'accent' }],
      points: [{ x: 'log(R)', y: 'log(0.2998*B*R)', color: 'gold', r: 6 }],
      hlines: [{ y: round(Math.log10(E_P), 5), label: 'Planck energy', color: 'bad' }, { y: round(Math.log10(7000), 5), label: 'LHC, 7 TeV' }],
      vlines: [{ x: 6.8, label: 'Earth' }, { x: 11.17, label: 'Sun–Earth' }, { x: 15.98, label: '1 light-year' }],
      readouts: [
        { label: 'energy', expr: '0.2998*B*R', unit: '\\mathrm{GeV}', digits: 3 },
        { label: 'fraction of the Planck energy', expr: `0.2998*B*R/${round(E_P, 5)}`, digits: 3 },
        { label: 'radius in light-years', expr: 'R/9.4607e15', digits: 3 },
      ],
    },
    caption: 'E = 0.2998 BR GeV for a proton moving at nearly the speed of light, bent on radius R (m) by a field B (T). The radiation such a proton would shed on the bend — prohibitive at these energies — is ignored: a best case.',
  },
  example: {
    prompt: t`The cosmological-constant problem. Observations give dark energy a density $\rho_\Lambda = \Omega_\Lambda\rho_c$. A naive quantum estimate adds up the zero-point energy of quantum fields up to the Planck scale, giving the Planck density $c^5/(\hbar G^2)$. How badly do the two disagree?`,
    steps: [
      { label: 'Observed', text: t`$\rho_\Lambda = 0.685\times${sci(rhoCrit(67.4))} = ${sci(RHO_L)}$ kg/m³ — about the mass of three protons per cubic metre.` },
      { label: 'Naive estimate', text: t`$c^5/(\hbar G^2) = (2.998\times10^{8})^5/(1.0546\times10^{-34}\times(6.674\times10^{-11})^2) = ${sci(RHO_P)}$ kg/m³.` },
      { label: 'Ratio', text: t`$${sci(RHO_P)}/${sci(RHO_L)} = ${sci(RHO_P / RHO_L, 2)}$ — often called the worst prediction in physics.` },
      { label: 'Honest caveat', text: t`It is not a real prediction: the answer depends on where the sum is cut off. Stopping at the energies of known particle physics (about 100 GeV) gives about $10^{55}$ instead. Every estimate overshoots enormously, and no accepted theory explains the small observed value — an open question.` },
      { label: 'What would settle it', text: t`A theory that predicts $\rho_\Lambda$ — or evidence that dark energy is not a constant at all, which surveys such as DESI and Euclid are testing.` },
    ],
    answer: t`A ratio of about $${sci(RHO_P / RHO_L, 1)}$ with a Planck cutoff (about $10^{55}$ with others): the observed dark energy is unexplained.`,
  },
  practice: [
    multi({
      id: 'established', difficulty: 1,
      prompt: 'Which of these are established by observation? Select every one.',
      choices: [
        'Gravitational waves travel at the speed of light, to about one part in 10¹⁵',
        'Black holes cast shadows of the size general relativity predicts, to about 10%',
        'The expansion of the universe is speeding up',
        'Gravity is quantised, as string theory or loop quantum gravity describe',
        'Dark matter is made of a particular new particle',
        'Black holes emit Hawking radiation',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'No approach to quantum gravity has experimental confirmation yet.',
        4: 'Dark matter’s gravity is measured many ways; what it is made of is unknown, and no particle has been detected directly.',
        5: 'Predicted, not observed: real black holes are far colder than the cosmic microwave background, and their radiation would be undetectable.',
      },
      hints: ['For each, ask: has it been measured, or is it a prediction or a theory?'],
      teach: 'Keep three piles: measured, derived but unmeasured, and speculative — and say which pile each claim is in.',
      explain: 'GW170817’s gamma rays arrived 1.7 s after its gravitational waves, after 130 million years of travel; the Event Horizon Telescope’s images of M87* and Sgr A* match predicted shadows to about 10%; supernovae, the cosmic microwave background and galaxy surveys show the acceleration. The rest are open questions.',
      visual: logDots([['free fall of different materials (MICROSCOPE)', 1e-15, 'good'], ['speed of gravitational waves vs light (GW170817)', 1e-15, 'good'], ['light bending by the Sun (radio)', 1e-4, 'good'], ['black-hole shadows (EHT)', 0.1, 'good']], { xlabel: 'precision of the test (powers of ten; smaller is sharper)', range: [-17, 3], every: 2, caption: 'How precisely some predictions of general relativity have been tested, in powers of ten.' }),
    }),
    num({
      id: 'planck-units', difficulty: 2,
      gen(r) {
        const ask = r.pick(['length', 'time', 'energy']);
        const x = ask === 'length' ? L_P : ask === 'time' ? T_P : E_P;
        return {
          prompt: ask === 'length'
            ? t`Compute the Planck length $\ell_P = \sqrt{\hbar G/c^3}$. ($\hbar = 1.0546\times10^{-34}$ J s, $G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s)`
            : ask === 'time'
              ? t`The Planck time is the time light takes to cross a Planck length, $t_P = \ell_P/c = \sqrt{\hbar G/c^5}$. Compute it. ($\hbar = 1.0546\times10^{-34}$ J s, $G = 6.674\times10^{-11}$ SI)`
              : t`Compute the Planck energy $E_P = \sqrt{\hbar c^5/G}$, in GeV. (1 GeV $= 1.602\times10^{-10}$ J; $\hbar = 1.0546\times10^{-34}$ J s)`,
          answer: x, units: ask === 'length' ? 'm' : ask === 'time' ? 's' : '', tol: { rel: 0.01 },
          errors: ask === 'length' ? [{ value: (HBAR * G) / C ** 3, feedback: 'Take the square root.' }] : ask === 'time' ? [{ value: L_P, feedback: 'That is the Planck length; divide by c.' }] : [{ value: E_P * GEV, feedback: 'That is in joules; divide by 1.602×10⁻¹⁰ J per GeV.' }],
          hints: [ask === 'energy' ? t`$\hbar c^5 = ${sci(HBAR * C ** 5)}$; divide by $G$ and take the square root (in joules).` : t`$\hbar G = ${sci(HBAR * G)}$; divide by $c^${ask === 'length' ? 3 : 5}$, then take the square root.`],
          teach: 'The Planck scale — 10⁻³⁵ m, 10⁻⁴³ s, 10¹⁹ GeV — is where gravity and quantum physics must both matter.',
          explain: t`${ask === 'length' ? `$\\ell_P = ${sci(L_P)}$ m` : ask === 'time' ? `$t_P = ${sci(T_P)}$ s` : `$E_P = ${sci(E_P)}$ GeV — $${sci(E_P / 1.36e4, 2)}$ times the LHC’s 13.6 TeV collisions`}. Nothing built or observed comes close to this scale directly.`,
          visual: logDots([['a proton', 1.7e-15, 'violet'], ['the smallest scale the LHC resolves (ħc ÷ 7 TeV)', HBARC / 7000, 'accent'], ['an atom', 1e-10, 'teal']], { xlabel: 'length in m (powers of ten)', range: [-37, -6], every: 4, caption: 'Small lengths for scale, in powers of ten.' }),
        };
      },
    }),
    num({
      id: 'hawking', difficulty: 2,
      gen(r) {
        const ask = r.pick(['mass-cmb', 'temp']);
        const M = 1e12;
        const x = ask === 'mass-cmb' ? (HBAR * C ** 3) / (8 * Math.PI * G * KB * 2.725) : hawkingT(M);
        return {
          prompt: ask === 'mass-cmb'
            ? t`A black hole's predicted Hawking temperature is $T = \hbar c^3/(8\pi G M k_B)$. What mass of black hole would be exactly as warm as the cosmic microwave background, 2.725 K? ($k_B = 1.381\times10^{-23}$ J/K)`
            : t`A black hole's predicted Hawking temperature is $T = \hbar c^3/(8\pi G M k_B)$. How hot would a black hole of $10^{12}$ kg — the mass of a mountain — be? ($k_B = 1.381\times10^{-23}$ J/K)`,
          answer: x, units: ask === 'mass-cmb' ? 'kg' : 'K', tol: { rel: 0.01 },
          errors: [{ value: x * 8 * Math.PI, feedback: 'Keep the 8π in the denominator.' }],
          hints: [t`$\hbar c^3/(8\pi G k_B) = ${sci((HBAR * C ** 3) / (8 * Math.PI * G * KB))}$ K kg.`, ask === 'mass-cmb' ? 'Divide that by 2.725 K to get the mass.' : 'Divide that by the mass.'],
          teach: 'Hawking temperature falls as 1/M: only black holes lighter than the Moon would be warmer than the cosmic background.',
          explain: ask === 'mass-cmb'
            ? t`$M = ${sci(x)}$ kg — about ${sci(x / 7.35e22, 2)} Moon masses. Every black hole known is millions of times heavier, so colder than its surroundings: it absorbs more than it emits. Hawking radiation is derived, never observed.`
            : t`$T = ${sci(x)}$ K. Such small black holes — “primordial” ones from the early universe — are speculative: searches for their final bursts have found none.`,
          visual: {
            type: 'graph',
            params: {
              x: [8, 32], y: [-8, 16], xlabel: 'log₁₀(mass in kg)', ylabel: 'log₁₀(temperature in K)',
              curves: [{ fn: `${round(Math.log10((HBAR * C ** 3) / (8 * Math.PI * G * KB)), 5)} - x`, color: 'bad' }],
              vlines: [{ x: round(Math.log10(M_SUN), 4), label: 'the Sun’s mass' }],
            },
            caption: 'Predicted Hawking temperature against mass, both in powers of ten: it falls as 1/M.',
          },
        };
      },
    }),
    num({
      id: 'entropy', difficulty: 3,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass black hole', 10], ['Sagittarius A* (4.30 million solar masses)', 4.3e6], ['a 1-solar-mass black hole', 1]]);
        const x = entropy(m * M_SUN);
        return {
          prompt: t`A black hole's entropy, Bekenstein and Hawking found, is set by its horizon area: $S/k_B = 4\pi GM^2/(\hbar c)$. Compute it for ${name}. (1 solar mass $= 1.989\times10^{30}$ kg)`,
          answer: x, tol: { rel: 0.01 },
          errors: [{ value: x / m, feedback: 'The entropy grows as M², not M.' }, { value: x / (4 * Math.PI), feedback: 'Keep the 4π.' }].filter((e) => Math.abs(e.value - x) > 0.02 * x),
          hints: [t`$4\pi G/(\hbar c) = ${sci((4 * Math.PI * G) / (HBAR * C))}\ \text{kg}^{-2}$.`, t`Multiply by $M^2 = (${sci(m * M_SUN)})^2$.`],
          teach: 'Black-hole entropy grows as the horizon area, M² — a clue that the information content of a region may be set by its boundary.',
          explain: t`$S/k_B = ${sci(x)}$ — vastly more than the star that collapsed held. Where these microscopic states are, and how they encode what fell in, is part of the open information question.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 10.5], y: [70, 100], xlabel: 'log₁₀(mass in solar masses)', ylabel: 'log₁₀(entropy ÷ k_B)',
              curves: [{ fn: `${round(Math.log10(entropy(M_SUN)), 5)} + 2x`, color: 'violet' }],
            },
            caption: 'Bekenstein–Hawking entropy against mass, in powers of ten: it grows as M² (slope 2).',
          },
        };
      },
    }),
    mcq({
      id: 'settle-tension', difficulty: 2,
      prompt: 'What kind of evidence would settle the Hubble tension (67–68 against 73 km/s/Mpc)?',
      choices: [
        'Independent ways of measuring distances converging on one value — or early-universe data that demand, and pin down, a specific change to the standard model of cosmology',
        'A single new measurement with a smaller error bar than all the others',
        'A vote among cosmologists',
        'Nothing: it proves general relativity is wrong, so the question is closed',
      ],
      answer: 0,
      why: {
        1: 'Precision is not the issue: both camps are precise. The question is unrecognised systematic error, which only independent methods can expose.',
        2: 'Opinions do not decide measurements.',
        3: 'The tension is between a direct measurement and a model-based inference; nothing singles out general relativity.',
      },
      hints: ['The dispute is about possible hidden errors. How do you catch a hidden error in one method?'],
      teach: 'Tensions are settled by independent methods agreeing, not by one more precise number.',
      explain: 'Red-giant and carbon-star distance ladders, lensing time delays, masers and gravitational-wave standard sirens are all being pushed to the needed precision; the CMB experiments ACT and SPT test the early-universe side. As of October 2026 the tension stands, and its cause is open.',
      visual: {
        type: 'graph',
        params: {
          x: [62, 80], y: [-0.7, 3.7], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [[67.4, 0.5, 0, 'gold'], [70.39, 1.94, 1, 'violet'], [71.0, 8, 2, 'teal'], [73.04, 1.04, 3, 'accent']].map(([v, e, k, color]) => ({ param: [`${round(v - e, 4)} + ${round(2 * e, 4)}t`, String(k)], t: [0, 1], color, width: 2.6 })),
          points: [[67.4, 0, 'Planck CMB, 67.4 ± 0.5', 'gold'], [70.39, 1, 'CCHP red giants, 70.4 ± 1.9', 'violet'], [71.0, 2, 'GW sirens, 71 (±8)', 'teal'], [73.04, 3, 'SH0ES Cepheids, 73.0 ± 1.0', 'accent']].map(([v, y, label, color]) => ({ x: v, y, color, label })),
        },
        caption: 'Four measurements of H₀ in km/s/Mpc with error bars (the sirens’ asymmetric range simplified). Status October 2026: open.',
      },
    }),
    mcq({
      id: 'dark-matter', difficulty: 2,
      prompt: 'What is established about dark matter?',
      choices: [
        'Its gravity is measured in many independent ways — galaxy rotation, lensing of colliding clusters, the pattern of the cosmic microwave background — but what it is made of is unknown, and it has not been detected directly',
        'It has been detected in underground experiments as a new particle',
        'It has been replaced by a modified law of gravity that explains all the evidence',
        'It is the same thing as dark energy',
      ],
      answer: 0,
      why: {
        1: 'Underground detectors have set ever tighter limits but found no confirmed signal.',
        2: 'Modified gravity (such as MOND) fits galaxy rotation well but struggles with clusters and the cosmic microwave background; it is speculative, not established.',
        3: 'Dark matter clumps and attracts, like matter; dark energy is smooth and drives acceleration. They are different.',
      },
      hints: ['Separate the gravitational evidence from the question of what the stuff is.'],
      teach: 'Dark matter’s existence, through its gravity, is established; its nature is an open question.',
      explain: 'The cosmic microwave background alone requires a matter density about five times that of ordinary atoms, and the Bullet Cluster shows lensing mass offset from its gas. What dark matter is — a particle, something else — is unknown.',
      visual: {
        type: 'graph',
        params: {
          x: [0.3, 3.7], y: [0, 80], xlabel: ' ', ylabel: '% of the universe’s energy today', xticks: 4,
          curves: [[1, 4.9, 'teal'], [2, 26.6, 'violet'], [3, 68.5, 'gold']].map(([x, v, color]) => ({ param: [String(x), `${v}t`], t: [0, 1], color, width: 26 })),
          points: [[1, 4.9, 'ordinary atoms 4.9%'], [2, 26.6, 'dark matter 26.6%'], [3, 68.5, 'dark energy 68.5%']].map(([x, y, label]) => ({ x: x - 0.32, y: y + 4, r: 0.5, color: 'ink2', label })),
        },
        caption: 'What the universe is made of today, by energy (Planck 2018). Only the first bar is understood.',
      },
    }),
    mcq({
      id: 'information', difficulty: 2,
      prompt: 'Is the black-hole information paradox solved?',
      choices: [
        'Not settled: calculations in simplified models now give the curve expected if information is preserved, but how information gets out of a real black hole is unknown — and Hawking radiation itself has never been observed',
        'Yes: Hawking radiation has been measured and carries the information out',
        'Yes: information is simply destroyed, as Hawking first argued',
        'It is not a real question, because black holes do not exist',
      ],
      answer: 0,
      why: {
        1: 'Hawking radiation from astrophysical black holes is far too faint ever to detect; it has been seen only in laboratory analogues.',
        2: 'That was Hawking’s 1976 view; he later changed his mind, and most theorists now expect information to be preserved — without agreeing on how.',
        3: 'Black holes are observed: gravitational waves, shadows, stars orbiting Sgr A*.',
      },
      hints: ['Look at the picture: which curve do the newer calculations support, and in what kind of model?'],
      teach: 'The information paradox is open: toy-model calculations support information being preserved, but the real mechanism is unknown.',
      explain: 'Hawking’s calculation gives radiation whose entropy keeps rising until the hole is gone — information lost. If information is preserved, the entropy must turn over halfway (the Page curve). “Island” calculations since 2019 reproduce the Page curve in simplified models; whether and how this carries over to real black holes is unsettled.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 1.05], y: [0, 1.15], xlabel: 'time (fraction of the black hole’s lifetime)', ylabel: 'entropy of the radiation (schematic)',
          curves: [
            { fn: '1 - (1 - x)^(2/3)', domain: [0, 1], color: 'bad', label: 'Hawking: keeps rising — information lost', labelAt: 0.75, labelDx: -260, labelDy: -10 },
            { fn: 'min(1 - (1 - x)^(2/3), (1 - x)^(2/3))', domain: [0, 1], color: 'good', width: 3, label: 'Page curve — information preserved', labelAt: 0.15, labelDy: -14 },
          ],
        },
        caption: 'Schematic: the entropy of the radiation from an evaporating black hole. Numerical factors of order one are ignored.',
      },
    }),
    mcq({
      id: 'singularity-theorem', difficulty: 3,
      prompt: 'What does Penrose’s 1965 singularity theorem — the work recognised by the 2020 Nobel Prize — actually prove?',
      choices: [
        'That once a “trapped surface” forms — and ordinary matter obeys the null energy condition — some paths through spacetime must end after a finite time: general relativity predicts its own breakdown. It does not show that density becomes literally infinite',
        'That every star ends as a point of infinite density',
        'That quantum gravity removes singularities',
        'That singularities are always hidden inside horizons',
      ],
      answer: 0,
      why: {
        1: 'Not every star collapses to a black hole, and the theorem’s conclusion is that paths end (geodesic incompleteness), not a statement about density.',
        2: 'Nothing about quantum gravity is proven; most physicists expect it to replace the singularity, but how is open.',
        3: 'That is the cosmic censorship conjecture, which remains unproven.',
      },
      hints: ['A theorem has assumptions and a conclusion. Which energy condition does it assume, and what exactly does it conclude?', 'The conclusion is about paths of light and free fall that cannot be continued.'],
      teach: 'The singularity theorems prove that general relativity predicts its own breakdown; what happens there is open.',
      explain: 'Penrose showed that a trapped surface plus the null energy condition forces some light rays or free-fall paths to end in finite time. Hawking and Penrose extended it to cosmology. The theorems mark where general relativity stops being reliable — and where quantum gravity must take over.',
      visual: logDots([['an atom', 1e-10, 'teal'], ['a proton', 1.7e-15, 'violet'], ['the Planck length', L_P, 'bad']], { xlabel: 'length in m (powers of ten)', range: [-37, -6], every: 4, caption: 'Where general relativity is expected to need quantum corrections: near the Planck length, far below anything resolved so far.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vacuum', difficulty: 2,
      gen(r) {
        const [E, txt, name] = r.pick([[E_P, t`1.22\times10^{19}`, 'the Planck energy'], [1e16, t`10^{16}`, 'a “grand unification” energy'], [100, '100', 'the energy of the heaviest known particles']]);
        const x = vacuum(E) / RHO_L;
        return {
          prompt: t`If the zero-point energy of quantum fields is summed up to ${name}, $E = ${txt}$ GeV, the vacuum gets a mass density of about $E^4/((\hbar c)^3c^2)$, with $\hbar c = ${sci(HBARC, 4)}$ GeV m. How many times larger is that than the observed $\rho_\Lambda = ${sci(RHO_L)}$ kg/m³? (1 GeV $= 1.602\times10^{-10}$ J)`,
          answer: x, tol: { rel: 0.03 },
          errors: [{ value: 1 / x, feedback: 'Divide the estimate by the observed value, not the other way round.' }],
          hints: [t`$E^4/(\hbar c)^3$ is in GeV per m³; multiply by $1.602\times10^{-10}$ J/GeV and divide by $c^2$ to get kg/m³.`, t`The estimate comes to $${sci(vacuum(E))}$ kg/m³.`],
          teach: 'The vacuum-energy mismatch depends on the cutoff — 10⁵⁵ to 10¹²³ — but is enormous for every choice: an open problem.',
          explain: t`$${sci(vacuum(E))}/${sci(RHO_L)} = ${sci(x, 2)}$. However you cut off the sum, the naive estimate overshoots by dozens of orders of magnitude; why the observed value is so small is unexplained.`,
          visual: logDots([['observed dark energy', RHO_L, 'gold'], ['water', 1000, 'teal'], ['an atomic nucleus', 2.3e17, 'violet']], { xlabel: 'density in kg/m³ (powers of ten)', range: [-30, 110], every: 20, caption: 'Densities for scale, in powers of ten.' }),
        };
      },
    }),
    multi({
      id: 'cp-open', difficulty: 2,
      prompt: 'Which of these are open questions, as of 2026? Select every one.',
      choices: [
        'What dark energy is, and whether it changes with time',
        'Whether information escapes from evaporating black holes, and how',
        'What causes the Hubble tension',
        'Whether gravitational waves exist',
        'Whether black holes exist',
        'Whether the expansion of the universe is speeding up',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'Detected directly since 2015 — hundreds of signals so far.',
        4: 'Observed: gravitational waves from mergers, stars orbiting Sgr A*, shadows imaged by the Event Horizon Telescope.',
        5: 'Observed since 1998, by several independent methods.',
      },
      hints: ['Which of these have been measured, and which are still being argued about?'],
      teach: 'Open questions sit next to established facts; part of understanding physics is knowing which is which.',
      explain: 'Dark energy’s nature, the information paradox and the Hubble tension are open. Gravitational waves, black holes and cosmic acceleration are established by observation — the open questions are about what lies behind them.',
      visual: logDots([['gravitational waves detected (2015)', 2015, 'good'], ['accelerating expansion found (1998)', 1998, 'good'], ['first black-hole shadow imaged (2019)', 2019, 'good']], { xlabel: 'year of discovery', range: [3.29, 3.32], every: 1, caption: 'Some discoveries that turned questions into established facts (dots by year; the axis is uninformative here).' }),
    }),
    mcq({
      id: 'cp-headline', difficulty: 3, transfer: true,
      prompt: 'In 2025 LIGO–Virgo–KAGRA reported that in the merger GW250114 the final black hole’s horizon area was larger than the two initial areas combined, “at high credibility”. A headline said: “Hawking finally proved right.” What is the accurate statement?',
      choices: [
        'The measurement passed a test of Hawking’s area theorem — a result of classical general relativity — at high confidence; a test passed is strong support, not a proof, and it says nothing about Hawking radiation',
        'It proved Hawking radiation exists',
        'It proved general relativity is complete and final',
        'It showed the area can decrease, refuting Hawking',
      ],
      answer: 0,
      why: {
        1: 'The area theorem and Hawking radiation are different: the radiation is a quantum effect, far too faint to detect, and it actually makes horizons shrink.',
        2: 'One successful test, however clean, cannot show a theory is final; the open questions remain.',
        3: 'The area grew, as the theorem requires.',
      },
      hints: ['What exactly was measured — and which of Hawking’s results does it concern?', 'Is a successful test the same as a proof?'],
      teach: 'Read results by what was measured: a passed test supports a theory; it does not prove it, and it supports only what was tested.',
      explain: 'The initial horizons totalled about 240 000 km² and the final one about 400 000 km², consistent with the area theorem (1971), a classical prediction. Press language such as “finally proved” overstates any single measurement, and confusing the area theorem with Hawking radiation (1974) misreports which idea was tested.',
      visual: {
        type: 'graph',
        params: {
          x: [0.3, 2.7], y: [0, 480], xlabel: ' ', ylabel: 'horizon area (thousand km²)', xticks: 3,
          curves: [[1, 240, 'accent'], [2, 400, 'gold']].map(([x, v, color]) => ({ param: [String(x), `${v}t`], t: [0, 1], color, width: 30 })),
          points: [[1, 240, 'before: both holes'], [2, 400, 'after: one hole']].map(([x, y, label]) => ({ x: x - 0.3, y: y + 22, r: 0.5, color: 'ink2', label })),
        },
        caption: 'Total horizon area before and after the merger GW250114, as reported (rounded).',
      },
    }),
  ],
  sources: [
    { label: 'Penrose, “Gravitational collapse and space-time singularities”, Phys. Rev. Lett. 14, 57 (1965)', url: 'https://doi.org/10.1103/PhysRevLett.14.57' },
    { label: 'Almheiri et al., “The entropy of Hawking radiation”, Rev. Mod. Phys. (2021)', url: 'https://arxiv.org/abs/2006.06872' },
    { label: 'Martin, “Everything you always wanted to know about the cosmological constant problem” (2012)', url: 'https://arxiv.org/abs/1205.3365' },
    { label: 'LIGO–Virgo–KAGRA, GW250114 and Hawking’s area theorem (2025)', url: 'https://arxiv.org/abs/2509.08054' },
    { label: 'NIST CODATA: Planck length', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?plkl' },
  ],
});
