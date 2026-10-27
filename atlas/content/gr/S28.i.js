// Weak gravity as a small ripple on flat spacetime — Intuition Mode. Almost
// everywhere g = η + h with |h| ≪ 1 (h ≈ 2GM/(rc²): 1.4 × 10⁻⁹ at Earth's
// surface, 4.2 × 10⁻⁶ at the Sun's). Keeping only first order makes Einstein's
// equations linear: ripples add, and in empty space they obey a wave equation
// with speed c. The static solution curves time and space equally (h₀₀ = h_ii),
// which is why light bends twice as much as slow bodies' Newtonian fall implies.
// Of h's 10 numbers, 4 are coordinate choices and 4 more carry no waves: 2
// polarizations (+, ×) remain. Moving masses add h₀ᵢ — gravitomagnetism, the
// frame dragging Gravity Probe B measured (37 mas/yr vs 39.2 predicted).
// Linear theory fails where h is not small: neutron stars, black holes, mergers.
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, GM_SUN, GM_EARTH, R_EARTH, AU, R_SUN, sci, round, ball, stressTable } from './_curvature.js';

const t = String.raw;

const h = (GM, r) => (2 * GM) / (r * C * C);
const H_SUN = h(GM_SUN, R_SUN), H_EARTH = h(GM_EARTH, R_EARTH), H_SUN_AT_EARTH = h(GM_SUN, AU);
const HALF_LIMB = (2 * GM_SUN) / (C * C * R_SUN) * 206265;     // arcseconds

// two ripples simply add (schematic)
const superposition = {
  type: 'graph',
  params: {
    x: [-3, 3], y: [0, 2.6], xlabel: 'position along a line (schematic)', ylabel: 'ripple h', yticks: 4, grid: false,
    curves: [
      { fn: '0.5/(abs(x + 1.2) + 0.3)', color: 'accent', width: 1.4, dash: true },
      { fn: '0.3/(abs(x - 1.3) + 0.3)', color: 'teal', width: 1.4, dash: true },
      { fn: '0.5/(abs(x + 1.2) + 0.3) + 0.3/(abs(x - 1.3) + 0.3)', color: 'gold', width: 2.6, label: 'total', labelAt: 0.1, labelDy: -14 },
    ],
    points: [{ x: -1.2, y: 0.15, color: 'accent', label: 'mass 1' }, { x: 1.3, y: 0.15, color: 'teal', label: 'mass 2' }],
  },
  caption: 'The ripple h from two masses along a line (schematic, not to scale): in weak gravity the total (gold) is exactly the sum of the two separate ripples (dashed).',
};

// near the Earth: the Sun's ripple is bigger but nearly level; the Earth's is smaller but steep
const sunEarth = {
  type: 'graph',
  params: {
    x: [1, 8], y: [0, 24], xlabel: 'distance from Earth’s centre (Earth radii)', ylabel: 'h, in units of 10⁻⁹', yticks: 6,
    curves: [
      { fn: `${round(H_EARTH * 1e9, 4)}/x`, color: 'teal', width: 2.6, label: 'Earth’s ripple', labelAt: 2.2, labelDy: -12 },
      { fn: `${round(H_SUN_AT_EARTH * 1e9, 4)}`, color: 'gold', width: 2.6, label: 'the Sun’s ripple (almost level here)', labelAt: 3, labelDy: -12 },
    ],
  },
  caption: 'The size of each ripple near the Earth. What falling bodies respond to is how steeply h changes from place to place, not how big it is.',
};

// h falls off as 1/r from a body's surface
const falloff = {
  type: 'graph',
  params: {
    x: [1, 10], y: [0, 1.1], xlabel: 'distance ÷ the body’s radius', ylabel: 'h ÷ its value at the surface', yticks: 5,
    curves: [{ fn: '1/x', color: 'accent', width: 2.6 }],
  },
  caption: 'Around any round body the ripple h = 2GM/(rc²) falls off as 1/r.',
};

