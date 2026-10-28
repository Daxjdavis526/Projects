// Double integrals over general regions: describe the region by strips —
// vertical (type I) or horizontal (type II) — so the inner limits are the
// ends of each strip and the outer limits are constants; reverse the order
// by redescribing the same region.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { slicerPic, regionPic, boxesPic, r6 } from './_integrals.js';

const t = String.raw;

// water in NASA's Neutral Buoyancy Laboratory pool is fresh: density and g in SI
const RHO_W = 1000, G = 9.81;

export default lesson({
  id: 'math2210.C3-4.2',
  title: 'Double integrals over general regions',
  minutes: 12, difficulty: 3,
  intro: t`Most regions are not rectangles. Describe the region $D$ by strips instead. If every vertical line meets $D$ in a single segment — entering at a lower boundary $y = g_1(x)$ and leaving at an upper one $y = g_2(x)$, for $a \le x \le b$ — then $D$ is a **type I** region and

$$\iint_D f\,dA = \int_a^b\!\!\int_{g_1(x)}^{g_2(x)} f(x, y)\,dy\,dx$$

The inner limits may depend on the outer variable: they are where each strip starts and stops. **The outer limits must be constants** — by the time you do the outer integral, nothing else is left to vary. Slicing with horizontal strips instead, $x$ from $h_1(y)$ to $h_2(y)$ for $c \le y \le d$ (a **type II** region), gives the other order. Reversing the order means redescribing the same region, and it can turn an inner integral nobody can do into an easy one.`,
  symbols: [
    { tex: 'D', text: 'the **region** of integration: a bounded piece of the plane, described by its boundary curves' },
    { tex: 'g_1(x),\\ g_2(x)', text: t`the lower and upper boundary curves: where the vertical strip at $x$ enters and leaves $D$` },
    { tex: 'a,\\ b', text: t`the smallest and largest $x$ in $D$: the outer limits, always constants` },
    { tex: 'h_1(y),\\ h_2(y)', text: t`for horizontal strips: the left and right boundary curves, for $c \le y \le d$` },
    { tex: 'dy\\,dx', text: t`the order: integrate in $y$ first (inside), then in $x$. Each pair of limits belongs to the differential it encloses` },
  ],
  why: t`Real regions — a wing, a fin, a window, the footprint of a sensor — are not rectangles, and describing a region by its strips is the skill that every later integral in this module (polar, triple, mass and moment) reuses.`,
  visual: {
    type: 'c3-slicer',
    title: 'One region, sliced two ways',
    lead: t`The region between the parabola $y = x^2$ and the line $y = x + 2$. The gold strip is one slice: the inner integral runs along it, from the boundary curve at one end to the boundary curve at the other — their equations are written at the ends. Sweep it across and the outer integral adds the strips up.`,
    tasks: [
      t`In $dy\,dx$ order, slide the strip from $x = -1$ to $x = 2$: its bottom is always on $y = x^2$ and its top on $y = x + 2$. One integral does it: $\int_{-1}^{2}\int_{x^2}^{x+2} dy\,dx = 4.5$.`,
      t`Switch to $dx\,dy$. Below $y = 1$ the strip runs between the two halves of the parabola, $x = \pm\sqrt y$; above $y = 1$ its left end jumps to the line $x = y - 2$. This order needs the region **split** at $y = 1$ — two integrals.`,
      'Press Sweep in each order: the area swept so far climbs to the same 4.5 both ways.',
    ],
    params: {
      x: [-1.8, 2.8], y: [-0.6, 4.6], at: 0.62,
      dydx: [{ from: -1, to: 2, lo: 'x^2', hi: 'x + 2', loLabel: 'y = x²', hiLabel: 'y = x + 2' }],
      dxdy: [
        { from: 0, to: 1, lo: '-sqrt(y)', hi: 'sqrt(y)', loLabel: 'x = −√y', hiLabel: 'x = √y' },
        { from: 1, to: 4, lo: 'y - 2', hi: 'sqrt(y)', loLabel: 'x = y − 2', hiLabel: 'x = √y' },
      ],
    },
    caption: 'The region between y = x² and y = x + 2, equal scales. Gold: one strip, its direction of integration and the boundary curve at each end. The dashed lines mark the outer limits and, in orange, where the description must split.',
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_0^1\!\!\int_y^1 e^{x^2}\,dx\,dy$.`,
    visual: {
      type: 'c3-slicer',
      params: {
        x: [-0.25, 1.45], y: [-0.2, 1.25], f: 'exp(x^2)', order: 'dxdy', at: 0.45,
        dxdy: [{ from: 0, to: 1, lo: 'y', hi: '1', loLabel: 'x = y', hiLabel: 'x = 1' }],
        dydx: [{ from: 0, to: 1, lo: '0', hi: 'x', loLabel: 'y = 0', hiLabel: 'y = x' }],
      },
      caption: t`The triangle $0 \le y \le x \le 1$. Switch the order to see the same region cut the other way; the readouts integrate $f = e^{x^2}$ numerically.`,
    },
    steps: [
      { label: 'Sketch the region', text: t`Read the limits from the inside out. The inner integral says that at height $y$, $x$ runs from $x = y$ to $x = 1$; the outer one says $y$ runs from $0$ to $1$. That is the triangle with corners $(0, 0)$, $(1, 0)$ and $(1, 1)$, between the line $y = x$ and the line $x = 1$.` },
      { label: 'Why not as written', text: t`The inner integral is $\int e^{x^2}\,dx$, and $e^{x^2}$ has **no elementary antiderivative**. As written, the integral cannot be done by hand.` },
      { label: 'Slice the other way', text: t`Use vertical strips. At each $x$ between $0$ and $1$ the strip runs from the $x$-axis, $y = 0$, up to the line $y = x$:
$$\int_0^1\!\!\int_0^x e^{x^2}\,dy\,dx.$$
Same triangle, same number — Fubini's theorem again.` },
      { label: 'Inner integral', text: t`$e^{x^2}$ does not involve $y$, so it is a constant here: $\displaystyle\int_0^x e^{x^2}\,dy = x\,e^{x^2}$. The strip's length, $x$, multiplies the integrand.` },
      { label: 'Outer integral', text: t`Now the $x$ has appeared that makes the substitution $u = x^2$ work: $\displaystyle\int_0^1 x\,e^{x^2}\,dx = \tfrac12 e^{x^2}\Big|_0^1 = \frac{e - 1}{2} \approx 0.859$.` },
      { label: 'Sense check', text: t`The triangle has area $\tfrac12$ and $e^{x^2}$ lies between $1$ and $e \approx 2.72$ on it, so the integral must lie between $0.5$ and $1.36$. It does — and the slicer's numerical readout agrees in both orders.` },
    ],
    answer: t`$\displaystyle\int_0^1\!\!\int_y^1 e^{x^2}\,dx\,dy = \int_0^1\!\!\int_0^x e^{x^2}\,dy\,dx = \frac{e-1}{2} \approx 0.859$`,
  },
  practice: [
    mcq({
      id: 'limits-type1', difficulty: 1,
      prompt: t`$D$ is the region between the parabola $y = x^2$ and the line $y = 2x$. Which iterated integral equals $\displaystyle\iint_D f\,dA$?`,
      choices: [
        t`$\displaystyle\int_0^2\!\!\int_{x^2}^{2x} f\,dy\,dx$`,
        t`$\displaystyle\int_0^2\!\!\int_{2x}^{x^2} f\,dy\,dx$`,
        t`$\displaystyle\int_{x^2}^{2x}\!\!\int_0^2 f\,dx\,dy$`,
        t`$\displaystyle\int_0^4\!\!\int_{x^2}^{2x} f\,dy\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`Upside down: for $0 < x < 2$ the line $y = 2x$ is above the parabola. With the limits reversed you get the negative of the answer.`,
        2: t`The outer limits contain $x$. Once the inner integral is done there is no $x$ left for them to refer to: outer limits must be constants.`,
        3: t`The curves meet where $x^2 = 2x$, at $x = 0$ and $x = 2$. The $4$ is the $y$-coordinate of the far corner, $(2, 4)$.`,
      },
      hints: [t`Find where the curves meet: $x^2 = 2x$. Which one is on top in between?`],
      teach: 'For vertical strips, the inner limits are the bottom and top curves as functions of x, and the outer limits are the constant x-values where the region starts and ends.',
      explain: t`The curves meet at $x = 0$ and $x = 2$; in between, $2x \ge x^2$ (try $x = 1$: $2 > 1$). Each vertical strip runs from $y = x^2$ up to $y = 2x$, and the strips run from $x = 0$ to $x = 2$.`,
      visual: slicerPic({ x: [-0.6, 2.8], y: [-0.4, 4.4], dydx: [{ from: 0, to: 2, lo: 'x^2', hi: '2x', loLabel: 'y = x²', hiLabel: 'y = 2x' }], limits: false,
        curves: [{ fn: 'x^2', domain: [-0.5, 2.15], color: 'accent', label: 'y = x²', labelAt: 1.55, labelDy: 14 }, { fn: '2x', domain: [-0.2, 2.2], color: 'accent2', label: 'y = 2x', labelAt: 0.9, labelDx: -52 }] },
      'The region between the two curves, with vertical strips. Equal scales.'),
    }),
    num({
      id: 'area-between', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]);
        const A = k ** 3 / 6;
        return {
          prompt: t`Use a double integral, $\iint_D 1\,dA$, to find the area of the region $D$ between $y = x^2$ and $y = ${k}x$.`,
          answer: A, tol: { rel: 1e-4 },
          integrand: `${k}*x - x^2`, limits: [0, k],
          errors: [
            { value: k ** 3 / 2, feedback: t`That is the area under the line alone. Each strip runs from the parabola up to the line: subtract.` },
            { value: k ** 3 / 3, feedback: t`That is the area under the parabola. The region lies between the parabola and the line.` },
          ],
          hints: [t`The curves meet at $x = 0$ and $x = ${k}$, and the line is on top in between.`, t`The inner integral $\int_{x^2}^{${k}x} 1\,dy$ is just the strip's length, $${k}x - x^2$.`],
          teach: 'With f = 1, the double integral is the area of D, and the inner integral is the length of each strip.',
          explain: t`$\displaystyle\int_0^{${k}}\!\!\int_{x^2}^{${k}x} dy\,dx = \int_0^{${k}} (${k}x - x^2)\,dx = \frac{${k}^3}{2} - \frac{${k}^3}{3} = \frac{${k ** 3}}{6} = ${nice(r6(A))}$ — the Calculus II "area between curves" formula, recovered as a double integral.`,
          visual: slicerPic({ x: [-0.4, k + 0.6], y: [-0.4, k * k + 0.4], dydx: [{ from: 0, to: k, lo: 'x^2', hi: `${k}*x`, loLabel: 'y = x²', hiLabel: `y = ${k}x` }], limits: false, ghost: 10,
            curves: [{ fn: 'x^2', domain: [-0.3, k + 0.15], color: 'accent', label: 'y = x²', labelAt: r6(k * 0.82), labelDx: 8, labelDy: 8 }, { fn: `${k}*x`, domain: [-0.1, k + 0.1], color: 'accent2', label: `y = ${k}x`, labelAt: r6(k * 0.35), labelDx: -58 }] },
          'The region between the curves, cut into vertical strips. Equal scales.'),
        };
      },
    }),
    num({
      id: 'triangle-xy', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3]);
        const I = (a * a * b * b) / 8;
        return {
          prompt: t`$D$ is the triangle with corners $(0, 0)$, $(${a}, 0)$ and $(${a}, ${b})$. Evaluate $\displaystyle\iint_D xy\,dA$.`,
          answer: I, tol: { rel: 1e-4 },
          integrand: `x*(${b}*x/${a})^2/2`, limits: [0, a],
          errors: [{ value: (a * a * b * b) / 4, feedback: t`That integrates over the whole rectangle $[0, ${a}]\times[0, ${b}]$. In the triangle, $y$ only runs up to the slanted side, $y = ${nice(r6(b / a))}x$.` }],
          hints: [t`Use vertical strips: at each $x$ from $0$ to $${a}$, $y$ runs from $0$ to the slanted side through $(0, 0)$ and $(${a}, ${b})$.`, t`The slanted side is $y = \tfrac{${b}}{${a}}x$, so the inner integral is $\displaystyle\int_0^{${b}x/${a}} xy\,dy = \frac{x}{2}\left(\frac{${b}x}{${a}}\right)^2$.`],
          teach: 'The inner limits follow the boundary: here the top of each strip is the slanted side of the triangle, a function of x.',
          explain: t`$\displaystyle\int_0^{${a}} \frac{x}{2}\cdot\frac{${b * b}x^2}{${a * a}}\,dx = \frac{${b * b}}{${2 * a * a}}\cdot\frac{${a}^4}{4} = ${nice(r6(I))}$.`,
          visual: slicerPic({ x: [-0.3, a + 0.5], y: [-0.3, b + 0.4], dydx: [{ from: 0, to: a, lo: '0', hi: `${b}*x/${a}`, loLabel: 'y = 0', hiLabel: b === a ? 'y = x' : `y = ${nice(r6(b / a))}x` }], limits: false,
            points: [{ x: a, y: b, color: 'accent', label: `(${a}, ${b})` }] },
          'The triangle, cut into vertical strips. Equal scales.'),
        };
      },
    }),
    mcq({
      id: 'reverse-limits', difficulty: 2,
      prompt: t`Reverse the order of integration in $\displaystyle\int_0^4\!\!\int_{\sqrt{x}}^{2} f(x, y)\,dy\,dx$.`,
      choices: [
        t`$\displaystyle\int_0^2\!\!\int_0^{y^2} f\,dx\,dy$`,
        t`$\displaystyle\int_0^2\!\!\int_{y^2}^{4} f\,dx\,dy$`,
        t`$\displaystyle\int_0^4\!\!\int_0^{y^2} f\,dx\,dy$`,
        t`$\displaystyle\int_0^2\!\!\int_0^{\sqrt{y}} f\,dx\,dy$`,
      ],
      answer: 0,
      why: {
        1: t`That is the region on the other side of the curve. Here $y \ge \sqrt{x}$, which means $x \le y^2$: the strips run from the $y$-axis to the curve.`,
        2: t`After reversing, the outer variable is $y$, which runs from $0$ to $2$; $4$ is the largest $x$.`,
        3: t`Inverting $y = \sqrt{x}$ gives $x = y^2$, not $x = \sqrt{y}$.`,
      },
      hints: [t`Sketch the region first: $0 \le x \le 4$, and $y$ from the curve $y = \sqrt{x}$ up to $y = 2$.`, t`Now slice it horizontally. At height $y$ (from $0$ to $2$), where does a horizontal strip start and stop? Write the curve as $x = $ a function of $y$.`],
      teach: 'Reversing the order means sketching the region and redescribing it with strips in the other direction — never just swapping the limits.',
      explain: t`The region is bounded by $y = \sqrt{x}$ (that is, $x = y^2$), the line $y = 2$ and the $y$-axis. At height $y$ a horizontal strip runs from $x = 0$ to $x = y^2$, and $y$ runs from $0$ to $2$: $\int_0^2\int_0^{y^2} f\,dx\,dy$. Check the area both ways: $\int_0^4 (2 - \sqrt{x})\,dx = 8 - \tfrac{16}{3} = \tfrac83$ and $\int_0^2 y^2\,dy = \tfrac83$.`,
      visual: slicerPic({ x: [-0.4, 4.6], y: [-0.3, 2.5], ghost: 10,
        dydx: [{ from: 0, to: 4, lo: 'sqrt(x)', hi: '2', loLabel: 'y = √x', hiLabel: 'y = 2' }],
        dxdy: [{ from: 0, to: 2, lo: '0', hi: 'y^2' }],
        curves: [{ fn: 'sqrt(x)', domain: [0, 4.5], color: 'accent', label: 'y = √x', labelAt: 2.8, labelDy: 14 }] },
      'The region of the integral as written, cut into vertical strips (the order dy dx). Equal scales.'),
    }),
    num({
      id: 'reverse-evaluate', difficulty: 3,
      gen(r) {
        const [b, bt, bp] = r.pick([[1, '1', '1'], [Math.sqrt(Math.PI / 2), t`\sqrt{\pi/2}`, '√(π/2)'], [Math.sqrt(Math.PI), t`\sqrt{\pi}`, '√π']]);
        const kind = r.pick(['sin', 'exp']);
        const g = kind === 'sin' ? 'sin(y^2)' : 'exp(y^2)', gt = kind === 'sin' ? t`\sin(y^2)` : t`e^{y^2}`;
        const I = kind === 'sin' ? (1 - Math.cos(b * b)) / 2 : (Math.exp(b * b) - 1) / 2;
        const anti = kind === 'sin' ? t`-\tfrac12\cos(y^2)` : t`\tfrac12 e^{y^2}`;
        const B = r6(b);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${bt}}\!\!\int_x^{${bt}} ${gt}\,dy\,dx$. (The inner integral cannot be done in elementary functions as written.)`,
          answer: I, tol: { rel: 1e-3 },
          vars: ['y'], integrand: `y*${g}`, limits: [0, b],
          errors: [{ value: 2 * I, feedback: t`Check the substitution $u = y^2$: $du = 2y\,dy$, so $\int y\,${gt}\,dy = ${anti}$ — keep the $\tfrac12$.` }],
          hints: [
            t`The region is $0 \le x \le y \le ${bt}$: a triangle. Redescribe it with horizontal strips.`,
            t`At height $y$, $x$ runs from $0$ to $y$, so the integral is $\displaystyle\int_0^{${bt}}\!\!\int_0^{y} ${gt}\,dx\,dy = \int_0^{${bt}} y\,${gt}\,dy$.`,
            t`Substitute $u = y^2$: an antiderivative of $y\,${gt}$ is $${anti}$.`,
          ],
          teach: 'When the inner integral is impossible, reverse the order: the new inner integral often supplies the factor a substitution needs.',
          explain: t`Reversed: $\displaystyle\int_0^{${bt}}\!\!\int_0^{y} ${gt}\,dx\,dy = \int_0^{${bt}} y\,${gt}\,dy = \Big[${anti}\Big]_0^{${bt}} = ${fmt(I, 4)}$.`,
          visual: slicerPic({ x: [-0.25, B + 0.45], y: [-0.25, B + 0.3], ghost: 9,
            dydx: [{ from: 0, to: B, lo: 'x', hi: `${B}`, loLabel: 'y = x', hiLabel: `y = ${bp}`, toLabel: bp }],
            dxdy: [{ from: 0, to: B, lo: '0', hi: 'y' }] },
          'The region of the integral as written, cut into vertical strips (the order dy dx). Equal scales.'),
        };
      },
    }),
    mcq({
      id: 'split', difficulty: 2,
      prompt: t`$D$ is bounded by the curve $y = \sqrt{x}$, the $x$-axis and the line $x + y = 2$. Which expression gives $\displaystyle\iint_D f\,dA$ with **vertical** strips?`,
      choices: [
        t`$\displaystyle\int_0^1\!\!\int_0^{\sqrt{x}} f\,dy\,dx + \int_1^2\!\!\int_0^{2-x} f\,dy\,dx$`,
        t`$\displaystyle\int_0^2\!\!\int_0^{\sqrt{x}} f\,dy\,dx$`,
        t`$\displaystyle\int_0^2\!\!\int_{\sqrt{x}}^{2-x} f\,dy\,dx$`,
        t`$\displaystyle\int_0^1\!\!\int_{y^2}^{2-y} f\,dy\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`Past $x = 1$ the top of a vertical strip is the line $y = 2 - x$, not the curve: this integral includes a sliver outside $D$.`,
        2: t`Every vertical strip starts on the $x$-axis, $y = 0$. Between $x = 0$ and $1$ the curve is the top of the strip, and past $x = 1$ the line is.`,
        3: t`Those are the horizontal-strip limits — functions of $y$ — attached to the wrong differentials. With $dx\,dy$ and $y$ from $0$ to $1$ outside, they would be right.`,
      },
      hints: ['Sketch it: where do the curve and the line meet?', t`They meet at $(1, 1)$. Does the top of a vertical strip follow the same curve for all $x$ from $0$ to $2$?`],
      teach: 'If the top or bottom of the strips changes formula partway across, split the region there into pieces — or slice the other way.',
      explain: t`The curve and the line meet at $(1, 1)$. For $0 \le x \le 1$ a vertical strip runs from $y = 0$ up to the curve; for $1 \le x \le 2$, up to the line. Two integrals. Horizontal strips need only one: $\int_0^1\int_{y^2}^{2 - y} f\,dx\,dy$. (With $f = 1$, both give the area $\tfrac76$.)`,
      visual: slicerPic({ x: [-0.3, 2.4], y: [-0.3, 1.5], ghost: 0, order: 'dxdy', limits: false,
        dydx: [{ from: 0, to: 1, lo: '0', hi: 'sqrt(x)' }, { from: 1, to: 2, lo: '0', hi: '2 - x' }],
        dxdy: [{ from: 0, to: 1, lo: 'y^2', hi: '2 - y' }],
        curves: [{ fn: 'sqrt(x)', domain: [0, 1.6], color: 'accent2', label: 'y = √x', labelAt: 0.45, labelDx: -46, labelDy: -6 }, { fn: '2 - x', domain: [0.5, 2.2], color: 'accent2', label: 'x + y = 2', labelAt: 1.6, labelDx: 6, labelDy: -8 }] },
      'The region D, equal scales. The curves are drawn a little beyond it.'),
    }),
    mcq({
      id: 'error-outer', difficulty: 3, kind: 'error',
      prompt: t`A student wants the area between $y = x^2$ and $y = 1$ and writes
$$\int_{x^2}^{1}\!\!\int_{-1}^{1} dx\,dy = \int_{x^2}^{1} 2\,dy = 2 - 2x^2.$$
The answer is a function of $x$, which cannot be right for an area. What went wrong?`,
      choices: [
        t`The outer limits $x^2$ and $1$ involve $x$, which the inner integral has already used up: outer limits must be constants. The setup should be $\int_{-1}^{1}\int_{x^2}^{1} dy\,dx$`,
        t`The order $dx\,dy$ cannot be used for this region`,
        t`By symmetry the limits $-1$ to $1$ should be $0$ to $1$`,
        'Nothing: a double integral can come out as a function of x',
      ],
      answer: 0,
      why: {
        1: t`It can: at height $y$ a horizontal strip runs from $x = -\sqrt{y}$ to $\sqrt{y}$, so $\int_0^1\int_{-\sqrt y}^{\sqrt y} dx\,dy$ works too.`,
        2: t`Symmetry could turn the area into $2\int_0^1\cdots$, but limits $0$ to $1$ alone give half the area.`,
        3: t`A double integral over a region is a number. A leftover variable means a limit referred to a variable that had already been integrated out.`,
      },
      hints: [t`Which variable does the inner integral eliminate? Which variable do the outer limits contain?`, 'Rewrite it with the curves as the limits of the inner integral, in the order that makes them functions of the outer variable.'],
      teach: 'Inner limits may depend on the outer variable, never the other way round: the outer limits must be constants.',
      explain: t`The inner integral $\int_{-1}^{1} dx$ uses up $x$, so outer limits in $x$ refer to nothing. With vertical strips, $\int_{-1}^{1}\int_{x^2}^{1} dy\,dx = \int_{-1}^{1}(1 - x^2)\,dx = \tfrac43$; with horizontal strips, $\int_0^1 2\sqrt{y}\,dy = \tfrac43$ as well.`,
      visual: regionPic({ x: [-1.6, 1.6], y: [-0.3, 1.5], shade: [{ fn: '1', lower: 'x^2', from: -1, to: 1 }], curves: [{ fn: 'x^2', domain: [-1.25, 1.25], color: 'accent', label: 'y = x²', labelAt: 1.12, labelDx: 8, labelDy: 4 }, { fn: '1', domain: [-1.25, 1.25], color: 'accent2', label: 'y = 1', labelAt: -1.25, labelDx: -6, labelDy: -12 }], caption: t`The region between $y = x^2$ and $y = 1$. Equal scales.` }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-region', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2]), p = r.pick([1, 2, 3]), q = r.pick([1, 2, 3, 4]);
        const I = (p * a ** 4) / 12 + (q * a ** 5) / 15;
        const px = p === 1 ? 'x' : `${p}x`, qy = q === 1 ? 'y' : `${q}y`, line = a === 1 ? 'x' : `${a}x`;
        return {
          prompt: t`$D$ is the region between $y = x^2$ and $y = ${line}$. Evaluate $\displaystyle\iint_D (${px} + ${qy})\,dA$.`,
          answer: I, tol: { rel: 1e-4 },
          integrand: `${p}*x*(${a}*x - x^2) + ${q}*(${a * a}*x^2 - x^4)/2`, limits: [0, a],
          hints: [t`Vertical strips: $x$ from $0$ to $${a}$, and $y$ from $x^2$ up to $${line}$.`],
          teach: 'Set up the strips first; then the inner integral is an ordinary integral with the outer variable held constant.',
          explain: t`Inner: $\displaystyle\int_{x^2}^{${line}} (${px} + ${qy})\,dy = ${p === 1 ? '' : p}x(${line} - x^2) + \tfrac{${q}}{2}(${a * a === 1 ? '' : a * a}x^2 - x^4)$. Outer, from $0$ to $${a}$: $\tfrac{${p}\cdot ${a}^4}{12} + \tfrac{${q}\cdot ${a}^5}{15} = ${fmt(I, 4)}$.`,
          visual: boxesPic(`${p}*x + ${q}*y`, [0, a], [0, a * a], { m: 12, n: 12, top: 0.55 * a * a, inside: `step(${a}*x - y)*step(y - x^2)`, outline: [{ param: ['t', 't^2'], t: [0, a] }, { param: ['t', `${a}*t`], t: [0, a] }], caption: t`Boxes under $z = ${px} + ${qy}$, standing only on cells whose centre lies in $D$ (outlined on the floor). Heights scaled to fit; drag to rotate.` }),
        };
      },
    }),
    mcq({
      id: 'cp-reverse', difficulty: 2,
      prompt: t`Reverse the order of integration in $\displaystyle\int_0^2\!\!\int_{y/2}^{1} f(x, y)\,dx\,dy$.`,
      choices: [
        t`$\displaystyle\int_0^1\!\!\int_0^{2x} f\,dy\,dx$`,
        t`$\displaystyle\int_0^1\!\!\int_{2x}^{2} f\,dy\,dx$`,
        t`$\displaystyle\int_0^2\!\!\int_0^{2x} f\,dy\,dx$`,
        t`$\displaystyle\int_0^1\!\!\int_0^{x/2} f\,dy\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`That is the triangle on the other side of the line. Here $x \ge y/2$, which means $y \le 2x$.`,
        2: t`The outer variable is now $x$, which runs from $0$ to $1$; $2$ is the largest $y$.`,
        3: t`$x = y/2$ inverts to $y = 2x$, not $y = x/2$.`,
      },
      hints: ['Sketch the region: y from 0 to 2, and x from the line x = y/2 out to x = 1.'],
      teach: 'Sketch, then redescribe: the boundary x = y/2 becomes y = 2x when the strips turn vertical.',
      explain: t`The region is the triangle with corners $(0, 0)$, $(1, 0)$ and $(1, 2)$. A vertical strip at $x$ runs from $y = 0$ up to the line $y = 2x$, for $0 \le x \le 1$.`,
      visual: slicerPic({ x: [-0.3, 1.6], y: [-0.3, 2.4], ghost: 9, order: 'dxdy', dxdy: [{ from: 0, to: 2, lo: 'y/2', hi: '1', loLabel: 'x = y/2', hiLabel: 'x = 1' }], dydx: [{ from: 0, to: 1, lo: '0', hi: '2x' }] }, 'The region of the integral as written, cut into horizontal strips (the order dx dy). Equal scales.'),
    }),
    num({
      id: 'cp-window', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([8, 9, 10]), a = r.pick([0.4, 0.5, 0.6]), h = r.pick([0.9, 1.2]);
        const F = RHO_W * G * a * h * (D - h / 3);
        return {
          prompt: t`Astronauts rehearse spacewalks underwater in NASA's Neutral Buoyancy Laboratory, a fresh-water pool about 12 m deep. Suppose a viewing port in its vertical wall is a triangle: its base, ${nice(2 * a)} m wide, is horizontal at a depth of ${D} m, and its apex is ${h} m higher. With $y$ measured up from the base, the water's gauge pressure is $p = \rho g(${D} - y)$, where $\rho = ${RHO_W}$ kg/m³ and $g = ${G}$ m/s². Find the force of the water on the port, $F = \iint_D p\,dA$.`,
          answer: F / 1000, units: 'kN', tol: { rel: 0.005 },
          errors: [
            { value: (RHO_W * G * D * a * h) / 1000, feedback: t`That uses the pressure at the base for the whole port. The port reaches up to depth $${nice(D - h)}$ m, where the pressure is lower: integrate.` },
            { value: (RHO_W * G * a * h * (D - h / 2)) / 1000, feedback: t`Close — but a triangle with its base down has more area low down: its centroid is a third of the way up, not halfway.` },
          ],
          hints: [
            t`Use horizontal strips: $p$ depends only on $y$. At height $y$ the port's width is $${nice(2 * a)}\left(1 - \frac{y}{${h}}\right)$ m.`,
            t`$F = \displaystyle\int_0^{${h}} \rho g(${D} - y)\cdot ${nice(2 * a)}\left(1 - \frac{y}{${h}}\right) dy$.`,
            t`That works out to $\rho g\,a h\left(D - \tfrac{h}{3}\right)$ with $a = ${a}$ m (the half-width) — the pressure at the centroid times the area.`,
          ],
          teach: 'Choose the order that suits the integrand: pressure depends only on depth, so horizontal strips make the inner integral just the strip’s width.',
          explain: t`$F = \rho g \displaystyle\int_0^{${h}} (${D} - y)\,${nice(2 * a)}\left(1 - \tfrac{y}{${h}}\right) dy = \rho g\,(${a})(${h})\left(${D} - \tfrac{${h}}{3}\right) = ${fmt(F, 4)}$ N $\approx ${fmt(F / 1000, 3)}$ kN. That is the pressure at the port's centroid, a third of the way up, times its area — about the weight of ${Math.round(F / G / 1000)} tonnes.`,
          visual: regionPic({
            x: [-1.2, 1.2], y: [-0.4, h + 0.9], aspect: 'wide', ylabel: 'y (m)', xlabel: 'x (m)',
            shade: [{ fn: `${h}*(1 - abs(x)/${a})`, lower: '0', from: -a, to: a, alpha: 0.32 }, { fn: `${r6(h * 0.55)} + 0.03`, lower: `${r6(h * 0.55)} - 0.03`, from: r6(-a * 0.45), to: r6(a * 0.45), color: 'gold', alpha: 0.85 }],
            curves: [{ param: [`${-a} + ${2 * a}*t`, '0'], t: [0, 1], color: 'accent' }, { param: [`${-a}*(1 - t)`, `${h}*t`], t: [0, 1], color: 'accent' }, { param: [`${a}*(1 - t)`, `${h}*t`], t: [0, 1], color: 'accent' }],
            points: [{ x: 0, y: h, color: 'accent', label: 'apex', labelDx: 8, labelDy: -6 }],
            arrows: [{ from: [0.85, 0], to: [0.85, h + 0.75], color: 'ink3', label: 'up, toward the surface', labelDx: -4, labelDy: -10, labelAlign: 'right' }],
            caption: t`The port in the wall, seen from inside the pool (the surface is ${nice(D - h)} m above the apex, far off the top). Gold: one horizontal strip, where the pressure is the same all along.`,
          }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §5.2 Double integrals over general regions', url: 'https://openstax.org/books/calculus-volume-3/pages/5-2-double-integrals-over-general-regions' },
    { label: 'NASA: the Neutral Buoyancy Laboratory', url: 'https://www.nasa.gov/johnson/neutral-buoyancy-laboratory/' },
  ],
});
