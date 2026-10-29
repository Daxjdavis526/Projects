// Open sets and continuity: an open set is one in which every point has
// wiggle room (a small ball round it stays inside); continuity is "preimages
// of open sets are open". Open and closed discs, the punctured plane, a line
// in the plane, preimages under x² and a step, finite versus infinite
// intersections, (−1, 1) ≅ ℝ, and why a spacecraft's single heading angle
// cannot be continuous all the way round.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;

// a disc of radius R, open (dashed edge) or closed (solid edge), shaded
const disc = (R, { open = true, color = 'accent', when } = {}) => {
  const W = when ? { when } : {};
  return {
    shade: [{ fn: `sqrt(max(0, ${R * R} - x^2))`, lower: `-sqrt(max(0, ${R * R} - x^2))`, from: -R, to: R, color, alpha: 0.18, ...W }],
    curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, r6(2 * Math.PI)], color, width: open ? 1.6 : 2.6, dash: open ? [6, 5] : undefined, ...W }],
  };
};
const ring = (cx, cy, rad, color = 'good', dash) => ({ param: [`${r6(cx)} + ${r6(rad)}*cos(t)`, `${r6(cy)} + ${r6(rad)}*sin(t)`], t: [0, r6(2 * Math.PI)], color, width: 2, ...(dash ? { dash } : {}) });

// the explore: four sets, a draggable point and the largest ball round it that stays inside
const R_ = 'sqrt(px^2 + py^2)';
const SEL = (k) => `step(0.5 - abs(m - ${k}))`;
const IN = `(${SEL(1)}*step(2 - ${R_} - 0.000001) + ${SEL(2)}*step(2 - ${R_} + 0.000001) + ${SEL(3)}*step(${R_} - 0.000001) + ${SEL(4)}*step(0.000001 - abs(py)))`;
const WIG = `(${SEL(1)}*step(2 - ${R_} - 0.000001)*(2 - ${R_}) + ${SEL(2)}*step(2 - ${R_} + 0.000001)*(2 - ${R_}) + ${SEL(3)}*${R_})`;

