// Curvature you can feel: tides — Intuition Mode. Free fall removes gravity
// at a point; the difference in gravity between nearby points (the tide)
// cannot be removed, and it is the curvature of spacetime. Near a mass a
// falling ball of dust is stretched along the line by 2GM/r³ per metre and
// squeezed across by GM/r³ per metre in each of the two other directions —
// for a non-spinning mass general relativity gives exactly these numbers (the
// Riemann tensor in the faller's frame), even at a black hole's horizon.
// 2 − 1 − 1 = 0: in empty space the ball changes shape, not volume (→ S15).
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, GM_SUN, GM_EARTH, R_EARTH, GM_MOON, D_MOON, AU, g0, sci, round, grp, log, ball, tidalField } from './_curvature.js';

const t = String.raw;
const plain = (x) => x.toLocaleString('en-US');      // thousands separators in prose (outside $…$)

const rs = (GM) => (2 * GM) / C ** 2;                            // horizon radius, m
const stretch = (GM, L, r) => (2 * GM * L) / r ** 3;              // along-the-line tide across L, m/s²
const tenG = (GM, L = 2) => Math.cbrt((2 * GM * L) / (10 * g0));  // where the stretch on L reaches 10 g, m
const SGR = 4.30e6;
const BH = { GM: 10 * GM_SUN }, SG = { GM: SGR * GM_SUN };
for (const B of [BH, SG]) { B.rs = rs(B.GM); B.r10 = tenG(B.GM); B.horizon = stretch(B.GM, 2, B.rs); }

// where a 2 m stretch reaches 10 g, for a 10 M☉ hole and Sgr A*: log₁₀(stretch in g) against log₁₀(r/r_s)
const yH = (B) => round(log(B.horizon / g0), 5);
const spaghettiGraph = {
  type: 'graph',
  params: {
    x: [-2.2, 3.2], y: [-8, 9], xlabel: 'log₁₀(r / rₛ)', ylabel: 'log₁₀(stretch on 2 m, in g)',
    curves: [
      { fn: `${yH(BH)} - 3x`, domain: [round((yH(BH) - 9) / 3, 4), 3.2], color: 'bad', label: '10 M☉', labelAt: 1.25, labelDx: 8, labelDy: -10 },
      { fn: `${yH(SG)} - 3x`, domain: [-2.2, round((yH(SG) + 8) / 3, 4)], color: 'accent', label: 'Sgr A*', labelAt: -1.1, labelDx: 8, labelDy: 10 },
    ],
    hlines: [{ y: 1, label: '10 g', color: 'warn' }],
    vlines: [{ x: 0, label: 'horizon', color: 'ink3' }],
    points: [
      { x: round(log(BH.r10 / BH.rs), 4), y: 1, color: 'bad', label: `${Math.round(BH.r10 / BH.rs)} rₛ` },
      { x: round(log(SG.r10 / SG.rs), 4), y: 1, color: 'accent', label: `${round(SG.r10 / SG.rs, 2)} rₛ` },
    ],
  },
  caption: 'The head-to-foot stretch on a 2 m body against distance, both in powers of ten, with distance in horizon radii. Each line falls as 1/r³; the stretch reaches 10 g far outside the small hole’s horizon and far inside the giant’s.',
};

