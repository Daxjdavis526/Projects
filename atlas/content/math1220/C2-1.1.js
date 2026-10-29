// Area between curves: slice, approximate each strip, add the strips.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-1.1',
  title: 'Area between curves',
  minutes: 9, difficulty: 2,
  intro: t`To find the area between two curves, slice the region into thin vertical strips. A strip at $x$ has height **top minus bottom**, $f(x) - g(x)$, and width $dx$; adding the strips gives

$$A = \int_a^b \big[f(x) - g(x)\big]\,dx \qquad \text{where } f(x) \ge g(x) \text{ on } [a, b].$$

The limits are usually where the curves meet. If the curves cross inside the interval, split the integral at each crossing. If the region is bounded by curves written as $x = h(y)$, slice horizontally instead: $A = \int_c^d [\text{right} - \text{left}]\,dy$.`,
  symbols: [
    { tex: 'f(x)', text: 'the **top** curve — the boundary above each strip' },
    { tex: 'g(x)', text: 'the **bottom** curve — the boundary below each strip' },
    { tex: 'f(x) - g(x)', text: 'the height of the strip at $x$; it must not be negative' },
    { tex: 'dx', text: 'the width of a strip' },
    { tex: 'a,\\ b', text: 'where the region starts and stops — often the $x$-values where the curves intersect' },
    { tex: 'A', text: 'the area, in squared units of length (m², or “square units” when the axes have none)' },
  ],
  why: t`“Slice, approximate one slice, add them all up” is the pattern behind every application in this module — volume, arc length, work, hydrostatic force and centres of mass.`,
  visual: {
    type: 'graph',
    title: 'Add up the strips between two curves',
    lead: t`The region between the line $y = mx$ and the parabola $y = x^2$. The gold strip has height $mx - x^2$ (top minus bottom); the shaded area is the sum of all such strips from $x = 0$ to the crossing at $x = m$.`,
    tasks: [
      t`Slide the strip across the region and watch its height in the readout. The area is $\int_0^m (mx - x^2)\,dx = m^3/6$.`,
      t`Push the strip past the crossing at $x = m$: the line is now *below* the parabola and the “height” $mx - x^2$ turns negative. That is why the integral stops at the crossing.`,
      t`Double $m$ from $1$ to $2$: the area grows eightfold, because $A = m^3/6$.`,
    ],
    params: {
      x: [-0.4, 3], y: [-0.6, 7],
      sliders: [
        { key: 'm', label: 'Slope of the line $m$', min: 0.5, max: 2.5, step: 0.05, value: 2, explain: t`The line $y = mx$ meets $y = x^2$ at $x = 0$ and $x = m$.` },
        { key: 'xs', label: 'Strip position $x$', min: 0, max: 2.8, step: 0.02, value: 1, explain: 'Where the sample strip sits.' },
      ],
      curves: [
        { fn: 'm*x', color: 'accent', label: 'y = mx', labelAt: 2.6 },
        { fn: 'x^2', color: 'warn', label: 'y = x²', labelAt: 2.2 },
      ],
      shade: [
        { fn: 'm*x', lower: 'x^2', from: 0, to: 'm', color: 'accent', alpha: 0.2 },
        { fn: 'm*x', lower: 'x^2', from: 'xs', to: 'xs + 0.06', color: 'gold', alpha: 0.9 },
      ],
      points: [{ x: 0, y: 0, color: 'ink2' }, { x: 'm', y: 'm^2', color: 'ink2', label: '(m, m²)' }],
      readouts: [
        { label: t`strip height $mx - x^2$`, expr: 'm*xs - xs^2', digits: 3 },
        { label: t`area $m^3/6$`, expr: 'm^3/6', digits: 4 },
      ],
    },
    caption: t`The strip is drawn wider than a true $dx$ so you can see it. The area readout is the exact value $m^3/6$.`,
  },
  example: {
    prompt: t`Find the area of the region enclosed by $y = x + 2$ and $y = x^2$.`,
    visual: {
      type: 'graph',
      params: { aspect: 'wide', x: [-1.8, 2.8], y: [-0.5, 5], curves: [{ fn: 'x + 2', color: 'accent', label: 'y = x + 2', labelAt: -1.6 }, { fn: 'x^2', color: 'warn', label: 'y = x²', labelAt: 2.05 }], shade: [{ fn: 'x + 2', lower: 'x^2', from: -1, to: 2, color: 'accent', alpha: 0.22 }], points: [{ x: -1, y: 1, color: 'ink2', label: '(−1, 1)' }, { x: 2, y: 4, color: 'ink2', label: '(2, 4)' }] },
    },
    steps: [
      { label: 'Find the crossings', text: t`$x^2 = x + 2 \iff x^2 - x - 2 = 0 \iff (x - 2)(x + 1) = 0$, so the curves meet at $x = -1$ and $x = 2$.` },
      { label: 'Top and bottom', text: t`Test a point in between, $x = 0$: the line gives $2$, the parabola $0$. So the line is on top on $[-1, 2]$.` },
      { label: 'Set up', text: t`$A = \displaystyle\int_{-1}^{2}\left[(x + 2) - x^2\right]dx.$` },
      { label: 'Integrate', text: t`$\left[\dfrac{x^2}{2} + 2x - \dfrac{x^3}{3}\right]_{-1}^{2} = \left(2 + 4 - \dfrac83\right) - \left(\dfrac12 - 2 + \dfrac13\right) = \dfrac{10}{3} + \dfrac{7}{6} = \dfrac{9}{2}.$` },
      { label: 'Sense check', text: t`The tallest strip, at $x = \tfrac12$, has height $2.5 - 0.25 = 2.25$, and the region is 3 wide, so its area is less than $3 \times 2.25 = 6.75$. Archimedes showed that a parabolic segment has exactly $\tfrac23$ of that bound (the area of the parallelogram between the chord and the tangent parallel to it): $\tfrac23 \times 6.75 = 4.5$ ✓` },
    ],
    answer: t`$A = \dfrac{9}{2} = 4.5$ square units`,
  },
  practice: [
    num({
      id: 'line-parabola', difficulty: 1,
      gen(r) {
        const k = r.int(2, 6), A = k ** 3 / 6;
        return {
          prompt: t`Find the area of the region enclosed by $y = x^2$ and $y = ${k}x$.`,
          answer: A, tol: { rel: 0.005 },
          errors: [
            { value: k ** 3 / 2, feedback: t`That is the area under the line alone. Subtract the area under the parabola: the strip height is $${k}x - x^2$.` },
            { value: k ** 3 / 3, feedback: t`That is the area under the parabola alone. The region lies *between* the curves: integrate $${k}x - x^2$.` },
          ],
          hints: [t`The curves meet where $x^2 = ${k}x$: at $x = 0$ and $x = ${k}$.`, t`The line is on top. $A = \int_0^{${k}} \left(${k}x - x^2\right)dx$.`],
          teach: 'Find where the curves meet, decide which is on top, then integrate top minus bottom between the crossings.',
          explain: t`$A = \left[\tfrac{${k}}{2}x^2 - \tfrac{x^3}{3}\right]_0^{${k}} = \tfrac{${k ** 3}}{2} - \tfrac{${k ** 3}}{3} = \tfrac{${k ** 3}}{6} \approx ${nice(A)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, k + 1], y: [-1, k * k + 2], curves: [{ fn: `${k}*x`, color: 'accent' }, { fn: 'x^2', color: 'warn' }], shade: [{ fn: `${k}*x`, lower: 'x^2', from: 0, to: k, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    mcq({
      id: 'crossing', difficulty: 2,
      prompt: t`Which expression gives the area between $y = \sin x$ and $y = \cos x$ for $0 \le x \le \tfrac{\pi}{2}$?`,
      choices: [
        t`$\displaystyle\int_0^{\pi/4}(\cos x - \sin x)\,dx + \int_{\pi/4}^{\pi/2}(\sin x - \cos x)\,dx$`,
        t`$\displaystyle\int_0^{\pi/2}(\cos x - \sin x)\,dx$`,
        t`$\displaystyle\int_0^{\pi/2}(\sin x - \cos x)\,dx$`,
        t`$\displaystyle\int_0^{\pi/2}(\cos x + \sin x)\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`That is a *net* difference: the two halves cancel and it equals $0$.`,
        2: t`Also a net difference, also $0$ — the curves swap places at $x = \tfrac{\pi}{4}$.`,
        3: t`Adding the curves gives the area under both, not the area between them.`,
      },
      hints: ['Find where the curves cross.', t`On each side of the crossing, which curve is on top?`],
      teach: 'When the curves cross, split the integral at each crossing so the strip height, top minus bottom, is never negative.',
      explain: t`$\sin x = \cos x$ at $x = \tfrac{\pi}{4}$. Before it $\cos x$ is on top; after it $\sin x$ is. Each piece equals $\sqrt2 - 1$, so the area is $2\sqrt2 - 2 \approx 0.828$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1, 1.75], y: [-0.1, 1.2], curves: [{ fn: 'sin(x)', color: 'accent', label: 'sin x', labelAt: 1.35 }, { fn: 'cos(x)', color: 'warn', label: 'cos x', labelAt: 0.15 }], shade: [{ fn: 'cos(x)', lower: 'sin(x)', from: 0, to: 'pi/4', color: 'warn', alpha: 0.25 }, { fn: 'sin(x)', lower: 'cos(x)', from: 'pi/4', to: 'pi/2', color: 'accent', alpha: 0.25 }], vlines: [{ x: 'pi/4', label: 'π/4' }] } },
    }),
    num({
      id: 'two-lobes', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), A = k ** 4 / 2;
        const line = k === 1 ? 'x' : `${k * k}x`;
        return {
          prompt: t`Find the **total** area enclosed between $y = x^3$ and $y = ${line}$.`,
          answer: A, tol: { rel: 0.005 },
          errors: [{ value: A / 2, feedback: 'That is one of the two lobes. The region has a second, identical lobe on the other side of the origin.' }],
          hints: [t`The curves meet where $x^3 = ${line}$: at $x = -${k}$, $0$ and $${k}$.`, t`On $[0, ${k}]$ the line is on top; on $[-${k}, 0]$ the cubic is. Integrate each piece separately — or use the symmetry.`],
          teach: 'If a single integral of top − bottom would cancel to zero, split at the crossings — area never cancels.',
          explain: t`Each lobe has area $\int_0^{${k}}\left(${line} - x^3\right)dx = \tfrac{${k ** 4}}{2} - \tfrac{${k ** 4}}{4} = ${nice(k ** 4 / 4)}$. Total: $${nice(A)}$. (The single integral $\int_{-${k}}^{${k}}(x^3 - ${line})\,dx$ is $0$ — the lobes cancel.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-k * 1.4, k * 1.4], y: [-(k ** 3) * 1.3, k ** 3 * 1.3], curves: [{ fn: 'x^3', color: 'warn' }, { fn: `${k * k}*x`, color: 'accent' }], shade: [{ fn: 'x^3', lower: `${k * k}*x`, from: -k, to: 0, color: 'warn', alpha: 0.25 }, { fn: `${k * k}*x`, lower: 'x^3', from: 0, to: k, color: 'accent', alpha: 0.25 }] } },
        };
      },
    }),
    num({
      id: 'dy-slicing', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 6, 12, 20]);
        const w = Math.sqrt(1 + 4 * c), lo = (1 - w) / 2, hi = (1 + w) / 2, A = w ** 3 / 6;
        return {
          prompt: t`Find the area of the region bounded by the parabola $x = y^2$ and the line $x = y + ${c}$.`,
          answer: A, tol: { rel: 0.005 },
          hints: [t`The curves meet where $y^2 = y + ${c}$: at $y = ${lo}$ and $y = ${hi}$.`, t`Slice horizontally. For each $y$ the line is on the right and the parabola on the left: $A = \int_{${lo}}^{${hi}} \left(y + ${c} - y^2\right)dy$.`],
          teach: t`When the boundaries are functions of $y$, slice horizontally: $A = \int (\text{right} - \text{left})\,dy$.`,
          explain: t`$A = \left[\tfrac{y^2}{2} + ${c}y - \tfrac{y^3}{3}\right]_{${lo}}^{${hi}} = ${nice(A)}$. Vertical strips would need two integrals here, because the bottom boundary changes from the parabola to the line at $x = ${lo * lo}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, hi * hi + 1.5], y: [lo - 1, hi + 1], curves: [{ param: ['t^2', 't'], t: [lo - 1, hi + 1], color: 'warn' }, { param: [`t + ${c}`, 't'], t: [lo - 1, hi + 1], color: 'accent' }], shade: [{ fn: 'sqrt(x)', lower: '-sqrt(x)', from: 0, to: lo * lo, color: 'accent', alpha: 0.22 }, { fn: 'sqrt(x)', lower: `x - ${c}`, from: lo * lo, to: hi * hi, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    mcq({
      id: 'choose-slicing', difficulty: 2,
      prompt: t`The region is bounded by $y = \sqrt{x}$, the line $y = x - 2$ and the $x$-axis. Which **single** integral gives its area?`,
      choices: [
        t`$\displaystyle\int_0^2\left[(y + 2) - y^2\right]dy$`,
        t`$\displaystyle\int_0^4\left[\sqrt{x} - (x - 2)\right]dx$`,
        t`$\displaystyle\int_0^2\left[y^2 - (y + 2)\right]dy$`,
        t`$\displaystyle\int_0^4\sqrt{x}\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`For $0 < x < 2$ the line $y = x - 2$ dips below the $x$-axis, but the region stops at $y = 0$: this integral adds an extra triangle.`,
        2: t`That is left minus right — it gives the negative of the area.`,
        3: t`That includes the triangle under the line between $x = 2$ and $x = 4$, which is not part of the region.`,
      },
      hints: [t`Sketch it: the corners are $(0, 0)$, $(2, 0)$ and $(4, 2)$.`, t`With vertical strips the bottom boundary changes at $x = 2$. With horizontal strips, every strip runs from $x = y^2$ (left) to $x = y + 2$ (right).`],
      teach: 'Choose the slicing direction in which every strip has the same two boundary curves.',
      explain: t`Solving for $x$: the curve is $x = y^2$ and the line is $x = y + 2$. For $0 \le y \le 2$ every horizontal strip runs between them, so $A = \int_0^2 (y + 2 - y^2)\,dy = \tfrac{10}{3}$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 5], y: [-2.3, 2.8], curves: [{ fn: 'sqrt(x)', color: 'warn', label: 'y = √x', labelAt: 0.6 }, { fn: 'x - 2', color: 'accent', label: 'y = x − 2', labelAt: 4.3 }], shade: [{ fn: 'sqrt(x)', from: 0, to: 2, color: 'accent', alpha: 0.22 }, { fn: 'sqrt(x)', lower: 'x - 2', from: 2, to: 4, color: 'accent', alpha: 0.22 }] } },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`Asked for the area between $y = 2x$ and $y = x^2$ for $0 \le x \le 3$, a student writes

