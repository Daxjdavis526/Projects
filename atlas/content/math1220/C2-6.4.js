// Area and arc length in polar coordinates: A = ½∫r²dθ from thin wedges,
// regions between curves, the double-counting trap, L = ∫√(r² + r′²)dθ, and
// Kepler's second law.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

const polar = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'polar', aspect: 'wide', x, y, ...params }, caption });

const CARD = '1 + cos(theta)', ROSE3 = 'sin(3*theta)';
const sweep = (r, view) => ({
  ...view,
  fills: [{ polar: r, theta: [0, 'be'], color: 'accent', alpha: 0.16 }],
  wedges: { polar: r, theta: [0, 'be'], n: 'n' },
  curves: [{ polar: r, theta: [0, '2*pi'], color: 'ink3', width: 1.3, dash: true }, { polar: r, theta: [0, 'be'], color: 'accent', width: 2.6 }],
});

// real orbits: perihelion and aphelion distances (AU) and perihelion speed (km/s)
const ORBITS = [
  { name: 'Mercury', q: 0.3075, Q: 0.4667, vp: 58.98 },
  { name: 'Mars', q: 1.3814, Q: 1.666, vp: 26.5 },
  { name: 'Earth', q: 0.98329, Q: 1.01671, vp: 30.29 },
  { name: 'Halley’s comet', q: 0.586, Q: 35.08, vp: 54.57 },
];

