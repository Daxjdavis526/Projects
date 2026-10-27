// The Alcubierre warp drive — Intuition Mode. ds² = −c²dt² + (dx − v f(r_s)
// dt)² + dy² + dz²: an exact geometry [math] whose bubble interior is in free
// fall (dτ = dt) and which may move faster than light relative to distant
// stars. Eulerian energy density −(c⁴/8πG)(v²/4c²)((y² + z²)/r_s²)(f′)² < 0 in
// a ring round the wall; thin-wall total E/c² ≈ −β²c²R²σ/(36G) (checked
// against direct integration to 10⁻⁴): −0.19 M☉ for R = 100 m, 2 m wall, β =
// 1; quantum-inequality walls give ~10⁶² kg (Pfenning & Ford 1997). Generic
// warp drives break the NEC for some observer (Santiago, Schuster & Visser
// 2022): the 2021 "positive-energy" superluminal claims are refuted as
// stated; subluminal positive-energy shells (Bobrick & Martire 2021; Fuchs et
// al. 2024) move inertially and reach no faster-than-light speed.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, M_SUN, M_JUP, M_EARTH, sci, round, logDots } from './_frontier.js';
import { spacetimeSketch } from './_foundations.js';

const t = String.raw;

const bill = (R, sigma, beta) => (beta ** 2 * C ** 2 * R * R * sigma) / (36 * G);   // |E|/c², kg (thin wall)
const L_P = 1.616e-35;                                                               // Planck length, m
const SIGMA_QI = 2 / (100 * L_P);                                                    // a wall 100 Planck lengths thick

// the bubble in the plane through its centre (radius 1.6, wall steepness S), moving toward +x
const RB = 1.6;
const rr = 'sqrt(x^2 + y^2 + 1e-9)';
const fp = `(S/(2*tanh(S*${RB})))*(tanh(S*(${rr} - ${RB}))^2 - tanh(S*(${rr} + ${RB}))^2)`;
const THETA = `(x/${rr})*${fp}`;                      // York time per unit speed: contraction ahead, expansion behind
const RHO = `(-(y^2/(4*(x^2 + y^2 + 1e-9)))*(${fp})^2)`;  // Eulerian energy density per unit v², units of c⁴/(8πG)
const bubble = ({ k = 1, S = 3, sliders = false, caption } = {}) => ({
  type: 'surface3d',
  params: {
    z: `k*0.7*${THETA} + (1 - k)*1.5*${RHO}`, domain: [[-3.4, 3.4], [-3.4, 3.4]], n: 41, zclip: 50,
    axes: false, alpha: 0.85, yaw: -0.65, pitch: 0.55, dist: 11, target: [0, 0, 0],
    ...(sliders ? {
      choices: [{ key: 'k', label: 'Height shows', options: [[1, 'Expansion of space'], [0, 'Energy density']], value: k, explain: 'Expansion: how fast small volumes grow (up) or shrink (down) for observers at rest in this slicing. Energy density: what those observers measure.' }],
      sliders: [{ key: 'S', label: 'Wall steepness $\\sigma$', min: 1.5, max: 6, step: 0.1, value: S, explain: 'A steeper, thinner wall: its thickness is about $2/\\sigma$.' }],
      readouts: [{ label: 'wall thickness ≈ 2/σ', expr: '2/S' }, { label: 'total negative energy, relative to σ = 2', expr: 'S/2' }],
    } : { constants: { k, S } }),
    curves: [
      { param: ['-3 + 6t', '-3.2', '0'], t: [0, 1], color: 'gold', width: 3 },
      { param: ['3 - 0.5t', '-3.2 + 0.3t', '0'], t: [0, 1], color: 'gold', width: 3 },
      { param: ['3 - 0.5t', '-3.2 - 0.3t', '0'], t: [0, 1], color: 'gold', width: 3 },
    ],
  },
  caption: caption ?? 'Alcubierre’s warp bubble in the plane through its centre, moving in the direction of the gold arrow; arbitrary units, heights exaggerated. Mathematically allowed: an exact solution of Einstein’s equations — but only with negative energy, for which no source is known.',
});

