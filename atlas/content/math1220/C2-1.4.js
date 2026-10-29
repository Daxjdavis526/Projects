// Arc length: the limit of inscribed polygons, L = ∫ √(1 + f′²) dx.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// Explore: f(x) = 2 + (2/3) x^{3/2} on [0, 3] (lifted by 2 so it clears the
// rectangles below; lifting a curve does not change its length). Its exact
// length is (2/3)(4^{3/2} − 1) = 14/3. The polygon joins n equally spaced
// points of the curve; the Riemann rectangles of the chord "stretch factor"
// √(1 + (Δy/Δx)²) have exactly the chords' lengths as their areas.
const F = (X) => `(2 + (2/3)*(${X})^1.5)`;
const H = '(3/n)';
const XK = `(${H}*floor(x/${H}))`;
const POLY = `${F(XK)} + (${F(`${XK} + ${H}`)} - ${F(XK)})*(x - ${XK})/${H}`;
const STRETCH = `sqrt(1 + ((${F(`x + ${H}`)} - ${F('x')})/${H})^2)`;

export default lesson({
  id: 'math1220.C2-1.4',
  title: 'Arc length',
  minutes: 10, difficulty: 3,
  intro: t`To measure a curve, approximate it by short straight chords. A chord across a step $\Delta x$ rises $\Delta y$, so its length is $\sqrt{\Delta x^2 + \Delta y^2} = \sqrt{1 + (\Delta y/\Delta x)^2}\,\Delta x$. As the chords shrink, $\Delta y/\Delta x$ becomes the slope $f'(x)$ and the sum becomes an integral:

$$L = \int_a^b \sqrt{1 + \big[f'(x)\big]^2}\,dx$$

The square root makes most arc-length integrals impossible in closed form — the textbook examples are chosen so that $1 + (f')^2$ is a perfect square. Real curves are measured numerically.`,
  symbols: [
    { tex: 'L', text: 'the **arc length**: the distance along the curve, in units of length (m)' },
    { tex: "f'(x)", text: 'the slope of the curve at $x$ — how much it climbs per unit step in $x$' },
    { tex: "\\sqrt{1 + [f'(x)]^2}", text: 'the **stretch factor**: how much longer a short piece of curve is than the step $dx$ beneath it (it is $1$ where the curve is flat)' },
    { tex: 'dx', text: 'a short step along the $x$-axis' },
    { tex: 'a,\\ b', text: 'the $x$-values where the piece of curve starts and ends' },
  ],
  why: t`The same construction — chop a path into straight pieces and add their lengths — gives the distance an orbiting probe travels, the length of a cable, and later the proper time along a worldline in relativity.`,
  visual: {
    type: 'graph',
    title: 'Chords that converge to the curve',
    lead: t`Blue: the curve $y = 2 + \tfrac23 x^{3/2}$ for $0 \le x \le 3$. Gold: $n$ straight chords joining points on it. Below, each orange rectangle has width $\Delta x$ and height $\sqrt{1 + (\Delta y/\Delta x)^2}$, so its **area equals the length of the chord above it**; the dashed curve is the stretch factor $\sqrt{1 + f'(x)^2} = \sqrt{1 + x}$.`,
    tasks: [
      t`With $n = 1$ the single chord has length $\sqrt{21} \approx 4.583$. Increase $n$: the total climbs toward $L = \tfrac{14}{3} \approx 4.667$ but never passes it — chords cut corners.`,
      t`Watch the rectangle tops close in on the dashed curve: the total chord length is a Riemann sum for $\int_0^3\sqrt{1 + x}\,dx$.`,
      t`At $n = 32$ the polygon is within $0.001$ of the true length, but no finite $n$ gets there exactly — the integral is the limit.`,
    ],
    params: {
      x: [-0.2, 3.4], y: [0, 6],
      sliders: [{ key: 'n', label: 'Number of chords $n$', min: 1, max: 32, step: 1, value: 2, explain: t`Each chord spans $\Delta x = 3/n$.` }],
      curves: [
        { fn: F('x'), color: 'accent', label: 'y = f(x)', labelAt: 0.12, domain: [0, 3.4] },
        { fn: POLY, color: 'gold', domain: [0, 3] },
        { fn: 'sqrt(1 + x)', color: 'warn', dash: true, label: 'stretch factor √(1 + f′²)', labelAt: 1.3, domain: [0, 3.4] },
      ],
      riemann: { fn: STRETCH, from: 0, to: 3, n: 'n', rule: 'left' },
      readouts: [
        { label: t`total length of the $n$ chords`, expr: 'riemann', digits: 5 },
        { label: t`arc length $L = 14/3$`, expr: '14/3', digits: 5 },
      ],
    },
    caption: t`The curve is lifted by 2 so it stays clear of the rectangles; lifting a curve does not change its length. Chord lengths are computed exactly from the chord endpoints.`,
  },
  example: {
    prompt: t`Find the length of $y = \dfrac{x^2}{4} - \dfrac{\ln x}{2}$ from $x = 1$ to $x = e$.`,
    visual: {
      type: 'graph',
      params: { aspect: 'wide', x: [0.6, 3.1], y: [0, 1.6], curves: [{ fn: 'x^2/4 - ln(x)/2', color: 'accent', label: 'y = x²/4 − (ln x)/2', labelAt: 0.72, domain: [0.7, 3.1] }, { param: ['1 + (e - 1)*t', '0.25 + (e^2/4 - 0.75)*t'], t: [0, 1], color: 'ink3', dash: true }], points: [{ x: 1, y: 0.25, color: 'gold' }, { x: 'e', y: 'e^2/4 - 0.5', color: 'gold' }] },
      caption: 'The arc from x = 1 to x = e, with the straight chord between its ends (dashed).',
    },
    steps: [
      { label: 'Differentiate', text: t`$f'(x) = \dfrac{x}{2} - \dfrac{1}{2x}$.` },
      { label: 'Square and add 1', text: t`$1 + f'^2 = 1 + \dfrac{x^2}{4} - \dfrac12 + \dfrac{1}{4x^2} = \dfrac{x^2}{4} + \dfrac12 + \dfrac{1}{4x^2} = \left(\dfrac{x}{2} + \dfrac{1}{2x}\right)^2.$ The middle term flipped sign: a **perfect square**.` },
      { label: 'Take the root', text: t`$\sqrt{1 + f'^2} = \dfrac{x}{2} + \dfrac{1}{2x}$ (positive for $x > 0$).` },
      { label: 'Integrate', text: t`$L = \displaystyle\int_1^e\left(\frac{x}{2} + \frac{1}{2x}\right)dx = \left[\frac{x^2}{4} + \frac{\ln x}{2}\right]_1^e = \left(\frac{e^2}{4} + \frac12\right) - \frac14 = \frac{e^2 + 1}{4}.$` },
      { label: 'Sense check', text: t`$\tfrac{e^2 + 1}{4} \approx 2.097$. The straight chord between the end points $(1, 0.25)$ and $(e, 1.347)$ has length $\approx 2.039$; the arc must be a little longer — and it is.` },
    ],
    answer: t`$L = \dfrac{e^2 + 1}{4} \approx 2.097$`,
  },
  practice: [
    mcq({
      id: 'setup', difficulty: 1,
      prompt: t`Which integral gives the length of $y = x^3$ from $x = 0$ to $x = 2$?`,
      choices: [
        t`$\displaystyle\int_0^2\sqrt{1 + 9x^4}\,dx$`,
        t`$\displaystyle\int_0^2\sqrt{1 + x^6}\,dx$`,
        t`$\displaystyle\int_0^2\sqrt{1 + 3x^2}\,dx$`,
        t`$\displaystyle\int_0^2\left(1 + 3x^2\right)dx$`,
      ],
      answer: 0,
      why: {
        1: t`That squares $f$ itself. The formula uses the slope: $f'(x) = 3x^2$.`,
        2: t`The slope must be squared: $(3x^2)^2 = 9x^4$.`,
        3: t`The square and the square root are both missing — length is not $\int (1 + f')\,dx$.`,
      },
      hints: [t`Find $f'(x)$ first.`, t`Then square it: $L = \int\sqrt{1 + (f')^2}\,dx$.`],
      teach: t`Arc length uses the square of the slope, $(f')^2$, under a square root.`,
      explain: t`$f' = 3x^2$, so $(f')^2 = 9x^4$ and $L = \int_0^2\sqrt{1 + 9x^4}\,dx \approx 8.63$ (found numerically — this one has no elementary antiderivative).`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 2.4], y: [-0.5, 8.6], curves: [{ fn: 'x^3', color: 'accent', domain: [0, 2.1] }], points: [{ x: 0, y: 0, color: 'gold' }, { x: 2, y: 8, color: 'gold' }] } },
    }),
    num({
      id: 'three-halves', difficulty: 2,
      gen(r) {
        const b = r.pick([3, 8, 15, 24]), L = (2 / 3) * ((1 + b) ** 1.5 - 1);
        return {
          prompt: t`Find the length of $y = \tfrac23 x^{3/2}$ from $x = 0$ to $x = ${b}$.`,
          answer: L, tol: { rel: 0.002 },
          errors: [{ value: (1 + b) ** 1.5 - 1, feedback: t`Don’t forget the factor from integrating: $\int (1 + x)^{1/2}dx = \tfrac23 (1 + x)^{3/2}$.` }],
          hints: [t`$f'(x) = \sqrt{x}$, so $1 + (f')^2 = 1 + x$.`, t`$L = \int_0^{${b}}\sqrt{1 + x}\,dx = \left[\tfrac23(1 + x)^{3/2}\right]_0^{${b}}$.`],
          teach: t`For $y = \tfrac23 x^{3/2}$ the slope squared is just $x$, so the integrand is $\sqrt{1 + x}$.`,
          explain: t`$L = \tfrac23\left(${1 + b}^{3/2} - 1\right) = \tfrac23\left(${Math.round((1 + b) ** 1.5)} - 1\right) = ${nice(L)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.05 * b, b * 1.1], y: [-0.05 * b, (2 / 3) * b ** 1.5 * 1.1], curves: [{ fn: '(2/3)*x^1.5', color: 'accent', domain: [0, b * 1.1] }], points: [{ x: 0, y: 0, color: 'gold' }, { x: b, y: (2 / 3) * b ** 1.5, color: 'gold' }] } },
        };
      },
    }),
    num({
      id: 'perfect-square', difficulty: 3,
      gen(r) {
        const b = r.pick([2, 3]), L = b ** 3 / 6 - 1 / (2 * b) + 1 / 3;
        return {
          prompt: t`Find the length of $y = \dfrac{x^3}{6} + \dfrac{1}{2x}$ from $x = 1$ to $x = ${b}$.`,
          answer: L, tol: { rel: 0.002 },
          hints: [
            t`$f'(x) = \dfrac{x^2}{2} - \dfrac{1}{2x^2}$.`,
            t`$1 + (f')^2 = \dfrac{x^4}{4} + \dfrac12 + \dfrac{1}{4x^4}$ — a perfect square. Of what?`,
            t`It is $\left(\dfrac{x^2}{2} + \dfrac{1}{2x^2}\right)^2$, so $L = \int_1^{${b}}\left(\dfrac{x^2}{2} + \dfrac{1}{2x^2}\right)dx$.`,
          ],
          teach: t`When $f' = A - B$ with $AB = \tfrac14$, then $1 + (f')^2 = (A + B)^2$: the square root disappears.`,
          explain: t`$L = \left[\dfrac{x^3}{6} - \dfrac{1}{2x}\right]_1^{${b}} = \left(\dfrac{${b ** 3}}{6} - \dfrac{1}{${2 * b}}\right) - \left(\dfrac16 - \dfrac12\right) = ${nice(L)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0.5, b + 0.4], y: [0, b ** 3 / 6 + 1], curves: [{ fn: 'x^3/6 + 1/(2*x)', color: 'accent', domain: [0.55, b + 0.4] }], points: [{ x: 1, y: 2 / 3, color: 'gold' }, { x: b, y: b ** 3 / 6 + 1 / (2 * b), color: 'gold' }] } },
        };
      },
    }),
    mcq({
      id: 'sine-arch', difficulty: 2,
      prompt: t`The length of one arch of $y = \sin x$ is $L = \displaystyle\int_0^{\pi}\sqrt{1 + \cos^2 x}\,dx$, which has no elementary antiderivative. Which value is it?`,
      choices: ['3.82', '3.14', '3.72', '2.00'],
      answer: 0,
      why: {
        1: t`$\pi$ is the horizontal distance covered. The arch climbs and falls, so it is longer than that.`,
        2: t`$3.72$ is the length of the two chords $(0,0)\to(\tfrac{\pi}{2}, 1)\to(\pi, 0)$. Chords cut corners, so the arc is longer still.`,
        3: t`$2$ is the *area* under the arch, $\int_0^{\pi}\sin x\,dx$ — a different integral.`,
      },
      hints: ['The arc is longer than any chain of chords joining points on it.', t`Two chords via the top point give $2\sqrt{(\pi/2)^2 + 1} \approx 3.72$.`],
      teach: 'Any polygon inscribed in a curve is shorter than the curve, so it gives a lower bound on the arc length.',
      explain: t`Evaluated numerically (for example with Simpson’s rule, later in this course), $L \approx 3.820$ — a bit more than the two-chord estimate $3.72$, and more than $\pi$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.2, 3.4], y: [-0.2, 1.3], curves: [{ fn: 'sin(x)', color: 'accent', domain: [0, 3.1416] }, { fn: '1 - abs(x - pi/2)*2/pi', color: 'gold', dash: true, domain: [0, 3.1416] }] }, caption: 'One arch of y = sin x and the two chords through its top point.' },
    }),
    num({
      id: 'semicircle', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 2, 3, 5]);
        return {
          prompt: t`Check the formula on a shape you know: find the length of the semicircle $y = \sqrt{${R * R} - x^2}$ for $-${R} \le x \le ${R}$.`,
          answer: Math.PI * R, tol: { rel: 0.002 },
          errors: [{ value: 2 * Math.PI * R, feedback: 'That is the whole circle; this is the upper half only.' }],
          hints: [
            t`$f'(x) = \dfrac{-x}{\sqrt{${R * R} - x^2}}$, so $1 + (f')^2 = \dfrac{${R * R}}{${R * R} - x^2}$.`,
            t`$L = \int_{-${R}}^{${R}}\dfrac{${R}}{\sqrt{${R * R} - x^2}}\,dx$, and $\int\dfrac{dx}{\sqrt{a^2 - x^2}} = \arcsin\dfrac{x}{a}$.`,
          ],
          teach: 'A new formula is worth testing on a case you already know the answer to.',
          explain: t`$L = ${R}\left[\arcsin\dfrac{x}{${R}}\right]_{-${R}}^{${R}} = ${R}\left(\dfrac{\pi}{2} + \dfrac{\pi}{2}\right) = ${R === 1 ? '' : R}\pi \approx ${fmt(Math.PI * R)}$ — half of $2\pi r$, as it should be. (The integrand blows up at the ends, but the integral is finite.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-R * 1.7, R * 1.7], y: [-R * 0.15, R * 1.2], equal: true, curves: [{ fn: `sqrt(${R * R} - x^2)`, color: 'accent', domain: [-R, R] }] } },
        };
      },
    }),
    num({
      id: 'in-y', difficulty: 3,
      prompt: t`The curve $x = \tfrac23(y - 1)^{3/2}$ is easier to handle as a function of $y$. Find its length from $y = 1$ to $y = 4$, using $L = \displaystyle\int_c^d\sqrt{1 + \left(\frac{dx}{dy}\right)^2}\,dy$.`,
      answer: 14 / 3, tol: { rel: 0.002 },
      hints: [t`$\dfrac{dx}{dy} = (y - 1)^{1/2}$, so $1 + \left(\dfrac{dx}{dy}\right)^2 = y$.`, t`$L = \int_1^4\sqrt{y}\,dy = \left[\tfrac23 y^{3/2}\right]_1^4$.`],
      teach: 'Arc length works with the roles of x and y swapped: integrate √(1 + (dx/dy)²) dy.',
      explain: t`$L = \tfrac23\left(4^{3/2} - 1\right) = \tfrac23(8 - 1) = \tfrac{14}{3} \approx 4.667$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 4], y: [0, 4.5], curves: [{ param: ['(2/3)*(t - 1)^1.5', 't'], t: [1, 4], color: 'accent' }], points: [{ x: 0, y: 1, color: 'gold' }, { x: 2 * 3 ** 1.5 / 3, y: 4, color: 'gold' }] } },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-power', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 4, 5]), L = (8 / 27) * ((1 + (9 * b) / 4) ** 1.5 - 1);
        return {
          prompt: t`Find the length of $y = x^{3/2}$ from $x = 0$ to $x = ${b}$. Give 3 significant figures.`,
          answer: L, tol: { rel: 0.005 },
          hints: [t`$f' = \tfrac32 x^{1/2}$, so $1 + (f')^2 = 1 + \tfrac94 x$; substitute $u = 1 + \tfrac94 x$.`],
          teach: t`Arc length is $\int\sqrt{1 + (f')^2}\,dx$; a linear substitution handles $\sqrt{1 + kx}$.`,
          explain: t`$L = \int_0^{${b}}\left(1 + \tfrac94 x\right)^{1/2}dx = \tfrac{8}{27}\left[\left(1 + \tfrac94 x\right)^{3/2}\right]_0^{${b}} = \tfrac{8}{27}\left(${nice(1 + (9 * b) / 4)}^{3/2} - 1\right) \approx ${fmt(L)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1 * b - 0.1, b * 1.15], y: [-0.1, b ** 1.5 * 1.15 + 0.1], curves: [{ fn: 'x^1.5', color: 'accent', domain: [0, b * 1.15] }] } },
        };
      },
    }),
    num({
      id: 'cp-cable', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([40, 50, 60]), d = r.pick([30, 40]);
        const L = a * (Math.exp(d / a) - Math.exp(-d / a));
        return {
          prompt: t`A power cable hangs between two towers ${2 * d} m apart. With the origin midway between the towers, its shape is $y = ${a}\cdot\dfrac{e^{x/${a}} + e^{-x/${a}}}{2}$ m for $-${d} \le x \le ${d}$. How long is the cable? Give 3 significant figures.`,
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 2 * d, feedback: 'That is the straight distance between the towers. The cable sags, so it is longer.' }],
          hints: [
            t`$y' = \dfrac{e^{x/${a}} - e^{-x/${a}}}{2}$.`,
            t`$1 + (y')^2 = \left(\dfrac{e^{x/${a}} + e^{-x/${a}}}{2}\right)^2$ — another perfect square.`,
            t`$L = \int_{-${d}}^{${d}}\dfrac{e^{x/${a}} + e^{-x/${a}}}{2}\,dx = ${a}\left[\dfrac{e^{x/${a}} - e^{-x/${a}}}{2}\right]_{-${d}}^{${d}}$.`,
          ],
          teach: 'For a hanging cable, 1 + (y′)² is a perfect square, so its length has a closed form — a first meeting with the hyperbolic cosine.',
          explain: t`$L = ${a}\left(e^{${nice(d / a)}} - e^{-${nice(d / a)}}\right) \approx ${fmt(L)}$ m, about ${fmt(((L - 2 * d) / (2 * d)) * 100, 2)}% longer than the ${2 * d} m span. The curve is a **catenary**, $y = a\cosh(x/a)$ — see the hyperbolic-functions lesson.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-d * 1.3, d * 1.3], y: [0, a * Math.cosh(d / a) * 1.2], xlabel: 'x (m)', curves: [{ fn: `${a}*cosh(x/${a})`, color: 'accent', domain: [-d, d] }], vlines: [{ x: -d, color: 'ink3', label: 'tower' }, { x: d, color: 'ink3', label: 'tower' }] }, caption: 'The cable between the towers. Axes in metres; the ground is not drawn.' },
        };
      },
    }),
    mcq({
      id: 'cp-bound', difficulty: 2,
      prompt: t`For a smooth curve $y = f(x)$ on $[a, b]$, which statement about its length $L$ is always true?`,
      choices: [
        t`$L \ge \sqrt{(b - a)^2 + \big(f(b) - f(a)\big)^2}$`,
        t`$L = \displaystyle\int_a^b f(x)\,dx$`,
        t`$L \le b - a$`,
        t`$L = (b - a) + |f(b) - f(a)|$`,
      ],
      answer: 0,
      why: {
        1: t`That is the area under the curve, not its length.`,
        2: t`The other way round: $\sqrt{1 + (f')^2} \ge 1$, so $L \ge b - a$.`,
        3: t`That is the length of a path that goes across and then straight up. It is too long for a straight slanted line, and a curve that wiggles up and down can be longer still, so it is not the length in general.`,
      },
      hints: ['What is the shortest path between two points?'],
      teach: 'A curve is never shorter than the straight chord joining its ends.',
      explain: t`The chord between $(a, f(a))$ and $(b, f(b))$ is the shortest path between those points, so the arc is at least that long. Equality holds only for a straight line.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 4.3], y: [-0.5, 3], curves: [{ fn: '1 + 0.5*x + 0.6*sin(2*x)', color: 'accent', domain: [0, 4] }, { param: ['4*t', '1 + (2 + 0.6*sin(8))*t'], t: [0, 1], color: 'ink3', dash: true }] }, caption: 'A curve and the straight chord between its ends (dashed).' },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.4 Arc Length of a Curve and Surface Area', url: 'https://openstax.org/books/calculus-volume-2/pages/2-4-arc-length-of-a-curve-and-surface-area' }],
});
