// Circles and polar coordinates — a circle is every point at one distance from a centre; polar coordinates name a point by that distance and an angle.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N, lab } from './_m0kit.js';
import { D2R, deg, wrap360, seg, circ, plane, dot, note, ptTeX, ptText } from './_m0geo.js';

const t = String.raw;
// a radar scope: range rings every R/4, spokes every 30°, contacts as dots (no coordinates printed)
const scope = (R, contacts, caption, { rays = [], extra = {} } = {}) => {
  const curves = [];
  for (let k = 1; k <= 4; k++) curves.push(circ([0, 0], (k * R) / 4, { color: k === 4 ? 'ink3' : 'ink4', width: k === 4 ? 1.6 : 1 }));
  for (let a = 0; a < 180; a += 30) curves.push(seg([-R * Math.cos(a * D2R), -R * Math.sin(a * D2R)], [R * Math.cos(a * D2R), R * Math.sin(a * D2R)], { color: 'ink4', width: 0.8 }));
  for (const th of rays) curves.push(seg([0, 0], [R * Math.cos(th * D2R), R * Math.sin(th * D2R)], { color: 'good', width: 2 }));
  const points = [
    ...[1, 2, 3, 4].map((k) => note([(k * R) / 4 * Math.cos(-12 * D2R), (k * R) / 4 * Math.sin(-12 * D2R)], `${N((k * R) / 4)}`, { color: 'ink3', labelDx: 4 })),
    note([R * 1.08, 0], '0°', { color: 'ink3' }), note([0, R * 1.08], '90°', { color: 'ink3' }), note([-R * 1.1, 0], '180°', { color: 'ink3' }), note([0, -R * 1.08], '270°', { color: 'ink3' }),
    ...contacts.map((c) => dot([c.r * Math.cos(c.th * D2R), c.r * Math.sin(c.th * D2R)], c.label, { color: c.color || 'gold' })),
  ];
  return plane({ x: [-1.25 * R, 1.25 * R], y: [-1.18 * R, 1.18 * R], curves, points, ticks: false, grid: false, extra: { axes: false, ...extra }, caption });
};
// a circle drawn on a grid (ticks optional), with its centre marked
const circlePic = (h, k, R, caption, { ticks = true, centre = true } = {}) => plane({
  x: [h - 2 * (R + 1), h + 2 * (R + 1)], y: [k - R - 1, k + R + 1], ticks,
  curves: [circ([h, k], R, { width: 2.6 })], points: centre ? [dot([h, k], '', { color: 'ink2', r: 4 })] : [], caption,
});
const SPECIAL = [
  { x: [-1, ''], y: [-1, '\\sqrt3'], th: 240 }, { x: [-1, '\\sqrt3'], y: [1, ''], th: 150 },
  { x: [1, ''], y: [-1, '\\sqrt3'], th: 300 }, { x: [-1, '\\sqrt3'], y: [-1, ''], th: 210 },
  { x: [-1, ''], y: [1, '\\sqrt3'], th: 120 },
];

