// Examples of manifolds: the spheres (two stereographic charts), the torus as
// a square with opposite edges glued (charts are small squares, transitions
// are translations), straight lines on it closing up or winding densely, the
// other gluings (cylinder, Möbius band, Klein bottle), level sets, and
// Minkowski spacetime as the manifold ℝ⁴ — with Rindler and light-cone
// charts — whose metric is extra structure.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const YR = 365.25 * 86400, C = 299792458, LY = C * YR;

/** Segments of the line t ↦ (p t, q t) mod 1 for 0 ≤ t ≤ T, as graph curves in the unit square. */
function wrapped(p, q, T = 1, { color = 'gold', width = 2.2 } = {}) {
  const cuts = new Set([0, T]);
  for (let k = 1; k < p * T + 1; k++) if (k / p < T) cuts.add(k / p);
  for (let k = 1; k < q * T + 1; k++) if (k / q < T) cuts.add(k / q);
  const ts = [...cuts].sort((a, b) => a - b), out = [];
  for (let i = 0; i + 1 < ts.length; i++) {
    const a = ts[i], b = ts[i + 1];
    if (b - a < 1e-9) continue;
    const m = (a + b) / 2, ox = Math.floor(p * m), oy = Math.floor(q * m);
    out.push({ param: [`${p}*t - ${ox}`, `${q}*t - ${oy}`], t: [r6(a), r6(b)], color, width });
  }
  return out;
}
// the square [0, 1]² with its edges marked for gluing: each pair gets its colour and direction
function square({ lr = 'same', tb = 'same', extra = [], caption, points = [] } = {}) {
  const arrows = [];
  const mid = (a, b) => [r6(a[0] + 0.55 * (b[0] - a[0])), r6(a[1] + 0.55 * (b[1] - a[1]))];
  const edge = (a, b, color) => arrows.push({ from: a, to: mid(a, b), color, width: 2.6 });
  const curves = [{ param: ['t', '0'], t: [0, 1], color: tb ? 'violet' : 'ink3', width: tb ? 2.4 : 1.4 }, { param: ['t', '1'], t: [0, 1], color: tb ? 'violet' : 'ink3', width: tb ? 2.4 : 1.4 }, { param: ['0', 't'], t: [0, 1], color: lr ? 'gold' : 'ink3', width: lr ? 2.4 : 1.4 }, { param: ['1', 't'], t: [0, 1], color: lr ? 'gold' : 'ink3', width: lr ? 2.4 : 1.4 }];
  if (lr) { edge([0, 0], [0, 1], 'gold'); lr === 'same' ? edge([1, 0], [1, 1], 'gold') : edge([1, 1], [1, 0], 'gold'); }
  if (tb) { edge([0, 0], [1, 0], 'violet'); tb === 'same' ? edge([0, 1], [1, 1], 'violet') : edge([1, 1], [0, 1], 'violet'); }
  return { type: 'graph', params: { x: [-0.35, 1.35], y: [-0.12, 1.12], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [...curves, ...extra], arrows, points }, caption };
}

// the explore: a flat sheet rolled into a tube, then bent into a ring (R = 2, r = 0.8)
const A = 'max(min(1, 2*s), 0.001)', B = 'max(2*s - 1, 0.001)';
const morph = (u, v) => {
  const Y = `(0.8/${A})*sin(${A}*(${v}))`, Z = `(0.8/${A})*(1 - cos(${A}*(${v})))`;
  return [`(2/${B} + ${Y})*sin(${B}*(${u}))`, `-2/${B} + (2/${B} + ${Y})*cos(${B}*(${u}))`, Z];
};
const PI = r6(Math.PI);

