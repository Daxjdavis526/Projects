// Green's theorem: the circulation round a closed curve is the double
// integral of Q_x − P_y over the region inside, because the region's small
// cells cancel along every inner edge. Its flux form, area as a line
// integral (the planimeter and the surveyor's shoelace), and regions with holes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { fieldPic, path, paths, r6, co } from './_fields.js';

const t = String.raw;
const PI = Math.PI;

/** A small picture on c3-cells: field, region, cells; no numbers. */
const cellsPic = (P, Q, region, { x, y, n = 3, mode = 'circ', caption, ...rest }) => ({
  type: 'c3-cells',
  params: { P, Q, region, x, y, n, mode, readout: false, probe: null, ...rest },
  caption,
});
/** An annulus r0 ≤ r ≤ r1 about the origin, shaded on a graph, with its two circles. */
const annulus = (r0, r1, { labels = true, extra = {} } = {}) => ({
  shade: [
    { fn: `sqrt(max(0, ${r1 * r1} - x^2))`, lower: `sqrt(max(0, ${r0 * r0} - x^2))`, from: -r1, to: r1, color: 'accent', alpha: 0.22 },
    { fn: `-sqrt(max(0, ${r0 * r0} - x^2))`, lower: `-sqrt(max(0, ${r1 * r1} - x^2))`, from: -r1, to: r1, color: 'accent', alpha: 0.22 },
  ],
  curves: [
    { param: [`${r1}*cos(t)`, `${r1}*sin(t)`], t: [0, 2 * PI], color: 'gold', width: 2.6, ...(labels ? { label: 'outer boundary', labelAt: 0.6, labelDx: 8, labelDy: -8 } : {}) },
    { param: [`${r0}*cos(t)`, `${r0}*sin(t)`], t: [0, 2 * PI], color: 'gold', width: 2.6, ...(labels ? { label: 'inner boundary', labelAt: -0.5, labelDx: 8, labelDy: 14 } : {}) },
  ],
  ...extra,
});