// two grains side by side above Earth: their pulls converge on the centre (not to scale)
const convergePicture = {
  type: 'graph',
  params: {
    x: [-1.5, 1.5], y: [-0.25, 1.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0.25, 2.89], color: 'teal', width: 2.4 },
      { param: ['0.24(1 - t)', '1.5(1 - t)'], t: [0, 1], color: 'ink4', width: 1.2, dash: true },
      { param: ['-0.24(1 - t)', '1.5(1 - t)'], t: [0, 1], color: 'ink4', width: 1.2, dash: true },
    ],
    arrows: [
      { from: [0.24, 1.5], to: [0.192, 1.2], color: 'gold' }, { from: [-0.24, 1.5], to: [-0.192, 1.2], color: 'gold' },
      { from: [0.24, 1.5], to: [0.13, 1.5], color: 'bad' }, { from: [-0.24, 1.5], to: [-0.13, 1.5], color: 'bad' },
    ],
    points: [{ x: 0.24, y: 1.5, color: 'accent2', label: 'B' }, { x: -0.24, y: 1.5, color: 'accent2', label: 'A' }, { x: 0, y: 0, color: 'teal', label: 'Earth’s centre', r: 3.5 }],
  },
  caption: 'Not to scale. Each grain is pulled toward Earth’s centre (gold), so the two pulls are not parallel. Their sideways parts (red), each GM/r² × (L/2)/r, draw the grains together.',
};

// pull against tide for the Moon and the Sun (powers of ten)
const pullTide = {
  type: 'graph',
  params: {
    x: [-5.2, -1.6], y: [-6.7, -5.6], xlabel: 'log₁₀(pull on Earth, m/s²)', ylabel: 'log₁₀(tide, m/s²)', xticks: 5, yticks: 4,
    points: [
      { x: round(log(GM_MOON / D_MOON ** 2), 4), y: round(log((2 * GM_MOON * R_EARTH) / D_MOON ** 3), 4), color: 'ink2', label: 'Moon' },
      { x: round(log(GM_SUN / AU ** 2), 4), y: round(log((2 * GM_SUN * R_EARTH) / AU ** 3), 4), color: 'gold', label: 'Sun' },
    ],
  },
  caption: 'Each body’s pull on the Earth as a whole (across) and the tide it raises across the Earth (up), both in powers of ten.',
};

// stretch against distance near one black hole, log–log, with the horizon marked
const bhCurve = (m) => {
  const GM = m * GM_SUN, xs = round(log(rs(GM) / 1e3), 4);
  return {
    type: 'graph',
    params: {
      x: [1, 4.3], y: [-1, 9.5], xlabel: 'log₁₀(distance in km)', ylabel: 'log₁₀(stretch on 2 m, m/s²)',
      curves: [{ fn: `${round(log(4 * GM), 6)} - 3(x + 3)`, color: 'accent', domain: [xs, 4.3] }],
      vlines: [{ x: xs, label: 'horizon' }],
      hlines: [{ y: round(log(g0), 4), label: 'g on Earth', color: 'bad' }],
    },
    caption: `The head-to-foot stretch on a 2 m body against distance from a ${m}-solar-mass black hole, both in powers of ten: it grows as 1/r³ all the way to the horizon.`,
  };
};

// horizon stretch against mass, log–log
const horizonCurve = {
  type: 'graph',
  params: {
    x: [0, 10], y: [-12, 10], xlabel: 'log₁₀(mass in solar masses)', ylabel: 'log₁₀(stretch on 2 m at the horizon, in g)',
    curves: [{ fn: `${round(log(stretch(GM_SUN, 2, rs(GM_SUN)) / g0), 5)} - 2x`, color: 'accent' }],
    points: [
      { x: 1, y: round(log(BH.horizon / g0), 4), color: 'bad', label: '10 M☉' },
      { x: round(log(SGR), 4), y: round(log(SG.horizon / g0), 4), color: 'accent2', label: 'Sgr A*' },
    ],
  },
  caption: 'The stretch on a 2 m body as it crosses the horizon, against the black hole’s mass, both in powers of ten: it falls as 1/M².',
};

