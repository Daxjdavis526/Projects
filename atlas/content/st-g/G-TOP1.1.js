// Open sets, neighbourhoods and continuity — a refresher. st-c.C7.1 is the full
// lesson (discs, the punctured plane, preimages, (−1, 1) ≅ ℝ); this one adds
// the axioms of a topology, neighbourhoods, and the point that open sets
// forget distances: the Euclidean, taxicab and max metrics give the same open
// sets of ℝ², and the ε–δ definition of continuity is the open-set one in
// disguise. Transfer: the Lorentzian interval cannot make spacetime's
// topology (its "balls" run off along the light cone), and a throttle
// tolerance as a δ for an ε.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);

// the three unit "balls" of radius R about (cx, cy): Euclidean disc, taxicab diamond, max square
const circle = (R, color = 'accent', extra = {}, cx = 0, cy = 0) => ({ param: [`${cx} + ${R}*cos(t)`, `${cy} + ${R}*sin(t)`], t: [0, TAU], color, width: 2, ...extra });
const diamond = (R, color = 'gold', extra = {}, cx = 0, cy = 0) => ({ param: [`${cx} + ${R}*cos(t)/(abs(cos(t)) + abs(sin(t)))`, `${cy} + ${R}*sin(t)/(abs(cos(t)) + abs(sin(t)))`], t: [0, TAU], color, width: 2, ...extra });
const square = (R, color = 'teal', extra = {}, cx = 0, cy = 0) => ({ param: [`${cx} + ${R}*cos(t)/max(abs(cos(t)), abs(sin(t)))`, `${cy} + ${R}*sin(t)/max(abs(cos(t)), abs(sin(t)))`], t: [0, TAU], color, width: 2, ...extra });

