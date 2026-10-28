// The capstone of vector calculus: the fundamental theorem of calculus, the
// gradient theorem, Stokes/Green and the divergence theorem as one statement,
// ∫∂Ω ω = ∫Ω dω, with a table of the four cases. Differential forms appear as
// a labelled preview for the Mathematics of Spacetime track: the exterior
// derivative is grad, curl and div in turn, d d = 0 mirrors ∂∂ = ∅, and the
// theorem works in any dimension. Every number is computed below.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { co, path, r6, boxSurface } from './_fields.js';

const t = String.raw;
const PI = Math.PI;

/** The four regions and their boundaries, drawn flat on the graph sim; no numbers. */
function costumesPic(caption) {
  const curve = path('4.85 + 2.9*t', '2.95 + 0.4*sin(5.5*t) + 0.2*t', [0, 1], { color: 'accent', width: 3, at: [0.42] });
  const edge = path('2.1 + 1.45*cos(t)', '0.95 + 0.55*sin(t)', [0, r6(2 * PI)], { color: 'gold', width: 2.6, at: [0.12, 0.62] });
  const [cx, cy, R] = [6.4, 0.95, 0.72];
  const out = [30, 90, 150, 210, 270, 330].map((deg) => {
    const a = (deg * PI) / 180;
    return { from: [r6(cx + R * Math.cos(a)), r6(cy + R * Math.sin(a))], to: [r6(cx + 1.42 * R * Math.cos(a)), r6(cy + 1.42 * R * Math.sin(a))], color: 'gold', width: 2 };
  });
  const B = curve.curve, end = [4.85 + 2.9, 2.95 + 0.4 * Math.sin(5.5) + 0.2];
  return {
    type: 'graph',
    params: {
      x: [0, 8.6], y: [-0.2, 4.1], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [
        { fn: '0.95 + 0.55*sqrt(max(0, 1 - ((x - 2.1)/1.45)^2))', lower: '0.95 - 0.55*sqrt(max(0, 1 - ((x - 2.1)/1.45)^2))', from: 0.65, to: 3.55, color: 'accent', alpha: 0.22 },
        { fn: `${cy} + sqrt(max(0, ${R * R} - (x - ${cx})^2))`, lower: `${cy} - sqrt(max(0, ${R * R} - (x - ${cx})^2))`, from: cx - R, to: cx + R, color: 'violet', alpha: 0.22 },
      ],
      curves: [
        { param: ['0.7 + 2.8*t', '2.95'], t: [0, 1], color: 'accent', width: 3 },
        B, edge.curve,
        { param: [`${cx} + ${R}*cos(t)`, `${cy} + ${R}*sin(t)`], t: [0, r6(2 * PI)], color: 'gold', width: 2.6 },
        { param: [`${cx} + ${R}*cos(t)`, `${cy} + ${r6(0.28 * R)}*sin(t)`], t: [0, r6(2 * PI)], color: 'ink3', width: 1.3, dash: true },
      ],
      arrows: [...edge.arrows, ...curve.arrows, ...out],
      points: [
        { x: 0.7, y: 2.95, color: 'bad', r: 6, label: 'a  (−)', labelDx: -10, labelDy: 20 },
        { x: 3.5, y: 2.95, color: 'good', r: 6, label: 'b  (+)', labelDx: -10, labelDy: 20 },
        { x: 4.85, y: 2.95, color: 'bad', r: 6, label: 'A  (−)', labelDx: -10, labelDy: 20 },
        { x: r6(end[0]), y: r6(end[1]), color: 'good', r: 6, label: 'B  (+)', labelDx: -10, labelDy: 20 },
        { x: 0.5, y: 3.85, r: 0.01, color: 'ink2', label: 'interval [a, b]' },
        { x: 4.65, y: 3.85, r: 0.01, color: 'ink2', label: 'curve C' },
        { x: 0.5, y: 1.85, r: 0.01, color: 'ink2', label: 'surface S, edge ∂S' },
        { x: 4.65, y: 1.85, r: 0.01, color: 'ink2', label: 'solid E, skin ∂E' },
      ],
    },
    caption,
  };
}

/** The two chains: d raises the degree of a form, ∂ lowers the dimension of a region. */
const CHAINS = {
  type: 'graph',
  params: {
    x: [-0.7, 10.9], y: [-2.3, 1.7], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    points: [
      ...[['function f', 'accent'], ['F·dr', 'gold'], ['F·dS', 'gold'], ['g dV', 'accent']].map(([label, color], k) => ({ x: 0.6 + 3 * k, y: 0.8, color, r: 7, label, labelDx: -24, labelDy: 24 })),
      ...['points', 'curves', 'surfaces', 'solids'].map((label, k) => ({ x: 0.6 + 3 * k, y: -1.3, color: 'violet', r: 7, label, labelDx: -24, labelDy: 24 })),
    ],
    arrows: [
      ...['d = grad', 'd = curl', 'd = div'].map((label, k) => ({ from: [0.95 + 3 * k, 0.8], to: [3.25 + 3 * k, 0.8], color: 'ink', label, labelDx: -64, labelDy: -14 })),
      ...[0, 1, 2].map((k) => ({ from: [9.25 - 3 * k, -1.3], to: [6.95 - 3 * k, -1.3], color: 'ink', label: '∂', labelDx: 62, labelDy: -14 })),
    ],
  },
  caption: 'Top: the exterior derivative d takes a function to a field along curves, to a field through surfaces, to a density in volumes — grad, curl, div. Bottom: the boundary ∂ takes a solid to its skin, a surface to its edge, a curve to its end points. Two steps in a row give zero on top and nothing below.',
};

