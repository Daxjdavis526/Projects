// Visualizing complex functions. A graph of w = f(z) would need four real
// dimensions, so we draw two substitutes: a grid in the z-plane beside its
// image in the w-plane, and domain colouring — every z painted by the value
// f(z), hue for the angle and brightness bands for the size.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, cxmap, apart } from './_cx.js';

const t = String.raw;

// one horizontal line y = c (violet) and/or one vertical line x = a (gold) under z², with a faint grid
const linesUnderSquare = ({ c = null, a = null, ticks = true, grid = 'none' } = {}, caption) => cxmap({
  f: 'z2', x: [-2.2, 2.2], y: [-2.2, 2.2], wx: [-4.5, 4.5], wy: [-4.5, 4.5], grid, gn: 9, drag: false, ticks,
  curves: [...(c !== null ? [{ param: ['t', `${c}`], t: [-2.2, 2.2], color: 'violet', label: `y = ${c}` }] : []), ...(a !== null ? [{ param: [`${a}`, 't'], t: [-2.2, 2.2], color: 'gold', label: `x = ${a}` }] : [])],
}, caption);

// a colour picture of z^n on one plane (n may be negative: a pole)
const colourPow = (n, { key = false } = {}, caption) => cxmap({ f: 'pow', p: [n, 0], layout: key ? 'split' : 'same', x: [-2, 2], y: [-2, 2], view: 'colour', drag: false, ticks: false, wname: 'colour key', zname: 'z-plane, coloured by f(z)' }, caption);

const ORDER = { 1: 'a zero of order 1', [-1]: 'a pole of order 1', 2: 'a zero of order 2', [-2]: 'a pole of order 2' };