export default lesson({
  id: 'st-c.C7.1',
  title: 'Open sets and continuity',
  minutes: 12, difficulty: 2,
  equation: t`U \text{ is open} \iff \text{for every } p \in U \text{ there is } \varepsilon > 0 \text{ with } B_\varepsilon(p) \subset U`,
  intro: t`Everything so far lived in $\mathbb R^3$, where distances come free. From here on the space itself is the object — spacetime is not sitting inside anything — so we need a way to say “near” before we have a ruler. The answer is the **open set**: a set in which **every point has wiggle room**, a small ball around it that stays inside. The open disc $x^2 + y^2 < 4$ is open: however close to the edge you stand, a smaller ball still fits. The closed disc $x^2 + y^2 \le 4$ is not: a point on its rim has no room on the outside.

Open sets are enough to define **continuity** without any $\varepsilon$–$\delta$ arithmetic: $f$ is continuous exactly when the **preimage** $f^{-1}(V)$ of every open set $V$ is open. In words: if $f(p)$ lands inside an open target, then every point close enough to $p$ lands there too.`,
  symbols: [
    { tex: 'U', text: t`a subset of $\mathbb R^n$ (here mostly the plane $\mathbb R^2$)` },
    { tex: 'p', text: t`a point of $U$` },
    { tex: t`\varepsilon`, text: 'a radius — the wiggle room. It may depend on p and may be tiny, but it must be positive' },
    { tex: t`B_\varepsilon(p)`, text: t`the open ball of radius $\varepsilon$ about $p$: all points at distance **less than** $\varepsilon$ from $p$ (a disc in the plane, an interval on a line)` },
    { tex: t`\subset`, text: 'is contained in: every point of the ball is a point of U' },
  ],
  why: t`A manifold (C8) is a space that looks like $\mathbb R^n$ *near each point*, and “near” means “on an open set”. Coordinates are only ever promised on open patches — which is why one chart cannot cover a sphere, and why GR is written so that nothing depends on which patch you use.`,
  visual: {
    type: 'graph',
    title: 'Wiggle room',
    lead: t`Pick a set, then drag the point $p$. The green circle is the largest ball about $p$ that stays inside the set; its radius is the wiggle room. A dashed edge is not part of the set, a solid one is.`,
    tasks: [
      t`Open disc: drag $p$ toward the dashed edge. The green ball shrinks but never vanishes — the edge itself is not in the set, so you can never stand on it.`,
      t`Closed disc: drag $p$ onto the rim at $(2, 0)$. The point is in the set, but no ball fits: the red ring sticks out. One such point is enough to make the set not open.`,
      t`The $x$-axis: every point of it fails — a line has no wiggle room in the plane, even though on its own it is a perfectly good space. Open depends on the space you sit in.`,
    ],
    params: {
      x: [-3.4, 3.4], y: [-2.3, 2.3], equal: true, aspect: 'wide', grid: false, xticks: 7, yticks: 5,
      choices: [{ key: 'm', label: 'Set', options: [[1, t`open disc $x^2 + y^2 < 4$`], [2, t`closed disc $x^2 + y^2 \le 4$`], [3, 'plane minus the origin'], [4, t`the $x$-axis`]], value: 1, explain: 'Four subsets of the plane. Three are open or not for different reasons.' }],
      shade: [
        ...disc(2, { when: `${SEL(1)} + ${SEL(2)}` }).shade,
        { fn: '2.3', lower: '-2.3', from: -3.4, to: 3.4, color: 'accent', alpha: 0.14, when: SEL(3) },
      ],
      curves: [
        ...disc(2, { open: true, when: SEL(1) }).curves,
        ...disc(2, { open: false, when: SEL(2) }).curves,
        { fn: '0', color: 'accent', width: 3, when: SEL(4) },
        { param: [`px + ${WIG}*cos(t)`, `py + ${WIG}*sin(t)`], t: [0, r6(2 * Math.PI)], color: 'good', width: 2.2, when: `step(${WIG} - 0.001)` },
        { param: ['px + 0.35*cos(t)', 'py + 0.35*sin(t)'], t: [0, r6(2 * Math.PI)], color: 'bad', width: 2, dash: [4, 4], when: `${IN}*step(0.001 - ${WIG})` },
      ],
      points: [{ x: 0, y: 0, r: 4, hollow: true, color: 'ink', when: SEL(3) }],
      drag: [{ key: 'p', x: 1.2, y: 0.9, snap: 0.05 }],
      readouts: [
        { label: t`$p$ in the set (1 = yes)`, expr: IN, digits: 1 },
        { label: t`largest $\varepsilon$`, expr: WIG, digits: 3, when: IN },
      ],
    },
    caption: t`Exact geometry: the wiggle room in a disc of radius 2 is $2 - |p|$, in the punctured plane it is $|p|$, and on a line it is 0. The red dashed ring (radius 0.35) marks a point of the set where no ball fits.`,
  },
  example: {
    prompt: t`Show that the open disc $D = \{x^2 + y^2 < 4\}$ is open by finding a wiggle room for every point, and evaluate it at $p = (1.2, 0.9)$. Then show that the closed disc is not open.`,
    visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-2.3, 2.3], equal: true, aspect: 'wide', grid: false, xticks: 7, yticks: 5, ...disc(2), curves: [...disc(2).curves, ring(1.2, 0.9, 0.5), { param: ['1.6*t', '1.2*t'], t: [0, 1.25], color: 'ink3', width: 1, dash: [3, 3] }], points: [{ x: 1.2, y: 0.9, label: 'p', color: 'gold' }, { x: 0, y: 0, r: 3, color: 'ink2' }] }, caption: t`The open disc of radius 2 and the ball of radius $\varepsilon = 2 - |p| = 0.5$ about $p$, touching the edge from inside along the ray through $p$ (dotted).` },
    steps: [
      { label: 'Guess a radius', text: t`A point at distance $r = |p| < 2$ from the centre is $2 - r$ from the edge, measured along the ray through $p$. Try $\varepsilon = 2 - r$, which is positive because $r < 2$.` },
      { label: 'Prove it fits', text: t`If $|x - p| < \varepsilon$, the triangle inequality gives $|x| \le |x - p| + |p| < (2 - r) + r = 2$. So every point of $B_\varepsilon(p)$ is in $D$.` },
      { label: 'At the point', text: t`$|p| = \sqrt{1.2^2 + 0.9^2} = \sqrt{2.25} = 1.5$, so $\varepsilon = 0.5$ works. Any smaller positive radius also works; open sets ask only that *some* radius exists.` },
      { label: 'The closed disc', text: t`The point $q = (2, 0)$ is in $\{x^2 + y^2 \le 4\}$, but for any $\varepsilon > 0$ the point $(2 + \varepsilon/2,\ 0)$ is within $\varepsilon$ of $q$ and outside. No radius works at $q$.` },
      { label: 'Sense check', text: t`The open disc has no edge points to fail at — the boundary circle is not part of it. The closed disc fails only on its rim; every interior point still has room.` },
    ],
    answer: t`$\varepsilon = 2 - |p|$ works at every point of the open disc ($0.5$ at $p$), so it is open; the closed disc is not, because the rim point $(2, 0)$ has no wiggle room.`,
  },
  practice: [
    multi({
      id: 'which-open', difficulty: 1,
      prompt: 'Select every subset of the plane that is open.',
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 3, curves: [{ fn: '0', color: 'accent', width: 3 }, ring(0.6, 0, 0.35, 'bad', [4, 4])], points: [{ x: 0.6, y: 0, color: 'gold', label: 'p' }] }, caption: t`The test applied to one set, the $x$-axis: every ball about a point $p$ of it pokes out above and below.` },
      choices: [
        t`the open disc $x^2 + y^2 < 1$`,
        'the plane with the origin removed',
        t`the open upper half-plane $y > 0$`,
        t`the closed disc $x^2 + y^2 \le 1$`,
        t`the $x$-axis $y = 0$`,
        t`the square $0 \le x < 1,\ 0 < y < 1$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: 'A point on the rim, such as (1, 0), has no ball that stays inside.',
        4: 'Every ball about a point of the axis contains points just above it.',
        5: t`The left edge $x = 0$ is included: a point such as $(0, \tfrac12)$ has no room to its left. One included edge spoils it.`,
      },
      hints: ['For each set, look for a point of the set where every small ball pokes out. If there is none, the set is open.', 'Strict inequalities (<, >, ≠) built from continuous functions give open sets; an included edge or a lower-dimensional set does not.'],
      teach: 'A set is open when no point of it sits on its edge: every point has a small ball around it inside the set.',
      explain: t`The open disc, the punctured plane ($\varepsilon = |p|$) and the open half-plane ($\varepsilon = y$) are open. The closed disc and the half-closed square each contain an edge point with no room; the axis has no room anywhere.`,
    }),
    num({
      id: 'rect-wiggle', difficulty: 2,
      gen(r) {
        const a = r.pick([4, 5, 6]), b = r.pick([2, 3]);
        const x0 = r.pick([0.6, 1.5, a - 0.8, a - 1.4]), y0 = r.pick([0.7, b - 0.4, 1.1]);
        const d = [x0, a - x0, y0, b - y0], eps = Math.min(...d);
        return {
          prompt: t`The open rectangle $0 < x < ${a}$, $0 < y < ${b}$ contains $p = (${nice(x0)}, ${nice(y0)})$. What is the largest radius $\varepsilon$ for which the ball $B_\varepsilon(p)$ stays inside?`,
          visual: { type: 'graph', params: { x: [-0.6, a + 0.6], y: [-0.6, b + 0.6], equal: true, aspect: 'wide', grid: false, xticks: a + 2, yticks: b + 2, shade: [{ fn: String(b), lower: '0', from: 0, to: a, color: 'accent', alpha: 0.16 }], curves: [{ param: [`${a / 2} + ${a / 2}*max(-1, min(1, 1.5*cos(t)))`, `${b / 2} + ${b / 2}*max(-1, min(1, 1.5*sin(t)))`], t: [0, r6(2 * Math.PI)], color: 'accent', width: 1.6, dash: [6, 5] }], points: [{ x: x0, y: y0, color: 'gold', label: 'p' }] }, caption: 'The open rectangle (dashed edges are not part of it) and the point p.' },
          answer: eps, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: Math.min(x0, a - x0), feedback: 'That is the room left and right only. The ball also reaches up and down.' }, { value: Math.min(y0, b - y0), feedback: 'That is the room up and down only. The ball also reaches left and right.' }, { value: Math.max(...d), feedback: 'That is the distance to the farthest edge; the ball must clear the nearest one.' }].filter((e) => Math.abs(e.value - eps) > 0.01),
          hints: ['A ball fits exactly when its radius is at most the distance from p to each of the four edges.', t`The four distances are $x$, $${a} - x$, $y$ and $${b} - y$. Take the smallest.`],
          teach: 'The wiggle room is the distance to the nearest edge; it is positive at every point of an open set.',
          explain: t`The distances to the four edges are $${d.map((v) => nice(v)).join(',\ ')}$; the smallest, $${nice(eps)}$, is the largest radius that fits. As $p$ approaches an edge it shrinks toward 0, but it is never 0 inside.`,
        };
      },
    }),
    num({
      id: 'preimage-length', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 1.5, 2]), b = a + r.pick([0.5, 1]);
        const A = a * a, B = b * b, L = 2 * (b - a);
        return {
          prompt: t`For $f(x) = x^2$, find the preimage $f^{-1}\big((${nice(A)}, ${nice(B)})\big)$ — all $x$ with $${nice(A)} < x^2 < ${nice(B)}$ — and give its total length.`,
          visual: { type: 'graph', params: { x: [-3.5, 3.5], y: [-0.6, 9], aspect: 'wide', xticks: 7, yticks: 5, shade: [{ fn: String(B), lower: String(A), from: -3.5, to: 3.5, color: 'gold', alpha: 0.22 }], curves: [{ fn: 'x^2', color: 'accent', width: 2.4, label: 'f(x) = x²', labelAt: 2.85, labelDx: -78, labelDy: 4 }], hlines: [{ y: A, color: 'gold' }, { y: B, color: 'gold' }] }, caption: 'The parabola and the open band of target values (gold).' },
          answer: L, tol: { rel: 0.001 },
          errors: [{ value: b - a, feedback: t`$x^2$ is also in the band for negative $x$: the preimage has two pieces, $(-${nice(b)}, -${nice(a)})$ and $(${nice(a)}, ${nice(b)})$.` }, { value: B - A, feedback: 'That is the length of the target interval. The question asks for the set of x-values that land in it.' }],
          hints: [t`$x^2 > ${nice(A)}$ and $x^2 < ${nice(B)}$ means $${nice(a)} < |x| < ${nice(b)}$.`, 'That is two open intervals, one on each side of 0.'],
          teach: 'A preimage collects every input that lands in the target set — here two open intervals, as continuity demands.',
          explain: t`$f^{-1} = (-${nice(b)}, -${nice(a)}) \cup (${nice(a)}, ${nice(b)})$, total length $2 \times ${nice(b - a)} = ${nice(L)}$. Both pieces are open, as they must be for a continuous $f$: an open target pulls back to an open set.`,
        };
      },
    }),
    mcq({
      id: 'step-fails', difficulty: 2,
      prompt: t`The step function $H(x) = 0$ for $x < 0$ and $H(x) = 1$ for $x \ge 0$ jumps at 0. Which preimage of an open interval shows, by the open-set test, that $H$ is not continuous?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.6, 1.8], aspect: 'wide', xticks: 7, yticks: 4, curves: [{ fn: '0', domain: [-3, 0], color: 'accent', width: 2.6 }, { fn: '1', domain: [0, 3], color: 'accent', width: 2.6 }], points: [{ x: 0, y: 0, hollow: true, color: 'accent' }, { x: 0, y: 1, color: 'accent' }] }, caption: 'The step: the filled dot says H(0) = 1, the open dot that H(0) ≠ 0.' },
      choices: [
        t`$H^{-1}\big((\tfrac12, \tfrac32)\big) = [0, \infty)$, which is not open`,
        t`$H^{-1}\big((-\tfrac12, \tfrac12)\big) = (-\infty, 0)$, which is not open`,
        t`$H^{-1}\big((-1, 2)\big) = \mathbb R$, which is not open`,
        t`$H^{-1}\big((5, 6)\big) = \varnothing$, which is not open`,
      ],
      answer: 0,
      why: {
        1: t`$(-\infty, 0)$ is open: every negative number has room on both sides. This preimage passes the test, so it proves nothing.`,
        2: t`$\mathbb R$ is open — every point has room. The whole space is always open.`,
        3: 'The empty set is open: it has no points, so none can fail. It is always open.',
      },
      hints: ['Find an open interval of target values that contains 1 but not 0.', t`Its preimage contains $0$ but no negative numbers: what about wiggle room at $0$?`],
      teach: 'A function is continuous exactly when every open set of outputs pulls back to an open set of inputs; one bad preimage is enough to fail.',
      explain: t`$(\tfrac12, \tfrac32)$ contains 1 and not 0, so its preimage is $\{x : H(x) = 1\} = [0, \infty)$. The point $0$ is in it but has no room to the left. In $\varepsilon$–$\delta$ language: however close to 0 you start on the left, $H$ is 1 away from $H(0)$.`,
    }),
    mcq({
      id: 'infinite-intersection', difficulty: 3,
      prompt: t`Each interval $(-1/n,\ 1/n)$, $n = 1, 2, 3, \dots$, is open. What is the intersection of all of them?`,
      visual: { type: 'graph', params: { x: [-1.2, 1.2], y: [0, 6], aspect: 'wide', xticks: 5, yticks: 0, ylabel: '', curves: [1, 2, 3, 4, 5].map((n) => ({ param: [`${r6(1 / n)}*t`, String(6 - n)], t: [-1, 1], color: 'accent', width: 2.4 })), points: [1, 2, 3, 4, 5].flatMap((n) => [{ x: r6(-1 / n), y: 6 - n, hollow: true, color: 'accent', r: 3.5 }, { x: r6(1 / n), y: 6 - n, hollow: true, color: 'accent', r: 3.5 }]) }, caption: t`The intervals for $n = 1$ to 5, stacked (open dots: endpoints left out). They shrink toward 0.` },
      choices: [
        t`$\{0\}$, a single point, which is not open`,
        t`$\{0\}$, which is open because it is an intersection of open sets`,
        t`the empty set, since the intervals shrink to nothing`,
        t`$(-1, 1)$, the first interval`,
      ],
      answer: 0,
      why: {
        1: t`Only **finite** intersections of open sets are guaranteed open: take $\varepsilon = \min(\varepsilon_1, \dots, \varepsilon_k)$. With infinitely many, the minimum can be 0.`,
        2: t`$0$ lies in every one of them, since $-1/n < 0 < 1/n$ for every $n$.`,
        3: 'That is the union of the intervals (each sits inside the first), not their intersection.',
      },
      hints: [t`Which numbers lie in $(-1/n, 1/n)$ for **every** $n$? Try $x = 0$, then any $x \ne 0$.`, t`For $x \ne 0$, pick $n > 1/|x|$.`],
      teach: 'Unions of any number of open sets are open, but only finitely many open sets are guaranteed to intersect in an open set.',
      explain: t`$0$ is in all of them, and any $x \ne 0$ falls outside $(-1/n, 1/n)$ once $n > 1/|x|$. So the intersection is $\{0\}$, which has no wiggle room. These three rules — $\varnothing$ and the whole space are open, any union of open sets is open, a finite intersection is open — are the axioms of a **topology**.`,
    }),
    num({
      id: 'tan-chart', difficulty: 2,
      gen(r) {
        const y0 = r.pick([1, 2, 5, 10, -3, -20]);
        const x0 = (2 / Math.PI) * Math.atan(y0);
        return {
          prompt: t`The map $h(x) = \tan(\pi x/2)$ is a continuous bijection from the open interval $(-1, 1)$ onto the whole line $\mathbb R$, with a continuous inverse — a **homeomorphism**. Which $x$ in $(-1, 1)$ does it send to $${y0}$?`,
          visual: { type: 'graph', params: { x: [-1.15, 1.15], y: [-22, 22], aspect: 'wide', xticks: 5, yticks: 5, curves: [{ fn: 'tan(pi*x/2)', domain: [-0.97, 0.97], color: 'accent', width: 2.4, label: 'h(x)', labelAt: 0.6, labelDx: 10 }], vlines: [{ x: -1, color: 'ink3' }, { x: 1, color: 'ink3' }], hlines: [{ y: y0, color: 'gold' }] }, caption: t`The graph of $h$ over $(-1, 1)$; it climbs to $\pm\infty$ at the excluded ends. Gold: the target value.` },
          answer: x0, tol: { rel: 0, abs: 0.002 },
          errors: [{ value: Math.atan(y0), feedback: t`Undo the factor $\pi/2$ as well: $x = \tfrac2\pi\arctan(${y0})$.` }],
          hints: [t`Solve $\tan(\pi x/2) = ${y0}$: $\pi x/2 = \arctan(${y0})$.`],
          teach: 'An open interval and the whole line are homeomorphic: topology keeps nearness and continuity but forgets length.',
          explain: t`$x = \tfrac2\pi\arctan(${y0}) = ${nice(x0, 4)}$. The bounded interval and the infinite line are the same space as far as open sets are concerned — which is why a chart (C8.1) may take an open patch of a sphere onto all of $\mathbb R^2$.`,
        };
      },
    }),
    order({
      id: 'finite-intersection', difficulty: 3,
      prompt: t`Prove that the intersection of two open sets $U$ and $V$ is open. Order the steps.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.9, 1.9], equal: true, aspect: 'wide', grid: false, xticks: 0, yticks: 0, axes: false, curves: [{ param: ['-0.6 + 1.5*cos(t)', '1.5*sin(t)'], t: [0, r6(2 * Math.PI)], color: 'accent', dash: [6, 5] }, { param: ['0.7 + 1.4*cos(t)', '0.2 + 1.4*sin(t)'], t: [0, r6(2 * Math.PI)], color: 'violet', dash: [6, 5] }, ring(0.3, 0.3, 0.98, 'violet'), ring(0.3, 0.3, 0.55, 'good')], points: [{ x: 0.3, y: 0.3, color: 'gold', label: 'p' }, { x: -1.9, y: 1.3, r: 0, label: 'U' }, { x: 1.9, y: 1.4, r: 0, label: 'V' }] }, caption: 'Two open discs U and V (dashed) and a point p in both. The ball of radius 0.55 about p (green) fits in U, the one of radius 0.98 (violet) fits in V; the smaller fits in both.' },
      items: [
        t`Let $p$ be any point of $U \cap V$.`,
        t`Since $U$ is open there is $\varepsilon_1 > 0$ with $B_{\varepsilon_1}(p) \subset U$; since $V$ is open there is $\varepsilon_2 > 0$ with $B_{\varepsilon_2}(p) \subset V$.`,
        t`Let $\varepsilon = \min(\varepsilon_1, \varepsilon_2)$, which is positive.`,
        t`$B_\varepsilon(p)$ lies inside both balls, so inside $U \cap V$; every point of $U \cap V$ has wiggle room.`,
      ],
      hints: ['Start from an arbitrary point of the intersection.', 'Each set gives its own radius; use the one that works for both.'],
      teach: 'To show a set is open, take an arbitrary point and produce a positive radius that fits.',
      explain: t`The same argument handles any **finite** number of sets (the minimum of finitely many positive numbers is positive) and fails for infinitely many, as the intervals $(-1/n, 1/n)$ showed.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-heading', difficulty: 3, transfer: true,
      prompt: t`A spacecraft’s flight software stores its heading as one angle $\theta \in [0^\circ, 360^\circ)$. As the craft turns smoothly through north, the stored value jumps from $359.9^\circ$ to $0^\circ$. In the language of this lesson, what has gone wrong?`,
      visual: { type: 'graph', params: { x: [-1.7, 1.7], y: [-1.25, 1.25], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, r6(2 * Math.PI)], color: 'accent', width: 2.2 }, { param: ['1 + 0.18*cos(t)', '0.18*sin(t)'], t: [0, r6(2 * Math.PI)], color: 'bad', width: 2, dash: [4, 4] }], points: [{ x: 1, y: 0, color: 'gold', label: '0°', labelDx: 26 }, { x: 0, y: 1, r: 0, label: '90°' }, { x: -1.25, y: 0, r: 0, label: '180°' }] }, caption: t`Headings as points of a circle. Red: a small open arc about $0^\circ$, containing headings just below $360^\circ$ and just above $0^\circ$.` },
      choices: [
        t`The map heading $\mapsto \theta$ is not continuous at north: the preimage of the open interval $(-1^\circ, 1^\circ)$ is a half-open arc starting at north, which is not open in the circle`,
        t`The circle is not an open set, so no continuous angle can exist on any part of it`,
        t`The jump is a rounding error that more digits would remove`,
        t`$[0^\circ, 360^\circ)$ is open, so the stored angle is continuous; the jump is in the sensor`,
      ],
      answer: 0,
      why: {
        1: t`Open sets of the circle are its open arcs, and away from north the angle is perfectly continuous. The trouble is one point, not the whole circle.`,
        2: t`More digits move the jump from $359.9^\circ$ to $359.999^\circ$; it is still there. It is topological, not numerical.`,
        3: t`$[0, 360)$ includes 0 with no room to its left, so it is not open in $\mathbb R$ — and in any case the problem is the map from the circle, not the interval.`,
      },
      hints: ['Headings close to north lie on both sides of it. Where does the stored angle send each side?', 'Pull back a small open interval of angle values around 0 and ask whether north has wiggle room in the result.'],
      teach: 'No single angle is continuous all the way round a circle; continuity fails where the angle wraps, so a circle needs at least two angle charts.',
      explain: t`Headings just west of north have $\theta \approx 360^\circ$ and fall outside $(-1^\circ, 1^\circ)$, so the preimage contains north but none of its western neighbours: not open, not continuous. Flight software lives with this by using two overlapping angle ranges (or unit vectors and quaternions) — the circle’s two charts, the subject of C8.1.`,
    }),
    num({
      id: 'cp-margin', difficulty: 2, transfer: true,
      gen(r) {
        const q0 = r.pick([8, 10, 11, 12]), k = r.pick([35, 40]), T0 = 450, Tmax = r.pick([950, 1000]);
        const d = (Tmax - T0 - k * q0) / k;
        return {
          prompt: t`A regeneratively cooled chamber’s liner temperature is modelled as $T(q) = ${T0}\ \text{K} + (${k}\ \text{K per MW/m}^2)\,q$, where $q$ is the local heat flux. The liner is safe while $T < ${Tmax}$ K — a strict inequality, so the safe set of $q$ is open. At today’s operating point $q_0 = ${q0}\ \text{MW/m}^2$. How far can the heat flux wander, in either direction, while staying safe? Give the wiggle room in $\text{MW/m}^2$.`,
          visual: { type: 'graph', params: { x: [0, 20], y: [300, 1400], aspect: 'wide', xticks: 6, yticks: 6, xlabel: 'q (MW/m²)', ylabel: 'T (K)', curves: [{ fn: `${T0} + ${k}*x`, color: 'accent', width: 2.4 }], hlines: [{ y: Tmax, color: 'bad', label: 'limit' }], points: [{ x: q0, y: T0 + k * q0, color: 'gold', label: 'q₀' }] }, caption: 'The linear liner model (a teaching simplification: real wall temperatures depend on coolant state and wall conduction) and the temperature limit.' },
          answer: d, units: 'MW/m^2', tol: { rel: 0.01 },
          errors: [{ value: (Tmax - T0) / k, feedback: 'That is the largest safe flux, measured from q = 0. The wiggle room is measured from today’s operating point.' }, { value: Tmax - T0 - k * q0, feedback: 'That is the temperature margin in kelvin. Divide by the slope to turn it into a heat-flux margin.' }],
          hints: [t`The safe set is $q < (${Tmax} - ${T0})/${k}$ MW/m², an open interval (heat flux is positive, and $q_0$ is far from 0).`, 'The wiggle room is the distance from q₀ to the edge of that interval.'],
          teach: 'For a continuous model and a strict limit, the safe set is open: every safe state has a margin of nearby safe states.',
          explain: t`The edge is at $q = ${nice((Tmax - T0) / k, 4)}\ \text{MW/m}^2$, so the margin is $${nice(d, 4)}\ \text{MW/m}^2$. This is continuity at work: because $T$ is continuous and the limit is an open condition, the preimage of “safe” is open, so a safe state always has a neighbourhood of safe states. A limit written $T \le T_{\max}$ would allow an operating point with zero margin.`,
        };
      },
    }),
    mcq({
      id: 'cp-preimage', difficulty: 2,
      prompt: t`Using “preimages of open sets under continuous maps are open”, which of these subsets of the plane is **open**?`,
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 3, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, r6(2 * Math.PI)], color: 'accent', width: 2 }] }, caption: t`The unit circle $x^2 + y^2 = 1$.` },
      choices: [
        t`$\{(x, y) : x^2 + y^2 \ne 1\}$, the plane with the circle removed`,
        t`$\{(x, y) : x^2 + y^2 = 1\}$, the circle itself`,
        t`$\{(x, y) : x^2 + y^2 \le 1\}$`,
        t`$\{(x, y) : x \ge 0\}$`,
      ],
      answer: 0,
      why: {
        1: t`The circle is the preimage of the single point $\{1\}$, which is closed, not open. A curve has no wiggle room in the plane.`,
        2: t`That is the preimage of $(-\infty, 1]$, which includes its endpoint; rim points have no room outside.`,
        3: t`The preimage of $[0, \infty)$ under $(x, y) \mapsto x$: points on the $y$-axis have no room to the left.`,
      },
      hints: [t`$f(x, y) = x^2 + y^2$ is continuous. Which of these sets is $f^{-1}$ of an open subset of $\mathbb R$?`],
      teach: 'Strict conditions on continuous functions — f < c, f > c, f ≠ c — always cut out open sets.',
      explain: t`$\{x^2 + y^2 \ne 1\} = f^{-1}\big((-\infty, 1) \cup (1, \infty)\big)$, the preimage of an open set under a continuous map, so it is open — no wiggle-room computation needed. The same reasoning shows that the region outside a black hole’s horizon, $r > 2M$, is open (gr track).`,
    }),
  ],
  sources: [
    { label: 'Lee, Introduction to Topological Manifolds (2nd ed.), ch. 2', url: 'https://link.springer.com/book/10.1007/978-1-4419-7940-7' },
    { label: 'Carroll, Spacetime and Geometry, §2.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
