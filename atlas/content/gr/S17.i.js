// The part of curvature matter controls — Intuition Mode concept lesson.
// Riemann curvature (20 numbers per event in 4D) = Ricci part (10: volume
// change, fixed point by point by the matter there) + Weyl part (10: shape
// change — tides in vacuum and gravitational waves — set by matter elsewhere
// and by waves). Einstein's equation fixes only the Ricci part, through the
// Einstein tensor G = Ricci − ½R g, the one combination that is automatically
// "balanced" (divergence-free), matching the conservation of energy and
// momentum. In 2+1 dimensions there is no Weyl part: no tides, no waves.
import { lesson, mcq, num } from '../../src/core/content.js';
import { ball } from './_curvature.js';

const t = String.raw;

const riemann = (n) => (n * n * (n * n - 1)) / 12;
const ricci = (n) => (n * (n + 1)) / 2;
const weyl = (n) => (n >= 3 ? riemann(n) - ricci(n) : 0);

// independent curvature numbers: in 3 dimensions Riemann and Ricci coincide (practice: no answer shown)
const countGraph = {
  type: 'graph',
  params: {
    x: [2.5, 6.5], y: [0, 9], xlabel: 'number of spacetime dimensions n', ylabel: 'independent numbers', xticks: 4, yticks: 5,
    points: [{ x: 3, y: riemann(3), color: 'gold', label: 'Riemann = Ricci = 6' }],
  },
  caption: t`In 3 dimensions (two of space, one of time) the Ricci part already holds all of the curvature, so the Weyl part is zero. From 4 dimensions up, Riemann has more numbers than Ricci: $n^2(n^2-1)/12$ against $n(n+1)/2$.`,
};
// the worked example's picture: both counts against n, with the gap that is the Weyl part
const countCurves = {
  type: 'graph',
  params: {
    x: [2.5, 5.5], y: [0, 55], xlabel: 'number of spacetime dimensions n', ylabel: 'independent numbers', xticks: 3, yticks: 6,
    curves: [
      { fn: 'x^2(x^2 - 1)/12', color: 'gold', domain: [3, 5.5], label: 'Riemann', labelAt: 5.05, labelDx: -70, labelDy: -6 },
      { fn: 'x(x + 1)/2', color: 'accent', domain: [3, 5.5], label: 'Ricci', labelAt: 5.05, labelDx: 4, labelDy: 14 },
    ],
    points: [3, 4, 5].flatMap((n) => [{ x: n, y: riemann(n), color: 'gold', label: String(riemann(n)) }, { x: n, y: ricci(n), color: 'accent', label: n === 3 ? '' : String(ricci(n)) }]),
  },
  caption: t`Independent curvature numbers against the number of spacetime dimensions: Riemann (gold) and its Ricci part (blue). They coincide at $n = 3$; the gap above is the Weyl part — 10 numbers in our 4 dimensions.`,
};

// two satellites in empty space above a melting ice sheet (not to scale)
const gracePicture = {
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-0.1, 1.55], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['8sin(t)', '8cos(t) - 8'], t: [-0.28, 0.28], color: 'teal', width: 2.4 },
      { param: ['9.3sin(t)', '9.3cos(t) - 8'], t: [-0.22, 0.22], color: 'ink4', width: 1.2, dash: true },
      { param: ['-0.55 + 1.1t', '1.3 + 0.03sin(3.1416t)'], t: [0, 1], color: 'violet', width: 1.6, dash: true },
    ],
    shade: [{ fn: '0.12 - 2.4(x + 0.1)^2', lower: '-0.02', from: -0.32, to: 0.12, color: 'accent2', alpha: 0.55 }],
    points: [
      { x: -0.55, y: 1.29, color: 'accent', label: 'satellite 1' }, { x: 0.55, y: 1.29, color: 'accent', label: 'satellite 2' },
      { x: -0.15, y: 0.16, color: 'accent2', r: 0.01, label: 'ice sheet' },
    ],
  },
  caption: 'Not to scale. Two satellites follow each other around the Earth in empty space, measuring the distance between them (violet) to micrometres; as the ice below melts, the tides it raises on the pair change.',
};

