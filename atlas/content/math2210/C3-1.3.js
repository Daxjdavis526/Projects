// Lines and planes, used: how two lines sit (parallel, crossing, skew), every
// distance as a projection onto the right direction, the angle between a line
// and a plane, and the plane through a point with given slopes — tomorrow's
// tangent plane. Closest approach, flight-path angle.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { QUADS, signed, vecTeX, pointTeX, planeEq, lineTeX, add, sub, scale, dot, cross, norm, deg, unit } from './_space.js';

const t = String.raw;
const fit = (...pts) => Math.max(3, Math.ceil(Math.max(...pts.flat().map(Math.abs))) + 0.5);
const rand3 = (r, lo = -3, hi = 3) => [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)];
const nonzero3 = (r, lo = -3, hi = 3) => { let v; do v = rand3(r, lo, hi); while (v.every((x) => x === 0)); return v; };
const parallel = (u, v) => cross(u, v).every((x) => Math.abs(x) < 1e-12);
const scene = (params, caption = 'Drag to rotate.') => ({ type: 'calc-vectors3d', params, caption });

// the closest points of two non-parallel lines P1 + s v1 and P2 + t v2
function closest(P1, v1, P2, v2) {
  const w0 = sub(P1, P2), a = dot(v1, v1), b = dot(v1, v2), c = dot(v2, v2), d = dot(v1, w0), e = dot(v2, w0), den = a * c - b * b;
  const s = (b * e - c * d) / den, tt = (a * e - b * d) / den;
  return [add(P1, scale(v1, s)), add(P2, scale(v2, tt)), s, tt];
}

// the Explore: L1 is the x-axis; L2 passes through (0, 0, h) along (cos α, sin α, tilt)
const C2 = 'cos(al*pi/180)', S2 = 'sin(al*pi/180)', DEN = `(1 + tl^2 - ${C2}^2)`;
const SC = `(-h*tl*${C2}/${DEN})`, TC = `(-h*tl/${DEN})`;
const Q1 = [SC, 0, 0], Q2 = [`${TC}*${C2}`, `${TC}*${S2}`, `h + ${TC}*tl`];