/** A closed or open surface on c3-flux; no numbers unless asked. */
const fluxPic = (F, surfaces, { caption, ...rest } = {}) => ({
  type: 'c3-flux',
  params: { F, surfaces, readouts: [], flipToggle: false, range: 1.4, ...rest },
  caption,
});
const EDGE = { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] };
const HEMI = { label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'], boundary: EDGE };
const pw = (k, v = 'r') => (k === 0 ? '1' : k === 1 ? v : `${v}^{${k}}`);
const z9 = (v) => nice(+v.toFixed(9) + 0);
const uniq = (errs, ans) => errs.filter((e, i) => Math.abs(e.value - ans) > 1e-9 && errs.findIndex((f) => Math.abs(f.value - e.value) < 1e-9) === i);

export default lesson({
  id: 'math2210.C3-5.10',
  title: 'One theorem in four costumes',
  minutes: 14, difficulty: 3,
  equation: t`\int_{\partial\Omega}\omega = \int_\Omega d\omega`,
  intro: t`Every theorem in this module has the same shape: **integrate a derivative over a region, and you get the original thing over the region’s boundary.** Here are the four costumes side by side — the region $\Omega$, its oriented boundary $\partial\Omega$, and the theorem:

$$\begin{array}{l|l|l}
\Omega & \partial\Omega & \textstyle\int_{\partial\Omega}\omega = \int_\Omega d\omega \\ \hline
\text{interval } [a, b] & \text{end points } b\ (+),\ a\ (-) & f(b) - f(a) = \int_a^b f'(x)\,dx \\
\text{curve } C \text{ from } A \text{ to } B & \text{end points } B\ (+),\ A\ (-) & f(B) - f(A) = \int_C\nabla f\cdot d\vec r \\
\text{surface } S & \text{edge curve, right-hand rule} & \oint_{\partial S}\vec F\cdot d\vec r = \iint_S(\nabla\times\vec F)\cdot d\vec S \\
\text{solid } E & \text{closed surface, normals out} & \oiint_{\partial E}\vec F\cdot d\vec S = \iiint_E\nabla\cdot\vec F\,dV
\end{array}$$

The rows are the fundamental theorem of calculus, the gradient theorem, Stokes’ theorem (Green’s, when $S$ is flat) and the divergence theorem, and each is proved the same way: cut $\Omega$ into small cells, let every shared inner boundary cancel in pairs, and on each small cell the derivative *is* what the cell’s boundary measures, per unit size.

> **Preview — differential forms.** In Differential Geometry (the Mathematics of Spacetime track) the four rows become one theorem, the large equation above. The integrands $\omega$ — a function at points, $\vec F\cdot d\vec r$ along curves, $\vec F\cdot d\vec S$ over surfaces — are *differential forms* of degree 0, 1 and 2, and one operation, the **exterior derivative** $d$, acts as grad, curl and div in turn. Nothing later in this course depends on the preview.`,
  symbols: [
    { tex: '\\Omega', text: 'the region, of any dimension: an interval, a curve, a surface or a solid, with an orientation' },
    { tex: '\\partial\\Omega', text: t`its **boundary**, one dimension lower and oriented to match: end points with signs $\pm$, an edge walked by the right-hand rule, or a closed surface with normals out` },
    { tex: '\\omega', text: t`what is integrated over the boundary: a function at points, $\vec F\cdot d\vec r$ along a curve, $\vec F\cdot d\vec S$ over a surface — a *differential form*` },
    { tex: 'd\\omega', text: t`its **exterior derivative**, integrated over the region: $f'(x)\,dx$, $\nabla f\cdot d\vec r$, $(\nabla\times\vec F)\cdot d\vec S$ or $(\nabla\cdot\vec F)\,dV$ — whichever derivative matches the dimension` },
    { tex: '\\int', text: 'an integral over a region of the matching dimension; over a set of signed points it simply adds the values with their signs' },
  ],
  why: t`Grad, div and curl are tied to three dimensions and to $x, y, z$ axes, but forms and $d$ work in any dimension and on curved spacetime: in general relativity Maxwell’s equations become $dF = 0$ and $d{\star}F = {\star}J$, and every conservation law is one more costume of this theorem, on a four-dimensional region of spacetime.`,
  visual: {
    type: 'c3-cells',
    title: 'The inside always cancels',
    lead: t`One picture behind every row of the table. Cut an interval into pieces, or a region into cells: each inner boundary belongs to two pieces and is counted once each way, so the pieces add up to the outer boundary alone. Switch between the three pictures and change the number of cells.`,
    tasks: [
      t`Interval: each piece contributes $f(\text{right end}) - f(\text{left end})$. Every inner cut is the right end of one piece ($+$) and the left end of the next ($-$), so the rises add up to $f(b) - f(a)$ — the fundamental theorem of calculus.`,
      'Circulation: a shared edge is walked once each way and cancels, so the sum over the cells equals the circulation round the boundary — with 1 cell across or 10.',
      'Cut finer and drag the probe: one cell’s circulation (or flux) per unit area settles on the curl (or divergence) at its centre. That is how the derivative gets inside the region.',
    ],
    params: {
      modes: ['interval', 'circ', 'flux'], mode: 'interval',
      f: 'x^3/3 - x', a: -1.8, b: 2.1,
      P: 'sin(y) + 0.4*x', Q: 'sin(x) - 0.3*y^2', x: [-2.6, 2.6], y: [-1.8, 1.8],
      regions: [{ label: 'Rectangle', kind: 'rect', x: [-2, 2], y: [-1.3, 1.3] }, { label: 'Disk', kind: 'disk', c: [0, 0], r: 1.5 }, { label: 'Disk with a hole', kind: 'annulus', c: [0, 0], r: [0.6, 1.6] }],
      n: 3, nMax: 10, probe: [0.5, 0.4],
    },
    caption: t`Interval: $f(x) = x^3/3 - x$ on $[-1.8, 2.1]$, each piece’s rise drawn as an arrow (gold up, red down); the row of signs shows each cut counted $+$ by one piece and $-$ by the next. Cells: the field $\langle \sin y + 0.4x,\ \sin x - 0.3y^2\rangle$, each cell walked anticlockwise and tinted by its circulation (or outward flux) per unit area, blue positive and red negative. All integrals are computed numerically.`,
  },
  example: {
    prompt: t`*Preview of forms.* For a 1-form $\omega = P\,dx + Q\,dy$ in the plane, find $d\omega$ by the rules of the exterior derivative, and show that $\int_{\partial D}\omega = \int_D d\omega$ is Green’s theorem. Check it for $\omega = -y^3\,dx + x^3\,dy$ on the unit disk $D$.`,
    visual: {
      type: 'c3-cells',
      params: { mode: 'circ', P: '-y^3', Q: 'x^3', x: [-1.75, 1.75], y: [-1.2, 1.2], region: { kind: 'disk', c: [0, 0], r: 1 }, n: 3, probe: [0.55, 0.3], density: 11 },
      caption: t`The unit disk cut into cells, each tinted by its circulation of $\omega = -y^3\,dx + x^3\,dy$ per unit area. The readouts give the sum over the cells, $\oint_{\partial D}\omega$, and the integral of $d\omega$ over the disk, all computed numerically.`,
    },
    steps: [
      { label: 'The rules', text: t`For a function, $df = f_x\,dx + f_y\,dy$ — the covector of C3-3.6, the first row of the table. The **wedge** $dx\wedge dy$ is an oriented area element: turning from the $dx$ direction to the $dy$ direction is anticlockwise, so $dy\wedge dx = -dx\wedge dy$, and $dx\wedge dx = 0$ (a strip with no width). Finally, $d(P\,dx) = dP\wedge dx$.` },
      { label: 'Apply d', text: t`$d\omega = dP\wedge dx + dQ\wedge dy = (P_x\,dx + P_y\,dy)\wedge dx + (Q_x\,dx + Q_y\,dy)\wedge dy$. The $dx\wedge dx$ and $dy\wedge dy$ terms vanish, leaving $P_y\,dy\wedge dx + Q_x\,dx\wedge dy = (Q_x - P_y)\,dx\wedge dy$.` },
      { label: 'Read it', text: t`On a region oriented anticlockwise, $dx\wedge dy$ integrates as $dA$, so $\int_{\partial D}\omega = \int_D d\omega$ says $\oint_{\partial D}P\,dx + Q\,dy = \iint_D(Q_x - P_y)\,dA$ — Green’s theorem. Nobody put the curl in by hand: the sign rule $dy\wedge dx = -dx\wedge dy$ produced it.` },
      { label: 'Check', text: t`For $\omega = -y^3\,dx + x^3\,dy$: $d\omega = (3x^2 + 3y^2)\,dx\wedge dy$, and over the unit disk $\int_0^{2\pi}\!\int_0^1 3r^2\cdot r\,dr\,d\theta = \tfrac{3\pi}{2}$. Round the circle $x = \cos t$, $y = \sin t$: $\omega = (\sin^4 t + \cos^4 t)\,dt$, whose average over a turn is $\tfrac34$, so $\oint\omega = \tfrac34\cdot2\pi = \tfrac{3\pi}{2}$ ✓.` },
    ],
    answer: t`$d\omega = (Q_x - P_y)\,dx\wedge dy$, so the theorem is Green’s; here both sides are $\tfrac{3\pi}{2} \approx 4.712$.`,
  },
  practice: [
    match({
      id: 'costumes', difficulty: 1,
      prompt: 'Match each theorem with its region Ω and boundary ∂Ω.',
      visual: costumesPic('The four regions, each with its boundary in gold: the ends of an interval and of a curve (− at the start, + at the finish), the edge of a surface, the closed skin of a solid with its normals pointing out.'),
      left: [
        t`$\int_a^b f'(x)\,dx = f(b) - f(a)$`,
        t`$\int_C\nabla f\cdot d\vec r = f(B) - f(A)$`,
        t`$\iint_S(\nabla\times\vec F)\cdot d\vec S = \oint_{\partial S}\vec F\cdot d\vec r$`,
        t`$\iiint_E\nabla\cdot\vec F\,dV = \oiint_{\partial E}\vec F\cdot d\vec S$`,
      ],
      right: ['an interval; its two end points, with signs', 'a curve in space; its two end points, with signs', 'a surface; the closed curve round its edge', 'a solid; the closed surface round it', 'a closed surface; the curve round its edge'],
      answer: [0, 1, 2, 3],
      hints: ['In each theorem, the side with the derivative is an integral over the region; the other side lives on its boundary, one dimension lower.'],
      teach: 'Each costume integrates a derivative over a region and the original thing over that region’s boundary, one dimension lower.',
      explain: t`An interval and its ends; a curve and its ends; a surface and its edge; a solid and its skin. The fifth option describes nothing: a closed surface has no edge. The boundary of a boundary is always empty — the next problems show what that buys.`,
    }),
    num({
      id: 'missing-cell', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3]), miss = r.int(0, 5);
        // cells: top row y = 0.5, then bottom row y = −0.5, each left to right; circulation = (3x − y + k) × area 1
        const cells = [0.5, -0.5].flatMap((y) => [-1, 0, 1].map((x) => ({ x, y, v: 3 * x - y + k })));
        const ans = cells[miss].v, total = 6 * k, sum5 = total - ans;
        const cellTeX = (c, i) => (i === miss ? '?' : nice(c.v));
        const row = (j) => cells.slice(3 * j, 3 * j + 3).map((c, i) => cellTeX(c, 3 * j + i)).join(' & ');
        return {
          prompt: t`The rectangle $-1.5 \le x \le 1.5$, $-1 \le y \le 1$ in the field drawn is cut into six unit squares, each walked anticlockwise. Their circulations $\oint\vec F\cdot d\vec r$ are laid out as the cells are, with one unknown:

$$\begin{array}{|c|c|c|}\hline ${row(0)} \\ \hline ${row(1)} \\ \hline\end{array}$$

The circulation round the whole rectangle’s boundary is $${total}$. Find the missing cell’s circulation.`,
          visual: { type: 'c3-cells', params: { mode: 'circ', P: 'y^2 - x*y', Q: `x^2 + x*y + ${k}*x`, x: [-2.3, 2.3], y: [-1.4, 1.4], region: { kind: 'rect', x: [-1.5, 1.5], y: [-1, 1] }, n: 3, nSlider: false, probe: null, readout: false, density: 12 }, caption: 'The rectangle cut into six cells, each walked anticlockwise (small arrows): every inner edge carries two opposite arrows. Field arrows show direction only.' },
          answer: ans, tol: { abs: 1e-6 },
          errors: uniq([
            { value: -ans, feedback: 'The cells add up to the boundary, so the missing one is the boundary’s circulation minus the other five — not the other way round.' },
            { value: k, feedback: 'The cells are not equal shares of the total: each one’s circulation is about the curl at its centre times its area, and the curl varies from cell to cell.' },
          ], ans),
          hints: ['Every inner edge is walked once each way, by the two cells that share it, so it cancels from the sum.', t`So the six circulations add up to the boundary’s: $${total}$.`],
          teach: 'Cut a region into cells and their circulations add up to the circulation round the outer boundary, because every inner edge cancels.',
          explain: t`The six add up to $${total}$, so the missing one is $${total} - (${nice(sum5)}) = ${nice(ans)}$. Green’s theorem agrees cell by cell: here $\vec F = \langle y^2 - xy,\ x^2 + xy + ${k}x\rangle$ has $Q_x - P_y = 3x - y + ${k}$, which is linear, so a unit cell’s circulation is exactly the curl at its centre — at $(${nice(cells[miss].x)}, ${nice(cells[miss].y)})$ that is $${nice(ans)}$ ✓.`,
        };
      },
    }),
    multi({
      id: 'always-zero', difficulty: 2,
      prompt: t`Which of these are zero for **every** smooth function $f$ and smooth field $\vec F$ on all of space? Here $C$ is any closed curve and $S$ any closed surface.`,
      visual: CHAINS,
      choices: [
        t`$\nabla\times(\nabla f)$`,
        t`$\nabla\cdot(\nabla\times\vec F)$`,
        t`$\oint_C\nabla f\cdot d\vec r$`,
        t`$\oiint_S(\nabla\times\vec F)\cdot d\vec S$`,
        t`$\nabla\cdot(\nabla f)$`,
        t`$\oint_C\vec F\cdot d\vec r$`,
      ],
      answer: [0, 1, 2, 3],
      why: {
        4: t`That is grad then div, which skips curl: it is the Laplacian $\nabla^2 f$, zero only for special $f$. For $f = x^2$ it is $2$.`,
        5: t`Only for conservative fields. The swirl $\langle -y, x, 0\rangle$ has circulation $2\pi$ round the unit circle.`,
      },
      hints: ['Top row of the picture: two steps of d in a row. Bottom row: a closed curve or surface is a boundary, and has no boundary of its own.', t`$\oint_C\nabla f\cdot d\vec r = f(\text{end}) - f(\text{start})$, and a closed curve ends where it starts.`],
      teach: 'Two steps of d in a row give zero (curl grad = 0, div curl = 0), and a boundary has no boundary — the same fact, seen from each side of the theorem.',
      explain: t`$\nabla\times\nabla f = \vec 0$ and $\nabla\cdot(\nabla\times\vec F) = 0$ are $d\,d = 0$. The two integrals vanish because a closed curve has no end points and a closed surface has no edge ($\partial\partial = \varnothing$): $\oint_C\nabla f\cdot d\vec r$ is $f$ summed over $C$’s (empty) set of end points, and $\oiint_S(\nabla\times\vec F)\cdot d\vec S$ is the circulation round $S$’s (empty) edge. Each pair is linked by the theorem: $\oiint_S(\nabla\times\vec F)\cdot d\vec S = \iiint\nabla\cdot(\nabla\times\vec F)\,dV = 0$ too.`,
    }),
    mcq({
      id: 'forms-2', difficulty: 3,
      prompt: t`*Preview of forms.* A 2-form in space, $\omega = P\,dy\wedge dz + Q\,dz\wedge dx + R\,dx\wedge dy$, is what gets integrated over surfaces: it is $\vec F\cdot d\vec S$ for $\vec F = \langle P, Q, R\rangle$. Its exterior derivative is found term by term, $d(P\,dy\wedge dz) = dP\wedge dy\wedge dz$ with $dP = P_x\,dx + P_y\,dy + P_z\,dz$, and any wedge with a repeated factor (such as $dy\wedge dy\wedge dz$) is zero. What is $d\omega$?`,
      visual: fluxPic(['x^2', 'y + z', 'x*z'], [boxSurface([0, 1], [0, 1], [0, 1], 'Cube')], { range: 1.3, normals: false, arrowLen: 0.22, n: 16, caption: t`A solid $E$ (the unit cube) and its boundary $\partial E$, tinted by the flux integrand of $\vec F = \langle x^2,\ y + z,\ xz\rangle$: what $\int_{\partial E}\omega$ adds up. Drag to rotate.` }),
      choices: [
        t`$(P_x + Q_y + R_z)\,dx\wedge dy\wedge dz$ — the divergence times the volume element`,
        t`$(\nabla\times\vec F)\cdot d\vec S$ — the curl`,
        t`The sum of all nine partial derivatives $P_x + P_y + \dots + R_z$, times $dx\wedge dy\wedge dz$`,
        t`$0$, because $d\,d = 0$`,
      ],
      answer: 0,
      why: {
        1: 'Curl is d of a 1-form, F·dr, along curves. A 2-form is one degree higher, so its d is a 3-form — a volume element, integrated over solids.',
        2: t`In $dP\wedge dy\wedge dz$ the $P_y\,dy$ and $P_z\,dz$ terms repeat a $dy$ or a $dz$, and a repeated displacement spans no volume. Only $P_x$ survives.`,
        3: t`$d\,d = 0$ applies to a form that is already $d$ of something — here, $\vec F\cdot d\vec S$ with $\vec F$ a curl. A general $\vec F\cdot d\vec S$ is not, and its $d$ is zero only when $\nabla\cdot\vec F = 0$.`,
      },
      hints: [t`$d(P\,dy\wedge dz) = (P_x\,dx + P_y\,dy + P_z\,dz)\wedge dy\wedge dz$: which terms survive?`, t`$dz\wedge dx\wedge dy$ and $dy\wedge dz\wedge dx$ are cyclic shuffles of $dx\wedge dy\wedge dz$ — two swaps each, so no change of sign.`],
      teach: 'The exterior derivative of the flux 2-form F·dS is (∇·F) dV, so ∫∂E ω = ∫E dω is the divergence theorem.',
      explain: t`$d(P\,dy\wedge dz) = P_x\,dx\wedge dy\wedge dz$, $d(Q\,dz\wedge dx) = Q_y\,dy\wedge dz\wedge dx = Q_y\,dx\wedge dy\wedge dz$, and $d(R\,dx\wedge dy) = R_z\,dz\wedge dx\wedge dy = R_z\,dx\wedge dy\wedge dz$. So $d\omega = (\nabla\cdot\vec F)\,dV$, and $\int_{\partial E}\omega = \int_E d\omega$ is the divergence theorem — the last row of the table. The same rules applied to a 1-form in space give $(\nabla\times\vec F)\cdot d\vec S$, and Stokes’ theorem.`,
    }),
    num({
      id: 'shell', difficulty: 3,
      gen(r) {
        const k = r.pick([-1, 0, 2]), R = r.pick([2, 3]);
        const ans = (k + 2) * R ** (k - 1);
        const inner = { x: '0.8*sin(v)*cos(u)', y: '0.8*sin(v)*sin(u)', z: '0.8*cos(v)', u: [0, '2*pi'], v: [0, 'pi'] };
        const outer = { x: '1.3*sin(u)*cos(v)', y: '1.3*sin(u)*sin(v)', z: '1.3*cos(u)', u: [0, 'pi'], v: [0, '1.5*pi'] };
        const e = r6((k - 1) / 2);
        return {
          prompt: t`The divergence in spherical coordinates, from the divergence theorem. For a radial field $\vec F = f(r)\,\hat r$, apply the theorem to a thin shell between the spheres of radius $r$ and $r + \Delta r$. The flux out is $4\pi(r + \Delta r)^2 f(r + \Delta r) - 4\pi r^2 f(r)$ (out through the outer sphere, minus what comes in through the inner one), and the shell’s volume is about $4\pi r^2\,\Delta r$. Use this to find $\nabla\cdot\vec F$ at $r = ${R}$ for $\vec F = ${pw(k)}\,\hat r$.`,
          visual: fluxPic([`x*(x^2 + y^2 + z^2)^(${e})`, `y*(x^2 + y^2 + z^2)^(${e})`, `z*(x^2 + y^2 + z^2)^(${e})`], [{ label: 'Shell', pieces: [outer, inner] }], { range: 1.6, alpha: 0.55, yaw: -0.8, pitch: 0.3, n: 18, caption: 'A thick shell, cut away to show its inner sphere. Its boundary is both spheres: the outer one with normals out (the field leaves, blue), the inner one with normals pointing to the centre (the field enters, red). Drag to rotate.' }),
          answer: ans, tol: { rel: 1e-3 },
          errors: uniq([
            { value: k * R ** (k - 1), feedback: 'That is just f′(r), as if the field lived on a line. The shell’s area grows as r², and that growth counts too: the flux out is r²f, not f.' },
            { value: (k + 1) * R ** (k - 1), feedback: 'That is the formula for circles, (1/r)(rf)′, where the boundary grows as r. A sphere’s area grows as r².' },
          ], ans),
          hints: [t`Divide the flux by the volume and let $\Delta r \to 0$: $\nabla\cdot\vec F = \dfrac{1}{r^2}\dfrac{d}{dr}\big(r^2 f(r)\big)$.`, t`Here $r^2 f = ${pw(k + 2)}$. Differentiate, divide by $r^2$, then put $r = ${R}$.`],
          teach: 'The divergence theorem on a thin shell gives the divergence of a radial field: ∇·(f r̂) = (1/r²) d(r²f)/dr.',
          explain: t`$\nabla\cdot\vec F = \dfrac{1}{r^2}\dfrac{d}{dr}${k + 2 === 0 ? '1' : pw(k + 2)} = ${co(k + 2, pw(k - 1))}$, which at $r = ${R}$ is $${nice(ans)}$. The $r^2$ is the sphere’s area growing: a radial field must weaken as $1/r^2$ just to keep its divergence zero, which is why $\hat r/r^2$ is the field of a point source. The same bookkeeping on a small curved box gives grad, div and curl in any orthogonal coordinates, with **scale factors** such as $r$ and $r\sin\theta$ in place of the $r^2$.`,
        };
      },
    }),
    num({
      id: 'flatland', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 4, 5]), k = r.pick([2, 3]);
        const ans = k ** (n - 1);
        return {
          prompt: t`Suppose space had $n$ dimensions, and gravity still obeyed Gauss’s law: the flux of $\vec g$ out of any closed surface is fixed by the mass inside. Round a point mass, a “sphere” of radius $r$ in $n$ dimensions has a size proportional to $r^{n-1}$ (a circle’s length $\propto r$ when $n = 2$, an ordinary sphere’s area $\propto r^2$ when $n = 3$). If $n = ${n}$, by what factor does gravity weaken when you go ${k} times as far from the mass?`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, 1], y: [-4.3, 4.3], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'distance r', ylabel: 'strength of g',
              curves: [2, 3, 4, 5].map((m, j) => ({ fn: `${1 - m}*x`, color: ['accent', 'gold', 'violet', 'teal'][j], width: m === n ? 3.4 : 1.8, label: `n = ${m}`, labelAt: -0.86, labelDx: 10, labelDy: -10 })),
            },
            caption: 'Gravity’s strength against distance on log–log axes, as Gauss’s law would make it in 2, 3, 4 and 5 dimensions (the case in the question drawn thicker), scaled to 1 at r = 1. Each law is a straight line: g falls n − 1 powers of ten for every power of ten in distance.',
          },
          answer: ans, tol: { rel: 1e-6 },
          errors: uniq([
            { value: k ** 2, feedback: 'That is our three-dimensional inverse-square law. In n dimensions the sphere’s size grows as rⁿ⁻¹, and the field must fall just as fast.' },
            { value: k ** n, feedback: 'That uses the volume inside, which grows as rⁿ. The flux crosses the sphere itself, whose size grows as rⁿ⁻¹.' },
          ], ans),
          hints: [t`Take a sphere of radius $r$ round the mass: by symmetry $g$ is the same all over it and perpendicular to it, so the flux is $g$ times the sphere’s size, $\propto g\,r^{n-1}$.`, t`That flux is fixed, so $g \propto 1/r^{n-1}$: going ${k} times as far divides $g$ by ${k} to the power $n - 1$.`],
          teach: 'Gauss’s law in n dimensions gives a force falling as 1/rⁿ⁻¹: the inverse-square law is the three-dimensional costume.',
          explain: t`$g \propto 1/r^{${n - 1}}$, so the factor is ${n - 1 === 1 ? `$${k}$` : `$${k}^{${n - 1}} = ${ans}$`}. Our $1/r^2$ law is the case $n = 3$. Ehrenfest pointed out in 1917 that with $n \ge 4$ gravity would fall off so fast that no planetary orbit would be stable. Experiments that test Newton’s law at sub-millimetre distances are looking for exactly this kind of change, which some theories with extra, tiny dimensions predict; none has been seen.`,
        };
      },
    }),
    mcq({
      id: 'error-boundary', difficulty: 2, kind: 'error',
      prompt: t`A student has just learnt that a boundary has no boundary: the edge of the hemisphere is a closed curve, with no end points. They conclude: “So by $\int_{\partial\Omega}\omega = \int_\Omega d\omega$, the circulation $\oint_{\partial S}\vec F\cdot d\vec r$ round the hemisphere’s edge is $0$ for every field $\vec F$.” For $\vec F = \langle -y, x, 0\rangle$ the readout says $2\pi$. What went wrong?`,
      visual: fluxPic(['-y', 'x', '0'], [HEMI], { curlF: ['0', '0', '2'], integrand: 'curl', readouts: ['circ', 'flux'], range: 1.3, yaw: 0.5, pitch: 0.38, caption: 'The upper hemisphere, tinted by the flux integrand of the curl, with its edge (the equator) and the field along it. Both readouts are computed numerically. Drag to rotate.' }),
      choices: [
        t`An empty boundary makes the integral vanish only when the integrand is itself a derivative: $\oint\nabla g\cdot d\vec r = 0$. For a general field, $\oint_{\partial S}\vec F\cdot d\vec r = \iint_S(\nabla\times\vec F)\cdot d\vec S$, which here is $2\pi$`,
        t`Nothing: the circulation round any closed curve is $0$, so the readout is wrong`,
        'The hemisphere’s edge is not a closed curve',
        'The theorem holds only for flat surfaces',
      ],
      answer: 0,
      why: {
        1: t`That holds only for conservative fields. On the unit circle $\langle -y, x, 0\rangle\cdot d\vec r = (\sin^2 t + \cos^2 t)\,dt = dt$, which adds up to $2\pi$.`,
        2: 'It is: the equator, a circle, which ends where it starts. That is exactly what “a boundary has no boundary” says.',
        3: 'Stokes’ theorem holds for any smooth oriented surface; the flat case is Green’s theorem.',
      },
      hints: ['To use the theorem on the closed curve itself, the integrand round it would have to be a d of something — the circulation of a gradient.', t`What does the theorem say about $\oint_{\partial S}\vec F\cdot d\vec r$ instead?`],
      teach: 'A boundary has no boundary, so the integral of an exact integrand round it vanishes — but a general F·dr is not exact.',
      explain: t`Using the theorem on a closed curve $\partial S$ needs its integrand to be $d$ of something: $\oint_{\partial S}\nabla g\cdot d\vec r = $ ($g$ over the empty set of end points) $= 0$. For a general $\vec F$ the theorem instead links the circulation to the surface: $\oint_{\partial S}\vec F\cdot d\vec r = \iint_S(\nabla\times\vec F)\cdot d\vec S = 2\cdot\pi\cdot1^2 = 2\pi$, as the readouts show.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-helix', difficulty: 2,
      gen(r) {
        const [T, TT] = r.pick([[5 * PI / 2, t`\tfrac{5\pi}{2}`], [3 * PI / 2, t`\tfrac{3\pi}{2}`], [3 * PI, t`3\pi`]]);
        const f = (x, y, z) => x * z + y * y + z + x;
        const end = [Math.cos(T), Math.sin(T), T / PI];
        const ans = f(...end) - f(1, 0, 0);
        return {
          prompt: t`Find the work done by $\vec F = \langle z + 1,\ 2y,\ x + 1\rangle$ along the helix $\vec r(t) = \langle \cos t,\ \sin t,\ t/\pi\rangle$ from $t = 0$ to $t = ${TT}$.`,
          visual: { type: 'c3-curve', params: { curve: { param: ['cos(t)', 'sin(t)', 't/pi'], t: [0, r6(T)] }, at: r6(T), fixed: true, show: [], readouts: [], play: false, range: 3.2 }, caption: 'The helix, from (1, 0, 0) to its end point (the dot). Drag to rotate.' },
          answer: ans, tol: { abs: 1e-3 },
          errors: uniq([
            { value: f(...end), feedback: t`That is $f$ at the end only; subtract its value at the start, $f(1, 0, 0) = 1$.` },
            { value: -ans, feedback: 'That is start minus end: the gradient theorem gives f(end) − f(start).' },
          ], ans),
          hints: [t`Look for $f$ with $\nabla f = \vec F$.`],
          teach: 'For a gradient field, the line integral is the potential’s change between the end points, whatever the path.',
          explain: t`$\vec F = \nabla f$ with $f = xz + y^2 + z + x$ (check: $f_x = z + 1$, $f_y = 2y$, $f_z = x + 1$). The helix ends at $(${z9(end[0])}, ${z9(end[1])}, ${z9(end[2])})$, so the work is $f(\text{end}) - f(1, 0, 0) = ${z9(f(...end))} - 1 = ${z9(ans)}$ — the second row of the table, with no integral along the helix at all.`,
        };
      },
    }),
    num({
      id: 'cp-sixth', difficulty: 3,
      gen(r) {
        const [a, b, c] = r.pick([[2, 3, 1], [2, -1, 3], [4, 3, 2]]);
        const faces = { x1: c / 2, x0: -c / 2, y1: a / 2, y0: 0, z0: -b };
        const ans = b - a / 2;
        return {
          prompt: t`For $\vec F = \langle ${co(a, 'xyz')},\ ${co(b, 'x^2')},\ ${co(c, 'y^2z')}\rangle$, the outward fluxes of $\nabla\times\vec F$ through five faces of the unit cube $0 \le x, y, z \le 1$ are: $${nice(faces.x1)}$ through $x = 1$, $${nice(faces.x0)}$ through $x = 0$, $${nice(faces.y1)}$ through $y = 1$, $${nice(faces.y0)}$ through $y = 0$, and $${nice(faces.z0)}$ through the bottom, $z = 0$. Find the outward flux of $\nabla\times\vec F$ through the top face, $z = 1$.`,
          visual: fluxPic([`${a}*x*y*z`, `${b}*x^2`, `${c}*y^2*z`], [boxSurface([0, 1], [0, 1], [0, 1], 'Cube')], { curlF: [`${2 * c}*y*z`, `${a}*x*y`, `${2 * b}*x - ${a}*x*z`], integrand: 'curl', range: 1.3, normals: false, arrowLen: 0.2, n: 16, caption: 'The unit cube, tinted by the outward flux integrand of the curl. Drag to rotate.' }),
          answer: ans, tol: { abs: 1e-6 },
          errors: uniq([
            { value: b, feedback: 'Opposite faces need not cancel in pairs. Only the total over all six faces is fixed.' },
            { value: -ans, feedback: 'The six fluxes add up to zero, so the sixth is minus the sum of the other five.' },
          ], ans),
          hints: ['What is the flux of a curl out of a closed surface?', t`Either costume answers it: the divergence theorem with $\nabla\cdot(\nabla\times\vec F) = 0$, or Stokes’ theorem on a surface with no edge.`],
          teach: 'The flux of a curl out of any closed surface is zero: div curl = 0 inside, and no edge to circulate round.',
          explain: t`The cube’s surface is closed, so the six outward fluxes of $\nabla\times\vec F$ add up to $0$ — by the divergence theorem with $\nabla\cdot(\nabla\times\vec F) = 0$, or by Stokes with no edge. The other five add up to $${nice(-ans)}$, so the top carries $${nice(ans)}$. Directly: $\nabla\times\vec F = \langle ${co(2 * c, 'yz')},\ ${co(a, 'xy')},\ ${co(2 * b, 'x')} - ${co(a, 'xz')}\rangle$, and on $z = 1$, $\int_0^1\!\int_0^1(${co(2 * b, 'x')} - ${co(a, 'x')})\,dx\,dy = ${nice(ans)}$ ✓.`,
        };
      },
    }),
    mcq({
      id: 'cp-charge', difficulty: 3, transfer: true,
      prompt: t`Maxwell’s corrected Ampère law is $\nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\,\dfrac{\partial\vec E}{\partial t}$, with $\vec J$ the current density. Take the divergence of both sides and use Gauss’s law, $\nabla\cdot\vec E = \rho/\varepsilon_0$. What does $\nabla\cdot(\nabla\times\vec B) = 0$ — this lesson’s $d\,d = 0$ — then tell you?`,
      visual: fluxPic(['-x', '-y', '-z'], [{ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }], { range: 1.5, normals: false, alpha: 0.45, arrowsOn: 'grid', grid: 5, arrowLen: 0.3, caption: t`Current density $\vec J$ flowing in through a closed surface, tinted red where it enters. Drag to rotate.` }),
      choices: [
        t`$\dfrac{\partial\rho}{\partial t} + \nabla\cdot\vec J = 0$: charge is conserved — it can only flow from place to place, never appear or vanish`,
        t`$\nabla\cdot\vec J = 0$ always, so charge can never pile up anywhere`,
        t`$\nabla\cdot\vec B = 0$: there are no magnetic charges`,
        t`Nothing: both sides are zero, so it reads $0 = 0$`,
      ],
      answer: 0,
      why: {
        1: 'That is what Ampère’s law without Maxwell’s term would force — and a charging capacitor plate contradicts it. With the term, charge can pile up exactly as fast as current brings it.',
        2: t`True, but a different Maxwell equation. The divergence of $\nabla\times\vec B$ is zero whatever $\vec B$ is, so this step says nothing about $\nabla\cdot\vec B$.`,
        3: t`The left side is identically zero; the right side is not obviously zero, and requiring it to be is the content: $\mu_0\left(\nabla\cdot\vec J + \partial\rho/\partial t\right) = 0$.`,
      },
      hints: ['Take the divergence of each term; swap the order of ∇· and ∂/∂t in the last one.', 'Replace ∇·E by ρ/ε₀.'],
      teach: 'Div curl = 0 applied to the Ampère–Maxwell law gives charge conservation, ∂ρ/∂t + ∇·J = 0.',
      explain: t`$0 = \nabla\cdot(\nabla\times\vec B) = \mu_0\nabla\cdot\vec J + \mu_0\varepsilon_0\dfrac{\partial}{\partial t}(\nabla\cdot\vec E) = \mu_0\left(\nabla\cdot\vec J + \dfrac{\partial\rho}{\partial t}\right)$. Integrated over any region, the divergence theorem turns this into: the charge inside changes only by the current through the boundary. Maxwell’s term is exactly what makes his equations agree with charge conservation; Physics II’s two surfaces on one loop round a charging capacitor are the integral form of the same fact. In the language of forms, Maxwell’s equations are $dF = 0$ and $d{\star}F = {\star}J$, and applying $d$ to the second gives $d{\star}J = d\,d{\star}F = 0$: this conservation law.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.7 Stokes’ theorem', url: 'https://openstax.org/books/calculus-volume-3/pages/6-7-stokes-theorem' },
    { label: 'OpenStax Calculus Vol. 3, §6.8 The divergence theorem', url: 'https://openstax.org/books/calculus-volume-3/pages/6-8-the-divergence-theorem' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 2 (differential forms, the exterior derivative, Stokes’ theorem and Maxwell’s equations as dF = 0)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
