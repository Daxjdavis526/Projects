// Hausdorff, compact and connected: the three properties of a space that the
// definition of a manifold leans on. The line with two origins (locally a
// line, but two points that cannot be separated); compactness as "no sequence
// can escape" (Heine–Borel in ℝⁿ); connectedness and counting pieces after
// removing points (circle ≇ line); light cones fall apart into pieces.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const SEL = (k) => `step(0.5 - abs(s - ${k}))`;

// the line with two origins: the line with a gap at 0 and two origin dots above and below it
function twoOrigins({ a = null, b = null, seq = 0, caption, when } = {}) {
  const W = when ? { when } : {};
  const curves = [
    { fn: '0', domain: [-3.4, -0.06], color: 'accent', width: 2.4, ...W },
    { fn: '0', domain: [0.06, 3.4], color: 'accent', width: 2.4, ...W },
  ];
  const seg = (y0, e, color) => [
    { param: [`${e}*t`, String(y0)], t: [-1, 1], color, width: 4, ...W },
    { param: [`${e}*(1 - 0.02*t)`, `${y0}*t`], t: [0, 1], color, width: 1.2, dash: [3, 3], ...W },
    { param: [`-${e}*(1 - 0.02*t)`, `${y0}*t`], t: [0, 1], color, width: 1.2, dash: [3, 3], ...W },
  ];
  if (a !== null) curves.push(...seg(0.5, a, 'gold'));
  if (b !== null) curves.push(...seg(-0.5, b, 'violet'));
  const points = [
    { x: 0, y: 0.5, color: 'gold', label: '0₁', labelDx: -8, labelDy: -16, ...W },
    { x: 0, y: -0.5, color: 'violet', label: '0₂', labelDx: -8, labelDy: 20, ...W },
    { x: 0, y: 0, r: 3.5, hollow: true, color: 'accent', ...W },
  ];
  for (let n = 1; n <= seq; n++) points.push({ x: r6(3 / n), y: 0, r: 3, color: 'teal', ...W });
  return { curves, points, caption };
}