export default lesson({
  id: 'm0.M0-9.2',
  title: 'Circles and polar coordinates',
  minutes: 10, difficulty: 2,
  intro: t`A circle is every point at one distance $R$ from a centre $(h, k)$. Write that distance with Pythagoras and you have its equation. Turn it round — name a point by **how far** it is from the origin and **in which direction** — and you have polar coordinates $(r, \theta)$, the way a radar, a telescope mount or an orbit describes position:

$$(x - h)^2 + (y - k)^2 = R^2, \qquad x = r\cos\theta,\ \ y = r\sin\theta$$

Back the other way, $r = \sqrt{x^2 + y^2}$ and $\tan\theta = y/x$ — but $\tan\theta = y/x$ cannot tell $(3, 4)$ from $(-3, -4)$, so **read the quadrant from the signs of $x$ and $y$** (a calculator’s \`atan2(y, x)\` does this for you). A circle in expanded form, $x^2 + y^2 + Dx + Ey + F = 0$, gives up its centre and radius when you [complete the square](#/lesson/m0.M0-2.4).`,
  symbols: [
    { tex: '(h, k)', text: 'the centre of the circle' },
    { tex: 'R', text: 'the radius of the circle (same unit as $x$ and $y$)' },
    { tex: 'r', text: 'the polar **radius**: the distance of a point from the origin (the radar’s *range*); $r \\ge 0$' },
    { tex: '\\theta', text: 'the polar **angle**, measured anticlockwise from the positive $x$-axis (east), in degrees or radians. (Navigators’ bearings run clockwise from north — a different convention.)' },
    { tex: '(x, y)', text: 'the ordinary Cartesian coordinates of the same point' },
  ],
  why: t`Anything that turns or radiates from a centre — radar, a rotating antenna, a planet’s orbit, the field of a point charge — is simpler in polar coordinates. Calculus II builds [polar curves and their areas](#/lesson/math1220.C2-6.3) on exactly these two conversion formulas, and the same $(r, \theta)$ picture becomes the modulus and argument of a complex number.`,
  visual: {
    type: 'graph',
    title: 'A radar sweep',
    lead: t`The radar is at the origin, east is $+x$ and north is $+y$. Set the contact’s range $r$ and angle $\theta$; the green line is the sweep pointing at it. The dashed legs are its $x$ (teal) and $y$ (orange) coordinates.`,
    tasks: [
      t`Set $r = 50$ km and $\theta = 233^\circ$: the contact is southwest, at about $x = -30$, $y = -40$ km — both negative in the third quadrant.`,
      t`Keep $r = 60$ and sweep $\theta$ all the way round: the contact traces the $60$ km ring. In polar coordinates that whole circle is the equation $r = 60$.`,
      t`Compare $\theta = 53^\circ$ with $\theta = 233^\circ$: $y/x$ is the same ($\tfrac43$) at both, which is why $\tan^{-1}(y/x)$ alone cannot tell them apart.`,
    ],
    params: {
      x: [-120, 120], y: [-110, 110], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      sliders: [
        { key: 'r', label: 'Range $r$', min: 0, max: 100, step: 1, value: 70, unit: '\\text{km}', explain: 'Distance from the radar to the contact.' },
        { key: 'a', label: t`Angle $\theta$`, min: 0, max: 360, step: 1, value: 40, unit: '^\\circ', explain: 'Measured anticlockwise from east (+x).' },
      ],
      curves: [
        ...[25, 50, 75, 100].map((R) => circ([0, 0], R, { color: R === 100 ? 'ink3' : 'ink4', width: R === 100 ? 1.6 : 1 })),
        ...[0, 30, 60, 90, 120, 150].map((a) => seg([-100 * Math.cos(a * D2R), -100 * Math.sin(a * D2R)], [100 * Math.cos(a * D2R), 100 * Math.sin(a * D2R)], { color: 'ink4', width: 0.8 })),
        { param: ['100*t*cos(a*pi/180)', '100*t*sin(a*pi/180)'], t: [0, 1], color: 'good', width: 2.2 },
        { param: ['14*cos(t*a*pi/180)', '14*sin(t*a*pi/180)'], t: [0, 1], color: 'gold', width: 2 },
        { param: ['t*r*cos(a*pi/180)', '0'], t: [0, 1], color: 'accent2', width: 2.4, dash: true },
        { param: ['r*cos(a*pi/180)', 't*r*sin(a*pi/180)'], t: [0, 1], color: 'warn', width: 2.4, dash: true },
      ],
      points: [
        { x: 'r*cos(a*pi/180)', y: 'r*sin(a*pi/180)', color: 'gold', r: 6, label: 'contact' },
        ...[25, 50, 75, 100].map((R) => note([R * Math.cos(-12 * D2R), R * Math.sin(-12 * D2R)], `${R}`, { color: 'ink3', labelDx: 4 })),
        note([108, 0], '0°', { color: 'ink3' }), note([0, 106], '90°', { color: 'ink3' }), note([-110, 0], '180°', { color: 'ink3' }), note([0, -106], '270°', { color: 'ink3' }),
      ],
      readouts: [
        { label: t`$x = r\cos\theta$ (km)`, expr: 'r*cos(a*pi/180)', digits: 3 },
        { label: t`$y = r\sin\theta$ (km)`, expr: 'r*sin(a*pi/180)', digits: 3 },
        { label: t`$y/x$`, expr: 'tan(a*pi/180)', digits: 3 },
      ],
    },
    caption: t`Range rings every $25$ km; spokes every $30^\circ$. A flat-plane picture: a real radar also measures elevation, and beyond a few hundred km the Earth’s curvature hides low targets.`,
  },
  example: {
    prompt: t`A radar at the origin reports a contact at $(x, y) = (-30, -40)$ km ($x$ east, $y$ north). Give its range $r$ and polar angle $\theta$ (anticlockwise from east, between $0^\circ$ and $360^\circ$).`,
    visual: scope(100, [{ r: 50, th: 233.13, label: '(−30, −40)' }], t`The contact on the scope: rings every $25$ km.`),
    steps: [
      { label: 'Range', text: t`$r = \sqrt{x^2 + y^2} = \sqrt{900 + 1600} = 50$ km — the distance formula from the origin.` },
      { label: 'Quadrant first', text: t`$x < 0$ and $y < 0$: the contact is southwest, in the **third quadrant**, so $\theta$ lies between $180^\circ$ and $270^\circ$.` },
      { label: 'Reference angle', text: t`The acute angle to the $x$-axis is $\tan^{-1}\tfrac{40}{30} = ${sig(deg(Math.atan(4 / 3)), 4)}^\circ$.` },
      { label: 'Place it', text: t`In quadrant III: $\theta = 180^\circ + ${sig(deg(Math.atan(4 / 3)), 4)}^\circ = ${sig(180 + deg(Math.atan(4 / 3)), 5)}^\circ$.` },
      { label: 'The trap', text: t`A calculator’s $\tan^{-1}\big(\tfrac{-40}{-30}\big) = \tan^{-1}\tfrac43 = ${sig(deg(Math.atan(4 / 3)), 4)}^\circ$ points northeast — the opposite direction. The two minus signs cancelled and took the quadrant with them.` },
      { label: 'Check', text: t`$50\cos ${sig(180 + deg(Math.atan(4 / 3)), 5)}^\circ = -30$ and $50\sin ${sig(180 + deg(Math.atan(4 / 3)), 5)}^\circ = -40$ ✓.` },
    ],
    answer: t`$r = 50$ km, $\theta = ${sig(180 + deg(Math.atan(4 / 3)), 5)}^\circ$.`,
  },
  practice: [
    mcq({
      id: 'centre', difficulty: 2,
      gen(r) {
        const h = r.intExcept(-4, 4, [0]), k = r.intExcept(-4, 4, [0, h, -h]), R = r.int(2, 5), D = -2 * h, E = -2 * k, F = h * h + k * k - R * R;
        const term = (c, v) => (c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}${v}`);
        return {
          prompt: t`Where is the centre of the circle $x^2 + y^2${term(D, 'x')}${term(E, 'y')}${term(F, '')} = 0$?`,
          choices: [t`$${ptTeX([h, k])}$`, t`$${ptTeX([-h, -k])}$`, t`$${ptTeX([-D, -E])}$`, t`$${ptTeX([k, h])}$`],
          answer: 0,
          why: {
            1: t`Sign slip: $(x - h)^2$ expands to $x^2 - 2hx + h^2$, so a term $${D}x$ means $h = ${h}$, not $${-h}$.`,
            2: t`You forgot to halve: completing the square on $x^2 ${D < 0 ? '-' : '+'} ${Math.abs(D)}x$ uses half the coefficient, $(x ${D < 0 ? '-' : '+'} ${Math.abs(h)})^2$.`,
            3: t`The coordinates are swapped: the $x$-terms give $h$, the $y$-terms give $k$.`,
          },
          hints: [t`Group and complete the square: $x^2 ${D < 0 ? '-' : '+'} ${Math.abs(D)}x = (x ${D < 0 ? '-' : '+'} ${Math.abs(h)})^2 - ${h * h}$.`],
          teach: t`In $x^2 + y^2 + Dx + Ey + F = 0$ the centre is $(-D/2,\ -E/2)$: halve the coefficients and change their signs.`,
          explain: t`$(x ${-h < 0 ? '-' : '+'} ${Math.abs(h)})^2 + (y ${-k < 0 ? '-' : '+'} ${Math.abs(k)})^2 = ${R * R}$: centre $${ptTeX([h, k])}$, radius $${R}$.`,
          visual: circlePic(h, k, R, t`The circle, with its centre marked (axis numbers hidden).`, { ticks: false }),
        };
      },
    }),
    num({
      id: 'radius', difficulty: 2,
      gen(r) {
        const h = r.intExcept(-4, 4, [0]), k = r.intExcept(-4, 4, [0]), R = r.pick([2, 3, 5, 6, Math.sqrt(10), Math.sqrt(13)]), R2 = Math.round(R * R), F = h * h + k * k - R2;
        const term = (c, v) => (c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}${v}`);
        return {
          prompt: t`Find the radius of the circle $x^2 + y^2${term(-2 * h, 'x')}${term(-2 * k, 'y')}${term(F, '')} = 0$. Give 3 significant figures if it is not whole.`,
          answer: R, tol: { rel: 0.005 },
          errors: [
            { value: R2, feedback: t`That is $R^2$. The right-hand side of $(x - h)^2 + (y - k)^2 = R^2$ is the radius **squared**.` },
            ...(F < 0 ? [{ value: Math.sqrt(-F), feedback: t`Completing the square adds $h^2 + k^2 = ${h * h + k * k}$ to the right-hand side as well: $R^2 = ${h * h} + ${k * k} - (${F})$.` }] : []),
          ].filter((e) => Math.abs(e.value - R) > 0.01 * R),
          hints: [t`Complete the square in $x$ and in $y$; whatever you add on the left, add on the right.`, t`$(x ${-h < 0 ? '-' : '+'} ${Math.abs(h)})^2 + (y ${-k < 0 ? '-' : '+'} ${Math.abs(k)})^2 = ${h * h} + ${k * k} ${F > 0 ? '-' : '+'} ${Math.abs(F)}$.`],
          teach: t`After completing the square, $R^2 = h^2 + k^2 - F$; the radius is its square root.`,
          explain: t`$R^2 = ${h * h} + ${k * k} ${F > 0 ? '-' : '+'} ${Math.abs(F)} = ${R2}$, so $R = ${sig(R, 4)}$.`,
          visual: circlePic(h, k, R, t`The circle and its centre; axis numbers hidden, so the radius must come from the equation.`, { ticks: false }),
        };
      },
    }),
    num({
      id: 'polar-to-xy', difficulty: 2,
      gen(r) {
        const R = r.pick([40, 60, 75, 90]), a = r.pick([25, 115, 160, 200, 250, 290, 335]), f = r.pick(['x', 'y']);
        const FN = f === 'x' ? '\\cos' : '\\sin', ans = f === 'x' ? R * Math.cos(a * D2R) : R * Math.sin(a * D2R), other = f === 'x' ? R * Math.sin(a * D2R) : R * Math.cos(a * D2R);
        return {
          prompt: t`A radar contact is at range $r = ${R}$ km, polar angle $\theta = ${a}^\circ$ (anticlockwise from east). What is its ${f === 'x' ? 'east ($x$)' : 'north ($y$)'} coordinate, in km?`,
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [
            { value: other, feedback: t`That is the ${f === 'x' ? 'north ($y$)' : 'east ($x$)'} coordinate: $x = r\cos\theta$, $y = r\sin\theta$.` },
            { value: f === 'x' ? R * Math.cos(a) : R * Math.sin(a), feedback: t`Your calculator is in radian mode: $${a}$ rad is not $${a}^\circ$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$${f} = r${FN}\theta$, in degree mode. The quadrant fixes the sign.`],
          teach: t`Polar to Cartesian: $x = r\cos\theta$, $y = r\sin\theta$ — the signs come out right by themselves.`,
          explain: t`$${f} = ${R}\,${FN}\,${a}^\circ = ${sig(ans, 4)}$ km${ans < 0 ? ` — negative, as the contact is ${f === 'x' ? 'west' : 'south'} of the radar` : ''}.`,
          visual: scope(100, [{ r: R, th: a, label: 'contact' }], t`The contact on the scope; rings every $25$ km.`, { rays: [a] }),
        };
      },
    }),
    num({
      id: 'xy-to-theta', difficulty: 3,
      gen(r) {
        const x = r.pick([-5, -3, -2, 4, -6]), y = r.pick([-4, 3, -7, 2, -5]), ans = wrap360(deg(Math.atan2(y, x))), naive = deg(Math.atan(y / x));
        return {
          prompt: t`Find the polar angle $\theta$ of the point $${ptTeX([x, y])}$, in degrees between $0^\circ$ and $360^\circ$.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [
            { value: naive, feedback: t`$\tan^{-1}(y/x)$ only returns angles between $-90^\circ$ and $90^\circ$ — the right half of the plane. This point has $x ${x < 0 ? '< 0' : '> 0'}$, so ${x < 0 ? 'add $180^\\circ$' : 'add $360^\\circ$ to make it positive'}.` },
            { value: wrap360(naive), feedback: t`That angle points ${x < 0 ? 'right' : 'left'} of the $y$-axis, but the point has $x ${x < 0 ? '< 0' : '> 0'}$. Place the reference angle in the point’s own quadrant.` },
            { value: deg(Math.atan(Math.abs(y / x))), feedback: t`That is the reference angle — the acute angle to the $x$-axis. Now place it in the right quadrant.` },
          ].filter((e, i, A) => Math.abs(e.value - ans) > 0.5 && A.findIndex((o) => Math.abs(o.value - e.value) < 1e-9) === i),
          hints: [t`Which quadrant? $x ${x < 0 ? '<' : '>'} 0$ and $y ${y < 0 ? '<' : '>'} 0$.`, t`The reference angle is $\tan^{-1}|y/x| = ${sig(deg(Math.atan(Math.abs(y / x))), 4)}^\circ$; measure it from the ${x < 0 ? 'negative' : 'positive'} $x$-axis toward the point.`],
          teach: t`The angle comes from the quadrant and the reference angle together — never from $\tan^{-1}(y/x)$ alone.`,
          explain: t`Quadrant ${x > 0 ? 'IV' : y > 0 ? 'II' : 'III'}, reference angle $${sig(deg(Math.atan(Math.abs(y / x))), 4)}^\circ$: $\theta = ${sig(ans, 4)}^\circ$. (\`atan2(${y}, ${x})\` gives $${sig(deg(Math.atan2(y, x)), 4)}^\circ$${ans > 180 ? t`; add $360^\circ$` : ''}.)`,
          visual: plane({ x: [-8, 8], y: [-8, 5], curves: [seg([0, 0], [x, y], { color: 'accent', width: 2.4 })], points: [dot([x, y], ptText([x, y]), { labelDx: x < 0 ? -8 : 8, labelAlign: x < 0 ? 'right' : 'left' })], caption: t`The point and the ray from the origin to it. $\theta$ is measured anticlockwise from the positive $x$-axis.` }),
        };
      },
    }),
    expr({
      id: 'circle-eq', difficulty: 2,
      gen(r) {
        const h = r.intExcept(-3, 3, [0]), k = r.intExcept(-2, 2, [0]), R = r.int(2, 3);
        return {
          prompt: t`Write the equation of the circle drawn below.`,
          answer: `(x - (${h}))^2 + (y - (${k}))^2 = ${R * R}`, answerTeX: t`(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 + (y ${k < 0 ? '+' : '-'} ${Math.abs(k)})^2 = ${R * R}`, mode: 'equation',
          vars: { x: [-5, 5], y: [-5, 5] },
          errors: [
            { answer: `(x + (${h}))^2 + (y + (${k}))^2 = ${R * R}`, feedback: t`The signs are flipped: the centre $(h, k)$ appears as $(x - h)$ and $(y - k)$. A centre at $x = ${h}$ gives $(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})$.` },
            { answer: `(x - (${h}))^2 + (y - (${k}))^2 = ${R}`, feedback: t`The right-hand side is the radius **squared**: $${R}^2 = ${R * R}$.` },
          ],
          hints: [t`Read the centre and the radius off the grid.`, t`Centre $${ptTeX([h, k])}$, radius $${R}$: substitute into $(x - h)^2 + (y - k)^2 = R^2$.`],
          teach: t`The circle equation is the distance formula set equal to the radius, then squared.`,
          explain: t`Centre $${ptTeX([h, k])}$, radius $${R}$: $(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 + (y ${k < 0 ? '+' : '-'} ${Math.abs(k)})^2 = ${R * R}$.`,
          visual: circlePic(h, k, R, t`The circle on a square grid, with its centre marked.`),
        };
      },
    }),
    mcq({
      id: 'polar-point', difficulty: 2,
      gen(r) {
        const [a, rr] = r.pick([[210, 4], [150, 6], [330, 2], [120, 8], [240, 10], [300, 4]]);
        const c = Math.cos(a * D2R), s = Math.sin(a * D2R);
        const T = (v) => {   // exact value of rr times cos or sin of a multiple of 30°
          const m = Math.abs(v) * 2 / rr, sign = v < 0 ? '-' : '';
          return Math.abs(m - 1) < 1e-9 ? `${sign}${rr / 2}` : `${sign}${rr / 2 === 1 ? '' : rr / 2}\\sqrt3`;
        };
        const P = (x, y) => t`$(${x},\ ${y})$`;
        return {
          prompt: t`Which Cartesian point is the polar point $(r, \theta) = (${rr},\ ${a}^\circ)$?`,
          choices: [P(T(rr * c), T(rr * s)), P(T(rr * s), T(rr * c)), P(T(-rr * c), T(-rr * s)), P(T(rr * c), T(-rr * s))],
          answer: 0,
          why: {
            1: t`Cosine and sine swapped: $x = r\cos\theta$ goes with the horizontal, $y = r\sin\theta$ with the vertical.`,
            2: t`That point is diametrically opposite, at $${wrap360(a + 180)}^\circ$. Check the quadrant: $${a}^\circ$ has $x ${c < 0 ? '<' : '>'} 0$ and $y ${s < 0 ? '<' : '>'} 0$.`,
            3: t`That is the mirror image in the $x$-axis, at $${wrap360(-a)}^\circ$: the sign of $y$ is wrong.`,
          },
          hints: [t`$x = ${rr}\cos ${a}^\circ$ and $y = ${rr}\sin ${a}^\circ$. The reference angle is $${a % 180 === 0 ? 0 : Math.min(a % 180, 180 - (a % 180))}^\circ$.`],
          teach: t`$(r, \theta) \to (r\cos\theta,\ r\sin\theta)$; the quadrant of $\theta$ sets both signs.`,
          explain: t`$x = ${rr}\cos ${a}^\circ = ${T(rr * c)}$ and $y = ${rr}\sin ${a}^\circ = ${T(rr * s)}$.`,
          visual: scope(2 * rr, [{ r: rr, th: a, label: '' }], t`The point on a polar grid: rings every $${N(rr / 2)}$ units, spokes every $30^\circ$.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-separation', difficulty: 3, transfer: true,
      gen(r) {
        const r1 = r.pick([30, 45, 60]), r2 = r.pick([50, 70, 80]), a1 = r.pick([20, 50, 110]), a2 = a1 + r.pick([40, 70, 100, 130]);
        const cl = (v) => (Math.abs(v) < 1e-9 ? 0 : v), P = [cl(r1 * Math.cos(a1 * D2R)), cl(r1 * Math.sin(a1 * D2R))], Q = [cl(r2 * Math.cos(a2 * D2R)), cl(r2 * Math.sin(a2 * D2R))], ans = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
        return {
          prompt: t`An air-traffic radar shows two aircraft at the same altitude: one at range $${r1}$ km, angle $${a1}^\circ$, the other at range $${r2}$ km, angle $${a2}^\circ$ (angles anticlockwise from east). How far apart are they, in km?`,
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [
            { value: r2 - r1, feedback: t`Subtracting the ranges is right only if both aircraft are in the same direction. Convert both to $(x, y)$, then use the distance formula.` },
            { value: r1 + r2, feedback: t`Adding the ranges is right only if they are in opposite directions. Convert both to $(x, y)$ first.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Convert each to Cartesian: $(r\cos\theta,\ r\sin\theta)$.`, t`Then $d = \sqrt{\Delta x^2 + \Delta y^2}$.`],
          teach: t`To combine positions given in polar form, convert to Cartesian, where differences make sense.`,
          explain: t`First aircraft $(${sig(P[0], 4)},\ ${sig(P[1], 4)})$, second $(${sig(Q[0], 4)},\ ${sig(Q[1], 4)})$ km: $d = ${sig(ans, 4)}$ km. (The [law of cosines](#/lesson/m0.M0-8.5) gives the same: $d^2 = ${r1}^2 + ${r2}^2 - 2(${r1})(${r2})\cos ${a2 - a1}^\circ$.)`,
          visual: scope(100, [{ r: r1, th: a1, label: '1' }, { r: r2, th: a2, label: '2', color: 'warn' }], t`The two contacts on the scope; rings every $25$ km.`, { rays: [a1, a2] }),
        };
      },
    }),
    num({
      id: 'cp-angle', difficulty: 2,
      gen(r) {
        const S = r.pick(SPECIAL), k = r.pick([1, 2, 3]);
        const part = ([s, root]) => `${s < 0 ? '-' : ''}${k === 1 && root ? '' : k}${root}`;
        const xv = S.x[0] * k * (S.x[1] ? Math.sqrt(3) : 1), yv = S.y[0] * k * (S.y[1] ? Math.sqrt(3) : 1), naive = deg(Math.atan(yv / xv));
        return {
          prompt: t`What is the polar angle of $(${part(S.x)},\ ${part(S.y)})$, in degrees between $0^\circ$ and $360^\circ$?`,
          answer: S.th, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: naive, feedback: t`$\tan^{-1}(y/x)$ gives $${sig(naive, 3)}^\circ$, a direction in the right half-plane. This point is in quadrant ${S.th < 180 ? 'II' : S.th < 270 ? 'III' : 'IV'}.` }, { value: wrap360(naive), feedback: t`Right reference angle, wrong quadrant: look at the signs of $x$ and $y$.` }].filter((e) => Math.abs(e.value - S.th) > 0.5),
          hints: [t`Reference angle from $|y/x|$; quadrant from the signs.`],
          teach: t`Quadrant from the signs, size from the reference angle.`,
          explain: t`$|y/x| = ${Math.abs(yv / xv) > 1 ? t`\sqrt3` : t`1/\sqrt3`}$, reference angle $${sig(deg(Math.atan(Math.abs(yv / xv))), 3)}^\circ$; quadrant ${S.th < 180 ? 'II' : S.th < 270 ? 'III' : 'IV'}: $\theta = ${S.th}^\circ$.`,
          visual: plane({ x: [-7, 7], y: [-6, 6], curves: [seg([0, 0], [xv, yv], { color: 'accent', width: 2.4 })], points: [dot([xv, yv], '')], caption: t`The point and its ray from the origin.` }),
        };
      },
    }),
    mcq({
      id: 'cp-unit', difficulty: 2,
      prompt: t`Which equation describes the circle of radius $3$ centred at $(2, -1)$?`,
      choices: [t`$(x - 2)^2 + (y + 1)^2 = 9$`, t`$(x + 2)^2 + (y - 1)^2 = 9$`, t`$(x - 2)^2 + (y + 1)^2 = 3$`, t`$(x - 2)^2 - (y + 1)^2 = 9$`],
      answer: 0,
      why: {
        1: t`Signs flipped: the centre $(h, k)$ appears as $(x - h)$ and $(y - k)$; $k = -1$ gives $y + 1$.`,
        2: t`The right-hand side is $R^2 = 9$, not $R$.`,
        3: t`A minus between the squares gives a hyperbola: distance needs $\Delta x^2 + \Delta y^2$.`,
      },
      hints: [t`$(x - h)^2 + (y - k)^2 = R^2$.`],
      teach: t`Every point of the circle is $R$ from the centre: $\sqrt{(x - h)^2 + (y - k)^2} = R$.`,
      explain: t`$h = 2$, $k = -1$, $R^2 = 9$: $(x - 2)^2 + (y + 1)^2 = 9$.`,
      visual: circlePic(2, -1, 3, t`The circle on a square grid.`),
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.3 Polar Coordinates', url: 'https://openstax.org/books/precalculus-2e/pages/8-3-polar-coordinates' },
    { label: 'OpenStax Precalculus 2e, §10.1 The Ellipse (circles as a special case); College Algebra 2e §2.1', url: 'https://openstax.org/books/college-algebra-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs' },
  ],
});
void lab;
