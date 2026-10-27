// Comparing arrows at different places — Intuition Mode concept lesson.
// The covariant derivative in words and pictures: no indices.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { fromPolar, polarComponents } from '../../src/viz/model/gr-coords.js';

const t = String.raw;
const DEG = Math.PI / 180;

const fieldPicture = (extra = {}, caption) => ({
  type: 'gr-coordinates',
  params: { mode: 'field', alpha: 0, a: [3, 0.6], b: [-1, 3], naive: false, ...extra },
  caption,
});

export default lesson({
  id: 'gr.S10.i',
  kind: 'concept',
  title: 'Comparing arrows at different places',
  minutes: 4, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`To say whether a velocity, a force or a field is **changing**, you must compare an arrow here with an arrow there. On a flat sheet with a square grid that is easy: slide one arrow over to the other without turning it, and compare their components.

Two things spoil the easy way. With curved grid lines, like polar coordinates, a perfectly constant arrow has components that change from place to place — because **the grid’s own directions turn**. And on a curved surface there is no single “same direction” at all: carry an arrow to another place along two different routes and it arrives pointing two different ways. So comparing arrows at different places needs a rule for carrying them. The derivative built with that rule — the **covariant derivative** — counts both kinds of change in the equation above, the components’ and the grid arrows’, and finds that a constant arrow is not changing at all.`,
  equation: t`\mathbf{V} = V_r\,\hat r + V_\theta\,\hat\theta`,
  symbols: [
    { tex: '\\mathbf{V}', text: 'an arrow (a vector, printed in bold): a velocity, a force, the value of a field at one point' },
    { tex: 'V_r,\\ V_\\theta', text: 'its components there: how much of the arrow points outward, and how much around' },
    { tex: '\\hat r', text: 'the polar grid’s unit arrow pointing straight away from the origin — a different direction at every point' },
    { tex: '\\hat\\theta', text: 'the grid’s unit arrow pointing around the origin, anticlockwise — also different at every point' },
  ],
  why: 'Saying “a freely falling particle keeps its velocity” or “energy and momentum are conserved” in curved spacetime means comparing arrows at neighbouring events — which needs exactly this rule.',
  visual: {
    type: 'gr-coordinates',
    title: 'A constant field with changing components',
    lead: t`Every arrow in this field is the same arrow. At A and B the polar grid’s own arrows, “out” ($\hat r$) and “around” ($\hat\theta$), are drawn too. Drag A and B and watch their components.`,
    tasks: [
      'Drag B around the origin: its components swing from (1, 0) to (0, −1) to (−1, 0), while the arrow at B never changes.',
      'Turn on “copy A’s components”: the red arrow has A’s numbers but points the wrong way — it has turned with the grid.',
      'Check that the red arrow is off by exactly the angle the grid turns between A and B.',
    ],
    params: { mode: 'field', alpha: 0, a: [3, 0.6], b: [-1, 3], naive: false },
  },
  practice: [
    num({
      id: 'components', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 60, 120, 150, 210, 240, 300]);
        const which = r.pick(['r', 'theta']);
        const [vr, vt] = polarComponents(0, th * DEG);
        const ans = which === 'r' ? vr : vt;
        return {
          prompt: t`A field of identical arrows of length 1 points due east (along $+x$) everywhere. At the point with polar angle $\theta = ${th}^\circ$, what is its ${which === 'r' ? t`outward component $V_r$` : t`around component $V_\theta$`}? (Use $V_r = \cos(\alpha - \theta)$ and $V_\theta = \sin(\alpha - \theta)$, where $\alpha = 0^\circ$ is the arrow’s direction.)`,
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: which === 'r' ? vt : vr, feedback: which === 'r' ? 'That is the around component; the outward one uses the cosine.' : 'That is the outward component; the around one uses the sine.' }],
          hints: [t`$\alpha - \theta = ${-th}^\circ$.`, t`${which === 'r' ? t`$V_r = \cos(${-th}^\circ)$` : t`$V_\theta = \sin(${-th}^\circ)$`}.`],
          teach: 'The same arrow has different components at different places, because the polar grid’s arrows point differently there.',
          explain: t`$${which === 'r' ? 'V_r' : 'V_\\theta'} = ${which === 'r' ? '\\cos' : '\\sin'}(${-th}^\circ) = ${fmt(ans, 3)}$. At $\theta = 0$ the same arrow would have components $(1, 0)$: the numbers changed, the arrow did not.`,
          visual: fieldPicture({ a: fromPolar(3, th * DEG), b: fromPolar(3, 0), readout: false }, t`A is at polar angle ${th}°, B at 0°. The gold arrow is identical everywhere; the grid arrows “out” and “around” are not.`),
        };
      },
    }),
    mcq({
      id: 'changing', difficulty: 2,
      prompt: t`In polar components, a field has $V_r = \cos\theta$ and $V_\theta = -\sin\theta$ at every point. Is the field changing from place to place?`,
      choices: [
        t`No — it is the same arrow everywhere (pointing along $+x$); only the grid’s directions change`,
        'Yes — its components change, so the field changes',
        'Yes — it swirls around the origin',
        'There is no way to tell from the components',
      ],
      answer: 0,
      why: { 1: 'Components are measured against the local grid arrows, which turn from place to place. Changing components can be the grid’s doing alone.', 2: t`A swirl would point along $\hat\theta$ everywhere. This field has $V_r\hat r + V_\theta\hat\theta = \cos\theta\,\hat r - \sin\theta\,\hat\theta$, which is the fixed arrow $\hat x$.`, 3: 'You can tell, by building the arrow from its components and the grid arrows at each point — that is what the covariant derivative does.' },
      hints: [t`At $\theta = 0$: $(V_r, V_\theta) = (1, 0)$, along $\hat r = \hat x$. At $\theta = 90^\circ$: $(0, -1)$, along $-\hat\theta$, which points... where?`, t`At $\theta = 90^\circ$, $\hat\theta$ points along $-x$, so $-\hat\theta$ points along $+x$.`],
      teach: 'Changing components do not mean a changing arrow: put the components back together with the local grid arrows and compare.',
      explain: t`At every point $\cos\theta\,\hat r - \sin\theta\,\hat\theta = \hat x$: the same arrow. A naive derivative of the components is not zero; the covariant derivative, which also counts the turning of $\hat r$ and $\hat\theta$, is exactly zero.`,
      visual: fieldPicture({}, 'The field with these components: every arrow points east.'),
    }),
    num({
      id: 'copy-error', difficulty: 2,
      gen(r) {
        const thB = r.pick([45, 60, 90, 120, 150]);
        return {
          prompt: t`At point A (polar angle $0^\circ$) an arrow has components $(V_r, V_\theta)$. You carry it to point B (polar angle $${thB}^\circ$) by keeping the same two numbers — the naive rule. By how many degrees does the copy at B differ from the arrow you started with?`,
          answer: thB, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'Same components are not the same arrow: at B they are measured against grid arrows that have turned.' }],
          hints: ['The copy has turned with the grid.', t`From A to B the grid arrows $\hat r$ and $\hat\theta$ turn through the change in polar angle.`],
          teach: 'Keeping components fixed carries an arrow with the turning grid; the error is the grid’s turn, which the covariant derivative subtracts.',
          explain: t`The grid arrows at B are those at A turned through ${thB}°, so the copy is turned by ${thB}° too. The rule that undoes this — keep the arrow, not its components — is what the connection (next step) supplies.`,
          visual: fieldPicture({ a: fromPolar(3, 0), b: fromPolar(3, thB * DEG), naive: true, readout: false }, 'Red dashed: the copy with A’s components. Gold: the true arrow, unchanged.'),
        };
      },
    }),
    mcq({
      id: 'two-routes', difficulty: 2,
      prompt: 'Two hikers start together at the North Pole, holding arrows that point the same way — along the 0° meridian. One walks south along the 0° meridian to the equator, then east along the equator to 90°E. The other walks straight south along the 90°E meridian. Neither ever turns their arrow. Do the arrows agree when they meet?',
      choices: [
        'No — on a curved surface the result depends on the route (here they differ by 90°)',
        'Yes — neither arrow was ever turned, so they still agree',
        'Yes, but only because both routes end on the equator',
        'No — but only because the first hiker walked farther',
      ],
      answer: 0,
      why: { 1: 'Never turning an arrow keeps it parallel step by step; on a sphere, step-by-step parallel does not add up to the same direction by different routes.', 2: 'Ending on the equator has nothing to do with it; any two routes enclosing area disagree.', 3: 'Walking farther along a single straight route changes nothing; what matters is the area between the two routes.' },
      hints: ['Press Play on the sphere: the arrow is carried down one route and back up the other — the two routes together make a closed loop.', 'If both routes gave the same arrow, the arrow carried around the loop would come back unchanged. Does it?'],
      teach: 'On a curved surface there is no route-independent “same direction”: carrying an arrow needs a rule, and the answer depends on the path.',
      explain: 'The first hiker’s arrow points due south at the end; the second’s points due west. The difference, 90°, is the area of the triangle between the routes (an eighth of the sphere, divided by R²). Path dependence like this is how curvature shows up.',
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, colatSlider: false, progress: 1, readout: false }, caption: 'Carried around the whole triangle — down one route, back up the other — the arrow returns turned by 90°.' },
    }),
    mcq({
      id: 'why-needed', difficulty: 2,
      prompt: 'Why does general relativity need a rule for comparing arrows at different places?',
      choices: [
        'To say whether a velocity or a flow of energy is really changing — laws like “a free particle keeps its velocity” compare arrows at neighbouring events',
        'Because arrows in curved spacetime are longer than in flat spacetime',
        'To convert between metres and seconds',
        'Because gravity is a force that turns every arrow',
      ],
      answer: 0,
      why: { 1: 'Lengths come from the metric; the problem is direction — what counts as “the same” arrow somewhere else.', 2: 'Units are a separate matter (c converts them).', 3: 'In general relativity gravity is not a force; arrows change only relative to a rule for carrying them.' },
      hints: ['What must you compare to know whether a falling apple’s velocity is changing?'],
      teach: 'Any law about change — of velocity, momentum, energy flow — compares arrows at nearby events, so curved spacetime needs a rule for carrying arrows.',
      explain: 'Velocity, momentum and energy flow are arrows. “Unchanging” means equal to the arrow carried over from the previous moment. The covariant derivative builds that comparison into calculus, so the laws of physics look the same in any coordinates and in curved spacetime.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-radar', difficulty: 2, transfer: true,
      prompt: 'A radar station tracks an aircraft flying in a straight line at constant speed past it. In the radar’s polar coordinates, the aircraft’s velocity components (outward and around) change all the time. Is the aircraft accelerating?',
      choices: [
        'No — its velocity arrow is constant; the components change because the radar’s grid directions turn as the aircraft moves',
        'Yes — changing components mean changing velocity',
        'Yes, but only while it is closest to the radar',
        'It depends on how far the radar is from the aircraft',
      ],
      answer: 0,
      why: { 1: 'Components are measured against the local “out” and “around” directions, which turn as the aircraft passes.', 2: 'Nothing special happens at closest approach: the components change fastest there, but the velocity arrow is the same.', 3: 'Distance changes the components, not the arrow.' },
      hints: ['Would an observer on the aircraft feel any acceleration?'],
      teach: 'Constant motion can have changing components in curved grid coordinates; the covariant derivative recognizes it as unchanging.',
      explain: 'Straight-line, constant-speed motion has a constant velocity arrow. Its radar components change because “outward from the radar” points differently at each position — the grid turns, not the velocity.',
      visual: fieldPicture({ alpha: 30, a: [2.5, 1.2], b: [-2, -0.5], readout: false }, 'A constant velocity arrow (gold) at two positions along a flight; the radar’s grid arrows “out” and “around” differ at the two places.'),
    }),
    num({
      id: 'cp-components', difficulty: 2,
      gen(r) {
        const [alpha, th] = r.pick([[90, 30], [90, 60], [60, 0], [0, 45], [90, 150], [180, 60]]);
        const [vr] = polarComponents(alpha * DEG, th * DEG);
        return {
          prompt: t`An arrow of length 1 points at angle $\alpha = ${alpha}^\circ$ from east (anticlockwise). At the point with polar angle $\theta = ${th}^\circ$, what is its outward component $V_r = \cos(\alpha - \theta)$?`,
          answer: vr, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: Math.sin((alpha - th) * DEG), feedback: 'The outward component uses the cosine of the angle between the arrow and the outward direction.' }],
          hints: [t`$\alpha - \theta = ${alpha - th}^\circ$.`],
          teach: 'An arrow’s outward component is the cosine of the angle between it and the local outward direction.',
          explain: t`$V_r = \cos(${alpha - th}^\circ) = ${fmt(vr, 3)}$.`,
          visual: fieldPicture({ alpha, a: fromPolar(3, th * DEG), b: fromPolar(3, (th + 120) * DEG), readout: false }, t`Every arrow points at ${alpha}° from east; A sits at polar angle ${th}°.`),
        };
      },
    }),
    mcq({
      id: 'cp-sphere', difficulty: 3,
      prompt: 'On a perfectly round planet, could you paint an arrow at every point so that each one is the never-turned (parallel-carried) copy of every other, whichever route you carry it along?',
      choices: [
        'No — on a curved surface carrying an arrow around a loop turns it, so no such field exists',
        'Yes — paint them all pointing north',
        'Yes — paint them all pointing toward a distant star',
        'Yes, provided the arrows are short enough',
      ],
      answer: 0,
      why: { 1: 'A north-pointing arrow carried east along a circle of latitude drifts away from north (step 13): “north” is not parallel-carried.', 2: 'A fixed direction in space is not tangent to the surface everywhere, so it cannot be one of the surface’s arrows.', 3: 'Length has nothing to do with direction.' },
      hints: ['What happens to an arrow carried around a closed loop on a sphere?', 'If every arrow were the carried copy of every other, carrying one around a loop would bring it back unchanged.'],
      teach: 'On a curved surface parallel transport depends on the path, so no field of arrows is “the same” everywhere.',
      explain: 'Such a field would let you carry an arrow around any loop and get back exactly the arrow you started with. On a sphere, loops turn arrows by the area they enclose (divided by R²), so it cannot exist. On a flat plane it does: the field of identical arrows in the Explore.',
      visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 50, progress: 0.5, readout: false }, caption: 'An arrow that starts pointing north (black), carried east without turning (red): it no longer points north.' },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, §3.1–3.2', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 20', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