// the warp-drive literature, by year, coloured by status
const PAPERS = [
  [1994, 'Alcubierre: exact geometry, needs negative energy', 'gold'],
  [1997, 'Pfenning & Ford: quantum limits, ~10⁶² kg', 'accent'],
  [1997, 'Everett & Roman: cannot be steered from inside', 'accent'],
  [2002, 'Natário: no expansion needed', 'gold'],
  [2009, 'Finazzi et al.: quantum instability', 'accent'],
  [2021, 'Lentz; Fell & Heisenberg: “positive energy” — refuted', 'bad'],
  [2021, 'Bobrick & Martire: slower-than-light shells', 'teal'],
  [2022, 'Santiago, Schuster & Visser: null condition broken', 'accent'],
  [2024, 'Fuchs et al.: constant-velocity slow shell', 'teal'],
  [2026, 'Barzegar et al. review: “highly challenging”', 'accent'],
];
const literature = {
  type: 'graph',
  params: {
    x: [1990, 2062], y: [-0.8, PAPERS.length - 0.2], axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [1995, 2005, 2015, 2025].map((yr) => ({ param: [String(yr), 't'], t: [-0.4, PAPERS.length - 0.5], color: 'ink4', width: 0.8 })),
    points: [
      ...PAPERS.map(([yr, label, color], k) => ({ x: yr, y: PAPERS.length - 1 - k, color, label })),
      ...[1995, 2005, 2015, 2025].map((yr) => ({ x: yr - 1.4, y: -0.55, r: 0.5, color: 'ink3', label: String(yr) })),
    ],
  },
  caption: 'The warp-drive literature, by year. Gold: valid geometries needing negative energy; blue: limits and critiques; teal: slower-than-light shells; red: claims refuted as stated.',
};

const masses = logDots([['Earth', M_EARTH, 'teal'], ['Jupiter', M_JUP, 'gold'], ['the Sun', M_SUN, 'gold']], { xlabel: 'mass in kg (powers of ten)', range: [20, 36], every: 2, caption: 'Masses for scale, in powers of ten.' });