export default lesson({
  id: 'math2210.C3-1.3',
  title: 'Lines and planes',
  minutes: 12, difficulty: 3,
  intro: t`Calculus II gave you the equations: a line is a point and a direction, $\vec r(t) = \vec r_0 + t\vec v$; a plane is a point and a normal, $\vec n\cdot(\vec r - \vec r_0) = 0$. This lesson puts them to work. Two lines in space can be parallel, can cross, or — the usual case — can be **skew**: never meeting and never parallel. Every distance between these objects is found the same way: **take any vector from one to the other and project it onto the direction that measures the gap.** For two skew lines that direction is their common normal $\vec v_1\times\vec v_2$:

$$d = \frac{|(\vec r_2 - \vec r_1)\cdot(\vec v_1\times\vec v_2)|}{|\vec v_1\times\vec v_2|}$$

A plane is also a level surface of the linear function $\vec n\cdot\vec r$ — and the tangent planes of the next module are written in exactly this way.`,
  symbols: [
    { tex: '\\vec r_1,\\ \\vec r_2', text: 'position vectors of one known point on each line' },
    { tex: '\\vec v_1,\\ \\vec v_2', text: 'direction vectors of the two lines' },
    { tex: '\\vec v_1\\times\\vec v_2', text: 'perpendicular to both lines: the direction of the shortest segment joining them (the **common perpendicular**). It is $\\vec 0$ exactly when the lines are parallel' },
    { tex: 'd', text: t`the shortest distance between the lines — zero exactly when they meet. The numerator is a triple product, so $d = 0$ means the lines are coplanar` },
    { tex: '\\frac{|(\\vec q - \\vec r_0)\\times\\vec v|}{|\\vec v|}', text: t`the distance from a point $\vec q$ to the line $\vec r_0 + t\vec v$: the parallelogram on $\vec q - \vec r_0$ and $\vec v$, divided by its base` },
  ],
  why: t`Closest approaches of straight paths — aircraft, satellites, a meteoroid and a planet — clearances in a truss, the flight-path angle of a re-entering capsule, and the tangent plane $z - z_0 = m(x - x_0) + n(y - y_0)$ of every surface in module C3-3 all come from these few formulas.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Two skew lines and the shortest path between them',
    lead: t`$L_1$ (blue) is the $x$-axis. $L_2$ (teal) passes through $(0, 0, h)$ with direction $\langle\cos\alpha, \sin\alpha, \text{tilt}\rangle$. The gold segment joins their closest points. Switch on the two parallel planes that contain the lines; both have normal $\vec v_1\times\vec v_2$.`,
    tasks: [
      t`Set the tilt to $0$: $L_2$ is horizontal, the gold segment is vertical, and its length is $h$ for every angle $\alpha$ — the lines lie in the floor and in the plane $z = h$.`,
      t`Show the planes and add tilt: they stay parallel to each other, and the gold segment, the shortest link, meets both lines at right angles.`,
      t`Set $\alpha = 0$ and the tilt to $0$: the lines are parallel, $\vec v_1\times\vec v_2 = \vec 0$, and the formula fails — parallel lines need the point-to-line distance instead.`,
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'al', label: 'Angle $\\alpha$ of $L_2$ in plan view', min: 0, max: 180, step: 5, value: 50, unit: '^\\circ', explain: 'Turns $L_2$ about the vertical.' },
        { key: 'tl', label: 'Tilt of $L_2$', min: -1, max: 1, step: 0.1, value: 0, explain: 'The $z$-component of its direction: how steeply it climbs.' },
        { key: 'h', label: 'Height $h$', min: -2, max: 2.5, step: 0.1, value: 1.5, explain: '$L_2$ passes through $(0, 0, h)$.' },
      ],
      toggles: [{ key: 'pl', label: 'Show the parallel planes', value: false, explain: 'Each contains one line; both are perpendicular to $\\vec v_1\\times\\vec v_2$.' }],
      lines: [
        { point: [0, 0, 0], dir: [1, 0, 0], t: [-3, 3], color: 'accent', width: 2.6, label: t`L_1` },
        { point: [0, 0, 'h'], dir: [C2, S2, 'tl'], t: [-3, 3], color: 'teal', width: 2.6, label: t`L_2` },
      ],
      planes: [
        { normal: [0, '-tl', S2], point: Q1, size: 2.4, color: 'accent', alpha: 0.12, when: 'pl' },
        { normal: [0, '-tl', S2], point: Q2, size: 2.4, color: 'teal', alpha: 0.12, when: 'pl' },
      ],
      segments: [{ from: Q1, to: Q2, color: 'gold', width: 3 }],
      points: [{ at: Q1, color: 'gold', r: 4 }, { at: Q2, color: 'gold', r: 4 }],
      readouts: [
        { label: 'distance $d$', expr: `abs(h*${S2})/sqrt(tl^2 + ${S2}^2)`, digits: 3 },
        { label: '$|\\vec v_1\\times\\vec v_2|$', expr: `sqrt(tl^2 + ${S2}^2)`, digits: 3 },
      ],
    },
    caption: 'Drag to rotate; scroll or pinch to zoom. To scale, one grid square per unit. Lines and planes are drawn as finite pieces of objects that go on without end.',
  },
  example: {
    prompt: t`Two straight struts of a space-frame truss run along $L_1:\ \vec r = t\,\langle 1, 2, 2\rangle$ and $L_2:\ \vec r = \langle 4, 1, 3\rangle + s\,\langle 2, 1, -2\rangle$, in metres. Do they touch? If not, what is the clearance between them?`,
    visual: scene({
      range: 4.2,
      lines: [{ point: [0, 0, 0], dir: [1, 2, 2], t: [-0.3, 1.8], color: 'accent', width: 2.8, label: t`L_1` }, { point: [4, 1, 3], dir: [2, 1, -2], t: [-1, 0.5], color: 'teal', width: 2.8, label: t`L_2` }],
      segments: [{ from: [4 / 3, 8 / 3, 8 / 3], to: [10 / 3, 2 / 3, 11 / 3], color: 'gold', width: 3 }],
      points: [{ at: [0, 0, 0], color: 'accent', r: 4 }, { at: [4, 1, 3], color: 'teal', r: 4 }],
    }, 'Drag to rotate. The two struts and, in gold, the shortest segment between them. From some angles they seem to cross; turn the picture to see that they do not.'),
    steps: [
      { label: 'Parallel or not', text: t`$\langle 1, 2, 2\rangle$ and $\langle 2, 1, -2\rangle$ are not multiples of each other, so the struts are not parallel. They either cross or are skew.` },
      { label: 'Common normal', text: t`$\vec n = \vec v_1\times\vec v_2 = \langle (2)(-2) - (2)(1),\ (2)(2) - (1)(-2),\ (1)(1) - (2)(2)\rangle = \langle -6, 6, -3\rangle$, with $|\vec n| = 9$.` },
      { label: 'Project a connecting vector', text: t`From the point $(0, 0, 0)$ of $L_1$ to the point $(4, 1, 3)$ of $L_2$: $\vec w = \langle 4, 1, 3\rangle$. Then $\vec w\cdot\vec n = -24 + 6 - 9 = -27$, so $d = \dfrac{27}{9} = 3$ m. Not zero: **the struts are skew**, with 3 m of clearance.` },
      { label: 'Why it works', text: t`Each strut lies in a plane with normal $\vec n$, and the two planes are parallel. Any vector from one strut to the other crosses the gap between those planes, and its component along $\hat n$ is exactly that gap.` },
      { label: 'Sense check', text: t`Minimising the distance between $t\langle 1, 2, 2\rangle$ and $\langle 4, 1, 3\rangle + s\langle 2, 1, -2\rangle$ gives $t = \tfrac43$, $s = -\tfrac13$: the points $(\tfrac43, \tfrac83, \tfrac83)$ and $(\tfrac{10}3, \tfrac23, \tfrac{11}3)$, which differ by $\langle 2, -2, 1\rangle$ — length $3$, and parallel to $\vec n$. ✓` },
    ],
    answer: t`They are skew: $d = |\vec w\cdot\vec n|/|\vec n| = 27/9 = 3$ m of clearance, along the common perpendicular $\langle 2, -2, 1\rangle/3$.`,
  },
  practice: [
    mcq({
      id: 'classify-lines', difficulty: 2,
      gen(r) {
        const type = r.pick(['skew', 'cross', 'parallel', 'same']);
        let P1, v1, P2, v2, X = null;
        do {
          P1 = rand3(r, -2, 2); v1 = nonzero3(r, -2, 2);
          if (type === 'skew') { do { v2 = nonzero3(r, -2, 2); } while (parallel(v1, v2)); P2 = rand3(r, -2, 2); }
          if (type === 'cross') { do { v2 = nonzero3(r, -2, 2); } while (parallel(v1, v2)); X = add(P1, scale(v1, r.int(-1, 1))); P2 = sub(X, scale(v2, r.intExcept(-2, 2, [0]))); }
          if (type === 'parallel') { v2 = scale(v1, r.pick([-2, -1, 2])); do { P2 = add(P1, rand3(r, -2, 2)); } while (parallel(sub(P2, P1), v1)); }
          if (type === 'same') { v2 = scale(v1, r.pick([-2, -1, 2])); P2 = add(P1, scale(v1, r.intExcept(-2, 2, [0]))); }
        } while (type === 'skew' && Math.abs(dot(sub(P2, P1), cross(v1, v2))) < 1e-9);
        const n = cross(v1, v2), w = sub(P2, P1);
        const answer = ['skew', 'cross', 'parallel', 'same'].indexOf(type);
        const why = {
          skew: { 1: t`If they crossed, $\vec w\cdot(\vec v_1\times\vec v_2)$ would be $0$; here it is $${dot(w, n)}$, so no choice of $t$ and $s$ makes the points equal.`, 2: 'The directions are not multiples of each other.', 3: 'The same line would need parallel directions.' },
          cross: { 0: t`They are coplanar — $\vec w\cdot(\vec v_1\times\vec v_2) = 0$ — and not parallel, so they cannot be skew: they cross at $${X ? pointTeX(X) : ''}$.`, 2: 'The directions are not multiples of each other.', 3: 'Different directions: they share one point, not all of them.' },
          parallel: { 0: 'Skew lines are not parallel, but these directions are multiples of each other.', 1: 'Distinct parallel lines never meet.', 3: t`The point $${pointTeX(P2)}$ of the second line is not on the first, so they are two different lines.` },
          same: { 0: 'The directions are multiples of each other, so the lines are parallel or the same — not skew.', 1: 'They share every point, not just one.', 2: t`Parallel, yes — but the point $${pointTeX(P2)}$ of the second line lies on the first (at $t = ${nice(dot(w, v1) / dot(v1, v1))}$), so they coincide.` },
        }[type];
        return {
          prompt: t`How do the lines $L_1:\ ${lineTeX(P1, v1, 't')}$ and $L_2:\ ${lineTeX(P2, v2, 's')}$ sit relative to each other?`,
          choices: ['They are skew', 'They cross at one point', 'They are parallel and distinct', 'They are the same line'],
          answer, why,
          hints: [t`First compare the directions $${vecTeX(v1)}$ and $${vecTeX(v2)}$: are they multiples of each other?`, t`If not, compute $\vec w\cdot(\vec v_1\times\vec v_2)$ with $\vec w = ${vecTeX(w)}$: zero means they lie in one plane and cross.`],
          teach: 'Parallel directions: parallel or identical lines. Otherwise the triple product of the connecting vector with both directions decides: zero means they cross, nonzero means skew.',
          explain: { skew: t`The directions are not parallel and $\vec w\cdot(\vec v_1\times\vec v_2) = ${dot(w, n)} \ne 0$: skew lines, at distance $${nice(Math.abs(dot(w, n)) / norm(n), 3)}$.`, cross: t`Not parallel, and $\vec w\cdot(\vec v_1\times\vec v_2) = 0$: they lie in one plane and cross, at $${X ? pointTeX(X) : ''}$.`, parallel: t`$\vec v_2 = ${nice(v2[0] / v1[0] || v2[1] / v1[1] || v2[2] / v1[2])}\vec v_1$, and $${pointTeX(P2)}$ is not on $L_1$: parallel and distinct.`, same: t`$\vec v_2$ is a multiple of $\vec v_1$ and $${pointTeX(P2)}$ lies on $L_1$: one line, written two ways.` }[type],
          visual: scene({ range: fit(P1, P2, add(P1, v1), add(P2, v2)), lines: [{ point: P1, dir: v1, t: [-2, 2], color: 'accent', width: 2.4, label: t`L_1` }, { point: P2, dir: v2, t: [-2, 2], color: 'teal', width: 2.4, label: t`L_2` }] }, 'Drag to rotate: from some angles lines that never meet seem to cross.'),
        };
      },
    }),
    num({
      id: 'point-line', difficulty: 2,
      gen(r) {
        let P, Q, v, L, d;
        do { const [a, b, c, LL] = r.pick(QUADS); v = signed(r, [a, b, c]); L = LL; P = rand3(r, -3, 3); Q = rand3(r, -3, 3); d = norm(cross(sub(Q, P), v)) / L; } while (d < 0.8);
        const foot = add(P, scale(v, dot(sub(Q, P), v) / (L * L)));
        const errors = [{ value: Math.abs(dot(sub(Q, P), v)) / L, feedback: t`That is how far along the line the foot of the perpendicular is from $P$: the dot product measures the part **along** $\vec v$. The distance uses the part across it — the cross product.` }, { value: norm(sub(Q, P)), feedback: t`That is the distance from $Q$ to the one point $P$ of the line; other points of the line are closer.` }];
        return {
          prompt: t`How far is the point $Q${pointTeX(Q)}$ from the line through $P${pointTeX(P)}$ with direction $\vec v = ${vecTeX(v)}$? Give 3 significant figures.`,
          answer: d, tol: { rel: 0.005 },
          errors: errors.filter((e) => Math.abs(e.value - d) > 0.01 * d),
          hints: [t`$d = \dfrac{|\overrightarrow{PQ}\times\vec v|}{|\vec v|}$: the parallelogram on $\overrightarrow{PQ}$ and $\vec v$, divided by its base.`, t`$\overrightarrow{PQ} = ${vecTeX(sub(Q, P))}$, $\overrightarrow{PQ}\times\vec v = ${vecTeX(cross(sub(Q, P), v))}$ and $|\vec v| = ${L}$.`],
          teach: 'The distance from a point to a line is the height of the parallelogram on the connecting vector and the direction: |PQ × v| / |v|.',
          explain: t`$|\overrightarrow{PQ}\times\vec v| = |${vecTeX(cross(sub(Q, P), v))}| = ${nice(norm(cross(sub(Q, P), v)), 4)}$, so $d = ${nice(norm(cross(sub(Q, P), v)), 4)}/${L} = ${nice(d, 3)}$. The nearest point of the line is $${pointTeX(foot.map((x) => +x.toFixed(3)))}$.`,
          visual: scene({ range: fit(P, Q, foot), lines: [{ point: P, dir: v, t: [-1.5, 1.5], color: 'teal', width: 2.4 }], points: [{ at: P, label: 'P', color: 'teal' }, { at: Q, label: 'Q', color: 'gold' }], segments: [{ from: Q, to: foot, color: 'gold', dash: true }] }, 'Drag to rotate. The line through P and the perpendicular from Q to it (dashed).'),
        };
      },
    }),
    num({
      id: 'skew-distance', difficulty: 3,
      gen(r) {
        let P1, v1, P2, v2, n, w, d;
        do { P1 = rand3(r, -2, 2); P2 = rand3(r, -2, 2); v1 = nonzero3(r); v2 = nonzero3(r); n = cross(v1, v2); w = sub(P2, P1); d = norm(n) ? Math.abs(dot(w, n)) / norm(n) : 0; } while (d < 0.8);
        const [A1, A2] = closest(P1, v1, P2, v2);
        return {
          prompt: t`Find the shortest distance between the skew lines $${lineTeX(P1, v1, 't')}$ and $${lineTeX(P2, v2, 's')}$, to 3 significant figures.`,
          answer: d, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(dot(w, n)), feedback: t`Divide by $|\vec v_1\times\vec v_2| = ${nice(norm(n), 4)}$: only the **unit** normal measures distance.` }, { value: norm(w), feedback: t`That is the distance between the two points you started from, not the shortest distance between the lines.` }].filter((e) => Math.abs(e.value - d) > 0.01 * d),
          hints: [t`$\vec n = \vec v_1\times\vec v_2 = ${vecTeX(n)}$ and $\vec w = ${vecTeX(w)}$ joins a point of each line.`, t`$d = |\vec w\cdot\vec n|/|\vec n| = |${dot(w, n)}|/\sqrt{${dot(n, n)}}$.`],
          teach: 'The distance between skew lines is the component of any connecting vector along their common normal v₁ × v₂.',
          explain: t`$\vec w\cdot\vec n = ${dot(w, n)}$ and $|\vec n| = ${nice(norm(n), 4)}$, so $d = ${nice(d, 3)}$. The closest points are $${pointTeX(A1.map((x) => +x.toFixed(3)))}$ and $${pointTeX(A2.map((x) => +x.toFixed(3)))}$.`,
          visual: scene({ range: fit(A1, A2, P1, P2), lines: [{ point: P1, dir: v1, t: [-2, 2], color: 'accent', width: 2.4 }, { point: P2, dir: v2, t: [-2, 2], color: 'teal', width: 2.4 }], segments: [{ from: A1, to: A2, color: 'gold', width: 3 }] }, 'Drag to rotate. The two lines and, in gold, the common perpendicular between them.'),
        };
      },
    }),
    num({
      id: 'parallel-planes', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), n = signed(r, [a, b, c]), k = r.pick([2, 3, -2]);
        let d1, d2;
        do { d1 = r.int(-8, 8); d2 = r.int(-8, 8); } while (d1 === d2);
        const dist = Math.abs(d2 - d1) / L;
        const S = 2.4 / Math.max(1, Math.abs(d1) / L, Math.abs(d2) / L);
        return {
          prompt: t`Find the distance between the parallel planes $${planeEq(n, d1)}$ and $${planeEq(scale(n, k), k * d2)}$.`,
          answer: dist, tol: { rel: 1e-3 },
          errors: [{ value: Math.abs(k * d2 - d1) / L, feedback: t`Divide the second equation by ${k} first, so both have the same normal $${vecTeX(n)}$; only then can the constants be compared.` }, { value: Math.abs(k * d2 - d1) / (Math.abs(k) * L), feedback: t`Rescale the whole second equation (its constant too) before comparing it with the first.` }].filter((e) => Math.abs(e.value - dist) > 1e-6),
          hints: [t`Divide the second equation by ${k}: $${planeEq(n, d2)}$.`, t`For $\vec n\cdot\vec r = d_1$ and $\vec n\cdot\vec r = d_2$ the distance is $|d_2 - d_1|/|\vec n|$, with $|\vec n| = ${L}$.`],
          teach: 'Write both planes with the same normal; then the distance is the difference of the constants divided by |n|.',
          explain: t`After dividing by ${k}: $\vec n\cdot\vec r = ${d1}$ and $\vec n\cdot\vec r = ${d2}$ with $|\vec n| = ${L}$, so $d = |${d2} - (${d1})|/${L} = ${nice(dist, 4)}$.`,
          visual: scene({ range: 3, grid: false, planes: [{ normal: n, d: d1 * S, size: 2, color: 'accent', alpha: 0.2 }, { normal: n, d: d2 * S, size: 2, color: 'teal', alpha: 0.2, showNormal: true, normalLabel: t`\vec n` }] }, 'Drag to rotate. The two parallel planes (scaled together to fit) and their common normal.'),
        };
      },
    }),
    num({
      id: 'line-plane-angle', difficulty: 3,
      gen(r) {
        let v, n, s;
        do { v = nonzero3(r); n = nonzero3(r); s = Math.abs(dot(v, n)) / (norm(v) * norm(n)); } while (s < 0.18 || s > 0.97);
        const th = deg(Math.asin(s)), dTerm = r.int(-3, 3);
        const S = 1.8 / norm(v);
        return {
          prompt: t`At what angle does the line with direction $\vec v = ${vecTeX(v)}$ meet the plane $${planeEq(n, dTerm)}$? Give degrees to one decimal place.`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 90 - th, feedback: t`That is the angle between the line and the plane’s **normal**. The angle with the plane itself is its complement: use $\sin\theta = \dfrac{|\vec v\cdot\vec n|}{|\vec v||\vec n|}$.` }],
          hints: [t`The normal is $\vec n = ${vecTeX(n)}$. Find the angle between $\vec v$ and $\vec n$ first.`, t`The line meets the plane at $90^\circ$ minus that angle: $\sin\theta = \dfrac{|\vec v\cdot\vec n|}{|\vec v||\vec n|} = \dfrac{${Math.abs(dot(v, n))}}{${nice(norm(v), 4)}\times${nice(norm(n), 4)}}$.`],
          teach: 'A line meets a plane at the complement of its angle with the normal: sin θ = |v · n| / (|v||n|).',
          explain: t`$\sin\theta = ${nice(s, 4)}$, so $\theta = ${nice(th, 4)}^\circ$; the line makes $${nice(90 - th, 4)}^\circ$ with the normal.`,
          visual: scene({ range: 2.6, planes: [{ normal: n, d: 0, size: 2, color: 'violet', alpha: 0.2, showNormal: true, normalLabel: t`\vec n` }], lines: [{ point: [0, 0, 0], dir: scale(v, S), t: [-1.2, 1.2], color: 'teal', width: 2.6 }] }, 'Drag to rotate. The plane (shifted through the origin, which does not change its tilt), its normal, and the line.'),
        };
      },
    }),
    num({
      id: 'foot', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS.filter((q) => q[3] <= 7)), n = signed(r, [a, b, c]);
        const F = rand3(r, -2, 2), m = r.pick([-1, 1]), Q = add(F, scale(n, m)), d = dot(n, F);
        const wrong = sub(Q, scale(n, (dot(n, Q) - d) / L));
        return {
          prompt: t`Which point of the plane $${planeEq(n, d)}$ is closest to $Q${pointTeX(Q)}$? Give its $z$-coordinate.`,
          answer: F[2], tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: wrong[2], feedback: t`The step is $\dfrac{\vec n\cdot\vec q - d}{|\vec n|^2}\,\vec n$: divide by $|\vec n|^2 = ${L * L}$, once to make the distance and once to make the unit vector.` }, { value: Q[2], feedback: 'That is where you started; move from Q along the normal until you reach the plane.' }].filter((e) => Math.abs(e.value - F[2]) > 1e-6),
          hints: [t`From $Q$, walk along the normal $\vec n = ${vecTeX(n)}$: $\vec q - \lambda\vec n$, and choose $\lambda$ so that the point is on the plane.`, t`$\vec n\cdot(\vec q - \lambda\vec n) = ${d}$ gives $\lambda = \dfrac{\vec n\cdot\vec q - ${d}}{|\vec n|^2} = \dfrac{${dot(n, Q) - d}}{${L * L}}$.`],
          teach: 'The closest point of a plane is the foot of the perpendicular: move from the point along the normal until the plane equation holds.',
          explain: t`$\lambda = \dfrac{${dot(n, Q)} - ${d}}{${L * L}} = ${m}$, so the foot is $\vec q - (${m})${vecTeX(n)} = ${pointTeX(F)}$, at distance $${L}$ from $Q$.`,
          visual: scene({ range: fit(Q, F), planes: [{ normal: n, point: F, size: 2.6, color: 'violet', alpha: 0.2 }], points: [{ at: Q, label: 'Q', color: 'gold' }], lines: [{ point: Q, dir: n, t: [-1.6, 1.6], color: 'gold', dash: true }] }, 'Drag to rotate. The plane and the line through Q along its normal (dashed).'),
        };
      },
    }),
    mcq({
      id: 'intersection-line', difficulty: 3,
      prompt: t`Which line is the intersection of the planes $x + 2y - z = 3$ and $2x - y + z = 1$?`,
      choices: [t`$\vec r = \langle 1, 1, 0\rangle + t\langle 1, -3, -5\rangle$`, t`$\vec r = \langle 1, 1, 0\rangle + t\langle 3, 1, 0\rangle$`, t`$\vec r = \langle 3, 0, 0\rangle + t\langle 1, -3, -5\rangle$`, t`$\vec r = \langle 1, 1, 0\rangle + t\langle 1, 2, -1\rangle$`],
      answer: 0,
      why: {
        1: t`$\langle 3, 1, 0\rangle$ is $\vec n_1 + \vec n_2$. The line lies in both planes, so it must be perpendicular to both normals: use $\vec n_1\times\vec n_2$.`,
        2: t`The direction is right, but $(3, 0, 0)$ is only on the first plane: $2(3) - 0 + 0 = 6 \ne 1$.`,
        3: t`That is the first plane’s normal: it points out of the plane, not along it.`,
      },
      hints: [t`Direction: $\vec n_1\times\vec n_2 = \langle 1, 2, -1\rangle\times\langle 2, -1, 1\rangle$.`, t`A point: set $z = 0$ and solve $x + 2y = 3$, $2x - y = 1$.`],
      teach: 'The line where two planes meet runs along n₁ × n₂ and passes through any point that satisfies both equations.',
      explain: t`$\vec n_1\times\vec n_2 = \langle (2)(1) - (-1)(-1),\ (-1)(2) - (1)(1),\ (1)(-1) - (2)(2)\rangle = \langle 1, -3, -5\rangle$. With $z = 0$: $x + 2y = 3$ and $2x - y = 1$ give $(1, 1, 0)$, which satisfies both planes.`,
      visual: scene({ range: 3, planes: [{ normal: [1, 2, -1], d: 3, centre: [1, 1, 0], size: 2.2, color: 'accent', alpha: 0.18 }, { normal: [2, -1, 1], d: 1, centre: [1, 1, 0], size: 2.2, color: 'violet', alpha: 0.2 }], lines: [{ point: [1, 1, 0], dir: [1, -3, -5], t: [-0.45, 0.45], color: 'gold', width: 2.8 }] }, 'Drag to rotate. The two planes and, in gold, the line where they meet.'),
    }),
    expr({
      id: 'slope-plane', difficulty: 2,
      gen(r) {
        const [x0, y0, z0] = [r.int(-2, 2), r.int(-2, 2), r.int(1, 4)], m = r.intExcept(-3, 3, [0]), n = r.intExcept(-3, 3, [0]);
        const sx = (v, name) => (v === 0 ? name : `(${name} ${v > 0 ? '-' : '+'} ${Math.abs(v)})`);
        const ans = `${z0} + ${m}*${sx(x0, 'x')} + ${n}*${sx(y0, 'y')}`;
        const kx = 1.6 / Math.hypot(1, m), ky = 1.6 / Math.hypot(1, n);
        return {
          prompt: t`A plane passes through $(${x0}, ${y0}, ${z0})$. Walking in the $x$-direction it rises $${m}$ per unit; walking in the $y$-direction it rises $${n}$ per unit. Write its equation as $z = \ldots$`,
          answer: ans, answerTeX: t`${z0} ${m < 0 ? '-' : '+'} ${Math.abs(m) === 1 ? '' : Math.abs(m)}${sx(x0, 'x')} ${n < 0 ? '-' : '+'} ${Math.abs(n) === 1 ? '' : Math.abs(n)}${sx(y0, 'y')}`, lhs: 'z',
          vars: { x: [-2, 2], y: [-2, 2] },
          errors: [{ answer: `${z0} + ${m}*x + ${n}*y`, feedback: t`Measure the run from the point: $m(x - x_0)$, not $mx$ — otherwise the plane misses $(${x0}, ${y0}, ${z0})$.` }].filter(() => m * x0 + n * y0 !== 0),
          hints: [t`Along $x$: $z - z_0 = m(x - x_0)$; along $y$: $z - z_0 = n(y - y_0)$. A plane adds the two.`, t`$z = ${z0} + ${m}${sx(x0, 'x')} + ${n}${sx(y0, 'y')}$.`],
          teach: 'A non-vertical plane is z = z₀ + m(x − x₀) + n(y − y₀); its normal is ⟨m, n, −1⟩.',
          explain: t`$z = ${z0} + (${m})${sx(x0, 'x')} + (${n})${sx(y0, 'y')}$. Moved to one side it reads $${m}x + ${n}y - z = \text{const}$, so its normal is $\langle ${m}, ${n}, -1\rangle$. In module C3-3 the slopes $m$ and $n$ will be the partial derivatives of a surface, and this will be its tangent plane.`,
          visual: scene({ range: 3.2, planes: [{ normal: [m, n, -1], point: [0, 0, 0], size: 1.7, color: 'violet', alpha: 0.22 }], vectors: [{ to: [kx, 0, kx * m], color: 'accent', label: t`x\text{-slope}` }, { to: [0, ky, ky * n], color: 'warn', label: t`y\text{-slope}` }] }, t`Drag to rotate. A plane with these slopes, drawn through the origin (shifting it does not change its tilt). The arrows point along the plane in the $x$- and $y$-directions: each climbs $m$ or $n$ for every unit it runs.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-skew', difficulty: 3,
      gen(r) {
        let P1, v1, P2, v2, n, w, d;
        do { P1 = rand3(r, -3, 3); P2 = rand3(r, -3, 3); v1 = nonzero3(r); v2 = nonzero3(r); n = cross(v1, v2); w = sub(P2, P1); d = norm(n) ? Math.abs(dot(w, n)) / norm(n) : 0; } while (d < 0.8);
        return {
          prompt: t`How far apart are the lines $${lineTeX(P1, v1, 't')}$ and $${lineTeX(P2, v2, 's')}$? Give 3 significant figures.`,
          answer: d, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(dot(w, n)), feedback: t`Divide by $|\vec v_1\times\vec v_2|$.` }].filter((e) => Math.abs(e.value - d) > 0.01 * d),
          hints: [t`$d = |(\vec r_2 - \vec r_1)\cdot(\vec v_1\times\vec v_2)|/|\vec v_1\times\vec v_2|$.`, t`$\vec v_1\times\vec v_2 = ${vecTeX(n)}$.`],
          teach: 'Project a connecting vector onto the unit common normal.',
          explain: t`$\vec v_1\times\vec v_2 = ${vecTeX(n)}$, $(\vec r_2 - \vec r_1)\cdot(\vec v_1\times\vec v_2) = ${dot(w, n)}$, so $d = ${nice(d, 3)}$.`,
          visual: scene({ range: fit(P1, P2), lines: [{ point: P1, dir: v1, t: [-2, 2], color: 'accent', width: 2.4 }, { point: P2, dir: v2, t: [-2, 2], color: 'teal', width: 2.4 }] }),
        };
      },
    }),
    num({
      id: 'cp-meteoroid', difficulty: 3, transfer: true,
      gen(r) {
        let r0, v, b;
        do { r0 = [r.int(-40, 40), r.int(-40, 40), r.int(-30, 30)]; v = [r.intExcept(-15, 15, [0]), r.int(-15, 15), r.int(-12, 12)]; b = norm(cross(r0, v)) / norm(v); } while (dot(r0, v) > -0.5 * norm(r0) * norm(v) || b < 3 || b > 14 || norm(r0) < 25);
        const km = b * 1000, S = 3 / norm(r0);
        return {
          prompt: t`A meteoroid is at $\vec r_0 = ${vecTeX(r0)}$ thousand km from Earth’s centre, moving along the direction $${vecTeX(v)}$. Ignoring Earth’s gravity, its path is a straight line. How close does that line come to Earth’s centre, in km? (Earth’s radius is $6371$ km.)`,
          answer: km, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: norm(r0) * 1000, feedback: 'That is its present distance. Along the line it gets closer before it recedes.' }, { value: (Math.abs(dot(r0, v)) / norm(v)) * 1000, feedback: t`That is how far it still has to travel to the point of closest approach: the component of $\vec r_0$ **along** the path. The miss distance is the part across it.` }],
          hints: [t`The closest distance from the origin to the line $\vec r_0 + t\vec v$ is $|\vec r_0\times\vec v|/|\vec v|$.`, t`$\vec r_0\times\vec v = ${vecTeX(cross(r0, v))}$ and $|\vec v| = ${nice(norm(v), 4)}$.`],
          teach: 'The miss distance of a straight path is the point-to-line distance |r₀ × v| / |v| — the impact parameter.',
          explain: t`$b = \dfrac{|\vec r_0\times\vec v|}{|\vec v|} = \dfrac{${nice(norm(cross(r0, v)), 5)}}{${nice(norm(v), 4)}} = ${nice(b, 4)}$ thousand km $\approx ${fmt(km, 3)}$ km — ${km > 6371 ? 'outside Earth’s radius, a miss on this straight-line estimate' : 'inside Earth’s radius: on this estimate, an impact'}. Earth’s gravity bends real paths inward, so the true capture radius is larger than 6371 km — for a slow meteoroid, much larger.`,
          visual: scene({ range: 4, grid: false, spheres: [{ centre: [0, 0, 0], radius: 6.371 * S, color: 'teal' }], lines: [{ point: scale(r0, S), dir: unit(v), t: [-0.4, 5], color: 'gold', width: 2.4 }], points: [{ at: scale(r0, S), color: 'gold', label: t`\vec r_0` }] }, 'Drag to rotate. Earth (teal) and the meteoroid’s straight path (gold), scaled to fit.'),
        };
      },
    }),
    num({
      id: 'cp-flight-path', difficulty: 3, transfer: true,
      gen(r) {
        const gam = r.pick([-5.6, -6.0, -6.3, -6.8, -7.2]), speed = r.pick([7.7, 7.9, 11.0]);
        // a random radial direction and a horizontal direction perpendicular to it
        let u, h;
        do { u = unit([r.int(-9, 9), r.int(-9, 9), r.int(-9, 9)]); h = unit(cross(u, unit([r.int(-9, 9), r.int(-9, 9), r.int(-9, 9)]))); } while (!u.every(Number.isFinite) || !h.every(Number.isFinite));
        const R = 6371 + 120, g = (gam * Math.PI) / 180;
        const rv = scale(u, R).map((x) => Math.round(x)), vv = add(scale(h, speed * Math.cos(g)), scale(u, speed * Math.sin(g))).map((x) => +x.toFixed(3));
        const ans = deg(Math.asin(dot(vv, rv) / (norm(vv) * norm(rv))));
        return {
          prompt: t`A capsule returning from ${speed > 10 ? 'the Moon' : 'orbit'} crosses the top of the atmosphere at $\vec r = ${vecTeX(rv)}$ km (from Earth’s centre) with velocity $\vec v = ${vecTeX(vv)}$ km/s. Its **flight-path angle** is the angle between $\vec v$ and the local horizontal plane — the plane through the capsule perpendicular to $\vec r$ — counted negative when it is descending. Find it, to 0.1°.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 90 - ans, feedback: t`That is the angle between $\vec v$ and the vertical, $\vec r$. The horizontal plane has normal $\vec r$, so the angle with the plane is $90^\circ$ minus that: $\sin\gamma = \dfrac{\vec v\cdot\vec r}{|\vec v||\vec r|}$.` }],
          hints: [t`The horizontal plane’s normal is $\vec r$ itself. The angle between a line and a plane satisfies $\sin\gamma = \dfrac{\vec v\cdot\vec r}{|\vec v||\vec r|}$ (keep the sign: negative means descending).`, t`$\vec v\cdot\vec r = ${nice(dot(vv, rv), 6)}$ km²/s, $|\vec v| = ${nice(norm(vv), 4)}$ km/s, $|\vec r| = ${nice(norm(rv), 5)}$ km.`],
          teach: 'The flight-path angle is the angle between the velocity (a line) and the local horizontal (the plane whose normal is r).',
          explain: t`$\sin\gamma = \dfrac{${nice(dot(vv, rv), 6)}}{(${nice(norm(vv), 4)})(${nice(norm(rv), 5)})} = ${nice(Math.sin((ans * Math.PI) / 180), 4)}$, so $\gamma = ${nice(ans, 3)}^\circ$. Capsules must hit a narrow corridor of a few degrees around $-6^\circ$: too shallow and the capsule skims back out of the atmosphere, too steep and the deceleration and heating become unsurvivable.`,
          visual: scene({ range: 2.4, grid: false, planes: [{ normal: u, point: scale(u, 1.4), size: 1.1, color: 'teal', alpha: 0.2 }], vectors: [{ to: scale(u, 1.4), color: 'accent', label: t`\vec r` }, { from: scale(u, 1.4), to: add(scale(u, 1.4), scale(unit(vv), 1.1)), color: 'gold', label: t`\vec v` }], curves: [{ param: [0, 1, 2].map((k) => `${(1.15 * u[k]).toFixed(4)}*cos(t) + ${(1.15 * h[k]).toFixed(4)}*sin(t)`), t: [-0.7, 0.7], color: 'ink3', dash: true }] }, 'Drag to rotate. The capsule’s position r, its velocity v, and the local horizontal plane (teal); the dashed arc is the curve of Earth’s surface below. Not to scale: the angle is real, the lengths are not.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.5 Equations of Lines and Planes in Space', url: 'https://openstax.org/books/calculus-volume-3/pages/2-5-equations-of-lines-and-planes-in-space' },
  ],
});