// a function graph with a horizontal band (an open interval V on the y-axis) marked
const band = (fn, x, y, lo, hi, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide', xlabel: 'x', ylabel: 'y',
    curves: [{ fn, color: 'accent', width: 2.2 }],
    shade: [{ fn: String(hi), lower: String(lo), from: x[0], to: x[1], color: 'gold', alpha: 0.16 }],
    hlines: [{ y: lo, color: 'gold' }, { y: hi, color: 'gold' }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'st-g.G-TOP1.1',
  title: 'Open sets, neighbourhoods and continuity',
  minutes: 11, difficulty: 2,
  intro: t`A **topology** on a set $X$ is a choice of which subsets are called **open**, subject to three rules: $\varnothing$ and $X$ are open; any union of open sets is open; the intersection of *finitely many* open sets is open. A **neighbourhood** of a point $p$ is any set that contains an open set containing $p$. Continuity then needs no distances at all:

$$\begin{gathered}f: X \to Y \text{ is continuous} \iff \\ f^{-1}(V) \text{ is open for every open } V \subseteq Y\end{gathered}$$

In $\mathbb R^n$ the open sets are the ones in which every point has a small ball round it still inside. But **the open sets forget the distances that made them**: many metrics give the same topology. This refresher recaps [open sets and continuity](#/lesson/st-c.C7.1) with the abstract rules and a new example.`,
  symbols: [
    { tex: 'X', text: 'the set of points: the space' },
    { tex: '\\tau', text: t`the topology: the collection of subsets of $X$ declared open` },
    { tex: 'U, V', text: 'open sets' },
    { tex: 'f^{-1}(V)', text: t`the preimage of $V$: every point of $X$ that $f$ sends into $V$ (no inverse function is needed)` },
    { tex: 'B_\\varepsilon(p)', text: t`the open ball of radius $\varepsilon$ about $p$: the points at distance less than $\varepsilon$, for a chosen metric` },
    { tex: 'N', text: t`a neighbourhood of $p$: a set containing some open $U$ with $p \in U$` },
  ],
  why: 'A manifold — spacetime included — is a topological space before it has a metric: “nearby”, limits and continuity of fields must make sense first, because in general relativity the metric is the unknown being solved for.',
  visual: {
    type: 'graph',
    title: 'Three metrics, one set of open sets',
    lead: t`Three “balls” of radius $r$ about the origin: the Euclidean disc $\sqrt{x^2 + y^2} < r$ (blue), the taxicab diamond $|x| + |y| < r$ (gold) and the max-metric square $\max(|x|, |y|) < r$ (green). The dashed square, half as wide, is the max ball of radius $r/2$. Each kind of ball has a ball of every other kind inside it.`,
    tasks: [
      t`Shrink $r$: the nesting never changes — diamond inside disc inside square, and the half-size square inside the diamond. So a set with a small ball of one kind round each point has small balls of every kind: the three metrics give the same open sets.`,
      t`The distances disagree by factors up to $2$ (the diamond’s corner and the square’s corner), but no factor ever matters to “is there *some* ball inside?” That is what a topology keeps.`,
    ],
    params: {
      x: [-2.6, 2.6], y: [-1.5, 1.5], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y',
      sliders: [{ key: 'r', label: t`Radius $r$`, min: 0.2, max: 1.4, step: 0.05, value: 1.2, explain: 'The radius of each ball, in its own metric.' }],
      curves: [square('r'), circle('r'), diamond('r'), square('r/2', 'teal', { dash: true, width: 1.6 })],
      points: [{ x: 0, y: 0, label: 'p', color: 'ink', r: 3.5 }],
    },
    caption: t`Exact boundaries; the balls are open, so their edges are not part of them. Euclidean: $\sqrt{\Delta x^2 + \Delta y^2}$; taxicab: $|\Delta x| + |\Delta y|$; max: $\max(|\Delta x|, |\Delta y|)$.`,
  },
  example: {
    prompt: t`Show that the max metric $d_\infty(p, q) = \max(|\Delta x|, |\Delta y|)$ and the Euclidean metric $d_2(p, q) = \sqrt{\Delta x^2 + \Delta y^2}$ give $\mathbb R^2$ the same open sets.`,
    visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.2, 1.2], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [square(1), circle(1), square(r6(1 / Math.SQRT2), 'teal', { dash: true, width: 1.6 })], points: [{ x: 0, y: 0, label: 'p', r: 3.5 }] }, caption: t`The max ball of radius $1$ (green), the Euclidean ball of radius $1$ inside it, and the max ball of radius $1/\sqrt2$ (dashed) inside that.` },
    steps: [
      { label: 'What open means', text: t`In a metric space, $U$ is open when every $p \in U$ has some $\varepsilon > 0$ with $B_\varepsilon(p) \subseteq U$. So it is enough to fit a ball of each kind inside a ball of the other.` },
      { label: 'Disc inside square', text: t`$\max(|\Delta x|, |\Delta y|) \le \sqrt{\Delta x^2 + \Delta y^2}$, so a point with $d_2 < \varepsilon$ has $d_\infty < \varepsilon$: the Euclidean ball of radius $\varepsilon$ lies inside the max ball of radius $\varepsilon$.` },
      { label: 'Square inside disc', text: t`$\sqrt{\Delta x^2 + \Delta y^2} \le \sqrt2\,\max(|\Delta x|, |\Delta y|)$, so the max ball of radius $\varepsilon/\sqrt2$ lies inside the Euclidean ball of radius $\varepsilon$.` },
      { label: 'Conclude', text: t`If $U$ is open for $d_2$, each point has a disc inside $U$, and a square inside that disc: $U$ is open for $d_\infty$. The converse is the same with the roles swapped. The open sets agree.` },
      { label: 'Sense check', text: t`The two metrics disagree about distances by at most a factor $\sqrt2$. Any two metrics with $a\,d_1 \le d_2 \le b\,d_1$ for constants $a, b > 0$ give the same topology — which is why “the” topology of $\mathbb R^n$ needs no choice of ruler.` },
    ],
    answer: t`$d_2$-balls contain $d_\infty$-balls and vice versa ($d_\infty \le d_2 \le \sqrt2\,d_\infty$), so a set has a small ball of one kind round each point exactly when it has one of the other: the topologies are equal.`,
  },
  practice: [
    mcq({
      id: 'axioms', difficulty: 1,
      prompt: t`On the three-point set $X = \{1, 2, 3\}$, which collection is a topology?`,
      choices: [t`$\{\varnothing, \{1\}, \{1, 2\}, X\}$`, t`$\{\varnothing, \{1\}, \{2\}, X\}$`, t`$\{\varnothing, \{1, 2\}, \{2, 3\}, X\}$`, t`$\{\{1\}, \{1, 2\}, X\}$`],
      answer: 0,
      why: {
        1: t`The union $\{1\} \cup \{2\} = \{1, 2\}$ is missing, and unions of open sets must be open.`,
        2: t`The intersection $\{1, 2\} \cap \{2, 3\} = \{2\}$ is missing, and finite intersections must be open.`,
        3: t`The empty set must always be open (it is the union of no sets at all).`,
      },
      hints: [t`Check each rule in turn: contains $\varnothing$ and $X$; closed under unions; closed under intersections of two sets.`, t`A nested chain of sets is automatically closed under unions and intersections.`],
      teach: 'A topology must contain the empty set and the whole space and be closed under arbitrary unions and finite intersections.',
      explain: t`The chain $\varnothing \subset \{1\} \subset \{1, 2\} \subset X$ is closed under unions and intersections (each is just the larger or smaller set). Topologies on finite sets look odd; the rules were written for the open sets of $\mathbb R^n$.`,
    }),
    num({
      id: 'disc-in-diamond', difficulty: 2,
      gen(r) {
        const [px, py] = r.pick([[0.2, 0.3], [0.4, -0.1], [-0.3, 0.25], [0.1, -0.5], [-0.45, -0.15], [0.35, 0.35]]);
        const tax = 1 - Math.abs(px) - Math.abs(py), ans = tax / Math.SQRT2;
        return {
          prompt: t`The open diamond $D = \{|x| + |y| < 1\}$ is the taxicab ball of radius $1$. What is the largest radius $\varepsilon$ of a **Euclidean** disc centred on $p = (${px}, ${py})$ that fits inside $D$? Three significant figures.`,
          visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.15, 1.15], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [diamond(1)], points: [{ x: px, y: py, label: 'p', r: 4 }] }, caption: 'The open diamond |x| + |y| < 1 and the point p; its edges are not part of it.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: tax, feedback: t`$1 - |x| - |y|$ is the taxicab distance to the edge. The Euclidean distance to the line $x + y = 1$ divides by the length of its normal, $\sqrt2$.` }, { value: 1 - Math.hypot(px, py), feedback: 'That is the room left inside the unit disc, not the diamond.' }],
          hints: [t`The disc fits as long as its radius does not exceed the distance from $p$ to the nearest edge of $D$.`, t`The edge in $p$’s quadrant is the line $\pm x \pm y = 1$; the distance from $(x_0, y_0)$ to $x + y = 1$ is $|1 - x_0 - y_0|/\sqrt2$.`],
          teach: 'An open set has room round every point: here a Euclidean disc fits inside a taxicab ball, as it must if the two metrics give the same topology.',
          explain: t`Nearest edge: distance $(1 - |${px}| - |${py}|)/\sqrt2 = ${nice(tax)}/\sqrt2 = ${nice(ans, 3)}$. Any positive room would do for openness; the size only tells you how close to the edge $p$ sits.`,
        };
      },
    }),
    num({
      id: 'preimage', difficulty: 2,
      gen(r) {
        const a = r.pick([0.2, 0.25, 0.4, 0.5, 0.8]);
        const half = Math.sqrt(1 / a - 1), ans = 2 * half;
        return {
          prompt: t`$f(x) = \dfrac{1}{1 + x^2}$ is continuous on $\mathbb R$. The preimage of the open interval $V = (${a}, 2)$ is an open interval. How long is it?`,
          visual: band('1/(1 + x^2)', [-3.5, 3.5], [-0.15, 1.3], a, 2, t`The curve $y = 1/(1 + x^2)$ and the band $${a} < y < 2$ (gold). The preimage is the set of $x$ whose point on the curve lies in the band.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: half, feedback: 'That is half of it: the preimage is symmetric, from −√(1/a − 1) to +√(1/a − 1).' }, { value: 2 * (1 / a - 1), feedback: 'Take the square root: x² < 1/a − 1.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Solve $\dfrac{1}{1 + x^2} > ${a}$ (the upper end, $2$, is never reached).`, t`$1 + x^2 < \tfrac{1}{${a}}$, so $|x| < \sqrt{1/${a} - 1}$.`],
          teach: 'For a continuous f, the preimage of an open set is open — here the open interval of x whose values land inside the band.',
          explain: t`$|x| < \sqrt{${nice(1 / a)} - 1} = ${nice(half, 4)}$, an open interval of length $${nice(ans, 4)}$. Its endpoints map to $y = ${a}$ exactly, the excluded edge of $V$, so they are excluded too.`,
        };
      },
    }),
    multi({
      id: 'neighbourhoods', difficulty: 2,
      prompt: t`Which of these sets are neighbourhoods of $0$ in $\mathbb R$ (usual topology)?`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-0.5, 4.5], aspect: 'wide', xlabel: 'x', ylabel: '', yticks: 0, curves: [{ fn: '4', domain: [-1, 1], color: 'accent', width: 4, label: '[−1, 1]', labelAt: 1, labelDx: 6, labelDy: 4 }, { fn: '3', domain: [0, 1], color: 'gold', width: 4, label: '[0, 1)', labelAt: 1, labelDx: 6, labelDy: 4 }, { fn: '2', domain: [-1.6, 1.6], color: 'teal', width: 4 }, { fn: '1', domain: [0, 1], color: 'bad', width: 4, label: '(0, 1)', labelAt: 1, labelDx: 6, labelDy: 4 }], points: [{ x: 0, y: 3, r: 4, color: 'gold' }, { x: 1, y: 3, r: 4, color: 'gold', hollow: true }, { x: 0, y: 1, r: 4, color: 'bad', hollow: true }, { x: 1, y: 1, r: 4, color: 'bad', hollow: true }, { x: 0.5, y: 2, r: 4.5, color: 'teal', hollow: true, label: 'ℝ ∖ {½}', labelDx: 8, labelDy: -10 }], vlines: [{ x: 0, color: 'ink3' }] }, caption: 'Four of the candidate sets drawn on copies of the line (hollow dots are excluded endpoints or points). The rationals, the fifth, cannot be drawn: they have gaps everywhere.' },
      choices: [t`$[-1, 1]$`, t`$\mathbb R \setminus \{\tfrac12\}$`, t`$[0, 1)$`, t`$(0, 1)$`, t`$\mathbb Q$, the rational numbers`],
      answer: [0, 1],
      why: {
        2: t`It contains $0$ but no open interval round $0$: every $(-\delta, \delta)$ pokes out to the left.`,
        3: t`It does not contain $0$ at all.`,
        4: t`It contains $0$ but no interval: every interval contains irrationals.`,
      },
      hints: [t`$N$ is a neighbourhood of $0$ if some open interval $(-\delta, \delta)$ fits inside $N$.`, t`A neighbourhood need not be open itself, and removing a point far from $0$ does no harm.`],
      teach: 'A neighbourhood of p need not be open; it only has to contain some open set around p.',
      explain: t`$(-1, 1) \subset [-1, 1]$ and $(-\tfrac12, \tfrac12) \subset \mathbb R \setminus \{\tfrac12\}$. A closed set can be a neighbourhood; a set with $p$ on its edge cannot.`,
    }),
    num({
      id: 'eps-delta', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 4, 5, -2, -4]), b = r.int(-2, 3), eps = r.pick([0.3, 0.6, 0.9, 1.2]);
        const ans = eps / Math.abs(m), x0 = 1;
        return {
          prompt: t`For $f(x) = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$ at $x_0 = ${x0}$, the open interval $V = (f(x_0) - ${eps},\ f(x_0) + ${eps})$ has preimage $(x_0 - \delta, x_0 + \delta)$. Find $\delta$.`,
          visual: band(`${m}*x + ${b}`, [-0.5, 2.5], [Math.min(m * -0.5, m * 2.5) + b, Math.max(m * -0.5, m * 2.5) + b], r6(m + b - eps), r6(m + b + eps), t`The line and the band of width $2\varepsilon = ${2 * eps}$ about $f(${x0})$.`, { points: [{ x: x0, y: m + b, r: 4, color: 'ink', label: 'f(x₀)' }] }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: eps * Math.abs(m), feedback: t`You multiplied by the slope. A steep line leaves the band quickly, so $\delta$ is $\varepsilon$ *divided* by $|${m}|$.` }, { value: eps, feedback: t`That would be right for slope $\pm1$. Here the slope is $${m}$.` }],
          hints: [t`$|f(x) - f(x_0)| = |${m}|\,|x - x_0|$.`, t`$|${m}|\,|x - x_0| < ${eps}$ exactly when $|x - x_0| < ${eps}/${Math.abs(m)}$.`],
          teach: 'The ε–δ definition is the open-set definition in a metric space: the preimage of every ε-interval round f(x₀) contains a δ-interval round x₀.',
          explain: t`$\delta = ${eps}/${Math.abs(m)} = ${nice(ans, 4)}$. For a line the preimage is exactly the $\delta$-interval; for a curve it is merely guaranteed to contain one.`,
        };
      },
    }),
    mcq({
      id: 'discrete', difficulty: 3,
      prompt: t`Give the integers $\mathbb Z$ the **discrete** topology, in which every subset is open. Which functions $f: \mathbb Z \to \mathbb R$ are continuous?`,
      visual: { type: 'graph', params: { x: [-5.5, 5.5], y: [-2.5, 2.5], aspect: 'wide', xlabel: 'n', ylabel: 'f(n)', points: [[-5, 1.2], [-4, -2], [-3, 0.4], [-2, 2.1], [-1, -0.7], [0, 0.1], [1, 1.8], [2, -1.4], [3, 0.9], [4, -0.2], [5, 2]].map(([x, y]) => ({ x, y, r: 4, color: 'accent' })) }, caption: 'An arbitrary function on the integers: values chosen with no pattern at all.' },
      choices: ['Every function', 'Only the constant functions', 'Only those that change by less than 1 between neighbouring integers', 'Only the injective ones'],
      answer: 0,
      why: {
        1: 'Constant functions are continuous for any topology, but so is everything else here: check a preimage.',
        2: 'That smuggles in a metric idea of “small change”. With the discrete topology every preimage is open, whatever the jumps.',
        3: 'Injectivity has nothing to do with continuity; the preimage test does not care.',
      },
      hints: [t`Continuity asks whether $f^{-1}(V)$ is open for each open $V$.`, t`In the discrete topology, which subsets of $\mathbb Z$ are open?`],
      teach: 'Continuity depends on the topologies chosen: from a discrete space every function is continuous, because every preimage is open.',
      explain: t`Every subset of $\mathbb Z$ is open, so every preimage is open, so every $f$ is continuous. The opposite extreme — the topology $\{\varnothing, X\}$ on the target — also makes every map into it continuous. Topology is a choice; physics picks the one its charts give.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-interval-ball', difficulty: 3, transfer: true,
      prompt: t`In 1+1 Minkowski spacetime ($c = 1$), someone tries to make “balls” from the interval: $N_\varepsilon = \{(t, x) : |{-t^2} + x^2| < \varepsilon\}$ about the origin. What goes wrong?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-2.5, 2.5], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 }, { param: ['0.5*sinh(t)', '0.5*cosh(t)'], t: [-2.5, 2.5], color: 'accent', width: 1.6 }, { param: ['0.5*sinh(t)', '-0.5*cosh(t)'], t: [-2.5, 2.5], color: 'accent', width: 1.6 }, { param: ['0.5*cosh(t)', '0.5*sinh(t)'], t: [-2.5, 2.5], color: 'accent', width: 1.6 }, { param: ['-0.5*cosh(t)', '0.5*sinh(t)'], t: [-2.5, 2.5], color: 'accent', width: 1.6 }], points: [{ x: 0, y: 0, r: 3.5, label: 'O' }] }, caption: t`The four hyperbolae $-t^2 + x^2 = \pm\varepsilon$ with $\varepsilon = 0.25$ (blue) bound $N_\varepsilon$; the light cone is dashed.` },
      choices: [t`$N_\varepsilon$ contains events arbitrarily far away along the light cone, however small $\varepsilon$ is, so these sets never shrink to the point; spacetime’s topology comes from its charts instead`, t`Nothing: $N_\varepsilon$ is a small disc about the origin, just like a Euclidean ball`, t`$N_\varepsilon$ is empty, because the interval can be negative`, t`$N_\varepsilon$ is the light cone itself, a closed set`],
      answer: 0,
      why: {
        1: t`Look along the light cone: $(t, x) = (10^6, 10^6)$ has interval $0 < \varepsilon$. The region hugs the whole cone.`,
        2: t`The absolute value makes the condition sensible; it holds near the light cone, which is far from empty.`,
        3: t`It is the open region *around* the light cone (between the hyperbolae), not the cone alone.`,
      },
      hints: [t`Which events have interval exactly $0$ from the origin?`, t`Is the event $(t, x) = (1000, 1000)$ in $N_\varepsilon$?`],
      teach: 'A Lorentzian interval is not a distance: it vanishes along the light cone, so it cannot define small neighbourhoods; the manifold topology of spacetime is the ordinary one of ℝ⁴ carried by the charts.',
      explain: t`Every event on the light cone has interval $0$, so $N_\varepsilon$ contains the whole cone and a sliver round it, reaching to infinity. That is why a spacetime is first a manifold, with the topology of its charts ($\mathbb R^4$ balls in coordinates), and only then given a metric — and why “close in spacetime interval” never means “close”.`,
    }),
    num({
      id: 'cp-throttle', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([6.5, 8.5, 9.8, 12]), eps = r.pick([15, 20, 25, 40]);
        const ans = eps / k;
        return {
          prompt: t`A test-stand engine’s thrust rises with throttle setting $s$ as $F = F_0 + ks$, with $k = ${k}\ \text{kN}$ per percent of throttle. The test card requires thrust within $\pm${eps}\ \text{kN}$ of the target. Within how many percent of its set point must the throttle be held — the $\delta$ for this $\varepsilon$?`,
          visual: band(`${k}*x`, [40, 80], [40 * k, 80 * k], 60 * k - eps, 60 * k + eps, t`Thrust (kN, above $F_0$) against throttle (%), with the allowed band of $\pm${eps}\ \text{kN}$ about the set point at $60\%$.`, { xlabel: 'throttle (%)', ylabel: 'thrust − F₀ (kN)', points: [{ x: 60, y: 60 * k, r: 4, color: 'ink' }] }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: eps * k, feedback: 'You multiplied. The tolerance on s is the thrust tolerance divided by the thrust per percent.' }, { value: 2 * ans, feedback: 'That is the full width of the window. The question asks for the ± half-width δ.' }],
          hints: [t`$|F(s) - F(s_0)| = k|s - s_0|$.`],
          teach: 'An engineering tolerance is an ε–δ statement: hold the input within δ and the output stays within ε.',
          explain: t`$\delta = ${eps}/${k} = ${nice(ans, 3)}\ \%$. A real throttle curve is not straight, so its $\delta$ is set by the steepest part of the curve near the set point.`,
        };
      },
    }),
    num({
      id: 'cp-square-in-disc', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([5, 8, 12, 20, 30]);
        const ans = R / Math.SQRT2;
        return {
          prompt: t`A launch range keeps a circular exclusion zone of radius $${R}\ \text{km}$ round the pad. Its radar tracks objects in square boxes $\max(|\Delta x|, |\Delta y|) < h$. What is the largest half-width $h$ of a box centred on the pad that lies inside the zone?`,
          visual: { type: 'graph', params: { x: [-1.9 * R, 1.9 * R], y: [-1.15 * R, 1.15 * R], equal: true, aspect: 'wide', xlabel: 'east (km)', ylabel: 'north (km)', curves: [circle(R)], points: [{ x: 0, y: 0, r: 4, label: 'pad' }] }, caption: t`The exclusion zone (blue), radius $${R}\ \text{km}$. The square is yours to fit.` },
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: R, feedback: 'A square of half-width R pokes out at its corners, which are R√2 from the pad.' }, { value: R / 2, feedback: 'That square fits but is not the largest: its corners are only R/√2 away.' }],
          hints: [t`The square’s corners are the points farthest from the centre.`, t`A corner at $(h, h)$ is $h\sqrt2$ from the pad.`],
          teach: 'Max-metric balls fit inside Euclidean ones with radius divided by √2: the two metrics differ by bounded factors, so they share their open sets.',
          explain: t`$h\sqrt2 = ${R}$, so $h = ${nice(ans, 4)}\ \text{km}$. The inequality $d_2 \le \sqrt2\,d_\infty$ is all the example proof needed.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Munkres, Topology, 2nd ed. (Prentice Hall, 2000), §§12–13, 18 (topologies, bases, continuity)', url: 'https://openlibrary.org/isbn/9780131816299' },
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §2.2 (manifolds and their topology)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