// the ten independent numbers of the ripple h (symmetric 4 × 4)
const hTable = stressTable([['h₀₀', 'h₀₁', 'h₀₂', 'h₀₃'], ['h₁₀', 'h₁₁', 'h₁₂', 'h₁₃'], ['h₂₀', 'h₂₁', 'h₂₂', 'h₂₃'], ['h₃₀', 'h₃₁', 'h₃₂', 'h₃₃']], {
  colors: [['gold', 'teal', 'teal', 'teal'], ['teal', 'violet', 'violet', 'violet'], ['teal', 'violet', 'violet', 'violet'], ['teal', 'violet', 'violet', 'violet']],
  caption: 'The ripple h is a symmetric 4 × 4 table, rows and columns t, x, y, z: h₁₀ = h₀₁ and so on, so 10 independent numbers at each event.',
});

// Gravity Probe B: two turnings of a gyroscope in polar orbit (schematic)
const gpbPicture = {
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 },
      { param: ['0.25cos(t)', '1.4sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true },
    ],
    arrows: [
      { from: [0, -1.25], to: [0, 1.3], color: 'ink4' },
      { from: [-0.75, 0.62], to: [0.75, 0.62], color: 'teal', label: 'Earth spins' },
      { from: [0.25, 0], to: [0.25, 0.45], color: 'gold', label: 'geodetic' },
      { from: [0.25, 0], to: [0.7, 0], color: 'violet', label: 'frame dragging' },
    ],
    points: [{ x: 0.25, y: 0, color: 'accent2', r: 5 }, { x: -1.9, y: -1.3, color: 'ink3', r: 0.01, label: 'polar orbit (dashed)' }],
  },
  caption: 'Gravity Probe B’s gyroscope in a polar orbit (schematic). Its axis turned two ways: in the plane of the orbit (gold) and, much less, perpendicular to it (violet).',
};

