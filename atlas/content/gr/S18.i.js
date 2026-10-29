// Spacetime tells matter how to move; matter tells spacetime how to curve —
// Intuition Mode. Wheeler's two halves: free fall along worldlines of maximal
// aging (S12) and Einstein's field equations G + Λg = (8πG/c⁴)T (dissected in
// EQ.1). In Baez and Bunn's reading, a small ball of test particles at rest
// starts to change volume at V̈/V = −4πG(ρ + 3p/c²) + Λc²; required of every
// such ball, moving every way, that is the whole set of equations. The coupling
// (2.1 × 10⁻⁴³ N⁻¹) makes spacetime stiff; Λ (1.1 × 10⁻⁵² m⁻²) beats matter below
// 2ρ_Λ ≈ 1.2 × 10⁻²⁶ kg/m³, which is why today's expansion accelerates. The
// acceleration is observed; what Λ is, is open.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, LAMBDA, KAPPA, sci, round, ball } from './_curvature.js';

const t = String.raw;

const GYR = 3.156e16;                                        // s
const H0 = 67.4e3 / 3.0857e22;                               // s⁻¹, Planck 2018
const RHO_C = (3 * H0 * H0) / (8 * Math.PI * G);             // critical density, kg/m³
const RHO_M = 2.7e-27;                                       // today's mean matter density ≈ 0.315 ρ_c, kg/m³
const RHO_L = (LAMBDA * C * C) / (8 * Math.PI * G);          // Λ as a density, kg/m³
const M_TERM = 4 * Math.PI * G * RHO_M, L_TERM = LAMBDA * C * C;   // s⁻²
const ACC = (L_TERM - M_TERM) / 3;                           // ä/a today, s⁻²
const M_H = 1.674e-27;                                       // kg

// worldlines of free dust grains falling together (schematic)
const dustWorldlines = {
  type: 'graph',
  params: {
    x: [-1.6, 1.6], y: [0, 3.2], xlabel: 'position (schematic)', ylabel: 'time', grid: false,
    curves: [-1.2, -0.6, 0, 0.6, 1.2].map((x0) => ({ param: [`${x0}cos(0.45t)`, 't'], t: [0, 3.1], color: 'accent', width: 2 })),
  },
  caption: 'Worldlines of free dust grains, time running up, drawing together as they fall (schematic). Energy–momentum conservation, which the field equations demand, makes each grain follow a geodesic.',
};

// a slow start and then exponential growth: cosh of time over the time scale
const coshGraph = {
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 10], xlabel: 'time ÷ τ', ylabel: 'size ÷ starting size',
    curves: [{ fn: 'cosh(x)', color: 'accent', width: 2.6 }, { fn: 'e^x/2', color: 'ink3', width: 1.4, dash: true, domain: [1, 3] }],
  },
  caption: t`With only $\Lambda$, each axis of the ball grows as $\cosh(t/\tau)$ — slowly at first, then by a factor of $e$ every $\tau$ (dashed: $\tfrac12 e^{t/\tau}$).`,
};

// the Milky Way seen at a slant: the disc, the Sun's orbit in it, and the sphere used for the average density (schematic)
const galaxyPicture = {
  type: 'graph',
  params: {
    x: [-1.7, 1.7], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['1.45cos(t)', '0.42sin(t)'], t: [0, 6.2832], color: 'violet', width: 1.4 },
      { param: ['0.95cos(t)', '0.95sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true },
      { param: ['0.95cos(t)', '0.275sin(t)'], t: [0, 6.2832], color: 'gold', width: 1.6 },
    ],
    points: [{ x: 0, y: 0, color: 'ink2', r: 6 }, { x: 0.95, y: 0, color: 'gold', label: 'the Sun' }],
    arrows: [{ from: [0.95, 0], to: [0.95, 0.45], color: 'good', label: 'orbital speed v' }],
  },
  caption: 'The Milky Way at a slant (not to scale): its disc (violet), the Sun’s orbit within it (gold), and the sphere of the same radius (dashed) whose average density the orbital speed gives.',
};