export default lesson({
  id: 'st-d.D2.1',
  title: 'Visualizing functions: grids and domain colouring',
  minutes: 11, difficulty: 2,
  intro: t`A complex function takes a point $z = x + iy$ of one plane to a point $w$ of another:

$$w = f(z) = u(x, y) + i\,v(x, y)$$

Its graph would live in four real dimensions, so we draw it two other ways. **As a map:** draw a grid in the $z$-plane and, beside it, the curves that $f$ carries it to in the $w$-plane — you see where everything goes. **As a colouring:** paint each point $z$ with a colour that encodes the value $f(z)$ — hue for its angle $\arg f$, brightness steps for its size $|f|$. The colouring shows the whole function at once on a single plane; zeros and poles stand out as points where every colour meets.`,
  symbols: [
    { tex: 'z = x + iy', text: t`the input, a point of the $z$-plane` },
    { tex: 'w = f(z)', text: t`the output, a point of a second plane, the $w$-plane` },
    { tex: 'u(x, y)', text: t`the real part of $f$: an ordinary real function of two real variables` },
    { tex: 'v(x, y)', text: t`the imaginary part of $f$, another real function of $x$ and $y$. For $f(z) = z^2$: $u = x^2 - y^2$, $v = 2xy$` },
  ],
  why: t`Seeing a complex function as a deformation of the plane is what makes the next ideas — the derivative as a local turn-and-stretch, conformal maps of airflow round a wing, poles and residues — visible instead of symbolic.`,
  visual: {
    type: 'cx-map',
    title: 'A function as a map, and as a colouring',
    lead: t`Left, the $z$-plane with a square grid; right, its image under the chosen $f$, line by line in the same colours (horizontal lines blue, vertical lines orange). Drag $z$ and watch $f(z)$. Then switch **Show** to colour.`,
    tasks: [
      t`For $z^2$: horizontal and vertical lines become two families of parabolas — and they still cross at right angles, except at $0$.`,
      t`For $e^z$: vertical lines become circles and horizontal lines become rays from $0$.`,
      t`Switch to colour for $z^3$: every colour appears three times round $0$ — a zero of order 3. For $1/z$ the colours run round the other way: a pole.`,
    ],
    params: {
      f: 'z2', fns: ['z2', 'z3', 'inv', 'exp', 'joukowski'], showChoice: true,
      x: [-2, 2], y: [-2, 2], wx: [-4, 4], wy: [-4, 4], grid: 'cartesian', gn: 9,
      drag: { x: 1.2, y: 0.7 }, readout: ['z', 'w'],
    },
    caption: t`Grid view: the $z$-grid runs from $-2$ to $2$ each way; parts of its image leave the $w$ window. Colour view: hue is $\arg f(z)$ (red on the positive reals, yellow-green on the positive imaginaries, blue on the negative reals, violet on the negative imaginaries); brightness steps up within each doubling of $|f(z)|$ and every $30^\circ$ of $\arg f(z)$. The key paints the $w$-plane by its own values.`,
  },
  example: {
    prompt: t`Find the images under $f(z) = z^2$ of the horizontal line $y = 1$ and the vertical line $x = 1$.`,
    visual: linesUnderSquare({ c: 1, a: 1, grid: 'cartesian' }, t`The line $y = 1$ (violet) and $x = 1$ (gold) in the $z$-plane, and their images: two parabolas, crossing at right angles at $f(1 + i) = 2i$.`),
    steps: [
      { label: 'Real and imaginary parts', text: t`$(x + iy)^2 = x^2 - y^2 + 2ixy$, so $u = x^2 - y^2$ and $v = 2xy$.` },
      { label: 'The horizontal line', text: t`On $y = 1$: $u = x^2 - 1$ and $v = 2x$. Eliminate $x = v/2$: $u = \tfrac{v^2}{4} - 1$ — a parabola opening to the right, with its nose at $u = -1$.` },
      { label: 'The vertical line', text: t`On $x = 1$: $u = 1 - y^2$, $v = 2y$, so $u = 1 - \tfrac{v^2}{4}$ — a parabola opening to the left, nose at $u = 1$.` },
      { label: 'Where they cross', text: t`The lines meet at $z = 1 + i$, whose image is $(1 + i)^2 = 2i$. There the parabolas have slopes $du/dv = v/2 = 1$ and $-v/2 = -1$: perpendicular. The map kept the right angle — a hint of the next module.` },
    ],
    answer: t`$y = 1 \mapsto u = \tfrac{v^2}{4} - 1$; $\;x = 1 \mapsto u = 1 - \tfrac{v^2}{4}$. Every horizontal and vertical line becomes a parabola, all with their focus at $0$.`,
  },
  practice: [
    num({
      id: 'uv-at', difficulty: 1,
      gen(r) {
        const x = r.pick([1, 2, 3, -1, -2]), y = r.pick([1, 2, -1, -3]);
        const which = r.pick(['u', 'v']);
        const ans = which === 'u' ? x * x - y * y : 2 * x * y;
        return {
          prompt: t`For $f(z) = z^2$, find $${which}$, the ${which === 'u' ? 'real' : 'imaginary'} part of $f$, at $z = ${cTeX([x, y])}$.`,
          visual: cxmap({ f: 'z2', x: [-3.5, 3.5], y: [-3.5, 3.5], wx: [-(x * x + y * y + 1), x * x + y * y + 1], wy: [-(x * x + y * y + 1), x * x + y * y + 1], grid: 'cartesian', gn: 8, ticks: false, drag: { x, y } }, t`The point $z$ and its image $f(z)$ (gold), with the grid and its image. Axes without numbers.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: apart(ans, which === 'u' ? [{ value: x * x + y * y, feedback: t`$(iy)^2 = -y^2$: the real part is $x^2 - y^2$.` }, { value: 2 * x * y, feedback: 'That is the imaginary part, v = 2xy.' }] : [{ value: x * y, feedback: t`The cross term of $(x + iy)^2$ appears twice: $v = 2xy$.` }, { value: x * x - y * y, feedback: 'That is the real part.' }]),
          hints: [t`Expand $(x + iy)^2 = x^2 + 2ixy + i^2y^2$.`, t`So $u = x^2 - y^2$ and $v = 2xy$.`],
          teach: t`Splitting $f(x + iy)$ into $u + iv$ turns one complex function into two real functions of two variables.`,
          explain: t`$u = x^2 - y^2$, $v = 2xy$; at $(${x}, ${y})$, $${which} = ${ans}$. Indeed $(${cTeX([x, y])})^2 = ${cTeX([x * x - y * y, 2 * x * y])}$.`,
        };
      },
    }),
    num({
      id: 'parabola-nose', difficulty: 2,
      gen(r) {
        const c = r.pick([0.5, 1.5, 2]);
        const ans = -c * c;
        return {
          prompt: t`Under $f(z) = z^2$ the horizontal line $y = ${c}$ becomes a parabola. Where does that parabola cross the real axis of the $w$-plane? Give the value of $u$ there.`,
          visual: linesUnderSquare({ c, ticks: false }, t`The line $y = ${c}$ and its image under $z^2$ (axes without numbers).`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * c, feedback: t`On the real axis $v = 0$, which happens at $x = 0$; then $u = x^2 - y^2$.` }],
          hints: [t`On the line, $u = x^2 - ${c}^2$ and $v = 2\cdot${c}\,x$.`, t`The image is on the real axis when $v = 0$, i.e. $x = 0$: the point $z = ${c}i$.`],
          teach: t`To find an image curve, put the line’s equation into $u(x, y)$ and $v(x, y)$ and eliminate the parameter.`,
          explain: t`$v = 0$ needs $x = 0$, so the crossing is the image of $z = ${c}i$: $(${c}i)^2 = ${ans}$. The parabola is $u = \frac{v^2}{${4 * c * c}} - ${c * c}$.`,
        };
      },
    }),
    num({
      id: 'count-colours', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        return {
          prompt: t`This is the colour picture of $f(z) = z^{${n}}$. Walk once round the origin: how many times do you pass through red (where $f$ is a positive real number)?`,
          visual: colourPow(n, {}, t`Domain colouring of a power of $z$ on $|x|, |y| \le 2$: red where $f(z)$ is positive real, yellow-green positive imaginary, blue negative real, violet negative imaginary.`),
          answer: n, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 1, feedback: t`Count the red rays one by one: walking once round $0$, $\arg z$ grows by $360^\circ$ and $\arg z^{${n}}$ by $${n}\times360^\circ$.` }],
          hints: [t`$\arg(z^{${n}}) = ${n}\arg z$.`, t`One turn of $z$ is $${n}$ turns of $f(z)$ — and every turn passes red once.`],
          teach: 'Round a zero of order n, every colour appears n times.',
          explain: t`$\arg z^{${n}} = ${n}\arg z$, so one lap round $0$ takes the value round $${n}$ times: $${n}$ red rays, $${n}$ of every colour. The order of a zero can be read off a colour picture by counting.`,
        };
      },
    }),
    mcq({
      id: 'zero-or-pole', difficulty: 3,
      gen(r) {
        const k = r.pick([1, -1, 2, -2]);
        const keys = [1, -1, 2, -2];
        return {
          prompt: t`The left panel colours each $z$ by the value of a function $f$, using the key on the right. What does $f$ have at the origin?`,
          visual: colourPow(k, { key: true }, 'Left: z coloured by f(z). Right: the key — each point w of the w-plane in its own colour. Brightness steps up as |w| grows within each doubling.'),
          choices: keys.map((j) => ORDER[j]), answer: keys.indexOf(k), fixedOrder: true,
          why: Object.fromEntries(keys.filter((j) => j !== k).map((j) => [keys.indexOf(j), Math.sign(j) !== Math.sign(k)
            ? t`Check the order of the colours as you walk anticlockwise round $0$, and compare with the key: the same order (red, yellow-green, blue, violet) means a zero; the reverse order means a pole.`
            : t`Count how many times each colour appears in one lap round $0$: that number is the order.`])),
          hints: ['Walk anticlockwise round the origin and note the order of the colours. Compare the key, walked anticlockwise round its own centre.', t`Same order as the key: $\arg f$ increases with $\arg z$ (a zero, like $z^n$). Reverse order: $\arg f$ decreases (a pole, like $1/z^n$). Then count the laps of colour.`],
          teach: 'Zeros and poles both make every colour meet at a point; the colours circle the same way as the key round a zero and the opposite way round a pole, as many times as the order.',
          explain: t`The picture is $f(z) = ${k > 0 ? (k === 1 ? 'z' : 'z^2') : (k === -1 ? '1/z' : '1/z^2')}$: ${ORDER[k]}. ${k > 0 ? 'Anticlockwise, the colours run red → yellow-green → blue → violet, the same way as the key' : 'Anticlockwise, the colours run red → violet → blue → yellow-green, opposite to the key'}, and each appears ${Math.abs(k) === 1 ? 'once' : 'twice'}.`,
        };
      },
    }),
    mcq({
      id: 'joukowski-circle', difficulty: 2,
      prompt: t`The picture shows the circle $|z| = 1.5$ and its image under $f(z) = z + \dfrac1z$: an ellipse. As the circle shrinks to the unit circle $|z| = 1$, what does its image become?`,
      visual: cxmap({ f: 'joukowski', x: [-2.2, 2.2], y: [-2.2, 2.2], wx: [-3, 3], wy: [-3, 3], grid: 'none', drag: false, curves: [{ param: ['1.5*cos(t)', '1.5*sin(t)'], t: [0, 6.2832], color: 'violet', label: '|z| = 1.5' }] }, t`The circle $|z| = 1.5$ (left) and its image (right).`),
      choices: [t`The segment of the real axis from $-2$ to $2$, traced twice`, t`The circle $|w| = 2$`, t`The unit circle again`, t`A thinner ellipse that never closes up`],
      answer: 0,
      why: {
        1: t`On $|z| = 1$, $1/z = \bar z$, so $z + 1/z = z + \bar z = 2\cos\theta$: always real.`,
        2: t`Only for large circles does the $1/z$ term become negligible; at $|z| = 1$ it is as large as $z$ itself.`,
        3: t`The ellipse’s height is $r - 1/r$, which reaches exactly $0$ at $r = 1$: it does flatten completely.`,
      },
      hints: [t`Write $z = re^{i\theta}$: then $z + 1/z = (r + \tfrac1r)\cos\theta + i(r - \tfrac1r)\sin\theta$.`, t`At $r = 1$ the imaginary part vanishes.`],
      teach: t`$z + 1/z$ maps circles $|z| = r$ to ellipses with semi-axes $r + \tfrac1r$ and $|r - \tfrac1r|$, which flatten to a slit at $r = 1$.`,
      explain: t`$z = e^{i\theta}$ gives $w = 2\cos\theta$: the segment $[-2, 2]$, covered once on the way round the top half and again on the way back. This **Joukowski map** turns slightly shifted circles into the profiles of aircraft wings — you will use it for the airflow round an airfoil.`,
    }),
    mcq({
      id: 'why-not-graph', difficulty: 1,
      prompt: 'Why can we not simply draw the graph of a complex function w = f(z), as we do for y = f(x)?',
      visual: cxmap({ f: 'z2', x: [-2, 2], y: [-2, 2], view: 'colour', drag: false, ticks: false, zname: 'z-plane, coloured by z²' }, t`One of the substitutes: domain colouring of $z^2$, with its key.`),
      choices: ['The input and the output are each two real numbers, so the graph needs four dimensions', 'Complex numbers cannot be plotted on axes', 'A complex function has no definite value at each point', 'Its graph would be a surface, which is too complicated to draw'],
      answer: 0,
      why: { 1: 'Each complex number is a point of a plane — that is how we plot them.', 2: 'A function gives one value at each point (multivalued ones like √z are made single-valued by a branch choice).', 3: 'A surface z = f(x, y) has 2 inputs and 1 output, three dimensions. Here there are 2 inputs and 2 outputs.' },
      hints: ['Count the real numbers: how many in z, how many in w?'],
      teach: 'A complex function maps a plane to a plane: two real inputs, two real outputs.',
      explain: 'The graph is the set of points (x, y, u, v): a surface in four-dimensional space. So we draw the map (grid and image) or the colouring instead.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vertical', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1.5, 2]);
        const ans = 2 * a * a;
        return {
          prompt: t`Under $f(z) = z^2$ the vertical line $x = ${a}$ becomes a parabola. It crosses the imaginary axis of the $w$-plane at two points; find the positive value of $v$ there.`,
          visual: linesUnderSquare({ a, ticks: false }, t`The line $x = ${a}$ and its image under $z^2$ (axes without numbers).`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a * a, feedback: t`On the imaginary axis $u = 0$, so $y = \pm${a}$; then $v = 2xy$.` }],
          hints: [t`$u = ${a}^2 - y^2$ and $v = 2\cdot${a}\,y$ on the line.`],
          teach: t`Substitute the line into $u$ and $v$; the imaginary axis is where $u = 0$.`,
          explain: t`$u = 0$ at $y = \pm${a}$, the points $z = ${a} \pm ${a}i$; there $v = 2\cdot${a}\cdot${a} = ${ans}$. (Indeed $(${a} + ${a}i)^2 = ${ans}i$.)`,
        };
      },
    }),
    num({
      id: 'cp-pole-order', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        return {
          prompt: t`This is the colour picture of $f(z) = 1/z^{${n}}$. What is the order of its pole at $0$ — how many times does each colour appear in one lap round the origin?`,
          visual: colourPow(-n, {}, 'Domain colouring near a pole: every colour meets at the origin.'),
          answer: n, tol: { rel: 0, abs: 0.01 },
          hints: [t`$\arg(1/z^{${n}}) = -${n}\arg z$.`],
          teach: 'Round a pole of order n every colour appears n times, circling the opposite way from round a zero.',
          explain: t`$\arg f = -${n}\arg z$: one lap of $z$ is $${n}$ laps of $f$, run backwards. A pole of order $${n}$.`,
        };
      },
    }),
    num({
      id: 'cp-corner-flow', difficulty: 3, transfer: true,
      gen(r) {
        const A = 0.5, x0 = r.pick([1, 2, 3]), y0 = r.pick([2, 3, 4]), x1 = r.pick([4, 6, 8]);
        const k = x0 * y0, ans = k / x1;
        const others = [1, 4, 9, 16].filter((c) => Math.abs(c - k) > 0.5);
        return {
          prompt: t`Air flowing into a right-angled corner (the walls are the positive $x$- and $y$-axes, in metres) is described by the complex potential $\Omega(z) = ${A}\,z^2$ (in $\text{m}^2/\text{s}$). Its **streamlines** — the paths the air follows — are the curves on which $\operatorname{Im}\Omega$ is constant. A smoke particle passes $(${x0}, ${y0})$ m. At what height $y$ does it cross the vertical line $x = ${x1}$ m?`,
          visual: { type: 'graph', params: { x: [0, 9], y: [0, 6], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', curves: others.map((c) => ({ fn: `${c}/x`, domain: [c / 6, 9], color: 'accent', width: 1.6 })), points: [{ x: x0, y: y0, color: 'gold', label: 'smoke' }], vlines: [{ x: x1, color: 'ink3' }] }, caption: 'Some streamlines of the corner flow (blue), the smoke particle and the line it must cross. Ideal (inviscid) flow: real air has a thin boundary layer at the walls.' },
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: y0, feedback: 'Streamlines here are not horizontal: the flow turns the corner.' }, { value: y0 * x1 / x0, feedback: t`On a streamline $xy$ is constant, so $y$ goes **down** as $x$ goes up.` }],
          hints: [t`$\operatorname{Im}(${A}z^2) = ${A}\cdot 2xy = xy$ (using $v = 2xy$ for $z^2$).`, t`So the streamline through $(${x0}, ${y0})$ is $xy = ${k}$.`],
          teach: t`The level curves of $\operatorname{Im}\Omega$ are the pre-images of horizontal lines in the $\Omega$-plane: for $z^2$, the hyperbolas $xy = $ constant.`,
          explain: t`$\operatorname{Im}\Omega = xy$, so the particle stays on $xy = ${k}$ and crosses $x = ${x1}$ m at $y = ${k}/${x1} = ${nm(ans, 3)}$ m. The streamlines of corner flow are the curves that $z^2$ sends to horizontal lines — the second picture of a function, read backwards.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 2', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Wegert & Semmler, Phase plots of complex functions, Notices AMS 58(6), 2011', url: 'https://www.ams.org/notices/201106/rtx110600768p.pdf' },
  ],
});
