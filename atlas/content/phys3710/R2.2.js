// Minkowski diagrams with two observers: reading an event's coordinates in
// the moving frame by drawing parallels to its axes, calibrated by both
// families of hyperbolae; the moving axes as Minkowski-orthogonal; the
// diagram from the other observer's side; and the symmetric (Loedel) frame,
// which halves the rapidity. Builds on phys2710.MP2.4 (tilted axes, the tick
// t = γ on the hyperbola) and gr.S03.i without repeating their examples.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';
import { r6, st, label } from './_geom.js';

const t = String.raw;
const gam = (b) => 1 / Math.sqrt(1 - b * b);
const tp = (b, T, X) => gam(b) * (T - b * X);
const xp = (b, T, X) => gam(b) * (X - b * T);

/** Hyperbolae t² − x² = ±n² for n = 1 … N (calibration curves). */
const calib = (N, color = 'ink3') => Array.from({ length: N }, (_, k) => k + 1).flatMap((n) => [
  { s: n, kind: 'time', color }, { s: n, kind: 'space', both: true, color },
]);

/**
 * Your frame with a moving frame's axes (ticks on the hyperbolae), an event E,
 * and optionally the construction lines through E parallel to the primed axes.
 */
function reading({ b, ev: [T, X], R = 5, build = true, numbers = true, name = 'E', caption }) {
  const g = gam(b);
  const tA = (T - b * X) / (1 - b * b), xB = (X - b * T) / (1 - b * b);   // feet of the parallels on the t′ and x′ axes
  const lines = build ? [
    { pts: [[X, T], [b * tA, tA]], color: 'violet', width: 1.6, dash: [4, 3] },
    { pts: [[X, T], [xB, b * xB]], color: 'teal', width: 1.6, dash: [4, 3] },
  ] : [];
  return st({
    x: [-R, R], t: [-0.45 * R, 1.25 * R], numbers, hyper: calib(Math.floor(R)), boosted: { beta: r6(b), ticks: Math.floor(R) },
    lines, events: [[X, T, name, 'accent2', 9, -8]],
    caption: caption ?? t`Your frame (black axes, $c = 1$, years and light-years) and a frame moving at $\beta = ${nice(b, 3)}$ (gold axes). Gold dots are its unit ticks, where its axes cross the grey hyperbolae $t^2 - x^2 = \pm1, \pm4, \dots$${build ? '. Violet: the line through ' + name + ' parallel to the x′ axis; teal: parallel to the t′ axis.' : '.'}`,
  });
}

