// Polar coordinates: points as (r, θ), converting to and from x and y,
// negative r, and the families of polar curves (roses, limaçons, spirals).
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// a picture on a polar grid (rings and spokes round the pole)
const polar = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'polar', aspect: 'wide', x, y, ...params }, caption });
const cart = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'cartesian', aspect: 'wide', x, y, ...params }, caption });

// angles off the axes, with the exact coordinates of the point at distance 2: (2 cos θ, 2 sin θ)
const ANGLES = [
  [(2 * Math.PI) / 3, t`2\pi/3`, '-1', t`\sqrt3`],
  [(3 * Math.PI) / 4, t`3\pi/4`, t`-\sqrt2`, t`\sqrt2`],
  [(5 * Math.PI) / 6, t`5\pi/6`, t`-\sqrt3`, '1'],
  [(7 * Math.PI) / 6, t`7\pi/6`, t`-\sqrt3`, '-1'],
  [(5 * Math.PI) / 4, t`5\pi/4`, t`-\sqrt2`, t`-\sqrt2`],
  [(4 * Math.PI) / 3, t`4\pi/3`, '-1', t`-\sqrt3`],
  [(5 * Math.PI) / 3, t`5\pi/3`, '1', t`-\sqrt3`],
  [(7 * Math.PI) / 4, t`7\pi/4`, t`\sqrt2`, t`-\sqrt2`],
  [(11 * Math.PI) / 6, t`11\pi/6`, t`\sqrt3`, '-1'],
];
// k times an exact coordinate written as TeX: scale(2, '-\sqrt3') → '-2\sqrt3'
const scale = (k, s) => {
  const neg = s.startsWith('-'), body = neg ? s.slice(1) : s;
  const v = body === '1' ? `${k}` : k === 1 ? body : `${k}${body}`;
  return neg ? `-${v}` : v;
};
const quadrant = (th) => (th < Math.PI / 2 ? 'I' : th < Math.PI ? 'II' : th < (3 * Math.PI) / 2 ? 'III' : 'IV');

const ROSE = 'cos(k*theta)', LIMA = '1 + b*cos(theta)', SPIRAL = 'theta/pi';
const RAY_READOUTS = [
  { label: t`$\theta$`, expr: 'rtheta', digits: 3 },
  { label: t`$r$`, expr: 'rr', digits: 3 },
  { label: t`$x = r\cos\theta$`, expr: 'rx', digits: 3 },
  { label: t`$y = r\sin\theta$`, expr: 'ry', digits: 3 },
];

