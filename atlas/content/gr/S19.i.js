// How Einstein contains Newton — Intuition Mode. When gravity is weak
// (Φ/c² ≪ 1), motion slow (v ≪ c) and pressure small (p ≪ ρc²), both halves of
// general relativity become Newton's: the clock-rate map g₀₀ ≈ −(1 + 2Φ/c²) plus
// maximal aging gives g = −∇Φ; and for slow dust the falling-ball rule
// V̈/V = −4πGρ is Gauss's law, i.e. Poisson's equation ∇²Φ = 4πGρ — which, for a
// shell of grains round a planet, gives g = GM/r². Matching fixes the 8π. The
// same conditions mark where Newton fails: strong fields, light, pressure, and
// gravity that must travel (GW170817: speed of gravity = c to ~10⁻¹⁵).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { G, C, GM_SUN, GM_EARTH, AU, sci, round, log, ball } from './_curvature.js';

const t = String.raw;

const R_ISS = 6.771e6;                                         // m, from Earth's centre (about 400 km up)
const G_ISS = GM_EARTH / R_ISS ** 2;

// systems on the "how far from Newton" map: [label, GM/(rc²), (v/c)²]
const SYSTEMS = [
  ['GPS', GM_EARTH / (2.6562e7 * C * C), (3874 / C) ** 2],
  ['Earth’s orbit', GM_SUN / (AU * C * C), (29780 / C) ** 2],
  ['Mercury', GM_SUN / (4.6e10 * C * C), (58980 / C) ** 2],
  ['Hulse–Taylor', (2.83 * GM_SUN) / (1.95e9 * C * C), ((2 * Math.PI * 1.95e9) / 27907 / C) ** 2],
  ['S2 star', (4.3e6 * GM_SUN) / (120 * AU * C * C), (7.65e6 / C) ** 2],
  ['neutron star', (1.4 * GM_SUN) / (1.2e4 * C * C), (1.4 * GM_SUN) / (1.2e4 * C * C)],
];
const pnMap = (exclude = null, caption) => ({
  type: 'graph',
  params: {
    x: [-10.5, 1], y: [-10.5, 0.6], xlabel: 'log₁₀(GM/rc²)', ylabel: 'log₁₀((v/c)²)', xticks: 6, yticks: 6,
    curves: [{ fn: 'x', color: 'ink3', width: 1.2, dash: true }],
    shade: [{ fn: '-5', lower: '-10.5', from: -10.5, to: -5, color: 'good', alpha: 0.08 }],
    points: SYSTEMS.filter(([n]) => n !== exclude).map(([n, phi, v2]) => ({ x: round(log(phi), 4), y: round(log(v2), 4), color: n.startsWith('neutron') ? 'bad' : 'accent2', label: n })),
  },
  caption: caption ?? 'Two small numbers say how far a system is from Newton’s world: GM/(rc²) and (v/c)², both in powers of ten. Orbits sit near the dashed diagonal, where the two are about equal. The green corner is where Newton’s errors are below a hundred-thousandth.',
});

// a shell of test grains around a planet, all falling straight in (not to scale)
const shellPicture = (caption) => ({
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-2.2, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 },
      { param: ['1.8cos(t)', '1.8sin(t)'], t: [0, 6.2832], color: 'accent2', width: 1.2, dash: true },
    ],
    arrows: Array.from({ length: 12 }, (_, k) => {
      const a = (k * Math.PI) / 6;
      return { from: [round(1.8 * Math.cos(a), 4), round(1.8 * Math.sin(a), 4)], to: [round(1.42 * Math.cos(a), 4), round(1.42 * Math.sin(a), 4)], color: 'warn' };
    }),
    points: [
      ...Array.from({ length: 12 }, (_, k) => ({ x: round(1.8 * Math.cos((k * Math.PI) / 6), 4), y: round(1.8 * Math.sin((k * Math.PI) / 6), 4), color: 'accent2', r: 3.5 })),
      { x: -0.35, y: 0, color: 'teal', r: 0.01, label: 'planet' },
    ],
  },
  caption,
});