export default lesson({
  id: 'math1220.C2-6.4',
  title: 'Area and arc length in polar coordinates',
  minutes: 12, difficulty: 3,
  intro: t`Cut a polar region into thin wedges, each a sliver of angle $d\theta$ reaching out from the pole. Each is nearly a sector of a circle of radius $r$, with area $\tfrac12 r^2\,d\theta$. Adding the wedges, and measuring the boundary the same way, gives

$$A = \frac12\int_\alpha^\beta r^2\,d\theta, \qquad L = \int_\alpha^\beta \sqrt{r^2 + \left(\frac{dr}{d\theta}\right)^2}\,d\theta$$

The wedge is also the quantity in **Kepler’s second law**: the line from the Sun to a planet sweeps out area at the rate $\tfrac12 r^2\,\tfrac{d\theta}{dt}$, and that rate never changes.`,
  symbols: [
    { tex: 'A', text: 'the area swept by the ray from the pole as $\\theta$ runs from $\\alpha$ to $\\beta$, in square units (m²)' },
    { tex: 'r = f(\\theta)', text: 'the curve: its distance from the pole in the direction $\\theta$' },
    { tex: '\\alpha,\\ \\beta', text: 'the angles where the sweep starts and ends, in radians' },
    { tex: '\\tfrac12 r^2\\,d\\theta', text: 'the area of one thin wedge: the fraction $d\\theta/2\\pi$ of a disc of area $\\pi r^2$' },
    { tex: 'L', text: 'the arc length of the curve between $\\alpha$ and $\\beta$' },
    { tex: '\\frac{dr}{d\\theta}', text: 'how fast $r$ changes as the angle turns; with $r\\,d\\theta$, the sideways step, it makes the right triangle under the square root' },
  ],
  why: t`Kepler’s equal-area law says $\tfrac12 r^2\,d\theta/dt$ is constant along an orbit — conservation of angular momentum in disguise. The same wedge integral measures it.`,
  visual: {
    type: 'calc-polar',
    title: 'Wedges that fill a polar region',
    lead: t`The shaded region is swept by the ray from the pole as $\theta$ runs from $0$ to $\beta$. The orange wedges are circular sectors, each with the radius of the curve at its middle angle; their total is a Riemann sum for $\tfrac12\int r^2\,d\theta$.`,
    tasks: [
      t`**Cardioid:** raise $n$ from $4$ to $64$ and watch the wedge total close in on the area. At $\beta = 2\pi$ the area is $3\pi/2 \approx 4.712$ and the length $8$.`,
      t`**Rose:** set $\beta = \pi$ ($3.14$): that is the whole rose, area $\pi/4 \approx 0.785$. Keep going to $2\pi$ — nothing new appears, but the integral doubles to $\pi/2$, because it counts every pass.`,
    ],
    params: {
      grid: 'polar', aspect: 'wide', rstep: 0.5,
      presetLabel: 'Curve',
      presets: [
        { label: 'Cardioid r = 1 + cos θ', ...sweep(CARD, { x: [-1.1, 2.3], y: [-1.45, 1.45] }) },
        { label: 'Rose r = sin 3θ', ...sweep(ROSE3, { x: [-1.15, 1.15], y: [-1.1, 1.1] }) },
      ],
      sliders: [
        { key: 'n', label: 'Wedges $n$', min: 1, max: 64, step: 1, value: 8, explain: t`Each wedge spans $\beta/n$ radians and takes its radius at its middle angle.` },
        { key: 'be', label: 'Sweep to $\\beta$', min: 0.05, max: 6.28, step: 0.01, value: 4.2, unit: t`\text{rad}`, explain: 'Where the sweep stops; it always starts at θ = 0.' },
      ],
      readouts: [
        { label: 'sum of the $n$ wedges', expr: 'wsum', digits: 4 },
        { label: t`$\tfrac12\int_0^\beta r^2\,d\theta$`, expr: 'area', digits: 4 },
        { label: t`arc length, $0$ to $\beta$`, expr: 'len2', digits: 4 },
      ],
    },
    caption: t`The shaded area and the arc length are computed numerically from the curve. When the curve retraces itself, the integral counts the overlap again, though the picture cannot show it.`,
  },
  example: {
    prompt: t`Find the area enclosed by the cardioid $r = 1 + \cos\theta$.`,
    visual: polar([-1.1, 2.3], [-1.45, 1.45], {
      rstep: 0.5,
      fills: [{ polar: CARD, theta: [0, '2*pi'], color: 'accent', alpha: 0.14 }],
      wedges: { polar: CARD, theta: [1.05, 1.3], n: 1 },
      curves: [{ polar: CARD, theta: [0, '2*pi'], color: 'accent' }, { polar: '2*cos(theta)', theta: [-1.5708, 1.5708], color: 'ink3', width: 1.3, dash: true }],
      texts: [{ text: 'r', x: 0.2, y: 0.78, color: 'warn' }, { text: 'dθ', x: 0.62, y: 1.48, color: 'warn' }],
    }, t`One thin wedge (orange) of the cardioid. Dashed: the circle $r = 2\cos\theta$ (area $\pi$), which fits inside.`),
    steps: [
      { label: 'Limits', text: t`$r = 1 + \cos\theta \ge 0$ for every $\theta$, and one turn, $0 \le \theta \le 2\pi$, traces the curve exactly once.` },
      { label: 'Square', text: t`$(1 + \cos\theta)^2 = 1 + 2\cos\theta + \cos^2\theta = \tfrac32 + 2\cos\theta + \tfrac12\cos 2\theta$, using $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$.` },
      { label: 'Integrate', text: t`$A = \dfrac12\displaystyle\int_0^{2\pi}\left(\tfrac32 + 2\cos\theta + \tfrac12\cos 2\theta\right)d\theta = \dfrac12\cdot\dfrac32\cdot 2\pi = \dfrac{3\pi}{2}$. Both cosines integrate to zero over whole periods.` },
      { label: 'Sense check', text: t`$3\pi/2 \approx 4.71$. The cardioid contains the circle $r = 2\cos\theta$ (area $\pi \approx 3.14$, since $1 + \cos\theta \ge 2\cos\theta$) and sits inside the circle $r = 2$ (area $4\pi \approx 12.6$) ✓.` },
    ],
    answer: t`$A = \dfrac{3\pi}{2} \approx 4.712$ square units.`,
  },
  practice: [
    mcq({
      id: 'area-formula', difficulty: 1,
      prompt: t`Which integral gives the area of the region swept by the ray from the pole to the curve $r = f(\theta)$, for $\alpha \le \theta \le \beta$?`,
      visual: polar([-1.1, 2.3], [-1.45, 1.45], { rstep: 0.5, curves: [{ polar: CARD, theta: [0, '2*pi'], color: 'accent' }], wedges: { polar: CARD, theta: [0.6, 0.85], n: 1 }, texts: [{ text: 'r', x: 0.62, y: 0.42, color: 'warn' }, { text: 'dθ', x: 1.75, y: 1.2, color: 'warn' }] }, t`One wedge: a sector of radius $r$ and angle $d\theta$.`),
      choices: [t`$\dfrac12\displaystyle\int_\alpha^\beta f(\theta)^2\,d\theta$`, t`$\displaystyle\int_\alpha^\beta f(\theta)^2\,d\theta$`, t`$\dfrac12\displaystyle\int_\alpha^\beta f(\theta)\,d\theta$`, t`$\displaystyle\int_\alpha^\beta f(\theta)\,d\theta$`],
      answer: 0,
      why: {
        1: t`Missing the $\tfrac12$: a sector of angle $d\theta$ is the fraction $d\theta/2\pi$ of a disc, $\tfrac{d\theta}{2\pi}\cdot\pi r^2 = \tfrac12 r^2\,d\theta$.`,
        2: t`An area needs length squared; $\tfrac12 r\,d\theta$ has units of length. (It is half the arc of the wedge.)`,
        3: t`$\int r\,d\theta$ has units of length, not area — it is not even a polar arc length.`,
      },
      hints: [t`A whole disc of radius $r$ (angle $2\pi$) has area $\pi r^2$. What fraction of it is a wedge of angle $d\theta$?`],
      teach: 'A thin polar wedge is a circular sector: area ½r²dθ.',
      explain: t`The wedge is the fraction $d\theta/2\pi$ of a disc of area $\pi r^2$, so its area is $\tfrac12 r^2\,d\theta$; adding wedges from $\alpha$ to $\beta$ gives $\tfrac12\int_\alpha^\beta f(\theta)^2\,d\theta$.`,
    }),
    num({
      id: 'circle-area', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 6]), A = (Math.PI * k * k) / 4;
        return {
          prompt: t`Find the area enclosed by the circle $r = ${k}\sin\theta$ using $A = \tfrac12\int r^2\,d\theta$. Give 3 significant figures.`,
          visual: polar([-0.65 * k - 0.5, 0.65 * k + 0.5], [-0.25 * k, 1.12 * k], { rstep: k > 3 ? 1 : 0.5, fills: [{ polar: `${k}*sin(theta)`, theta: [0, 'pi'], color: 'accent', alpha: 0.2 }], curves: [{ polar: `${k}*sin(theta)`, theta: [0, 'pi'], color: 'accent' }] }, t`The circle is traced once as $\theta$ runs from $0$ to $\pi$.`),
          answer: A, tol: { rel: 0.005 },
          errors: [
            { value: 2 * A, feedback: t`From $0$ to $2\pi$ the circle is traced **twice** (for $\pi < \theta < 2\pi$, $r < 0$ retraces it), so the integral counts the area twice. One pass is $0 \le \theta \le \pi$.` },
            { value: Math.PI * k * k, feedback: t`${k} is the diameter of this circle, not its radius.` },
          ],
          hints: [t`Over what range of $\theta$ is the circle traced exactly once? Check where $r = 0$.`, t`$A = \tfrac12\displaystyle\int_0^{\pi} ${k * k}\sin^2\theta\,d\theta$, and $\int_0^\pi \sin^2\theta\,d\theta = \tfrac{\pi}{2}$.`],
          teach: 'Integrate over exactly one tracing of the curve: r = k sin θ is traced once for 0 ≤ θ ≤ π.',
          explain: t`$A = \tfrac12\cdot ${k * k}\cdot\tfrac{\pi}{2} = \tfrac{${k * k}\pi}{4} \approx ${fmt(A)}$ — the area of a circle of diameter ${k}, as it must be.`,
        };
      },
    }),
    num({
      id: 'rose-petal', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), n = r.pick([2, 3, 4]), A = (Math.PI * a * a) / (4 * n);
        return {
          prompt: t`Find the area of one petal of the rose $r = ${a === 1 ? '' : a}\sin ${n}\theta$. Give 3 significant figures.`,
          visual: polar([-1.25 * a, 1.25 * a], [-1.15 * a, 1.15 * a], { rstep: a > 1 ? 1 : 0.5, fills: [{ polar: `${a}*sin(${n}*theta)`, theta: [0, `pi/${n}`], color: 'accent', alpha: 0.3 }], curves: [{ polar: `${a}*sin(${n}*theta)`, theta: [0, n % 2 ? 'pi' : '2*pi'], color: 'accent', samples: 1200 }] }, t`The shaded petal is traced as $\theta$ runs from $0$ to $\pi/${n}$: $r$ starts at $0$, grows to ${a} and returns to $0$.`),
          answer: A, tol: { rel: 0.005 },
          errors: [{ value: 2 * A, feedback: t`Don’t forget the $\tfrac12$ in $A = \tfrac12\int r^2\,d\theta$.` }],
          hints: [t`One petal: $r$ goes from $0$ back to $0$, i.e. $0 \le ${n}\theta \le \pi$.`, t`$A = \tfrac12\displaystyle\int_0^{\pi/${n}} ${a * a}\sin^2 ${n}\theta\,d\theta$; use $\sin^2 u = \tfrac12(1 - \cos 2u)$.`],
          teach: 'One petal runs between consecutive zeros of r(θ).',
          explain: t`$A = \tfrac{${a * a}}{2}\displaystyle\int_0^{\pi/${n}}\tfrac12(1 - \cos ${2 * n}\theta)\,d\theta = \tfrac{${a * a}}{4}\cdot\tfrac{\pi}{${n}} = \tfrac{${a * a === 1 ? '' : a * a}\pi}{${4 * n}} \approx ${fmt(A)}$.`,
        };
      },
    }),
    num({
      id: 'spiral-area', difficulty: 2,
      gen(r) {
        const [b, bT] = r.pick([[Math.PI, t`\pi`], [1.5 * Math.PI, t`3\pi/2`], [2 * Math.PI, t`2\pi`]]);
        const A = b ** 3 / 6, m = b * 1.15;
        return {
          prompt: t`The spiral $r = \theta$ (one unit out per radian turned) sweeps a region as $\theta$ runs from $0$ to $${bT}$. Find its area. Give 3 significant figures.`,
          visual: polar([-m, m], [-0.8 * m, 0.75 * m], { rstep: 1, fills: [{ polar: 'theta', theta: [0, +b.toFixed(6)], color: 'accent', alpha: 0.22 }], curves: [{ polar: 'theta', theta: [0, +b.toFixed(6)], color: 'accent' }] }, t`The region swept by the ray from the pole to the spiral.`),
          answer: A, tol: { rel: 0.005 },
          errors: [{ value: b ** 2 / 4, feedback: t`Square $r$ inside the integral: $\tfrac12\int\theta^2\,d\theta$, not $\tfrac12\int\theta\,d\theta$.` }],
          hints: [t`$A = \tfrac12\displaystyle\int_0^{${bT}}\theta^2\,d\theta$.`],
          teach: 'For r = θ, the wedge area ½θ²dθ grows fast, so the outer turns dominate.',
          explain: t`$A = \tfrac12\left[\tfrac{\theta^3}{3}\right]_0^{${bT}} = \tfrac{(${bT})^3}{6} \approx ${fmt(A)}$.`,
        };
      },
    }),
    num({
      id: 'between-curves', difficulty: 3,
      prompt: t`Find the area inside the circle $r = 3\sin\theta$ and outside the cardioid $r = 1 + \sin\theta$. Give 3 significant figures.`,
      visual: polar([-2.4, 2.4], [-0.3, 3.3], {
        rstep: 1,
        fills: [{ polar: '3*sin(theta)', inner: '1 + sin(theta)', theta: ['pi/6', '5*pi/6'], color: 'accent', alpha: 0.3 }],
        curves: [{ polar: '3*sin(theta)', theta: [0, 'pi'], color: 'accent' }, { polar: '1 + sin(theta)', theta: [0, '2*pi'], color: 'warn' }],
        texts: [{ text: 'r = 3 sin θ', x: 2.35, y: 2.55, color: 'accent' }, { text: 'r = 1 + sin θ', x: -1.75, y: -0.5, color: 'warn' }],
        points: [{ r: 1.5, theta: 'pi/6', color: 'gold', size: 4 }, { r: 1.5, theta: '5*pi/6', color: 'gold', size: 4 }],
      }, 'The region between the curves (shaded) runs between their two crossings (gold).'),
      answer: Math.PI, tol: { rel: 0.005 },
      errors: [
        { value: Math.PI - 1.5 * Math.sqrt(3), feedback: t`You squared the difference of the radii. Each wedge is a ring piece of area $\tfrac12(R^2 - r^2)\,d\theta$, not $\tfrac12(R - r)^2\,d\theta$.` },
        { value: (3 * Math.PI - 4) / 2, feedback: t`Check the limits: the circle is outside the cardioid only between the crossings, $\pi/6 \le \theta \le 5\pi/6$.` },
      ],
      hints: [t`Find where the curves cross: $3\sin\theta = 1 + \sin\theta$.`, t`They cross at $\theta = \pi/6$ and $5\pi/6$. Then $A = \tfrac12\displaystyle\int_{\pi/6}^{5\pi/6}\left[(3\sin\theta)^2 - (1 + \sin\theta)^2\right]d\theta$.`, t`The integrand simplifies to $8\sin^2\theta - 2\sin\theta - 1$.`],
      teach: 'Between two polar curves, A = ½∫(R² − r²) dθ over the angles where the outer curve is outside, found from their crossings.',
      explain: t`$\tfrac12\displaystyle\int_{\pi/6}^{5\pi/6}(8\sin^2\theta - 2\sin\theta - 1)\,d\theta = \tfrac12\left[\left(\tfrac{8\pi}{3} + 2\sqrt3\right) - 2\sqrt3 - \tfrac{2\pi}{3}\right] = \pi$.`,
      solution: t`$\int_{\pi/6}^{5\pi/6} 8\sin^2\theta\,d\theta = 8\left[\tfrac{\theta}{2} - \tfrac{\sin 2\theta}{4}\right]_{\pi/6}^{5\pi/6} = \tfrac{8\pi}{3} + 2\sqrt3$; $\int 2\sin\theta\,d\theta = \left[-2\cos\theta\right]_{\pi/6}^{5\pi/6} = 2\sqrt3$; $\int 1\,d\theta = \tfrac{2\pi}{3}$. So $A = \tfrac12(2\pi) = \pi$.`,
    }),
    num({
      id: 'cardioid-length', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1.5, 2, 3]), L = 8 * a;
        return {
          prompt: t`Find the total length of the cardioid $r = ${a}(1 + \cos\theta)$.`,
          visual: polar([-0.6 * a, 2.3 * a], [-1.45 * a, 1.45 * a], { rstep: a >= 2 ? 1 : 0.5, curves: [{ polar: `${a}*(1 + cos(theta))`, theta: [0, '2*pi'], color: 'accent', width: 3 }] }, 'The whole cardioid, traced once for 0 ≤ θ ≤ 2π. Its cusp is at the pole.'),
          answer: L, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`A length cannot be zero. $\sqrt{4a^2\cos^2(\theta/2)} = 2a\,|\cos(\theta/2)|$: keep the absolute value, or use symmetry and double the integral from $0$ to $\pi$.` }],
          hints: [t`$r^2 + r'^2 = ${nice(a * a)}(1 + \cos\theta)^2 + ${nice(a * a)}\sin^2\theta = ${nice(2 * a * a)}(1 + \cos\theta)$.`, t`$1 + \cos\theta = 2\cos^2(\theta/2)$, so the integrand is $${nice(2 * a)}\,|\cos(\theta/2)|$.`, t`By symmetry, $L = 2\displaystyle\int_0^\pi ${nice(2 * a)}\cos(\theta/2)\,d\theta$.`],
          teach: 'Polar arc length: L = ∫√(r² + (dr/dθ)²) dθ; the square root is never negative, so watch for |cos| after a half-angle identity.',
          explain: t`$L = 2\displaystyle\int_0^\pi ${nice(2 * a)}\cos\tfrac{\theta}{2}\,d\theta = 2\left[${nice(4 * a)}\sin\tfrac{\theta}{2}\right]_0^\pi = ${nice(L)}$ — eight times the constant ${a}.`,
        };
      },
    }),
    mcq({
      id: 'double-count', difficulty: 3, kind: 'error',
      prompt: t`A student computes the area of the rose $r = \sin 3\theta$ as $\dfrac12\displaystyle\int_0^{2\pi}\sin^2 3\theta\,d\theta = \dfrac{\pi}{2}$. The correct area is $\dfrac{\pi}{4}$. What went wrong?`,
      visual: polar([-1.15, 1.15], [-1.1, 1.1], { rstep: 0.5, fills: [{ polar: ROSE3, theta: [0, 'pi'], color: 'accent', alpha: 0.25 }, { polar: ROSE3, theta: ['pi', '2*pi'], color: 'warn', alpha: 0.25 }], curves: [{ polar: ROSE3, theta: [0, '2*pi'], color: 'accent' }] }, t`Blue: the region swept for $0 \le \theta \le \pi$. Orange: the region swept for $\pi \le \theta \le 2\pi$. Every petal gets both colours (and looks grey): each is covered twice.`),
      choices: [
        t`For $\pi \le \theta \le 2\pi$ the rose retraces the same three petals, so the integral counted each petal twice; integrate from $0$ to $\pi$`,
        t`Where $r < 0$ the area is negative and should have been subtracted`,
        t`The $\tfrac12$ should not be there`,
        t`The petals overlap at the pole, which was counted three times`,
      ],
      answer: 0,
      why: {
        1: t`$r^2$ is never negative, so no part of the integral is negative. The problem is that the second half-turn covers the same petals again.`,
        2: t`The $\tfrac12$ is right; removing it would make the answer $\pi$, four times too big.`,
        3: 'A single point has no area.',
      },
      hints: [t`Sketch the curve for $0 \le \theta \le \pi$, then for $\pi \le \theta \le 2\pi$. Do you get new petals?`, t`For odd $n$, $\sin(n(\theta + \pi)) = -\sin n\theta$: a point at angle $\theta + \pi$ with negative $r$ is the same point as at $\theta$.`],
      teach: 'The polar area integral counts every pass of the ray, so integrate over one tracing of the curve only.',
      explain: t`For odd $n$ the rose $r = \sin n\theta$ is complete after $\theta$ runs from $0$ to $\pi$; the next half-turn retraces it, so $\int_0^{2\pi}$ gives twice the area: $\tfrac12\int_0^\pi\sin^2 3\theta\,d\theta = \tfrac{\pi}{4}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-limacon', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 1], [3, 2], [4, 3]]), A = Math.PI * (a * a + (b * b) / 2);
        return {
          prompt: t`Find the area enclosed by the limaçon $r = ${a} + ${b === 1 ? '' : b}\cos\theta$. Give 3 significant figures.`,
          visual: polar([-(a - b) - 0.8, a + b + 0.8], [-0.62 * (a + b) - 0.6, 0.62 * (a + b) + 0.6], { rstep: 1, fills: [{ polar: `${a} + ${b}*cos(theta)`, theta: [0, '2*pi'], color: 'accent', alpha: 0.2 }], curves: [{ polar: `${a} + ${b}*cos(theta)`, theta: [0, '2*pi'], color: 'accent' }] }, t`Since ${a} > ${b}, $r > 0$ everywhere: one turn traces the curve once, with no inner loop.`),
          answer: A, tol: { rel: 0.005 },
          errors: [{ value: 2 * A, feedback: t`Remember the $\tfrac12$.` }, { value: Math.PI * a * a, feedback: t`$\int_0^{2\pi}\cos^2\theta\,d\theta = \pi$, not $0$: the squared cosine term contributes.` }],
          hints: [t`$A = \tfrac12\displaystyle\int_0^{2\pi}(${a} + ${b}\cos\theta)^2\,d\theta$. Expand the square; over a full turn $\int\cos\theta = 0$ and $\int\cos^2\theta = \pi$.`],
          teach: 'Expand r², then integrate term by term over one full tracing.',
          explain: t`$A = \tfrac12\left(${a * a}\cdot 2\pi + 0 + ${b * b}\pi\right) = ${nice(a * a + (b * b) / 2)}\pi \approx ${fmt(A)}$.`,
        };
      },
    }),
    num({
      id: 'cp-kepler-speed', difficulty: 3, transfer: true,
      gen(r) {
        const O = r.pick(ORBITS), va = (O.vp * O.q) / O.Q;
        const e = (O.Q - O.q) / (O.Q + O.q), p = (2 * O.q * O.Q) / (O.q + O.Q);
        const b = p / Math.sqrt(1 - e * e);
        return {
          prompt: t`The line from the Sun to ${O.name} sweeps out area at a constant rate (Kepler’s second law). At perihelion and aphelion the velocity is perpendicular to that line, so there the rate is $\tfrac12 r v$. ${O.name} passes perihelion, ${O.q} AU from the Sun, at ${O.vp} km/s. How fast does it move at aphelion, ${O.Q} AU from the Sun? Give 3 significant figures.`,
          visual: { type: 'calc-polar', params: { grid: 'none', aspect: 'wide', x: [-O.Q * 1.08, O.q + 0.12 * O.Q], y: [-b * 1.25, b * 1.25], kepler: { e: +e.toFixed(6), p: +p.toFixed(6), n: 12 }, texts: [{ text: 'Sun', x: 0, y: -0.16 * b, color: 'gold', size: 11.5 }, { text: 'aphelion', x: -O.Q, y: 0.14 * b, color: 'ink2', size: 11.5 }, { text: 'perihelion', x: O.q, y: 0.14 * b, color: 'ink2', size: 11.5 }] }, caption: t`${O.name}’s orbit to scale ($e = ${nice(e, 3)}$), with the Sun at a focus. The twelve sectors are swept in equal times, so they have equal areas.` },
          answer: va, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: (O.vp * O.Q) / O.q, feedback: 'That would make it faster far from the Sun. Equal rates mean r·v is the same at both ends: the far end is the slow end.' }],
          hints: [t`Equal area rates: $\tfrac12 r_p v_p = \tfrac12 r_a v_a$.`, t`$v_a = v_p\,\dfrac{r_p}{r_a} = ${O.vp}\times\dfrac{${O.q}}{${O.Q}}$.`],
          teach: 'Kepler’s second law at the apsides: r·v is the same at perihelion and aphelion, so speed is inversely proportional to distance there.',
          explain: t`$v_a = ${O.vp}\times\dfrac{${O.q}}{${O.Q}} \approx ${fmt(va)}$ km/s. The sectors near the Sun are short and wide, the far ones long and thin — equal areas either way.`,
        };
      },
    }),
    num({
      id: 'cp-inner-loop', difficulty: 3,
      prompt: t`The limaçon $r = 1 + 2\cos\theta$ has an inner loop, traced while $r < 0$. Find the area inside the inner loop. Give 3 significant figures.`,
      visual: polar([-0.9, 3.3], [-1.9, 1.9], { rstep: 0.5, fills: [{ polar: '1 + 2*cos(theta)', theta: ['2*pi/3', '4*pi/3'], color: 'accent', alpha: 0.35 }], curves: [{ polar: '1 + 2*cos(theta)', theta: [0, '2*pi'], color: 'accent' }] }, t`The inner loop (shaded) is traced for $2\pi/3 \le \theta \le 4\pi/3$, where $r \le 0$ — so it appears on the right of the pole.`),
      answer: Math.PI - 1.5 * Math.sqrt(3), tol: { rel: 0.005 },
      errors: [{ value: 3 * Math.PI, feedback: t`That is $\tfrac12\int_0^{2\pi} r^2\,d\theta$: the whole curve, with the inner loop counted twice. Integrate only over the angles that trace the inner loop.` }],
      hints: [t`The inner loop starts and ends at the pole: solve $1 + 2\cos\theta = 0$.`, t`$\theta = 2\pi/3$ and $4\pi/3$. Then $A = \tfrac12\displaystyle\int_{2\pi/3}^{4\pi/3}(1 + 2\cos\theta)^2\,d\theta$.`, t`$(1 + 2\cos\theta)^2 = 3 + 4\cos\theta + 2\cos 2\theta$.`],
      teach: 'A loop of a polar curve runs between consecutive zeros of r; integrate ½r² between them.',
      explain: t`$A = \tfrac12\left[3\theta + 4\sin\theta + \sin 2\theta\right]_{2\pi/3}^{4\pi/3} = \tfrac12\left(2\pi - 4\sqrt3 + \sqrt3\right) = \pi - \tfrac{3\sqrt3}{2} \approx ${fmt(Math.PI - 1.5 * Math.sqrt(3))}$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §7.4 Area and Arc Length in Polar Coordinates', url: 'https://openstax.org/books/calculus-volume-2/pages/7-4-area-and-arc-length-in-polar-coordinates' },
    { label: 'NASA Planetary Fact Sheets (perihelion, aphelion, orbital speeds)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