export default lesson({
  id: 'math1220.C2-6.3',
  title: 'Polar coordinates',
  minutes: 10, difficulty: 2,
  intro: t`Polar coordinates locate a point by **how far** it is from a fixed point, the *pole*, and **in which direction**: the distance $r$ and the angle $\theta$, measured counter-clockwise from the positive $x$-axis. Converting to $x$ and $y$ is right-triangle trigonometry:

$$x = r\cos\theta, \qquad y = r\sin\theta, \qquad r^2 = x^2 + y^2$$

Curves that wind round a centre — roses, spirals, cardioids, and the orbit of every planet — have short equations $r = f(\theta)$ in polar form and long ones in $x$ and $y$.`,
  symbols: [
    { tex: 'r', text: 'the distance from the pole (the origin), in units of length. A **negative** $r$ means: face the direction $\\theta$, then walk backwards' },
    { tex: '\\theta', text: 'the angle from the positive $x$-axis (the *polar axis*), counter-clockwise, in radians' },
    { tex: 'x,\\ y', text: 'the Cartesian coordinates of the same point' },
    { tex: 'r^2 = x^2 + y^2', text: 'Pythagoras: the distance from the pole, written in $x$ and $y$' },
  ],
  why: t`Anything with a centre — a planet round the Sun, a radar sweep, the field round a charge — is simpler in polar coordinates. Kepler’s orbit, which takes a page in $x$ and $y$, is one line: $r = p/(1 + e\cos\theta)$.`,
  visual: {
    type: 'calc-polar',
    title: 'Sweep the angle, trace the curve',
    lead: t`The gold ray turns to the angle $\theta$; the point sits at distance $r(\theta)$ along it. The bold curve is what has been traced from $\theta = 0$ so far. When $r$ is negative the point is on the **opposite** side of the pole from the ray.`,
    tasks: [
      t`**Rose:** with $k = 3$, sweep $\theta$ from $0$ to $2\pi$. Three petals appear in the first half-turn, then $r < 0$ retraces them: an odd $k$ gives $k$ petals. Try $k = 2$: an even $k$ gives $2k$.`,
      t`**Limaçon:** $b = 1$ is the **cardioid**, with a cusp at the pole. Push $b$ above $1$ and an inner loop appears — it is traced while $r < 0$.`,
      t`**Spiral:** every full turn adds $2$ to the radius, so the coils are evenly spaced — an Archimedean spiral, like a coiled hose or a record groove.`,
    ],
    params: {
      grid: 'polar', aspect: 'wide', x: [-1.5, 1.5], y: [-1.25, 1.25], rstep: 0.5,
      presetLabel: 'Curve',
      presets: [
        {
          label: 'Rose r = cos kθ', show: ['k', 'th'], x: [-1.5, 1.5], y: [-1.25, 1.25], rstep: 0.5,
          curves: [{ polar: ROSE, theta: [0, '2*pi'], color: 'ink3', width: 1.3, dash: true, samples: 1200 }, { polar: ROSE, theta: [0, 'th'], color: 'accent', width: 2.6, samples: 1200 }],
          rays: [{ polar: ROSE, at: 'th' }],
        },
        {
          label: 'Limaçon r = 1 + b cos θ', show: ['b', 'th'], x: [-1.2, 3.2], y: [-1.9, 1.9], rstep: 0.5,
          curves: [{ polar: LIMA, theta: [0, '2*pi'], color: 'ink3', width: 1.3, dash: true }, { polar: LIMA, theta: [0, 'th'], color: 'accent', width: 2.6 }],
          rays: [{ polar: LIMA, at: 'th' }],
        },
        {
          label: 'Spiral r = θ/π', show: ['ts'], x: [-4.6, 4.6], y: [-4.4, 4.4], rstep: 1,
          curves: [{ polar: SPIRAL, theta: [0, '4*pi'], color: 'ink3', width: 1.3, dash: true }, { polar: SPIRAL, theta: [0, 'ts'], color: 'accent', width: 2.6 }],
          rays: [{ polar: SPIRAL, at: 'ts' }],
        },
      ],
      sliders: [
        { key: 'k', label: 'Petal number $k$', min: 1, max: 6, step: 1, value: 3, explain: t`In $r = \cos k\theta$: how fast $r$ oscillates as $\theta$ turns.` },
        { key: 'b', label: 'Shape $b$', min: 0, max: 2, step: 0.05, value: 1, explain: t`In $r = 1 + b\cos\theta$: $b = 0$ is a circle, $b = 1$ a cardioid, $b > 1$ has an inner loop.` },
        { key: 'th', label: 'Angle $\\theta$', min: 0, max: 6.28, step: 0.01, value: 2.0, unit: t`\text{rad}`, explain: 'The direction of the ray, counter-clockwise from the positive x-axis.' },
        { key: 'ts', label: 'Angle $\\theta$', min: 0, max: 12.56, step: 0.01, value: 5.0, unit: t`\text{rad}`, explain: 'Two full turns: θ runs past 2π, and r keeps growing.' },
      ],
      readouts: RAY_READOUTS,
    },
    caption: t`Rings are spaced by $0.5$ (spiral: $1$); spokes every $30^\circ = \pi/6$. The faint dotted line, when it appears, is the direction $\theta$ itself, for a point plotted at negative $r$.`,
  },
  example: {
    prompt: t`Convert $r = 4\sin\theta$ to Cartesian coordinates and identify the curve.`,
    visual: polar([-3.4, 3.4], [-0.6, 4.6], {
      rstep: 1,
      curves: [{ polar: '4*sin(theta)', theta: [0, 'pi'], color: 'accent' }],
      rays: [{ polar: '4*sin(theta)', at: 'pi/6', label: '(2, π/6)', color: 'gold' }],
      points: [{ r: 4, theta: 'pi/2', label: '(4, π/2)', color: 'warn' }, { x: 0, y: 2, color: 'ink2', size: 3.5, label: 'centre', labelDx: 8, labelDy: 10 }],
    }, t`$r = 4\sin\theta$ for $0 \le \theta \le \pi$ — after that $r < 0$ and the same circle is traced again.`),
    steps: [
      { label: 'Make Cartesian pieces', text: t`Multiply both sides by $r$: $r^2 = 4r\sin\theta$. Now both sides are things we can translate.` },
      { label: 'Translate', text: t`$r^2 = x^2 + y^2$ and $r\sin\theta = y$, so $x^2 + y^2 = 4y$.` },
      { label: 'Complete the square', text: t`$x^2 + y^2 - 4y + 4 = 4$, i.e. $x^2 + (y - 2)^2 = 4$.` },
      { label: 'Read it', text: t`A circle of radius $2$ centred at $(0, 2)$ — it passes through the pole. (Multiplying by $r$ could have added the pole as a spurious point, but $\theta = 0$ gives $r = 0$, so the pole is on the curve anyway.)` },
      { label: 'Check two points', text: t`$\theta = \pi/2$: $r = 4$, the point $(0, 4)$ — the top of the circle ✓. $\theta = \pi/6$: $r = 2$, the point $(\sqrt3, 1)$, and $3 + (1 - 2)^2 = 4$ ✓.` },
    ],
    answer: t`$x^2 + (y - 2)^2 = 4$: the circle of radius $2$ centred at $(0, 2)$.`,
  },
  practice: [
    num({
      id: 'to-cartesian', difficulty: 1,
      gen(r) {
        const R = r.int(2, 5), [th, thT] = r.pick(ANGLES), askX = r.bool(0.5);
        const v = askX ? R * Math.cos(th) : R * Math.sin(th), other = askX ? R * Math.sin(th) : R * Math.cos(th);
        return {
          prompt: t`A point has polar coordinates $(r, \theta) = (${R},\ ${thT})$. Find its ${askX ? '$x$' : '$y$'}-coordinate, to 3 significant figures.`,
          visual: polar([-R - 1.2, R + 1.2], [-R - 0.8, R + 0.8], { rstep: 1, rays: [{ polar: `${R}`, at: +th.toFixed(6), label: `(${R}, θ)` }] }, t`The point on a polar grid: rings $1$ apart, spokes every $\pi/6$.`),
          answer: v, tol: { rel: 0.005, abs: 0.002 },
          errors: Math.abs(Math.abs(v) - Math.abs(other)) < 1e-6 ? [] : [{ value: other, feedback: askX ? t`That is $y = r\sin\theta$. The $x$-coordinate uses the cosine.` : t`That is $x = r\cos\theta$. The $y$-coordinate uses the sine.` }],
          hints: [askX ? t`$x = r\cos\theta$.` : t`$y = r\sin\theta$.`, t`The point is in quadrant ${quadrant(th)}, which fixes the sign.`],
          teach: 'x = r cos θ and y = r sin θ; the quadrant of θ sets the signs.',
          explain: t`${askX ? t`$x = ${R}\cos(${thT})$` : t`$y = ${R}\sin(${thT})$`} $= ${nice(v)}$.`,
        };
      },
    }),
    num({
      id: 'to-polar-angle', difficulty: 2,
      gen(r) {
        const [th, thT, cx, sy] = r.pick(ANGLES), k = r.int(1, 3), R = 2 * k;
        const atanVal = Math.atan(Math.sin(th) / Math.cos(th));
        const q = quadrant(th);
        return {
          prompt: t`Find the polar angle $\theta$, with $0 \le \theta < 2\pi$, of the point $(x, y) = (${scale(k, cx)},\ ${scale(k, sy)})$. Give it in radians to 3 significant figures.`,
          visual: polar([-R - 1.2, R + 1.2], [-R - 0.8, R + 0.8], { rstep: R > 4 ? 2 : 1, rays: [{ polar: `${R}`, at: +th.toFixed(6), label: '(x, y)' }] }, 'The point and its direction from the pole.'),
          answer: th, tol: { rel: 0.003, abs: 0.005 },
          errors: [
            q === 'IV'
              ? { value: atanVal, feedback: t`That is the right direction measured clockwise (a negative angle). Add $2\pi$ to land in $[0, 2\pi)$.` }
              : { value: atanVal, feedback: t`A calculator’s $\arctan(y/x)$ only returns angles between $-\pi/2$ and $\pi/2$. This point is in quadrant ${q} (look at the signs), so add $\pi$.` },
          ],
          hints: [t`$\tan\theta = y/x$ — but check the quadrant from the signs of $x$ and $y$.`, t`$\arctan(y/x) = ${nice(atanVal)}$; the point is in quadrant ${q}, so ${q === 'IV' ? t`add $2\pi$` : t`add $\pi$`}.`],
          teach: 'tan θ = y/x has two solutions in [0, 2π); pick the one in the quadrant the signs of x and y point to.',
          explain: t`The point is in quadrant ${q}, at distance $r = ${R}$. The angle is $\theta = ${thT} \approx ${nice(th)}$ rad.`,
        };
      },
    }),
    mcq({
      id: 'negative-r', difficulty: 2,
      prompt: t`Which polar coordinates name the same point as $(r, \theta) = (-2,\ \pi/4)$?`,
      visual: polar([-3.2, 3.2], [-2.6, 2.6], { rstep: 1, segments: [{ from: [-2.6, -2.6], to: [2.6, 2.6], color: 'gold', dash: true }], texts: [{ text: 'θ = π/4', x: 2.15, y: 1.6, color: 'gold' }] }, t`The line through the pole in the direction $\theta = \pi/4$. Positive $r$ walks one way along it, negative $r$ the other.`),
      choices: [t`$(2,\ 5\pi/4)$`, t`$(2,\ \pi/4)$`, t`$(2,\ -\pi/4)$`, t`$(2,\ 3\pi/4)$`],
      answer: 0,
      why: {
        1: 'The sign of r matters: (2, π/4) is on the other side of the pole.',
        2: t`$(2, -\pi/4)$ is the mirror image in the $x$-axis, in quadrant IV. Walking backwards from $\pi/4$ lands in quadrant III.`,
        3: t`$(2, 3\pi/4)$ is the mirror image in the $y$-axis, in quadrant II.`,
      },
      hints: [t`Face the direction $\pi/4$ (up and to the right), then walk 2 units backwards.`],
      teach: '(−r, θ) and (r, θ + π) are the same point: a negative distance walks backwards along the ray.',
      explain: t`Walking backwards along $\theta = \pi/4$ reaches $(-\sqrt2, -\sqrt2)$, which is distance $2$ in the direction $\pi/4 + \pi = 5\pi/4$.`,
    }),
    num({
      id: 'count-petals', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]), petals = n % 2 ? n : 2 * n, wrong = n % 2 ? 2 * n : n;
        return {
          prompt: t`The graph shows $r = \cos ${n}\theta$ plotted against $\theta$ for $0 \le \theta \le 2\pi$ (an ordinary graph, not the polar curve). How many petals does the polar rose $r = \cos ${n}\theta$ have?`,
          visual: cart([-0.3, 6.6], [-1.5, 1.5], { xlabel: 'θ', ylabel: 'r', curves: [{ param: ['t', `cos(${n}*t)`], t: [0, '2*pi'], color: 'accent' }] }, t`$r$ against $\theta$. Each hump, above or below the axis, draws one petal — but a petal can be drawn more than once.`),
          answer: petals, tol: { abs: 0.01 },
          errors: [{ value: wrong, feedback: n % 2 ? t`Counting every hump double-counts: with ${n} odd, the humps where $r < 0$ retrace the petals already drawn while $r > 0$.` : t`The humps below the axis ($r < 0$) are not repeats here: with ${n} even, they draw ${n} new petals between the first ${n}.` }],
          hints: [t`There are ${2 * n} humps of $|r|$ between $\theta = 0$ and $2\pi$; each draws a petal. The question is whether any coincide.`, t`A point at negative $r$ in direction $\theta$ is the point at positive $r$ in direction $\theta + \pi$. Does $\cos(${n}(\theta + \pi))$ equal $-\cos ${n}\theta$ or $+\cos ${n}\theta$?`],
          teach: 'r = cos nθ has n petals for odd n (traced twice in a full turn) and 2n petals for even n.',
          explain: t`$\cos(${n}(\theta + \pi)) = ${n % 2 ? '-' : ''}\cos ${n}\theta$, so ${n % 2 ? t`each $r < 0$ hump lands exactly on a petal already drawn: ${petals} petals, each traced twice` : t`the $r < 0$ humps land between the others: ${petals} distinct petals`}.`,
        };
      },
    }),
    expr({
      id: 'circle-to-polar', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), useX = r.bool(0.5), D = 2 * a, f = useX ? 'cos' : 'sin', F = useX ? '\\cos' : '\\sin';
        return {
          prompt: t`Write the circle $x^2 + y^2 = ${D}${useX ? 'x' : 'y'}$ in polar form, as $r$ in terms of $\theta$.`,
          visual: polar(useX ? [-1, D + 1] : [-a - 1.6, a + 1.6], useX ? [-a - 0.6, a + 0.6] : [-0.6, D + 0.6], { rstep: 1, curves: [{ polar: `${D}*${f}(theta)`, theta: [0, 'pi'], color: 'accent' }] }, 'The circle passes through the pole.'),
          answer: `${D} ${f}(theta)`, answerTeX: t`r = ${D}${F}\theta`, lhs: 'r',
          vars: { theta: useX ? [-1.2, 1.2] : [0.4, 2.7] },
          errors: [
            { answer: `sqrt(${D} ${f}(theta))`, feedback: t`Substitute both sides: $x^2 + y^2 = r^2$ and $${useX ? 'x = r\\cos\\theta' : 'y = r\\sin\\theta'}$, so $r^2 = ${D}r${F}\theta$ — then divide by $r$.` },
            { answer: `${D} ${useX ? 'sin' : 'cos'}(theta)`, feedback: t`${useX ? t`$x = r\cos\theta$` : t`$y = r\sin\theta$`}: check which trig function goes with ${useX ? '$x$' : '$y$'}.` },
          ],
          hints: [t`Replace $x^2 + y^2$ by $r^2$ and ${useX ? t`$x$ by $r\cos\theta$` : t`$y$ by $r\sin\theta$`}.`, t`$r^2 = ${D}r${F}\theta$; divide by $r$ (the pole is still on the curve, at $\theta = ${useX ? '\\pi/2' : '0'}$).`],
          teach: 'Turn x² + y² into r², x into r cos θ and y into r sin θ, then simplify.',
          explain: t`$r^2 = ${D}r${F}\theta \Rightarrow r = ${D}${F}\theta$: a circle of diameter ${D} through the pole.`,
        };
      },
    }),
    expr({
      id: 'parabola-from-polar', difficulty: 3,
      gen(r) {
        const p = r.int(1, 4);
        return {
          prompt: t`Convert $r = \dfrac{${p}}{1 - \cos\theta}$ to an equation in $x$ and $y$.`,
          visual: polar([-p - 1.4, 2.6 * p], [-2.2 * p, 2.2 * p], {
            rstep: p > 2 ? 2 : 1, angles: 'none',
            curves: [{ polar: `${p}/(1 - cos(theta))`, theta: [0.08, 6.2], color: 'accent' }],
            vlines: [{ x: -p, color: 'warn', label: 'x = −' + p }],
            points: [{ x: 0, y: 0, color: 'gold', label: 'pole', labelDx: 8, labelDy: 12 }],
          }, t`The curve, with the vertical line $x = -${p}$ dashed. Every point on the curve is as far from the pole as from that line.`),
          answer: `y^2 = ${2 * p}x + ${p * p}`, answerTeX: t`y^2 = ${2 * p}x + ${p * p}`,
          mode: 'equation', vars: { x: [0, 4], y: [-4, 4] },
          errors: [{ answer: `y^2 = ${2 * p}x`, feedback: t`Square the whole right side: $(x + ${p})^2 = x^2 + ${2 * p}x + ${p * p}$.` }],
          hints: [t`Clear the fraction: $r - r\cos\theta = ${p}$, so $r = ${p} + x$.`, t`Square: $x^2 + y^2 = (x + ${p})^2$, then simplify.`],
          teach: 'Clear fractions so that r and r cos θ appear, translate them, then square to remove √(x² + y²).',
          explain: t`$r = ${p} + r\cos\theta = ${p} + x$; squaring, $x^2 + y^2 = x^2 + ${2 * p}x + ${p * p}$, so $y^2 = ${2 * p}x + ${p * p}$ — a parabola with its focus at the pole.`,
        };
      },
    }),
    multi({
      id: 'pole-angles', difficulty: 2,
      prompt: t`At which angles $\theta$ in $[0, \pi)$ does the rose $r = \sin 3\theta$ pass through the pole? Select all that apply.`,
      visual: polar([-1.5, 1.5], [-1.2, 1.2], { rstep: 0.5, curves: [{ polar: 'sin(3*theta)', theta: [0, 'pi'], color: 'accent' }] }, t`The rose $r = \sin 3\theta$ on a polar grid with spokes every $\pi/6$. At the pole each petal leaves along a spoke.`),
      choices: ['$0$', t`$\pi/6$`, t`$\pi/3$`, t`$\pi/2$`, t`$2\pi/3$`, t`$5\pi/6$`],
      answer: [0, 2, 4],
      why: { 1: t`$\sin(\pi/2) = 1$: that is the tip of a petal, as far from the pole as it gets.`, 3: t`$\sin(3\pi/2) = -1$: the tip of the petal pointing down.`, 5: t`$\sin(5\pi/2) = 1$: another tip.` },
      hints: [t`The curve is at the pole when $r = 0$: solve $\sin 3\theta = 0$.`],
      teach: 'A polar curve passes through the pole wherever r(θ) = 0, and leaves it along those directions.',
      explain: t`$\sin 3\theta = 0$ when $3\theta = 0, \pi, 2\pi$, i.e. $\theta = 0, \pi/3, 2\pi/3$: each petal starts and ends along one of those spokes.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-distance', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick([[-5, 12, 13], [8, -15, 17], [-7, -24, 25], [20, -21, 29], [-9, 40, 41]]);
        const m = Math.max(Math.abs(x), Math.abs(y)) * 1.3;
        return {
          prompt: t`Find $r$ for the point $(x, y) = (${x},\ ${y})$, taking $r > 0$.`,
          visual: cart([-m, m], [-m * 0.8, m * 0.8], { segments: [{ from: [0, 0], to: [x, y], color: 'gold', label: 'r' }, { from: [x, 0], to: [x, y], color: 'ink3', dash: true }], points: [{ x, y, label: `(${x}, ${y})`, color: 'gold' }] }, 'The point and its distance from the pole.'),
          answer: R, tol: { rel: 0.002 },
          errors: [{ value: Math.abs(x) + Math.abs(y), feedback: 'Distances do not add along the axes: use Pythagoras, r² = x² + y².' }],
          hints: [t`$r = \sqrt{x^2 + y^2}$.`],
          teach: 'r = √(x² + y²), whatever the quadrant.',
          explain: t`$r = \sqrt{${x * x} + ${y * y}} = \sqrt{${R * R}} = ${R}$.`,
        };
      },
    }),
    expr({
      id: 'cp-line', difficulty: 2,
      gen(r) {
        const c = r.int(2, 4), horiz = r.bool(0.5), f = horiz ? 'sin' : 'cos', F = horiz ? '\\sin' : '\\cos';
        return {
          prompt: t`Write the line ${horiz ? t`$y = ${c}$` : t`$x = ${c}$`} in polar form, as $r$ in terms of $\theta$.`,
          visual: polar([-c - 1, c + 1.6], [-c - 0.6, c + 0.6], { rstep: 1, curves: [{ polar: `${c}/${f}(theta)`, theta: horiz ? [0.15, 3] : [-1.4, 1.4], color: 'accent' }] }, 'The line on a polar grid.'),
          answer: `${c}/${f}(theta)`, answerTeX: t`r = \dfrac{${c}}{${F}\theta}`, lhs: 'r',
          vars: { theta: horiz ? [0.4, 2.7] : [-1.1, 1.1] },
          errors: [{ answer: `${c} ${f}(theta)`, feedback: t`From $${horiz ? 'r\\sin\\theta' : 'r\\cos\\theta'} = ${c}$, divide by $${F}\theta$ — do not multiply.` }],
          hints: [t`${horiz ? t`$y = r\sin\theta$` : t`$x = r\cos\theta$`}, so the line is $${horiz ? 'r\\sin\\theta' : 'r\\cos\\theta'} = ${c}$.`],
          teach: 'Lines through no particular centre are awkward in polar form: y = c becomes r = c / sin θ.',
          explain: t`$${horiz ? 'r\\sin\\theta' : 'r\\cos\\theta'} = ${c} \Rightarrow r = \dfrac{${c}}{${F}\theta}$ (that is, $${c}\,${horiz ? '\\csc' : '\\sec'}\theta$).`,
        };
      },
    }),
    num({
      id: 'cp-radar', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([80, 120, 150, 200]), beta = r.pick([20, 35, 60, 110, 140, 160]);
        const east = R * Math.sin((beta * Math.PI) / 180), phi = ((90 - beta) * Math.PI) / 180;
        const ph = +phi.toFixed(6), mid = (phi + Math.PI / 2) / 2;
        return {
          prompt: t`An air-traffic radar reports an aircraft at range ${R} km on a bearing of ${String(beta).padStart(3, '0')}° — measured **clockwise from north**, as navigators do. How far east of the radar is the aircraft? Give 3 significant figures.`,
          visual: polar([-1.3 * R, 1.3 * R], [-1.15 * R, 1.2 * R], {
            rstep: R / 2, angles: 'none',
            rays: [{ polar: `${R}`, at: ph, arc: false, label: 'aircraft' }],
            curves: [{ param: [`${0.35 * R}*cos(t)`, `${0.35 * R}*sin(t)`], t: [ph, 'pi/2'], color: 'warn', width: 2 }],
            texts: [{ text: 'N', x: 0.05 * R, y: 1.12 * R, color: 'ink2' }, { text: 'E', x: 1.2 * R, y: 0.07 * R, color: 'ink2' }, { text: `${beta}°`, x: 0.5 * R * Math.cos(mid), y: 0.5 * R * Math.sin(mid), color: 'warn' }],
          }, t`The radar at the pole, north up. Rings every ${R / 2} km; the orange arc is the bearing, measured from north towards east.`),
          answer: east, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: R * Math.cos((beta * Math.PI) / 180), feedback: t`That treats the bearing as the mathematical angle from the $x$-axis — it is the distance **north**. A bearing $\beta$ is the math angle $\theta = 90^\circ - \beta$.` }],
          hints: [t`Convert the bearing to the mathematical angle: $\theta = 90^\circ - \beta$, measured counter-clockwise from east.`, t`East is $x = r\cos\theta = r\cos(90^\circ - \beta) = r\sin\beta$.`],
          teach: 'Navigation bearings run clockwise from north; the polar angle runs counter-clockwise from east, so θ = 90° − bearing.',
          explain: t`$\theta = 90^\circ - ${beta}^\circ = ${90 - beta}^\circ$, so east $= ${R}\cos(${90 - beta}^\circ) = ${R}\sin ${beta}^\circ \approx ${fmt(east)}$ km.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §7.3 Polar Coordinates', url: 'https://openstax.org/books/calculus-volume-2/pages/7-3-polar-coordinates' }],
});