export default lesson({
  id: 'gr.S36.i',
  title: 'Warp drives: correct mathematics, impossible requirements',
  minutes: 11, difficulty: 3, mode: 'intuition', badges: ['math', 'refuted'],
  intro: t`In 1994 Miguel Alcubierre wrote down an exact spacetime in which a **bubble** of ordinary flat space travels at any speed — even faster than light, as judged from the distant stars — while a ship inside floats in free fall: no acceleration felt, no time dilation, nothing ever outrunning light nearby. The geometry is **correct mathematics**. Its price, read off from Einstein's equations, is not: observers at rest around the bubble measure a **negative energy density** in a ring around its wall, and generic warp drives break the null energy condition for some observer. Quantum limits on negative energy make the bill astronomical; a faster-than-light bubble could neither be started nor steered from inside; and the 2021 claims of warp drives powered by **positive** energy did not survive scrutiny. No known physics offers a route to faster-than-light travel. In Alcubierre's geometry:`,
  equation: t`ds^2 = -c^2\,dt^2 + \left(dx - v\,f(r_s)\,dt\right)^2 + dy^2 + dz^2`,
  symbols: [
    { tex: 't', text: 'the time of observers far away — and also of the crew, whose clocks keep exactly this time ($d\\tau = dt$)' },
    { tex: 'x,\\ y,\\ z', text: 'position; the bubble moves along $x$' },
    { tex: 'v', text: 'the bubble’s speed as judged from far away, in m/s. Nothing in the geometry stops it exceeding $c$' },
    { tex: 'r_s', text: 'distance from the centre of the bubble, in m' },
    { tex: 'f(r_s)', text: 'the shape of the bubble: 1 inside, 0 outside, changing across a wall of thickness about $2/\\sigma$ at radius $R$' },
    { tex: 'v\\,f\\,dt', text: 'the "shift" (as in numerical relativity): inside the bubble, the space grid itself is carried along at $v$; outside it stays put' },
  ],
  why: 'Warp drives are the clearest case study in telling “allowed by the equations” from “possible” — and in reading the headlines that confuse the two.',
  visual: {
    ...bubble({ sliders: true }),
    title: 'A warp bubble, and what it costs',
    lead: t`The plane through a warp bubble moving in the direction of the gold arrow. Choose what the height shows. Drag to rotate.`,
    tasks: ['“Expansion of space”: space shrinks ahead of the bubble (dip) and grows behind it (bump) — Alcubierre’s famous picture. It is a feature of his slicing, not the essence: Natário built a warp drive with no expansion at all.', '“Energy density”: it is negative wherever it is not zero — a ring around the sides of the bubble, nothing straight ahead or behind.', 'Make the wall steeper: the features sharpen and the total negative energy grows in proportion to σ.'],
  },
  example: {
    prompt: t`How much negative energy does a warp bubble need? Observers at rest around it measure $\rho_E c^2 = -\dfrac{c^4}{8\pi G}\,\dfrac{v^2}{4c^2}\,\sin^2\vartheta\left(\dfrac{df}{dr_s}\right)^2$, where $\vartheta$ is the angle from the direction of travel. Estimate the total for a bubble of radius $R = 100$ m with a 2 m wall ($\sigma = 1\ \text{m}^{-1}$) at $v = c$ — and then with the wall quantum limits demand.`,
    visual: bubble({ k: 0, S: 3, caption: 'The energy density seen by observers at rest around the bubble: negative in a ring around its sides (arbitrary units, height exaggerated).' }),
    steps: [
      { label: 'Where it sits', text: t`$(df/dr_s)^2$ is non-zero only in the wall, and $\sin^2\vartheta$ vanishes straight ahead and behind: a ring of negative energy around the bubble's sides.` },
      { label: 'Adding it up', text: t`For a thin wall the integral works out to $E/c^2 \approx -\dfrac{\beta^2c^2R^2\sigma}{36G}$, with $\beta = v/c$ — a direct numerical integration agrees to 0.01%. It grows with the square of the speed, the square of the size, and with the steepness of the wall.` },
      { label: 'The numbers', text: t`$R = 100$ m, $\sigma = 1\ \text{m}^{-1}$, $\beta = 1$: $|E|/c^2 = ${sci(bill(100, 1, 1))}$ kg — $${sci(bill(100, 1, 1) / M_SUN, 2)}$ solar masses of **negative** energy.` },
      { label: 'Quantum limits', text: t`Quantum inequalities allow negative energy only in very thin layers: Pfenning and Ford (1997) found the wall must be about a hundred Planck lengths thick. With $\sigma = 2/(100\times1.6\times10^{-35}\ \text{m}) = ${sci(SIGMA_QI, 2)}\ \text{m}^{-1}$, the bill becomes $${sci(bill(100, SIGMA_QI, 1), 2)}$ kg — the same order as their estimate, $6\times10^{62}$ kg, which they put at about ten orders of magnitude more than the mass of the visible universe.` },
      { label: 'Status', text: t`Mathematically allowed; requires negative energy for some observers, in amounts and forms no known physics provides.` },
    ],
    answer: t`About $${sci(bill(100, 1, 1), 2)}$ kg ($${sci(bill(100, 1, 1) / M_SUN, 2)}\,M_\odot$) of negative energy for a 2 m wall; about $${sci(bill(100, SIGMA_QI, 1), 2)}$ kg once quantum limits thin the wall.`,
  },
  practice: [
    mcq({
      id: 'what-shown', difficulty: 1,
      prompt: 'What did Alcubierre’s 1994 paper show?',
      choices: [
        'That Einstein’s equations allow a geometry carrying a bubble faster than light relative to distant stars — provided matter with negative energy density is present. It gave no way to make that matter',
        'That warp drives are possible with enough ordinary energy',
        'That faster-than-light travel is impossible in general relativity',
        'That NASA could build a warp drive within decades',
      ],
      answer: 0,
      why: {
        1: 'The energy needed is negative, which no amount of ordinary energy supplies.',
        2: 'The opposite: the geometry is allowed; the matter it needs is the problem.',
        3: 'The paper is a solution of the equations, with no engineering plan; no agency is building a warp drive.',
      },
      hints: ['Separate the geometry (what the equations allow) from the matter (what it would take).'],
      teach: 'Alcubierre’s warp drive is a valid solution of Einstein’s equations that needs negative energy — mathematically allowed, physically unsupported.',
      explain: 'Alcubierre designed the geometry first and then read off the matter it needs from Einstein’s equations — the same reverse engineering as for wormholes. The result needs negative energy density for observers at rest around the bubble.',
      visual: bubble({ caption: 'The expansion of space around Alcubierre’s bubble (moving in the direction of the gold arrow): contraction ahead, expansion behind. Arbitrary units; mathematically allowed.' }),
    }),
    mcq({
      id: 'crew', difficulty: 2,
      prompt: 'What would the crew inside an Alcubierre bubble experience during a faster-than-light trip?',
      choices: [
        'Nothing unusual: they float in free fall, feel no acceleration, and their clocks keep the same time as those of distant observers',
        'Enormous time dilation, ageing far less than people at home',
        'Crushing acceleration as the bubble speeds up',
        'Light passing them faster than c',
      ],
      answer: 0,
      why: {
        1: 'In the geometry, a clock at the bubble’s centre has dτ = dt: no time dilation at all.',
        2: 'The interior is flat, freely falling space: nothing pushes on the crew.',
        3: 'Locally, light always passes at c; what exceeds c is the bubble’s speed relative to distant stars.',
      },
      hints: [t`Inside the bubble $f = 1$; what is $d\tau$ for a crew member moving along with it?`],
      teach: 'Inside the bubble the crew is in free fall with dτ = dt: the attraction of the idea — and why its whole cost lies in the wall.',
      explain: t`With $f = 1$ and the crew riding along ($dx = v\,dt$), the metric gives $ds^2 = -c^2dt^2$: proper time equals far-away time. The bubble moves; nothing inside it does. All the difficulty sits in the wall.`,
      visual: bubble({ k: 0, caption: 'Energy density around the bubble: all of it in the wall, none inside where the crew floats (arbitrary units).' }),
    }),
    num({
      id: 'scaling', difficulty: 2,
      gen(r) {
        const [what, f] = r.pick([['make the bubble twice as wide (same wall and speed)', 4], ['halve the wall’s thickness', 2], ['go three times as fast', 9], ['double both the radius and the speed', 16], ['make the bubble ten times as wide and the wall ten times thinner', 1000]]);
        return {
          prompt: t`The negative energy of a thin-walled warp bubble grows as $E \propto \beta^2R^2\sigma$ (speed squared, radius squared, and the wall's steepness $\sigma$, which is about 2 ÷ its thickness). By what factor does it grow if you ${what}?`,
          answer: f, tol: { rel: 0.001 },
          errors: f === 2 ? [{ value: 4, feedback: 'σ enters to the first power: halving the thickness doubles σ, and the energy doubles.' }] : f === 4 ? [{ value: 2, feedback: 'The radius enters squared.' }] : f === 9 ? [{ value: 3, feedback: 'The speed enters squared.' }] : [],
          hints: ['Write the new energy as (β-factor)² × (R-factor)² × (σ-factor) times the old.'],
          teach: 'Warp-bubble costs grow as β²R²σ: faster, larger and thinner-walled bubbles all cost more.',
          explain: t`The energy is multiplied by ${f}. Since quantum limits force the wall to be extremely thin (huge $\sigma$), there is no cheap corner of this formula.`,
          visual: bubble({ k: 0, S: 4.5, caption: 'Energy density around a bubble with a steep wall: the ring of negative energy is concentrated in the wall (arbitrary units).' }),
        };
      },
    }),
    num({
      id: 'bill', difficulty: 3,
      gen(r) {
        const R = r.pick([10, 50, 100]), w = r.pick([1, 2, 10]), beta = r.pick([0.1, 1, 2]);
        const x = bill(R, 2 / w, beta);
        return {
          prompt: t`Estimate the negative energy, as a mass $|E|/c^2 = \beta^2c^2R^2\sigma/(36G)$, for a warp bubble of radius ${R} m with a wall ${w} m thick ($\sigma = 2/\text{thickness}$) moving at $${beta}c$. ($c = 2.998\times10^{8}$ m/s, $G = 6.674\times10^{-11}$ SI)`,
          answer: x, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: bill(R, 1 / w, beta), feedback: 'σ = 2 ÷ thickness, not 1 ÷ thickness.' }, ...(beta !== 1 ? [{ value: bill(R, 2 / w, 1) * beta, feedback: 'The speed enters as β².' }] : [])],
          hints: [t`$\sigma = 2/${w} = ${sci(2 / w, 3)}\ \text{m}^{-1}$, and $c^2/(36G) = ${sci((C * C) / (36 * G))}$ kg/m.`, t`Multiply by $\beta^2 R^2\sigma = ${sci(beta * beta)}\times${sci(R * R)}\times${sci(2 / w, 3)}$.`],
          teach: 'Even a small, slow warp bubble needs planet- to star-sized amounts of negative energy.',
          explain: t`$|E|/c^2 = ${sci(x)}$ kg — ${x > M_SUN / 10 ? `$${sci(x / M_SUN, 2)}$ solar masses` : x > M_JUP / 10 ? `$${sci(x / M_JUP, 2)}$ Jupiter masses` : `$${sci(x / M_EARTH, 2)}$ Earth masses`} of **negative** energy. Quantum limits on how thick a negative-energy layer can be would multiply this by some 30 orders of magnitude.`,
          visual: masses,
        };
      },
    }),
    mcq({
      id: 'expansion', difficulty: 2,
      prompt: 'Popular accounts say a warp drive works by “contracting space in front and expanding it behind”. What is the accurate picture?',
      choices: [
        'That pattern belongs to Alcubierre’s particular choice; Natário (2002) built a warp drive with no expansion or contraction at all. What every warp drive shares is a bubble whose interior is carried along — and the need for negative energy',
        'It is the propulsion: contracting space ahead pulls the ship forward',
        'It has been measured around spacecraft',
        'It is required by every faster-than-light geometry',
      ],
      answer: 0,
      why: {
        1: 'Nothing pushes or pulls the ship; the expansion picture describes how observers at rest see small volumes change in one slicing.',
        2: 'No spacecraft shows any such effect.',
        3: 'Natário’s zero-expansion warp drive is a counterexample.',
      },
      hints: ['Is the expansion pattern the same in every way of slicing the spacetime?'],
      teach: 'The “contract in front, expand behind” picture is one slicing’s view, not the essence of a warp drive.',
      explain: 'The expansion plotted in the Explore depends on how spacetime is sliced. Natário showed a warp bubble can have zero expansion everywhere. What does not go away is the negative energy density that some observers measure.',
      visual: bubble({ caption: 'The expansion of space around Alcubierre’s bubble in his slicing: dip ahead, bump behind. A different slicing (Natário’s) has no expansion at all.' }),
    }),
    mcq({
      id: 'claims-2021', difficulty: 2,
      prompt: 'In 2021 two papers (Lentz; Fell & Heisenberg) reported faster-than-light warp “solitons” needing only positive energy. What did Santiago, Schuster and Visser (2022) find?',
      choices: [
        'The papers checked the energy density for only one family of observers; the condition must hold for all observers, and generic warp drives break the null energy condition — so the claims are refuted as stated',
        'They confirmed the claims, opening the way to faster-than-light travel with ordinary matter',
        'They showed that Einstein’s equations forbid warp geometries altogether',
        'They found the papers’ arithmetic correct but their units wrong',
      ],
      answer: 0,
      why: {
        1: 'No such confirmation exists; the later literature, including a 2026 review, agrees the superluminal positive-energy claims do not hold as stated.',
        2: 'The geometries are fine as mathematics; the problem is the matter they need.',
        3: 'The issue was physical, not arithmetic: positive energy for one set of observers does not mean positive energy for all.',
      },
      hints: ['The weak energy condition says no observer measures negative energy. How many kinds of observer did the papers check?'],
      teach: 'Positive energy for one family of observers is not enough: generic warp drives break the null energy condition for some observer.',
      explain: 'The 2021 papers computed the energy density seen by “Eulerian” observers, who move straight across the slices, and found it non-negative. Santiago, Schuster and Visser showed that observers moving relative to those see negative energy, and that the null condition fails for generic warp drives. Badge: refuted (as stated).',
      visual: literature,
    }),
    mcq({
      id: 'slow-shells', difficulty: 3,
      prompt: 'Bobrick & Martire (2021) and Fuchs et al. (2024) presented “physical warp drives” built from ordinary, positive-energy matter. What do these solutions actually describe?',
      choices: [
        'Shells of matter moving at constant speed, slower than light, with a warp-like interior; they include no way to accelerate, and no faster-than-light travel',
        'Faster-than-light ships powered by ordinary matter',
        'Proof that energy conditions are wrong',
        'Working prototypes tested in the laboratory',
      ],
      answer: 0,
      why: {
        1: 'Both are explicitly slower than light; superluminal versions still need negative energy.',
        2: 'They satisfy the energy conditions — that was the point.',
        3: 'They are solutions of equations, found with computer algebra and numerics, not devices.',
      },
      hints: ['How fast do these solutions move, and what makes them change speed?', 'Bobrick and Martire note that any warp drive is a shell of material moving inertially. What does a moving shell need to speed up?'],
      teach: 'The positive-energy “warp drives” are slower-than-light shells coasting at constant speed — they still need ordinary propulsion.',
      explain: 'These are honest, interesting solutions: mathematically allowed configurations of ordinary matter with a warp-like interior. But they coast at constant, sub-light speed, and to change speed they would need propulsion like any spacecraft. A 2026 review by Barzegar, Buchert and Vigneron calls the viability of warp drives “highly challenging” for reasons beyond the energy conditions.',
      visual: literature,
    }),
    mcq({
      id: 'control', difficulty: 3,
      prompt: 'Suppose unlimited negative energy were available. Why still could a crew not start or steer a faster-than-light warp bubble from inside it?',
      choices: [
        'The front of a faster-than-light bubble lies outside the crew’s light cone: no signal from the ship can reach it, so the wall would have to be laid in place beforehand along the route',
        'The crew would be crushed by the acceleration',
        'The bubble would become a black hole as soon as it passed the speed of light',
        'Their radios would not work inside the bubble',
      ],
      answer: 0,
      why: {
        1: 'The crew is in free fall; the obstacle is causal, not mechanical.',
        2: 'The geometry has no horizon of that kind around the bubble; the problem is the front being out of reach.',
        3: 'Communication inside is fine; it is the region ahead that no signal from the ship can reach.',
      },
      hints: ['Draw the crew’s future light cone. Where is the front of the bubble, moving faster than light?', 'To shape the wall ahead, a signal from the ship would have to travel faster than light.'],
      teach: 'A faster-than-light bubble is causally cut off from its own front: it cannot be steered from inside.',
      explain: 'Everett and Roman (1997) showed the front is causally disconnected from the interior: control signals cannot reach it. And Finazzi, Liberati and Barceló (2009) found that quantum effects pile up energy at the front until the bubble becomes unstable.',
      visual: spacetimeSketch({
        segments: [[0, 0, 5, 9, 'gold']],
        events: [[0, 0, 'start'], [4, 7.2, 'bubble', 'gold']],
        range: 9, xlabel: 'distance (light-years)', ylabel: 'time (years)',
        caption: 'Spacetime diagram (c = 1): the bubble’s path (gold) at 1.8c leaves the light cone (dashed) of its own start. No signal sent from the ship after launch can reach the wall ahead.',
      }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-quantum-wall', difficulty: 2,
      gen(r) {
        const w = r.pick([2, 1, 10]);
        const x = w / (100 * L_P);
        return {
          prompt: t`Quantum inequalities force a warp bubble's negative-energy wall to be about 100 Planck lengths thick ($100\times1.616\times10^{-35}$ m). Since the energy grows as $\sigma \approx 2/\text{thickness}$, by what factor does the bill grow compared with a wall ${w} m thick?`,
          answer: x, tol: { rel: 0.01 },
          errors: [{ value: 1 / x, feedback: 'Thinner walls cost more: the factor is (old thickness) ÷ (new thickness), much larger than 1.' }],
          hints: ['The bill scales with σ, which scales as 1/thickness.'],
          teach: 'Quantum limits make warp walls absurdly thin, multiplying the energy bill by over 30 orders of magnitude.',
          explain: t`$${w}/(1.616\times10^{-33}) = ${sci(x)}$. A bubble that needed a fraction of a solar mass with a metre-scale wall would need about $10^{62}$ kg — far more than all the matter we can see.`,
          visual: logDots([['a proton', 1.7e-15, 'violet'], ['100 Planck lengths', 100 * L_P, 'bad'], [`a ${w} m wall`, w, 'accent']], { xlabel: 'thickness in m (powers of ten)', range: [-36, 6], every: 6, caption: 'Thicknesses for scale, in powers of ten.' }),
        };
      },
    }),
    mcq({
      id: 'cp-headline', difficulty: 2,
      prompt: 'In 2021 headlines said NASA engineers had “created the first real warp bubble”. What did the paper (White et al.) actually report?',
      choices: [
        'A computer model of a tiny Casimir cavity whose pattern of (minute, negative) energy density looked qualitatively like the pattern Alcubierre’s geometry needs. No space was warped and nothing was propelled',
        'A measured warp bubble around a laboratory device',
        'A spacecraft accelerated by a warp field',
        'A proof that warp drives need only positive energy',
      ],
      answer: 0,
      why: {
        1: 'Nothing was measured: it was a calculation of a Casimir cavity’s energy density.',
        2: 'No spacecraft or propulsion was involved.',
        3: 'The cavity’s energy density was negative — the Casimir effect — and its pattern only resembled the Alcubierre requirement.',
      },
      hints: ['Separate what was computed from what it was said to resemble.'],
      teach: 'A pattern that resembles a warp bubble’s energy requirement is not a warp bubble.',
      explain: 'The paper modelled a micrometre-scale Casimir structure and noticed its negative energy density had a shape reminiscent of Alcubierre’s. The amounts were tiny, nothing was curved measurably, and nothing moved. Press coverage turned a resemblance into a “warp bubble”.',
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([1e5, 1e6]), beta = 0.1;
        const ke = (1 / Math.sqrt(1 - beta * beta) - 1) * m * C * C;
        const warp = bill(100, 1, beta) * C * C;
        const x = warp / ke;
        return {
          prompt: t`Compare two ways to send a ${m / 1000}-tonne ship at $0.1c$. A rocket must give it kinetic energy $(\gamma - 1)mc^2$. A warp bubble of radius 100 m with a 2 m wall needs negative energy of size $\beta^2c^4R^2\sigma/(36G)$ (with $\sigma = 1\ \text{m}^{-1}$). How many times larger is the warp bubble's requirement?`,
          answer: x, tol: { rel: 0.015 },
          errors: [{ value: 1 / x, feedback: 'Divide the warp bubble’s energy by the rocket’s, not the other way round.' }],
          hints: [t`Rocket: $\gamma = 1/\sqrt{1 - 0.01} = ${sci(1 / Math.sqrt(0.99), 6)}$, so $(\gamma - 1)mc^2 = ${sci(ke)}$ J.`, t`Warp: $0.01\times c^4\times100^2\times1/(36G) = ${sci(warp)}$ J; divide.`],
          teach: 'Even at sub-light speeds, a warp bubble needs vastly more energy than a rocket — and of a kind (negative) that a rocket never needs.',
          explain: t`Rocket: $${sci(ke)}$ J. Warp bubble: $${sci(warp)}$ J of **negative** energy — $${sci(x)}$ times more. Below light speed, rockets are the better engine by an astronomical margin; above it, the warp drive has no physical route at all.`,
          visual: logDots([['world energy use in a year (~6×10²⁰ J)', 6e20, 'ink2'], ['the Sun’s output in one second', 3.828e26, 'gold'], ['the Sun’s rest energy, mc²', M_SUN * C * C, 'gold']], { xlabel: 'energy in J (powers of ten)', range: [18, 62], every: 6, caption: 'Energies for scale, in powers of ten.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Alcubierre, “The warp drive: hyper-fast travel within general relativity”, Class. Quantum Grav. 11, L73 (1994)', url: 'https://arxiv.org/abs/gr-qc/0009013' },
    { label: 'Pfenning & Ford, “The unphysical nature of warp drive”, Class. Quantum Grav. 14, 1743 (1997)', url: 'https://arxiv.org/abs/gr-qc/9702026' },
    { label: 'Santiago, Schuster & Visser, “Generic warp drives violate the null energy condition”, Phys. Rev. D 105, 064038 (2022)', url: 'https://arxiv.org/abs/2105.03079' },
    { label: 'Bobrick & Martire, “Introducing physical warp drives”, Class. Quantum Grav. 38, 105009 (2021)', url: 'https://arxiv.org/abs/2102.06824' },
    { label: 'Lentz, “Breaking the warp barrier: hyper-fast solitons…” (2021)', url: 'https://arxiv.org/abs/2006.07125' },
    { label: 'Fell & Heisenberg, “Positive energy warp drive from hidden geometric structures” (2021)', url: 'https://arxiv.org/abs/2104.06488' },
    { label: 'Fuchs et al., “Constant velocity physical warp drive solution” (2024)', url: 'https://arxiv.org/abs/2405.02709' },
    { label: 'Barzegar, Buchert & Vigneron, review of warp-drive spacetimes (2026)', url: 'https://arxiv.org/abs/2602.16495' },
  ],
});
