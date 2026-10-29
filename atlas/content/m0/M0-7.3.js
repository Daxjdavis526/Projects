// The unit circle — cos θ and sin θ as the coordinates of a point on a circle of radius 1, for any angle.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { PI, D2R, piTeX, exact, circleFig } from './_m0trig.js';

const t = String.raw;
// the unit circle with its four quadrants numbered and the axis angles marked
const quadrants = (caption, extra = {}) => circleFig({ th: 0, legs: false, arc: false, ray: false, point: false, caption, win: 1.45, extra: {
  points: [
    { x: 0.62, y: 0.62, r: 0, label: 'I', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 },
    { x: -0.62, y: 0.62, r: 0, label: 'II', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 },
    { x: -0.62, y: -0.62, r: 0, label: 'III', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 },
    { x: 0.62, y: -0.62, r: 0, label: 'IV', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 },
    { x: 1, y: 0, r: 3, color: 'ink3', label: '0°', labelDx: 8, labelDy: -9 },
    { x: 0, y: 1, r: 3, color: 'ink3', label: '90°', labelDx: 8, labelDy: -9 },
    { x: -1, y: 0, r: 3, color: 'ink3', label: '180°', labelAlign: 'right', labelDx: -6, labelDy: -9 },
    { x: 0, y: -1, r: 3, color: 'ink3', label: '270°', labelDx: 8, labelDy: 10 },
  ], ...extra } });