export default lesson({
  id: 'st-c.C8.3',
  title: 'Examples: spheres, tori and spacetime',
  minutes: 14, difficulty: 3,
  intro: t`Three families of manifolds carry most of this course.

- **Spheres** $S^n$: all points at distance 1 from the origin in $\mathbb R^{n+1}$. Two stereographic charts cover each one (C8.1); one chart never can.
- **Tori**: the square $[0, 1]^2$ with opposite edges glued, so that leaving through the right edge brings you back on the left, and leaving through the top brings you back at the bottom. In symbols, points of the plane are identified when they differ by whole numbers:

$$(x, y) \sim (x + m,\ y + n), \qquad m, n \in \mathbb Z.$$

A chart is any small open square, read off in the plane; where two overlap the transition is a translation by whole numbers — as smooth as maps get.
- **Spacetime**: as a manifold, Minkowski spacetime is just $\mathbb R^4$, covered by one chart $(t, x, y, z)$. Other charts — spherical, light-cone, Rindler — are just as legitimate. The light cones, the clocks and the rulers come from a **metric**, extra structure added in C11.`,
  symbols: [
    { tex: '(x, y)', text: 'a point of the plane, standing for a point of the torus' },
    { tex: t`\sim`, text: 'is identified with: the two points of the plane are the same point of the torus' },
    { tex: 'm,\\ n', text: t`any integers: how many times you have gone round each way` },
    { tex: t`\mathbb Z`, text: 'the integers …, −2, −1, 0, 1, 2, …' },
  ],
  why: t`The torus shows that a manifold need not sit inside anything: the flat torus can be built from a square, though no smooth surface in $\mathbb R^3$ has its geometry. Spacetime is the same: it is defined by its charts and gluing, and its curvature (C15) is measured from inside.`,
  visual: {
    type: 'surface3d',
    title: 'Gluing a square into a torus',
    lead: t`A rectangle with its opposite edges marked: the gold edges $u = \pm\pi$ and the violet edges $v = \pm\pi$. The slider first rolls it so the violet edges meet (a cylinder), then bends the cylinder so the gold edges meet (a torus). The red line is a straight line on the sheet.`,
    tasks: [
      t`Halfway, the sheet is a cylinder: the violet edges have met. A walk off the top now comes back at the bottom.`,
      t`At the end the gold edges meet too. The straight red line has become a closed loop winding once round each way — the same curve the square drawing would show as a diagonal.`,
      t`Notice the stretching: the inner rim of the ring is shorter than the outer. The gluing itself is exact, but no surface in space can do it without distorting the square’s lengths.`,
    ],
    params: {
      surface: morph('u', 'v'), domain: [[-PI, PI], [-PI, PI]], n: 40, alpha: 0.75, axes: false, colorBy: false,
      sliders: [{ key: 's', label: 'glue', min: 0, max: 1, step: 0.01, value: 0.3, explain: '0: the flat sheet. 0.5: rolled into a cylinder (violet edges glued). 1: bent into a torus (gold edges glued too).' }],
      curves: [
        { param: morph('-3.1416', 't'), t: [-PI, PI], color: 'gold', width: 3 },
        { param: morph('3.1416', 't'), t: [-PI, PI], color: 'gold', width: 3 },
        { param: morph('t', '-3.1416'), t: [-PI, PI], color: 'violet', width: 3 },
        { param: morph('t', '3.1416'), t: [-PI, PI], color: 'violet', width: 3 },
        { param: morph('t', 't'), t: [-PI, PI], color: 'bad', width: 2.4 },
      ],
      yaw: 0.15, pitch: 0.65, dist: 15, target: [0, -1, 0.6],
    },
    caption: t`The torus $\big((2 + 0.8\sin v)\sin u,\ (2 + 0.8\sin v)\cos u - 2,\ 0.8(1 - \cos v)\big)$, reached through a cylinder of radius 0.8. The flat sheet is $4\pi$ by $1.6\pi$; the bending stretches its outer part and squeezes its inner part.`,
  },
  example: {
    prompt: t`On the square torus $[0, 1)^2$, follow the straight line from $(0, 0)$ in the direction $(2, 3)$, wrapping through the glued edges. When does it close up, how many times does it cross each glued edge, and how long is it if the square has side $L$?`,
    visual: square({ extra: wrapped(2, 3), points: [{ x: 0, y: 0, color: 'gold', label: 'start', labelDx: -46, labelDy: 6 }], caption: t`The line of slope $3/2$ drawn in the square: four straight pieces, joined through the glued edges.` }),
    steps: [
      { label: 'Unwrap', text: t`In the plane the line is $(2t, 3t)$. A point of the plane is the starting point of the torus exactly when both coordinates are whole numbers.` },
      { label: 'Close', text: t`$2t$ and $3t$ are both integers first at $t = 1$ (since 2 and 3 share no factor), at $(2, 3)$. So the loop closes after going **2 times round** one way and **3 times round** the other.` },
      { label: 'Count crossings', text: t`It crosses the vertical glued edge at $t = \tfrac12$ and at $t = 1$ (the closing point): 2 crossings. The horizontal edge at $t = \tfrac13, \tfrac23, 1$: 3 crossings. Between crossings it runs in $2 + 3 - 1 = 4$ straight pieces.` },
      { label: 'Length', text: t`Unwrapped, it is the segment from $(0, 0)$ to $(2L, 3L)$: length $L\sqrt{2^2 + 3^2} = L\sqrt{13} \approx 3.61\,L$.` },
      { label: 'Sense check', text: t`On the doughnut in space this loop winds 2 times round the hole and 3 times round the tube — it is a trefoil knot. With an irrational slope it would never close, coming arbitrarily close to every point of the torus.` },
    ],
    answer: t`It closes at $(2, 3)$ after crossing the vertical edge twice and the horizontal edge three times, in 4 straight pieces; its length is $\sqrt{13}\,L \approx 3.61\,L$.`,
  },
  practice: [
    mcq({
      id: 'gluing', difficulty: 2,
      gen(r) {
        const k = r.int(0, 3);
        const specs = [{ lr: 'same', tb: 'same' }, { lr: 'same', tb: null }, { lr: 'flip', tb: null }, { lr: 'same', tb: 'flip' }];
        const desc = ['both pairs of opposite edges, arrows matching', 'only the left and right edges, arrows matching', 'only the left and right edges, arrows opposite', 'left and right with arrows matching, top and bottom with arrows opposite'];
        return {
          prompt: t`Glue the edges of a square as marked: same-coloured edges are glued with their arrows lined up (here: ${desc[k]}). Which surface results?`,
          visual: square({ ...specs[k], caption: 'Edges with arrows of the same colour are glued so the arrows agree; grey edges are left free.' }),
          choices: ['a torus', 'a cylinder', 'a Möbius band', 'a Klein bottle'],
          answer: k,
          why: Object.fromEntries([
            'A torus glues both pairs, both with matching arrows.',
            'A cylinder glues one pair only, with matching arrows; the other two edges stay free as its two rims.',
            'A Möbius band glues one pair only, with a half twist: the arrows point opposite ways.',
            'A Klein bottle glues both pairs, one of them with a twist.',
          ].map((w, i) => [i, w]).filter(([i]) => i !== k)),
          hints: ['First count the pairs that are glued: one pair leaves a surface with an edge, two pairs a closed one.', 'Then check each glued pair: opposite arrows mean a half twist before gluing.'],
          teach: 'Gluing a square’s edges gives a cylinder or Möbius band (one pair) or a torus or Klein bottle (two pairs), depending on whether the arrows agree.',
          explain: [t`Both pairs glued straight: the torus, $(x, y) \sim (x + m, y + n)$.`, 'One pair glued straight: a tube, the cylinder, with two circular rims.', 'One pair glued with a half twist: the Möbius band, with one edge and one side.', 'Both pairs glued, one with a twist: the Klein bottle, a closed one-sided surface that cannot sit in ℝ³ without crossing itself — yet it is a perfectly good abstract 2-manifold.'][k],
        };
      },
    }),
    num({
      id: 'torus-closing', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 2], [3, 1], [2, 5], [3, 4], [4, 3], [5, 2]]);
        const ask = r.pick(['vertical', 'pieces']);
        const ans = ask === 'vertical' ? p : p + q - 1;
        return {
          prompt: ask === 'vertical' ? t`On the square torus, a straight line leaves $(0, 0)$ in the direction $(${p}, ${q})$. How many times does it cross the glued **left–right** edge before it first returns to $(0, 0)$ (count the return itself)?` : t`On the square torus, a straight line leaves $(0, 0)$ in the direction $(${p}, ${q})$. Drawn in the square, into how many straight pieces is the closed loop cut?`,
          visual: square({ extra: [{ param: [`${p}*t`, `${q}*t`], t: [0, r6(Math.min(1 / p, 1 / q))], color: 'gold', width: 2.2 }], points: [{ x: 0, y: 0, color: 'gold', label: 'start', labelDx: -46, labelDy: 6 }], caption: 'The first straight piece of the line, up to where it first meets a glued edge.' }),
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: ask === 'vertical' ? [{ value: q, feedback: `That is the number of crossings of the top–bottom edge; the left–right edge is crossed each time x passes a whole number.` }] : [{ value: p + q, feedback: 'The last crossing is the return to the start, which ends the loop rather than starting a new piece.' }],
          hints: [t`Unwrapped, the line is $(${p}t, ${q}t)$; it closes when both coordinates are first whole numbers.`, ask === 'vertical' ? t`$x = ${p}t$ passes a whole number ${p} times for $0 < t \le 1$.` : t`Count the crossings of each edge (${p} and ${q}); the pieces are separated by all crossings except the final return.`],
          teach: 'A straight line of rational slope q/p on the square torus closes after p turns one way and q the other.',
          explain: ask === 'vertical' ? t`$x = ${p}t$ is a whole number at $t = ${Array.from({ length: p }, (_, i) => (i + 1 === p ? '1' : t`\tfrac{${i + 1}}{${p}}`)).join(',\ ')}$: ${p} crossings. The top–bottom edge is crossed ${q} times.` : t`It crosses the left–right edge ${p} times and the top–bottom edge ${q} times (both at the return), so ${p} + ${q} − 1 = ${ans} pieces.`,
        };
      },
    }),
    num({
      id: 'rindler', difficulty: 2,
      gen(r) {
        const [tt, x] = r.pick([[1, 2], [0.6, 1], [-1, 3], [2, 2.5], [1.2, 1.3]]);
        const rho = Math.sqrt(x * x - tt * tt);
        return {
          prompt: t`Rindler coordinates $(\eta, \rho)$ chart the wedge $x > |t|$ of two-dimensional Minkowski spacetime (with $c = 1$): $t = \rho\sinh\eta$, $x = \rho\cosh\eta$. Find $\rho$ for the event $(t, x) = (${tt}, ${x})$.`,
          visual: { type: 'graph', params: { x: [-0.5, 3.5], y: [-2.2, 2.2], equal: true, aspect: 'wide', xticks: 5, yticks: 5, xlabel: 'x', ylabel: 't', shade: [{ fn: 'x', lower: '-x', from: 0, to: 7, color: 'teal', alpha: 0.14 }], curves: [{ fn: 'x', domain: [0, 7], color: 'gold', width: 1.6 }, { fn: '-x', domain: [0, 7], color: 'gold', width: 1.6 }], points: [{ x, y: tt, color: 'accent', label: 'event' }] }, caption: 'The Rindler wedge x > |t| (teal), bounded by light rays, and the event.' },
          answer: rho, tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(x * x + tt * tt), feedback: t`$\cosh^2 - \sinh^2 = 1$, so $x^2 - t^2 = \rho^2$: subtract, don’t add.` }],
          hints: [t`$x^2 - t^2 = \rho^2(\cosh^2\eta - \sinh^2\eta)$.`],
          teach: 'Rindler’s ρ is the Minkowski distance from the corner of the wedge: ρ² = x² − t².',
          explain: t`$\rho = \sqrt{${nice(x * x)} - ${nice(tt * tt)}} = ${nice(rho, 4)}$ (and $\eta = \operatorname{artanh}(t/x) = ${nice(Math.atanh(tt / x), 4)}$). Curves of constant $\rho$ are hyperbolae — the worldlines of uniformly accelerating observers. The chart covers only the wedge: a perfectly good chart need not cover the manifold.`,
        };
      },
    }),
    mcq({
      id: 'manifold-metric', difficulty: 2,
      prompt: t`As a smooth manifold, Minkowski spacetime is just $\mathbb R^4$. What has to be **added** to make it spacetime, with light cones and clocks?`,
      visual: { type: 'spacetime', params: { beta: 0.5, events: [[2, 1], [3, -1.5]], range: 4, simultaneity: false, hyperbolae: true }, caption: 'A spacetime diagram: light cones, a moving observer’s axes and hyperbolae of constant interval. All of this comes from the metric.' },
      choices: [
        t`A metric, $ds^2 = -dt^2 + dx^2 + dy^2 + dz^2$ (with $c = 1$), assigning an interval to every displacement`,
        t`A preferred chart $(t, x, y, z)$`,
        'A smooth structure',
        'A topology',
      ],
      answer: 0,
      why: {
        1: 'Charts are labels; any compatible chart is as good as another, and the light cones look different in each.',
        2: t`$\mathbb R^4$ already has its smooth structure — that is what makes it a manifold — but smoothness knows nothing of time or distance.`,
        3: 'The topology is already there and is the same as Euclidean ℝ⁴. It cannot tell a timelike direction from a spacelike one.',
      },
      hints: ['What tells you whether a displacement is timelike, null or spacelike?'],
      teach: 'A manifold has points, open sets and smooth charts; lengths, durations and light cones come from a metric added on top.',
      explain: t`The metric $\eta$ (C11) turns $\mathbb R^4$ into Minkowski spacetime. The same manifold $\mathbb R^4$ with a different metric is a different spacetime — and general relativity is the study of which metrics nature picks.`,
    }),
    num({
      id: 'level-dim', difficulty: 2,
      gen(r) {
        const [eq, n, name, curve] = r.pick([
          [t`x^2 + y^2 + z^2 + w^2 = 1\ \text{in}\ \mathbb R^4`, 3, 'the 3-sphere', 'circle'],
          [t`-t^2 + x^2 + y^2 + z^2 + w^2 = 1\ \text{in 5-dimensional Minkowski space}`, 4, 'de Sitter spacetime', 'hyper'],
          [t`-t^2 + x^2 + y^2 = -1,\ t > 0\ \text{in 3-dimensional Minkowski space}`, 2, 'the hyperbolic plane', 'hyper2'],
          [t`x^2 + y^2 = 1\ \text{in}\ \mathbb R^3`, 2, 'an infinite cylinder', 'circle'],
        ]);
        const curves = curve === 'circle' ? [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'accent', width: 2.4 }] : curve === 'hyper' ? [{ param: ['cosh(t)', 'sinh(t)'], t: [-1.4, 1.4], color: 'accent', width: 2.4 }, { param: ['-cosh(t)', 'sinh(t)'], t: [-1.4, 1.4], color: 'accent', width: 2.4 }] : [{ param: ['sinh(t)', 'cosh(t)'], t: [-1.4, 1.4], color: 'accent', width: 2.4 }];
        return {
          prompt: t`A level set $F = c$ in $\mathbb R^N$, where $\nabla F \ne 0$ at every point of it, is a smooth manifold of dimension $N - 1$. What is the dimension of ${name}, $${eq}$?`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-2, 2], equal: true, aspect: 'wide', xticks: 5, yticks: 5, xlabel: curve === 'circle' ? 'x' : 'x', ylabel: curve === 'circle' ? 'y' : 't', curves }, caption: curve === 'circle' ? 'A slice through the set by a coordinate plane: a circle.' : 'A slice through the set by the t–x plane: hyperbola branches.' },
          answer: n, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n + 1, feedback: 'One equation removes one dimension: the level set has one dimension fewer than the space it sits in.' }, { value: n - 1, feedback: 'Count the coordinates of the surrounding space, then subtract one for the single equation.' }],
          hints: ['Count the coordinates of the surrounding space.', 'One equation with a nonzero gradient cuts the dimension by one.'],
          teach: 'A level set of one function with nonzero gradient is a manifold one dimension lower than the space around it (regular value theorem).',
          explain: t`${n + 1} coordinates, one equation: dimension ${n}. ${name === 'de Sitter spacetime' ? 'De Sitter spacetime, a model of a universe dominated by a cosmological constant, is a 4-dimensional manifold built exactly this way.' : name === 'the hyperbolic plane' ? 'This sheet of the hyperboloid, with the metric it inherits, is the hyperbolic plane — constant negative curvature.' : 'The surrounding space is only a convenient way to build it; the manifold itself needs only charts.'}`,
        };
      },
    }),
    order({
      id: 'torus-atlas', difficulty: 3,
      prompt: t`Show that the square torus $\mathbb R^2/{\sim}$, with $(x, y) \sim (x + m, y + n)$, is a smooth 2-manifold. Order the steps.`,
      visual: square({ extra: [{ param: ['0.86 + 0.1*cos(t)', '0.5 + 0.1*sin(t)'], t: [-1.57, 1.57], color: 'teal', width: 2 }, { param: ['-0.14 + 0.1*cos(t)', '0.5 + 0.1*sin(t)'], t: [-1.57, 1.57], color: 'teal', width: 2 }, { param: ['0.86 + 0.1*cos(t)', '0.5 + 0.1*sin(t)'], t: [1.57, 4.71], color: 'teal', width: 2 }], caption: 'A small disc around a point near the right edge: the part that pokes out reappears at the left. In the plane it is one disc.' }),
      items: [
        t`Around any point, take an open square of side less than 1 in the plane; no two of its points are identified, so it maps one-to-one onto an open patch of the torus.`,
        t`Its coordinates $(x, y)$ give a chart, and finitely many such squares cover the torus.`,
        t`Where two patches overlap, a point’s two coordinate pairs differ by whole numbers: the transition map is $(x, y) \mapsto (x + m, y + n)$ on each piece of the overlap.`,
        t`Translations are smooth with smooth inverses, so the atlas is smooth (and the space is Hausdorff, since distinct points have disjoint small squares around them).`,
      ],
      hints: ['Start by building one chart; then see what changes between charts.', 'The only freedom in reading off coordinates is adding whole numbers.'],
      teach: 'The torus is a smooth manifold whose transition maps are translations by whole numbers.',
      explain: t`Because translations preserve lengths and angles too, the flat metric $dx^2 + dy^2$ of the plane passes to the torus unchanged: the **flat torus**, with zero curvature everywhere. The doughnut in $\mathbb R^3$ has the same topology but a different, curved, metric (C6.4: its curvature integrates to 0).`,
    }),
    num({
      id: 'lightcone-coords', difficulty: 2,
      gen(r) {
        const [u, v] = r.pick([[1, 3], [-1, 2], [2, 4], [-2, -0.5], [0.5, 3.5]]);
        const tt = (u + v) / 2, x = (v - u) / 2;
        const ask = r.pick(['t', 'x']);
        return {
          prompt: t`Light-cone coordinates on two-dimensional Minkowski spacetime ($c = 1$) are $u = t - x$ and $v = t + x$. An event has $(u, v) = (${u}, ${v})$. What is its ${ask === 't' ? t`time coordinate $t$` : t`position $x$`}?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 4], equal: true, aspect: 'wide', xticks: 7, yticks: 7, xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'gold', width: 1.4, label: 'u = 0', labelAt: 2.3, labelDx: 6 }, { fn: '-x', color: 'gold', width: 1.4, label: 'v = 0', labelAt: -1.8, labelDx: -46 }] }, caption: 'The lines u = 0 and v = 0 are light rays; the u and v coordinate lines are all at 45°.' },
          answer: ask === 't' ? tt : x, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: ask === 't' ? x : tt, feedback: ask === 't' ? t`That is $x = (v - u)/2$. Adding the two gives $t$: $u + v = 2t$.` : t`That is $t = (u + v)/2$. Subtracting gives $x$: $v - u = 2x$.` }, { value: ask === 't' ? u + v : v - u, feedback: 'Divide by 2.' }].filter((e) => Math.abs(e.value - (ask === 't' ? tt : x)) > 0.01),
          hints: ['Add and subtract the two definitions.', ask === 't' ? 'u + v = 2t.' : 'v − u = 2x.'],
          teach: 'Light-cone coordinates are another linear chart on Minkowski spacetime; t = (u + v)/2 and x = (v − u)/2.',
          explain: t`$${ask} = ${nice(ask === 't' ? tt : x)}$. The transition $(t, x) \mapsto (u, v)$ is linear with Jacobian determinant 2 — smooth both ways, so the chart is compatible. In it the metric reads $ds^2 = -du\,dv$: the same spacetime, written differently.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ground-track', difficulty: 3, transfer: true,
      gen(r) {
        const [name, N, D] = r.pick([['Landsat 8', 233, 16], ['Sentinel-2A', 143, 10], ['a hypothetical imaging satellite', 29, 2], ['a hypothetical weather satellite', 57, 4]]);
        const perDay = N / D;
        return {
          prompt: t`A sun-synchronous satellite’s state relative to the ground is two angles — how far round its orbit it is, and how far the Earth beneath has turned — a point on a torus. Its ground track repeats when both angles complete whole turns together. ${name} completes $${nice(perDay, 7)}$ orbits per day. After how many days does the track first repeat? (The ratio is exact.)`,
          visual: { type: 'graph', params: { x: [-0.35, 1.35], y: [-0.12, 1.12], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [...wrapped(1, perDay, 1, { color: 'gold', width: 1.4 }), { param: ['t', '0'], t: [0, 1], color: 'violet', width: 2.4 }, { param: ['t', '1'], t: [0, 1], color: 'violet', width: 2.4 }, { param: ['0', 't'], t: [0, 1], color: 'teal', width: 2.4 }, { param: ['1', 't'], t: [0, 1], color: 'teal', width: 2.4 }], points: [{ x: 0.5, y: -0.08, r: 0, label: 'Earth’s turn (one day across)', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: -0.2, y: 0.5, r: 0, label: 'orbit', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: 'One day of the satellite’s state on the torus of (Earth angle, orbit angle). Teal edges are glued, as are violet ones.' },
          answer: D, units: 'day', tol: { rel: 0, abs: 0.4 },
          errors: [{ value: N, feedback: 'That is the number of orbits in one repeat cycle. The question asks for days.' }, { value: 1, feedback: 'After one day the orbit angle has made a whole number of turns only if the orbits per day are a whole number.' }],
          hints: [t`Write the orbits per day as a fraction in lowest terms, $N/D$.`, t`$${nice(perDay, 7)} = ${N}/${D}$: the line of slope ${N}/${D} closes after $D$ turns of the Earth.`],
          teach: 'A repeating ground track is a closed straight line on the torus of (Earth angle, orbit angle): slope N/D in lowest terms closes after D days and N orbits.',
          explain: t`$${nice(perDay, 7)} = ${N}/${D}$ in lowest terms, so the track closes after $${D}$ days and $${N}$ orbits — exactly the closing condition for a line of rational slope on the torus. An irrational ratio would never repeat, eventually passing over every point of the band the orbit covers.`,
        };
      },
    }),
    mcq({
      id: 'cp-sphere-torus', difficulty: 2,
      prompt: t`The sphere and the torus are both compact, connected 2-manifolds. Which observation proves they are **not** the same manifold (not homeomorphic)?`,
      visual: square({ extra: [{ param: ['0.5', 't'], t: [0, 1], color: 'teal', width: 2.4 }], caption: 'On the torus, the loop x = 1/2 (teal) runs once round through the glued top and bottom edges.' }),
      choices: [
        'On the torus some loops cannot be shrunk to a point without leaving the surface; on the sphere every loop can',
        'The torus has a hole in the middle you can see in space',
        'The torus has a larger area',
        'The sphere needs two charts and the torus needs only one',
      ],
      answer: 0,
      why: {
        1: 'The hole is in the space around the doughnut. The abstract torus — the glued square — sits in nothing, yet it is still not a sphere.',
        2: 'Area needs a metric; topology cannot see it, and either surface can be given any area.',
        3: 'The torus is compact, so it needs at least two charts too (C8.1’s argument).',
      },
      hints: ['The difference must be topological: no lengths, no surrounding space.', 'Try shrinking the teal loop to a point while staying on the torus.'],
      teach: 'Whether every loop can be shrunk to a point is a topological property: true on the sphere, false on the torus.',
      explain: t`The loop $x = \tfrac12$ goes once round; shrinking it would change how many times it goes round, which can only jump, not slide. On the sphere any loop slides off over the other side. (Equivalently, Euler characteristics $2$ and $0$ differ — C6.4.)`,
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([1, 2, 3, 5]);
        const g = 9.81, rho = C * C / g, eta = (g * tau * YR) / C;
        const dist = (rho * (Math.cosh(eta) - 1)) / LY;
        return {
          prompt: t`A rocket keeps a constant proper acceleration $g = 9.81\ \text{m/s}^2$ from rest. In Rindler coordinates its worldline is $\rho = c^2/g$ (constant), and its rapidity $\eta$ grows as $g\tau/c$ with its own proper time $\tau$; then $x = \rho\cosh\eta$ and $ct = \rho\sinh\eta$. How far has it travelled, $\rho(\cosh\eta - 1)$, after $\tau = ${tau}$ year${tau > 1 ? 's' : ''} of ship time? Give light-years.`,
          visual: { type: 'graph', params: { x: [-0.3, 4], y: [-0.4, 4], equal: true, aspect: 'wide', xticks: 5, yticks: 5, xlabel: 'x (ly)', ylabel: 'ct (ly)', shade: [{ fn: 'min(x, 4)', lower: '-x', from: 0, to: 7, color: 'teal', alpha: 0.12 }], curves: [{ fn: 'x', domain: [0, 4], color: 'gold', width: 1.4 }, { param: [`${r6(rho / LY)}*cosh(t)`, `${r6(rho / LY)}*sinh(t)`], t: [0, 2.1], color: 'accent', width: 2.4 }] }, caption: t`The rocket’s worldline, a hyperbola $\rho = c^2/g \approx 0.97$ ly in the Rindler wedge, approaching but never reaching the light ray from the wedge’s corner.` },
          answer: dist, units: 'ly', tol: { rel: 0.005 },
          errors: [{ value: (rho * Math.cosh(eta)) / LY, feedback: t`$x = \rho\cosh\eta$ is measured from the wedge’s corner; the rocket started at $x = \rho$. Subtract it.` }, { value: (0.5 * g * (tau * YR) ** 2) / LY, feedback: 'That is the Newtonian ½gτ², which ignores relativity. With ship time τ it comes out too small: the crew’s clocks run slow, so in Earth’s frame the rocket has gone farther than τ suggests.' }].filter((e) => Math.abs(e.value - dist) > 0.01 * dist),
          hints: [t`$\rho = c^2/g = ${nice(rho / LY, 4)}$ ly and $\eta = g\tau/c = ${nice(eta, 4)}$.`, t`$\cosh(${nice(eta, 4)}) = ${nice(Math.cosh(eta), 5)}$.`],
          teach: 'Uniform acceleration is a curve of constant ρ in the Rindler chart: distance ρ(cosh η − 1) after rapidity η = gτ/c.',
          explain: t`$${nice(rho / LY, 4)}\times(${nice(Math.cosh(eta), 5)} - 1) = ${nice(dist, 4)}$ ly, while Earth’s clocks show $ct = \rho\sinh\eta = ${nice((rho * Math.sinh(eta)) / LY, 4)}$ ly, i.e. $${nice((rho * Math.sinh(eta)) / LY, 4)}$ years. The Rindler chart, covering only the wedge, is the natural chart for this crew — a reminder that charts are chosen for convenience.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Lee, Introduction to Smooth Manifolds (2nd ed.), ch. 1 and 21 (quotients)', url: 'https://link.springer.com/book/10.1007/978-1-4419-9982-5' },
    { label: 'Carroll, Spacetime and Geometry, §2.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'USGS: Landsat 8 (233 orbits, 16-day repeat cycle)', url: 'https://www.usgs.gov/landsat-missions/landsat-8' },
  ],
});
