// Double integrals over rectangles: boxes standing on a grid of cells, the
// limit of their total, and Fubini's theorem — the double integral as two
// single integrals, in either order — with its fine print.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { boxesPic, surfPic, regionPic, rectShade, rectOutline, r6 } from './_integrals.js';

const t = String.raw;

// 2024-T3 aluminium alloy, kg/m³
const RHO_AL = 2780;

export default lesson({
  id: 'math2210.C3-4.1',
  title: 'Double integrals over rectangles',
  minutes: 11, difficulty: 2,
  intro: t`Cut a rectangle $R = [a, b] \times [c, d]$ into small cells of area $\Delta A$, stand a box of height $f(x^*, y^*)$ on each cell, and add up the volumes of the boxes. As the cells shrink, the total settles on the **double integral**:

$$\iint_R f(x, y)\,dA = \lim_{m,\,n\to\infty}\ \sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A$$

When $f \ge 0$ it is the volume of the solid under the graph. Nobody computes it from boxes: **Fubini's theorem** says it equals an *iterated integral* — integrate in $y$ with $x$ held fixed, then integrate the result in $x$ — and the two orders give the same number. Every quantity spread over a surface is one of these: the mass of a sheet, the force of pressure on a hatch, the power falling on a solar panel.`,
  symbols: [
    { tex: 'R = [a, b] \\times [c, d]', text: t`the **rectangle** $a \le x \le b$, $c \le y \le d$: the region you integrate over` },
    { tex: 'f(x, y)', text: 'the **integrand**: a height, an areal density (kg/m²), a pressure (Pa), an irradiance (W/m²) — any function defined on the rectangle' },
    { tex: '\\Delta A = \\Delta x\\,\\Delta y', text: t`the area of one cell, with $\Delta x = (b - a)/m$ and $\Delta y = (d - c)/n$` },
    { tex: '(x_{ij}^*, y_{ij}^*)', text: t`the **sample point** in cell $(i, j)$, where $f$ sets the height of its box: its centre, a corner — any point of the cell will do in the limit` },
    { tex: 'm,\\ n', text: t`the number of cells along $x$ and along $y$; the limit lets both grow without bound` },
    { tex: 'dA', text: t`the **area element**: an infinitesimal cell. On a rectangle, $dA = dx\,dy = dy\,dx$, and the units of the integral are those of $f$ times area` },
  ],
  why: t`Fubini's theorem turns every double integral into two single integrals you already know how to do — and the same one-variable-at-a-time move will handle triple integrals, mass, charge and moments of inertia later in this module.`,
  visual: {
    type: 'c3-boxes',
    title: 'Boxes under a surface',
    lead: t`The solid under $f(x, y) = 4 - \tfrac{x^2}{2} - \tfrac{y^2}{4}$ over $R = [0, 2]\times[0, 3]$, approximated by boxes. The readout adds up their volumes — the Riemann sum — and compares it with the exact $\iint_R f\,dA = 15.5$. The violet slice, when you show it, is the cut through the solid at $x = x_0$: its area $A(x_0)$ is the **inner integral** of Fubini's theorem.`,
    tasks: [
      t`Set $m = n = 1$: a single box of height $f(1, 1.5) = 2.9375$ on all $6$ square units gives $17.6$. Now set both to 12: the sum closes in on $15.5$.`,
      t`With $m = n = 3$, switch the sample point to the lower-left corners: $f$ falls as $x$ and $y$ grow, so every box is too tall and the sum overshoots. Upper-right corners undershoot.`,
      t`Tick **Show the slice** and slide it: its area $A(x_0) = 9.75 - 1.5x_0^2$ shrinks as $x_0$ grows. Adding up slices of thickness $dx$, $\int_0^2 A(x)\,dx = 15.5$, gives the same volume — that is Fubini's theorem.`,
    ],
    params: { f: '4 - x^2/2 - y^2/4', x: [0, 2], y: [0, 3], m: 3, n: 3, maxCells: 12, rule: 'mid', rules: ['mid', 'll', 'ur'], slice: true, sliceAt: 1, exact: 15.5 },
    caption: t`Drag to rotate; scroll or pinch to zoom. Heights are to scale. The gold sheet is the graph of $f$; each blue box has the height of $f$ at its sample point.`,
  },
  example: {
    prompt: t`Find the volume of the solid under $z = 6x^2y$ above the rectangle $R = [0, 2]\times[1, 3]$, integrating first in $y$, then in $x$. Check it in the other order.`,
    visual: { type: 'c3-boxes', params: { f: '6*x^2*y', x: [0, 2], y: [1, 3], m: 4, n: 4, cellSliders: false, zscale: 0.0333, exact: 64 }, caption: t`Sixteen midpoint boxes under $z = 6x^2y$ (heights drawn at $1/30$ scale). Their total, $63.0$, is already within 2% of the exact volume.` },
    steps: [
      { label: 'Inner integral', text: t`Hold $x$ fixed and integrate in $y$ from $1$ to $3$. With $x$ constant, $6x^2$ is just a coefficient — this is a partial derivative run backwards:
$$\int_1^3 6x^2y\,dy = 6x^2\left[\frac{y^2}{2}\right]_1^3 = 6x^2\cdot 4 = 24x^2.$$
That is the area of the slice of the solid at this $x$.` },
      { label: 'Outer integral', text: t`Add up the slices from $x = 0$ to $x = 2$: $\displaystyle\int_0^2 24x^2\,dx = 8x^3\Big|_0^2 = 64$.` },
      { label: 'The other order', text: t`Inner in $x$: $\displaystyle\int_0^2 6x^2y\,dx = 2x^3y\Big|_0^2 = 16y$. Outer in $y$: $\displaystyle\int_1^3 16y\,dy = 8y^2\Big|_1^3 = 64$. The same, as Fubini's theorem promises for a continuous integrand.` },
      { label: 'A shortcut', text: t`The integrand is a product $g(x)\,h(y)$ and the region is a rectangle, so the double integral is a product of single integrals: $\left(\int_0^2 6x^2\,dx\right)\left(\int_1^3 y\,dy\right) = 16 \times 4 = 64$.` },
      { label: 'Sense check', text: t`The rectangle has area $4$, so the average height is $64/4 = 16$. The height runs from $0$ (along $x = 0$) to $72$ (at the corner $(2, 3)$) and is large only near $x = 2$ — an average of $16$ is believable.` },
    ],
    answer: t`$\displaystyle\iint_R 6x^2y\,dA = 64$, in either order.`,
  },
  practice: [
    num({
      id: 'box-sum', difficulty: 1,
      gen(r) {
        const A = r.pick([4, 8]), B = r.pick([2, 4, 6]), k = r.pick([1, 2, 3]);
        const dA = (A * B) / 4;
        const pts = [[A / 4, B / 4], [(3 * A) / 4, B / 4], [A / 4, (3 * B) / 4], [(3 * A) / 4, (3 * B) / 4]];
        const f = (x, y) => x * x + k * y;
        const heights = pts.map(([x, y]) => f(x, y)), H = heights.reduce((s, v) => s + v, 0), S = dA * H;
        const ll = dA * [[0, 0], [A / 2, 0], [0, B / 2], [A / 2, B / 2]].reduce((s, [x, y]) => s + f(x, y), 0);
        const ur = dA * [[A / 2, B / 2], [A, B / 2], [A / 2, B], [A, B]].reduce((s, [x, y]) => s + f(x, y), 0);
        const exact = (B * A ** 3) / 3 + (k * A * B * B) / 2;
        const ky = k === 1 ? 'y' : `${k}y`;
        return {
          prompt: t`Estimate $\displaystyle\iint_R (x^2 + ${ky})\,dA$ over $R = [0, ${A}]\times[0, ${B}]$ with a Riemann sum of $2 \times 2$ cells, taking each cell's **centre** as its sample point.`,
          answer: S, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [
            { value: ll, feedback: 'You used the lower-left corner of each cell. The midpoint rule takes the centres.' },
            { value: ur, feedback: 'You used the upper-right corner of each cell. The midpoint rule takes the centres.' },
            { value: H, feedback: t`You added the heights but did not multiply by the cell area: each box has volume $f(x^*, y^*)\,\Delta A$, with $\Delta A = ${nice(dA)}$.` },
          ],
          hints: [
            t`Each cell is $${nice(A / 2)}$ by $${nice(B / 2)}$, so $\Delta A = ${nice(dA)}$; the centres are at $x = ${nice(A / 4)}, ${nice((3 * A) / 4)}$ and $y = ${nice(B / 4)}, ${nice((3 * B) / 4)}$.`,
            t`Sum $f$ over the four centres, then multiply by $\Delta A$.`,
          ],
          teach: 'A double Riemann sum adds up boxes: the height of f at a sample point in each cell, times the cell’s area.',
          explain: t`The heights are $${heights.map((h) => nice(h)).join(',\\ ')}$, which add to $${nice(H)}$; times $\Delta A = ${nice(dA)}$ that is $${nice(S)}$. The exact integral is $${nice(r6(exact))}$, so four boxes are already within ${Math.round((100 * Math.abs(S - exact)) / exact)}%.`,
          visual: boxesPic(`x^2 + ${k}*y`, [0, A], [0, B], { m: 2, n: 2, samples: true, caption: t`Four cells, each with a box as tall as $f$ at the cell's centre: the gold dots mark those points of the graph. Heights scaled to fit; drag to rotate.` }),
        };
      },
    }),
    mcq({
      id: 'which-iterated', difficulty: 1,
      prompt: t`Which iterated integral equals $\displaystyle\iint_R f(x, y)\,dA$ for the rectangle $R = [1, 4]\times[0, 2]$?`,
      choices: [
        t`$\displaystyle\int_0^2\!\!\int_1^4 f(x, y)\,dx\,dy$`,
        t`$\displaystyle\int_0^2\!\!\int_1^4 f(x, y)\,dy\,dx$`,
        t`$\displaystyle\int_1^4\!\!\int_0^2 f(x, y)\,dx\,dy$`,
        t`$\displaystyle\left(\int_1^4 f\,dx\right)\left(\int_0^2 f\,dy\right)$`,
      ],
      answer: 0,
      why: {
        1: t`Here the inner integral is in $y$ but carries the $x$-limits, $1$ to $4$. The inner limits belong to the inner differential: $y$ only runs from $0$ to $2$.`,
        2: t`This runs $x$ from $0$ to $2$ and $y$ from $1$ to $4$: the rectangle $[0, 2]\times[1, 4]$, not $R$.`,
        3: t`A product of single integrals equals the double integral only when $f$ itself splits as $g(x)\,h(y)$ — and then each factor integrates its own part, not the whole of $f$.`,
      },
      hints: [t`The inner integral sits next to the inner differential. Which variable runs from $1$ to $4$?`],
      teach: 'In an iterated integral, each pair of limits belongs to the differential it encloses: the innermost limits go with the innermost d.',
      explain: t`$x$ runs from $1$ to $4$ and $y$ from $0$ to $2$. Reading from the inside out, $\int_1^4 \cdots\,dx$ is the inner integral in $x$, and $\int_0^2 \cdots\,dy$ the outer one in $y$. By Fubini's theorem, $\int_1^4\!\int_0^2 f\,dy\,dx$ would do just as well.`,
      visual: regionPic({ x: [-0.6, 5], y: [-0.6, 2.8], shade: [rectShade(1, 4, 0, 2)], curves: rectOutline(1, 4, 0, 2), points: [{ x: 4, y: 2, color: 'accent', label: '(4, 2)' }, { x: 1, y: 0, color: 'accent', label: '(1, 0)', labelDy: 12 }], caption: t`The rectangle $R$: $1 \le x \le 4$, $0 \le y \le 2$.` }),
    }),
    num({
      id: 'sum-integrand', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2, 3]), q = r.pick([1, 2, 3]), A = r.pick([1, 2, 3]), B = r.pick([1, 2, 3]);
        const exact = (p * B * A * A) / 2 + (q * A * B ** 3) / 3;
        const own = (p * A * A) / 2 + (q * B ** 3) / 3;
        const swapped = (p * A * B * B) / 2 + (q * B * A ** 3) / 3;
        const errors = [{ value: own, feedback: t`Each term must be integrated over the whole rectangle: the $x$ term picks up a factor $${B}$ from the $dy$ integral, and the $y^2$ term a factor $${A}$ from the $dx$ integral.` }];
        if (Math.abs(swapped - exact) > 1e-6 * exact) errors.push({ value: swapped, feedback: t`You ran $x$ from $0$ to $${B}$ and $y$ from $0$ to $${A}$: the limits belong to the other variables.` });
        const px = p === 1 ? 'x' : `${p}x`, qy = q === 1 ? 'y^2' : `${q}y^2`;
        return {
          prompt: t`Evaluate $\displaystyle\iint_R (${px} + ${qy})\,dA$ over $R = [0, ${A}]\times[0, ${B}]$.`,
          answer: exact, tol: { rel: 1e-4 },
          integrand: `${p * B}*x + ${q * B ** 3}/3`, limits: [0, A],
          errors: errors.filter((e) => Math.abs(e.value - exact) > 1e-6 * exact),
          hints: [
            t`Integrate in $y$ first, from $0$ to $${B}$, holding $x$ constant.`,
            t`$\displaystyle\int_0^{${B}} (${px} + ${qy})\,dy = ${nice(p * B)}x + ${nice(r6((q * B ** 3) / 3))}$. Now integrate that from $x = 0$ to $${A}$.`,
          ],
          teach: 'In the inner integral the outer variable is a constant: integrate one variable at a time.',
          explain: t`Inner: $\displaystyle\int_0^{${B}} (${px} + ${qy})\,dy = ${nice(p * B)}x + \frac{${q * B ** 3}}{3}$. Outer: $\displaystyle\int_0^{${A}} \left(${nice(p * B)}x + \frac{${q * B ** 3}}{3}\right)dx = ${nice(r6((p * B * A * A) / 2))} + ${nice(r6((q * A * B ** 3) / 3))} = ${nice(r6(exact))}$.`,
          visual: surfPic(`${p}*x + ${q}*y^2`, [0, A], [0, B], { caption: t`The graph of $z = ${px} + ${qy}$ over $R$ (heights scaled to fit). The integral is the volume beneath it. Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'product', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 4]), B = r.pick([2, 3, 4, 5]);
        const exact = (A * A * (B - 1)) / 2;
        const errors = [{ value: (A * A * B) / 2, feedback: t`At the lower limit $e^{0} = 1$, not $0$: $\int_0^{\ln ${B}} e^y\,dy = ${B} - 1$.` }];
        if (A !== 2) errors.push({ value: A * (B - 1), feedback: t`$\int_0^{${A}} x\,dx = \tfrac{${A}^2}{2}$, not $${A}$.` });
        return {
          prompt: t`Evaluate $\displaystyle\iint_R x\,e^{y}\,dA$ over $R = [0, ${A}]\times[0, \ln ${B}]$.`,
          answer: exact, tol: { rel: 1e-4 },
          integrand: `${B - 1}*x`, limits: [0, A],
          errors,
          hints: [
            t`The integrand is a product $g(x)\,h(y)$ and $R$ is a rectangle, so the double integral is $\left(\int_0^{${A}} x\,dx\right)\left(\int_0^{\ln ${B}} e^{y}\,dy\right)$.`,
            t`$e^{\ln ${B}} = ${B}$.`,
          ],
          teach: 'Over a rectangle, a product g(x)h(y) integrates to the product of the two single integrals.',
          explain: t`$\displaystyle\int_0^{${A}} x\,dx = ${nice(A * A / 2)}$ and $\displaystyle\int_0^{\ln ${B}} e^y\,dy = e^{\ln ${B}} - e^0 = ${B - 1}$, so the integral is $${nice(A * A / 2)} \times ${B - 1} = ${nice(exact)}$.`,
          visual: boxesPic('x*exp(y)', [0, A], [0, r6(Math.log(B))], { m: 4, n: 4, caption: t`Midpoint boxes under $z = x e^{y}$ over $R$ (heights scaled to fit). Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'average', difficulty: 2,
      gen(r) {
        const T0 = r.pick([300, 310, 320]), a = r.pick([10, 15, 20]), b = r.pick([6, 9, 12]);
        const avg = T0 - a - b / 3;
        return {
          prompt: t`A spacecraft radiator panel occupies $0 \le x \le 2$ m, $0 \le y \le 1$ m. A heat pipe runs along its edge $x = 0$, and its temperature is $T(x, y) = ${T0} - ${a}x - ${b}y^2$ kelvin (with $x$, $y$ in metres). The **average value** of $T$ over the panel is $\bar T = \dfrac{1}{\text{area}}\iint_R T\,dA$. Find it.`,
          answer: avg, units: 'K', tol: { rel: 0, abs: 0.3 },
          errors: [
            { value: 2 * avg, feedback: t`That is $\iint_R T\,dA$, in K·m². Divide by the panel's area, $2\ \text{m}^2$.` },
            { value: T0 - a - b / 2, feedback: t`The average of $y^2$ over $0 \le y \le 1$ is $\int_0^1 y^2\,dy = \tfrac13$, not $\tfrac12$.` },
            { value: T0 - 2 * a - b, feedback: 'That is the temperature at the coldest corner, not the average over the panel.' },
          ],
          hints: [
            t`$\iint_R T\,dA = \displaystyle\int_0^2\!\!\int_0^1 (${T0} - ${a}x - ${b}y^2)\,dy\,dx$.`,
            t`The inner integral gives $${T0} - ${a}x - ${nice(b / 3)}$; integrating that over $0 \le x \le 2$ gives $2(${T0} - ${a} - ${nice(b / 3)})$. Divide by the area.`,
          ],
          teach: 'The average value of f over a region is its double integral divided by the region’s area.',
          explain: t`$\iint_R T\,dA = 2\cdot${T0} - ${a}\cdot\tfrac{2^2}{2}\cdot 1 - ${b}\cdot 2\cdot\tfrac13 = ${nice(2 * avg)}$ K·m², and dividing by $2\ \text{m}^2$ gives $\bar T = ${nice(avg)}$ K. Each term averages separately: $x$ averages $1$ m and $y^2$ averages $\tfrac13\ \text{m}^2$.`,
          visual: surfPic(`${a}*(2 - x) + ${b}*(1 - y^2)`, [0, 2], [0, 1], { top: 0.35, pitch: 1.2, yaw: -1.5708, target: [1, 0.5, 0.1], dist: 4.2, caption: t`The panel seen almost from above, $x$ to the right and $y$ up, coloured from cool blue to warm gold by temperature (and raised a little where it is warmer). The heat pipe runs along the edge $x = 0$.` }),
        };
      },
    }),
    mcq({
      id: 'fubini-fails', difficulty: 3,
      prompt: t`For $f(x, y) = \dfrac{x^2 - y^2}{(x^2 + y^2)^2}$ on $R = [0, 1]\times[0, 1]$, a student finds
$$\int_0^1\!\!\int_0^1 f\,dy\,dx = \frac{\pi}{4} \quad\text{and}\quad \int_0^1\!\!\int_0^1 f\,dx\,dy = -\frac{\pi}{4}.$$
Both calculations are correct. How can the two orders disagree?`,
      choices: [
        t`Fubini's theorem does not apply: near the origin $|f|$ grows like $1/r^2$, so $\iint_R |f|\,dA$ is infinite and $f$ is not integrable over $R$`,
        'One of the two calculations must contain an algebra slip after all',
        'The order of integration always matters a little; Fubini’s theorem only says the answers are close',
        'The two answers differ by a constant of integration',
      ],
      answer: 0,
      why: {
        1: t`Both are right: $\frac{\partial}{\partial y}\frac{y}{x^2 + y^2} = \frac{x^2 - y^2}{(x^2 + y^2)^2}$, so the inner $dy$ integral is $\frac{1}{1 + x^2}$ and the outer gives $\frac{\pi}{4}$. Exchanging the roles of $x$ and $y$ flips the sign.`,
        2: t`For a continuous function on a closed rectangle — and for any $f$ with $\iint |f|\,dA$ finite — the two orders agree **exactly**, not approximately.`,
        3: t`Definite integrals carry no constant of integration: $\frac{\pi}{4}$ and $-\frac{\pi}{4}$ are two different numbers.`,
      },
      hints: [t`Look at the integrand near the corner $(0, 0)$. Is it continuous on all of $R$?`, t`Fubini's theorem needs $f$ continuous on $R$, or at least $\iint_R |f|\,dA < \infty$. In polar form, $|f| = |\cos 2\theta|/r^2$ and $dA = r\,dr\,d\theta$.`],
      teach: 'Fubini’s theorem has a hypothesis: the integrand must be integrable (continuous on the closed rectangle is enough); without it the two orders can disagree.',
      explain: t`$f$ is undefined at the origin and unbounded near it: along the $x$-axis it is $1/x^2$, along the $y$-axis $-1/y^2$. Then $\iint_R |f|\,dA$ behaves like $\int dr/r$, which diverges, so the double integral does not exist and Fubini's theorem makes no promise. Each iterated integral still exists — they just disagree. Physical integrands (densities, pressures, temperatures) are almost always continuous, which is why you can usually swap the order without a second thought.`,
      visual: surfPic('(x^2 - y^2)/(x^2 + y^2)^2', [0, 1], [0, 1], { zscale: 0.12, zclip: 9, n: 44, top: null, caption: t`The graph of $f$ over $R$, cut off where $|f| > 9$ (heights at $0.12$ scale). It shoots up along the $x$-axis and plunges along the $y$-axis: infinite volume above and infinite volume below, meeting at the origin.` }),
    }),
    mcq({
      id: 'signed', difficulty: 2,
      prompt: t`What is $\displaystyle\iint_R x\,e^{y}\,dA$ over $R = [-1, 1]\times[0, 2]$?`,
      choices: ['0', t`$e^2 - 1$`, t`$2(e^2 - 1)$`, 'It cannot be computed: the integrand changes sign on R'],
      answer: 0,
      why: {
        1: t`That is $\iint_R |x|\,e^{y}\,dA$: it counts the red boxes below the floor as positive. In a double integral they count negatively.`,
        2: t`That takes $\int_{-1}^{1} x\,dx$ to be $2$, the length of the interval. The integral of $x$ over a symmetric interval is $0$.`,
        3: t`A double integral handles sign the way a single integral does: it is the volume above the floor minus the volume below it.`,
      },
      hints: [t`The integrand is a product $g(x)\,h(y)$ over a rectangle, so it splits into $\left(\int_{-1}^1 x\,dx\right)\left(\int_0^2 e^y\,dy\right)$.`],
      teach: 'A double integral is a signed volume: where f is negative, it subtracts.',
      explain: t`$\displaystyle\int_{-1}^{1} x\,dx = 0$, so the product is $0 \times (e^2 - 1) = 0$. In the picture, every blue box above the floor at $x > 0$ has a red twin hanging below at $-x$, and they cancel.`,
      visual: boxesPic('x*exp(y)', [-1, 1], [0, 2], { m: 6, n: 4, top: 1.6, caption: t`Midpoint boxes under $z = x e^{y}$: blue above the floor, red below (heights scaled to fit). Drag to rotate.` }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-iterated', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 2, 3]), B = r.pick([1, 2, 3]), c = r.pick([1, 2, 4]);
        const exact = 1.5 * A * A * B * B + c * A * B;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${A}}\!\!\int_0^{${B}} (6xy + ${c})\,dy\,dx$.`,
          answer: exact, tol: { rel: 1e-4 },
          integrand: `${3 * B * B}*x + ${c * B}`, limits: [0, A],
          errors: [{ value: 1.5 * A * A * B * B + c, feedback: t`The constant must be integrated too: $\iint_R ${c}\,dA = ${c}\times\text{area} = ${c * A * B}$.` }].filter((e) => Math.abs(e.value - exact) > 1e-9),
          hints: [t`Inner: $\displaystyle\int_0^{${B}} (6xy + ${c})\,dy = 3xy^2 + ${c}y\,\Big|_0^{${B}}$.`],
          teach: 'Integrate the inner variable with the outer one held constant, then integrate what is left.',
          explain: t`Inner: $${3 * B * B}x + ${c * B}$. Outer: $\displaystyle\int_0^{${A}} (${3 * B * B}x + ${c * B})\,dx = ${nice(1.5 * B * B * A * A)} + ${c * A * B} = ${nice(exact)}$.`,
          visual: boxesPic(`6*x*y + ${c}`, [0, A], [0, B], { m: 3, n: 3, caption: t`Midpoint boxes under $z = 6xy + ${c}$ over $[0, ${A}]\times[0, ${B}]$ (heights scaled to fit). Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'cp-skin', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([1.2, 1.5]), W = r.pick([0.6, 0.8]), h0 = r.pick([5, 6]), a = r.pick([1.5, 2]), b = r.pick([1, 1.5]);
        const vol = (h0 * L * W - (a * W * L * L) / 2 - (b * L * W * W) / 2) / 1000;   // m³
        const mass = RHO_AL * vol;
        const zs = r6(0.45 / h0), by = b === 1 ? 'y' : `${b}y`;   // drawn height per mm of thickness
        return {
          prompt: t`A wing-skin panel of 2024-T3 aluminium (density ${RHO_AL} kg/m³) covers the rectangle $0 \le x \le ${L}$ m (along the span) by $0 \le y \le ${W}$ m (along the chord). It is milled to taper: its thickness is $h(x, y) = ${h0} - ${a}x - ${by}$ millimetres, with $x$ and $y$ in metres. What is its mass?`,
          answer: mass, units: 'kg', tol: { rel: 0.005 },
          errors: [
            { value: (RHO_AL * h0 * L * W) / 1000, feedback: t`That is a panel $${h0}$ mm thick everywhere. The skin tapers: integrate $h$ over the rectangle.` },
            { value: (RHO_AL * (h0 * L * W - a * W * L * L - b * L * W * W)) / 1000, feedback: t`$\int_0^{${L}} x\,dx = \tfrac{${L}^2}{2}$ and $\int_0^{${W}} y\,dy = \tfrac{${W}^2}{2}$: keep the halves.` },
          ],
          hints: [
            'Mass = density × volume, and the volume of a sheet of varying thickness h is ∬ h dA.',
            t`$\iint_R (h_0 - ax - by)\,dA = h_0LW - a\,W\tfrac{L^2}{2} - b\,L\tfrac{W^2}{2}$. Convert millimetres to metres before multiplying by the density.`,
          ],
          teach: 'The volume of a sheet of varying thickness is the double integral of its thickness over its outline.',
          explain: t`$\iint_R h\,dA = ${h0}(${L})(${W}) - ${a}(${W})\tfrac{${L}^2}{2} - ${b === 1 ? '' : b}(${L})\tfrac{${W}^2}{2} = ${fmt(vol * 1000, 4)}$ mm·m², which is $${fmt(vol * 1e3, 4)}\times10^{-3}\ \text{m}^3$. The mass is $${RHO_AL}\times${fmt(vol * 1e3, 4)}\times10^{-3} = ${fmt(mass, 3)}$ kg. Sense check: a linear $h$ averages its value at the centre, $${fmt(h0 - (a * L) / 2 - (b * W) / 2, 3)}$ mm, over $${nice(r6(L * W))}\ \text{m}^2$.`,
          visual: boxesPic(`${h0} - ${a}*x - ${b}*y`, [0, L], [0, W], { m: 6, n: 4, zscale: zs, caption: t`The skin's thickness drawn as height, exaggerated ${Math.round(1000 * zs)} times: it thins along the span ($x$) and along the chord ($y$). Drag to rotate.` }),
        };
      },
    }),
    mcq({
      id: 'cp-order', difficulty: 2,
      prompt: t`To evaluate $\displaystyle\iint_R x\cos(xy)\,dA$ over $R = [0, 1]\times[0, \tfrac{\pi}{2}]$, which order is the better choice, and why?`,
      choices: [
        t`$dy$ first: with $x$ held fixed, $\int x\cos(xy)\,dy = \sin(xy)$ at once`,
        t`$dx$ first, because $x$ comes first in the integrand`,
        'It makes no difference to the work: Fubini’s theorem says the two orders are the same',
        t`Neither: $\cos(xy)$ has no antiderivative, so the integral must be done numerically`,
      ],
      answer: 0,
      why: {
        1: t`Integrating $x\cos(xy)$ in $x$ needs integration by parts — and then the $y$ integral is harder too.`,
        2: 'Fubini’s theorem says the two orders give the same value, not that they take the same effort.',
        3: t`In $y$, with $x$ fixed, $x\cos(xy)$ is the derivative of $\sin(xy)$ — the factor $x$ is exactly the inner derivative.`,
      },
      hints: [t`In $\int x\cos(xy)\,dy$, what is the derivative of $xy$ with respect to $y$?`],
      teach: 'The two orders give the same value but rarely the same work: pick the order whose inner integral is easy.',
      explain: t`Inner: $\displaystyle\int_0^{\pi/2} x\cos(xy)\,dy = \sin(xy)\Big|_0^{\pi/2} = \sin\tfrac{\pi x}{2}$. Outer: $\displaystyle\int_0^1 \sin\tfrac{\pi x}{2}\,dx = \tfrac{2}{\pi} \approx 0.637$.`,
      visual: surfPic('x*cos(x*y)', [0, 1], [0, 1.5708], { caption: t`The graph of $z = x\cos(xy)$ over $R$ (heights scaled to fit). Drag to rotate.` }),
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 3, §5.1 Double integrals over rectangular regions', url: 'https://openstax.org/books/calculus-volume-3/pages/5-1-double-integrals-over-rectangular-regions' }],
});