// a Hohmann-style transfer from Earth's orbit to Mars's (schematic)
const transferPicture = {
  type: 'graph',
  params: {
    x: [-1.9, 1.9], y: [-1.7, 1.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.2, dash: true },
      { param: ['1.524cos(t)', '1.524sin(t)'], t: [0, 6.2832], color: 'bad', width: 1.2, dash: true },
      { param: ['-0.262 + 1.262cos(t)', '1.234sin(t)'], t: [0, 3.1416], color: 'gold', width: 2.4 },
    ],
    points: [{ x: 0, y: 0, color: 'gold', r: 7 }, { x: 1, y: 0, color: 'teal', label: 'Earth at launch' }, { x: -1.524, y: 0, color: 'bad', label: 'Mars at arrival' }],
  },
  caption: 'A transfer from Earth’s orbit to Mars’s (schematic): half an ellipse around the Sun, about 6 × 10⁸ km of travel.',
};

// gravitational waves and light leaving a merger together (separation hugely exaggerated)
const raceGraph = {
  type: 'graph',
  params: {
    x: [0, 1.15], y: [0, 1.25], xlabel: 'distance travelled', ylabel: 'time', grid: false,
    curves: [
      { fn: 'x', color: 'violet', width: 2.2, domain: [0, 1], label: 'gravitational waves', labelAt: 0.55, labelDx: 10, labelDy: 12 },
      { fn: '1.04x', color: 'gold', width: 2.2, domain: [0, 1], label: 'gamma rays (if slower)', labelAt: 0.35, labelDx: -150, labelDy: -14 },
    ],
    points: [{ x: 0, y: 0, color: 'ink2', label: 'merger' }, { x: 1, y: 1, color: 'violet' }, { x: 1, y: 1.04, color: 'gold', label: 'Earth' }],
  },
  caption: 'The waves and the light from the neutron-star merger GW170817 raced each other for about 130 million years: here the light is drawn as if it were slightly slower, so the gap grows with distance. The difference in slope is exaggerated about 10¹⁴ times.',
};