export default lesson({
  id: 'm0.M0-7.3',
  title: 'The unit circle',
  minutes: 10, difficulty: 2,
  intro: t`Right triangles only hold angles below $90^\circ$. The unit circle — radius $1$, centred at the origin — removes that limit. Walk an angle $\theta$ anticlockwise from the positive $x$-axis and mark where it meets the circle at $P$. **Define** the cosine and sine as $P$’s coordinates:

$$P = (\cos\theta,\ \sin\theta), \qquad \tan\theta = \frac{\sin\theta}{\cos\theta}$$

For an acute angle this agrees with the triangle ratios (the hypotenuse is $1$). Beyond $90^\circ$ the coordinates turn negative, which gives the **signs by quadrant**; and every angle has a **reference angle** — its acute angle to the $x$-axis — that fixes the size of its sine and cosine. Since $P$ is on the circle, $\cos^2\theta + \sin^2\theta = 1$ always.`,
  symbols: [
    { tex: '\\theta', text: 'the angle, measured anticlockwise from the positive $x$-axis (clockwise angles are negative); any real number of degrees or radians' },
    { tex: 'P', text: 'the point where the angle’s ray meets the circle of radius $1$' },
    { tex: '\\cos\\theta', text: 'the $x$-coordinate of $P$: between $-1$ and $1$' },
    { tex: '\\sin\\theta', text: 'the $y$-coordinate of $P$: between $-1$ and $1$' },
    { tex: '\\tan\\theta', text: 'their ratio — the slope of the ray $OP$; not defined where $\\cos\\theta = 0$ ($\\theta = 90^\\circ, 270^\\circ, \\ldots$)' },
  ],
  why: t`Anything that turns — a wheel, a spacecraft’s attitude, an electron’s phase, the argument of a complex number — goes past $90^\circ$. The unit circle makes sine and cosine work for every angle, which is what lets them describe oscillations and waves that never stop at a quarter turn.`,
  visual: {
    type: 'm0-unitcircle',
    title: 'Sine and cosine as coordinates',
    lead: t`Drag $P$ round the circle. The blue leg is $\cos\theta$ (left–right), the orange leg is $\sin\theta$ (up–down). The violet wedge is the reference angle; the corners show the signs of $(\cos\theta, \sin\theta)$ in each quadrant.`,
    tasks: [
      t`Take $P$ to $150^\circ$: the sine is $+0.5$, the same as at $30^\circ$, while the cosine has flipped sign. Both share the reference angle $30^\circ$.`,
      t`Go to $210^\circ$ and $330^\circ$: the same $30^\circ$ wedge, the same sizes $0.5$ and $0.866$, different signs.`,
      t`Drive $P$ to $90^\circ$: the cosine leg vanishes and $\tan\theta$ is not defined — the ray is vertical.`,
    ],
    params: { mode: 'circle', theta: 2.4, units: 'both', signs: true, ref: true, tan: true },
    caption: t`To scale: the circle has radius $1$, so the coordinates of $P$ are exactly $\cos\theta$ and $\sin\theta$.`,
  },
  example: {
    prompt: t`Find the exact values of $\cos\theta$, $\sin\theta$ and $\tan\theta$ for $\theta = \tfrac{7\pi}{6}$.`,
    visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(7 * PI / 6), units: 'both', ref: true, signs: true, controls: false, readout: false, labels: false } },
    steps: [
      { label: 'Where is it', text: t`$\tfrac{7\pi}{6} = 210^\circ$: half a turn ($180^\circ$) plus $30^\circ$. $P$ is in the **third quadrant**, below and left of the centre.` },
      { label: 'Reference angle', text: t`The ray is $30^\circ$ past the negative $x$-axis, so the reference angle is $30^\circ$: the sizes are $|\cos\theta| = \tfrac{\sqrt3}{2}$ and $|\sin\theta| = \tfrac12$.` },
      { label: 'Signs', text: t`In quadrant III both coordinates are negative: $\cos\tfrac{7\pi}{6} = -\tfrac{\sqrt3}{2}$, $\sin\tfrac{7\pi}{6} = -\tfrac12$.` },
      { label: 'Tangent', text: t`$\tan\theta = \dfrac{-1/2}{-\sqrt3/2} = \dfrac{1}{\sqrt3} \approx 0.577$ — positive, as the ray’s slope through the third quadrant is.` },
      { label: 'Check', text: t`$\cos^2 + \sin^2 = \tfrac34 + \tfrac14 = 1$ ✓, and a calculator in radian mode gives $\cos(7\pi/6) = -0.866$ ✓.` },
    ],
    answer: t`$\cos\tfrac{7\pi}{6} = -\tfrac{\sqrt3}{2}$, $\sin\tfrac{7\pi}{6} = -\tfrac12$, $\tan\tfrac{7\pi}{6} = \tfrac{1}{\sqrt3}$.`,
  },
  practice: [
    mcq({
      id: 'quadrant-signs', difficulty: 1,
      gen(r) {
        const d = r.pick([115, 160, 200, 250, 290, 340, 35, 70]), q = d < 90 ? 0 : d < 180 ? 1 : d < 270 ? 2 : 3;
        const S = ['(+, +)', '(−, +)', '(−, −)', '(+, −)'], W = ['first', 'second', 'third', 'fourth'];
        const order = [q, (q + 1) % 4, (q + 2) % 4, (q + 3) % 4];
        return {
          prompt: t`For $\theta = ${d}^\circ$, what are the signs of $(\cos\theta,\ \sin\theta)$?`,
          visual: quadrants(t`The four quadrants. Angles run anticlockwise from $0^\circ$ on the positive $x$-axis.`),
          choices: order.map((k) => S[k]),
          answer: 0,
          why: Object.fromEntries(order.slice(1).map((k, i) => [i + 1, t`Those are the signs in the ${W[k]} quadrant, but $${d}^\circ$ lies in the ${W[q]} quadrant.`])),
          hints: [t`Find which quarter of the circle $${d}^\circ$ falls in, between which of $0^\circ$, $90^\circ$, $180^\circ$, $270^\circ$, $360^\circ$.`],
          teach: t`Cosine is the $x$-coordinate and sine the $y$-coordinate of $P$, so each takes the sign of that coordinate in $P$’s quadrant.`,
          explain: t`$${d}^\circ$ is in the ${W[q]} quadrant, where $x$ is ${q === 0 || q === 3 ? 'positive' : 'negative'} and $y$ is ${q < 2 ? 'positive' : 'negative'}: ${S[q]}.`,
        };
      },
    }),
    num({
      id: 'cos-value', difficulty: 2,
      gen(r) {
        const d = r.pick([130, 200, 255, 310, 165, 340]), f = r.pick(['cos', 'sin']), F = '\\' + f, ans = Math[f](d * D2R);
        return {
          prompt: t`Use a calculator to find $${F}\,${d}^\circ$ to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math[f](d), feedback: t`That is $${F}$ of $${d}$ *radians*. Switch the calculator to degrees, or convert: $${d}^\circ = ${sig(d * D2R, 4)}$ rad.` }, { value: -ans, feedback: t`Right size, wrong sign: $${d}^\circ$ is in a quadrant where the ${f === 'cos' ? '$x$' : '$y$'}-coordinate is ${ans < 0 ? 'negative' : 'positive'}.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`Degree mode. Then check the sign against the picture.`],
          teach: t`A calculator gives the sign automatically — in the right angle mode; the picture checks it.`,
          explain: t`$${F}\,${d}^\circ = ${sig(ans, 3)}$. On the circle, $P$ at $${d}^\circ$ has ${f === 'cos' ? '$x$' : '$y$'}-coordinate $${sig(ans, 3)}$.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(d * D2R), units: 'deg', controls: false, readout: false, labels: false }, caption: t`$P$ at $${d}^\circ$ on the unit circle: the blue leg is the cosine, the orange leg the sine.` },
        };
      },
    }),
    mcq({
      id: 'exact-ref', difficulty: 2,
      gen(r) {
        const d = r.pick([120, 135, 150, 210, 225, 240, 300, 315, 330]), f = r.pick(['sin', 'cos']), F = '\\' + f, g = f === 'sin' ? 'cos' : 'sin';
        const key = exact(f, d), ref = d < 180 ? 180 - d : d < 270 ? d - 180 : 360 - d;
        const neg = (x) => (x.startsWith('-') ? x.slice(1) : '-' + x), pos = !key.startsWith('-');
        const sgn = (x) => (pos ? x : '-' + x);
        const other = ref === 45 ? sgn(t`\frac12`) : sgn(exact(g, ref));
        const third = ref === 45 ? sgn(t`\frac{\sqrt3}{2}`) : neg(other);
        const wrong = [neg(key), other, third];
        const sideOf = f === 'cos' ? '$x$' : '$y$';
        return {
          prompt: t`What is the exact value of $${F}\,${piTeX(d * D2R)}$?`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: N(d * D2R), units: 'rad', ref: true, controls: false, readout: false, labels: false, legs: false }, caption: t`The angle, with its reference angle shaded violet.` },
          choices: [t`$\displaystyle ${key}$`, ...wrong.map((w) => t`$\displaystyle ${w}$`)],
          answer: 0,
          why: {
            1: t`Right size, wrong sign: in this quadrant the ${sideOf}-coordinate is ${pos ? 'positive' : 'negative'}.`,
            2: ref === 45 ? t`$\tfrac12$ belongs to reference angles of $30^\circ$ or $60^\circ$; this one is $45^\circ$.` : t`That is the other coordinate’s size: the reference angle is $${ref}^\circ$, and $${f === 'sin' ? '\\sin' : '\\cos'} ${ref}^\circ = ${exact(f, ref)}$.`,
            3: ref === 45 ? t`$\tfrac{\sqrt3}{2}$ belongs to reference angles of $30^\circ$ or $60^\circ$; this one is $45^\circ$.` : t`Both the size and the sign are off: use $${f === 'sin' ? '\\sin' : '\\cos'} ${ref}^\circ$ for the size and the quadrant for the sign.`,
          },
          hints: [t`In degrees the angle is $${d}^\circ$. Its reference angle is its acute angle to the $x$-axis: $${ref}^\circ$.`, t`Size from the reference angle; sign from the quadrant (${sideOf} is ${pos ? 'positive' : 'negative'} there).`],
          teach: t`Reference angle for the size, quadrant for the sign.`,
          explain: t`$${piTeX(d * D2R)} = ${d}^\circ$, reference angle $${ref}^\circ$, so $|${F}| = ${exact(f, ref)}$; the ${sideOf}-coordinate is ${pos ? 'positive' : 'negative'} there: $${F}\,${piTeX(d * D2R)} = ${key}$.`,
        };
      },
    }),
    {
      type: 'slider', id: 'place-angle', difficulty: 2,
      gen(r) {
        const [f, v, d, q] = r.pick([['sin', '\\tfrac12', 150, 'second'], ['cos', '-\\tfrac12', 240, 'third'], ['sin', '-\\tfrac{\\sqrt2}{2}', 315, 'fourth'], ['cos', '\\tfrac12', 300, 'fourth'], ['sin', '-\\tfrac12', 210, 'third']]);
        const a = d * D2R, F = '\\' + f;
        return {
          prompt: t`Drag $P$ to the angle in the **${q} quadrant** where $${F}\theta = ${v}$.`,
          visual: { type: 'm0-unitcircle', params: { mode: 'circle', theta: 0.5, units: 'deg', controls: false, readout: false, labels: false, signs: true }, caption: t`Drag $P$; the legs show its cosine (blue) and sine (orange).` },
          param: 'theta', answer: [a - 2.5 * D2R, a + 2.5 * D2R],
          instruction: 'Drag P round the circle, then check.',
          hints: [t`Find the acute angle with $${F}\theta = ${v.replace('-', '')}$ first: that is the reference angle.`, t`Then place that reference angle in the ${q} quadrant, measured from the $x$-axis.`],
          teach: t`Every value of sine or cosine (other than $\pm1$) is hit at two points of the circle; the quadrant picks one.`,
          explain: t`The reference angle is $${d % 90 === 0 ? d : d < 180 ? 180 - d : d < 270 ? d - 180 : 360 - d}^\circ$; in the ${q} quadrant that is $${d}^\circ = ${piTeX(a)}$.`,
        };
      },
    },
    num({
      id: 'second-solution', difficulty: 3,
      gen(r) {
        const f = r.pick(['sin', 'cos']), v = r.pick([0.25, 0.4, 0.6, 0.8, 0.9]), F = '\\' + f;
        const a1 = (f === 'sin' ? Math.asin(v) : Math.acos(v)) / D2R, ans = f === 'sin' ? 180 - a1 : 360 - a1;
        return {
          prompt: t`One solution of $${F}\theta = ${v}$ in $[0^\circ, 360^\circ)$ is $\theta = ${sig(a1, 4)}^\circ$. What is the other?`,
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: a1 + 180, feedback: t`Half a turn on, $P$ is on the opposite side of the circle: both coordinates change sign, so $${F}$ there is $${-v}$, not $${v}$.` }, { value: -a1, feedback: t`$${-sig(a1, 4)}^\circ$ is not in $[0^\circ, 360^\circ)$${f === 'cos' ? t`; add $360^\circ$` : t`, and its sine is negative anyway`}.` }, { value: 360 - a1, feedback: t`Reflecting in the $x$-axis keeps the cosine and flips the sine. For the same sine, reflect in the $y$-axis: $180^\circ - \theta$.` }, { value: 180 - a1, feedback: t`Reflecting in the $y$-axis keeps the sine and flips the cosine. For the same cosine, reflect in the $x$-axis: $360^\circ - \theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`Mark the ${f === 'sin' ? 'horizontal line $y' : 'vertical line $x'} = ${v}$ on the circle. It crosses the circle twice.`, t`The two crossings are mirror images in the ${f === 'sin' ? '$y$' : '$x$'}-axis: ${f === 'sin' ? t`$\theta$ and $180^\circ - \theta$` : t`$\theta$ and $360^\circ - \theta$`}.`],
          teach: t`$\sin\theta = v$ has the two solutions $\theta$ and $180^\circ - \theta$; $\cos\theta = v$ has $\theta$ and $360^\circ - \theta$.`,
          explain: t`${f === 'sin' ? t`Same height, mirrored left–right: $180^\circ - ${sig(a1, 4)}^\circ` : t`Same $x$, mirrored up–down: $360^\circ - ${sig(a1, 4)}^\circ`} = ${sig(ans, 4)}^\circ$. Forgetting this second solution is the most common slip in solving trigonometric equations.`,
          visual: circleFig({ th: a1 * D2R, legs: false, arc: true, pLabel: '', caption: t`The given solution (gold arc). The dashed ${f === 'sin' ? 'horizontal' : 'vertical'} line marks every point with $${F}\theta = ${v}$.`, extra: f === 'sin' ? { hlines: [{ y: v, color: 'warn' }] } : { vlines: [{ x: v, color: 'accent' }] } }),
        };
      },
    }),
    mcq({
      id: 'same-sine', difficulty: 2,
      gen(r) {
        const a = r.pick([20, 35, 50, 70]);
        return {
          prompt: t`Which angle has the same sine as $${a}^\circ$?`,
          visual: circleFig({ th: a * D2R, legs: true, pLabel: 'P', caption: t`$P$ at $${a}^\circ$; its sine is the height of the orange leg.` }),
          choices: [t`$${180 - a}^\circ$`, t`$${180 + a}^\circ$`, t`$${-a}^\circ$`, t`$${360 - a}^\circ$`],
          answer: 0,
          why: {
            1: t`$${180 + a}^\circ$ is diametrically opposite: same size, but its sine is $-\sin ${a}^\circ$.`,
            2: t`$-${a}^\circ$ is the mirror image in the $x$-axis: same cosine, opposite sine.`,
            3: t`$${360 - a}^\circ$ is the same point as $-${a}^\circ$: same cosine, opposite sine.`,
          },
          hints: [t`Which other point of the circle is at the same height as $P$?`],
          teach: t`$\sin(180^\circ - \theta) = \sin\theta$: mirror images in the $y$-axis share their height.`,
          explain: t`The point at the same height is $P$’s mirror image in the $y$-axis, at $180^\circ - ${a}^\circ = ${180 - a}^\circ$.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-exact', difficulty: 2,
      gen(r) {
        const d = r.pick([120, 150, 210, 240, 300, 330]), ref = d < 180 ? 180 - d : d < 270 ? d - 180 : 360 - d, key = exact('tan', d);
        const neg = (x) => (x.startsWith('-') ? x.slice(1) : '-' + x), inv = exact('tan', 90 - ref);
        const s = key.startsWith('-') ? '-' : '';
        return {
          prompt: t`What is the exact value of $\tan\,${piTeX(d * D2R)}$?`,
          visual: quadrants(t`The quadrants, for placing the angle.`),
          choices: [t`$\displaystyle ${key}$`, t`$\displaystyle ${neg(key)}$`, t`$\displaystyle ${s}${inv}$`, t`$\displaystyle ${s}${exact('sin', ref)}$`],
          answer: 0,
          why: { 1: t`Right size, wrong sign: $\tan = \sin/\cos$ is positive in quadrants I and III, negative in II and IV.`, 2: t`That is $\tan$ of the complementary angle, $${90 - ref}^\circ$: the reference angle here is $${ref}^\circ$.`, 3: t`That is the size of the sine, not the tangent: divide by the cosine.` },
          hints: [t`In degrees, $${d}^\circ$; reference angle $${ref}^\circ$.`],
          teach: t`$\tan\theta = \sin\theta/\cos\theta$: size from the reference angle, sign positive in I and III.`,
          explain: t`Reference angle $${ref}^\circ$, $\tan ${ref}^\circ = ${exact('tan', ref)}$; in that quadrant sine and cosine have ${key.startsWith('-') ? 'opposite signs' : 'the same sign'}: $\tan\,${piTeX(d * D2R)} = ${key}$.`,
        };
      },
    }),
    num({
      id: 'cp-orbit-x', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([6800, 7000, 7500, 8000]), d = r.pick([110, 150, 200, 230, 300]), f = r.pick(['x', 'y']);
        const ans = f === 'x' ? R * Math.cos(d * D2R) : R * Math.sin(d * D2R), alt = f === 'x' ? R * Math.sin(d * D2R) : R * Math.cos(d * D2R);
        return {
          prompt: t`A satellite in a circular orbit of radius $${thou(R)}$ km is tracked in a frame centred on Earth, with the angle measured anticlockwise from the $+x$ axis. When the angle is $${d}^\circ$, what is its $${f}$-coordinate, in km?`,
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: alt, feedback: t`That is the ${f === 'x' ? '$y$' : '$x$'}-coordinate. $x = r\cos\theta$, $y = r\sin\theta$.` }, { value: -ans, feedback: t`Wrong sign: at $${d}^\circ$ the satellite is on the ${ans < 0 ? 'negative' : 'positive'} ${f} side.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`On a circle of radius $r$, the point at angle $\theta$ is $(r\cos\theta,\ r\sin\theta)$.`],
          teach: t`Scale the unit circle by $r$: $(x, y) = (r\cos\theta,\ r\sin\theta)$, signs included.`,
          explain: t`$${f} = ${thou(R)}\,${f === 'x' ? '\\cos' : '\\sin'}\,${d}^\circ = ${thou(R)} \times (${sig(f === 'x' ? Math.cos(d * D2R) : Math.sin(d * D2R), 4)}) = ${Math.round(ans)}$ km.`,
          visual: circleFig({ th: d * D2R, legs: true, legLabels: false, pLabel: 'satellite', arc: true, caption: t`The orbit drawn as a unit circle scaled by $r$; Earth is at the centre. The legs are the satellite’s coordinates divided by $r$.` }),
        };
      },
    }),
    num({
      id: 'cp-cos-second', difficulty: 3,
      gen(r) {
        const v = r.pick([-0.3, -0.7, 0.35, 0.55]), a1 = Math.acos(v) / D2R, ans = 360 - a1;
        return {
          prompt: t`Find the solution of $\cos\theta = ${v}$ that lies between $180^\circ$ and $360^\circ$.`,
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: a1, feedback: t`$${sig(a1, 4)}^\circ$ is the calculator’s answer, between $0^\circ$ and $180^\circ$. The other point with the same $x$ is its mirror image below the axis.` }, { value: 180 + a1, feedback: t`Adding $180^\circ$ flips the sign of the cosine. Reflect in the $x$-axis instead: $360^\circ - ${sig(a1, 4)}^\circ$.` }, { value: 180 - a1, feedback: t`$180^\circ - \theta$ keeps the sine, not the cosine — and it is not between $180^\circ$ and $360^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`The calculator gives $\cos^{-1}(${v}) = ${sig(a1, 4)}^\circ$, in the upper half of the circle.`, t`The point with the same $x$ in the lower half is at $360^\circ - ${sig(a1, 4)}^\circ$.`],
          teach: t`$\cos\theta$ is unchanged when $\theta \to 360^\circ - \theta$ (reflection in the $x$-axis).`,
          explain: t`$\theta = 360^\circ - ${sig(a1, 4)}^\circ = ${sig(ans, 4)}^\circ$.`,
          visual: circleFig({ th: 0, legs: false, arc: false, ray: false, point: false, caption: t`The vertical line $x = ${v}$ meets the circle twice: once above the axis, once below.`, extra: { vlines: [{ x: v, color: 'accent' }] } }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §5.2 Unit Circle: Sine and Cosine Functions', url: 'https://openstax.org/books/precalculus-2e/pages/5-2-unit-circle-sine-and-cosine-functions' },
    { label: 'OpenStax Precalculus 2e, §5.3 The Other Trigonometric Functions', url: 'https://openstax.org/books/precalculus-2e/pages/5-3-the-other-trigonometric-functions' },
  ],
});
void nice;