export default lesson({
  id: 'phys3710.R2.2',
  title: 'Minkowski diagrams with two observers',
  minutes: 12, difficulty: 3,
  intro: t`One diagram can hold two observers. Yours has the usual axes; one moving at $\beta$ has a time axis along its worldline and a space axis along its line of “now”, both tilted toward the light line:

$$t' \text{ axis: } x = \beta t, \qquad x' \text{ axis: } t = \beta x$$

Its units are fixed by the hyperbolae: the tick $t' = n$ sits where its time axis crosses $t^2 - x^2 = n^2$, and the tick $x' = n$ where its space axis crosses $x^2 - t^2 = n^2$. To read an event’s primed coordinates, **draw lines through it parallel to the primed axes**, just as you would on oblique graph paper, and count ticks. You met the tilted axes and the $t'$ tick in [Spacetime diagrams and the interval](#/lesson/phys2710.MP2.4). Here: reading both coordinates, why the tilted axes are perpendicular after all, and the same picture seen from the other observer’s side.`,
  symbols: [
    { tex: '\\beta', text: 'the moving observer’s speed in your frame, as a fraction of c' },
    { tex: "t'\\text{ axis}", text: t`the moving observer’s worldline, the events with $x' = 0$: the line $x = \beta t$` },
    { tex: "x'\\text{ axis}", text: t`the moving observer’s line of simultaneity through the origin, the events with $t' = 0$: the line $t = \beta x$` },
    { tex: 't,\\ x', text: 'your coordinates, in years and light-years (c = 1)' },
  ],
  why: 'Every paradox of special relativity, and later every diagram of a black hole’s horizon, is read this way: by drawing the right lines on a spacetime diagram and counting along the right hyperbolae.',
  visual: {
    type: 'graph',
    title: 'Reading an event in two frames',
    lead: t`Drag event E and slide $\beta$. The violet line through E runs parallel to the gold $x'$ axis and meets the gold $t'$ axis at E’s time $t'$; the teal line runs parallel to the $t'$ axis and meets the $x'$ axis at E’s position $x'$. Count gold ticks — they sit on the grey hyperbolae.`,
    tasks: [
      'Put E on the grey hyperbola t² − x² = 9 and slide β: E’s t′ and x′ change, but the readout −t′² + x′² stays −9.',
      'Drag E onto the gold x′ axis: its violet line collapses — t′ = 0, it is “now” for the moving observer.',
      'Set β = 0: the parallels become the usual horizontal and vertical lines of a graph.',
    ],
    params: {
      x: [-4.5, 4.5], y: [-2, 5.5], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years)',
      sliders: [{ key: 'b', label: t`Velocity of the moving frame $\beta$`, min: -0.8, max: 0.8, step: 0.01, value: 0.47, explain: t`Its axes are $x = \beta t$ and $t = \beta x$.` }],
      drag: [{ key: 'p', x: 1, y: 4, snap: 0.05 }],
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1.1 }, { fn: '-x', color: 'warn', dash: true, width: 1.1 },
        ...[1, 2, 3, 4].flatMap((n) => [
          { param: [`${n}*sinh(t)`, `${n}*cosh(t)`], t: [-2.4, 2.4], color: 'ink3', width: 0.9, dash: [2, 4] },
          { param: [`${n}*cosh(t)`, `${n}*sinh(t)`], t: [-2.4, 2.4], color: 'ink3', width: 0.9, dash: [2, 4] },
          { param: [`-${n}*cosh(t)`, `${n}*sinh(t)`], t: [-2.4, 2.4], color: 'ink3', width: 0.9, dash: [2, 4] },
        ]),
        { param: ['b*t', 't'], t: [-6, 6], color: 'gold', width: 2.2 }, { param: ['t', 'b*t'], t: [-6, 6], color: 'gold', width: 2.2 },
        { param: ['px + (b*(py - b*px)/(1 - b^2) - px)*t', 'py + ((py - b*px)/(1 - b^2) - py)*t'], t: [0, 1], color: 'violet', width: 1.8, dash: [4, 3] },
        { param: ['px + ((px - b*py)/(1 - b^2) - px)*t', 'py + (b*(px - b*py)/(1 - b^2) - py)*t'], t: [0, 1], color: 'teal', width: 1.8, dash: [4, 3] },
      ],
      points: [
        ...[1, 2, 3, 4].flatMap((n) => [
          { x: `${n}*b/sqrt(1 - b^2)`, y: `${n}/sqrt(1 - b^2)`, r: 3, color: 'gold' }, { x: `${n}/sqrt(1 - b^2)`, y: `${n}*b/sqrt(1 - b^2)`, r: 3, color: 'gold' },
          { x: `-${n}/sqrt(1 - b^2)`, y: `-${n}*b/sqrt(1 - b^2)`, r: 3, color: 'gold' },
        ]),
        { x: 'px', y: 'py', r: 0.01, color: 'accent2', label: 'E' },
        { x: '5*b', y: 5, r: 0.01, color: 'gold', label: 't′' }, { x: 4.3, y: '4.3*b', r: 0.01, color: 'gold', label: 'x′', labelDy: 14 },
      ],
      readouts: [
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`E: $t'$`, expr: '(py - b*px)/sqrt(1 - b^2)', digits: 3 },
        { label: t`E: $x'$`, expr: '(px - b*py)/sqrt(1 - b^2)', digits: 3 },
        { label: t`$-t'^2 + x'^2$`, expr: '-py^2 + px^2', digits: 3, unit: t`\text{ly}^2` },
      ],
    },
    caption: t`One direction of space, $c = 1$. Grey dotted: the calibration hyperbolae $t^2 - x^2 = n^2$ and $x^2 - t^2 = n^2$ for $n = 1$ to 4. The gold ticks are the moving observer’s years and light-years; on paper they look longer than yours.`,
  },
  example: {
    prompt: t`A frame moves at $\beta = \tfrac{8}{17}$. Read the coordinates $(t', x')$ of the event E at $t = 4$ years, $x = 1$ light-year off the diagram, then check them with the Lorentz transformation.`,
    visual: reading({ b: 8 / 17, ev: [4, 1] }),
    steps: [
      { label: 'Calibrate', text: t`$\gamma = 1/\sqrt{1 - (8/17)^2} = \tfrac{17}{15}$ and $\gamma\beta = \tfrac{8}{15}$. The tick $t' = n$ is at $(x, t) = (\tfrac{8}{15}n, \tfrac{17}{15}n)$ on the hyperbola $t^2 - x^2 = n^2$; the tick $x' = n$ is at $(\tfrac{17}{15}n, \tfrac{8}{15}n)$.` },
      { label: 'Time: parallel to x′', text: t`Events with the same $t'$ lie on lines parallel to the $x'$ axis (slope $\beta$). The violet line through E, $t = 4 + \tfrac{8}{17}(x - 1)$, meets the $t'$ axis $x = \tfrac{8}{17}t$ at $t = \tfrac{68}{15}$ — exactly the fourth gold tick. So $t' = 4$.` },
      { label: 'Place: parallel to t′', text: t`Events with the same $x'$ lie on lines parallel to the $t'$ axis. The teal line through E meets the $x'$ axis at $x = -\tfrac{17}{15}$, the first tick on its negative side: $x' = -1$.` },
      { label: 'Check', text: t`$t' = \gamma(t - \beta x) = \tfrac{17}{15}\left(4 - \tfrac{8}{17}\right) = \tfrac{68 - 8}{15} = 4$ ✓ and $x' = \gamma(x - \beta t) = \tfrac{17}{15}\left(1 - \tfrac{32}{17}\right) = -1$ ✓. And $-4^2 + 1^2 = -15 = -4^2 + (-1)^2$ ✓.` },
      { label: 'Sense check', text: t`E is 1 light-year to your right but 1 light-year *behind* the moving observer: by $t' = 4$ that observer has travelled past it. Reading off parallels works on any oblique grid; the hyperbolae supply the spacing.` },
    ],
    answer: t`$(t', x') = (4, -1)$: four years after the origin and one light-year behind, in the moving frame.`,
  },
  practice: [
    {
      type: 'point', id: 'drag-tick', difficulty: 2,
      gen(r) {
        const [b, bs] = r.pick([[0.6, '0.6'], [8 / 17, t`\tfrac{8}{17}`], [0.28, '0.28'], [5 / 13, t`\tfrac{5}{13}`]]);
        const n = r.pick([2, 3]), g = gam(b);
        return {
          prompt: t`An observer moves at $\beta = ${bs}$ (gold time axis). Drag the point to the event where **their** clock reads $t' = ${n}$ years.`,
          visual: { type: 'graph', params: {
            x: [-1, 4.5], y: [-0.3, 4.5], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years)',
            curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.1 }, ...[1, 2, 3].map((k) => ({ param: [`${k}*sinh(t)`, `${k}*cosh(t)`], t: [-1.2, 1.8], color: 'ink3', width: 1, dash: [3, 4] })), { param: [`${r6(b)}*t`, 't'], t: [0, 5], color: 'gold', width: 2.2 }],
            points: [{ x: r6(b * 4.4), y: 4.4, r: 0.01, color: 'gold', label: 't′ axis' }],
            drag: [{ key: 'p', x: 0, y: 0.5, snap: 0.05 }] }, caption: 'Your frame (c = 1). Grey dashed: hyperbolae t² − x² = 1, 4, 9. Gold: the moving observer’s worldline.' },
          answer: { x: r6(n * g * b), y: r6(n * g) }, tol: { x: 0.15, y: 0.15 },
          instruction: `Drag the point to where the moving clock reads ${n} years, then check.`,
          hints: [t`The event lies on the gold axis **and** on the hyperbola $t^2 - x^2 = ${n * n}$.`, t`That is $(x, t) = (${n}\gamma\beta, ${n}\gamma)$ with $\gamma = ${fmt(g, 4)}$: $(${fmt(n * g * b, 3)}, ${fmt(n * g, 3)})$.`],
          teach: 'The tick t′ = n lies where the moving time axis crosses the hyperbola t² − x² = n².',
          explain: t`At $(${fmt(n * g * b, 3)}, ${fmt(n * g, 3)})$: the interval from the origin is $-${n}^2$, so a clock that coasted there reads ${n} years — although your clocks read ${fmt(n * g, 3)}.`,
        };
      },
    },
    num({
      id: 'read-t', difficulty: 2,
      gen(r) {
        const [b, bs] = r.pick([[0.6, '0.6'], [0.28, '0.28'], [5 / 13, t`\tfrac{5}{13}`]]);
        const [T, X] = r.pick([[3, 2], [4, -1], [2, 3]]);
        const ans = tp(b, T, X);
        return {
          prompt: t`A frame moves at $\beta = ${bs}$. Event E is at $t = ${T}$ years, $x = ${X}$ light-years in your frame. The violet line through E is parallel to the moving frame’s $x'$ axis. What is E’s time $t'$ in the moving frame?`,
          visual: reading({ b, ev: [T, X] }),
          answer: ans, units: 'yr', tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: T - b * X, feedback: t`You dropped $\gamma$: the ticks on the $t'$ axis are $\gamma$ apart on paper, so $t' = \gamma(t - \beta x)$.` }, { value: gam(b) * (T + b * X), feedback: t`The $x'$ axis tilts **up** to the right: events to the right are earlier for the moving observer, so subtract $\beta x$.` }],
          hints: [t`Follow the violet line to the gold $t'$ axis and count ticks, or compute $t' = \gamma(t - \beta x)$.`, t`$\gamma = ${fmt(gam(b), 4)}$; $t - \beta x = ${fmt(T - b * X, 4)}$.`],
          teach: 'An event’s t′ is read by sliding along a line parallel to the x′ axis to the t′ axis.',
          explain: t`$t' = ${fmt(gam(b), 4)}\times${fmt(T - b * X, 4)} = ${fmt(ans, 4)}$ years (and $x' = ${fmt(xp(b, T, X), 4)}$ ly).`,
        };
      },
    }),
    mcq({
      id: 'other-side', difficulty: 2,
      prompt: 'Redraw the same physics as the moving observer draws it, with their axes perpendicular on the page. How do your axes appear in their drawing?',
      visual: st({ x: [-4, 4], t: [-1.5, 4.8], numbers: false, cones: [[0, 0, 'both']], boosted: { beta: 0.5, names: ['their t′ axis', 'their x′ axis'] },
        caption: 'Your own diagram (c = 1): the moving observer’s gold axes tilt toward the light line. Now imagine the picture they would draw.' }),
      choices: ['Tilted toward the light line by the same amount, but the other way: you move at −β for them', 'Perpendicular, like theirs: only their axes are tilted', 'Tilted the same way as theirs appear on your diagram', 'Tilted away from the light line'],
      answer: 0,
      why: {
        1: 'Neither frame is special: each draws its own axes perpendicular and the other’s tilted.',
        2: 'For them you move in the opposite direction, at −β, so your worldline leans the other way.',
        3: 'Every observer’s axes close toward the light line like scissors; tilting away would make light slower than 1 for them.',
      },
      hints: ['Who moves, from the moving observer’s point of view, and in which direction?'],
      teach: 'Diagrams are symmetric: each observer draws the other’s axes tilted toward the light line, with the opposite velocity.',
      explain: 'For the moving observer you move at −β, so on their diagram your time axis is the line x′ = −βt′ and your x axis is t′ = −βx′: the mirror image of this picture. Neither picture is the true one; both describe the same events.',
    }),
    num({
      id: 'symmetric-frame', difficulty: 3,
      gen(r) {
        const [v, vs, ans] = r.pick([[0.8, '0.8', 0.5], [0.6, '0.6', 1 / 3], [12 / 13, t`\tfrac{12}{13}`, 2 / 3], [0.96, '0.96', 0.75]]);
        return {
          prompt: t`Two ships pass with relative speed $${vs}c$. Some third observer sees them move apart with equal and opposite velocities — the frame in which a two-observer diagram is symmetric. How fast does each ship move in that frame?`,
          visual: st({ x: [-4, 4], t: [-0.3, 4.8], numbers: false, cones: [[0, 0, 'future']],
            lines: [{ pts: [[0, 0], [-ans * 4.6, 4.6]], color: 'accent', label: 'ship 1', at: 0, dx: -8, align: 'right' }, { pts: [[0, 0], [ans * 4.6, 4.6]], color: 'gold', label: 'ship 2', at: 0, dx: 8 }],
            caption: 'The symmetric frame (c = 1): the two ships’ worldlines lean equally either way.' }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: v / 2, feedback: 'Halving the speed treats velocities as additive. Halve the rapidity instead.' }],
          hints: [t`Rapidities add: each ship has half the relative rapidity, $\varphi = \tfrac12\operatorname{artanh}(${vs})$.`, t`Speed $= \tanh\varphi$; for $\operatorname{artanh}\beta = \tfrac12\ln\frac{1 + \beta}{1 - \beta}$ this is $\tanh\left(\tfrac14\ln\frac{1 + v}{1 - v}\right)$.`],
          teach: 'The symmetric (Loedel) frame splits the relative rapidity in half; speeds combine back by velocity addition.',
          explain: t`$\varphi = \tfrac12\operatorname{artanh}(${vs}) = ${fmt(Math.atanh(v) / 2, 4)}$, so each moves at $\tanh\varphi = ${nice(ans, 4)}c$. Check: $\dfrac{2\times${nice(ans, 4)}}{1 + ${nice(ans, 4)}^2} = ${nice(2 * ans / (1 + ans * ans), 4)}$ ✓ — not ${nice(v / 2, 3)}c.`,
        };
      },
    }),
    mcq({
      id: 'orthogonal', difficulty: 3,
      prompt: t`On your diagram the moving observer’s axes, along $(x, t) = (\beta, 1)$ and $(1, \beta)$, make an acute angle. Measured with the spacetime metric $-\Delta t_1\Delta t_2 + \Delta x_1\Delta x_2$, what is the “dot product” of these two directions?`,
      visual: reading({ b: 0.5, ev: [2.6, -1.8], build: false, R: 4, numbers: false, caption: 'Your frame (c = 1) with a moving frame’s gold axes. They look like an acute angle on paper.' }),
      choices: ['Zero: they are perpendicular in spacetime’s geometry', t`$2\beta$: positive, as the acute angle suggests`, t`$1 + \beta^2$`, t`$-1$, like a timelike vector`],
      answer: 0,
      why: {
        1: t`That is the Euclidean dot product, $\beta + \beta$. Spacetime’s metric puts a minus sign on the time parts.`,
        2: t`That adds the squared lengths; the product of two different directions is $-(1)(\beta) + (\beta)(1)$.`,
        3: t`$-1$ is the squared length of the unit time direction, not the product of the two axes.`,
      },
      hints: [t`The time components are $1$ and $\beta$; the space components are $\beta$ and $1$.`, t`$-(1)(\beta) + (\beta)(1) = ?$`],
      teach: 'A moving frame’s axes are orthogonal in Minkowski geometry; paper angles do not show spacetime angles.',
      explain: t`$-1\cdot\beta + \beta\cdot1 = 0$. Each observer’s space axis is perpendicular to its time axis in spacetime’s own geometry — the paper just cannot show it, as a flat map cannot show the Earth’s right angles truthfully.`,
    }),
    mcq({
      id: 'order', difficulty: 2,
      prompt: t`In your frame event P is at $(t, x) = (1, 0)$ and Q at $(1.6, 3)$: P first. For an observer moving at $0.6c$ along $+x$, which happens first?`,
      visual: st({ x: [-1.5, 4.5], t: [-0.5, 3.5], numbers: true, boosted: { beta: 0.6 }, simul: [{ at: [0, 1], beta: 0.6, color: 'violet' }],
        events: [[0, 1, 'P', 'accent2', -12, 6], [3, 1.6, 'Q', 'accent2', 9, -6]], caption: t`Your frame ($c = 1$). Gold: the moving observer’s axes; violet dashed: their line of simultaneity through P.` }),
      choices: ['Q happens first', 'P happens first', 'They are simultaneous', 'It cannot be decided, since the pair is spacelike'],
      answer: 0,
      why: {
        1: 'Read the violet line: Q lies below the moving observer’s “now” through P, so it is earlier for them.',
        2: 'The violet line through P passes above Q, not through it.',
        3: 'Spacelike pairs have no frame-independent order, but each frame decides it; this one says Q first.',
      },
      hints: ['Events on the violet line are simultaneous with P for the moving observer.', 'Is Q above or below that line?'],
      teach: 'Lines of simultaneity, parallel to the x′ axis, order events for the moving observer.',
      explain: t`$t'_P = 1.25\times1 = 1.25$ and $t'_Q = 1.25(1.6 - 0.6\times3) = -0.25$: Q first. The pair is spacelike ($-0.36 + 9 > 0$), which is why frames can disagree.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-read-x', difficulty: 2,
      gen(r) {
        const [b, bs] = r.pick([[0.6, '0.6'], [8 / 17, t`\tfrac{8}{17}`], [0.28, '0.28']]);
        const [T, X] = r.pick([[2, 3], [1, -2], [3, 4]]);
        const ans = xp(b, T, X);
        return {
          prompt: t`A frame moves at $\beta = ${bs}$. What position $x'$ does it give the event at $t = ${T}$ years, $x = ${X}$ light-years? (The teal line through E is parallel to its $t'$ axis.)`,
          visual: reading({ b, ev: [T, X] }),
          answer: ans, units: 'ly', tol: { rel: 0.005, abs: 0.005 },
          hints: [t`$x' = \gamma(x - \beta t)$.`],
          teach: 'An event’s x′ is read along a line parallel to the t′ axis.',
          explain: t`$x' = ${fmt(gam(b), 4)}(${X} - ${fmt(b, 4)}\times${T}) = ${fmt(ans, 4)}$ light-years.`,
        };
      },
    }),
    num({
      id: 'cp-probes', difficulty: 3, transfer: true,
      gen(r) {
        const [v, vs, ans] = r.pick([[0.96, '0.96', 0.75], [40 / 41, t`\tfrac{40}{41}`, 0.8], [0.28, '0.28', 1 / 7]]);
        return {
          prompt: t`Two interstellar probes, launched in opposite directions, measure their relative speed as $${vs}c$. Mission control sees them recede at equal speeds. What is each probe’s speed relative to mission control?`,
          visual: st({ x: [-4, 4], t: [-0.3, 4.8], numbers: false, cones: [[0, 0, 'future']], lines: [{ pts: [[0, 0], [0, 4.6]], color: 'ink2', label: 'mission control', at: 0, dx: 8, dy: -40 }, { pts: [[0, 0], [-ans * 4.6, 4.6]], color: 'accent' }, { pts: [[0, 0], [ans * 4.6, 4.6]], color: 'gold' }], caption: 'Mission control’s frame (c = 1): the probes lean equally either way.' }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: v / 2, feedback: 'Halve the rapidity, not the speed.' }],
          hints: [t`Each probe carries half the relative rapidity.`, t`$\beta = \tanh\left(\tfrac12\operatorname{artanh}${vs}\right)$.`],
          teach: 'In the symmetric frame each of two observers has half their relative rapidity.',
          explain: t`$\tanh\left(\tfrac12\operatorname{artanh}${vs}\right) = ${nice(ans, 4)}$, so each recedes at $${nice(ans, 4)}c$.`,
        };
      },
    }),
    mcq({
      id: 'cp-tick', difficulty: 2,
      prompt: 'On your diagram, the moving observer’s one-year tick on their time axis lies farther from the origin (on paper) than your one-year tick. Why?',
      visual: reading({ b: 0.6, ev: [1, 0], build: false, R: 3, name: 'your 1-year tick', caption: 'Your frame (c = 1) and a frame moving at 0.6c with its ticks on the hyperbolae.' }),
      choices: ['Both ticks lie on the same hyperbola t² − x² = 1, which bends away from the origin', 'The moving clock is broken by its speed', 'The moving observer uses longer years', 'Paper distance on a spacetime diagram equals proper time'],
      answer: 0,
      why: {
        1: 'Clocks are not damaged; each runs normally in its own frame.',
        2: 'Both use the same year; the hyperbola, not the unit, fixes where it lies.',
        3: 'Paper distance is Euclidean; proper time comes from the interval, which is why the hyperbola is needed.',
      },
      hints: ['Which curve holds every event one year of proper time from the origin?'],
      teach: 'Calibration hyperbolae, not paper distance, mark equal proper times on a Minkowski diagram.',
      explain: t`Every clock leaving the origin reads 1 year where its worldline crosses $t^2 - x^2 = 1$. For a tilted worldline that crossing is farther from the origin on paper, at $t = \gamma$.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.2 (spacetime diagrams of two frames)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 3 and 5', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Loedel diagrams: symmetric two-observer Minkowski diagrams (overview)', url: 'https://en.wikipedia.org/wiki/Minkowski_diagram#Loedel_diagram' },
  ],
});
