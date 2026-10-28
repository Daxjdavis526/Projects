// Vectors and components — an arrow with a size and a direction, written as two numbers along the axes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig, frac } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { D2R, deg, wrap360, seg, circ, plane, dot, vecArrow, fit } from './_m0geo.js';

const t = String.raw;
// a vector from the origin with its component legs and its angle arc
const vecPic = (v, caption, { win, label = 'v', legs = true, arc = true, extra = {}, xlabel = 'x', ylabel = 'y' } = {}) => {
  const L = Math.hypot(...v), th = Math.atan2(v[1], v[0]), F = win ? { x: [-2 * win, 2 * win], y: [-win, win] } : fit([[0, 0], v, [0.2 * L, 0.2 * L], [-0.2 * L, -0.2 * L]], 0.18 * L, 1);
  const A = vecArrow([0, 0], v, { color: 'gold', label, legs, legColors: ['accent', 'warn'] });
  const curves = [...A.curves];
  if (arc) curves.push(circ([0, 0], 0.22 * L, { color: 'ink2', width: 1.6 }, 0, th < 0 ? th + 2 * Math.PI : th));
  return plane({ ...F, curves, arrows: A.arrows, xlabel, ylabel, caption, extra });
};

export default lesson({
  id: 'm0.M0-9.4',
  title: 'Vectors and components',
  minutes: 9, difficulty: 2,
  intro: t`A **vector** is a quantity with a size and a direction — a force, a velocity, a displacement — drawn as an arrow. Slide the arrow’s tail to the origin and its tip lands on a point $(v_x, v_y)$: those two numbers, the **components**, say everything about the vector. The size and direction $(v, \theta)$ say it too; trigonometry converts between them:

$$\vec v = (v_x,\ v_y) = (v\cos\theta,\ v\sin\theta), \qquad v = |\vec v| = \sqrt{v_x^2 + v_y^2}$$

With the unit vectors $\hat\imath = (1, 0)$ and $\hat\jmath = (0, 1)$ you can write $\vec v = v_x\,\hat\imath + v_y\,\hat\jmath$. Going back from components to a direction needs the same care as any polar angle: $\tan\theta = v_y/v_x$ alone cannot see the quadrant. Dividing a vector by its length gives the **unit vector** $\hat v = \vec v / v$: length $1$, direction only.`,
  symbols: [
    { tex: '\\vec v', text: 'a vector; the arrow over the letter marks it as one (books also use bold **v**)' },
    { tex: 'v_x,\\ v_y', text: 'its **components**: how far the arrow reaches along $x$ and along $y$, with signs, in the vector’s own unit (N, m/s, m…)' },
    { tex: 'v = |\\vec v|', text: 'its **magnitude**: the arrow’s length, never negative, in the same unit' },
    { tex: '\\theta', text: 'its direction, measured anticlockwise from the positive $x$-axis' },
    { tex: '\\hat\\imath,\\ \\hat\\jmath', text: 'the unit vectors along $x$ and $y$ (dimensionless)' },
    { tex: '\\hat v', text: 'the unit vector in the direction of $\\vec v$: $\\vec v / v$' },
  ],
  why: t`Physics adds forces, splits a rocket’s thrust into lift and push, and resolves a planet’s gravity along and across its orbit — all by working component by component, where vectors behave like ordinary numbers. [Physics I’s vectors](#/lesson/phys2210.M2.1) and [Calculus II’s](#/lesson/math1220.C2-7.1) start exactly here.`,
  visual: {
    type: 'graph',
    title: 'An arrow and its shadows',
    lead: t`Set the vector’s size and direction. Its components are the dashed legs: the blue one along $x$, the orange one along $y$. Watch their signs as the arrow swings through the four quadrants, and compare the last two readouts.`,
    tasks: [
      t`Set $v = 10$, $\theta = 30^\circ$: the components are $8.66$ and $5$ — the $30$–$60$–$90$ triangle, scaled by $10$.`,
      t`Swing to $\theta = 150^\circ$: $v_x$ turns negative, $v_y$ stays the same. Now try $210^\circ$: both negative.`,
      t`At $\theta = 210^\circ$ the calculator’s $\tan^{-1}(v_y/v_x)$ says $30^\circ$ — pointing the opposite way. The quadrant-aware angle (\`atan2\`) gets it right.`,
    ],
    params: {
      x: [-24, 24], y: [-12, 12], equal: true, aspect: 'wide',
      sliders: [
        { key: 'v', label: 'Magnitude $v$', min: 0, max: 11, step: 0.1, value: 10, explain: 'The length of the arrow.' },
        { key: 'a', label: t`Direction $\theta$`, min: 0, max: 360, step: 1, value: 30, unit: '^\\circ', explain: 'Anticlockwise from the positive x-axis.' },
      ],
      curves: [
        { param: ['t*v*cos(a*pi/180)', '0'], t: [0, 1], color: 'accent', width: 3, dash: true },
        { param: ['v*cos(a*pi/180)', 't*v*sin(a*pi/180)'], t: [0, 1], color: 'warn', width: 3, dash: true },
        { param: ['2*cos(t*a*pi/180)', '2*sin(t*a*pi/180)'], t: [0, 1], color: 'ink2', width: 1.6 },
      ],
      arrows: [{ from: [0, 0], to: ['v*cos(a*pi/180)', 'v*sin(a*pi/180)'], color: 'gold', width: 3, label: 'v' }],
      readouts: [
        { label: t`$v_x = v\cos\theta$`, expr: 'v*cos(a*pi/180)', digits: 3 },
        { label: t`$v_y = v\sin\theta$`, expr: 'v*sin(a*pi/180)', digits: 3 },
        { label: t`$\tan^{-1}(v_y/v_x)$`, expr: 'atan(tan(a*pi/180))*180/pi', digits: 3, unit: '^\\circ' },
        { label: t`quadrant-aware angle`, expr: 'a', digits: 3, unit: '^\\circ' },
      ],
    },
    caption: t`To scale: one grid unit is the same across and up. The $\tan^{-1}$ readout is what a calculator returns, always between $-90^\circ$ and $90^\circ$.`,
  },
  example: {
    prompt: t`Early in its gravity turn, a launch vehicle’s $850$ kN of thrust points $78.0^\circ$ above the horizontal. Find the horizontal and vertical components, write the thrust in $\hat\imath$, $\hat\jmath$ form, and give its unit vector.`,
    visual: vecPic([850 * Math.cos(78 * D2R), 850 * Math.sin(78 * D2R)], t`The thrust vector (gold) and its components: horizontal (blue) and vertical (orange). To scale, in kN.`, { label: 'thrust', xlabel: 'horizontal (kN)', ylabel: 'vertical (kN)' }),
    steps: [
      { label: 'Draw it', text: t`Horizontal $x$, vertical $y$. The arrow is $850$ kN long at $78.0^\circ$ from the $x$-axis — mostly up, a little sideways.` },
      { label: 'Horizontal', text: t`$T_x = 850\cos 78.0^\circ = 850 \times ${sig(Math.cos(78 * D2R), 4)} = ${sig(850 * Math.cos(78 * D2R), 4)}$ kN — the push downrange.` },
      { label: 'Vertical', text: t`$T_y = 850\sin 78.0^\circ = 850 \times ${sig(Math.sin(78 * D2R), 4)} = ${sig(850 * Math.sin(78 * D2R), 4)}$ kN — the part fighting gravity.` },
      { label: 'Unit vectors', text: t`$\vec T = (${sig(850 * Math.cos(78 * D2R), 4)}\,\hat\imath + ${sig(850 * Math.sin(78 * D2R), 4)}\,\hat\jmath)$ kN, and $\hat T = \vec T / 850 = ${sig(Math.cos(78 * D2R), 4)}\,\hat\imath + ${sig(Math.sin(78 * D2R), 4)}\,\hat\jmath$ (no unit).` },
      { label: 'Check', text: t`$\sqrt{${sig(850 * Math.cos(78 * D2R), 4)}^2 + ${sig(850 * Math.sin(78 * D2R), 4)}^2} = ${sig(Math.hypot(850 * Math.cos(78 * D2R), 850 * Math.sin(78 * D2R)), 4)}$ kN ✓, and tilting $12^\circ$ from vertical costs only $1 - \cos 12^\circ \approx 2\%$ of the upward push.` },
    ],
    answer: t`$\vec T \approx (${sig(850 * Math.cos(78 * D2R), 3)}\,\hat\imath + ${sig(850 * Math.sin(78 * D2R), 3)}\,\hat\jmath)$ kN; $\hat T \approx ${sig(Math.cos(78 * D2R), 3)}\,\hat\imath + ${sig(Math.sin(78 * D2R), 3)}\,\hat\jmath$.`,
  },
  practice: [
    num({
      id: 'component', difficulty: 1,
      gen(r) {
        const F = r.pick([12, 25, 40, 150]), a = r.pick([30, 55, 120, 160, 215, 300]), f = r.pick(['x', 'y']);
        const ans = f === 'x' ? F * Math.cos(a * D2R) : F * Math.sin(a * D2R), FN = f === 'x' ? '\\cos' : '\\sin';
        return {
          prompt: t`A force of $${F}$ N points $${a}^\circ$ anticlockwise from the positive $x$-axis. Find its $${f}$-component.`,
          answer: ans, units: 'N', tol: { rel: 0.005 },
          errors: [
            { value: f === 'x' ? F * Math.sin(a * D2R) : F * Math.cos(a * D2R), feedback: t`That is the other component. $F_x = F\cos\theta$ (the side next to the angle), $F_y = F\sin\theta$.` },
            { value: f === 'x' ? F * Math.cos(a) : F * Math.sin(a), feedback: t`Radian mode: $${a}$ rad is not $${a}^\circ$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$F_${f} = F${FN}\theta$, with $\theta$ measured from the positive $x$-axis.`],
          teach: t`With the angle measured from $+x$, $(F\cos\theta,\ F\sin\theta)$ gives both components, signs included.`,
          explain: t`$F_${f} = ${F}${FN} ${a}^\circ = ${sig(ans, 4)}$ N${ans < 0 ? ' — negative, because the arrow points ' + (f === 'x' ? 'left' : 'down') : ''}.`,
          visual: vecPic([F * Math.cos(a * D2R), F * Math.sin(a * D2R)], t`The force and its two components (dashed). Axis numbers in newtons.`, { label: 'F' }),
        };
      },
    }),
    num({
      id: 'magnitude', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[6, 8], [5, 12], [9, 12], [8, 15], [3, 7], [10, 4]]), v = [r.sign() * a, r.sign() * b], ans = Math.hypot(a, b);
        return {
          prompt: t`A velocity has components $v_x = ${v[0]}$ m/s and $v_y = ${v[1]}$ m/s. What is the speed — its magnitude?`,
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: a + b, feedback: t`Components are perpendicular, so they combine by Pythagoras, not by adding: $\sqrt{v_x^2 + v_y^2}$.` }, { value: a * a + b * b, feedback: t`That is $v^2$; take the square root.` }, { value: Math.abs(v[0] + v[1]), feedback: t`Adding the signed components is not the length. Square each, add, then take the root.` }].filter((e, i, A) => Math.abs(e.value - ans) > 0.01 * ans && A.findIndex((o) => o.value === e.value) === i),
          hints: [t`The components are the legs of a right triangle; the speed is its hypotenuse.`],
          teach: t`Magnitude $= \sqrt{v_x^2 + v_y^2}$: the signs disappear when you square.`,
          explain: t`$v = \sqrt{${a * a} + ${b * b}} = ${sig(ans, 4)}$ m/s.`,
          visual: vecPic(v, t`The velocity and its components. One grid unit is $1$ m/s.`, { arc: false }),
        };
      },
    }),
    num({
      id: 'direction', difficulty: 3,
      gen(r) {
        const v = r.pick([[-6, 8], [-5, -12], [7, -24], [-9, -4], [-3, 10], [12, -5]]), ans = wrap360(deg(Math.atan2(v[1], v[0]))), naive = deg(Math.atan(v[1] / v[0]));
        return {
          prompt: t`A vector has components $(${v[0]},\ ${v[1]})$. Find its direction, anticlockwise from the positive $x$-axis, in degrees between $0^\circ$ and $360^\circ$.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [
            { value: naive, feedback: t`A calculator’s $\tan^{-1}(v_y/v_x)$ answers in $(-90^\circ, 90^\circ)$ — directions with $v_x > 0$. This vector has $v_x ${v[0] < 0 ? '< 0' : '> 0'}$.` },
            { value: wrap360(naive), feedback: t`That direction is in the wrong quadrant: check the signs $v_x ${v[0] < 0 ? '<' : '>'} 0$, $v_y ${v[1] < 0 ? '<' : '>'} 0$.` },
            { value: deg(Math.atan(Math.abs(v[1] / v[0]))), feedback: t`That is the reference angle to the $x$-axis. Place it in the vector’s quadrant.` },
          ].filter((e, i, A) => Math.abs(e.value - ans) > 0.5 && A.findIndex((o) => Math.abs(o.value - e.value) < 1e-9) === i),
          hints: [t`Which quadrant? $v_x ${v[0] < 0 ? '<' : '>'} 0$, $v_y ${v[1] < 0 ? '<' : '>'} 0$.`, t`Reference angle: $\tan^{-1}\left|\tfrac{${v[1]}}{${v[0]}}\right| = ${sig(deg(Math.atan(Math.abs(v[1] / v[0]))), 4)}^\circ$. Measure it from the ${v[0] < 0 ? 'negative' : 'positive'} $x$-axis toward the arrow.`],
          teach: t`Direction = reference angle placed by the quadrant — the job \`atan2(vy, vx)\` does for you.`,
          explain: t`Quadrant ${v[0] > 0 ? 'IV' : v[1] > 0 ? 'II' : 'III'}, reference angle $${sig(deg(Math.atan(Math.abs(v[1] / v[0]))), 4)}^\circ$: $\theta = ${sig(ans, 4)}^\circ$.`,
          visual: vecPic(v, t`The vector and its components (axis numbers in the vector’s units).`, { arc: false }),
        };
      },
    }),
    mcq({
      id: 'unit-vector', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [12, 5, 13], [4, 3, 5]]), sa = r.sign(), sb = r.sign();
        const V = (x, y) => t`$${frac(x)}\,\hat\imath ${y < 0 ? '-' : '+'} ${frac(Math.abs(y))}\,\hat\jmath$`;
        const s = a + b;
        return {
          prompt: t`What is the unit vector in the direction of $\vec v = ${sa * a}\,\hat\imath ${sb < 0 ? '-' : '+'} ${b}\,\hat\jmath$?`,
          choices: [V((sa * a) / c, (sb * b) / c), V((sa * a) / s, (sb * b) / s), V((sa * a) / (c * c), (sb * b) / (c * c)), V((sa * b) / c, (sb * a) / c)],
          answer: 0,
          why: {
            1: t`You divided by $|v_x| + |v_y| = ${s}$. The length of the vector is $\sqrt{v_x^2 + v_y^2} = ${c}$; this answer has length less than $1$.`,
            2: t`You divided by $v^2 = ${c * c}$ instead of $v = ${c}$.`,
            3: t`The components are swapped: that unit vector points in a different direction.`,
          },
          hints: [t`$\hat v = \vec v / |\vec v|$. First find $|\vec v| = \sqrt{${a * a} + ${b * b}}$.`],
          teach: t`A unit vector keeps the direction and has length $1$: divide every component by the magnitude.`,
          explain: t`$|\vec v| = ${c}$, so $\hat v = ${frac((sa * a) / c)}\,\hat\imath ${sb < 0 ? '-' : '+'} ${frac(b / c)}\,\hat\jmath$; check: $(${a}/${c})^2 + (${b}/${c})^2 = 1$ ✓.`,
          visual: vecPic([sa * a, sb * b], t`The vector $\vec v$ (gold) and its components. Its unit vector points the same way, with length $1$.`, { arc: false }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-tip', difficulty: 2,
      gen(r) {
        const [x, y] = r.pick([[-4, 3], [-5, -2], [6, -3], [-3, -4], [2, -5], [-6, 2]]), L = Math.hypot(x, y), th = wrap360(deg(Math.atan2(y, x)));
        return {
          prompt: t`Drag the tip of the arrow so the vector has magnitude $${sig(L, 3)}$ and direction $${sig(th, 4)}^\circ$ (anticlockwise from $+x$).`,
          visual: plane({ x: [-8, 8], y: [-6, 6], extra: { drag: [{ key: 'p', x: 2, y: 2, snap: 0.5 }] }, arrows: [{ from: [0, 0], to: ['px', 'py'], color: 'gold', width: 2.8 }], caption: t`Drag the gold tip; the tail stays at the origin. Grid squares are $1$ unit.` }),
          answer: { x, y }, tol: { x: 0.3, y: 0.3 },
          instruction: 'Drag the tip to the vector, then check.',
          hints: [t`Find the components: $v_x = ${sig(L, 3)}\cos ${sig(th, 4)}^\circ$, $v_y = ${sig(L, 3)}\sin ${sig(th, 4)}^\circ$.`, t`They come out as whole numbers: round them, and check the quadrant against $${sig(th, 4)}^\circ$.`],
          teach: t`Magnitude and direction → components: $(v\cos\theta,\ v\sin\theta)$.`,
          explain: t`$v_x = ${sig(L, 3)}\cos ${sig(th, 4)}^\circ = ${x}$ and $v_y = ${y}$: the tip is at $(${x}, ${y})$.`,
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-reentry', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([7.6, 7.8, 11.0]), g = r.pick([5.5, 6.0, 6.5]), ans = v * 1000 * Math.sin(g * D2R);
        return {
          prompt: t`A capsule returning from ${v > 10 ? 'the Moon' : 'orbit'} crosses the top of the atmosphere at $${v}$ km/s, on a path $${g}^\circ$ below the horizontal (its **flight-path angle**). How fast is it descending — its vertical speed, in m/s?`,
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: v * 1000 * Math.cos(g * D2R), feedback: t`That is the horizontal component — almost the whole speed, because the path is shallow. The vertical part is $v\sin\gamma$.` },
            { value: v * 1000 * Math.sin(g), feedback: t`Radian mode: $${g}$ rad is not $${g}^\circ$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The angle is measured from the horizontal, so the vertical side is opposite it.`],
          teach: t`Resolving a velocity: the part opposite the angle uses $\sin$, the part next to it uses $\cos$.`,
          explain: t`$v_{\text{down}} = ${v * 1000}\sin ${g}^\circ = ${thou(ans)}$ m/s — only about a tenth of the speed. Steeper entries heat and decelerate harder; shallower ones risk skipping off the atmosphere.`,
          visual: vecPic([v * Math.cos(g * D2R), -v * Math.sin(g * D2R)], t`The capsule’s velocity (gold) and its horizontal and vertical parts, in km/s. Drawn to scale: entry paths really are this shallow.`, { label: 'v', arc: false, win: 5, xlabel: 'horizontal (km/s)', ylabel: 'vertical (km/s)' }),
        };
      },
    }),
    mcq({
      id: 'cp-atan2', difficulty: 2,
      prompt: t`Which is the direction of $\vec v = -4\,\hat\imath - 4\,\hat\jmath$, anticlockwise from the positive $x$-axis?`,
      choices: [t`$225^\circ$`, t`$45^\circ$`, t`$135^\circ$`, t`$315^\circ$`],
      answer: 0,
      why: {
        1: t`$\tan^{-1}\tfrac{-4}{-4} = \tan^{-1} 1 = 45^\circ$: the two minus signs cancelled. $45^\circ$ points up and right; this vector points down and left.`,
        2: t`$135^\circ$ is up and left ($v_x < 0$, $v_y > 0$). Here $v_y < 0$ too.`,
        3: t`$315^\circ$ is down and right ($v_x > 0$). Here $v_x < 0$.`,
      },
      hints: [t`Both components are negative: which quadrant?`],
      teach: t`$\tan\theta$ repeats every $180^\circ$; the signs of the components choose between the two candidates.`,
      explain: t`Quadrant III with reference angle $45^\circ$: $180^\circ + 45^\circ = 225^\circ$.`,
      visual: vecPic([-4, -4], t`The vector and its components.`, { arc: false }),
    }),
    num({
      id: 'cp-missing', difficulty: 3,
      gen(r) {
        const [c, a, b] = r.pick([[20, 12, 16], [25, 7, 24], [13, 5, 12], [17, 8, 15], [10, 6, 8]]), ans = -b;
        return {
          prompt: t`A $${c}$ N force has $x$-component $-${a}$ N and points **below** the $x$-axis. What is its $y$-component, in newtons?`,
          answer: ans, units: 'N', tol: { rel: 0.002 },
          errors: [{ value: b, feedback: t`Right size, but the force points below the axis: $F_y < 0$.` }, { value: -(c - a), feedback: t`Components do not subtract like that: $F^2 = F_x^2 + F_y^2$, so $|F_y| = \sqrt{${c}^2 - ${a}^2}$.` }],
          hints: [t`$F_x^2 + F_y^2 = F^2$.`, t`$|F_y| = \sqrt{${c * c} - ${a * a}}$; the sign comes from “below the axis”.`],
          teach: t`Magnitude and one component fix the other component’s size; the picture fixes its sign.`,
          explain: t`$|F_y| = \sqrt{${c * c} - ${a * a}} = ${b}$, and below the axis means $F_y = -${b}$ N.`,
          visual: plane({ x: [-2.2 * c, 2.2 * c], y: [-1.1 * c, 1.1 * c], ticks: false, curves: [circ([0, 0], c, { color: 'ink4', width: 1.2, dash: true }), seg([-a, -1.1 * c], [-a, 1.1 * c], { color: 'accent', width: 1.6, dash: true })], points: [dot([0, 0], '', { r: 3, color: 'ink2' })], caption: t`Every tip at distance $${c}$ lies on the dashed circle; every tip with $F_x = -${a}$ lies on the dashed line. The force’s tip is where they meet below the axis.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.8 Vectors', url: 'https://openstax.org/books/precalculus-2e/pages/8-8-vectors' },
    { label: 'OpenStax University Physics Vol. 1, §2.2 Coordinate Systems and Components of a Vector', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector' },
  ],
});
void seg; void dot;