export default lesson({
  id: 'gr.S28.i',
  title: 'Weak gravity as a small ripple on flat spacetime',
  minutes: 9, difficulty: 3, mode: 'intuition', badges: ['est-der'],
  intro: t`Almost everywhere in the universe gravity is weak: the metric differs from flat Minkowski spacetime (step 3) by a tiny **ripple** $h$. Around a mass $M$, $h \approx 2GM/(rc^2)$: about $10^{-9}$ at Earth's surface, $${sci(H_SUN, 2)}$ at the Sun's. For a round mass at rest the ripple is

$$ds^2 = -\left(1 - h\right)c^2\,dt^2 + \left(1 + h\right)\left(dx^2 + dy^2 + dz^2\right)$$

— time and space curved by the same amount. Slow bodies notice only the time part, which is Newton (step 19); light notices both, which is why it bends twice as much (step 24).

Keep only the first order in $h$ and Einstein's equations become **linear**: ripples from different sources simply add. In empty space they become a **wave equation**, whose ripples travel at $c$ — gravitational waves, with exactly two polarizations. Moving masses add a "magnetic" part, which drags gyroscopes round. Where $h$ is not small — at neutron stars, black holes and mergers — the full, non-linear equations are needed.`,
  equation: t`g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}, \qquad |h_{\mu\nu}| \ll 1`,
  symbols: [
    { tex: 'g_{\\mu\\nu}', text: 'the metric of spacetime (step 8): the rule for distances and times' },
    { tex: '\\eta_{\\mu\\nu}', text: 'the metric of flat Minkowski spacetime: $-1$ for time, $+1$ for each direction of space, $0$ off the diagonal' },
    { tex: 'h_{\\mu\\nu}', text: 'the ripple: 10 small numbers at each event (the table is symmetric), with no units. Squares of $h$ are dropped' },
    { tex: '\\mu,\\ \\nu', text: 'labels running over $0, 1, 2, 3$: time and the three directions of space' },
    { tex: 'h \\approx 2GM/(rc^2)', text: 'the size of the ripple at distance $r$ from a mass $M$: $h_{00}$ and each of $h_{xx}, h_{yy}, h_{zz}$, for a mass at rest' },
  ],
  why: 'Linear gravity is how general relativity predicts gravitational waves and frame dragging, how it is checked in the Solar System — and where it stops working is exactly where numerical relativity has to take over (steps 29 and 32).',
  visual: {
    type: 'gr-dustball',
    title: 'A ripple that travels: the two polarizations',
    lead: t`A ball of free-floating dust as a gravitational wave passes straight toward you, hugely exaggerated. Press **Play**, then switch polarization.`,
    tasks: [
      'Plus (+): the ball stretches along one axis while it squeezes along the other, then the reverse. The area graph stays flat — to first order in h the wave changes shape, not volume.',
      'Cross (×): exactly the same pattern, turned by 45°. Every gravitational wave is a mixture of these two.',
      'Watch the edge-on view: nothing happens along the direction of travel. The waves are transverse, like light.',
    ],
    params: { mode: 'wave', pols: true, pol: 'plus', h: 0.5, t: 0 },
  },
  example: {
    prompt: t`For the Sun, $h = 2GM_\odot/(rc^2)$ in the weak-field metric above. How big is it at the Sun’s surface ($R_\odot = 6.957\times10^{5}$ km)? Which part of it moves the planets, and how do the two parts share the bending of starlight grazing the Sun? ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.)`,
    visual: falloff,
    steps: [
      { label: 'The size', text: t`$h = \dfrac{2\times1.327\times10^{20}}{6.957\times10^{8}\times(2.998\times10^{8})^2} = ${sci(H_SUN)}$: a few parts in a million. Squares of $h$ are about $10^{-11}$, safely dropped — the Sun’s gravity is linear to excellent accuracy.` },
      { label: 'The planets', text: t`A planet at speed $v$ feels the space part only through terms smaller by about $(v/c)^2 \approx 10^{-8}$ (step 6). The time part, $h_{00}$, alone gives Newton’s gravity (step 19).` },
      { label: 'Light, time part', text: t`Light moves at $c$, so it feels both parts fully. The time part alone deflects a grazing ray by $2GM/(c^2R) = ${round(HALF_LIMB, 3)}''$ — what the equivalence principle gives (step 5).` },
      { label: 'Light, space part', text: t`The space part, equal in size, adds another $${round(HALF_LIMB, 3)}''$: $${round(2 * HALF_LIMB, 3)}''$ in all, as measured since 1919 (step 24).` },
      { label: 'Sense check', text: t`The whole Solar System lies in this linear regime: the largest ripple in it, at the Sun’s surface, is $${sci(H_SUN, 2)}$.` },
    ],
    answer: t`$h = ${sci(H_SUN)}$ at the Sun’s surface: tiny, so linear theory is excellent. Planets respond to the time part; starlight gets $${round(HALF_LIMB, 3)}''$ from each part, $${round(2 * HALF_LIMB, 3)}''$ in all.`,
  },
  practice: [
    mcq({
      id: 'linear', difficulty: 1,
      prompt: 'Keeping only the first order in the small ripple h makes Einstein’s equations linear. What does that give you?',
      visual: superposition,
      choices: [
        'Ripples from different sources simply add, and waves pass through one another unchanged',
        'Gravity becomes instantaneous, as in Newton’s theory',
        'Spacetime becomes exactly flat',
        'Gravity becomes repulsive at long distances',
      ],
      answer: 0,
      why: {
        1: 'The linear equations are wave equations: changes in h still travel at the speed of light.',
        2: 'h is small, not zero: the ripple is still there, and it still bends light and moves planets.',
        3: 'Linearity says nothing of that kind; ordinary masses still attract.',
      },
      hints: ['What is special about linear equations, such as those for sound or light?'],
      teach: 'In weak gravity Einstein’s equations are linear: ripples superpose, and waves travel at c through one another.',
      explain: 'For linear equations the sum of two solutions is a solution: the Sun’s and the Earth’s ripples add, and two gravitational waves cross without disturbing each other. (Squares of h — gravity’s own gravity — are what the full theory adds back.)',
    }),
    num({
      id: 'ripple-size', difficulty: 2,
      gen(r) {
        const [what, GM, rr, gmText, rText] = r.pick([
          ['the Earth’s ripple at the Moon’s distance', GM_EARTH, 3.844e8, t`GM_\oplus = 3.986\times10^{14}`, '384 400 km'],
          ['the Sun’s ripple at Mercury’s orbit', GM_SUN, 5.79e10, t`GM_\odot = 1.327\times10^{20}`, t`$5.79\times10^{7}$ km`],
          ['the Sun’s ripple at the Earth’s orbit', GM_SUN, AU, t`GM_\odot = 1.327\times10^{20}`, t`$1.496\times10^{8}$ km`],
          ['Jupiter’s ripple at its cloud tops', 1.267e17, 6.99e7, t`GM_\text{J} = 1.267\times10^{17}`, '69 900 km'],
        ]);
        const hh = h(GM, rr);
        return {
          prompt: t`How big is ${what}, $h = 2GM/(rc^2)$? Use $${gmText}\ \text{m}^3/\text{s}^2$ and $r = $ ${rText}.`,
          answer: hh, tol: { rel: 0.01 },
          errors: [{ value: hh / 2, feedback: 'Keep the 2: h = 2GM/(rc²).' }, { value: (2 * GM) / (rr * C), feedback: 'Divide by c², not c.' }],
          hints: [t`Put $r$ in metres; $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'Every ripple in the Solar System is at most a few parts in a million (the Sun’s, at its surface), so linear gravity describes them superbly.',
          explain: t`$h = 2GM/(rc^2) = ${sci(hh)}$ — so small that its square, about $${sci(hh * hh, 1)}$, is utterly negligible: linear theory is all you need here.`,
          visual: falloff,
        };
      },
    }),
    mcq({
      id: 'sun-earth', difficulty: 3,
      prompt: t`At the Earth’s surface the Sun’s ripple, $h \approx ${sci(H_SUN_AT_EARTH, 2)}$, is about ${Math.round(H_SUN_AT_EARTH / H_EARTH)} times the Earth’s own ($${sci(H_EARTH, 2)}$). Why do you feel the Earth’s gravity rather than the Sun’s?`,
      visual: sunEarth,
      choices: [
        'Falling bodies respond to how steeply h changes from place to place: the Earth’s ripple is steep where you stand, the Sun’s almost level across the Earth — and the Earth and you fall around the Sun together',
        'The Earth’s ripple cancels the Sun’s',
        'The Sun’s ripple affects only space and the Earth’s only time',
        'The Sun’s ripple is too far away to act on you',
      ],
      answer: 0,
      why: {
        1: 'In linear gravity ripples add; nothing cancels.',
        2: 'Both ripples have the same structure: equal parts in time and in space.',
        3: 'It reaches you — it is about 14 times bigger than the Earth’s at your feet. What it lacks is steepness.',
      },
      hints: ['In Newton’s language, g is the slope of the potential, not its value.', 'Compare how much each ripple changes over the size of the Earth.'],
      teach: 'Gravity acts through how the ripple changes from place to place: a large but nearly uniform ripple does nothing you can feel.',
      explain: t`Accelerations come from the gradient of $h$ (in Newton’s terms, $g = -\nabla\Phi$). The Sun’s ripple changes by only a few parts in $10^{5}$ of itself across the Earth: it gives the whole Earth an acceleration of $${sci(GM_SUN / AU ** 2, 2)}\ \text{m/s}^2$, which you share as you fall around the Sun together, leaving only its tides. The Earth’s smaller ripple is steep where you stand: $9.8\ \text{m/s}^2$.`,
    }),
    num({
      id: 'polarizations', difficulty: 2,
      prompt: 'The ripple h has 10 independent numbers at each event. Four of them can be changed at will just by relabelling the coordinates (gauge freedom); in empty space, four more are fixed by equations that carry no waves. How many independent kinds of gravitational wave — polarizations — are left?',
      visual: hTable,
      answer: 2, tol: { rel: 1e-6 },
      errors: [{ value: 10, feedback: 'Not all ten numbers are physical: four are only coordinate labels.' }, { value: 6, feedback: 'Also remove the four that carry no waves: 10 − 4 − 4.' }],
      hints: ['Subtract the coordinate (gauge) freedom from the 10.', 'Then subtract the four non-wave components too.'],
      teach: 'Of the ripple’s 10 numbers, 4 are coordinate labels and 4 carry no waves, leaving 2 polarizations: plus and cross.',
      explain: t`$10 - 4 - 4 = 2$: the plus and cross polarizations. Light also has two, at 90° to each other. Turn a gravitational wave’s plus pattern by 90° and you get the same pattern half a cycle later, so the genuinely different one sits halfway, at 45°: the cross.`,
    }),
    mcq({
      id: 'gauge', difficulty: 2,
      prompt: 'In the coordinates usually used to describe a gravitational wave, LIGO’s free-hanging mirrors keep exactly the same coordinate positions as the wave passes. Does that mean the arms do not change?',
      visual: ball({ mode: 'wave', t: 0, views: 'side' }, 'Free-floating dust as a wave passes: the distances between the grains change (strain hugely exaggerated).'),
      choices: [
        'No: coordinates are only labels. The ripple changes the metric, so the arms’ true lengths — the light’s round-trip times — change by hL/2',
        'Yes: nothing physical happens, and the waves are an artefact of the coordinates',
        'No: the mirrors do move in those coordinates, so the claim is false',
        'Only the laser light’s wavelength changes',
      ],
      answer: 0,
      why: {
        1: 'The tidal stretching a wave produces is curvature, the same in every coordinate system — LIGO measured it.',
        2: 'In those coordinates the mirrors really do stay put; it is the metric between them that oscillates.',
        3: 'The light’s round-trip time changes, which is exactly what the interferometer measures (step 27).',
      },
      hints: ['Recall step 7: coordinates are labels, and only measured lengths and times are physical.', 'What does the metric turn coordinate differences into?'],
      teach: 'Gauge freedom changes how a ripple is labelled, not what it does: the measurable stretch of a wave is curvature.',
      explain: 'Distance is the metric applied to coordinate differences. With the labels fixed, the ripple h in the metric changes the distance between the mirrors — and the round-trip time of the laser light — by hL/2 in each arm. Change coordinates and the mirrors’ labels may wiggle instead, but the measured result is the same.',
    }),
    mcq({
      id: 'gravitomagnetism', difficulty: 3,
      prompt: t`A spinning or moving mass adds a third kind of ripple, $h_{0i}$, which acts on moving bodies the way magnetism acts on moving charges. What did Gravity Probe B measure with it?`,
      visual: gpbPicture,
      choices: [
        'Frame dragging: its gyroscopes turned by about 37 milliarcseconds a year (prediction 39.2) because the spinning Earth drags spacetime round with it',
        'The geodetic effect: a turning of 6.6 arcseconds a year in the plane of the orbit',
        'Gravitational waves from the spinning Earth',
        'The bending of starlight passing the Earth',
      ],
      answer: 0,
      why: {
        1: 'GP-B measured that too, but it comes from the static ripple — curved time and space around the Earth (step 13). The gravitomagnetic turning is the much smaller one, across the orbit.',
        2: 'A steadily spinning, axially symmetric Earth radiates no gravitational waves.',
        3: 'GP-B used a guide star for reference; it did not measure the bending of starlight.',
      },
      hints: ['There were two turnings: one big, one small. Which needs the Earth to spin?', 'The magnetic part of a ripple comes from mass in motion.'],
      teach: 'The h₀ᵢ part of the ripple is gravitomagnetism: a spinning mass drags spacetime round, measured by Gravity Probe B at about 37 mas/yr.',
      explain: t`The spinning Earth’s mass currents make $h_{0i}$, which twists the directions a gyroscope holds: about 39 milliarcseconds a year for GP-B’s orbit, measured as $37.2 \pm 7.2$ (2011). The far larger 6.6″ a year in the orbital plane comes from the static ripple.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron', difficulty: 2, transfer: true,
      gen(r) {
        const [m, Rk] = r.pick([[1.2, 11], [1.4, 12], [2.0, 13], [1.4, 11]]);
        const hh = h(m * GM_SUN, Rk * 1e3);
        return {
          prompt: t`A neutron star packs ${m} solar masses into a radius of ${Rk} km. How big is the ripple $h = 2GM/(Rc^2)$ at its surface, with $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ — and can linear gravity describe the star?`,
          answer: hh, tol: { rel: 0.01 },
          errors: [{ value: hh / 2, feedback: 'Keep the 2: h = 2GM/(Rc²).' }, { value: hh * 1e3, feedback: 'Put the radius in metres.' }],
          hints: [t`$GM = ${m}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and $R = ${Rk}\times10^{3}$ m.`, t`$h = 2GM/(Rc^2)$, with $c^2 = 8.988\times10^{16}$.`],
          teach: 'At a neutron star the ripple is a third or more: its square is not negligible, so linear gravity fails and the full equations are needed.',
          explain: t`$h = ${sci(hh)}$ — not small at all. Its square, about $${sci(hh * hh, 2)}$, is far from negligible, so linear theory fails: a neutron star’s structure needs the full non-linear equations, as do black holes and mergers (steps 29 and 32).`,
          visual: falloff,
        };
      },
    }),
    mcq({
      id: 'cp-polarizations', difficulty: 2,
      prompt: 'Gravitational waves come in two polarizations, plus (+) and cross (×). How are their stretch-and-squeeze patterns related?',
      visual: ball({ mode: 'wave', pol: 'cross', t: 0, views: 'side' }, 'Free-floating dust as a cross-polarized wave passes (strain hugely exaggerated).'),
      choices: [
        'The same pattern turned by 45°',
        'The same pattern turned by 90°, like the two polarizations of light',
        'One stretches all directions and the other squeezes all directions',
        'One acts along the direction of travel and the other across it',
      ],
      answer: 0,
      why: {
        1: 'Turned by 90°, the plus pattern becomes itself with stretch and squeeze swapped — that is the same polarization half a cycle later.',
        2: 'That would change volumes; to first order in h the waves change only shape.',
        3: 'Both act only across the direction of travel: the waves are transverse.',
      },
      hints: ['Turn the + pattern by 90°: what do you get?'],
      teach: 'The two polarizations of a gravitational wave are the same transverse stretch-and-squeeze, turned 45° from each other.',
      explain: 'A plus wave stretches along x while squeezing along y; turn that by 90° and you have the plus wave half a cycle later, not a new pattern. Turn it by 45° and you get the genuinely different cross wave, stretching and squeezing along the diagonals.',
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 6 (weak fields and gravitational radiation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Everitt et al. (2011), Gravity Probe B: final results, Phys. Rev. Lett. 106, 221101', url: 'https://arxiv.org/abs/1105.3456' },
    { label: 'Will, “The confrontation between general relativity and experiment”, Living Rev. Relativ. 17, 4 (2014)', url: 'https://arxiv.org/abs/1403.7377' },
  ],
});