export default lesson({
  id: 'st-c.C7.2',
  title: 'Hausdorff, compact and connected',
  minutes: 13, difficulty: 3,
  equation: t`p \ne q \;\Longrightarrow\; \text{there are open } U \ni p,\ V \ni q \text{ with } U \cap V = \varnothing`,
  intro: t`Being “locally like $\mathbb R^n$” is not quite enough to make a sensible space. Three more properties do the work.

- **Hausdorff** (the equation above): any two different points can be fenced off in disjoint open sets. Then a sequence has at most one limit — a particle cannot be in two places at the end of its path.
- **Compact**: no sequence can escape. Every sequence has a subsequence converging to a point *of the set*. In $\mathbb R^n$ that is the same as **closed and bounded** (Heine–Borel): $[0, 1]$ is compact, $(0, 1]$ is not ($1/n$ escapes to the missing 0), $[0, \infty)$ is not ($n$ escapes to infinity).
- **Connected**: the space does not fall apart into two disjoint non-empty open pieces. For the spaces here it is the same as being able to walk from any point to any other.

The classic monster is the **line with two origins**: a line whose origin has been doubled into $0_1$ and $0_2$. Near every point it looks like a line, yet $0_1$ and $0_2$ cannot be separated.`,
  symbols: [
    { tex: 'p,\\ q', text: 'two different points of the space' },
    { tex: 'U \\ni p', text: 'an open set containing p (∋ reads “contains”)' },
    { tex: 'V \\ni q', text: 'an open set containing q' },
    { tex: t`U \cap V = \varnothing`, text: 'the two open sets share no point: p and q are fenced off from each other' },
  ],
  why: t`The definition of a manifold (C8.2) demands Hausdorff explicitly, to rule out the line with two origins. Compactness is what guarantees maxima, finite integrals and finite atlases — and what forbids one chart covering a sphere (C8.1). Connectedness counts the pieces of a light cone, which is where “future” and “past” come from (C11).`,
  visual: {
    type: 'graph',
    title: 'Fences, escapes and pieces',
    lead: t`Four scenes. In the first, the gold bar is an open neighbourhood of $0_1$ (the interval with $0$ replaced by $0_1$) and the violet bar one of $0_2$; teal dots are the sequence $3/n$. In the others, teal dots are a sequence in the set and the number of terms is yours.`,
    tasks: [
      t`Two origins: shrink both neighbourhoods as far as you like. They always share the points just left and right of 0 — the readout never reaches 0. The sequence $3/n$ converges to $0_1$ *and* to $0_2$.`,
      t`$(0, 3]$: add terms of $3/n$. They crowd toward 0, which is not in the set — the sequence escapes, so the set is not compact. In $[-3, 3]$ the sequence $\pm 3(1 - 1/n)$ has nowhere to escape to: its subsequences converge to $\pm 3$, which belong to the set.`,
      t`Pieces: remove one point from a circle and from a line. The circle stays one piece (an arc); the line falls into two. So no continuous bijection with continuous inverse can turn one into the other.`,
    ],
    params: {
      x: [-3.6, 3.6], y: [-1.5, 1.5], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0,
      choices: [{ key: 's', label: 'Scene', options: [[1, 'two origins'], [2, t`$(0, 3]$`], [3, t`$[-3, 3]$`], [4, 'remove a point']], value: 1, explain: 'One non-Hausdorff space, one set a sequence escapes from, one it cannot, and a test for connectedness.' }],
      sliders: [
        { key: 'a', label: t`$0_1$’s neighbourhood $\varepsilon_1$`, min: 0.05, max: 2, step: 0.05, value: 1.2, explain: t`The gold neighbourhood of $0_1$ is $(-\varepsilon_1, 0) \cup \{0_1\} \cup (0, \varepsilon_1)$ (two-origins scene).` },
        { key: 'b', label: t`$0_2$’s neighbourhood $\varepsilon_2$`, min: 0.05, max: 2, step: 0.05, value: 0.7, explain: t`The violet neighbourhood of $0_2$, built the same way (two-origins scene).` },
        { key: 'N', label: 'terms of the sequence', min: 1, max: 40, step: 1, value: 6, explain: 'How many terms are drawn (escape scenes).' },
      ],
      curves: [
        ...twoOrigins({ when: SEL(1) }).curves.slice(0, 2),
        { param: ['a*t', '0.5'], t: [-1, 1], color: 'gold', width: 4, when: SEL(1) },
        { param: ['b*t', '-0.5'], t: [-1, 1], color: 'violet', width: 4, when: SEL(1) },
        { param: ['min(a, b)*t', '0'], t: [-1, 1], color: 'good', width: 6, when: SEL(1) },
        { fn: '0', domain: [0, 3], color: 'accent', width: 3, when: SEL(2) },
        { fn: '0', domain: [-3, 3], color: 'accent', width: 3, when: SEL(3) },
        { param: ['-1.9 + 1.2*cos(t)', '1.2*sin(t)'], t: [0.12, r6(2 * Math.PI - 0.12)], color: 'accent', width: 3, when: SEL(4) },
        { fn: '0', domain: [0.4, 1.95], color: 'accent', width: 3, when: SEL(4) },
        { fn: '0', domain: [2.25, 3.5], color: 'gold', width: 3, when: SEL(4) },
      ],
      points: [
        ...twoOrigins({ when: SEL(1) }).points,
        ...Array.from({ length: 40 }, (_, k) => ({ x: r6(3 / (k + 1)), y: 0, r: 3, color: 'teal', when: `${SEL(1)} + (${SEL(2)})*step(N - ${k + 0.5})` })),
        ...Array.from({ length: 40 }, (_, k) => ({ x: r6(3 * (k % 2 ? 1 : -1) * (1 - 1 / (k + 1))), y: 0, r: 3, color: 'teal', when: `(${SEL(3)})*step(N - ${k + 0.5})` })),
        { x: 0, y: 0, r: 4, hollow: true, color: 'bad', when: SEL(2) },
        { x: 3, y: 0, r: 4, color: 'accent', when: SEL(2) },
        { x: -3, y: 0, r: 4, color: 'accent', when: SEL(3) },
        { x: 3, y: 0, r: 4, color: 'accent', when: SEL(3) },
        { x: -0.7, y: 0, r: 4, hollow: true, color: 'bad', when: SEL(4) },
        { x: 2.1, y: 0, r: 4, hollow: true, color: 'bad', when: SEL(4) },
        { x: -1.9, y: -1.42, r: 0, label: 'circle: 1 piece', labelAlign: 'center', labelDx: 0, labelDy: 0, when: SEL(4) },
        { x: 1.95, y: -0.45, r: 0, label: 'line: 2 pieces', labelAlign: 'center', labelDx: 0, labelDy: 0, when: SEL(4) },
      ],
      readouts: [
        { label: 'length of the shared part (green)', expr: '2*min(a, b)', digits: 3, when: SEL(1) },
        { label: 'last term drawn', expr: '3/N', digits: 3, when: SEL(2) },
        { label: 'last term drawn', expr: '3*(1 - 1/N)*(-1)^N', digits: 3, when: SEL(3) },
      ],
    },
    caption: t`In the two-origins scene the line is drawn with a gap at 0 and its two origins above and below it; that is only a way to draw it — in the space, both origins sit exactly where 0 would be. Dots are to scale along the line.`,
  },
  example: {
    prompt: t`Is the punctured disc $D^* = \{0 < x^2 + y^2 \le 1\}$ compact? Is the closed annulus $A = \{\tfrac14 \le x^2 + y^2 \le 1\}$? Are they connected? For any set that is not compact, give a sequence that escapes.`,
    visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1.2, 1.2], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 5, shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'accent', alpha: 0.18 }], curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'accent', width: 2.6 }], points: [{ x: 0, y: 0, r: 4.5, hollow: true, color: 'bad' }, ...[1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({ x: r6(0.9 / n), y: 0, r: 2.8, color: 'teal' }))] }, caption: t`The punctured disc (rim included, centre removed) and the sequence $(0.9/n, 0)$ crowding toward the missing centre.` },
    steps: [
      { label: 'Bounded?', text: t`Both sets lie inside the disc of radius 1, so both are bounded. Compactness hinges on closedness.` },
      { label: 'An escape', text: t`In $D^*$ take $p_n = (1/n, 0)$, $n \ge 2$. Every term is in $D^*$, and $p_n \to (0, 0)$, which is not. Every subsequence has the same limit, so no subsequence converges *in* $D^*$: it is **not compact**.` },
      { label: 'No escape', text: t`$A$ is the preimage of the closed interval $[\tfrac14, 1]$ under the continuous $x^2 + y^2$, so it is closed; closed and bounded in $\mathbb R^2$ means **compact** (Heine–Borel). A sequence in $A$ can only converge to points with $\tfrac14 \le r^2 \le 1$.` },
      { label: 'Connected?', text: t`Any two points of either set can be joined by walking round an arc of a circle and then along a radius, staying inside. Both are **connected**.` },
      { label: 'Sense check', text: t`Removing a single point (the centre) destroyed compactness but not connectedness. Removing the whole circle $x^2 + y^2 = \tfrac12$ from $A$ would do the opposite: two pieces, neither compact.` },
    ],
    answer: t`$D^*$ is not compact — $(1/n, 0)$ escapes to the missing centre; $A$ is compact (closed and bounded). Both are connected.`,
  },
  practice: [
    mcq({
      id: 'two-origins-axiom', difficulty: 2,
      prompt: t`Every point of the line with two origins has an open neighbourhood that looks exactly like an open interval. Which property fails?`,
      visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-1, 1], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, ...twoOrigins({ a: 1.4, b: 0.6, seq: 8 }) }, caption: t`Neighbourhoods of $0_1$ (gold) and $0_2$ (violet), and the sequence $3/n$ (teal). The gap at 0 is a drawing device.` },
      choices: ['Hausdorff: 0₁ and 0₂ have no disjoint neighbourhoods', 'Locally Euclidean: no neighbourhood of 0₁ looks like an interval', 'Compactness: the line is unbounded', 'Connectedness: the two origins make two pieces'],
      answer: 0,
      why: {
        1: t`The gold set $(-\varepsilon, 0) \cup \{0_1\} \cup (0, \varepsilon)$ is an open interval with its midpoint renamed — perfectly Euclidean.`,
        2: t`True but beside the point: $\mathbb R$ is not compact either, and it is a fine manifold. Manifolds need not be compact.`,
        3: 'It is one piece: you can walk from 0₁ to 0₂ through the positive numbers.',
      },
      hints: [t`Try to choose neighbourhoods of $0_1$ and $0_2$ that share no point.`, t`Every neighbourhood of $0_1$ contains $(0, \varepsilon_1)$; every one of $0_2$ contains $(0, \varepsilon_2)$.`],
      teach: 'The line with two origins is locally a line everywhere but not Hausdorff, which is why the definition of a manifold demands Hausdorff separately.',
      explain: t`Both neighbourhoods contain $(0, \min(\varepsilon_1, \varepsilon_2))$, so they always meet. One consequence: $3/n$ converges to $0_1$ and to $0_2$ — limits are not unique. A spacetime like that would let a particle’s history end at two different events.`,
    }),
    num({
      id: 'shared-part', difficulty: 2,
      gen(r) {
        const a = r.pick([0.4, 0.8, 1.2, 1.6]), b = r.pick([0.3, 0.5, 1, 1.4]);
        const L = 2 * Math.min(a, b);
        return {
          prompt: t`On the line with two origins, $U = (-${a}, 0) \cup \{0_1\} \cup (0, ${a})$ is an open neighbourhood of $0_1$ and $V = (-${b}, 0) \cup \{0_2\} \cup (0, ${b})$ one of $0_2$. What is the total length of $U \cap V$?`,
          visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-1, 1], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, ...twoOrigins({ a, b }) }, caption: t`$U$ (gold) and $V$ (violet), drawn above and below the line.` },
          answer: L, tol: { rel: 0.001 },
          errors: [{ value: 0, feedback: t`They do share points: every number strictly between 0 and $${nice(Math.min(a, b))}$ (and its negative) is in both. Only the origins differ.` }, { value: Math.min(a, b), feedback: 'Count both sides of the origin.' }, { value: a + b, feedback: 'The shared part is limited by the smaller neighbourhood.' }].filter((e) => Math.abs(e.value - L) > 0.01),
          hints: ['Which points are in both? The origins are not (each set has its own), but ordinary numbers near 0 are.', t`$U \cap V = (-m, 0) \cup (0, m)$ with $m$ the smaller radius.`],
          teach: 'In the line with two origins, neighbourhoods of the two origins always overlap in a punctured interval.',
          explain: t`$U \cap V = (-${nice(Math.min(a, b))}, 0) \cup (0, ${nice(Math.min(a, b))})$, of total length $${nice(L)}$. However small you make the radii, this stays positive: the origins cannot be separated.`,
        };
      },
    }),
    multi({
      id: 'compact-sets', difficulty: 2,
      prompt: 'Select every subset of the plane that is compact.',
      visual: { type: 'graph', params: { x: [-0.5, 6.5], y: [-1, 1], aspect: 'wide', grid: false, xticks: 7, yticks: 0, ylabel: '', curves: [{ fn: '0', color: 'accent', width: 3 }], points: [1, 2, 3, 4, 5, 6].map((n) => ({ x: n, y: 0, r: 3.2, color: 'teal' })) }, caption: t`One of the tests: the sequence $(n, 0)$ marches along the $x$-axis and has no convergent subsequence.` },
      choices: [t`the unit circle $x^2 + y^2 = 1$`, t`the closed square $[0, 1] \times [0, 1]$`, 'a set of five points', t`the open disc $x^2 + y^2 < 1$`, t`the closed half-plane $y \ge 0$`, t`the $x$-axis`],
      answer: [0, 1, 2],
      why: {
        3: t`Bounded but not closed: $(1 - 1/n, 0)$ escapes to the rim, which is missing.`,
        4: t`Closed but unbounded: $(n, 0)$ escapes to infinity.`,
        5: t`Closed but unbounded: $(n, 0)$ escapes.`,
      },
      hints: ['In the plane, compact means closed and bounded (Heine–Borel). Check both for each set.', 'Escape routes: toward a missing edge, or off to infinity.'],
      teach: 'In ℝⁿ a set is compact exactly when it is closed and bounded; a missing edge or an infinite extent lets a sequence escape.',
      explain: t`The circle and closed square are closed and bounded; any finite set is compact (a sequence in it repeats some point infinitely often — a constant subsequence). The open disc fails closedness, the half-plane and axis fail boundedness.`,
    }),
    num({
      id: 'pieces', difficulty: 2,
      gen(r) {
        const k = r.int(2, 5), circle = r.bool(0.5);
        const ans = circle ? k : k + 1;
        const holes = Array.from({ length: k }, (_, i) => (circle ? r6(0.4 + (i * 2 * Math.PI) / k) : r6(-2.8 + (5.6 * (i + 1)) / (k + 1))));
        return {
          prompt: circle ? t`Remove $${k}$ distinct points from a circle. Into how many connected pieces does it fall?` : t`Remove $${k}$ distinct points from a line. Into how many connected pieces does it fall?`,
          visual: circle
            ? { type: 'graph', params: { x: [-1.8, 1.8], y: [-1.25, 1.25], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'accent', width: 2.6 }], points: holes.map((h) => ({ x: r6(Math.cos(h)), y: r6(Math.sin(h)), r: 4.5, hollow: true, color: 'bad' })) }, caption: 'The circle with the removed points (open red dots).' }
            : { type: 'graph', params: { x: [-3.4, 3.4], y: [-0.6, 0.6], aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ fn: '0', color: 'accent', width: 2.6 }], points: holes.map((h) => ({ x: h, y: 0, r: 4.5, hollow: true, color: 'bad' })) }, caption: 'A stretch of the line with the removed points (open red dots); it goes on forever both ways.' },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: circle ? k + 1 : k, feedback: circle ? 'The circle closes up: the first removal leaves one arc, not two pieces. Each later removal adds one.' : 'The line has two ends that never meet: the first removal already leaves two pieces.' }],
          hints: ['Remove the points one at a time and count the pieces after each.', circle ? 'After the first removal the circle is a single open arc — it behaves like a line from then on.' : 'Each removed point cuts one piece into two.'],
          teach: 'Counting pieces after removing points is a topological invariant: it tells a circle from a line without measuring anything.',
          explain: circle ? t`The first point leaves one arc; each of the other $${k - 1}$ cuts an arc in two: $1 + ${k - 1} = ${k}$ pieces. A line would give $${k + 1}$ — so a circle and a line are not homeomorphic.` : t`Each removed point cuts one piece in two: $1 + ${k} = ${k + 1}$ pieces. A circle would give $${k}$ — so a line and a circle are not homeomorphic.`,
        };
      },
    }),
    mcq({
      id: 'extreme-value', difficulty: 2,
      prompt: t`$f(x) = 1/x$ is continuous on $(0, 1]$ but has no maximum there, while on $[0.1, 1]$ it has one, $f(0.1) = 10$. What makes the difference?`,
      visual: { type: 'graph', params: { x: [-0.1, 1.2], y: [-1, 22], aspect: 'wide', xticks: 6, yticks: 5, curves: [{ fn: '1/x', domain: [0.045, 1], color: 'accent', width: 2.4 }], vlines: [{ x: 0.1, color: 'gold', label: 'x = 0.1' }], points: [{ x: 0.1, y: 10, color: 'gold' }, { x: 1, y: 1, color: 'accent' }] }, caption: t`The graph of $1/x$, climbing without bound as $x \to 0^+$.` },
      choices: [
        t`$[0.1, 1]$ is compact and $(0, 1]$ is not: a continuous function on a compact set attains its maximum`,
        t`$1/x$ is not continuous on $(0, 1]$`,
        t`$(0, 1]$ is not connected`,
        t`$(0, 1]$ is longer than $[0.1, 1]$`,
      ],
      answer: 0,
      why: {
        1: t`It is continuous at every point of $(0, 1]$; the trouble is at 0, which is not in the domain.`,
        2: t`$(0, 1]$ is an interval, so it is connected.`,
        3: t`Length is not the issue: $1/x$ on $[1, 100]$ has a maximum. What matters is that $(0, 1]$ lets a sequence escape to the missing 0.`,
      },
      hints: [t`Follow the sequence $x_n = 1/n$ in $(0, 1]$. Where does it go, and what does $f$ do along it?`],
      teach: 'A continuous function on a compact set attains its maximum and minimum; on a non-compact set it may run off to infinity.',
      explain: t`On $(0, 1]$ the points $1/n$ escape to 0 and $f(1/n) = n$ grows without bound. On the compact $[0.1, 1]$ no escape is possible, so the extreme value theorem applies. Compactness is the topological reason maxima exist.`,
    }),
    mcq({
      id: 'timelike-pieces', difficulty: 3,
      prompt: t`In two-dimensional Minkowski spacetime (with $c = 1$), how many connected pieces does the set of **timelike** displacements from an event, $\{(t, x) : t^2 > x^2\}$, have?`,
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.6, 1.6], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 5, xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'gold', width: 2 }, { fn: '-x', color: 'gold', width: 2 }], points: [{ x: 0, y: 0, color: 'ink' }] }, caption: t`The light cone $t = \pm x$ of an event. Timelike displacements lie between the lines, steeper than $45^\circ$.` },
      choices: ['Two: the future and the past', 'One: the region inside the light cone', 'Four: one between each pair of lines', 'Three: future, past and the event itself'],
      answer: 0,
      why: {
        1: t`To walk from the future part ($t > |x|$) to the past part ($t < -|x|$) you must cross $t = 0$, where $t^2 > x^2$ fails. The two parts do not touch, even at the event (it is not in the set: $0 > 0$ is false).`,
        2: t`Four regions are cut out by the two lines, but the left and right ones ($x^2 > t^2$) are **spacelike** displacements.`,
        3: t`The event $(0, 0)$ has $t^2 = x^2 = 0$, so it is not timelike and not in the set.`,
      },
      hints: [t`Sketch $t^2 > x^2$: it says $|t| > |x|$.`, t`Can a path stay inside $|t| > |x|$ while $t$ changes sign?`],
      teach: 'The timelike vectors at an event fall into two connected pieces — the future and the past cones.',
      explain: t`Two pieces: $t > |x|$ and $t < -|x|$. Choosing one of them consistently at every event is a **time orientation**; connectedness is what makes “future” a well-defined half. (Spacelike displacements, $x^2 > t^2$, also form two pieces in 1+1 dimensions but only one in 3+1, where you can walk round.)`,
    }),
    order({
      id: 'unique-limits', difficulty: 3,
      prompt: t`Prove that in a Hausdorff space a sequence $x_n$ cannot converge to two different points $p$ and $q$. Order the steps.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['-1.2 + 0.9*cos(t)', '0.9*sin(t)'], t: [0, TAU], color: 'gold', dash: [6, 5] }, { param: ['1.2 + 0.9*cos(t)', '0.9*sin(t)'], t: [0, TAU], color: 'violet', dash: [6, 5] }], points: [{ x: -1.2, y: 0, color: 'gold', label: 'p' }, { x: 1.2, y: 0, color: 'violet', label: 'q' }, ...[0, 1, 2, 3, 4, 5].map((n) => ({ x: r6(-1.2 + 1.8 * Math.pow(0.55, n)), y: r6(0.9 * Math.pow(0.55, n) * (n % 2 ? -1 : 1)), r: 2.8, color: 'teal' }))] }, caption: 'Disjoint open sets about p and q, and a sequence heading into the one about p.' },
      items: [
        t`Suppose $x_n \to p$ and $x_n \to q$ with $p \ne q$.`,
        t`By Hausdorff, choose open $U \ni p$ and $V \ni q$ with $U \cap V = \varnothing$.`,
        t`Since $x_n \to p$, all terms from some $N_1$ on lie in $U$; since $x_n \to q$, all from some $N_2$ on lie in $V$.`,
        t`The term $x_n$ with $n = \max(N_1, N_2)$ lies in $U \cap V$, which is empty — a contradiction.`,
        t`So $p = q$: limits in a Hausdorff space are unique.`,
      ],
      hints: ['Argue by contradiction: assume two limits.', '“Converges to p” means: every open set about p eventually contains all the terms.'],
      teach: 'Hausdorff separation is exactly what makes limits unique.',
      explain: t`In the line with two origins the second step is impossible, and indeed $3/n$ converges to both origins. Physics relies on unique limits constantly — the end point of a worldline, the value of a field at a point.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-apoapsis', difficulty: 2, transfer: true,
      gen(r) {
        const [name, a, e] = r.pick([['a GPS satellite', 26560, 0.01], ['a geostationary transfer orbit', 24400, 0.72], ['a Molniya communications satellite', 26600, 0.74], ['an Earth-observation satellite', 7080, 0.0012]]);
        const R = 6371, hA = a * (1 + e) - R;
        return {
          prompt: t`An elliptical orbit is a closed curve — a compact set — and altitude is a continuous function on it, so altitude must reach a maximum somewhere: the apoapsis. For ${name} with semi-major axis $a = ${a}$ km and eccentricity $e = ${e}$, what is that maximum altitude above a spherical Earth of radius $6371$ km?`,
          visual: { type: 'graph', params: { x: [-2.4, 1.6], y: [-1.05, 1.05], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: [`cos(t) - ${r6(Math.min(e, 0.75))}`, `${r6(Math.sqrt(1 - Math.min(e, 0.75) ** 2))}*sin(t)`], t: [0, TAU], color: 'gold', width: 2.2 }, { param: [`${r6(R / a)}*cos(t)`, `${r6(R / a)}*sin(t)`], t: [0, TAU], color: 'accent', width: 2 }], points: [{ x: 0, y: 0, r: 2.5, color: 'ink2' }] }, caption: 'The orbit (gold) and the Earth (blue), to scale in units of the semi-major axis; the Earth sits at a focus.' },
          answer: hA, units: 'km', tol: { rel: 0.002 },
          errors: [{ value: a * (1 + e), feedback: 'That is the distance from the Earth’s centre. Subtract the Earth’s radius to get the altitude.' }, { value: a * (1 - e) - R, feedback: 'That is the minimum altitude, at periapsis. The maximum is at the far end of the ellipse.' }].filter((x) => Math.abs(x.value - hA) > 0.005 * hA),
          hints: ['Distance from the focus ranges from a(1 − e) to a(1 + e).', 'Altitude = distance from the centre − Earth’s radius.'],
          teach: 'A continuous function on a compact set attains its maximum: an orbit always has an apoapsis.',
          explain: t`$r_{\max} = a(1 + e) = ${nice(a * (1 + e), 5)}$ km, so the altitude is $${nice(hA, 5)}$ km. Compactness promised the maximum exists; geometry located it. A hyperbolic flyby trajectory is not compact, and indeed its altitude has no maximum.`,
        };
      },
    }),
    mcq({
      id: 'cp-circle-line', difficulty: 2,
      prompt: t`Which argument shows that a circle is **not** homeomorphic to a line?`,
      visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-1.25, 1.25], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['-1.9 + 1.1*cos(t)', '1.1*sin(t)'], t: [0, TAU], color: 'accent', width: 2.6 }, { fn: '0', domain: [0.3, 3.4], color: 'accent', width: 2.6 }] }, caption: 'A circle and (a stretch of) a line.' },
      choices: [
        'Removing any one point leaves the circle in one piece but the line in two; a homeomorphism would preserve that count',
        'The circle has finite length and the line infinite length',
        'The circle is curved and the line is straight',
        'The circle needs two charts and the line one, so they have different dimensions',
      ],
      answer: 0,
      why: {
        1: t`Length is not topological: the open interval $(-1, 1)$, of length 2, is homeomorphic to the whole line.`,
        2: 'Curvature needs a metric; topology cannot see it. A circle is homeomorphic to a square’s outline.',
        3: 'Both are one-dimensional; the number of charts is a consequence of the difference, not a proof of it, and not a dimension count.',
      },
      hints: ['Look for a property defined by open sets alone — not lengths or angles.', 'What happens to each when you delete one point?'],
      teach: 'Topological invariants such as the number of pieces left after removing a point distinguish spaces that no stretching can match.',
      explain: t`A homeomorphism $h$ from circle to line would restrict to one from the circle minus $p$ onto the line minus $h(p)$ — but one is connected and the other is not. (The circle is also compact and the line is not: a second proof.)`,
    }),
    num({
      id: 'cp-null-cone', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([1, 2, 3]);
        const ans = n === 1 ? 4 : 2;
        return {
          prompt: t`The light cone of an event in Minkowski spacetime with $${n}$ space dimension${n > 1 ? 's' : ''} is the set of null displacements, $-t^2 + ${n === 1 ? 'x^2' : n === 2 ? 'x^2 + y^2' : 'x^2 + y^2 + z^2'} = 0$. Remove the event itself (the origin). How many connected pieces are left?`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.6, 1.6], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 5, xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'gold', width: 2.2 }, { fn: '-x', color: 'gold', width: 2.2 }], points: [{ x: 0, y: 0, r: 4.5, hollow: true, color: 'bad' }] }, caption: t`A slice $t$–$x$ through the cone, with the event removed (open dot).${n > 1 ? ' With more space dimensions, rotate this picture about the t-axis.' : ''}` },
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n === 1 ? 2 : 4, feedback: n === 1 ? 'With one space dimension the cone is two lines through the event; removing it leaves four rays.' : 'With two or more space dimensions the future cone’s rays can be joined by walking round it: future and past are one piece each.' }],
          hints: [n === 1 ? 'With one space dimension the cone is the two lines t = ±x.' : 'Rotate the t–x picture about the t-axis: the upper rays sweep out one cone, the lower ones another.', 'Can you walk from one ray to another without passing through the event?'],
          teach: 'Removing the event splits the light cone into the future and past cones (two pieces) when space has two or more dimensions, and into four rays in 1+1.',
          explain: n === 1 ? t`Four rays: future-left, future-right, past-left, past-right — nothing connects them once the event is gone.` : t`Two pieces: the future cone ($t > 0$) and the past cone ($t < 0$). Within each you can walk round from any ray to any other; between them you must pass through the event.${n === 3 ? ' This is our spacetime: every event has one future cone and one past cone.' : ''}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Lee, Introduction to Topological Manifolds (2nd ed.), ch. 4', url: 'https://link.springer.com/book/10.1007/978-1-4419-7940-7' },
    { label: 'Lee, Introduction to Smooth Manifolds (2nd ed.), ch. 1 (the line with two origins, problem 1-1)', url: 'https://link.springer.com/book/10.1007/978-1-4419-9982-5' },
  ],
});