// a gradiometer: two test masses one above the other, the lower pulled slightly harder (not to scale)
const gradiometer = {
  type: 'graph',
  params: {
    x: [-1.6, 1.6], y: [0.62, 1.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['6sin(t)', '6cos(t) - 5.1'], t: [-0.32, 0.32], color: 'teal', width: 2.4 }],
    arrows: [{ from: [0, 1.3], to: [0, 1.04], color: 'warn' }, { from: [0, 1.62], to: [0, 1.43], color: 'warn' }],
    points: [
      { x: 0, y: 1.3, color: 'accent2', label: 'lower test mass' }, { x: 0, y: 1.62, color: 'accent2', label: 'upper test mass, 0.5 m higher' },
      { x: -1.38, y: 0.66, color: 'teal', label: 'Earth', r: 0.5 },
    ],
  },
  caption: 'Not to scale. Inside a gradiometer two test masses fall freely, one above the other; the lower one is pulled slightly harder. Their relative acceleration, per metre, is the gravity gradient — the tide.',
};

export default lesson({
  id: 'gr.S14.i',
  title: 'Curvature you can feel: tides',
  minutes: 9, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`Fall freely and gravity vanishes — but only at one point. What no fall can remove is the **difference** in gravity between nearby points: the **tide**. Release a small ball of dust near a mass and it is stretched along the line to the mass and squeezed across it. Those relative accelerations, shown above for two free particles a small distance $L$ apart at distance $r$ from the centre of a mass $M$, are the curvature of spacetime made tangible.

In general relativity these are components of the **Riemann curvature tensor**, the complete description of curvature (20 numbers at each event). For a ball falling straight toward a non-spinning mass they come out exactly as Newton's tides (with $r$ measured as circumference ÷ 2π), all the way to a black hole's horizon. Divide them by $c^2$ and you have curvature in m⁻². Ocean tides, gravity gradiometers and LIGO all measure curvature this way — as tides.`,
  equation: t`\Delta a_\parallel = +\frac{2GM}{r^3}\,L \qquad \Delta a_\perp = -\frac{GM}{r^3}\,L`,
  symbols: [
    { tex: '\\Delta a_\\parallel', text: 'the relative acceleration of two free particles lined up along the line to the mass, in m/s²; positive means they **separate** (stretch)' },
    { tex: '\\Delta a_\\perp', text: 'the same for two particles side by side, across that line; negative means they **approach** (squeeze). It acts in both directions across the line' },
    { tex: 'L', text: 'the particles’ separation, in m — small compared with $r$' },
    { tex: 'r', text: 'the distance from the centre of the mass, in m' },
    { tex: 'M', text: 'the mass, in kg' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\text{s}^{-2}$' },
    { tex: 'GM/r^3', text: 'the tidal strength, in s⁻² (m/s² per metre). Divided by $c^2$ it is spacetime curvature, in m⁻²' },
  ],
  why: 'Tides are how curvature is measured — by gradiometers, by the falling ball of dust in the next step, and by LIGO — and they decide whether a black hole tears you apart before or after you cross its horizon.',
  visual: {
    type: 'gr-dustball',
    title: 'A ball of dust falling toward a mass',
    lead: t`Each grain falls freely; the arrows show how it accelerates relative to the ball’s centre. Press **Play** and watch both views and the volume graph.`,
    tasks: [
      'Drag the time back to 0: the stretch arrows are exactly twice as long as the squeeze arrows, at every distance.',
      'Watch the end-on view: the squeeze acts in both directions across the line — and the volume graph starts out flat.',
      'Choose the 10 M☉ black hole and slide the ball in to its horizon: the time scale drops to about a tenth of a millisecond and the head-to-foot stretch passes 10⁸ m/s². At the horizon of Sgr A* it is about a thousandth of a m/s².',
    ],
    params: { mode: 'tides', body: 'earth', bodies: true, t: 0.6 },
  },
  example: {
    prompt: t`An astronaut 2 m tall falls feet first toward a black hole. Take a head-to-foot stretch of $10g = 98.1\ \text{m/s}^2$ as a benchmark you could not ignore. Where is it reached for a 10-solar-mass black hole, and for Sagittarius A* ($4.30\times10^{6}$ solar masses)? Compare each with the horizon, $r_s = 2GM/c^2$. Use $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.`,
    visual: spaghettiGraph,
    steps: [
      { label: 'The condition', text: t`Set $\Delta a_\parallel = 2GML/r^3 = 10g$ and solve: $r = \left(\dfrac{2GML}{10g}\right)^{1/3}$. The stretch grows as $1/r^3$ as she falls in.` },
      { label: '10 solar masses', text: t`$GM = ${sci(BH.GM, 4)}\ \text{m}^3/\text{s}^2$, so $r = \left(\dfrac{2\times${sci(BH.GM, 4)}\times2}{98.1}\right)^{1/3} = ${sci(BH.r10, 3)}$ m $\approx ${grp(Math.round(BH.r10 / 1e4) * 10)}$ km. Its horizon is only $r_s = ${sci(BH.rs / 1e3, 3)}$ km, so this is ${Math.round(BH.r10 / BH.rs)} horizon radii out.` },
      { label: 'At its horizon', text: t`$2GML/r_s^3 = ${sci(BH.horizon)}\ \text{m/s}^2$ — about $${sci(BH.horizon / g0, 2)}\,g$. Long before she reaches the horizon she is drawn out like spaghetti: **spaghettification**.` },
      { label: 'Sagittarius A*', text: t`$GM = ${sci(SG.GM, 3)}\ \text{m}^3/\text{s}^2$ gives $r = ${sci(SG.r10 / 1e3, 3)}$ km, but the horizon is $r_s = ${sci(SG.rs / 1e3, 3)}$ km: the 10 g point lies at ${round(SG.r10 / SG.rs, 2)} $r_s$, **inside** the horizon. She crosses it feeling a stretch of only $${sci(SG.horizon, 2)}\ \text{m/s}^2$, and is torn apart later, inside.` },
      { label: 'Why they differ', text: t`The 10 g radius grows as $M^{1/3}$, the horizon as $M$, so their ratio falls as $M^{-2/3}$: the bigger the black hole, the gentler its horizon. (Inside the horizon $r$ is no longer a distance you could hover at, but in her own falling frame the stretch is still $2GML/r^3$.)` },
    ],
    answer: t`10 M☉: at about ${plain(Math.round(BH.r10 / 1e4) * 10)} km, ${Math.round(BH.r10 / BH.rs)} horizon radii out — torn apart long before the horizon. Sgr A*: at about $${sci(SG.r10 / 1e3, 2)}$ km, ${round(SG.r10 / SG.rs, 2)} of the horizon radius — she crosses intact.`,
  },
  practice: [
    mcq({
      id: 'shape', difficulty: 1,
      prompt: 'A small ball of dust is released at rest high above the Earth, in a vacuum, and falls freely. What shape does it become as it falls?',
      visual: ball({ mode: 'tides', body: 'earth', t: 0, arrows: false, views: 'side' }, 'The ball of dust at the moment of release, with Earth to the left. What happens next?'),
      choices: [
        'Stretched along the line to Earth and squeezed across it, like a rugby ball pointing at Earth',
        'Flattened into a pancake facing Earth',
        'It stays a sphere: everything falls at the same rate',
        'A smaller sphere: it shrinks the same way in every direction',
      ],
      answer: 0,
      why: {
        1: 'That has the stretch and squeeze swapped. The grains nearest Earth are pulled hardest, so the ball lengthens toward Earth.',
        2: 'Everything falls at the same rate only at one point. Gravity is stronger lower down and points toward Earth’s centre from slightly different directions, so the grains drift apart and together.',
        3: 'Shrinking equally in all directions needs matter inside the ball (the next step). In empty space the stretch and the squeezes cancel in volume; only the shape changes.',
      },
      hints: ['Compare the pull on the grain nearest Earth with the pull on the one farthest away.', 'Then compare the directions of the pulls on two grains side by side.'],
      teach: 'Near a mass, a freely falling ball stretches along the line to the mass and squeezes across it: that tidal pattern is curvature.',
      explain: 'Gravity is stronger closer in, so the near grains pull ahead and the far ones lag: a stretch along the line. Grains side by side both fall toward Earth’s centre, so they converge: a squeeze across. The ball becomes a rugby ball pointing at Earth.',
    }),
    num({
      id: 'squeeze', difficulty: 2,
      gen(r) {
        const L = r.pick([2, 5, 10, 20]), h = r.pick([300, 400, 800, 2000]);
        const rr = R_EARTH + h * 1e3, a = (GM_EARTH * L) / rr ** 3;
        return {
          prompt: t`Two dust grains float side by side, ${L} m apart and both ${plain(h)} km above the ground, and are released at rest (no air). With what relative acceleration do they start to move toward each other? Use $GM_\oplus = ${sci(GM_EARTH, 4)}\ \text{m}^3/\text{s}^2$ and $R_\oplus = 6371$ km.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: 2 * a, feedback: 'That is the stretch along the line to Earth, 2GML/r³. Side by side the squeeze is half as big: GML/r³.' },
            { value: (GM_EARTH * L) / (h * 1e3) ** 3, feedback: 'Measure r from Earth’s centre: 6371 km plus the height.' },
          ],
          hints: [t`Across the line to the mass, $|\Delta a_\perp| = GML/r^3$, with $r$ measured from Earth’s centre.`, t`$r = ${grp(6371 + h)}$ km $= ${sci(rr, 4)}$ m; then $GML/r^3 = ${sci(GM_EARTH, 4)}\times${L}/(${sci(rr, 4)})^3$.`],
          teach: 'Side by side, two falling objects drift together at GML/r³, because both fall toward the same centre.',
          explain: t`$|\Delta a_\perp| = \dfrac{GML}{r^3} = \dfrac{${sci(GM_EARTH, 4)}\times${L}}{(${sci(rr, 4)})^3} = ${sci(a)}\ \text{m/s}^2$. Tiny, but no choice of falling frame removes it: it is curvature.`,
          visual: convergePicture,
        };
      },
    }),
    num({
      id: 'moon-tide', difficulty: 2,
      gen(r) {
        const [where, d] = r.pick([['at its mean distance, 384 400 km', 3.844e8], ['at perigee, its closest, 363 300 km', 3.633e8], ['at apogee, its farthest, 405 500 km', 4.055e8]]);
        const a = (2 * GM_MOON * R_EARTH) / d ** 3;
        return {
          prompt: t`The Moon is ${where} from Earth’s centre. How much more strongly does it pull on the ocean directly beneath it than on Earth’s centre? Use the tidal stretch $\Delta a_\parallel = 2GML/r^3$ with $L = R_\oplus = 6371$ km and $GM_\text{Moon} = ${sci(GM_MOON, 4)}\ \text{m}^3/\text{s}^2$.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.04 },
          errors: [
            { value: GM_MOON / d ** 2, feedback: 'That is the Moon’s whole pull on the Earth. The tide is the difference in pull across the Earth.' },
            { value: (GM_MOON * R_EARTH) / d ** 3, feedback: 'Along the line to the Moon the stretch carries a factor 2: 2GML/r³.' },
          ],
          hints: [t`$L = 6.371\times10^{6}$ m and $r = ${sci(d, 4)}$ m.`, t`$2\times${sci(GM_MOON, 4)}\times6.371\times10^{6}/(${sci(d, 4)})^3$.`],
          teach: 'The Moon’s tide is the difference between its pull on the near ocean and on Earth’s centre: 2GMR/d³, about a ten-millionth of g.',
          explain: t`$\Delta a = \dfrac{2\times${sci(GM_MOON, 4)}\times6.371\times10^{6}}{(${sci(d, 4)})^3} = ${sci(a)}\ \text{m/s}^2$ — about $${sci(a / g0, 2)}\,g$. Small, but it acts on whole ocean basins, which respond by sloshing: real tide heights are set by the shapes of the basins and coasts.`,
          visual: tidalField(),
        };
      },
    }),
    mcq({
      id: 'two-bulges', difficulty: 2,
      prompt: 'The Moon raises two tidal bulges: one on the side of the Earth facing it and one on the far side. Why is there a bulge on the far side?',
      visual: tidalField({ caption: 'The Moon’s tide over the Earth, relative to Earth’s centre: arrows hugely exaggerated, the Moon far off to the right. Look at the arrows on the far (left) side.' }),
      choices: [
        'The far side is pulled less than Earth’s centre, so relative to the centre it accelerates away from the Moon — just as the near side accelerates toward it',
        'The Moon’s gravity pushes the water on the far side away',
        'The Sun raises the far bulge',
        'The Earth’s spin flings water outward on the side away from the Moon',
      ],
      answer: 0,
      why: {
        1: 'Gravity only attracts. The far water is pulled toward the Moon too — just less than the Earth’s centre is.',
        2: 'The Sun raises its own pair of bulges, about half as large. The far bulge follows the Moon around the Earth, so it is the Moon’s.',
        3: 'The spin flings water outward equally all the way round a line of latitude — it makes the Earth’s equatorial bulge, not a bulge that follows the Moon.',
      },
      hints: ['Only differences in pull matter for a body that falls freely as a whole.', 'Rank the pulls on the near water, Earth’s centre and the far water.'],
      teach: 'Tides are differences in pull: the near side is pulled more than the centre and the far side less, so both bulge outward.',
      explain: 'The Earth falls freely toward the Moon (it orbits their common centre of mass). Relative to Earth’s centre, the near water is pulled ahead and the far water is left behind: a stretch along the line, with two bulges, and a squeeze across it.',
    }),
    mcq({
      id: 'volume', difficulty: 2,
      prompt: t`In empty space near a mass, a falling ball of dust is stretched along the line to the mass at the rate $+2GM/r^3$ and squeezed in each of the two directions across it at $-GM/r^3$. What happens to the ball’s volume at first?`,
      visual: ball({ mode: 'tides', body: 'earth', t: 0.45, arrows: true, views: 'side' }, 'Side view of the falling ball: stretched along the line, squeezed across it. The squeeze also acts in the direction out of the screen.'),
      choices: [
        'Nothing: +2 − 1 − 1 = 0, so it changes shape but not volume',
        'It grows, because the stretch is the biggest of the three',
        'It shrinks, because gravity pulls things together',
        'It depends on how far the ball is from the mass',
      ],
      answer: 0,
      why: {
        1: 'There are two squeeze directions, and together they exactly match the one stretch.',
        2: 'Shrinking needs matter inside the ball — that is the next step, Ricci curvature. In empty space the squeezes and the stretch cancel.',
        3: 'The stretch and both squeezes scale together, as GM/r³, so they cancel at every distance.',
      },
      hints: ['Add the three rates, one for each direction.', 'The squeeze happens in two directions — in the screen and out of it.'],
      teach: 'In empty space the tidal stretch and the two squeezes cancel in volume: tides change a ball’s shape, not, at first, its volume.',
      explain: t`The volume changes at the sum of the three rates: $2GM/r^3 - GM/r^3 - GM/r^3 = 0$. So in empty space a falling ball changes shape but not, at first, volume. Inside matter that sum is no longer zero — the subject of the next step.`,
    }),
    num({
      id: 'ten-g', difficulty: 3,
      gen(r) {
        const m = r.pick([5, 20, 50, 100]);
        const GM = m * GM_SUN, r10 = tenG(GM), R = rs(GM);
        return {
          prompt: t`An astronaut 2 m tall falls feet first toward a black hole of ${m} solar masses. At what distance from its centre does the head-to-foot stretch, $2GML/r^3$, reach $10g = 98.1\ \text{m/s}^2$? Use $GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$ and give the distance in kilometres.`,
          answer: r10 / 1e3, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: Math.cbrt((GM * 2) / (10 * g0)) / 1e3, feedback: 'Along the line to the mass the stretch is 2GML/r³ — keep the 2.' },
            { value: Math.cbrt((2 * GM * 2) / 10) / 1e3, feedback: 'Use 10 g = 98.1 m/s², not 10 m/s².' },
            { value: Math.sqrt((2 * GM * 2) / (10 * g0)) / 1e3, feedback: 'The stretch falls as 1/r³, so take a cube root, not a square root.' },
          ],
          hints: [t`Solve $2GML/r^3 = 98.1$ for $r$: $r = (2GML/98.1)^{1/3}$.`, t`$GM = ${m}\times1.327\times10^{20} = ${sci(GM, 4)}\ \text{m}^3/\text{s}^2$ and $L = 2$ m.`, t`$r = (${sci(4 * GM / (10 * g0), 4)})^{1/3}$ m; convert to km.`],
          teach: 'Solve 2GML/r³ = 10g for r: around a stellar black hole, spaghettification sets in thousands of kilometres out.',
          explain: t`$r = \left(\dfrac{2\times${sci(GM, 4)}\times2}{98.1}\right)^{1/3} = ${sci(r10, 3)}$ m $= ${sci(r10 / 1e3, 3)}$ km — ${Math.round(r10 / R)} horizon radii out (the horizon is at $${sci(R / 1e3, 3)}$ km). Between there and the horizon the stretch grows another $${sci((r10 / R) ** 3, 2)}$ times.`,
          visual: bhCurve(m),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-goce', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([225, 240, 255]);
        const rr = R_EARTH + h * 1e3, gg = (2 * GM_EARTH) / rr ** 3;
        return {
          prompt: t`ESA’s GOCE satellite (2009–2013) mapped Earth’s gravity with a **gradiometer**: pairs of test masses half a metre apart, falling freely inside the spacecraft, with their relative accelerations measured. Flying ${h} km above the ground, what vertical gravity gradient — the stretch rate $2GM/r^3$ — did it measure, in s⁻²? Use $GM_\oplus = ${sci(GM_EARTH, 4)}\ \text{m}^3/\text{s}^2$ and $R_\oplus = 6371$ km.`,
          answer: gg, units: 's^-2', tol: { rel: 0.01 },
          errors: [{ value: GM_EARTH / rr ** 3, feedback: 'That is the squeeze rate across the vertical. Vertically, along the line to Earth, the stretch is twice that: 2GM/r³.' }, { value: (2 * GM_EARTH) / (h * 1e3) ** 3, feedback: 'r is the distance from Earth’s centre, not the height.' }],
          hints: [t`$r = 6371 + ${h}$ km, in metres.`, t`$2GM/r^3 = 2\times${sci(GM_EARTH, 4)}/(${sci(rr, 4)})^3$.`],
          teach: 'A gravity gradiometer measures tides directly: the vertical gradient 2GM/r³ is a few millionths per second squared near Earth.',
          explain: t`$2GM/r^3 = 2\times${sci(GM_EARTH, 4)}/(${sci(rr, 4)})^3 = ${sci(gg)}\ \text{s}^{-2}$ — about ${plain(Math.round(gg / 1e-9 / 10) * 10)} eötvös (1 E $= 10^{-9}\ \text{s}^{-2}$, the gradiometrists’ unit). Over the half-metre between its test masses that is a relative acceleration of $${sci(gg * 0.5, 2)}\ \text{m/s}^2$. Geodesists call it a gravity gradient; a relativist would call it a component of spacetime curvature, times $c^2$.`,
          visual: gradiometer,
        };
      },
    }),
    mcq({
      id: 'cp-sun-moon', difficulty: 2,
      prompt: 'The Sun pulls on the Earth about 179 times as hard as the Moon does, yet the Moon raises tides about twice as large as the Sun’s. Why?',
      visual: pullTide,
      choices: [
        'A tide is a difference in pull across the Earth, which falls off as 1/d³, and the Moon is about 390 times closer than the Sun',
        'The Moon’s gravity at the Earth is stronger than the Sun’s',
        'The Earth’s orbit around the Sun cancels the Sun’s tides',
        'The Moon is directly overhead more often than the Sun',
      ],
      answer: 0,
      why: {
        1: 'It is not: the Sun’s pull on the Earth is about 179 times the Moon’s. Pull and tide are different things.',
        2: 'Falling freely around the Sun removes only the Sun’s uniform pull — exactly as falling around the Moon does for the Moon’s. The differences across the Earth, the tides, remain for both.',
        3: 'Over a day every place passes under both, and the Sun’s tide still turns up at half the Moon’s strength — as the neap and spring tides show.',
      },
      hints: ['The pull falls as 1/d², the tide as 1/d³. Which of the two favours the nearer body more?'],
      teach: 'Tides fall off as M/d³, one power of distance faster than the pull, which hands the advantage to the nearby Moon.',
      explain: t`Pull $\propto M/d^2$ but tide $\propto M/d^3$. The Sun is $2.7\times10^{7}$ times as massive as the Moon but about 390 times as far: its pull wins by $2.7\times10^{7}/390^2 \approx 179$, its tide loses by a further factor of 390, to about $1/2.2$. (When Sun and Moon line up, their tides add: spring tides.)`,
    }),
    num({
      id: 'cp-crossover', difficulty: 3,
      gen(r) {
        const n = r.pick([5, 10, 100]);
        const M = (C ** 3 / (2 * G)) * Math.sqrt(2 / (n * g0));
        return {
          prompt: t`At the horizon $r_s = 2GM/c^2$, the stretch on a body of length $L$ is $2GML/r_s^3$. How massive must a black hole be — in solar masses — for a 2 m astronaut to feel exactly ${n} g there? Use $G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s and $M_\odot = 1.989\times10^{30}$ kg.`,
          answer: M / 1.989e30, units: 'Msun', tol: { rel: 0.01 },
          errors: [{ value: (C ** 3 / G) * Math.sqrt(4 / (n * g0)) / 1.989e30, feedback: 'The horizon is at $r_s = 2GM/c^2$, not $GM/c^2$.' }],
          hints: [t`Substitute $r_s = 2GM/c^2$: $\dfrac{2GML}{(2GM/c^2)^3} = \dfrac{Lc^6}{4G^2M^2}$.`, t`Set $\dfrac{Lc^6}{4G^2M^2} = ${n}\times9.81$ and solve: $M = \dfrac{c^3}{2G}\sqrt{\dfrac{L}{${n}g}}$.`],
          teach: 'The stretch at a horizon falls as 1/M², so above a few thousand to tens of thousands of solar masses you cross the horizon before the tide becomes severe.',
          explain: t`$M = \dfrac{c^3}{2G}\sqrt{\dfrac{L}{${n}g}} = ${sci(C ** 3 / (2 * G), 3)}\ \text{kg/s}\times\sqrt{\dfrac{2}{${round(n * g0, 4)}}}\ \text{s} = ${sci(M, 3)}$ kg $= ${sci(M / 1.989e30, 3)}\ M_\odot$. Heavier holes have gentler horizons: you would cross into Sgr A* (4.3 million $M_\odot$) without noticing.`,
          visual: horizonCurve,
        };
      },
    }),
  ],
  sources: [
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation”, Am. J. Phys. 73, 644 (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 3 (geodesic deviation) and ch. 7', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online)', url: 'https://www.eftaylor.com/exploringblackholes' },
  ],
});