// a slice of space around a point mass in a 2+1-dimensional universe: a cone (flat everywhere except the tip)
const conePicture = {
  type: 'surface3d',
  params: {
    surface: ['v cos(u)', 'v sin(u)', '-1.2 + 0.9v'], domain: [[0, 6.2832], [0, 2]], n: 30, axes: false, alpha: 0.75,
    yaw: -0.6, pitch: 0.28, dist: 8,
    curves: [{ param: ['1.2cos(t)', '1.2sin(t)', '-0.12'], t: [0, 6.2832], color: 'gold', width: 2.4 }],
  },
  caption: 'Space around a point mass in a universe with two space dimensions: a cone, drawn in an extra dimension that is not physical. It is flat everywhere except at the tip — like the paper cone of step 13 — so empty space there has no curvature at all. Drag to rotate.',
};

export default lesson({
  id: 'gr.S17.i',
  kind: 'concept',
  title: 'The part of curvature matter controls',
  minutes: 5, difficulty: 2, mode: 'intuition', badges: ['est-der'],
  intro: t`At each event, curvature — the Riemann tensor of step 14 — is 20 numbers. They split into two families of 10:

- the **Ricci** part changes the **volume** of a falling ball of dust (step 15). Einstein's equation ties it, point by point, to the matter and energy *right there*;
- the **Weyl** part changes only the **shape**: tides in empty space, and gravitational waves. No local equation fixes it; it is sent from matter elsewhere, and travels at the speed of light.

So matter controls the Ricci part. Einstein packaged it as the **Einstein tensor** above: the Ricci tensor minus half of its trace (the Ricci scalar $R$) times the metric. That subtraction makes $G_{\mu\nu}$ automatically "balanced": its divergence is zero in every spacetime, just as energy and momentum are always conserved. So $G_{\mu\nu}$, and not $R_{\mu\nu}$ alone, can sit opposite the matter in the field equations.`,
  equation: t`G_{\mu\nu} = R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}`,
  symbols: [
    { tex: 'G_{\\mu\\nu}', text: 'the Einstein tensor: the combination of curvature that matter controls, 10 numbers at each event, in m⁻². (The G is Einstein’s, not Newton’s constant)' },
    { tex: 'R_{\\mu\\nu}', text: 'the Ricci tensor: the volume-changing part of curvature, 10 numbers, in m⁻². In a falling ball’s own frame, $R_{tt} = -\\ddot V/(Vc^2)$ (step 15)' },
    { tex: 'R', text: 'the Ricci scalar: one number, the trace of the Ricci tensor — the sum of its four diagonal entries, with the time entry counted negative — in m⁻²' },
    { tex: 'g_{\\mu\\nu}', text: 'the metric (step 8), the rule for distances and times — and the unknown that Einstein’s equation solves for' },
    { tex: '\\mu,\\ \\nu', text: 'labels running over $0, 1, 2, 3$ — time and the three directions of space' },
  ],
  why: 'This is the left-hand side of Einstein’s field equations: next step, G is set equal to the stress–energy of step 16 — and the conservation of energy and momentum comes along for free.',
  visual: {
    type: 'gr-dustball',
    title: 'Two kinds of curvature, two knobs',
    lead: t`Choose **Matter and a distant mass**: the ball sits inside uniform matter, with a planet off to the left. Watch the two readouts as you move each slider.`,
    tasks: [
      'Drag the distance to the planet: only the shape part (the Weyl curvature, sent from the planet) changes.',
      'Drag the density of the matter around the ball: only the volume part (the Ricci curvature, fixed right there) changes.',
      'Switch to the other two places: empty space near the planet has only the shape part; uniform matter alone has only the volume part.',
    ],
    params: { modes: ['tides', 'matter', 'both'], mode: 'both', body: 'earth', r: 1.5, rho: 1000, rhoRange: [1, 1e5], t: 0.6 },
  },
  example: {
    prompt: t`Count the curvature numbers in a universe with two space dimensions (a 3-dimensional spacetime), and in ours (4 dimensions). How many are fixed by local matter, and how many are left for tides and waves? Riemann has $n^2(n^2-1)/12$ independent numbers in $n$ dimensions, Ricci $n(n+1)/2$.`,
    visual: countCurves,
    steps: [
      { label: 'Three dimensions', text: t`Riemann: $3^2(3^2 - 1)/12 = ${riemann(3)}$. Ricci: $3\times4/2 = ${ricci(3)}$. They are equal: the Ricci part *is* all the curvature, and the Weyl part is zero.` },
      { label: 'What that means', text: t`There, Einstein's equation fixes all the curvature from the local matter. Wherever there is no matter, spacetime is flat: no tides, no gravitational waves. Around a point mass, space is a cone — flat everywhere but the tip, like the paper cone of step 13.` },
      { label: 'Four dimensions', text: t`Riemann: $4^2(4^2-1)/12 = ${riemann(4)}$. Ricci: $4\times5/2 = ${ricci(4)}$. That leaves $${riemann(4)} - ${ricci(4)} = ${weyl(4)}$ for the Weyl part.` },
      { label: 'Why it matters', text: t`Those ${weyl(4)} Weyl numbers are why our universe has tides across empty space and gravitational waves that cross it: curvature that no local matter fixes, sent from somewhere else.` },
    ],
    answer: t`With two space dimensions: ${riemann(3)} numbers, all fixed by local matter — no tides, no waves. In our four: ${riemann(4)}, of which ${ricci(4)} (Ricci) are fixed by local matter and ${weyl(4)} (Weyl) are tides and waves.`,
  },
  practice: [
    mcq({
      id: 'which-part', difficulty: 1,
      prompt: 'A small ball of dust falls freely in empty space near the Moon. Which part of the curvature is non-zero where it is?',
      visual: ball({ mode: 'tides', body: 'earth', r: 1.5, t: 0.5, views: 'all' }, 'A ball falling in empty space near a mass: its shape changes, its volume (bottom right) starts out unchanged.'),
      choices: ['Only the Weyl part: the shape changes, the volume does not', 'Only the Ricci part', 'Both parts', 'Neither: empty space is flat'],
      answer: 0,
      why: {
        1: 'The Ricci part needs matter at the ball itself, and there is none.',
        2: 'With no matter at the ball, the Ricci part is zero; only the shape-changing part survives.',
        3: 'The Moon’s tides stretch and squeeze the ball, so the space is curved — just not in the volume-changing way.',
      },
      hints: ['What does the ball’s volume do? And its shape?'],
      teach: 'In empty space the Ricci part vanishes and only the Weyl part — tides that change shape but not volume — remains.',
      explain: 'No matter at the ball means zero Ricci curvature: the volume starts out unchanged. The Moon’s tides still stretch and squeeze it: that shape change is the Weyl curvature, sent across empty space from the Moon.',
    }),
    mcq({
      id: 'uniform', difficulty: 2,
      prompt: 'In a perfectly uniform universe (step 30), a ball of test grains changes volume but never shape: no direction is special. Which part of the curvature does such a universe have?',
      visual: ball({ mode: 'matter', rho: 1000, t: 0.55 }, 'A ball inside perfectly uniform matter: the same change in every direction.'),
      choices: ['Only the Ricci part: the Weyl part is zero', 'Only the Weyl part', 'Both, in equal amounts', 'Neither: a uniform universe is flat'],
      answer: 0,
      why: {
        1: 'The Weyl part changes shape, stretching one direction and squeezing another — impossible when no direction is special.',
        2: 'Nothing forces them to be equal; here the shape part is exactly zero.',
        3: 'The matter in it focuses every ball of grains: its Ricci curvature is not zero, even if space happened to be flat.',
      },
      hints: ['Which part changes shape, and which changes volume?'],
      teach: 'A perfectly uniform universe has only Ricci curvature: matter changes the volume of every ball, and nothing picks out a direction to stretch.',
      explain: 'Shape changes need a special direction — toward a lump of mass, or along a passing wave. A uniform universe has none, so its Weyl part is zero and all its curvature is Ricci curvature, fixed by its matter (and its cosmological constant).',
    }),
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5, 6]);
        return {
          prompt: t`In a spacetime of $n$ dimensions the Riemann tensor has $n^2(n^2-1)/12$ independent numbers at each event and the Ricci tensor $n(n+1)/2$. How many are left for the Weyl part when $n = ${n}$?`,
          answer: weyl(n), tol: { rel: 1e-6 },
          errors: [{ value: riemann(n), feedback: 'That is all of Riemann. Subtract the Ricci part.' }, ...(ricci(n) === weyl(n) ? [] : [{ value: ricci(n), feedback: 'That is the Ricci part. The Weyl part is what Riemann has left over.' }])],
          hints: [t`Riemann: $${n}^2(${n}^2 - 1)/12$.`, t`Ricci: $${n}(${n} + 1)/2$; subtract.`],
          teach: 'The Weyl part is the curvature that the Ricci part leaves undetermined: 10 numbers in four dimensions, none in three.',
          explain: t`$${n}^2(${n}^2-1)/12 - ${n}(${n}+1)/2 = ${riemann(n)} - ${ricci(n)} = ${weyl(n)}$.${n === 4 ? ' Ten tidal and wave numbers in our spacetime.' : ' (Our spacetime has 4 dimensions: 10.)'}`,
          visual: countGraph,
        };
      },
    }),
    mcq({
      id: 'wave', difficulty: 2,
      prompt: 'A gravitational wave passes through the vacuum of a LIGO arm. Which part of the curvature does it carry?',
      visual: ball({ mode: 'wave', t: 0, views: 'all' }, 'A ball of dust as a gravitational wave passes (strain hugely exaggerated): stretched one way, squeezed the other, its area unchanged to first order.'),
      choices: ['The Weyl part: a shape change at constant volume', 'The Ricci part: the wave’s energy shrinks the ball', 'Both parts equally', 'Neither: the wave is just a wobble of the coordinates'],
      answer: 0,
      why: {
        1: 'Where the wave is, there is no matter: the Ricci part is zero, and the ball’s volume does not change.',
        2: 'In vacuum there is nothing to set the Ricci part; it stays zero.',
        3: 'The stretching and squeezing is real curvature: LIGO measured it as a change in the length of its 4 km arms.',
      },
      hints: ['Is there any matter in the arm’s vacuum?'],
      teach: 'Gravitational waves are travelling Weyl curvature: they change shapes, not volumes, and need no matter where they pass.',
      explain: 'The wave stretches the ball one way and squeezes it the other by the same amount, so the shape changes while the volume does not. That is Weyl curvature, launched by a merger far away and travelling at the speed of light.',
    }),
    mcq({
      id: 'why-g', difficulty: 3,
      prompt: t`Why does Einstein’s equation set $G_{\mu\nu}$, rather than the Ricci tensor $R_{\mu\nu}$ alone, equal to the matter’s stress–energy?`,
      choices: [
        t`$G_{\mu\nu}$ is automatically “balanced” (its divergence is zero in every spacetime), just as energy and momentum are always conserved`,
        t`$G_{\mu\nu}$ contains all 20 numbers of the curvature`,
        t`The G in $G_{\mu\nu}$ is Newton’s constant, which has to appear`,
        t`So that empty space has no curvature at all`,
      ],
      answer: 0,
      why: {
        1: 'It holds only 10, built from the Ricci part. The other 10 (Weyl) are not set by local matter at all.',
        2: 'It is named after Einstein. Newton’s constant appears on the other side, in 8πG/c⁴.',
        3: 'Empty space keeps its Weyl curvature — tides and waves. The equations only make the Ricci part zero there.',
      },
      hints: ['What is true of energy and momentum everywhere, always?', 'The two sides of an equation must share every property that holds automatically.'],
      teach: 'The Einstein tensor is the one combination of Ricci curvature whose divergence vanishes identically, so it can equal the conserved stress–energy.',
      explain: t`Energy and momentum are conserved: the stress–energy tensor has zero divergence. The curvature side must share that property, whatever the spacetime. $R_{\mu\nu}$ alone does not; subtracting $\tfrac12 R\,g_{\mu\nu}$ makes it exact (a geometric identity, the contracted Bianchi identity). Einstein’s November 1915 papers first tried $R_{\mu\nu} \propto T_{\mu\nu}$; his final paper, on 25 November, added the trace term. For the symbol-by-symbol view, see [the dissection of the field equations](#/lesson/gr.EQ.1).`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-grace', difficulty: 2, transfer: true,
      prompt: 'NASA–DLR’s GRACE satellites weigh melting ice from orbit: two spacecraft about 220 km apart, in the empty space above the Earth, track the changing distance between them. Which part of the curvature at the satellites changes as the ice sheet below loses mass?',
      visual: gracePicture,
      choices: [
        'The Weyl (tidal) part: no matter is at the satellites, and the ice’s gravity reaches them as tides',
        'The Ricci part, because mass has been lost',
        'Neither: the satellites are in free fall, so they feel no gravity',
        'Only the metric changes; curvature cannot be measured',
      ],
      answer: 0,
      why: {
        1: 'The Ricci part depends only on the matter at the point itself. The ice is far below the satellites; where they are, it stays zero.',
        2: 'Free fall removes gravity at a point, not the difference between two points 220 km apart. That difference is what the satellites measure.',
        3: 'Tidal curvature is exactly what two free-falling satellites measure, through the distance between them.',
      },
      hints: ['Is there any matter where the satellites are?', 'What can two free-falling bodies measure that one cannot?'],
      teach: 'Distant matter acts on empty space through the Weyl (tidal) part of curvature, which two free-falling satellites measure as a change in their separation.',
      explain: 'The satellites fly in vacuum, where the Ricci part is zero whatever happens below. The ice’s gravity reaches them as tides: the Weyl part, which pulls the leading and trailing spacecraft by slightly different amounts. Mapping those changes month by month weighs the ice that has gone.',
    }),
    mcq({
      id: 'cp-flatland', difficulty: 3,
      prompt: 'In a universe with only two space dimensions, Einstein’s equations would fix all of the curvature from the local matter: there is no Weyl part. What would empty space be like there?',
      visual: conePicture,
      choices: [
        'Flat: no tides and no gravitational waves anywhere matter is absent',
        'Full of tides, but with no gravitational waves',
        'Full of gravitational waves, but with no tides',
        'The same as in our universe, only weaker',
      ],
      answer: 0,
      why: {
        1: 'Tides in empty space are Weyl curvature. With no Weyl part there are none.',
        2: 'Gravitational waves are travelling Weyl curvature too. With no Weyl part, nothing can carry curvature across empty space.',
        3: 'It differs in kind, not just strength: our empty space has 10 curvature numbers that do not depend on the local matter; theirs has none.',
      },
      hints: ['Both tides and waves are carried by one part of the curvature. Which?', 'Without that part, what is left of the curvature where there is no matter?'],
      teach: 'Tides and gravitational waves are both Weyl curvature, so a universe without a Weyl part has flat empty space.',
      explain: 'There, wherever matter is absent the Ricci part is zero, and since the Ricci part is all of the curvature, empty space is exactly flat: no tides, no waves. A mass still leaves its mark, but only globally — space around it is a cone, flat everywhere except at the tip.',
    }),
  ],
  sources: [
    { label: 'Baez & Bunn, “The meaning of Einstein’s equation”, Am. J. Phys. 73, 644 (2005)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'Carroll, Lecture Notes on General Relativity, §3.6 and §4.2', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