export default lesson({
  id: 'math2210.C3-5.4',
  title: 'Green’s theorem',
  minutes: 12, difficulty: 3,
  intro: t`Green’s theorem trades a line integral round a closed curve for a double integral over the region inside it:

$$\oint_C P\,dx + Q\,dy = \iint_D \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right) dA$$

The curve $C$ is the whole boundary of $D$, walked with $D$ on your **left** — anticlockwise round the outside. Why it is true: cut $D$ into small cells; each cell’s circulation is about $(Q_x - P_y)$ times its area; and neighbouring cells walk their shared edge in opposite directions, so **every inner edge cancels** and only the outer boundary is left. The same bookkeeping with outward flux gives the **flux form**, $\oint_C \vec F\cdot\hat n\,ds = \iint_D (P_x + Q_y)\,dA$.`,
  symbols: [
    { tex: 'D', text: 'a region of the plane, bounded and with a piecewise smooth edge' },
    { tex: 'C = \\partial D', text: 'its boundary, oriented with $D$ on the left: anticlockwise round the outside, clockwise round any hole' },
    { tex: 'P\\,dx + Q\\,dy', text: 'the same as $\\vec F\\cdot d\\vec r$ for $\\vec F = \\langle P, Q\\rangle$: the left side is the **circulation** round $C$' },
    { tex: '\\dfrac{\\partial Q}{\\partial x} - \\dfrac{\\partial P}{\\partial y}', text: 'the circulation per unit area at a point — the $z$-component of the curl of $\\vec F$ (two lessons on, it gets its name)' },
    { tex: 'dA', text: 'an element of area, as in any double integral: $dx\\,dy$, or $r\\,dr\\,d\\theta$ in polar coordinates' },
  ],
  why: t`Green’s theorem is Stokes’ theorem lying flat; it is why a planimeter can measure a map’s area by tracing its edge, and why the vortex field’s $2\pi$ must hide at its singular point.`,
  visual: {
    type: 'c3-cells',
    title: 'Cut it into cells: the inner edges cancel',
    lead: t`The region is cut into cells, each walked anticlockwise and tinted by its circulation per unit area (blue positive, red negative). Each inner edge is walked twice, once in each direction — see the paired arrows. The readout compares the sum over the cells, the circulation round the boundary and $\iint_D (Q_x - P_y)\,dA$.`,
    tasks: [
      'Change the number of cells: the sum over the cells always equals the circulation round the boundary, because the inner edges cancel in pairs.',
      t`Drag the probe and raise the number of cells: its cell’s circulation ÷ area settles on the value of $Q_x - P_y$ (the curl) at its centre.`,
      t`Vortex on the disk: all the circulation sits in the cells touching the origin, and $\iint_D (Q_x - P_y)\,dA$ misses it. Choose the annulus: the hole removes the origin, and Green’s theorem holds again.`,
      'Switch the picture to Flux: each cell’s outward flux adds up the same way, to the divergence integral.',
    ],
    params: {
      modes: ['circ', 'flux'], mode: 'circ',
      P: pickExpr('k', ['-y', 'x', 'sin(x) + sin(y)', '-y/(x^2 + y^2)']), Q: pickExpr('k', ['x', 'y', 'sin(x) - sin(y)', 'x/(x^2 + y^2)']),
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Whirl'], [1, 'Source'], [2, 'Waves'], [3, 'Vortex']], value: 2, explain: t`Whirl $\langle -y, x\rangle$: $Q_x - P_y = 2$. Source $\langle x, y\rangle$: no circulation, divergence $2$. Waves $\langle \sin x + \sin y,\ \sin x - \sin y\rangle$: both equal $\cos x - \cos y$. Vortex $\langle -y, x\rangle/r^2$: zero away from the origin, where it is undefined.` }],
      regions: [{ label: 'Rectangle', kind: 'rect', x: [-2.05, 1.95], y: [-1.25, 1.35] }, { label: 'Disk', kind: 'disk', c: [0, 0], r: 1.6 }, { label: 'Annulus', kind: 'annulus', c: [0, 0], r: [0.6, 1.7] }],
      x: [-2.8, 2.8], y: [-1.85, 1.85], n: 3, probe: [0.75, 0.45],
    },
    caption: t`Each cell’s tint is its circulation (or outward flux) per unit area. Field arrows show direction only. All integrals are computed numerically; the cells’ sum matches the boundary to rounding error, for any number of cells.`,
  },
  example: {
    prompt: t`Use Green’s theorem to evaluate $\oint_C y^2\,dx + 3xy\,dy$, where $C$ is the boundary of the half-disk $x^2 + y^2 \le 4$, $y \ge 0$, walked anticlockwise. Then check it directly.`,
    visual: fieldPic('y^2', '3*x*y', {
      x: [-3.4, 3.4], y: [-0.6, 2.6], n: 17,
      shade: [{ fn: 'sqrt(max(0, 4 - x^2))', from: -2, to: 2, color: 'accent', alpha: 0.18 }],
      ...paths(path('2*cos(t)', '2*sin(t)', [0, PI], { at: [0.25, 0.75], width: 2.6 }), path('t', '0', [-2, 2], { at: [0.5], width: 2.6 })),
      caption: t`The field $\langle y^2, 3xy\rangle$ (arrows compressed) and the half-disk $D$, its boundary walked anticlockwise: over the arc, then back along the diameter.`,
    }),
    steps: [
      { label: 'Read off P and Q', text: t`$P = y^2$ and $Q = 3xy$. The boundary is walked with $D$ on the left, as Green’s theorem needs.` },
      { label: 'The integrand', text: t`$\dfrac{\partial Q}{\partial x} - \dfrac{\partial P}{\partial y} = 3y - 2y = y$.` },
      { label: 'Double integral', text: t`In polar coordinates the half-disk is $0 \le r \le 2$, $0 \le \theta \le \pi$: $\displaystyle\iint_D y\,dA = \int_0^{\pi}\!\!\int_0^2 (r\sin\theta)\,r\,dr\,d\theta = \frac{8}{3}\cdot 2 = \frac{16}{3}$.` },
      { label: 'Check: the diameter', text: t`On $y = 0$ both $y^2\,dx$ and $3xy\,dy$ vanish: it contributes $0$.` },
      { label: 'Check: the arc', text: t`With $x = 2\cos t$, $y = 2\sin t$, $0 \le t \le \pi$: $y^2\,dx = -8\sin^3 t\,dt$ and $3xy\,dy = 24\cos^2 t\sin t\,dt$, so the arc gives $\int_0^\pi(-8\sin^3 t + 24\cos^2 t\sin t)\,dt = -\tfrac{32}{3} + 16 = \tfrac{16}{3}$ ✓.` },
      { label: 'Meaning', text: t`The circulation density $Q_x - P_y = y$ is positive throughout the half-disk and grows toward the top, so the net circulation is positive.` },
    ],
    answer: t`$\oint_C y^2\,dx + 3xy\,dy = \tfrac{16}{3}$`,
  },
  practice: [
    mcq({
      id: 'orientation', difficulty: 1,
      prompt: t`To apply Green’s theorem on the ring-shaped region $D$ between two circles, which way must its two boundary circles be walked?`,
      visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-1.75, 1.75], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', ...annulus(0.75, 1.6) }, caption: t`The region $D$ (shaded): a disk with a hole. Its boundary is two circles.` },
      choices: ['Outer anticlockwise, inner clockwise: D always on the left', 'Both anticlockwise', 'Both clockwise', 'Outer clockwise, inner anticlockwise'],
      fixedOrder: true, answer: 0,
      why: {
        1: t`Walking the inner circle anticlockwise puts the **hole** on your left, not $D$.`,
        2: t`Clockwise round the outside puts the outside world on your left. The rule is: $D$ on the left.`,
        3: t`That reverses both, which reverses the sign of the whole line integral.`,
      },
      hints: ['Imagine walking each circle with the shaded region on your left hand.'],
      teach: 'The boundary is always walked with the region on the left: anticlockwise outside, clockwise round holes.',
      explain: 'With D on your left, the outer circle goes anticlockwise and the inner one clockwise. That is exactly what cutting D into cells produces: each cell is walked anticlockwise, and along the hole the cells next to it walk clockwise round the centre.',
    }),
    num({
      id: 'rect', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [1, 2], [3, 1], [2, 2], [3, 2]]);
        const val = (5 * a * b * b) / 2;
        return {
          prompt: t`Use Green’s theorem to find $\oint_C (x - y^2)\,dx + 3xy\,dy$, where $C$ is the boundary of the rectangle $0 \le x \le ${a}$, $0 \le y \le ${b}$, walked anticlockwise.`,
          visual: cellsPic('x - y^2', '3*x*y', { kind: 'rect', x: [0, a], y: [0, b] }, { x: [-0.6, a + 0.6], y: [-0.5, b + 0.5], n: 4, caption: t`The field (direction only) and the rectangle cut into cells, each tinted by its circulation per unit area: deeper blue toward the top.` }),
          answer: val, tol: { rel: 1e-3 },
          errors: [
            { value: (a * b * b) / 2, feedback: t`Check $\partial P/\partial y$: $P = x - y^2$ gives $-2y$, and the integrand is $Q_x - P_y = 3y - (-2y) = 5y$.` },
            { value: a * b + (3 * a * a * b) / 2, feedback: t`That is $\iint (P_x + Q_y)\,dA$, the **flux** form. Circulation uses $Q_x - P_y$.` },
          ],
          hints: [t`Compute $Q_x - P_y$ with $P = x - y^2$, $Q = 3xy$.`, t`$Q_x - P_y = 3y + 2y = 5y$; integrate it over the rectangle.`],
          teach: 'Green’s theorem: circulation round the boundary = ∬ (∂Q/∂x − ∂P/∂y) dA.',
          explain: t`$Q_x - P_y = 5y$, so $\displaystyle\iint_D 5y\,dA = \int_0^{${a}}\!\!\int_0^{${b}} 5y\,dy\,dx = ${a}\cdot\frac{5\cdot ${b * b}}{2} = ${nice(val)}$.`,
        };
      },
    }),
    num({
      id: 'astroid', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]);
        const A = (3 * PI * a * a) / 8;
        return {
          prompt: t`Green’s theorem with $\vec F = \tfrac12\langle -y,\ x\rangle$ (so $Q_x - P_y = 1$) turns area into a line integral: $A = \tfrac12\oint_C (x\,dy - y\,dx)$. Use it to find the area inside the astroid $x = ${co(a, '\\cos^3 t')}$, $y = ${co(a, '\\sin^3 t')}$, $0 \le t \le 2\pi$.`,
          visual: { type: 'graph', params: { x: [-2.2 * a, 2.2 * a], y: [-1.05 * a, 1.05 * a], equal: true, aspect: 'wide', shade: [{ fn: `(${a}^(2/3) - abs(x)^(2/3))^1.5`, lower: `-(${a}^(2/3) - abs(x)^(2/3))^1.5`, from: -a, to: a, color: 'accent', alpha: 0.25 }], ...paths(path(`${a}*cos(t)^3`, `${a}*sin(t)^3`, [0, 2 * PI], { at: [0.125, 0.375, 0.625, 0.875], width: 2.6 })), curves: [path(`${a}*cos(t)^3`, `${a}*sin(t)^3`, [0, 2 * PI], { width: 2.6 }).curve, { param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, 2 * PI], color: 'ink3', width: 1.2, dash: true }] }, caption: t`The astroid (gold, traced anticlockwise) inside the dashed circle of radius ${a} it touches four times.` },
          answer: A, tol: { rel: 2e-3 },
          errors: [{ value: PI * a * a, feedback: t`That is the area of the dashed circle. The astroid pinches inward between its four points.` }],
          hints: [t`$x\,dy - y\,dx = (x\,y' - y\,x')\,dt$ with $x' = -${3 * a}\cos^2 t\sin t$ and $y' = ${3 * a}\sin^2 t\cos t$.`, t`$x\,y' - y\,x' = ${3 * a * a}\sin^2 t\cos^2 t(\cos^2 t + \sin^2 t) = ${3 * a * a}\sin^2 t\cos^2 t$.`, t`$\int_0^{2\pi}\sin^2 t\cos^2 t\,dt = \tfrac{\pi}{4}$.`],
          teach: 'A = ½∮(x dy − y dx): Green’s theorem with a field whose circulation density is 1 measures area by walking the boundary.',
          explain: t`$A = \tfrac12\int_0^{2\pi} ${3 * a * a}\sin^2 t\cos^2 t\,dt = \tfrac12\cdot${3 * a * a}\cdot\tfrac\pi4 = \tfrac{${3 * a * a}\pi}{8} \approx ${nice(+A.toPrecision(4))}$ — three-eighths of the circle’s $\pi a^2$. A mechanical **planimeter** does this integral as its arm traces the edge.`,
        };
      },
    }),
    mcq({
      id: 'zero-circ', difficulty: 2,
      prompt: t`For the field $\vec F = \langle \sin x + \sin y,\ \sin x - \sin y\rangle$, the circulation round the circle $C$ of radius $1.6$ about the origin is $0$. Does that mean $Q_x - P_y = 0$ everywhere inside?`,
      visual: cellsPic('sin(x) + sin(y)', 'sin(x) - sin(y)', { kind: 'disk', c: [0, 0], r: 1.6 }, { x: [-2.6, 2.6], y: [-1.75, 1.75], n: 2, caption: 'The disk cut into cells, each tinted by its circulation per unit area: blue cells circulate anticlockwise, red ones clockwise.' }),
      choices: [
        'No: positive and negative circulation density inside can cancel, as the blue and red cells do here',
        'Yes: zero circulation round the edge means zero curl everywhere inside',
        'Yes, but only because the field is smooth everywhere',
        'No: Green’s theorem does not apply to a circle',
      ],
      answer: 0,
      why: {
        1: t`Green’s theorem equates the circulation with the **integral** of $Q_x - P_y$, not with its value at each point. Here $Q_x - P_y = \cos x - \cos y$, positive in some cells and negative in others.`,
        2: 'Smoothness makes Green’s theorem apply; it does not make every value zero.',
        3: 'A circle is a perfectly good boundary — the disk is the region inside it.',
      },
      hints: [t`Green’s theorem: $\oint_C = \iint_D (Q_x - P_y)\,dA$. Can an integral be zero while its integrand is not?`, t`Compute $Q_x - P_y$ for this field and look at its sign near $(1, 0)$ and $(0, 1)$.`],
      teach: 'Zero circulation round a loop says the circulation density integrates to zero inside, not that it vanishes pointwise.',
      explain: t`$Q_x - P_y = \cos x - \cos y$, which is negative near $(\pm1, 0)$ and positive near $(0, \pm1)$. By symmetry its integral over the disk is $0$, so the circulation is $0$ — the cells cancel each other, not themselves.`,
    }),
    num({
      id: 'flux-form', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 1.5, 2]);
        const val = (3 * PI * R ** 4) / 2;
        return {
          prompt: t`Use the flux form of Green’s theorem, $\oint_C \vec F\cdot\hat n\,ds = \iint_D (P_x + Q_y)\,dA$, to find the outward flux of $\vec F = \langle x^3,\ y^3\rangle$ across the circle of radius ${R} about the origin.`,
          visual: cellsPic('x^3', 'y^3', { kind: 'disk', c: [0, 0], r: R }, { mode: 'flux', x: [-2.6 * R / 1.6, 2.6 * R / 1.6].map(r6), y: [-1.75 * R / 1.6, 1.75 * R / 1.6].map(r6), n: 2, caption: 'The disk cut into cells, each tinted by its net outward flux per unit area — strongest near the rim. Field arrows show direction only.' }),
          answer: val, tol: { rel: 2e-3 },
          errors: [
            { value: 0, feedback: t`That is the circulation form, $Q_x - P_y = 0$ for this field. Flux uses the divergence $P_x + Q_y$.` },
            { value: 2 * PI * R ** 3, feedback: t`In polar coordinates $dA = r\,dr\,d\theta$: the extra factor $r$ is missing.` },
          ],
          hints: [t`$P_x + Q_y = 3x^2 + 3y^2 = 3r^2$.`, t`$\displaystyle\iint_D 3r^2\,dA = \int_0^{2\pi}\!\!\int_0^{${R}} 3r^2\cdot r\,dr\,d\theta$.`],
          teach: 'The flux form: outward flux across a closed curve = ∬ (∂P/∂x + ∂Q/∂y) dA, the divergence integrated over the inside.',
          explain: t`$\displaystyle\int_0^{2\pi}\!\!\int_0^{${R}} 3r^3\,dr\,d\theta = 2\pi\cdot\frac{3\cdot${nice(R ** 4)}}{4} = \frac{${nice(3 * R ** 4)}\pi}{2} \approx ${nice(+val.toPrecision(4))}$. Positive: the field streams out through the circle.`,
        };
      },
    }),
    num({
      id: 'hole', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3]), K = r.pick([4, 5, 7]), R = r.pick([2, 3]);
        const val = K + c * PI * (R * R - 1);
        return {
          prompt: t`A field $\vec F$ is undefined at the origin. Everywhere else it is smooth with $Q_x - P_y = ${c}$. Its circulation anticlockwise round the unit circle is $${K}$. What is its circulation anticlockwise round the circle of radius ${R}?`,
          visual: { type: 'graph', params: { x: [-3.7 * R / 2, 3.7 * R / 2].map(r6), y: [-1.08 * R, 1.08 * R].map(r6), equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', ...annulus(1, R, { labels: false }), points: [{ x: 0, y: 0, color: 'bad', r: 4, label: 'F undefined', labelDx: 8, labelDy: 0 }] }, caption: t`The ring between the unit circle and the circle of radius ${R}: there $\vec F$ is smooth. The origin, where it is not, lies in the hole.` },
          answer: val, tol: { rel: 1e-3 },
          errors: [
            { value: c * PI * R * R, feedback: t`Green’s theorem cannot be used on the whole disk: $\vec F$ is undefined at the origin. Use it on the ring, where it is smooth, and add the inner circulation.` },
            { value: K + c * PI * R * R, feedback: t`The ring’s area is $\pi(${R}^2 - 1^2)$, not $\pi\cdot${R}^2$: the hole is not part of the region.` },
          ],
          hints: [t`On the ring $1 \le r \le ${R}$, Green’s theorem applies. Its boundary is the outer circle anticlockwise plus the unit circle **clockwise**.`, t`$\oint_{\text{outer}} - \oint_{\text{inner}} = \iint_{\text{ring}} ${c}\,dA = ${c}\pi(${R}^2 - 1)$, with both circles taken anticlockwise.`],
          teach: 'On a region with a hole, Green’s theorem links the outer circulation, the inner one and the integral over the region between them.',
          explain: t`$\oint_{\text{outer}} = \oint_{\text{inner}} + ${c}\pi(${R * R} - 1) = ${K} + ${c * (R * R - 1)}\pi \approx ${nice(+val.toPrecision(4))}$. The $${K}$ is circulation concentrated at the origin, where $\vec F$ blows up (like the vortex field); the rest comes from the curl in the ring.`,
        };
      },
    }),
    mcq({
      id: 'error-direction', difficulty: 2, kind: 'error',
      prompt: t`A student wants $\oint_C \vec F\cdot d\vec r$ for $\vec F = \langle -y,\ x\rangle$ round the unit circle walked **clockwise**, and writes: “By Green’s theorem it is $\iint_D (1 + 1)\,dA = 2\pi$.” Computing directly gives $-2\pi$. What went wrong?`,
      visual: { type: 'c3-lineint', params: { P: '-y', Q: 'x', x: [-2.4, 2.4], y: [-1.5, 1.5], paths: [{ x: 'cos(t)', y: '-sin(t)', t: [0, 2 * PI], color: 'gold' }], bead: false, readout: false }, caption: 'The field ⟨−y, x⟩ and the unit circle, walked clockwise (gold arrowheads).' },
      choices: [
        'Green’s theorem assumes the boundary is walked with D on the left — anticlockwise. Clockwise, the double integral needs a minus sign: −2π',
        'Green’s theorem is right, and the direct computation must be wrong: circulations cannot be negative',
        'Both are right: the sign of a circulation is only a convention',
        t`Neither: $\langle -y, x\rangle$ is a gradient field, so the answer is $0$`,
      ],
      answer: 0,
      why: {
        1: 'A circulation is signed: walking against the field gives a negative value. Here the walk runs against the field all the way round.',
        2: 'For a given direction of travel the value is definite. Reversing the direction is what flips the sign.',
        3: t`Its $Q_x - P_y = 2 \ne 0$: it is not a gradient, and its circulation is not zero.`,
      },
      hints: ['Which way does Green’s theorem require the boundary to be walked?'],
      teach: 'Green’s theorem holds for the positively oriented (anticlockwise) boundary; walking it the other way flips the sign.',
      explain: t`For the anticlockwise circle Green gives $2\pi$. The student walked it clockwise, which reverses every $d\vec r$: $\oint_{\text{clockwise}} = -2\pi$. Direction is part of the data of a line integral.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-triangle', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]);
        const val = a ** 3 / 6;
        return {
          prompt: t`Use Green’s theorem to evaluate $\oint_C xy\,dx + x^2\,dy$, where $C$ is the triangle with vertices $(0, 0)$, $(${a}, 0)$ and $(0, ${a})$, walked anticlockwise.`,
          visual: fieldPic('x*y', 'x^2', { x: [-0.9 * a, 2.1 * a].map(r6), y: [-0.35 * a, 1.15 * a].map(r6), n: 15, shade: [{ fn: `${a} - x`, from: 0, to: a, color: 'accent', alpha: 0.2 }], ...paths(path(`${a}*t`, '0', [0, 1], { at: [0.55] }), path(`${a} - ${a}*t`, `${a}*t`, [0, 1], { at: [0.55] }), path('0', `${a} - ${a}*t`, [0, 1], { at: [0.55] })), caption: 'The field (arrows compressed) and the triangle, walked anticlockwise.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: (3 * a ** 3) / 6, feedback: t`Check the signs: $Q_x - P_y = 2x - x = x$, not $2x + x$.` }],
          hints: [t`$Q_x - P_y = 2x - x = x$.`],
          teach: t`Replace the three-sided line integral by one double integral of $Q_x - P_y$.`,
          explain: t`$\displaystyle\iint_T x\,dA = \int_0^{${a}}\!\!\int_0^{${a} - x} x\,dy\,dx = \int_0^{${a}} x(${a} - x)\,dx = \frac{${a ** 3}}{6} \approx ${nice(+val.toPrecision(4))}$ — one double integral instead of three line integrals.`,
        };
      },
    }),
    num({
      id: 'cp-shoelace', difficulty: 3, transfer: true,
      gen(r) {
        const shapes = [
          [[0, 0], [8, 0], [10, 6], [4, 9], [-1, 5]],
          [[0, 0], [12, -2], [14, 5], [6, 10], [1, 6]],
          [[0, 0], [9, -1], [11, 4], [7, 8], [2, 7]],
        ];
        const V = r.pick(shapes);
        const twice = V.reduce((s, [x1, y1], k) => { const [x2, y2] = V[(k + 1) % V.length]; return s + x1 * y2 - x2 * y1; }, 0);
        const A = twice / 2;
        const xs = V.map((p) => p[0]), ys = V.map((p) => p[1]);
        const lo = [Math.min(...xs), Math.min(...ys)], hi = [Math.max(...xs), Math.max(...ys)];
        return {
          prompt: t`A recovery ship logs the corners of a splashdown keep-out zone, in km east and north of a marker buoy: ${V.map(([x, y]) => `$(${x}, ${y})$`).join(', ')}, in anticlockwise order. Treating the sides as straight, Green’s theorem gives the area as $A = \tfrac12\oint (x\,dy - y\,dx)$, and along a straight side from $(x_1, y_1)$ to $(x_2, y_2)$ the integral $\int (x\,dy - y\,dx)$ is exactly $x_1y_2 - x_2y_1$. Find the zone’s area.`,
          visual: { type: 'graph', params: { x: [lo[0] - 3, hi[0] + 3], y: [lo[1] - 1.5, hi[1] + 1.5], equal: true, aspect: 'wide', xlabel: 'east (km)', ylabel: 'north (km)', ...paths(...V.map((p, k) => { const q = V[(k + 1) % V.length]; return path(`${p[0]} + ${q[0] - p[0]}*t`, `${p[1]} + ${q[1] - p[1]}*t`, [0, 1], { at: [0.5], width: 2.4 }); })), points: V.map(([x, y]) => ({ x, y, color: 'gold', r: 4, label: `(${x}, ${y})`, labelDx: 6, labelDy: y === Math.min(...ys) ? 12 : -10 })) }, caption: 'The keep-out zone, its sides walked anticlockwise. The buoy is at the origin.' },
          answer: A, units: 'km^2', tol: { rel: 2e-3 },
          errors: [{ value: twice, feedback: t`Green’s area formula has a factor $\tfrac12$: $A = \tfrac12\oint(x\,dy - y\,dx)$.` }],
          hints: [t`Add $x_1y_2 - x_2y_1$ over the five sides, including the last one back to the start, then halve.`, t`The sides from or to $(0, 0)$ contribute $0$.`],
          teach: 'The surveyor’s shoelace formula is Green’s theorem for a polygon: A = ½ Σ (x₁y₂ − x₂y₁) over its sides.',
          explain: t`$\sum (x_1y_2 - x_2y_1) = ${V.map(([x1, y1], k) => { const [x2, y2] = V[(k + 1) % V.length]; return `(${x1 * y2 - x2 * y1})`; }).join(' + ')} = ${twice}$, so $A = ${nice(A)}$ km². GIS software and planimeters both compute areas this way: from the boundary alone.`,
        };
      },
    }),
    mcq({
      id: 'cp-cancel', difficulty: 2,
      prompt: t`The square is cut into four cells, each walked anticlockwise. Why does the sum of the four cells’ circulations equal the circulation round the outer square?`,
      visual: cellsPic('-y + 0.4*x*y', 'x + 0.3*x^2', { kind: 'rect', x: [-1.5, 1.5], y: [-1.5, 1.5] }, { x: [-3, 3], y: [-1.8, 1.8], n: 2, caption: 'Four cells, each walked anticlockwise (small arrows), and the outer boundary (gold).' }),
      choices: [
        'Each inner edge is walked once in each direction by the two cells beside it, so its contributions cancel',
        'The inner edges are short, so their contributions are negligible',
        'The field is zero along the inner edges',
        'All four cells have the same circulation',
      ],
      answer: 0,
      why: {
        1: 'They are as long as the outer edges. The cancellation is exact, not an approximation.',
        2: 'Nothing about the field is assumed. Whatever F is on an inner edge, F · dr one way cancels F · dr the other way.',
        3: 'The tints differ: the cells generally have different circulations. Only their shared edges cancel.',
      },
      hints: ['Follow one inner edge. Which cells walk along it, and in which directions?'],
      teach: 'Inner edges are walked twice in opposite directions and cancel exactly; only the outer boundary survives — the heart of Green’s theorem.',
      explain: t`An inner edge belongs to two cells, and walking each cell anticlockwise sends them along it in opposite directions: the two contributions cancel exactly. What is left is the outer boundary. Shrinking the cells turns each one’s circulation into $(Q_x - P_y)\,dA$, and the sum into the double integral.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.4 Green’s theorem', url: 'https://openstax.org/books/calculus-volume-3/pages/6-4-greens-theorem' },
  ],
});