$$\int_0^3 \left(2x - x^2\right)dx = \left[x^2 - \frac{x^3}{3}\right]_0^3 = 9 - 9 = 0$$

and concludes the area is zero. What is wrong?`,
      choices: [
        t`The curves cross at $x = 2$, so $2x - x^2$ changes sign and the pieces cancel; splitting at $x = 2$ gives $\tfrac43 + \tfrac43 = \tfrac83$`,
        t`The antiderivative is wrong`,
        t`The upper limit should be $2$, so the area is $\tfrac43$`,
        t`The integrand should be $x^2 - 2x$`,
      ],
      answer: 0,
      why: {
        1: t`$\dfrac{d}{dx}\left(x^2 - \dfrac{x^3}{3}\right) = 2x - x^2$ — the antiderivative is right.`,
        2: t`The region asked for runs to $x = 3$; stopping at $2$ drops the piece between $2$ and $3$.`,
        3: t`Swapping the order also gives $0$; the trouble is the sign change inside the interval.`,
      },
      hints: [t`Is $2x$ above $x^2$ on the whole interval $[0, 3]$?`, t`Solve $2x = x^2$. What happens to the sign of $2x - x^2$ after the crossing?`],
      teach: 'An integral of top − bottom is only an area if top really stays on top; otherwise split at the crossings.',
      explain: t`$2x \ge x^2$ only on $[0, 2]$. The area is $\int_0^2 (2x - x^2)\,dx + \int_2^3 (x^2 - 2x)\,dx = \tfrac43 + \tfrac43 = \tfrac83$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 3.4], y: [-0.5, 9.5], curves: [{ fn: '2*x', color: 'accent', label: 'y = 2x', labelAt: 3.05 }, { fn: 'x^2', color: 'warn', label: 'y = x²', labelAt: 2.6 }], shade: [{ fn: '2*x', lower: 'x^2', from: 0, to: 2, color: 'accent', alpha: 0.25 }, { fn: 'x^2', lower: '2*x', from: 2, to: 3, color: 'warn', alpha: 0.3 }] } },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sqrt-line', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4), A = k ** 3 / 6;
        return {
          prompt: t`Find the area of the region enclosed by $y = \sqrt{x}$ and $y = \dfrac{x}{${k}}$.`,
          answer: A, tol: { rel: 0.005 },
          hints: [t`They meet where $\sqrt{x} = x/${k}$: at $x = 0$ and $x = ${k * k}$. The root is on top.`],
          teach: 'Find the crossings, then integrate top minus bottom between them.',
          explain: t`$A = \int_0^{${k * k}}\left(\sqrt{x} - \tfrac{x}{${k}}\right)dx = \tfrac23\cdot ${k ** 3} - \tfrac{${k ** 4}}{${2 * k}} = ${nice(A)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, k * k + 2], y: [-0.5, k + 1], curves: [{ fn: 'sqrt(x)', color: 'warn' }, { fn: `x/${k}`, color: 'accent' }], shade: [{ fn: 'sqrt(x)', lower: `x/${k}`, from: 0, to: k * k, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    num({
      id: 'cp-sled', difficulty: 3, transfer: true,
      gen(r) {
        const [c, k] = r.pick([[150, 6], [200, 8], [180, 5], [245, 5], [96, 6]]);
        const T = Math.sqrt(c / k), gap = (2 * c * T) / 3;
        return {
          prompt: t`A camera car runs beside a rocket-sled test track at a steady ${c} m/s. It passes the sled just as the sled starts from rest, after which the sled’s speed is $v(t) = ${k}t^2$ m/s. When the two speeds are equal, how far ahead of the sled is the car?`,
          answer: gap, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: c * T, feedback: 'That is how far the car has gone. Subtract the distance the sled has covered.' },
            { value: (k * T ** 3) / 3, feedback: 'That is how far the sled has gone. The gap is the car’s distance minus the sled’s.' },
          ],
          hints: [t`The speeds are equal when $${k}t^2 = ${c}$, at $t = ${nice(T)}$ s.`, 'The gap is the area between the two velocity curves up to that moment.', t`Gap $= \int_0^{${nice(T)}}\left(${c} - ${k}t^2\right)dt$.`],
          teach: 'The area between two velocity–time graphs is the change in the distance between the two objects.',
          explain: t`$\int_0^{${nice(T)}}\left(${c} - ${k}t^2\right)dt = ${c}(${nice(T)}) - \tfrac{${k}}{3}(${nice(T)})^3 = ${nice(c * T)} - ${nice((k * T ** 3) / 3)} = ${fmt(gap, 4)}$ m. After that the sled is faster and starts closing the gap.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, T * 1.3], y: [0, c * 1.5], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${c}`, color: 'accent', label: 'car', labelAt: T * 0.1 }, { fn: `${k}*x^2`, color: 'warn', label: 'sled', labelAt: T * 1.1 }], shade: [{ fn: `${c}`, lower: `${k}*x^2`, from: 0, to: T, color: 'accent', alpha: 0.22 }] }, caption: 'Velocity against time; the shaded area is the gap between them.' },
        };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 2,
      prompt: t`For continuous $f$ and $g$, $\displaystyle\int_a^b \big[f(x) - g(x)\big]\,dx = 0$. What can you conclude?`,
      choices: [
        t`Either $f = g$ on all of $[a, b]$, or the curves cross somewhere inside it — and then the area between them is positive`,
        t`The area between the curves is zero`,
        t`$f(x) = g(x)$ for every $x$ in $[a, b]$`,
        t`$f(x) \ge g(x)$ on all of $[a, b]$`,
      ],
      answer: 0,
      why: {
        1: t`The integral is a *net* (signed) quantity. Pieces where $g$ is on top cancel pieces where $f$ is.`,
        2: t`Possible, but not forced: $\int_0^{2\pi}(\sin x - 0)\,dx = 0$ although $\sin x \ne 0$.`,
        3: t`If $f \ge g$ everywhere and the integral is zero, then $f = g$ everywhere; otherwise there must be places where $g$ is on top.`,
      },
      hints: ['Can a signed integral vanish while the curves are far apart?', t`Think of $\int_0^{2\pi}\sin x\,dx$.`],
      teach: 'A definite integral is a signed total; the area between curves is the integral of the absolute difference.',
      explain: t`The area between the curves is $\int_a^b |f - g|\,dx$. If $f - g$ changes sign, the signed integral can vanish while the area is positive.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 6.6], y: [-0.8, 1.8], curves: [{ fn: '0.5 + sin(x)', color: 'accent', label: 'f', labelAt: 1.3 }, { fn: '0.5', color: 'warn', label: 'g', labelAt: 5.9, labelDy: 14 }] }, caption: t`One pair of curves on $[0, 2\pi]$ for which $\int_0^{2\pi}(f - g)\,dx = 0$.` },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.1 Areas between Curves', url: 'https://openstax.org/books/calculus-volume-2/pages/2-1-areas-between-curves' }],
});