export default lesson({
  id: 'gr.S19.i',
  title: 'How Einstein contains Newton',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`General relativity must reproduce Newton wherever Newton works — and it does, in both halves of Wheeler's sentence, whenever gravity is weak ($\Phi/c^2 \ll 1$), motion is slow ($v \ll c$) and pressure is small ($p \ll \rho c^2$):

- **Spacetime tells matter how to move.** In weak gravity the metric is just a clock-rate map: clocks tick at $1 + \Phi/c^2$ (step 23). Maximal aging then gives Newton's law of motion, $\vec g = -\nabla\Phi$: free bodies fall toward lower $\Phi$ (step 12).
- **Matter tells spacetime how to curve.** For slow dust the falling-ball rule $\ddot V/V = -4\pi G\rho$ (step 15), added up ball by ball, says the total inward pull over any closed surface is $4\pi G$ times the mass inside. That is **Poisson's equation**, above: Newton's law of gravity in field form.

Matching the two fixes the $8\pi$ in Einstein's coupling. The same three conditions say exactly where Newton must fail: near neutron stars and black holes, for light, for pressure — and wherever gravity has to travel.`,
  equation: t`\nabla^2\Phi = 4\pi G\rho`,
  symbols: [
    { tex: '\\Phi', text: 'the gravitational potential, in J/kg (= m²/s²); $\\Phi = -GM/r$ outside a round mass. In relativity it is the clock-rate map: clocks tick at $1 + \\Phi/c^2$' },
    { tex: '\\nabla^2\\Phi', text: '$\\dfrac{\\partial^2\\Phi}{\\partial x^2} + \\dfrac{\\partial^2\\Phi}{\\partial y^2} + \\dfrac{\\partial^2\\Phi}{\\partial z^2}$: how sharply $\\Phi$ curves along $x$, along $y$ and along $z$, added up. These are exactly the three tidal rates of step 14, in s⁻²' },
    { tex: '\\rho', text: 'the mass density at that point, in kg/m³' },
    { tex: 'G', text: 'Newton’s constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\text{s}^{-2}$' },
    { tex: '\\vec g = -\\nabla\\Phi', text: 'the gravitational acceleration, in m/s², pointing downhill in $\\Phi$: Newton’s law of motion, which maximal aging gives in weak gravity' },
  ],
  why: 'Every check of general relativity starts here: it must agree with Newton where Newton has been tested for three centuries, and its first corrections — of size GM/(rc²) and (v/c)² — are what the classic tests measure.',
  visual: {
    type: 'orbit',
    title: 'Newton’s orbit as the weak-field limit',
    lead: t`The same start, two laws of gravity: Einstein’s orbit in gold, Newton’s dashed. Distances are in units of $GM/c^2$ — the smaller the orbit in these units, the stronger the gravity.`,
    tasks: [
      'Start at r₀ = 40M with L = 6.4M, a nearly circular orbit: Einstein’s orbit swings round by about 33° each time, relative to Newton’s closed ellipse.',
      'Move in to r₀ = 12M with L = 3.9M: the swing grows to about 170° per orbit. The nearer the mass, in units of GM/c², the worse Newton does.',
      'Mercury orbits at about 4 × 10⁷ GM/c²: there the swing is 0.1″ per orbit — which is why Newton seemed perfect for two centuries.',
    ],
    params: { mode: 'schwarzschild', r0: 40, L: 6.4, compare: true, turns: 4 },
  },
  example: {
    prompt: t`Recover Newton’s inverse-square law from the falling-ball rule. A thin spherical shell of test grains surrounds the Earth at radius $r$ and is released at rest. For slow matter the rule, added up over everything inside a closed surface, says the volume inside starts to change at $\ddot V = -4\pi G M_\text{inside}$. How fast does each grain start to fall? Evaluate it at the International Space Station’s distance, $r = ${sci(R_ISS / 1e3, 4)}$ km.`,
    visual: shellPicture('A shell of test grains around the Earth (not to scale), released at rest: each falls straight inward with the same acceleration g, so the volume inside the shell shrinks.'),
    steps: [
      { label: 'The rule for a closed surface', text: t`Each small ball of grains inside obeys $\ddot V/V = -4\pi G\rho$; adding them all up, the volume enclosed by the shell starts to change at $\ddot V = -4\pi G M$, with $M$ the Earth’s mass inside. (Empty space between adds nothing.)` },
      { label: 'The shell', text: t`By symmetry every grain falls straight in with the same acceleration $g$. The volume inside is $V = \tfrac43\pi r^3$, so at the start, while $\dot r = 0$, $\ddot V = 4\pi r^2\,\ddot r = -4\pi r^2 g$.` },
      { label: 'Newton appears', text: t`$-4\pi r^2 g = -4\pi G M$ gives $g = \dfrac{GM}{r^2}$ — the inverse-square law, from the curvature rule of Einstein’s equation.` },
      { label: 'At the ISS', text: t`$g = ${sci(GM_EARTH, 4)}/(${sci(R_ISS, 4)})^2 = ${sci(G_ISS)}\ \text{m/s}^2$ — about 89% of its value on the ground. The station is not weightless for lack of gravity: it is falling.` },
      { label: 'What Einstein adds', text: t`Corrections of relative size $GM/(rc^2) = ${sci(GM_EARTH / (R_ISS * C * C), 2)}$ and $(v/c)^2$ — invisible in the station’s orbit, though its clocks feel them (step 23).` },
    ],
    answer: t`$g = GM/r^2 = ${sci(G_ISS)}\ \text{m/s}^2$ at the ISS: Newton’s law, recovered from the falling-ball form of Einstein’s equation.`,
  },
  practice: [
    mcq({
      id: 'conditions', difficulty: 1,
      prompt: 'Einstein’s equations reduce to Newton’s gravity when which conditions hold?',
      visual: pnMap(),
      choices: [
        t`Weak gravity ($GM/rc^2 \ll 1$), slow motion ($v \ll c$) and small pressure ($p \ll \rho c^2$)`,
        t`Only when the speed of light is taken to be infinite`,
        'Only for masses smaller than the Sun’s',
        'Only far away from every mass',
      ],
      answer: 0,
      why: {
        1: t`That loose slogan hides three separate small numbers — $GM/(rc^2)$, $(v/c)^2$ and $p/(\rho c^2)$ — and all three must be small.`,
        2: 'Mass alone does not decide: a solar-mass neutron star is strongly relativistic, while a supermassive black hole’s gravity is gentle far from it.',
        3: 'Newton works superbly close to the Sun and the Earth; what matters is how small GM/(rc²) is there, not the distance itself.',
      },
      hints: ['Look at the map: which two numbers place each system?', 'A third small number concerns pressure (steps 15–16).'],
      teach: 'Newton’s gravity is general relativity’s limit of weak fields, slow motion and small pressure — three small numbers.',
      explain: t`The corrections to Newton come in powers of $GM/(rc^2)$, $(v/c)^2$ and $p/(\rho c^2)$. In the Solar System all three are below about $10^{-7}$; near a neutron star they reach 0.2.`,
    }),
    num({
      id: 'planet-g', difficulty: 2,
      gen(r) {
        const [what, rho, Rkm] = r.pick([['Mars', 3934, 3389.5], ['the Moon', 3344, 1737.4], ['Mercury', 5427, 2439.7], ['Venus', 5243, 6051.8]]);
        const g = ((4 * Math.PI) / 3) * G * rho * Rkm * 1e3;
        return {
          prompt: t`Treat ${what} as a round ball of mean density ${rho} kg/m³ and radius ${Rkm} km. A shell of test grains at its surface obeys $\ddot V = -4\pi G M$, with $M = \tfrac43\pi R^3\rho$. What is the gravitational acceleration at its surface?`,
          answer: g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: 4 * Math.PI * G * rho * Rkm * 1e3, feedback: 'Write M = (4/3)πR³ρ: the surface gravity is (4π/3)GρR, not 4πGρR.' }, { value: ((4 * Math.PI) / 3) * G * rho * Rkm, feedback: 'Put the radius in metres.' }],
          hints: [t`For the shell, $-4\pi R^2 g = -4\pi G M$, so $g = GM/R^2$.`, t`With $M = \tfrac43\pi R^3\rho$: $g = \tfrac43\pi G\rho R$.`],
          teach: 'The falling-ball rule applied to a shell gives Newton’s g = GM/R², which for a uniform ball is (4π/3)GρR.',
          explain: t`$g = \tfrac43\pi G\rho R = \tfrac43\pi\times6.674\times10^{-11}\times${rho}\times${sci(Rkm * 1e3, 5)} = ${sci(g)}\ \text{m/s}^2$ — the measured value, to the rounding of the inputs. Outside a round body only its total mass matters, however it is arranged inside: the shell feels only the mass it encloses.`,
          visual: shellPicture('A shell of test grains at the surface of a uniform planet, released at rest (not to scale).'),
        };
      },
    }),
    num({
      id: 'how-far', difficulty: 2,
      gen(r) {
        const [what, GM, rr, rText, sysName] = r.pick([
          ['Mercury at its closest to the Sun', GM_SUN, 4.6e10, t`$GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $r = 4.60\times10^{7}$ km`, 'Mercury'],
          ['the Earth in its orbit', GM_SUN, AU, t`$GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $r = 1.496\times10^{8}$ km`, 'Earth’s orbit'],
          ['the star S2 at its closest to the black hole Sgr A*', 4.3e6 * GM_SUN, 120 * AU, t`$GM = 4.30\times10^{6}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $r = 120$ AU $= 1.795\times10^{10}$ km`, 'S2 star'],
          ['the Hulse–Taylor binary pulsar', 2.83 * GM_SUN, 1.95e9, t`a total of $GM = 2.83\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and a separation $r = 1.95\times10^{6}$ km`, 'Hulse–Taylor'],
        ]);
        const phi = GM / (rr * C * C);
        return {
          prompt: t`General relativity’s corrections to Newton for an orbit are of relative size about $GM/(rc^2)$. Compute it for ${what}, with ${rText}.`,
          answer: phi, tol: { rel: 0.01 },
          errors: [{ value: GM / (rr * C), feedback: 'Divide by c², not c.' }, { value: GM / (rr * 1e-3 * C * C), feedback: 'Put r in metres.' }],
          hints: [t`Convert $r$ to metres, then divide $GM$ by $r c^2$, with $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'The size of general relativity’s corrections to an orbit is set by GM/(rc²): parts in a hundred million in the Solar System, parts in ten thousand for stars skimming a black hole.',
          explain: t`$GM/(rc^2) = ${sci(phi)}$. ${phi > 1e-4 ? 'Large enough that GRAVITY measured the orbit’s swing directly: 12′ per orbit.' : phi > 1e-6 ? 'Large enough that its orbit’s swing and decay have been measured to high precision (step 27).' : 'Tiny — which is why Newton seemed perfect for so long, and why the effects take precise, patient measurement.'}`,
          visual: pnMap(sysName, 'Other systems on the map of GM/(rc²) against (v/c)², in powers of ten; the green corner is where Newton’s errors are below a hundred-thousandth.'),
        };
      },
    }),
    mcq({
      id: 'tidal-sum', difficulty: 2,
      prompt: t`$\nabla^2\Phi$ — the sum $\partial^2\Phi/\partial x^2 + \partial^2\Phi/\partial y^2 + \partial^2\Phi/\partial z^2$ — is exactly the sum of the three tidal rates of step 14. What, then, does Poisson’s equation $\nabla^2\Phi = 4\pi G\rho$ say?`,
      visual: ball({ mode: 'tides', body: 'earth', r: 2, t: 0.4, views: 'side' }, 'Tides near a planet: a stretch along the line and a squeeze across it, in both directions.'),
      choices: [
        'The three tidal rates add up to 4πGρ: to zero in empty space (2 − 1 − 1), to 4πGρ inside matter — the falling-ball rule',
        'The tides vanish in empty space',
        'The potential Φ is zero in empty space',
        'Gravity is stronger inside matter than outside it',
      ],
      answer: 0,
      why: {
        1: 'Each tidal rate is non-zero near a planet; only their sum vanishes.',
        2: t`Outside a round mass $\Phi = -GM/r$, which is not zero; what vanishes is the sum of its three second derivatives.`,
        3: 'Poisson’s equation is about the sum of second derivatives of Φ at a point, not about how strong g is there.',
      },
      hints: ['In empty space ρ = 0. What do the stretch and the two squeezes add up to?'],
      teach: 'Poisson’s equation says the three tidal rates sum to 4πGρ — the Newtonian face of Ricci curvature.',
      explain: t`The tidal rates are the second derivatives of $\Phi$ along three perpendicular directions. Poisson’s equation fixes only their **sum**: zero in vacuum (the stretch $2GM/r^3$ cancels the two squeezes), $4\pi G\rho$ inside matter. That sum is the Newtonian version of the Ricci curvature; the individual tides (the Weyl part) are set by matter elsewhere.`,
    }),
    multi({
      id: 'newton-misses', difficulty: 2,
      prompt: 'Which of these does Newton’s gravity — even with perfect data — fail to predict? Select every one that applies.',
      visual: pnMap(null, 'Where systems sit on the map of GM/(rc²) against (v/c)², in powers of ten. Light, with v = c, sits off the top of the map.'),
      choices: [
        'The full bending of starlight passing the Sun (Newton gives at most half)',
        'The 43″ per century by which Mercury’s orbit swings round',
        'Gravitational waves',
        'Clocks running slow deeper in a gravitational field',
        'The Moon’s orbit around the Earth',
        'The ocean tides',
      ],
      answer: [0, 1, 2, 3],
      why: {
        4: 'Newton predicts the Moon’s orbit superbly; relativity’s corrections there are parts in a billion.',
        5: 'Tides are differences in Newtonian gravity — Newton explained them in 1687.',
      },
      hints: ['Which of these need fast motion, strong fields, time, or travelling gravity?', 'Two of the six are pure, slow, weak-field Newtonian gravity.'],
      teach: 'Newton fails where his three conditions fail: light (v = c), precision orbits (accumulated (v/c)² effects), clocks (time is curved) and travelling gravity (waves).',
      explain: 'Light moves at c, so curved space bends it as much as curved time does: Newton gets half. Mercury’s swing builds up from (v/c)² corrections. Clock rates are the curvature of time, which Newton has no place for. And Newton’s Poisson equation has no time in it, so gravity there cannot travel as waves.',
    }),
    mcq({
      id: 'why-8pi', difficulty: 3,
      prompt: t`Einstein’s coupling is $8\pi G/c^4$. What fixes the $8\pi$?`,
      visual: shellPicture('A shell of test grains around a planet: in weak gravity Einstein’s equations must give Newton’s g = GM/r² here.'),
      choices: [
        t`Requiring weak, slow gravity to reproduce Newton’s $\nabla^2\Phi = 4\pi G\rho$, tested by every planetary orbit`,
        'A fit to Mercury’s 43″ per century',
        'The speed of gravitational waves',
        'Nothing: it is a convention, and any number would do',
      ],
      answer: 0,
      why: {
        1: 'Mercury’s swing came out right with no adjustable number — that was its triumph. The coupling was already fixed by Newton’s limit.',
        2: 'The waves travel at c whatever the coupling; the coupling sets how strongly matter makes them.',
        3: 'Change it and gravity would be stronger or weaker than Newton’s G says — contradicting every orbit ever measured.',
      },
      hints: ['General relativity must agree with Newton where Newton works.', t`The $00$ part of the equations, for slow dust, must become Poisson’s equation with $4\pi G$.`],
      teach: 'The 8π in Einstein’s equations is fixed by demanding that weak, slow gravity be exactly Newton’s.',
      explain: t`For slow dust, the time–time part of $G_{\mu\nu} = \kappa T_{\mu\nu}$ becomes $\nabla^2\Phi = \tfrac{\kappa c^4}{2}\rho$. Newton’s $4\pi G\rho$ then demands $\kappa = 8\pi G/c^4$. Once fixed this way, the coupling predicted everything else — light bending, Mercury, waves — with no freedom left.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-probe', difficulty: 2, transfer: true,
      gen(r) {
        const [v, Lkm] = r.pick([[30, 6e8], [25, 7e8], [35, 5e8]]);
        const d = (v * 1e3 / C) ** 2 * Lkm;
        return {
          prompt: t`A rough rule of thumb: over a journey, Newton’s predicted position drifts from Einstein’s by about $(v/c)^2$ of the distance travelled. For a probe cruising at ${v} km/s on a $${sci(Lkm, 2)}$ km transfer to Mars, about how large is that drift, in kilometres?`,
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (v * 1e3 / C) * Lkm, feedback: 'Square v/c: the correction is of order (v/c)².' }],
          hints: [t`$(v/c)^2 = (${v}\times10^{3}/2.998\times10^{8})^2$; multiply by the distance in km.`],
          teach: 'Relativistic corrections in the Solar System are about (v/c)² ~ 10⁻⁸: kilometres over an interplanetary trip — small, but far above what radio tracking resolves.',
          explain: t`$(v/c)^2 = ${sci((v * 1e3 / C) ** 2)}$, so the drift is about $${sci(d)}$ km. Radio ranging measures spacecraft distances to about a metre, so navigation teams include relativity’s terms in their equations of motion as a matter of routine.`,
          visual: transferPicture,
        };
      },
    }),
    num({
      id: 'cp-gw170817', difficulty: 3, transfer: true,
      prompt: t`Newton’s Poisson equation has no time in it: change a mass and its field changes everywhere at once. Einstein’s equations make changes travel. On 17 August 2017 gravitational waves from a neutron-star merger 40 Mpc away ($1.234\times10^{24}$ m) reached Earth, and its gamma rays arrived 1.74 s later. If that whole delay came from a difference in speed, how large would $|v_\text{GW} - c|/c$ be?`,
      visual: raceGraph,
      answer: 1.74 / (1.234e24 / C), tol: { rel: 0.01 },
      errors: [{ value: 1.74 / 1.234e24, feedback: 'Divide the delay by the travel time, distance ÷ c, not by the distance.' }],
      hints: [t`Travel time $T = D/c = 1.234\times10^{24}/2.998\times10^{8}$ s.`, t`$|\Delta v|/c \approx \Delta t/T$.`],
      teach: 'Gravity travels at the speed of light, as Einstein’s equations require: GW170817 pinned the two speeds together to parts in 10¹⁵.',
      explain: t`$T = D/c = ${sci(1.234e24 / C)}$ s (about 130 million years), so $|\Delta v|/c \approx 1.74/T = ${sci(1.74 / (1.234e24 / C))}$. Allowing that the gamma rays may have left a few seconds after the waves, the published bound is $-3\times10^{-15} \le \Delta v/c \le +7\times10^{-16}$: gravity travels at $c$, not instantly.`,
    }),
    mcq({
      id: 'cp-pressure', difficulty: 2,
      prompt: t`Which part of the falling-ball rule, $\ddot V/V = -4\pi G\left(\rho + 3p/c^2\right)$, has no counterpart in Newton’s Poisson equation?`,
      visual: ball({ mode: 'matter', rho: 1000, w: 1 / 3, t: 0.55 }, 'A ball of test grains inside a gas of light, where the pressure is a third of the energy density.'),
      choices: [t`The pressure term, $3p/c^2$`, t`The density, $\rho$`, t`The factor $4\pi G$`, 'The minus sign'],
      answer: 0,
      why: {
        1: t`Density is Newton’s source of gravity: $\nabla^2\Phi = 4\pi G\rho$.`,
        2: t`Newton’s equation carries the same $4\pi G$ — that is what fixes Einstein’s $8\pi$.`,
        3: 'The minus sign says gravity attracts, which Newton knew well.',
      },
      hints: ['What is the source of gravity in Newton’s theory?'],
      teach: 'Pressure as a source of gravity is purely relativistic: it enters as 3p/c², negligible unless p approaches ρc².',
      explain: t`Newton’s gravity has mass density as its only source. Einstein’s adds the pressure, $3p/c^2$ — negligible in the Sun ($3p/\rho c^2 \sim 10^{-5}$ at its centre), decisive in neutron stars and in the light-filled early universe.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §4.1 (the Newtonian limit) and §4.4', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation”, Am. J. Phys. 73, 644 (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'LIGO–Virgo, Fermi & INTEGRAL, “Gravitational waves and gamma-rays from a binary neutron star merger: GW170817 and GRB 170817A” (2017)', url: 'https://arxiv.org/abs/1710.05834' },
  ],
});