export default lesson({
  id: 'gr.S18.i',
  title: 'Spacetime tells matter how to move; matter tells spacetime how to curve',
  minutes: 9, difficulty: 3, mode: 'intuition', badges: ['est-obs', 'open'],
  intro: t`John Wheeler summed up general relativity in one sentence: **spacetime tells matter how to move; matter tells spacetime how to curve.** The first half is free fall: a body with no forces on it follows the worldline of maximal aging through curved spacetime (step 12). The second half is **Einstein's field equations**, above: the part of curvature that matter controls (step 17), plus a cosmological constant, set equal to the stress–energy (step 16) times a tiny coupling. Baez and Bunn put them in words you can picture:

$$\left.\frac{\ddot V}{V}\right|_{t=0} = -4\pi G\left(\rho + \frac{3p}{c^2}\right) + \Lambda c^2$$

A small ball of freely falling test particles, at rest relative to one another, starts to change its volume at that rate. Demand it of **every** such ball, moving in every way, and you have all ten field equations. Their predictions have passed every test so far, from Mercury's orbit to merging black holes. What $\Lambda$ actually is remains **open**.`,
  equation: t`G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}\,T_{\mu\nu}`,
  symbols: [
    { tex: 'G_{\\mu\\nu}', text: 'the Einstein tensor (step 17): the part of spacetime’s curvature that matter controls, in m⁻². (Einstein’s G, not Newton’s)' },
    { tex: '\\Lambda', text: 'the cosmological constant, measured at about $1.1\\times10^{-52}\\ \\text{m}^{-2}$; a positive $\\Lambda$ makes empty space push things apart' },
    { tex: 'g_{\\mu\\nu}', text: 'the metric (step 8) — the unknown: solving the equations means finding it' },
    { tex: 'G', text: 'Newton’s gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\text{s}^{-2}$' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: '8\\pi G/c^4', text: 'the coupling, $2.1\\times10^{-43}\\ \\text{N}^{-1}$: spacetime is stiff, and only planets and stars curve it noticeably' },
    { tex: 'T_{\\mu\\nu}', text: 'the stress–energy tensor (step 16): energy density, momentum, pressure and stress, in J/m³' },
    { tex: '\\mu,\\ \\nu', text: 'labels running over $0, 1, 2, 3$ (time and space). Both sides are symmetric, so this is 10 equations' },
    { tex: '\\ddot V/V', text: 'in the falling-ball form: how fast a small ball of test particles starts to change volume (step 15), with $\\rho$ and $p$ the density and pressure at the ball' },
  ],
  why: 'Every later step solves these equations: black holes, gravitational waves and the expanding universe are all their solutions. To take them apart symbol by symbol, see [the dissection](#/lesson/gr.EQ.1).',
  visual: {
    type: 'gr-dustball',
    title: 'Matter against the cosmological constant',
    lead: t`A ball of test grains in a uniform universe of matter. Change the matter’s density and $\Lambda$, and press **Play** each time.`,
    tasks: [
      'Set Λ to 0: matter alone makes the ball shrink — gravity attracts.',
      'Set Λ to the measured value (1.00) and the density to today’s average, about 2.7 × 10⁻²⁷ kg/m³: the ball grows. That is why the universe’s expansion is speeding up.',
      'Find the density at which the ball neither grows nor shrinks: about 1.2 × 10⁻²⁶ kg/m³, some seven hydrogen atoms per cubic metre.',
    ],
    params: { mode: 'matter', rho: RHO_M, rhoRange: [1e-28, 1e-24], lambda: 1, lambdaSlider: true, t: 0.6 },
  },
  example: {
    prompt: t`Is the expansion of the universe slowing down or speeding up today? Use today’s average matter density, $\rho_m = ${sci(RHO_M, 2)}\ \text{kg/m}^3$ (Planck 2018), and $\Lambda = 1.1\times10^{-52}\ \text{m}^{-2}$.`,
    visual: ball({ mode: 'matter', rho: RHO_M, lambda: 1, t: 0.6 }, 'A ball of test grains in today’s universe: its matter and the measured Λ. It grows.'),
    steps: [
      { label: 'Λ as stuff', text: t`Moved to the right-hand side, $\Lambda$ acts like a fluid of density $\rho_\Lambda = \Lambda c^2/(8\pi G) = ${sci(RHO_L, 2)}\ \text{kg/m}^3$ with pressure $p_\Lambda = -\rho_\Lambda c^2$: the vacuum energy of step 16.` },
      { label: 'The rule for a ball of galaxies', text: t`For a ball of galaxies — even one that is already expanding — each axis accelerates at $\dfrac{\ddot a}{a} = \dfrac13\left[-4\pi G\left(\rho + \dfrac{3p}{c^2}\right) + \Lambda c^2\right]$: the falling-ball rule, per axis. It is the acceleration equation of step 31.` },
      { label: 'Matter’s term', text: t`$-4\pi G\rho_m = -4\pi\times6.674\times10^{-11}\times${sci(RHO_M, 2)} = ${sci(-M_TERM)}\ \text{s}^{-2}$ (galaxies and dark matter are dust: $p \approx 0$).` },
      { label: 'Λ’s term', text: t`$\Lambda c^2 = 1.1\times10^{-52}\times(2.998\times10^{8})^2 = ${sci(L_TERM)}\ \text{s}^{-2}$ — over four times larger.` },
      { label: 'The sum', text: t`$\dfrac{\ddot a}{a} = \dfrac{${sci(-M_TERM)} + ${sci(L_TERM)}}{3} = +${sci(ACC)}\ \text{s}^{-2}$. Positive: the expansion is speeding up, as supernova surveys discovered in 1998. Sense check: divided by $H_0^2 = ${sci(H0 * H0)}\ \text{s}^{-2}$ this gives the textbook deceleration parameter, $q_0 \approx ${round(-ACC / (H0 * H0), 2)}$.` },
    ],
    answer: t`$\ddot a/a \approx +${sci(ACC, 2)}\ \text{s}^{-2}$: $\Lambda$ beats today’s matter more than four to one, and the expansion accelerates.`,
  },
  practice: [
    mcq({
      id: 'which-half', difficulty: 1,
      prompt: 'In Wheeler’s sentence, what does “matter tells spacetime how to curve” stand for?',
      visual: ball({ mode: 'matter', rho: 1000, t: 0.5 }, 'Matter at a falling ball sets how fast the ball starts to shrink — curvature fixed by matter.'),
      choices: [
        t`Einstein’s field equations: the curvature $G_{\mu\nu} + \Lambda g_{\mu\nu}$ is set by the stress–energy $T_{\mu\nu}$`,
        'The rule of free fall: bodies follow worldlines of maximal aging',
        t`Newton’s law of gravitation, $F = GMm/r^2$`,
        'The equivalence principle: gravity cannot be felt in free fall',
      ],
      answer: 0,
      why: {
        1: 'That is the other half: spacetime telling matter how to move.',
        2: 'Newton’s law has no curvature in it; Einstein’s equations reduce to it only for weak fields and slow motion (step 19).',
        3: 'The equivalence principle says why gravity can be geometry, but it does not say how matter shapes that geometry.',
      },
      hints: ['One half is about how bodies move; the other is about what sets the curvature.'],
      teach: 'Matter tells spacetime how to curve through Einstein’s field equations; spacetime tells matter how to move through free fall along geodesics.',
      explain: t`The field equations take the matter’s stress–energy and fix the part of curvature it controls. The other half — free fall along geodesics, the worldlines of maximal aging — is how the curved spacetime then moves the matter.`,
    }),
    num({
      id: 'curvature-radius', difficulty: 2,
      gen(r) {
        const [what, rho, size, sizeText] = r.pick([
          ['water (1000 kg/m³)', 1000, 0, ''],
          ['a white dwarf (about 10⁹ kg/m³)', 1e9, 7e6, 'a white dwarf’s radius, about 7000 km'],
          ['a neutron star (about 5 × 10¹⁷ kg/m³)', 5e17, 1.2e4, 'a neutron star’s radius, about 12 km'],
          ['rock (2700 kg/m³)', 2700, 0, ''],
        ]);
        const L = 1 / Math.sqrt((8 * Math.PI * G * rho) / C ** 2);
        return {
          prompt: t`For dust, the field equations give a curvature (the Ricci scalar) of $R = 8\pi G\rho/c^2$, in m⁻². Its curvature radius, $1/\sqrt{R}$, is the distance over which spacetime there bends appreciably. Find it inside ${what}, in metres.`,
          answer: L, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 1 / ((8 * Math.PI * G * rho) / C ** 2), feedback: 'Take the square root: R is in m⁻², so 1/√R is a length.' }, { value: 1 / Math.sqrt(8 * Math.PI * G * rho / C), feedback: 'Divide by c², not c.' }],
          hints: [t`$R = 8\pi\times6.674\times10^{-11}\times\rho/(8.988\times10^{16})$.`, t`Then take $1/\sqrt{R}$.`],
          teach: 'The field equations turn a density into a curvature, 8πGρ/c² for dust; its radius is astronomical for ordinary matter and comparable to the star itself for a neutron star.',
          explain: t`$R = ${sci((8 * Math.PI * G * rho) / C ** 2)}\ \text{m}^{-2}$, so $1/\sqrt{R} = ${sci(L)}$ m${size ? ` — compared with ${sizeText}: ${L / size > 3 ? `${Math.round(L / size)} times larger, so gravity there is strong but Newton still does well` : 'about the same size, which is why a neutron star’s gravity is strongly relativistic'}` : ` — about ${round(L / 1.496e11, 2)} times the Earth–Sun distance. Ordinary matter barely curves spacetime`}.`,
          visual: ball({ mode: 'matter', rho: Math.min(rho, 1e18), t: 0.5 }, 'Inside uniform matter: the curvature its density fixes shrinks every small ball of test grains.'),
        };
      },
    }),
    num({
      id: 'balance', difficulty: 2,
      gen(r) {
        const lam = r.pick([1.0, 1.1, 1.2]) * 1e-52;
        const rho = (lam * C * C) / (4 * Math.PI * G);
        return {
          prompt: t`Matter makes a ball of test grains shrink, with $\ddot V/V = -4\pi G\rho$; the cosmological constant makes it grow, with $+\Lambda c^2$. Above what matter density does the ball shrink, if $\Lambda = ${sci(lam, 2)}\ \text{m}^{-2}$? Give it in kg/m³.`,
          answer: rho, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: rho / 2, feedback: 'That is $\\rho_\\Lambda = \\Lambda c^2/(8\\pi G)$, the vacuum energy as a density. The balance needs matter of twice that: $\\Lambda c^2/(4\\pi G)$.' }],
          hints: [t`Set $4\pi G\rho = \Lambda c^2$.`, t`$\rho = \Lambda c^2/(4\pi G) = ${sci(lam, 2)}\times8.988\times10^{16}/(4\pi\times6.674\times10^{-11})$.`],
          teach: 'Matter attracts and Λ repels: matter wins wherever its density exceeds Λc²/(4πG), about 10⁻²⁶ kg/m³.',
          explain: t`$\rho = \Lambda c^2/(4\pi G) = ${sci(rho)}\ \text{kg/m}^3$ — about ${Math.round(rho / M_H)} hydrogen atoms per cubic metre. Planets, stars and galaxies are far denser, so Λ is invisible inside them; the universe on average is now thinner, so Λ wins.`,
          visual: ball({ mode: 'matter', rho: 2e-26, lambda: 1, t: 0.55 }, 'A ball of test grains in matter of 2 × 10⁻²⁶ kg/m³ with the measured Λ.'),
        };
      },
    }),
    mcq({
      id: 'lambda-status', difficulty: 2,
      prompt: t`Which statement about the cosmological constant $\Lambda$ is right?`,
      visual: ball({ mode: 'matter', rho: 0, lambda: 1, t: 0.6 }, 'A ball of test grains in empty space with only Λ: it grows.'),
      choices: [
        'That the expansion of the universe is accelerating is observed; what Λ really is — and whether it is truly constant — is an open question',
        'Λ was a mistake of Einstein’s and is no longer part of the theory',
        'Quantum theory explains Λ as the energy of the vacuum and predicts its measured value',
        'Λ has been measured to be exactly zero',
      ],
      answer: 0,
      why: {
        1: 'Whatever Einstein thought of it, a positive Λ fits supernova, cosmic-microwave-background and galaxy-survey data, and it is part of the standard cosmological model.',
        2: 'The opposite: simple estimates of the vacuum’s energy overshoot the measured value by something like 10⁵⁵ to 10¹²⁰. That mismatch is one of physics’ great open problems.',
        3: 'It is measured to be positive, about 1.1 × 10⁻⁵² m⁻², from the accelerating expansion.',
      },
      hints: ['Separate what has been measured from what has been explained.'],
      teach: 'The accelerating expansion that Λ describes is observed; its physical nature is open.',
      explain: t`The acceleration is established by several independent kinds of observation, and a positive $\Lambda \approx 1.1\times10^{-52}\ \text{m}^{-2}$ fits them. Why it has that tiny value, and whether it is a constant at all (recent galaxy surveys hint, below discovery level, that it may change), is open.`,
    }),
    num({
      id: 'de-sitter', difficulty: 3,
      gen(r) {
        const lam = r.pick([1.0, 1.1, 1.2]) * 1e-52;
        const tau = 1 / Math.sqrt((lam * C * C) / 3);
        return {
          prompt: t`In empty space with only $\Lambda = ${sci(lam, 2)}\ \text{m}^{-2}$, each axis of a ball of test grains obeys $\ddot\xi = +(\Lambda c^2/3)\,\xi$, so it grows as $\cosh(t/\tau)$ with $\tau = 1/\sqrt{\Lambda c^2/3}$. How many billions of years is $\tau$? (1 billion years $= 3.156\times10^{16}$ s.)`,
          answer: tau / GYR, tol: { rel: 0.01 },
          errors: [{ value: 1 / Math.sqrt(lam * C * C) / GYR, feedback: 'Each axis gets one third of Λc²: τ = 1/√(Λc²/3).' }, { value: tau / 3.156e7, feedback: 'That is in years. Divide by 3.156 × 10¹⁶ s for billions of years.' }],
          hints: [t`$\Lambda c^2 = ${sci(lam, 2)}\times(2.998\times10^{8})^2$; divide by 3.`, t`Take the square root and its reciprocal to get $\tau$ in seconds.`, t`Divide by $3.156\times10^{16}$ s.`],
          teach: 'With only Λ, every ball of test grains ends up growing exponentially, by a factor e every τ = 1/√(Λc²/3) — about 17 billion years.',
          explain: t`$\Lambda c^2/3 = ${sci((lam * C * C) / 3)}\ \text{s}^{-2}$, so $\tau = ${sci(tau)}$ s $= ${sci(tau / GYR)}$ billion years. If $\Lambda$ is truly constant, this is the universe’s far future: distances growing by a factor $e$ every ${round(tau / GYR, 2)} billion years.`,
          visual: coshGraph,
        };
      },
    }),
    mcq({
      id: 'motion', difficulty: 3,
      prompt: t`The left side of the field equations is automatically “balanced” (step 17), so the right side must be too: energy and momentum must be conserved. What does that requirement do for a cloud of free dust?`,
      visual: dustWorldlines,
      choices: [
        'It makes every grain follow a geodesic: the field equations contain the dust’s law of motion',
        'Nothing: how matter moves is a separate law, added by hand',
        'It forces the dust to stay at rest',
        'It forces the dust to move at the speed of light',
      ],
      answer: 0,
      why: {
        1: 'For dust, energy–momentum conservation in curved spacetime is exactly the geodesic rule. (For other matter it supplies the motion together with that matter’s own laws, such as electromagnetism.)',
        2: 'Free dust falls; nothing holds it at rest.',
        3: 'Dust has rest mass: its grains move slower than light, along timelike geodesics.',
      },
      hints: ['What does conservation of energy and momentum say about a grain that feels no force?', 'A grain with no force on it keeps its energy–momentum in its own free-falling frame.'],
      teach: 'Because the curvature side is identically balanced, the field equations force energy–momentum conservation — and for dust that means geodesic motion.',
      explain: 'Wheeler’s two halves are not independent. The Einstein tensor’s divergence vanishes in every spacetime, so the equations demand that the stress–energy’s does too; for dust that is precisely the statement that each grain moves on a geodesic. Matter telling spacetime how to curve already includes spacetime telling matter how to move.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-galaxy', difficulty: 3, transfer: true,
      gen(r) {
        const [v, Rk] = r.pick([[230, 8.2], [220, 8.0], [240, 8.3]]);
        const R = Rk * 3.0857e19, rho = (3 * (v * 1e3) ** 2) / (4 * Math.PI * G * R * R);
        return {
          prompt: t`The Sun orbits the centre of the Milky Way at ${v} km/s, ${Rk} kpc out ($1\ \text{kpc} = 3.086\times10^{19}$ m). Treating the mass inside its orbit as a uniform sphere, $GM = v^2R$, so its average density is $\bar\rho = 3v^2/(4\pi G R^2)$. Find $\bar\rho$ in kg/m³ — and so decide whether $\Lambda$ matters inside the Galaxy.`,
          answer: rho, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: rho * 1e-6, feedback: 'Convert km/s to m/s before squaring.' }],
          hints: [t`$v = ${v}\times10^{3}$ m/s and $R = ${Rk}\times3.086\times10^{19}$ m.`, t`$\bar\rho = 3v^2/(4\pi G R^2)$; compare the result with the balance density, about $1.2\times10^{-26}\ \text{kg/m}^3$.`],
          teach: 'Galaxies are hundreds of thousands of times denser than the density at which Λ balances matter, so inside them Λ is negligible.',
          explain: t`$\bar\rho = \dfrac{3(${v}\times10^{3})^2}{4\pi\times6.674\times10^{-11}\times(${sci(R, 3)})^2} = ${sci(rho)}\ \text{kg/m}^3$ — about $${sci(rho / (2 * RHO_L), 2)}$ times the density at which matter and $\Lambda$ balance. Inside the Galaxy matter wins overwhelmingly; $\Lambda$ only shows across the near-empty gulfs between galaxy clusters.`,
          visual: galaxyPicture,
        };
      },
    }),
    mcq({
      id: 'cp-lambda-fluid', difficulty: 2,
      prompt: t`Moved to the right-hand side, the $\Lambda g_{\mu\nu}$ term looks like the stress–energy of a fluid filling empty space. What are that fluid’s energy density and pressure?`,
      visual: ball({ mode: 'matter', rho: 0, lambda: 1, t: 0.6 }, 'A ball of test grains in empty space with only Λ: it grows.'),
      choices: [
        t`Positive energy density $\rho_\Lambda c^2 = \Lambda c^4/(8\pi G)$ and negative pressure $p = -\rho_\Lambda c^2$`,
        t`Positive energy density and zero pressure, like dust`,
        t`Positive energy density and pressure $p = \rho_\Lambda c^2/3$, like light`,
        'Zero energy density and zero pressure: Λ is not a kind of energy',
      ],
      answer: 0,
      why: {
        1: t`Dust would make a ball of grains shrink. The ball grows, so the source $\rho + 3p/c^2$ must be negative.`,
        2: t`Light’s positive pressure doubles the attraction; it cannot make the ball grow.`,
        3: t`On the right-hand side, $\Lambda$ contributes exactly like an energy density $\Lambda c^4/(8\pi G)$ — about $5\times10^{-10}\ \text{J/m}^3$.`,
      },
      hints: [t`The ball grows, so $\rho + 3p/c^2 < 0$.`, 'Vacuum energy looks the same to every observer; that fixes its pressure.'],
      teach: 'The cosmological constant acts like vacuum energy: positive energy density with an equal and opposite (negative) pressure, which repels.',
      explain: t`$\Lambda$ behaves as a fluid with $\rho_\Lambda = \Lambda c^2/(8\pi G) = ${sci(RHO_L, 2)}\ \text{kg/m}^3$ and $p = -\rho_\Lambda c^2$. Its source is $\rho_\Lambda + 3p/c^2 = -2\rho_\Lambda < 0$: it pushes balls of grains — and clusters of galaxies — apart.`,
    }),
  ],
  sources: [
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation”, Am. J. Phys. 73, 644 (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'Carroll, Lecture Notes on General Relativity, §4.2–4.3 and ch. 8', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});
